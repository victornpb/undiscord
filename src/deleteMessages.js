const PREFIX = '[UNDISCORD]';

import { log } from './utils/log.js';
import {
  wait,
  msToHMS,
  redact,
  queryString,
  ask,
  toSnowflake,
} from './utils/helpers.js';

/**
 * Delete all messages in a Discord channel or DM
 * @param {string} authToken Your authorization token
 * @param {string} authorId Author of the messages you want to delete
 * @param {string} guildId Server were the messages are located
 * @param {string} channelId Channel were the messages are located
 * @param {string} minId Only delete messages after this, leave blank do delete all
 * @param {string} maxId Only delete messages before this, leave blank do delete all
 * @param {string} content Filter messages that contains this text content
 * @param {boolean} hasLink Filter messages that contains link
 * @param {boolean} hasFile Filter messages that contains file
 * @param {boolean} includeNsfw Search in NSFW channels

 * @author Victornpb <https://www.github.com/victornpb>
 * @see https://github.com/victornpb/undiscord
 */
class Deleter {

  options = {
    authToken: null,
    authorId: null,
    guildId: null,
    channelId: null,
    minId: null,
    maxId: null,
    content: null,
    hasLink: null,
    hasFile: null,
    includeNsfw: null,
    includePinned: null,
    pattern: null,
    searchDelay: null,
    deleteDelay: null,

    askForConfirmation: true,
  };

  state = {
    running: false,
    delCount: 0,
    failCount: 0,
    grandTotal: 0,
    offset: 0,
    iterations: 0,

    _seachResponse: null,
    _messagesToDelete: [],
    _skippedMessages: [],
  };

  stats = {
    startTime: new Date(), // start time
    throttledCount: 0, // how many times you have been throttled
    throttledTotalTime: 0, // the total amount of time you spent being throttled
    lastPing: null, // the most recent ping
    avgPing: null, // average ping used to calculate the estimated remaining time
    etr: 0,
  };

  onStart = undefined;
  onProgress = undefined;
  onStop = undefined;

  resetState() {
    this.state = {
      running: false,
      delCount: 0,
      failCount: 0,
      grandTotal: 0,
      offset: 0,
      iterations: 0,

      _seachResponse: null,
      _messagesToDelete: [],
      _skippedMessages: [],
    };

    this.options.askForConfirmation = true;
  }

  async run() {
    if (this.state.running) return log.error('Already running!');

    this.state.running = true;
    this.stats.startTime = new Date();

    log.success(`\nStarted at ${this.stats.startTime.toLocaleString()}`);
    log.debug(
      `authorId = "${redact(this.options.authorId)}"`,
      `guildId = "${redact(this.options.guildId)}"`,
      `channelId = "${redact(this.options.channelId)}"`,
      `minId = "${redact(this.options.minId)}"`,
      `maxId = "${redact(this.options.maxId)}"`,
      `hasLink = ${!!this.options.hasLink}`,
      `hasFile = ${!!this.options.hasFile}`,
    );

    if (this.onStart) this.onStart(this.state, this.stats);

    do {
      this.state.iterations++;

      log.verb('Fetching messages...');
      // Search messages
      await this.search();
      // Process results and find which messages should be deleted
      await this.filterResponse();

      log.verb(
        `Grand total: ${this.state.grandTotal}`,
        `(Messages in current page: ${this.state._seachResponse.messages.length}`,
        `To be deleted: ${this.state._messagesToDelete.length}`,
        `Skipped: ${this.state._skippedMessages.length})`,
        `offset: ${this.state.offset}`
      );
      this.printStats();

      // Calculate estimated time
      this.calcEtr();
      log.verb(`Estimated time remaining: ${msToHMS(this.stats.etr)}`);

      // if there are messages to delete, delete them
      if (this.state._messagesToDelete.length > 0) {

        if (await this.confirm() === false) break;

        await this.deleteMessagesFromList();
      }
      else if (this.state._skippedMessages.length > 0) {
        // There are stuff, but nothing to delete (example a page full of system messages)
        // check next page until we see a page with nothing in it (end of results).
        const oldOffset = this.state.offset;
        this.state.offset += this.state._skippedMessages.length;
        log.verb('There\'s nothing we can delete on this page, checking next page...');
        log.verb(`Skipped ${this.state._skippedMessages.length} out of ${this.state._seachResponse.messages.length} in this page.`, `(Offset was ${oldOffset}, ajusted to ${this.state.offset})`);
      }
      else {
        log.verb('Ended because API returned an empty page.');
        if (this.state.grandTotal - this.state.offset > 0) log.warn('[End condition] if you see this please report.', this.state); // I don't remember why this was here. (looks like messagesToDelete==0 && skippedMessages==0 is enough
        this.state.running = false;
      }
    } while (this.state.running);

    this.stats.endTime = new Date();
    log.success(`Ended at ${this.stats.endTime.toLocaleString()}! Total time: ${msToHMS(this.stats.endTime.getTime() - this.stats.startTime.getTime())}`);
    this.printStats();
    log.debug(`Deleted ${this.state.delCount} messages, ${this.state.failCount} failed.\n`);

    if (this.onStop) this.onStop(this.state, this.stats);
  }

