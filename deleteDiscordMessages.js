//Paste this function in DevTools console inside Discord

(function () {
    let stop;
    let popup;
    popup = window.open('', '', 'width=800,height=1000,top=0,left=0');
    if (!popup) return console.error('Popup blocked! Please allow popups and try again.');
    popup.document.write('<span>...</span>');
    popup.document.body.innerHTML = `
        <div style="position:fixed;top:0;left:0;right:0;background:silver;">
            <label>Auth Token<input type="password" id="authToken" placeholder="Auth Token" value=""></label>
            <label>Author Id <input id="authorId" placeholder="Author ID" value=""><button id="author">Fill</button></label>
            <label>Channel Id <input id="channelId" placeholder="Channel ID" value=""><button id="channel">Fill</button></label><br>
            <label>After <input id="afterMessageId" placeholder="After messageId" value=""></label>
            <label>Before <input id="beforeMessageId" placeholder="Before messageId" value=""></label><br>
            
            <button id="start">START</button>
            <button id="stop" disabled>STOP</button>
        </div>
        <pre style="margin-top: 50px;"></pre>`;
    
    let extLogger = (args, style = '') => {
        const atScrollEnd = popup.document.documentElement.scrollHeight - popup.document.body.clientHeight - popup.scrollY < 30;
        pp.insertAdjacentHTML('beforeend', `<div style="${style}">${Array.from(args).map(o => typeof o === 'object' ? JSON.stringify(o) : o).join('\t')}</div>`);
        if(atScrollEnd) popup.scrollTo(0, popup.document.documentElement.clientHeight);
    }
    const pp = popup.document.querySelector('pre');
    const startBtn = popup.document.querySelector('#start');
    const stopBtn = popup.document.querySelector('#stop');
    startBtn.onclick = (e) => {
        authToken = popup.document.querySelector('#authToken').value.trim();
        authorId = popup.document.querySelector('#authorId').value.trim();
        channelId = popup.document.querySelector('#channelId').value.trim();
        afterMessageId = popup.document.querySelector('#afterMessageId').value.trim();
        beforeMessageId = popup.document.querySelector('#beforeMessageId').value.trim();

        stop = stopBtn.disabled = !(startBtn.disabled = true);
        deleteMessages(authToken, authorId, channelId, afterMessageId, beforeMessageId, extLogger, () => !(stop === true || popup.closed)).then(() => {
            stop = stopBtn.disabled = !(startBtn.disabled = false);
        });
    };
    stopBtn.onclick = () => stop = stopBtn.disabled = !(startBtn.disabled = false);

    popup.document.querySelector('button#author').onclick = (e) => {
        popup.document.querySelector('#authorId').value = JSON.parse(popup.localStorage.user_id_cache);
    };
    popup.document.querySelector('button#channel').onclick = (e) => {
        popup.document.querySelector('#channelId').value = location.href.match(/channels\/.*\/(\d+)/)[1];
    };
    
    /**
     * Delete all messages in a Discord channel or DM
     * @param {string} authToken Your authorization token
     * @param {string} authorId Author of the messages you want to delete
     * @param {string} channelId Channel were the messages are located
     * @param {string} afterMessageId Only delete messages after this, leave blank do delete all
     * @param {string} beforeMessageId Only delete messages before this, leave blank do delete all
     * @param {function} extLogger Function for logging
     * @param {function} stopHndl stopHndl used for stopping
     * @author Victornpb <https://www.github.com/victornpb>
     * @see https://gist.github.com/victornpb/135f5b346dea4decfc8f63ad7d9cc182
     */
    async function deleteMessages(authToken, authorId, channelId, afterMessageId, beforeMessageId, extLogger, stopHndl) {
        const start = new Date();
        let deleteDelay = 100;
        let searchDelay = 100;
        let delCount = 0;
        let failCount = 0;
        let sysMsgs = new Set();
        let estimatedPing;
        let grandTotal;
        let throttledCount = 0;
        let throttledTotalTime = 0;
        let offset = 0;
       
        const log = {
            debug() { this.logger('log', arguments, ''); },
            info() { this.logger('info', arguments, 'color:#00b0f4;'); },
            verb() { this.logger('debug', arguments, 'color:#72767d;'); },
            warn() { this.logger('warn', arguments, 'color:#faa61a;'); },
            error() { this.logger('error', arguments, 'color:#f04747;'); },
            success() { this.logger('log', arguments, 'color:#43b581;'); },
            logger(type, args, style = '') {
                // console[type].apply(console, args);
                extLogger && extLogger(args,style);
            },
        };

        const wait = async (ms) => new Promise(done => setTimeout(done, ms));
        const msToHMS = (s) => `${s / 3.6e6 | 0}h ${(s % 3.6e6) / 6e4 | 0}m ${(s % 6e4) / 1000 | 0}s`;
                 
        async function recurse() {
            const headers = {
                'Authorization': authToken
            };
            
            const params = {
                author_id: authorId,
                min_id: afterMessageId || undefined,
                max_id: beforeMessageId || undefined,
                offset: offset,
                sort_by: 'timestamp'
            };
    
            const queryString = Object.entries(params)
                .filter(p => p[1] !== undefined)
                .map(p => p[0] + '=' + encodeURIComponent(p[1]))
                .join('&');
            
            const baseURL = `https://discordapp.com/api/v6/channels/${channelId}/messages/`;
    
            let resp;
            try {
                const s = Date.now();
                resp = await fetch(baseURL + 'search?' + queryString, { headers });
                estimatedPing = (Date.now() - s);
            } catch (err) {
                return log.error('Something went wrong!', err);
            }
    
            // not indexed yet
            if (resp.status === 202) {
                const w = (await resp.json()).retry_after;
                throttledCount++;
                throttledTotalTime += w;
                log.warn(`This channel wasn't indexed, waiting ${w}ms for discord to index it...`);
                await wait(w);
                return await recurse();
            }
    
            if (!resp.ok) {
                // searching messages too fast
                if (resp.status === 429) {
                    const w = (await resp.json()).retry_after;
                    throttledCount++;
                    throttledTotalTime += w;
                    searchDelay += w; // increase delay
                    log.warn(`Being rate limited by the API! Adjusted delay to ${searchDelay}ms.`);
                    log.verb(`Waiting ${w}ms before retrying...`);
                    await wait(w);
                    return await recurse();
                } else {
                    return log.error('API responded with an error!', await resp.json());
                }
            }
    
            const data = await resp.json();
            const total = data.total_results;
            if (!grandTotal) grandTotal = total;
            const myMessages = data.messages.map(convo => convo.find(message => message.author.id === authorId && message.hit===true));
            const systemMessages = myMessages.filter(msg => msg.type === 3);
            const deletableMessages = myMessages.filter(msg => msg.type !== 3);
            
            log.info(`Total messages found: ${data.total_results}`, `(Messages in current page: ${data.messages.length}, Author: ${deletableMessages.length}, System: ${systemMessages.length})`, `offset: ${offset}`);
            log.verb(`Estimated time remaining: ${msToHMS((searchDelay * Math.round(total / 25)) + ((deleteDelay + estimatedPing) * total))}`, `(Delete delay: ${deleteDelay}ms`, `Average ping: ${estimatedPing << 0}ms)`);
            
            systemMessages.forEach(m => sysMsgs.add(m.id));

            if (myMessages.length > 0) {
                
                for (let i = 0; i < deletableMessages.length; i++) {
                    const message = deletableMessages[i];
                    if (stopHndl && stopHndl()===false) return log.error('STOPPED by you!');

                    log.debug(`${((delCount + 1) / grandTotal * 100).toFixed(2)}% (${delCount + 1}/${grandTotal}) Deleting ID:${message.id}`,
                        `[${new Date(message.timestamp).toLocaleString()}] ${message.author.username}#${message.author.discriminator}: ${message.content}`,
                        message.attachments.length ? message.attachments : '');

                    let lastPing;
                    let resp;
                    try {
                        const s = Date.now();
                        resp = await fetch(baseURL + message.id, {
                            headers,
                            method: 'DELETE'
                        });
                        lastPing = (Date.now() - s);
                        estimatedPing = (estimatedPing + lastPing) / 2;
                        delCount++;
                    } catch (err) {
                        log.error('Failed to delete message:', message, 'Error:', err);
                        failCount++;
                    }

                    if (!resp.ok) {
                        // deleting messages too fast
                        if (resp.status === 429) {
                            const x = (await resp.json()).retry_after;
                            throttledCount++;
                            throttledTotalTime += x;
                            deleteDelay += x; // increase delay
                            log.warn(`Being rate limited by the API! Adjusted delay to ${deleteDelay}ms.`, `Last ping ${lastPing}ms`);
                            log.verb(`Waiting ${x}ms before retrying...`);
                            await wait(x);
                            i--; // retry
                        } else {
                            log.error('API respondend with not OK status!', resp);
                            failCount++;
                        }
                    }
                    
                    await wait(deleteDelay);
                }

                if (systemMessages.length > 0) {
                    grandTotal -= systemMessages.length;
                    offset += systemMessages.length;
                    log.verb(`Found ${systemMessages.length} system messages! Decreasing grandTotal to ${grandTotal} and increasing offset to ${offset}.`);
                }
                
                log.verb(`Searching next messages in ${searchDelay}ms...`, (offset ? `(offset: ${offset})` : '') );
                await wait(searchDelay);

                if (stopHndl && stopHndl()===false) return log.error('STOPPED by you!');

                return await recurse();
            } else {
                if (total - offset > 0) log.warn('Ended because API returned an empty page.');
                log.success(`Ended at ${new Date().toLocaleString()}! Total time: ${msToHMS(Date.now() - start.getTime())}`);
                log.verb(`Search delay: ${searchDelay}ms, Delete delay: ${deleteDelay}ms, Average Ping: ${estimatedPing}`);
                log.verb(`Rate Limited: ${throttledCount} times. Total time throttled: ${msToHMS(throttledTotalTime)}.`);
                log.debug(`Deleted ${delCount} messages, ${failCount} failed.`);
                return data;
            }
        }

        log.success(`\nStarted at ${start.toLocaleString()}`);
        log.debug(`authorId="${authorId}" channelId="${channelId}" afterMessageId="${afterMessageId}" beforeMessageId="${beforeMessageId}"`);
        return await recurse();
    }
})();

//END.
