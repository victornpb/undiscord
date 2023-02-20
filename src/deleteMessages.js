const wait = async ms => new Promise(done => setTimeout(done, ms));
const msToHMS = s => `${s / 3.6e6 | 0}h ${(s % 3.6e6) / 6e4 | 0}m ${(s % 6e4) / 1000 | 0}s`;
const escapeHTML = html => html.replace(/[&<"']/g, m => ({ '&': '&amp;', '<': '&lt;', '"': '&quot;', '\'': '&#039;' })[m]);
const redact = str => `<span class="priv">${escapeHTML(str)}</span><span class="mask">REDACTED</span>`;
const queryString = params => params.filter(p => p[1] !== undefined).map(p => p[0] + '=' + encodeURIComponent(p[1])).join('&');
const ask = async msg => new Promise(resolve => setTimeout(() => resolve(window.confirm(msg)), 10));
const toSnowflake = (date) => /:/.test(date) ? ((new Date(date).getTime() - 1420070400000) * Math.pow(2, 22)) : date;


const log = {
  debug() { return extLogger ? extLogger('debug', arguments) : console.debug.apply(console, arguments); },
  info() { return extLogger ? extLogger('info', arguments) : console.info.apply(console, arguments); },
  verb() { return extLogger ? extLogger('verb', arguments) : console.log.apply(console, arguments); },
  warn() { return extLogger ? extLogger('warn', arguments) : console.warn.apply(console, arguments); },
  error() { return extLogger ? extLogger('error', arguments) : console.error.apply(console, arguments); },
  success() { return extLogger ? extLogger('success', arguments) : console.info.apply(console, arguments); },
};

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
 * @param {function(string, Array)} extLogger Function for logging
 * @param {function} stopHndl stopHndl used for stopping
 * @author Victornpb <https://www.github.com/victornpb>
 * @see https://github.com/victornpb/undiscord
 */
