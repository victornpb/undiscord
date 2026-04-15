import { log } from '../utils/log.js';
import { wait, msToHMS } from '../utils/time.js';
import { redact } from '../utils/html.js';
import { ask } from '../utils/discord.js';
import { MESSAGES_PER_PAGE } from '../utils/constants.js';
import { searchWithRetry } from './search.js';
import { filterMessages } from './filter.js';
import { deleteMessagesFromList } from './delete.js';

/**
 * Delete all messages in a Discord channel or DM.
 * Orchestrates search -> filter -> confirm -> delete loop.
 * @author Victornpb <https://www.github.com/victornpb>
 * @see https://github.com/victornpb/undiscord
 */
class UndiscordCore {

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
    includeApplications: true,
    pattern: null,
    searchDelay: null,
    deleteDelay: null,
    jobDelay: 30000,
    maxAttempt: 2,
    emptyPageRetries: 2,
    askForConfirmation: true,
    threadId: null,
    isThread: false,
  };

  state = {
    running: false,
    delCount: 0,
    failCount: 0,
    grandTotal: 0,
    offset: 0,
    iterations: 0,
    emptyPageRetryCount: 0,
    _searchResponse: null,
    _messagesToDelete: [],
    _skippedMessages: [],
  };

  stats = {
    startTime: new Date(),
    throttledCount: 0,
    throttledTotalTime: 0,
    lastPing: 0,
    avgPing: 0,
    etr: 0,
  };

  // event callbacks
  onStart = undefined;
  onProgress = undefined;
  onStop = undefined;
  _userStopped = false;

  /** Reset state between runs. Stats are NOT reset intentionally,
   *  so they accumulate across batch jobs for the full session summary. */
  resetState() {
    this.state = {
      running: false,
      delCount: 0,
      failCount: 0,
      grandTotal: 0,
      offset: 0,
      iterations: 0,
      emptyPageRetryCount: 0,
      _searchResponse: null,
      _messagesToDelete: [],
      _skippedMessages: [],
    };
    this.options.askForConfirmation = true;
  }

  /**
   * Automate the deletion process across multiple channels.
   * @param {Object[]} queue - Array of job options (guildId, channelId overrides)
   */
  async runBatch(queue) {
    if (this.state.running) return log.error('Already running!');

    log.info(`Runnning batch with queue of ${queue.length} jobs`);
    for (let i = 0; i < queue.length; i++) {
      if (i > 0) {
        log.verb(`Waiting ${(this.options.jobDelay / 1000).toFixed(2)}s before next job...`);
        await wait(this.options.jobDelay);
      }

      const job = queue[i];
      log.info('Starting job...', `(${i + 1}/${queue.length})`);

      this.options = { ...this.options, ...job };

      this._userStopped = false;
      try {
        await this.run(true);
      } catch (err) {
        log.error('Job failed, skipping to next...', err);
      }
      if (this._userStopped) break; // user clicked Stop — respect it

      log.info('Job ended.', `(${i + 1}/${queue.length})`);
      this.resetState();
      this.options.askForConfirmation = false;
      this.state.running = true;
    }

    log.info('Batch finished.');
    this.state.running = false;
  }

  /**
   * Start the deletion process for a single channel.
   * @param {boolean} [isJob=false] - Whether this is part of a batch job
   */
  async run(isJob = false) {
    if (this.state.running && !isJob) return log.error('Already running!');

    this.state.running = true;
    this._userStopped = false;
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
      await searchWithRetry(this.options, this.state, this.stats, this.beforeRequest.bind(this), this.afterRequest.bind(this), this.printStats.bind(this));

      // filter
      const { toDelete, skipped, grandTotal } = filterMessages(this.state._searchResponse, this.options);
      this.state._messagesToDelete = toDelete;
      this.state._skippedMessages = skipped;
      if (grandTotal > this.state.grandTotal) this.state.grandTotal = grandTotal;

      log.verb(
        `Grand total: ${this.state.grandTotal}`,
        `(Messages in current page: ${this.state._searchResponse.messages.length}`,
        `To be deleted: ${toDelete.length}`,
        `Skipped: ${skipped.length})`,
        `offset: ${this.state.offset}`
      );
      this.printStats();

      this.calcEtr();
      log.verb(`Estimated time remaining: ${msToHMS(this.stats.etr)}`);

      if (toDelete.length > 0) {
        if (await this.confirm() === false) {
          this.state.running = false;
          break;
        }
        await deleteMessagesFromList(this.state, this.options, this.stats, this.beforeRequest.bind(this), this.afterRequest.bind(this), this.printStats.bind(this), this.calcEtr.bind(this), this.onProgress);
        this.state.emptyPageRetryCount = 0;

        // exit immediately if all messages have been processed
        const allDone = this.state.grandTotal > 0
          && (this.state.delCount + this.state.failCount) >= this.state.grandTotal;
        if (allDone) {
          log.verb('All messages have been processed.');
          log.verb('[End state]', this.state);
          if (isJob) break;
          this.state.running = false;
        }
      }
      else if (skipped.length > 0) {
        const oldOffset = this.state.offset;
        this.state.offset += skipped.length;
        log.verb('There\'s nothing we can delete on this page, checking next page...');
        log.verb(`Skipped ${skipped.length} out of ${this.state._searchResponse.messages.length} in this page.`, `(Offset was ${oldOffset}, ajusted to ${this.state.offset})`);
        this.state.emptyPageRetryCount = 0;
      }
      else {
        // if all messages have been processed, no point retrying empty pages
        const allProcessed = this.state.grandTotal > 0
          && (this.state.delCount + this.state.failCount) >= this.state.grandTotal;

        if (!allProcessed && this.state.emptyPageRetryCount < this.options.emptyPageRetries) {
          this.state.emptyPageRetryCount++;
          log.warn(`API returned an empty page. Retrying... (${this.state.emptyPageRetryCount}/${this.options.emptyPageRetries})`);
        } else {
          log.verb(allProcessed ? 'All messages have been processed.' : 'Ended because API returned an empty page.');
          log.verb('[End state]', this.state);
          if (isJob) break;
          this.state.running = false;
        }
      }

      // only wait if we're continuing — skip the delay if we're done
      if (this.state.running) {
        log.verb(`Waiting ${(this.options.searchDelay / 1000).toFixed(2)}s before next page...`);
        await wait(this.options.searchDelay);
      }

    } while (this.state.running);

    this.stats.endTime = new Date();
    log.success(`Ended at ${this.stats.endTime.toLocaleString()}! Total time: ${msToHMS(this.stats.endTime.getTime() - this.stats.startTime.getTime())}`);
    this.printStats();
    log.debug(`Deleted ${this.state.delCount} messages, ${this.state.failCount} failed.\n`);

    // only call onStop if stop() hasn't already called it
    if (!this._userStopped && this.onStop) this.onStop(this.state, this.stats);
  }

  /** Stop the deletion process (user-initiated). */
  stop() {
    this.state.running = false;
    if (this._userStopped) return; // already stopped
    this._userStopped = true;
    if (this.onStop) this.onStop(this.state, this.stats);
  }

  /** Calculate estimated time remaining based on messages left to process. */
  calcEtr() {
    const remaining = Math.max(this.state.grandTotal - this.state.delCount - this.state.failCount, 0);
    this.stats.etr = (this.options.searchDelay * Math.ceil(remaining / MESSAGES_PER_PAGE)) + ((this.options.deleteDelay + this.stats.avgPing) * remaining);
  }

  /**
   * Ask for user confirmation before deleting.
   * @returns {Promise<boolean>} true if confirmed, false if aborted
   */
  async confirm() {
    if (!this.options.askForConfirmation) return true;

    log.verb('Waiting for your confirmation...');
    const previewLimit = 10;
    const previewMessages = this.state._messagesToDelete.slice(0, previewLimit);
    const remaining = this.state._messagesToDelete.length - previewLimit;
    const preview = previewMessages.map(m => `${m.author?.username || 'Unknown'}#${m.author?.discriminator || '0000'}: ${m.attachments?.length ? '[ATTACHMENTS]' : m.content || ''}`).join('\n')
      + (remaining > 0 ? `\n... and ${remaining} more messages` : '');

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
      this.options.askForConfirmation = false;
      return true;
    }
  }

  #beforeTs = 0;
  /** @private Record timestamp before a request for ping calculation. */
  beforeRequest() {
    this.#beforeTs = Date.now();
  }
  /** @private Calculate ping after a request completes. */
  afterRequest() {
    this.stats.lastPing = (Date.now() - this.#beforeTs);
    this.stats.avgPing = this.stats.avgPing > 0 ? (this.stats.avgPing * 0.9) + (this.stats.lastPing * 0.1) : this.stats.lastPing;
  }

  /** @private Log current delay and throttle statistics. */
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
