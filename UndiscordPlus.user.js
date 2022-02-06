// ==UserScript==
// @name          Undiscord+
// @description   Wipe your Discord messages fast and easy
// @author        https://github.com/abbydiode
// @namespace     https://github.com/abbydiode/UndiscordPlus
// @version       5.1.4
// @match         https://*.discord.com/*
// @downloadURL   https://raw.githubusercontent.com/abbydiode/undiscordPlus/main/UndiscordPlus.user.js
// @homepageURL   https://github.com/abbydiode/UndiscordPlus
// @supportURL    https://github.com/abbydiode/UndiscordPlus/issues
// @license       MIT
// ==/UserScript==

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
 * @param {boolean} includeNSFW Search in NSFW channels
 * @param {boolean} ascendingOrder Search in ascending order
 * @param {function(string, Array)} extLogger Function for logging
 * @param {function} stopHndl stopHndl used for stopping
 * @author abbydiode <https://www.github.com/abbydiode>
 * @see https://github.com/abbydiode/UndiscordPlus
 */
async function deleteMessages(authToken, authorId, guildId, channelId, minId, maxId, content, hasLink, hasFile, includeNSFW, ascendingOrder, includePinned, searchDelay, deleteDelay, extLogger, stopHndl, onProgress) {
    const start = new Date();
    let deleteCount = 0;
    let failCount = 0;
    let averagePing;
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
    const printDelayStats = () => log.verb(`Delete delay: ${deleteDelay}ms, Search delay: ${searchDelay}ms`, `Last Ping: ${lastPing}ms, Average Ping: ${averagePing | 0}ms`);
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
            API_SEARCH_URL = `https://discord.com/api/v9/channels/${channelId}/messages/`;
        }
        else {
            API_SEARCH_URL = `https://discord.com/api/v9/guilds/${guildId}/messages/`;
        }

        const headers = {
            'Authorization': authToken
        };

        let response;
        try {
            const s = Date.now();
            response = await fetch(API_SEARCH_URL + 'search?' + queryString([
                ['author_id', authorId || undefined],
                ['channel_id', (guildId !== '@me' ? channelId : undefined) || undefined],
                ['min_id', minId ? toSnowflake(minId) : undefined],
                ['max_id', maxId ? toSnowflake(maxId) : undefined],
                ['sort_by', 'timestamp'],
                ['sort_order', ascendingOrder ? 'asc' : 'desc'],
                ['offset', offset],
                ['has', hasLink ? 'link' : undefined],
                ['has', hasFile ? 'file' : undefined],
                ['content', content || undefined],
                ['include_nsfw', includeNSFW ? true : undefined],
            ]), { headers });
            lastPing = (Date.now() - s);
            averagePing = averagePing > 0 ? (averagePing * 0.9) + (lastPing * 0.1) : lastPing;
        } catch (err) {
            return log.error('Search request threw an error:', err);
        }

        // Not indexed yet
        if (response.status === 202) {
            const w = (await response.json()).retry_after * 1000;
            throttledCount++;
            throttledTotalTime += w;
            log.warn(`This channel wasn't indexed, waiting ${w}ms for discord to index it...`);
            await wait(w);
            return await recurse();
        }

        if (!response.ok) {
            // Searching messages too fast
            if (response.status === 429) {
                const delay = (await response.json()).retry_after;
                throttledCount++;
                throttledTotalTime += delay;
                searchDelay += delay;
                log.warn(`Being rate limited by the API for ${delay}ms! Increasing search delay...`);
                printDelayStats();
                log.verb(`Cooling down for ${delay * 2}ms before retrying...`);

                await wait(delay * 2);
                return await recurse();
            } else {
                return log.error(`Error searching messages, API responded with status ${response.status}!\n`, await response.json());
            }
        }

        const data = await response.json();
        const total = data.total_results;
        if (!grandTotal) grandTotal = total;
        const discoveredMessages = data.messages.map(convo => convo.find(message => message.hit === true));
        const messagesToDelete = discoveredMessages.filter(msg => {
            return msg.type === 0 || (msg.type >= 6 && msg.type <= 21) || (msg.pinned && includePinned);
        });
        const skippedMessages = discoveredMessages.filter(msg => !messagesToDelete.find(m => m.id === msg.id));

        const end = () => {
            log.success(`Ended at ${new Date().toLocaleString()}! Total time: ${msToHMS(Date.now() - start.getTime())}`);
            printDelayStats();
            log.verb(`Rate Limited: ${throttledCount} times. Total time throttled: ${msToHMS(throttledTotalTime)}.`);
            log.debug(`Deleted ${deleteCount} messages, ${failCount} failed.\n`);
        }

        const estimatedTimeRemaining = msToHMS((searchDelay * Math.round(total / 25)) + ((deleteDelay + averagePing) * total));
        log.info(`Total messages found: ${data.total_results}`, `(Messages in current page: ${data.messages.length}, To be deleted: ${messagesToDelete.length}, System: ${skippedMessages.length})`, `offset: ${offset}`);
        printDelayStats();
        log.verb(`Estimated time remaining: ${estimatedTimeRemaining}`)


        if (messagesToDelete.length > 0) {

            if (++iterations < 1) {
                log.verb(`Waiting for your confirmation...`);
                if (!await ask(`Do you want to delete ~${total} messages?\nEstimated time: ${estimatedTimeRemaining}\n\n---- Preview ----\n` +
                    messagesToDelete.map(m => `${m.author.username}#${m.author.discriminator}: ${m.attachments.length ? '[ATTACHMENTS]' : m.content}`).join('\n')))
                    return end(log.error('Aborted by you!'));
                log.verb(`OK`);
            }

            for (let i = 0; i < messagesToDelete.length; i++) {
                const message = messagesToDelete[i];
                if (stopHndl && stopHndl() === false) return end(log.error('Stopped by you!'));

                log.debug(`${((deleteCount + 1) / grandTotal * 100).toFixed(2)}% (${deleteCount + 1}/${grandTotal})`,
                    `Deleting ID:${redact(message.id)} <b>${redact(message.author.username + '#' + message.author.discriminator)} <small>(${redact(new Date(message.timestamp).toLocaleString())})</small>:</b> <i>${redact(message.content).replace(/\n/g, '↵')}</i>`,
                    message.attachments.length ? redact(JSON.stringify(message.attachments)) : '');
                if (onProgress) onProgress(deleteCount + 1, grandTotal);

                let resp;
                try {
                    const s = Date.now();
                    const API_DELETE_URL = `https://discord.com/api/v9/channels/${message.channel_id}/messages/${message.id}`;
                    resp = await fetch(API_DELETE_URL, {
                        headers,
                        method: 'DELETE'
                    });
                    lastPing = (Date.now() - s);
                    averagePing = (averagePing * 0.9) + (lastPing * 0.1);
                    deleteCount++;
                } catch (err) {
                    log.error('Delete request threw an error:', err);
                    log.verb('Related object:', redact(JSON.stringify(message)));
                    failCount++;
                }

                if (!resp.ok) {
                    // Deleting messages too fast
                    if (resp.status === 429) {
                        const w = (await resp.json()).retry_after;
                        throttledCount++;
                        throttledTotalTime += w;
                        deleteDelay = w;
                        log.warn(`Being rate limited by the API for ${w}ms! Adjusted delete delay to ${deleteDelay}ms.`);
                        printDelayStats();
                        log.verb(`Cooling down for ${w * 2}ms before retrying...`);
                        await wait(w * 2);
                        i--;
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

            if (stopHndl && stopHndl() === false) return end(log.error('Stopped by you!'));

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

let popup;
let button;
let stop;

function initializeUI() {

    const insertCSS = (css) => {
        const style = document.createElement('style');
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
        return style;
    }

    const createElement = (html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.removeChild(temp.firstElementChild);
    }

    /*css*/
    insertCSS(`
        #undicord-btn{position: relative; height: 24px;width: auto;-webkit-box-flex: 0;-ms-flex: 0 0 auto;flex: 0 0 auto;margin: 0 8px;cursor:pointer; color: var(--interactive-normal);}
        #undiscord{position:fixed;top:100px;right:10px;bottom:10px;width:780px;z-index:99;color:var(--text-normal);background-color:var(--background-secondary);box-shadow:var(--elevation-stroke),var(--elevation-high);border-radius:4px;display:flex;flex-direction:column}
        #undiscord a{color:#00b0f4}
        #undiscord.redact .priv{display:none!important}
        #undiscord:not(.redact) .mask{display:none!important}
        #undiscord.redact [priv]{-webkit-text-security:disc!important}
        #undiscord .toolbar span{margin-right:8px}
        #undiscord button,#undiscord .btn{color:#fff;background:#7289da;border:0;border-radius:4px;font-size:14px}
        #undiscord button:disabled{display:none}
        #undiscord input[type="text"],#undiscord input[type="search"],#undiscord input[type="password"],#undiscord input[type="datetime-local"],#undiscord input[type="number"]{background-color:#202225;color:#b9bbbe;border-radius:4px;border:0;padding:0 .5em;height:24px;width:144px;margin:2px}
        #undiscord input#file{display:none}
        #undiscord hr{border-color:rgba(255,255,255,0.1)}
        #undiscord .header{padding:12px 16px;background-color:var(--background-tertiary);color:var(--text-muted)}
        #undiscord .form{padding:8px;background:var(--background-secondary);box-shadow:0 1px 0 rgba(0,0,0,.2),0 1.5px 0 rgba(0,0,0,.05),0 2px 0 rgba(0,0,0,.05)}
        #undiscord .logarea{overflow:auto;font-size:.75rem;font-family:Consolas,Liberation Mono,Menlo,Courier,monospace;flex-grow:1;padding:10px}
    `);

    /*html*/
    popup = createElement(`
        <div id="undiscord" style="display:none;">
            <div class="header">
                Undiscord+
            </div>
            <div class="form">
                <div style="display:flex;flex-wrap:wrap;">
                    <span>Authorization <a
                            href="https://github.com/abbydiode/UndiscordPlus/wiki/Authorization-Tokens" title="Help"
                            target="_blank">?</a> <button id="getToken">Get</button><br>
                        <input type="password" id="authToken" placeholder="Auth Token" autofocus>*<br>
                        <span>Author <a href="https://github.com/abbydiode/UndiscordPlus/wiki/User-IDs"
                                title="Help" target="_blank">?</a> <button id="getAuthor">Get</button></span>
                        <br><input id="authorId" type="text" placeholder="Author ID" priv></span>
                    <span>Guild/Channel <a
                            href="https://github.com/abbydiode/UndiscordPlus/wiki/Guild-and-Channel-IDs" title="Help"
                            target="_blank">?</a>
                        <button id="getGuildAndChannel">Get</button><br>
                        <input id="guildId" type="text" placeholder="Guild ID" priv><br>
                        <input id="channelId" type="text" placeholder="Channel ID" priv><br>
                        <label><input id="includeNsfw" type="checkbox" checked>NSFW Channel</label><br><br>
                        <label for="file" title="Import list of channels from messages/index.json file"> Import: <span
                                class="btn">...</span> <input id="file" type="file" accept="application/json,.json"></label>
                    </span><br>
                    <span>Range <a href="https://github.com/abbydiode/UndiscordPlus/wiki/Message-IDs"
                            title="Help" target="_blank">?</a><br>
                        <input id="minDate" type="datetime-local" title="After" style="width:auto;"><br>
                        <input id="maxDate" type="datetime-local" title="Before" style="width:auto;"><br>
                        <input id="minId" type="text" placeholder="After message with Id" priv><br>
                        <input id="maxId" type="text" placeholder="Before message with Id" priv><br>
                    </span>
                    <span>Search messages <a
                            href="https://github.com/abbydiode/UndiscordPlus/wiki/Filtering-Messages" title="Help"
                            target="_blank">?</a><br>
                        <input id="content" type="text" placeholder="Containing text" priv><br>
                        <label><input id="hasLink" type="checkbox">Has Link</label><br>
                        <label><input id="hasFile" type="checkbox">Has File</label><br>
                        <label><input id="includePinned" type="checkbox">Include Pinned</label><br>
                        <label><input id="ascendingOrder" type="checkbox">Date Ascending</label>
                    </span><br>
                    <span>Search Delay <a
                    href="https://github.com/abbydiode/UndiscordPlus/wiki/About-Delays" title="Help"
                    target="_blank">?</a><br>
                        <input id="searchDelay" type="number" value="100" step="100"><br>
                    </span>
                    <span>Delete Delay <a
                    href="https://github.com/abbydiode/UndiscordPlus/wiki/About-Delays" title="Help"
                    target="_blank">?</a><br>
                        <input id="deleteDelay" type="number" value="1000" step="100">
                    </span>
                </div>
                <hr>
                <button id="start" style="background:#43b581;width:80px;">Start</button>
                <button id="stop" style="background:#f04747;width:80px;" disabled>Stop</button>
                <button id="clear" style="width:80px;">Clear log</button>
                <label><input id="autoScroll" type="checkbox" checked>Auto scroll</label>
                <label title="Hide sensitive information for taking screenshots"><input id="redact" type="checkbox">Screenshot
                    mode</label>
                <progress id="progress" style="display:none;"></progress> <span class="percent"></span>
            </div>
            <pre class="logarea">
                <a href="https://github.com/abbydiode/UndiscordPlus/issues" target="_blank" style="text-align:center">Report an issue</a>
            </pre>
        </div>
    `);

    document.body.appendChild(popup);

    /*html*/
    button = createElement(`
        <div id="undicord-btn" tabindex="0" role="button" aria-label="Delete Messages" title="Delete Messages">
        <svg aria-hidden="false" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"></path>
            <path fill="currentColor" d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"></path>
        </svg>
        <br><progress style="display:none; width:24px;"></progress>
        </div>
    `);

    button.onclick = function togglePopover() {
        if (popup.style.display !== 'none') {
            popup.style.display = 'none';
            button.style.color = 'var(--interactive-normal)';
        }
        else {
            popup.style.display = '';
            button.style.color = '#f04747';
        }
    };

    function mountButton() {
        const toolbar = document.querySelector('[class^=toolbar]');
        if (toolbar) toolbar.appendChild(button);
    }

    const observer = new MutationObserver(function (_mutationsList, _observer) {
        if (!document.body.contains(button)) mountButton();
    });
    observer.observe(document.body, { attributes: false, childList: true, subtree: true });

    mountButton();

    const $ = s => popup.querySelector(s);
    const logArea = $('pre');
    const startButton = $('button#start');
    const stopButton = $('button#stop');
    const autoScroll = $('#autoScroll');

    startButton.onclick = async _ => {
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
        const ascendingOrder = $('input#ascendingOrder').checked;
        const searchDelay = parseInt($('input#searchDelay').value.trim());
        const deleteDelay = parseInt($('input#deleteDelay').value.trim());
        const progress = $('#progress');
        const progress2 = button.querySelector('progress');
        const percent = $('.percent');

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

        const stopHandle = () => !(stop === true);

        const onProgress = (value, max) => {
            if (value && max && value > max) max = value;
            progress.setAttribute('max', max);
            progress.value = value;
            progress.style.display = max ? '' : 'none';
            progress2.setAttribute('max', max);
            progress2.value = value;
            progress2.style.display = max ? '' : 'none';
            percent.innerHTML = value && max ? Math.round(value / max * 100) + '%' : '';
        };


        stop = stopButton.disabled = !(startButton.disabled = true);
        for (let i = 0; i < channelIds.length; i++) {
            await deleteMessages(authToken, authorId, guildId, channelIds[i], minId || minDate, maxId || maxDate, content, hasLink, hasFile, includeNsfw, ascendingOrder, includePinned, searchDelay, deleteDelay, logger, stopHandle, onProgress);
            stop = stopButton.disabled = !(startButton.disabled = false);
        }
    };
    stopButton.onclick = _ => stop = stopButton.disabled = !(startButton.disabled = false);
    $('button#clear').onclick = _ => { logArea.innerHTML = ''; };
    $('button#getToken').onclick = _ => {
        window.dispatchEvent(new Event('beforeunload'));
        const ls = document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage;
        $('input#authToken').value = JSON.parse(localStorage.token);
    };
    $('button#getAuthor').onclick = _ => {
        $('input#authorId').value = JSON.parse(localStorage.user_id_cache);
    };
    $('button#getGuildAndChannel').onclick = _ => {
        const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
        $('input#guildId').value = m[1];
        $('input#channelId').value = m[2];
    };
    $('#redact').onchange = _ => {
        popup.classList.toggle('redact') &&
            window.alert('This will attempt to hide personal information, but make sure to double check before sharing screenshots.');
    };

    const logger = (type = '', args) => {
        const style = { '': '', info: 'color:#00b0f4;', verb: 'color:#72767d;', warn: 'color:#faa61a;', error: 'color:#f04747;', success: 'color:#43b581;' }[type];
        logArea.insertAdjacentHTML('beforeend', `<div style="${style}">${Array.from(args).map(o => typeof o === 'object' ? JSON.stringify(o, o instanceof Error && Object.getOwnPropertyNames(o)) : o).join('\t')}</div>`);
        if (autoScroll.checked) logArea.querySelector('div:last-child').scrollIntoView(false);
    };

    window.localStorage = document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage;
}

initializeUI();