  stop() {
    this.state.running = false;
  }

  calcEtr() {
    this.stats.etr = (this.options.searchDelay * Math.round(this.state.grandTotal / 25)) + ((this.options.deleteDelay + this.stats.avgPing) * this.state.grandTotal);
  }

  async confirm() {
    if (!this.options.askForConfirmation) return true;

    log.verb('Waiting for your confirmation...');
    const preview = this.state._messagesToDelete.map(m => `${m.author.username}#${m.author.discriminator}: ${m.attachments.length ? '[ATTACHMENTS]' : m.content}`).join('\n');

    const answer = await ask(
      `Do you want to delete ~${this.state.grandTotal} messages? (Estimated time: ${msToHMS(this.stats.etr)})` +
      '(The actual number of messages may be less, depending if you\'re using filters to skip some messages)' +
      '\n\n---- Preview ----\n' +
      preview
    );

    if (!answer) {
      log.error('Aborted by you!');
      return false;
    }
    else {
      log.verb('OK');
      this.options.askForConfirmation = false; // do not ask for confirmation again on the next request
      return true;
    }
  }

  async search() {
    let API_SEARCH_URL;
    if (this.options.guildId === '@me') API_SEARCH_URL = `https://discord.com/api/v9/channels/${this.options.channelId}/messages/`; // DMs
    else API_SEARCH_URL = `https://discord.com/api/v9/guilds/${this.options.guildId}/messages/`; // Server

    let resp;
    try {
      this.beforeRequest();
      resp = await fetch(API_SEARCH_URL + 'search?' + queryString([
        ['author_id', this.options.authorId || undefined],
        ['channel_id', (this.options.guildId !== '@me' ? this.options.channelId : undefined) || undefined],
        ['min_id', this.options.minId ? toSnowflake(this.options.minId) : undefined],
        ['max_id', this.options.maxId ? toSnowflake(this.options.maxId) : undefined],
        ['sort_by', 'timestamp'],
        ['sort_order', 'desc'],
        ['offset', this.state.offset],
        ['has', this.options.hasLink ? 'link' : undefined],
        ['has', this.options.hasFile ? 'file' : undefined],
        ['content', this.options.content || undefined],
        ['include_nsfw', this.options.includeNsfw ? true : undefined],
      ]), {
        headers: {
          'Authorization': this.options.authToken,
        }
      });
      this.afterRequest();
    } catch (err) {
      this.state.running = false;
      return log.error('Search request threw an error:', err);
    }

    // not indexed yet
    if (resp.status === 202) {
      const w = (await resp.json()).retry_after * 1000;
      this.stats.throttledCount++;
      this.stats.throttledTotalTime += w;
      log.warn(`This channel isn't indexed yet. Waiting ${w}ms for discord to index it...`);
      await wait(w);
      return await this.search();
    }

    if (!resp.ok) {
      // searching messages too fast
      if (resp.status === 429) {
        const w = (await resp.json()).retry_after * 1000;
        this.stats.throttledCount++;
        this.stats.throttledTotalTime += w;
        this.stats.searchDelay += w; // increase delay
        log.warn(`Being rate limited by the API for ${w}ms! Increasing search delay...`);
        this.printStats();
        log.verb(`Cooling down for ${w * 2}ms before retrying...`);

        await wait(w * 2);
        return await this.search();
      } else {
        this.state.running = false;
        return log.error(`Error searching messages, API responded with status ${resp.status}!\n`, await resp.json());
      }
    }
    const data = await resp.json();
    this.state._seachResponse = data;
    console.log(PREFIX, 'search', data);
    return data;
  }

