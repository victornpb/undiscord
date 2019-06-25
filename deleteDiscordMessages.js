//Paste this function in DevTools console inside Discord

/**
 * Delete all messages in a Discord channel or DM
 * @param {string} authToken Your authorization token
 * @param {string} authorId Author of the messages you want to delete
 * @param {string} channelId Channel were the messages are located
 * @param {string} afterMessageId Only delete messages after this, leave blank do delete all
 * @author Victornpb <https://www.github.com/victornpb>
 * @see https://gist.github.com/victornpb/135f5b346dea4decfc8f63ad7d9cc182
 */
function deleteMessages(authToken, authorId, channelId, afterMessageId) {
    const start = new Date();
    let delayDelete = 500;
    let delaySearch = 1000;
    let delCount = 0;
    let failCount = 0;
    let estimatedPing = 220;
    let grandTotal;
    let throttledCount = 0;
    let throttledTotalTime = 0;
    const history = [];

    const wait = async (ms) => new Promise(done => setTimeout(done, ms));
    const msToHMS = (s) => `${s / 3.6e6 | 0}h ${(s % 3.6e6) / 6e4 | 0}m ${(s % 6e4) / 1000 | 0}s`;
    function logger(type, args, style = '') {
        console[type].apply(console, args);
        history.push(args);
        pp.insertAdjacentHTML('beforeend', `<div style="${style}">${Array.from(args).map(o => typeof o === 'object' ? JSON.stringify(o) : o).join('\t')}</div>`);
        popup.scrollBy(0, 1e10);
    }
    function log() { logger('log', arguments, 'black'); }
    function log_info() { logger('info', arguments, 'color:darkturquoise;'); }
    function log_verb() { logger('debug', arguments, 'color:gray;'); }
    function log_warn() { logger('warn', arguments, 'color:orange;'); }
    function log_error() { logger('error', arguments, 'color:red;'); }
    function log_success() { logger('log', arguments, 'color:green;'); }

    var popup = window.open('', '', 'width=800,height=1000,top=0,left=0');
    if (!popup) return console.error('Popup blocked! Please allow popups and try again.');
    popup.document.write('<span>...</span>');
    popup.document.body.innerHTML = '<pre></pre>';
    const pp = popup.document.getElementsByTagName('pre')[0];
    

    log_info(`Started at ${start.toLocaleString()}`);
    log(`channelId=${channelId} authorId=${authorId} firstMessageId=${afterMessageId}`);
    log_info(`---- You can abort by setting STOP=1 on the console ----`);
    recurse();

    async function recurse() {
        const headers = {
            "Authorization": authToken
        };
        const deleteAfter = `search?author_id=${authorId}` + (afterMessageId ? `&min_id=${afterMessageId}` : '');
        const baseURL = `https://discordapp.com/api/v6/channels/${channelId}/messages/`;

        let resp;
        try {
            resp = await fetch(baseURL + deleteAfter, {
                headers
            });
        } catch (err) {
            log_error('Something went wrong!', err);
            return;
        }

        // not indexed yet
        if (resp.status === 202) {
            const w = (await resp.json()).retry_after;
            throttledCount++;
            throttledTotalTime += w;
            log_warn(`This channel wasn't indexed, waiting ${w} ms for discord to index it...`);
            await wait(w);
            return recurse();
        }

        if (!resp.ok) {
            if (resp.status === 429) {
                const r = await resp.json();
                const x = r.retry_after;
                throttledCount++;
                throttledTotalTime += x;
                log_warn(`! Rate limited by the API! Waiting ${x} ms ...`);
                await wait(x);
                return recurse();
            } else {
                log_error('API respondend with non OK status!', await resp.json());
                return;
            }
        }

        const result = await resp.json();

        const total = result.total_results;
        if (!grandTotal) grandTotal = total;
        log_info(`Messages to delete: ${result.total_results}`, `Time remaining: ${msToHMS((delaySearch * Math.round(total / 25)) + ((delayDelete + estimatedPing) * total))} (ping: ${estimatedPing << 0}ms)`);

        if (result.total_results > 0) {
            for (let i = 0; i < result.messages.length; i++) {
                const element = result.messages[i];
                for (let j = 0; j < element.length; j++) {
                    const message = element[j];

                    if (window.STOP) return log_error('STOPPED! (If you want to continue set STOP=0 and run again!');

                    if (message.type === 3) {
                        log_verb('Found a System message!? skipping it...', message);
                    } else if (message.author.id == authorId && message.hit == true) {

                        log(`${((delCount + 1) / grandTotal * 100).toFixed(2)}% (${delCount + 1}/${grandTotal}) Deleting ID:${message.id}`,
                            `[${new Date(message.timestamp).toLocaleString()}] ${message.author.username}#${message.author.discriminator}: ${message.content}`,
                            message.attachments.length ? message.attachments : '');
                        const s = Date.now();

                        let resp;
                        try {
                            resp = await fetch(baseURL + message.id, {
                                headers,
                                method: "DELETE"
                            });
                            delCount++;
                        } catch (err) {
                            log_error('Failed to delete message:', message, 'Error:', err);
                            failCount++;
                        }

                        if (!resp.ok) {
                            if (resp.status === 429) {
                                const r = await resp.json();
                                const x = r.retry_after;
                                throttledCount++;
                                throttledTotalTime += x;
                                log_warn(`! Rate limited by the API! Waiting ${x} ms ...`);
                                await wait(x);
                                i--;
                            } else {
                                log_error('API respondend with non OK status!', resp);
                            }
                        }
                        estimatedPing = (estimatedPing + (Date.now() - s)) / 2;
                        await wait(delayDelete);
                    }
                }
            }
            log_verb('Getting next messages...');
            await wait(delaySearch);
            return recurse();
        } else {
            log_success('---- DONE! ----');
            log_info(`Ended at ${new Date().toLocaleString()}! Total time: ${msToHMS(Date.now() - start.getTime())}`);
            log(`Rate Limited: ${throttledCount} times. Total time throttled: ${msToHMS(throttledTotalTime)}`);
            log(`Deleted ${delCount} messages , ${failCount} failed.`);
            return result;
        }
    }
}

//END.