// Paste this code inside discord.com console

(function () {
    let stop;
    let popup;
    popup = window.open('', '', `top=0,left=${screen.width-800},width=850,height=${screen.height}`);
    if(!popup || !popup.document || !popup.document.write) return console.error('Popup blocked! Please allow popups and try again.');
    popup.document.write(/*html*/`<!DOCTYPE html>
    <html><head><meta charset='utf-8'><title>Delete Discord Messages</title><base target="_blank">
    <style>body{background-color:#36393f;color:#dcddde;font-family:sans-serif;font-size: 9pt;} a{color:#00b0f4;}
    body.redact .priv{display:none;} body:not(.redact) .mask{display:none;} body.redact [priv]{-webkit-text-security:disc;}
    .toolbar span{margin-right:8px;}
    button,.btn{color:#fff;background:#7289da;border:0;border-radius:4px;font-size:14px;} button:disabled{display:none;}
    input[type="text"],input[type="search"],input[type="password"],input[type="datetime-local"]{background-color:#202225;color:#b9bbbe;border-radius:4px;border:0;padding:0 .5em;height:24px;width:144px;margin:2px;}
    input#file{display: none}hr{border-color:rgba(255,255,255,0.1);}
    </style></head><body>
    <div class="toolbar" style="position:fixed;top:0;left:0;right:0;padding:8px;background:#36393f;box-shadow: 0 1px 0 rgba(0,0,0,.2), 0 1.5px 0 rgba(0,0,0,.05), 0 2px 0 rgba(0,0,0,.05);">
        <div style="display:flex;flex-wrap:wrap;">
            <span>Authorization <a href="https://github.com/victornpb/deleteDiscordMessages/blob/master/help/authToken.md" title="Help">?</a> <button id="getToken">auto</button><br>
                <input type="password" id="authToken" placeholder="Auth Token" autofocus>*<br>
                <span>Author <a href="https://github.com/victornpb/deleteDiscordMessages/blob/master/help/authorId.md" title="Help">?</a> <button id="getAuthor">auto</button></span>
                <br><input id="authorId" type="text" placeholder="Author ID" priv></span>
            <span>Guild/Channel <a href="https://github.com/victornpb/deleteDiscordMessages/blob/master/help/channelId.md" title="Help">?</a>
                <button id="getGuildAndChannel">auto</button><br>
                <input id="guildId" type="text" placeholder="Guild ID" priv><br>
                <input id="channelId" type="text" placeholder="Channel ID" priv><br>
                <label><input id="includeNsfw" type="checkbox">NSFW Channel</label><br><br>
                <label for="file"  title="Import list of channels from messages/index.json file"> Import: <span class="btn">...</span> <input id="file" type="file" accept="application/json,.json"></label>
            </span><br>
            <span>Range <a href="https://github.com/victornpb/deleteDiscordMessages/blob/master/help/messageId.md" title="Help">?</a><br>
                <input id="minDate" type="datetime-local" title="After" style="width:auto;"><br>
                <input id="maxDate" type="datetime-local" title="Before" style="width:auto;"><br>
                <input id="minId" type="text" placeholder="After message with Id" priv><br>
                <input id="maxId" type="text" placeholder="Before message with Id" priv><br>
            </span>
            <span>Search messages <a href="https://github.com/victornpb/deleteDiscordMessages/blob/master/help/filters.md" title="Help">?</a><br>
                <input id="content" type="text" placeholder="Containing text" priv><br>
                <label><input id="hasLink" type="checkbox">has: link</label><br>
                <label><input id="hasFile" type="checkbox">has: file</label><br>
                <label><input id="includePinned" type="checkbox">Include pinned</label>
            </span>
        </div>
        <hr>
        <button id="start" style="background:#43b581;width:80px;">Start</button>
        <button id="stop" style="background:#f04747;width:80px;" disabled>Stop</button>
        <button id="clear" style="width:80px;">Clear log</button>
        <label><input id="autoScroll" type="checkbox" checked>Auto scroll</label>
        <label title="Hide sensitive information for taking screenshots"><input id="redact" type="checkbox" checked>Screenshot mode</label>
        <progress id="progress" style="display:none;"></progress>

    </div>
    <pre style="margin-top:200px;font-size:0.75rem;font-family:Consolas,Liberation Mono,Menlo,Courier,monospace;">
        <center>Star this project on <a href="https://github.com/victornpb/deleteDiscordMessages" target="_blank">github.com/victornpb/deleteDiscordMessages</a>!\n\n
            <a href="https://github.com/victornpb/deleteDiscordMessages/issues" target="_blank">Issues or help</a></center>
        </pre></body></html>`);

    const $ = s => popup.document.querySelector(s);
    const logArea = $('pre');
    const startBtn = $('button#start');
    const stopBtn = $('button#stop');
    const autoScroll = $('#autoScroll');
    startBtn.onclick = async e => {
        const authToken = $('input#authToken').value.trim();
        const authorId = $('input#authorId').value.trim();
        const guildId = $('input#guildId').value.trim();
        const channelIds = $('input#channelId').value.trim().split(/\s*,\s*/);
        const minId = $('input#minId').value.trim();
        const maxId = $('input#maxId').value.trim();
        const minDate = $('input#minDate').value.trim();
        const maxDate = $('input#maxDate').value.trim();
        const content = $('input#content').value.trim();
        const hasLink = $('input#hasLink').checked;
        const hasFile = $('input#hasFile').checked;
        const includeNsfw = $('input#includeNsfw').checked;
        const includePinned = $('input#includePinned').checked;
        const progress = $('#progress');

        const fileSelection = $("input#file");
        fileSelection.addEventListener("change", () => {
            const files = fileSelection.files;
            const channelIdField = $('input#channelId');
            if (files.length > 0) {
                const file = files[0];
                file.text().then(text => {
                    let json = JSON.parse(text);
                    let channels = Object.keys(json);
                    channelIdField.value = channels.join(",");
                });
            }
        }, false);

        const stopHndl = () => !(stop === true || popup.closed);

        const onProg = (value, max) => {
            progress.setAttribute('max', max);
            progress.value = value;
            progress.style.display = max ? '' : 'none';
        };


        stop = stopBtn.disabled = !(startBtn.disabled = true);
        for (let i = 0; i < channelIds.length; i++) {
            await deleteMessages(authToken, authorId, guildId, channelIds[i], minId || minDate, maxId || maxDate, content, hasLink, hasFile, includeNsfw, includePinned, logger, stopHndl, onProg);
            stop = stopBtn.disabled = !(startBtn.disabled = false);
        }
    };
    stopBtn.onclick = e => stop = stopBtn.disabled = !(startBtn.disabled = false);
    $('button#clear').onclick = e => { logArea.innerHTML = ''; };
    $('button#getToken').onclick = e => {
        window.dispatchEvent(new Event('beforeunload'));
        $('input#authToken').value = JSON.parse(popup.localStorage.token);
    };
    $('button#getAuthor').onclick = e => {
        $('input#authorId').value = JSON.parse(popup.localStorage.user_id_cache);
    };
    $('button#getGuildAndChannel').onclick = e => {
        const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
        $('input#guildId').value = m[1];
        $('input#channelId').value = m[2];
    };
    $('#redact').onchange = e => {
        popup.document.body.classList.toggle('redact') &&
        popup.alert('This will attempt to hide personal information, but make sure to double check before sharing screenshots.');
    };

    const logger = (type='', args) => {
        const style = { '': '', info: 'color:#00b0f4;', verb: 'color:#72767d;', warn: 'color:#faa61a;', error: 'color:#f04747;', success: 'color:#43b581;' }[type];
        logArea.insertAdjacentHTML('beforeend', `<div style="${style}">${Array.from(args).map(o => typeof o === 'object' ?  JSON.stringify(o, o instanceof Error && Object.getOwnPropertyNames(o)) : o).join('\t')}</div>`);
        if (autoScroll.checked) logArea.querySelector('div:last-child').scrollIntoView(false);
    };

    return 'Looking good!';
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
     * @see https://github.com/victornpb/deleteDiscordMessages
     */
    async function deleteMessages(authToken, authorId, guildId, channelId, minId, maxId, content,hasLink, hasFile, includeNsfw, includePinned, extLogger, stopHndl, onProgress) {
        const start = new Date();
        let deleteDelay = 100;
        let searchDelay = 100;
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
        const ask = async msg => new Promise(resolve => setTimeout(() => resolve(popup.confirm(msg)), 10));
        const printDelayStats = () => log.verb(`Delete delay: ${deleteDelay}ms, Search delay: ${searchDelay}ms`, `Last Ping: ${lastPing}ms, Average Ping: ${avgPing|0}ms`);
        const toSnowflake = (date) => /:/.test(date) ? ((new Date(date).getTime() - 1420070400000) * Math.pow(2, 22)) : date;
            
        const log = {
            debug() { extLogger ? extLogger('debug', arguments) : console.debug.apply(console, arguments); },
            info() { extLogger ? extLogger('info', arguments) : console.info.apply(console, arguments); },
            verb() { extLogger ? extLogger('verb', arguments) : console.log.apply(console, arguments); },
            warn() { extLogger ? extLogger('warn', arguments) : console.warn.apply(console, arguments); },
            error() { extLogger ? extLogger('error', arguments) : console.error.apply(console, arguments); },
            success() { extLogger ? extLogger('success', arguments) : console.info.apply(console, arguments); },
        };

        async function recurse() {
            let API_SEARCH_URL;
            if (guildId === '@me') {
                API_SEARCH_URL = `https://discord.com/api/v6/channels/${channelId}/messages/`; // DMs
            }
            else {
                API_SEARCH_URL = `https://discord.com/api/v6/guilds/${guildId}/messages/`; // Server
            }

            const headers = {
                'Authorization': authToken
            };
            
            let resp;
            try {
                const s = Date.now();
                resp = await fetch(API_SEARCH_URL + 'search?' + queryString([
                    [ 'author_id', authorId || undefined ],
                    [ 'channel_id', (guildId !== '@me' ? channelId : undefined) || undefined ],
                    [ 'min_id', minId ? toSnowflake(minId) : undefined ],
                    [ 'max_id', maxId ? toSnowflake(maxId) : undefined ],
                    [ 'sort_by', 'timestamp' ],
                    [ 'sort_order', 'desc' ],
                    [ 'offset', offset ],
                    [ 'has', hasLink ? 'link' : undefined ],
                    [ 'has', hasFile ? 'file' : undefined ],
                    [ 'content', content || undefined ],
                    [ 'include_nsfw', includeNsfw ? true : undefined ],
                ]), { headers });
                lastPing = (Date.now() - s);
                avgPing = avgPing>0 ? (avgPing*0.9) + (lastPing*0.1) : lastPing;
            } catch (err) {
                return log.error('Search request threw an error:', err);
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
                    log.warn(`Being rate limited by the API for ${w}ms! Increasing search delay...`);
                    printDelayStats();
                    log.verb(`Cooling down for ${w * 2}ms before retrying...`);
                    
                    await wait(w*2);
                    return await recurse();
                } else {
                    return log.error(`Error searching messages, API responded with status ${resp.status}!\n`, await resp.json());
                }
            }
    
            const data = await resp.json();
            const total = data.total_results;
            if (!grandTotal) grandTotal = total;
            const discoveredMessages = data.messages.map(convo => convo.find(message => message.hit===true));
            const messagesToDelete = discoveredMessages.filter(msg => {
                return msg.type === 0 || msg.type === 6 || (msg.pinned && includePinned);
            });
            const skippedMessages = discoveredMessages.filter(msg=>!messagesToDelete.find(m=> m.id===msg.id));

            const end = () => {
                log.success(`Ended at ${new Date().toLocaleString()}! Total time: ${msToHMS(Date.now() - start.getTime())}`);
                printDelayStats();
                log.verb(`Rate Limited: ${throttledCount} times. Total time throttled: ${msToHMS(throttledTotalTime)}.`);
                log.debug(`Deleted ${delCount} messages, ${failCount} failed.\n`);
            }

            const etr = msToHMS((searchDelay * Math.round(total / 25)) + ((deleteDelay + avgPing) * total));
            log.info(`Total messages found: ${data.total_results}`, `(Messages in current page: ${data.messages.length}, To be deleted: ${messagesToDelete.length}, System: ${skippedMessages.length})`, `offset: ${offset}`);
            printDelayStats();
            log.verb(`Estimated time remaining: ${etr}`)
            
            
            if (messagesToDelete.length > 0) {

                if (++iterations < 1) {
                    log.verb(`Waiting for your confirmation...`);
                    if (!await ask(`Do you want to delete ~${total} messages?\nEstimated time: ${etr}\n\n---- Preview ----\n` +
                        messagesToDelete.map(m => `${m.author.username}#${m.author.discriminator}: ${m.attachments.length ? '[ATTACHMENTS]' : m.content}`).join('\n')))
                            return end(log.error('Aborted by you!'));
                    log.verb(`OK`);
                }
                
                for (let i = 0; i < messagesToDelete.length; i++) {
                    const message = messagesToDelete[i];
                    if (stopHndl && stopHndl()===false) return end(log.error('Stopped by you!'));

                    log.debug(`${((delCount + 1) / grandTotal * 100).toFixed(2)}% (${delCount + 1}/${grandTotal})`,
                        `Deleting ID:${redact(message.id)} <b>${redact(message.author.username+'#'+message.author.discriminator)} <small>(${redact(new Date(message.timestamp).toLocaleString())})</small>:</b> <i>${redact(message.content).replace(/\n/g,'↵')}</i>`,
                        message.attachments.length ? redact(JSON.stringify(message.attachments)) : '');
                    if (onProgress) onProgress(delCount + 1, grandTotal);
                    
                    let resp;
                    try {
                        const s = Date.now();
                        const API_DELETE_URL = `https://discord.com/api/v6/channels/${message.channel_id}/messages/${message.id}`;
                        resp = await fetch(API_DELETE_URL, {
                            headers,
                            method: 'DELETE'
                        });
                        lastPing = (Date.now() - s);
                        avgPing = (avgPing*0.9) + (lastPing*0.1);
                        delCount++;
                    } catch (err) {
                        log.error('Delete request throwed an error:', err);
                        log.verb('Related object:', redact(JSON.stringify(message)));
                        failCount++;
                    }

                    if (!resp.ok) {
                        // deleting messages too fast
                        if (resp.status === 429) {
                            const w = (await resp.json()).retry_after;
                            throttledCount++;
                            throttledTotalTime += w;
                            deleteDelay = w; // increase delay
                            log.warn(`Being rate limited by the API for ${w}ms! Adjusted delete delay to ${deleteDelay}ms.`);
                            printDelayStats();
                            log.verb(`Cooling down for ${w*2}ms before retrying...`);
                            await wait(w*2);
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
                
                log.verb(`Searching next messages in ${searchDelay}ms...`, (offset ? `(offset: ${offset})` : '') );
                await wait(searchDelay);

                if (stopHndl && stopHndl()===false) return end(log.error('Stopped by you!'));

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
})();

//END.
