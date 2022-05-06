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
async function deleteMessages(authToken, authorId, guildId, channelId, minId, maxId, content, hasLink, hasFile, includeNsfw, includePinned, pattern, searchDelay, deleteDelay, extLogger, stopHndl, onProgress) {
  const start = new Date();
  let delCount = 0;
  let failCount = 0;
  let avgPing;
  let lastPing;
  let grandTotal;
  let throttledCount = 0;
  let throttledTotalTime = 0;
  let offset = 0;
  let iterations = -1;

  const wait = async ms => new Promise(done => setTimeout(done, ms));
  const msToHMS = s => `${s / 3.6e6 | 0}h ${(s % 3.6e6) / 6e4 | 0}m ${(s % 6e4) / 1000 | 0}s`;
  const escapeHTML = html => html.replace(/[&<"']/g, m => ({ '&': '&amp;', '<': '&lt;', '"': '&quot;', '\'': '&#039;' })[m]);
  const redact = str => `<span class="priv">${escapeHTML(str)}</span><span class="mask">REDACTED</span>`;
  const queryString = params => params.filter(p => p[1] !== undefined).map(p => p[0] + '=' + encodeURIComponent(p[1])).join('&');
  const ask = async msg => new Promise(resolve => setTimeout(() => resolve(window.confirm(msg)), 10));
  const printDelayStats = () => log.verb(`Delete delay: ${deleteDelay}ms, Search delay: ${searchDelay}ms`, `Last Ping: ${lastPing}ms, Average Ping: ${avgPing | 0}ms`);
  const toSnowflake = (date) => /:/.test(date) ? ((new Date(date).getTime() - 1420070400000) * Math.pow(2, 22)) : date;

  const log = {
    debug() { return extLogger ? extLogger('debug', arguments) : console.debug.apply(console, arguments); },
    info() { return extLogger ? extLogger('info', arguments) : console.info.apply(console, arguments); },
    verb() { return extLogger ? extLogger('verb', arguments) : console.log.apply(console, arguments); },
    warn() { return extLogger ? extLogger('warn', arguments) : console.warn.apply(console, arguments); },
    error() { return extLogger ? extLogger('error', arguments) : console.error.apply(console, arguments); },
    success() { return extLogger ? extLogger('success', arguments) : console.info.apply(console, arguments); },
  };

  async function recurse() {
    let API_SEARCH_URL;
    if (guildId === '@me') {
      API_SEARCH_URL = `https://discord.com/api/v9/channels/${channelId}/messages/`; // DMs
    }
    else {
      API_SEARCH_URL = `https://discord.com/api/v9/guilds/${guildId}/messages/`; // Server
    }

    const headers = {
      'Authorization': authToken
    };

    if (onProgress) onProgress(-1, 1);

    let resp;
    try {
      const s = Date.now();
      resp = await fetch(API_SEARCH_URL + 'search?' + queryString([
        ['author_id', authorId || undefined],
        ['channel_id', (guildId !== '@me' ? channelId : undefined) || undefined],
        ['min_id', minId ? toSnowflake(minId) : undefined],
        ['max_id', maxId ? toSnowflake(maxId) : undefined],
        ['sort_by', 'timestamp'],
        ['sort_order', 'desc'],
        ['offset', offset],
        ['has', hasLink ? 'link' : undefined],
        ['has', hasFile ? 'file' : undefined],
        ['content', content || undefined],
        ['include_nsfw', includeNsfw ? true : undefined],
      ]), { headers });
      lastPing = (Date.now() - s);
      avgPing = avgPing > 0 ? (avgPing * 0.9) + (lastPing * 0.1) : lastPing;
    } catch (err) {
      return log.error('Search request threw an error:', err);
    }

    // not indexed yet
    if (resp.status === 202) {
      const w = (await resp.json()).retry_after * 1000;
      throttledCount++;
      throttledTotalTime += w;
      log.warn(`This channel wasn't indexed, waiting ${w}ms for discord to index it...`);
      await wait(w);
      return await recurse();
    }

    if (!resp.ok) {
      // searching messages too fast
      if (resp.status === 429) {
        const w = (await resp.json()).retry_after * 1000;
        throttledCount++;
        throttledTotalTime += w;
        searchDelay += w; // increase delay
        log.warn(`Being rate limited by the API for ${w}ms! Increasing search delay...`);
        printDelayStats();
        log.verb(`Cooling down for ${w * 2}ms before retrying...`);

        await wait(w * 2);
        return await recurse();
      } else {
        return log.error(`Error searching messages, API responded with status ${resp.status}!\n`, await resp.json());
      }
    }

    let regex;

    try {
      regex = new RegExp(pattern);
    } catch (e) {
      log.warn('Ignoring RegExp because pattern is malformed');
    }

    const data = await resp.json();
    const total = data.total_results;
    if (!grandTotal) grandTotal = total;
    const discoveredMessages = data.messages.map(convo => convo.find(message => message.hit === true));
    const messagesToDelete = discoveredMessages.filter(msg => {
      return (msg.type === 0 || (msg.type >= 6 && msg.type <= 21) || (msg.pinned && includePinned)) && (!regex || msg.content.match(regex));
    });
    const skippedMessages = discoveredMessages.filter(msg => !messagesToDelete.find(m => m.id === msg.id));

    const end = () => {
      log.success(`Ended at ${new Date().toLocaleString()}! Total time: ${msToHMS(Date.now() - start.getTime())}`);
      printDelayStats();
      log.verb(`Rate Limited: ${throttledCount} times. Total time throttled: ${msToHMS(throttledTotalTime)}.`);
      log.debug(`Deleted ${delCount} messages, ${failCount} failed.\n`);
    };

    const etr = msToHMS((searchDelay * Math.round(total / 25)) + ((deleteDelay + avgPing) * total));
    log.info(`Total messages found: ${data.total_results}`, `(Messages in current page: ${data.messages.length}, To be deleted: ${messagesToDelete.length}, System: ${skippedMessages.length})`, `offset: ${offset}`);
    printDelayStats();
    log.verb(`Estimated time remaining: ${etr}`);


    if (messagesToDelete.length > 0 || skippedMessages.length > 0) {

      if (++iterations < 1) {
        log.verb('Waiting for your confirmation...');
        if (!await ask(`Do you want to delete ~${total} messages?\nEstimated time: ${etr}\n\n---- Preview ----\n` +
                    messagesToDelete.map(m => `${m.author.username}#${m.author.discriminator}: ${m.attachments.length ? '[ATTACHMENTS]' : m.content}`).join('\n')))
          return end(log.error('Aborted by you!'));
        log.verb('OK');
      }

      for (let i = 0; i < messagesToDelete.length; i++) {
        const message = messagesToDelete[i];
        if (stopHndl && stopHndl()) return end(log.error('Stopped by you!'));

        log.debug(`${((delCount + 1) / grandTotal * 100).toFixed(2)}% (${delCount + 1}/${grandTotal})`,
          `Deleting ID:${redact(message.id)} <b>${redact(message.author.username + '#' + message.author.discriminator)} <small>(${redact(new Date(message.timestamp).toLocaleString())})</small>:</b> <i>${redact(message.content).replace(/\n/g, '↵')}</i>`,
          message.attachments.length ? redact(JSON.stringify(message.attachments)) : '');
        if (onProgress) onProgress(delCount + 1, grandTotal);

        let resp;
        try {
          const s = Date.now();
          const API_DELETE_URL = `https://discord.com/api/v9/channels/${message.channel_id}/messages/${message.id}`;
          resp = await fetch(API_DELETE_URL, {
            headers,
            method: 'DELETE'
          });
          lastPing = (Date.now() - s);
          avgPing = (avgPing * 0.9) + (lastPing * 0.1);
          delCount++;
        } catch (err) {
          log.error('Delete request throwed an error:', err);
          log.verb('Related object:', redact(JSON.stringify(message)));
          failCount++;
        }

        if (!resp.ok) {
          // deleting messages too fast
          if (resp.status === 429) {
            const w = (await resp.json()).retry_after * 1000;
            throttledCount++;
            throttledTotalTime += w;
            deleteDelay = w; // increase delay
            log.warn(`Being rate limited by the API for ${w}ms! Adjusted delete delay to ${deleteDelay}ms.`);
            printDelayStats();
            log.verb(`Cooling down for ${w * 2}ms before retrying...`);
            await wait(w * 2);
            i--; // retry
          } else {
            log.error(`Error deleting message, API responded with status ${resp.status}!`, await resp.json());
            log.verb('Related object:', redact(JSON.stringify(message)));
            failCount++;
          }
        }

        await wait(deleteDelay);
      }

      if (skippedMessages.length > 0) {
        grandTotal -= skippedMessages.length;
        offset += skippedMessages.length;
        log.verb(`Found ${skippedMessages.length} system messages! Decreasing grandTotal to ${grandTotal} and increasing offset to ${offset}.`);
      }

      log.verb(`Searching next messages in ${searchDelay}ms...`, (offset ? `(offset: ${offset})` : ''));
      await wait(searchDelay);

      if (stopHndl && stopHndl()) return end(log.error('Stopped by you!'));

      return await recurse();
    } else {
      if (total - offset > 0) log.warn('Ended because API returned an empty page.');
      return end();
    }
  }

  log.success(`\nStarted at ${start.toLocaleString()}`);
  log.debug(`authorId="${redact(authorId)}" guildId="${redact(guildId)}" channelId="${redact(channelId)}" minId="${redact(minId)}" maxId="${redact(maxId)}" hasLink=${!!hasLink} hasFile=${!!hasFile}`);
  if (onProgress) onProgress(null, 1);
  return await recurse();
}

export default deleteMessages;