  async filterResponse() {
    const data = this.state._seachResponse;

    // the search total will decrease as we delete stuff
    const total = data.total_results;
    if (total > this.state.grandTotal) this.state.grandTotal = total;

    // search returns messages near the the actual message, only get the messages we searched for.
    const discoveredMessages = data.messages.map(convo => convo.find(message => message.hit === true));

    // we can only delete some types of messages, system messages are not deletable.
    let messagesToDelete = discoveredMessages;
    messagesToDelete = messagesToDelete.filter(msg => msg.type === 0 || (msg.type >= 6 && msg.type <= 21));
    messagesToDelete = messagesToDelete.filter(msg =>  msg.pinned ? this.options.includePinned : true);

    // custom filter of messages
    try {
      const regex = new RegExp(this.options.pattern, 'i');
      messagesToDelete = messagesToDelete.filter(msg => regex.test(msg.content));
    } catch (e) {
      log.warn('Ignoring RegExp because pattern is malformed!', e);
    }

    // create an array containing everything we skipped. (used to calculate offset for next searches)
    const skippedMessages = discoveredMessages.filter(msg => !messagesToDelete.find(m => m.id === msg.id));

    this.state._messagesToDelete = messagesToDelete;
    this.state._skippedMessages = skippedMessages;

    console.log(PREFIX, 'filterResponse', this.state);
  }

  async deleteMessagesFromList() {
    for (let i = 0; i < this.state._messagesToDelete.length; i++) {
      const message = this.state._messagesToDelete[i];
      if (!this.state.running) return log.error('Stopped by you!');

      log.debug(
        // `${((this.state.delCount + 1) / this.state.grandTotal * 100).toFixed(2)}%`,
        `[${this.state.delCount + 1}/${this.state.grandTotal}] `+
        `<b>${redact(message.author.username + '#' + message.author.discriminator)}</b> `+
        `<sup>${redact(new Date(message.timestamp).toLocaleString())}</sup>`+
        `: <i>${redact(message.content).replace(/\n/g, '↵')}</i>`+
        (message.attachments.length ? redact(JSON.stringify(message.attachments)) : ''),
        `<sup>{ID:${redact(message.id)}}</sup>`
      );

      // Delete a single message (with retry)
      const maxAttempt = 3;
      let attempt = maxAttempt;
      while (attempt < maxAttempt) {
        const result = this.deleteMessage(message);

        if (result === 'RETRY') {
          attempt++;
          log.verb(`Retrying in ${this.options.deleteDelay}ms... (${attempt}/${maxAttempt})`);
          await wait(this.options.deleteDelay);
        }
        else break;
      }

      this.calcEtr();
      if (this.onProgress) this.onProgress(this.state, this.stats);

      await wait(this.options.deleteDelay);
    }
  }

  async deleteMessage(message) {
    const API_DELETE_URL = `https://discord.com/api/v9/channels/${message.channel_id}/messages/${message.id}`;
    let resp;
    try {
      this.beforeRequest();
      resp = await fetch(API_DELETE_URL, {
        method: 'DELETE',
        headers: {
          'Authorization': this.options.authToken,
        },
      });
      this.afterRequest();
    } catch (err) {
      // no response error (e.g. network error)
      log.error('Delete request throwed an error:', err);
      log.verb('Related object:', redact(JSON.stringify(message)));
      this.state.failCount++;
      return 'FAILED';
    }

    if (!resp.ok) {
      if (resp.status === 429) {
        // deleting messages too fast
        const w = (await resp.json()).retry_after * 1000;
        this.stats.throttledCount++;
        this.stats.throttledTotalTime += w;
        this.options.deleteDelay = w; // increase delay
        log.warn(`Being rate limited by the API for ${w}ms! Adjusted delete delay to ${this.options.deleteDelay}ms.`);
        this.printStats();
        log.verb(`Cooling down for ${w * 2}ms before retrying...`);
        await wait(w * 2);
        return 'RETRY';
      } else {
        // other error
        log.error(`Error deleting message, API responded with status ${resp.status}!`, await resp.json());
        log.verb('Related object:', redact(JSON.stringify(message)));
        this.state.failCount++;
        return 'FAILED';
      }
    }

    this.state.delCount++;
    return 'OK';
  }


  #beforeTs = 0;
  beforeRequest() {
    this.#beforeTs = Date.now();
  }
  afterRequest() {
    this.stats.lastPing = (Date.now() - this.#beforeTs);
    this.stats.avgPing = this.stats.avgPing > 0 ? (this.stats.avgPing * 0.9) + (this.stats.lastPing * 0.1) : this.stats.lastPing;
  }

  printStats() {
    log.verb(
      `Delete delay: ${this.options.deleteDelay}ms, Search delay: ${this.options.searchDelay}ms`,
      `Last Ping: ${this.stats.lastPing}ms, Average Ping: ${this.stats.avgPing | 0}ms`,
    );
    log.verb(
      `Rate Limited: ${this.stats.throttledCount} times.`,
      `Total time throttled: ${msToHMS(this.stats.throttledTotalTime)}.`
    );
  }


}

export default Deleter;