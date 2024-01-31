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
 * @author Victornpb <https://www.github.com/victornpb>
 * @see https://github.com/victornpb/undiscord
 */
class UndiscordCore {

  options = {
    authToken: null, // Your authorization token
    authorId: null, // Author of the messages you want to delete
    guildId: null, // Server were the messages are located
    channelId: null, // Channel were the messages are located
    minId: null, // Only delete messages after this, leave blank do delete all
    maxId: null, // Only delete messages before this, leave blank do delete all
    content: null, // Filter messages that contains this text content
    hasLink: null, // Filter messages that contains link
    hasFile: null, // Filter messages that contains file
    includeNsfw: null, // Search in NSFW channels
    includeServers: null, // Search in server channels
    includePinned: null, // Delete messages that are pinned
    pattern: null, // Only delete messages that match the regex (insensitive)
    searchDelay: null, // Delay each time we fetch for more messages
    deleteDelay: null, // Delay between each delete operation
    rateLimitPrevention: null, // Whether rate limit prevention is enabled or not
    maxAttempt: 2, // Attempts to delete a single message if it fails
    askForConfirmation: true,
  };

  state = {
    running: false,
    delCount: 0,
    failCount: 0,
    grandTotal: 0,
    offset: {'asc': 0, 'desc': 0},
    iterations: 0,
    sortOrder: 'asc',
    searchedPages: 0,
    totalSkippedMessages: 0,
    startEmptyPages: -1,

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

  // events
  onStart = undefined;
  onProgress = undefined;
  onStop = undefined;

  resetState() {
    this.state = {
      running: false,
      delCount: 0,
      failCount: 0,
      grandTotal: 0,
      offset: {'asc': 0, 'desc': 0},
      iterations: 0,
      sortOrder: 'asc',
      searchedPages: 0,
      totalSkippedMessages: 0,
      startEmptyPages: -1,

      _seachResponse: null,
      _messagesToDelete: [],
      _skippedMessages: [],
    };

    this.options.askForConfirmation = true;
  }

  /** Automate the deletion process of multiple channels */
  async runBatch(queue) {
    if (this.state.running) return log.error('Already running!');

    log.info(`Runnning batch with queue of ${queue.length} jobs`);
    for (let i = 0; i < queue.length; i++) {
      const job = queue[i];
      log.info('Starting job...', `(${i + 1}/${queue.length})`);

      // set options
      this.options = {
        ...this.options, // keep current options
        ...job, // override with options for that job
      };

      await this.run(true);
      if (!this.state.running) break;

      log.info('Job ended.', `(${i + 1}/${queue.length})`);
      this.resetState();
      this.options.askForConfirmation = false;
      this.state.running = true; // continue running
    }

    log.info('Batch finished.');
    this.state.running = false;
  }

  /** Start the deletion process */
  async run(isJob = false) {
    if (this.state.running && !isJob) return log.error('Already running!');

    this.state.running = true;
    this.stats.startTime = new Date();

    log.success(`\nStarted at ${this.stats.startTime.toLocaleString()}`);
    if (this.onStart) this.onStart(this.state, this.stats);

    if (!this.options.guildId) {
      log.verb('Fetching channel info...');
      await this.fetchChannelInfo();
    }
    if (!this.options.guildId) return; // message is handled in fetchChannelInfo
    if (isJob && this.options.guildId !== '@me' && !this.options.includeServers) {
      log.warn(`Skipping the channel ${this.options.channelId} as it's a server channel.`);
      return;
    }

    log.debug(
      `authorId = "${redact(this.options.authorId)}"`,
      `guildId = "${redact(this.options.guildId)}"`,
      `channelId = "${redact(this.options.channelId)}"`,
      `minId = "${redact(this.options.minId)}"`,
      `maxId = "${redact(this.options.maxId)}"`,
      `hasLink = ${!!this.options.hasLink}`,
      `hasFile = ${!!this.options.hasFile}`,
    );

    do {
      this.state.iterations++;

      log.verb('Fetching messages...');
      // Search messages
      this.state.sortOrder = this.state.sortOrder == 'desc' ? 'asc' : 'desc';
      log.verb(`Set sort order to ${this.state.sortOrder} for this search.`);
      await this.search();
      this.state.searchedPages++;

      // Process results and find which messages should be deleted
      await this.filterResponse();

      log.verb(
        `Grand total: ${this.state.grandTotal}`,
        `(Messages in current page: ${this.state._seachResponse.messages.length}`,
        `To be deleted: ${this.state._messagesToDelete.length}`,
        `Skipped: ${this.state._skippedMessages.length})`,
        `offset (asc): ${this.state.offset['asc']}`,
        `offset (desc): ${this.state.offset['desc']}`
      );
      this.printStats();
      this.state.totalSkippedMessages += this.state._skippedMessages.length;

      // Calculate estimated time
      this.calcEtr();
      log.verb(`Estimated time remaining: ${msToHMS(this.stats.etr)}`);

      // if there are messages to delete, delete them
      if (this.state._messagesToDelete.length > 0) {
        this.state.startEmptyPages = -1;

        if (await this.confirm() === false) {
          this.state.running = false; // break out of a job
          break; // immmediately stop this iteration
        }

        await this.deleteMessagesFromList();
      }
      else if (this.state._skippedMessages.length > 0) {
        // There are stuff, but nothing to delete (example a page full of system messages)
        // check next page until we see a page with nothing in it (end of results).
        this.state.startEmptyPages = -1;

        const oldOffset = this.state.offset[this.state.sortOrder];
        this.state.offset[this.state.sortOrder] += this.state._skippedMessages.length;
        log.verb('There\'s nothing we can delete on this page, checking next page...');
        log.verb(`Skipped ${this.state._skippedMessages.length} out of ${this.state._seachResponse.messages.length} in this page.`, `(Offset for ${this.state.sortOrder} was ${oldOffset}, ajusted to ${this.state.offset[this.state.sortOrder]})`);
      }
      else {
        if (this.state.startEmptyPages == -1) this.state.startEmptyPages = Date.now();
        // if the first page we are searching is empty
        // or we've been getting empty page responses for the past 30 seconds (enough for Discord to re-index the pages)
        // or (deleted messages + failed to delete + total skipped) >= total messages
        // ONLY THEN proceed with ending the job
        if (this.state.searchedPages == 1 || (Date.now() - this.state.startEmptyPages) > 30 * 1000 || (this.state.delCount + this.state.failCount + this.state.totalSkippedMessages) >= this.state.grandTotal) {
          log.verb('Ended because API returned an empty page.');
          log.verb('[End state]', this.state);
          if (isJob) break; // break without stopping if this is part of a job
          this.state.running = false;
        } else {
          // wait 10 seconds for Discord to re-index the search page before retrying
          const waitingTime = 10 * 1000;
          log.verb(`API returned an empty page, waiting an extra ${(waitingTime / 1000).toFixed(2)}s before searching again...`);
          await wait(waitingTime);
        }
      }

      // wait before next page (fix search page not updating fast enough)
      log.verb(`Waiting ${(this.options.searchDelay / 1000).toFixed(2)}s before next page...`);
      await wait(this.options.searchDelay);

    } while (this.state.running);

    this.stats.endTime = new Date();
    log.success(`Ended at ${this.stats.endTime.toLocaleString()}! Total time: ${msToHMS(this.stats.endTime.getTime() - this.stats.startTime.getTime())}`);
    this.printStats();
    log.debug(`Deleted ${this.state.delCount} messages, ${this.state.failCount} failed.\n`);

    if (this.onStop) this.onStop(this.state, this.stats);
  }

  stop() {
    this.state.running = false;
    if (this.onStop) this.onStop(this.state, this.stats);
  }

  /** Calculate the estimated time remaining based on the current stats */
  calcEtr() {
    this.stats.etr = (this.options.searchDelay + this.stats.avgPing) * Math.round((this.state.grandTotal - this.state.delCount) / 25) + (this.options.deleteDelay + this.stats.avgPing) * (this.state.grandTotal - this.state.delCount);
  }

  /** As for confirmation in the beggining process */
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

  async fetchChannelInfo() {
    let API_CHANNEL_URL = `https://discord.com/api/v9/channels/${this.options.channelId}`;

    let resp;
    try {
      await this.beforeRequest();
      resp = await fetch(API_CHANNEL_URL, {
        headers: {
          'Authorization': this.options.authToken,
        }
      });
      this.afterRequest();
    } catch (err) {
      this.state.running = false;
      log.error('Channel request threw an error:', err);
      throw err;
    }

    // not indexed yet
    if (resp.status === 202) {
      let w = (await resp.json()).retry_after;
      w = !isNaN(w) ? w * 1000 : this.stats.searchDelay; // Fix retry_after 0
      this.stats.throttledCount++;
      this.stats.throttledTotalTime += w;
      log.warn(`This channel isn't indexed yet. Waiting ${w}ms for discord to index it...`);
      await wait(w);
      return await this.fetchChannelInfo();
    }

    if (!resp.ok) {
      // rate limit
      if (resp.status === 429) {
        let w = (await resp.json()).retry_after;
        w = !isNaN(w) ? w * 1000 : this.stats.searchDelay; // Fix retry_after 0

        this.stats.throttledCount++;
        this.stats.throttledTotalTime += w;
        log.warn(`Being rate limited by the API for ${w}ms!`);
        this.printStats();
        log.verb(`Cooling down for ${w * 2}ms before retrying...`);

        await wait(w * 2);
        return await this.fetchChannelInfo();
      }
      else {
        log.error(`Error fetching the channel, API responded with status ${resp.status}!\n`, await resp.json());
        return {};
      }
    }
    const data = await resp.json();
    this.options.guildId = data.guild_id ?? '@me';
    return data;
  }

  async search() {
    let API_SEARCH_URL;
    if (this.options.guildId === '@me') API_SEARCH_URL = `https://discord.com/api/v9/channels/${this.options.channelId}/messages/`; // DMs
    else API_SEARCH_URL = `https://discord.com/api/v9/guilds/${this.options.guildId}/messages/`; // Server

    let resp;
    try {
      await this.beforeRequest();
      resp = await fetch(API_SEARCH_URL + 'search?' + queryString([
        ['author_id', this.options.authorId || undefined],
        ['channel_id', (this.options.guildId !== '@me' ? this.options.channelId : undefined) || undefined],
        ['min_id', this.options.minId ? toSnowflake(this.options.minId) : undefined],
        ['max_id', this.options.maxId ? toSnowflake(this.options.maxId) : undefined],
        ['sort_by', 'timestamp'],
        ['sort_order', this.state.sortOrder],
        ['offset', this.state.offset[this.state.sortOrder]],
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
      log.error('Search request threw an error:', err);
      throw err;
    }

    // not indexed yet
    if (resp.status === 202) {
      let w = (await resp.json()).retry_after;
      w = !isNaN(w) ? w * 1000 : this.stats.searchDelay; // Fix retry_after 0
      this.stats.throttledCount++;
      this.stats.throttledTotalTime += w;
      log.warn(`This channel isn't indexed yet. Waiting ${w}ms for discord to index it...`);
      await wait(w);
      return await this.search();
    }

    if (!resp.ok) {
      // searching messages too fast
      if (resp.status === 429) {
        let w = (await resp.json()).retry_after;
        w = !isNaN(w) ? w * 1000 : this.stats.searchDelay; // Fix retry_after 0

        this.stats.throttledCount++;
        this.stats.throttledTotalTime += w;
        log.warn(`Being rate limited by the API for ${w}ms!`);
        this.printStats();
        log.verb(`Cooling down for ${w * 2}ms before retrying...`);

        await wait(w * 2);
        return await this.search();
      }
      else {
        log.error(`Error searching messages, API responded with status ${resp.status}!\n`, await resp.json());
        const data = {messages: []};
        this.state._seachResponse = data;
        return data;
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
    messagesToDelete = messagesToDelete.filter(msg => msg.pinned ? this.options.includePinned : true);

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
        `[${this.state.delCount + 1}/${this.state.grandTotal}] ` +
        `<sup>${new Date(message.timestamp).toLocaleString()}</sup> ` +
        `<b>${redact(message.author.username + '#' + message.author.discriminator)}</b>` +
        `: <i>${redact(message.content).replace(/\n/g, '↵')}</i>` +
        (message.attachments.length ? redact(JSON.stringify(message.attachments)) : ''),
        `<sup>{ID:${redact(message.id)}}</sup>`
      );

      // Delete a single message (with retry)
      let attempt = 0;
      while (attempt < this.options.maxAttempt) {
        const result = await this.deleteMessage(message);

        if (result === 'RETRY') {
          attempt++;
          log.verb(`Retrying in ${this.options.deleteDelay}ms... (${attempt}/${this.options.maxAttempt})`);
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
      await this.beforeRequest();
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
        let w = (await resp.json()).retry_after;
        w = !isNaN(w) ? w * 1000 : this.stats.searchDelay;
        this.stats.throttledCount++;
        this.stats.throttledTotalTime += w;
        log.warn(`Being rate limited by the API for ${w}ms!`);
        this.printStats();
        log.verb(`Cooling down for ${w * 2}ms before retrying...`);
        await wait(w * 2);
        return 'RETRY';
      } else {
        const body = await resp.text();

        try {
          const r = JSON.parse(body);

          if (resp.status === 400 && r.code === 50083) {
            // 400 can happen if the thread is archived (code=50083)
            // in this case we need to "skip" this message from the next search
            // otherwise it will come up again in the next page (and fail to delete again)
            log.warn('Error deleting message (Thread is archived). Will increment offset so we don\'t search this in the next page...');
            this.state.offset[this.state.sortOrder]++;
            this.state.failCount++;
            return 'FAIL_SKIP'; // Failed but we will skip it next time
          }

          log.error(`Error deleting message, API responded with status ${resp.status}!`, r);
          log.verb('Related object:', redact(JSON.stringify(message)));
          this.state.failCount++;
          return 'FAILED';
        } catch (e) {
          log.error(`Fail to parse JSON. API responded with status ${resp.status}!`, body);
        }
      }
    }

    this.state.delCount++;
    return 'OK';
  }

  #beforeTs = 0; // used to calculate latency
  #requestLog = []; // used to add any extra delay
  async beforeRequest() {
    this.#requestLog.push(Date.now());
    this.#requestLog = this.#requestLog.filter(timestamp => (Date.now() - timestamp) < 60 * 1000);
    if (this.options.rateLimitPrevention) {
      let rateLimits = [[45, 60], [4, 5]]; // todo: confirm, testing shows these are right
      for (let [maxRequests, timePeriod] of rateLimits) {
        if (this.#requestLog.length >= maxRequests && (Date.now() - this.#requestLog[this.#requestLog.length - maxRequests]) < timePeriod * 1000) {
          let delay = timePeriod * 1000 - (Date.now() - this.#requestLog[this.#requestLog.length - maxRequests]);
          delay = delay * 1.15 + 300; // adding a buffer and additional wait time
          log.verb(`Delaying for an extra ${(delay / 1000).toFixed(2)}s to avoid rate limits...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          break;
        }
      }
    }
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

export default UndiscordCore;