class deleteMessages {

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
    _messagesToDelete: null,
    _skippedMessages: null,
  };

  stats = {
    startTime: new Date(), // start time
    throttledCount: 0, // how many times you have been throttled
    throttledTotalTime: 0, // the total amount of time you spent being throttled
    lastPing: null, // the most recent ping
    avgPing: null, // average ping used to calculate the estimated remaining time
  };

  extLogger = undefined;
  stopHndl = undefined;
  onProgress = undefined;

  async run() {
    this.state.running = true;
    this.stats.startTime = new Date();

    log.success(`\nStarted at ${start.toLocaleString()}`);
    log.debug(
      `authorId = "${redact(authorId)}"`,
      `guildId = "${redact(guildId)}"`,
      `channelId = "${redact(channelId)}"`,
      `minId = "${redact(minId)}"`,
      `maxId = "${redact(maxId)}"`,
      `hasLink = ${!!hasLink}`,
      `hasFile = ${!!hasFile}`,
    );

    while (true) {

      // Search messages
      await this.search();
      // Process results and find which messages should be deleted
      await this.filterResponse();

      // Calculate
      const etr = msToHMS((this.options.searchDelay * Math.round(total / 25)) + ((this.options.deleteDelay + this.stats.avgPing) * total));
      log.info(
        `Total messages found: ${data.total_results}`,
        `(Messages in current page: ${data.messages.length}`,
        `To be deleted: ${messagesToDelete.length}`,
        `System: ${this.state._skippedMessages.length})`,
        `offset: ${this.state.offset}`
      );
      this.printDelayStats();
      log.verb(`Estimated time remaining: ${etr}`);


      if (this.state._messagesToDelete.length > 0 || this.state._skippedMessages.length > 0) {

        if (++iterations < 1) {
          log.verb('Waiting for your confirmation...');
          const answer = await ask(
            `Do you want to delete ~${total} messages? (Estimated time: ${etr})` +
            '\n\n---- Preview ----\n' +
            this.state._messagesToDelete.map(m => `${m.author.username}#${m.author.discriminator}: ${m.attachments.length ? '[ATTACHMENTS]' : m.content}`).join('\n'));
          if (!answer) {
            log.error('Aborted by you!');
            break;
          }
          log.verb('OK');
        }

        await this.deleteMessagesFromPage();
      }
      else {
        if (total - offset > 0) log.warn('Ended because API returned an empty page.');
        break;
      }
    }

    this.state.running = false;
    this.stats.endTime = new Date();
    log.success(`Ended at ${this.stats.endTime.toLocaleString()}! Total time: ${msToHMS(this.stats.endTime.getTime() - this.stats.startTime.getTime())}`);
    this.printDelayStats();
    log.verb(`Rate Limited: ${this.stats.throttledCount} times. Total time throttled: ${msToHMS(this.stats.throttledTotalTime)}.`);
    log.debug(`Deleted ${this.state.delCount} messages, ${this.state.failCount} failed.\n`);
  }

  stop() {
    this.state.running = false;
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
      ]), { headers: {
        'Authorization': this.options.authToken,
      } });
      this.afterRequest();
    } catch (err) {
      this.running = false;
      return log.error('Search request threw an error:', err);
    }

    // not indexed yet
    if (resp.status === 202) {
      const w = (await resp.json()).retry_after * 1000;
      this.stats.throttledCount++;
      this.stats.throttledTotalTime += w;
      log.warn(`This channel wasn't indexed, waiting ${w}ms for discord to index it...`);
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
        this.printDelayStats();
        log.verb(`Cooling down for ${w * 2}ms before retrying...`);

        await wait(w * 2);
        return await search();
      } else {
        this.running = false;
        return log.error(`Error searching messages, API responded with status ${resp.status}!\n`, await resp.json());
      }
    }

    this.state._seachResponse = resp;
    return resp;
  }

  async filterResponse() {
    const data = await this.state._seachResponse.json();
    const total = data.total_results;
    if (!this.state.grandTotal) this.state.grandTotal = total;
    const discoveredMessages = data.messages.map(convo => convo.find(message => message.hit === true));

    let messagesToDelete = discoveredMessages;
    messagesToDelete = messagesToDelete.filter(msg => msg.type === 0 || (msg.type >= 6 && msg.type <= 21));
    messagesToDelete = messagesToDelete.filter(msg => includePinned && msg.pinned);

    try {
      const regex = new RegExp(this.options.pattern, 'i');
      messagesToDelete = messagesToDelete.filter(msg => regex.test(msg.content));
    } catch (e) {
      log.warn('Ignoring RegExp because pattern is malformed!', e);
    }

    const skippedMessages = discoveredMessages.filter(msg => !messagesToDelete.find(m => m.id === msg.id));

    this.state._messagesToDelete = messagesToDelete;
    this.state._skippedMessages = skippedMessages;
  }


  async deleteMessagesFromPage() {
    for (let i = 0; i < this.state._messagesToDelete.length; i++) {
      const message = this.state._messagesToDelete[i];
      if (!this.running) return log.error('Stopped by you!');

      log.debug(
        `${((this.state.delCount + 1) / this.state.grandTotal * 100).toFixed(2)}%`,
        `(${this.state.delCount + 1}/${this.state.grandTotal})`,
        `Deleting ID:${redact(message.id)}`,
        `<b>${redact(message.author.username + '#' + message.author.discriminator)} <small>(${redact(new Date(message.timestamp).toLocaleString())})</small>:</b>`,
        `<i>${redact(message.content).replace(/\n/g, '↵')}</i>`,
        message.attachments.length ? redact(JSON.stringify(message.attachments)) : ''
      );
      if (this.onProgress) this.onProgress(this.state);
      this.deleteMessage(message);
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
      this.stats.delCount++;
    } catch (err) {
      log.error('Delete request throwed an error:', err);
      log.verb('Related object:', redact(JSON.stringify(message)));
      this.stats.failCount++;
    }

    if (!resp.ok) {
      // deleting messages too fast
      if (resp.status === 429) {
        const w = (await resp.json()).retry_after * 1000;
        this.stats.throttledCount++;
        this.stats.throttledTotalTime += w;
        this.options.deleteDelay = w; // increase delay
        log.warn(`Being rate limited by the API for ${w}ms! Adjusted delete delay to ${this.options.deleteDelay}ms.`);
        this.printDelayStats();
        log.verb(`Cooling down for ${w * 2}ms before retrying...`);
        await wait(w * 2);
        i--; // retry <================================================================
      } else {
        log.error(`Error deleting message, API responded with status ${resp.status}!`, await resp.json());
        log.verb('Related object:', redact(JSON.stringify(message)));
        this.stats.failCount++;
      }
    }
  }


  #beforeTs = 0;
  beforeRequest() {
    this.#beforeTs = Date.now();
  }
  afterRequest() {
    this.stats.lastPing = (Date.now() - this.#beforeTs);
    this.stats.avgPing = this.stats.avgPing > 0 ? (this.stats.avgPing * 0.9) + (this.stats.lastPing * 0.1) : this.stats.lastPing;
  }

  printDelayStats() {
    log.verb(
      `Delete delay: ${this.options.deleteDelay}ms, Search delay: ${this.options.searchDelay}ms`,
      `Last Ping: ${this.stats.lastPing}ms, Average Ping: ${this.stats.avgPing | 0}ms`
    );
  }

}

export default deleteMessages;
