// ==UserScript==
// @name            Undiscord
// @description     Delete all messages in a Discord channel or DM (Bulk deletion)
// @version         5.3.4
// @author          victornpb (https://github.com/victornpb), TheCellMaster (https://github.com/TheCellMaster)
// @homepageURL     https://github.com/victornpb/undiscord
// @supportURL      https://github.com/victornpb/undiscord/discussions
// @match           https://*.discord.com/app
// @match           https://*.discord.com/channels/*
// @match           https://*.discord.com/login
// @license         MIT
// @namespace       https://github.com/victornpb/deleteDiscordMessages
// @icon            https://victornpb.github.io/undiscord/images/icon128.png
// @downloadURL     https://raw.githubusercontent.com/victornpb/undiscord/master/deleteDiscordMessages.user.js
// @contributionURL https://www.buymeacoffee.com/vitim
// @grant           none
// @attribution     Original project (https://github.com/victornpb/undiscord)
// ==/UserScript==
(function () {
	'use strict';

	/* rollup-plugin-baked-env */
	const VERSION = "5.3.4";

	var layoutCss = (`
/**** Undiscord Button ****/
#undicord-btn { position: relative; width: auto; height: 24px; margin: 0 8px; cursor: pointer; color: var(--interactive-icon-default, var(--interactive-normal)); flex: 0 0 auto; }
#undicord-btn progress { position: absolute; top: 23px; left: -4px; width: 32px; height: 12px; display: none; }
#undicord-btn.running { color: var(--control-critical-primary-background-default, var(--button-danger-background)) !important; }
#undicord-btn.running progress { display: block; }
/**** Undiscord Interface ****/
#undiscord { position: fixed; z-index: 100; top: 58px; right: 10px; display: flex; flex-direction: column; width: 800px; height: 80vh; min-width: 610px; max-width: 100vw; min-height: 448px; max-height: 100vh; color: var(--text-default, var(--text-normal)); border-radius: 4px; background-color: var(--background-surface-high, var(--background-secondary)); box-shadow: var(--elevation-stroke), var(--elevation-high); will-change: top, left, width, height; }
#undiscord .header .icon { cursor: pointer; }
#undiscord .window-body { height: calc(100% - 48px); }
#undiscord .sidebar { overflow: hidden scroll; overflow-y: auto; width: 270px; min-width: 250px; height: 100%; max-height: 100%; padding: 8px; background: var(--bg-overlay-4, var(--background-base-lowest)); }
#undiscord .sidebar legend,
#undiscord .sidebar label { display: block; width: 100%; }
#undiscord .main { display: flex; max-width: calc(100% - 250px); background-color: var(--bg-overlay-chat, var(--background-base-lower)); flex-grow: 1; }
#undiscord.hide-sidebar .sidebar { display: none; }
#undiscord.hide-sidebar .main { max-width: 100%; }
#undiscord #logArea { font-family: Consolas, Liberation Mono, Menlo, Courier, monospace; font-size: 0.75rem; overflow: auto; padding: 10px; user-select: text; flex-grow: 1; cursor: auto; }
#undiscord .tbar { padding: 8px; background-color: var(--bg-overlay-2, var(--__header-bar-background)); }
#undiscord .tbar button { margin-right: 4px; margin-bottom: 4px; }
#undiscord .footer { cursor: se-resize; padding-right: 30px; }
#undiscord .footer #progressPercent { padding: 0 1em; font-size: small; color: var(--interactive-muted, var(--text-muted)); flex-grow: 1; }
#undiscord .resize-handle { position: absolute; bottom: -15px; right: -15px; width: 30px; height: 30px; transform: rotate(-45deg); background: repeating-linear-gradient(0, var(--background-mod-subtle, var(--background-modifier-accent)), var(--background-mod-subtle, var(--background-modifier-accent)) 1px, transparent 2px, transparent 4px); cursor: nwse-resize; }
/**** Layout utilities ****/
#undiscord,
#undiscord * { box-sizing: border-box; }
#undiscord .col { display: flex; flex-direction: column; }
#undiscord .row { display: flex; flex-direction: row; align-items: center; }
#undiscord .mb1 { margin-bottom: 8px; }

`);

	var componentsCss = (`
/* undiscord window frame */
#undiscord.browser { box-shadow: var(--shadow-border), var(--shadow-high); border: 1px solid var(--border-subtle); overflow: hidden; }
#undiscord.container,
#undiscord .container { background-color: var(--background-surface-high, var(--background-secondary)); border-radius: 8px; box-sizing: border-box; cursor: default; flex-direction: column; }
/* header */
#undiscord .header { background-color: var(--background-base-lowest, var(--background-tertiary)); height: 48px; align-items: center; min-height: 48px; padding: 0 16px; display: flex; color: var(--text-muted, var(--header-secondary)); cursor: grab; }
#undiscord .header .icon { color: var(--interactive-icon-default, var(--interactive-normal)); margin-right: 8px; flex-shrink: 0; width: 24px; height: 24px; }
#undiscord .header .icon:hover { color: var(--interactive-icon-hover, var(--interactive-hover)); }
#undiscord .header h3 { font-size: 16px; line-height: 20px; font-weight: 500; font-family: var(--font-display); color: var(--text-default, var(--header-primary)); flex-shrink: 0; margin-right: 16px; }
#undiscord .spacer { flex-grow: 1; }
#undiscord .header .vert-divider { width: 1px; height: 24px; background-color: var(--background-mod-subtle, var(--background-modifier-accent)); margin-right: 16px; flex-shrink: 0; }
/* labels and legends */
#undiscord legend,
#undiscord label { color: var(--text-muted, var(--header-secondary)); font-size: 12px; line-height: 16px; font-weight: 500; text-transform: uppercase; cursor: default; font-family: var(--font-display); margin-bottom: 8px; }
/* inputs */
#undiscord .multiInput { display: flex; align-items: center; font-size: 16px; box-sizing: border-box; width: 100%; border-radius: 3px; color: var(--text-default, var(--text-normal)); background-color: var(--input-background-default, var(--input-background)); border: none; transition: border-color 0.2s ease-in-out 0s; }
#undiscord .multiInput :first-child { flex-grow: 1; }
#undiscord .multiInput button:last-child { margin-right: 4px; }
#undiscord .input { font-size: 16px; width: 100%; transition: border-color 0.2s ease-in-out 0s; padding: 10px; height: 44px; background-color: var(--input-background-default, var(--input-background)); border: 1px solid var(--input-border-default, var(--input-border)); border-radius: 8px; box-sizing: border-box; color: var(--text-default, var(--text-normal)); }
#undiscord fieldset { margin-top: 16px; }
#undiscord .input-wrapper { display: flex; align-items: center; font-size: 16px; box-sizing: border-box; width: 100%; border-radius: 3px; color: var(--text-default, var(--text-normal)); background-color: var(--input-background-default, var(--input-background)); border: none; transition: border-color 0.2s ease-in-out 0s; }
#undiscord input[type="text"],
#undiscord input[type="search"],
#undiscord input[type="password"],
#undiscord input[type="datetime-local"],
#undiscord input[type="number"],
#undiscord input[type="range"] { background-color: var(--input-background-default, var(--input-background)); border: 1px solid var(--input-border-default, var(--input-border)); border-radius: 8px; box-sizing: border-box; color: var(--text-default, var(--text-normal)); font-size: 16px; height: 44px; padding: 12px 10px; transition: border-color .2s ease-in-out; width: 100%; }
/* dividers */
#undiscord .divider,
#undiscord hr { border: none; margin-bottom: 24px; padding-bottom: 4px; border-bottom: 1px solid var(--background-mod-subtle, var(--background-modifier-accent)); }
#undiscord .sectionDescription { margin-bottom: 16px; color: var(--text-muted, var(--header-secondary)); font-size: 14px; line-height: 20px; font-weight: 400; }
#undiscord a { color: var(--text-link, var(--link)); text-decoration: none; }
/* buttons */
#undiscord .btn,
#undiscord button { position: relative; display: flex; justify-content: center; align-items: center; box-sizing: border-box; background: none; border: none; border-radius: 3px; font-size: 14px; font-weight: 500; line-height: 16px; padding: 2px 16px; user-select: none; width: 60px; height: 32px; min-width: 60px; min-height: 32px; color: rgb(255, 255, 255); background-color: var(--control-secondary-background-default, var(--button-secondary-background)); }
#undiscord .sizeMedium { width: 96px; height: 38px; min-width: 96px; min-height: 38px; }
#undiscord .sizeMedium.icon { width: 38px; min-width: 38px; }
#undiscord sup { vertical-align: top; }
#undiscord .accent { background-color: var(--background-brand, var(--brand-experiment)); }
#undiscord .danger { background-color: var(--control-critical-primary-background-default, var(--button-danger-background)); }
#undiscord .positive { background-color: var(--status-positive-background, var(--button-positive-background)); }
#undiscord .info { font-size: 12px; line-height: 16px; padding: 8px 10px; color: var(--text-muted, var(--header-secondary)); }
#undiscord :disabled { display: none; }
/* summary / details */
#undiscord summary { font-size: 16px; font-weight: 500; line-height: 20px; position: relative; overflow: hidden; margin-bottom: 2px; padding: 6px 10px; cursor: pointer; white-space: nowrap; text-overflow: ellipsis; color: var(--interactive-icon-default, var(--interactive-normal)); border-radius: 4px; flex-shrink: 0; }
#undiscord fieldset { padding-left: 8px; }
#undiscord legend a { float: right; text-transform: initial; }
#undiscord progress { height: 8px; margin-top: 4px; flex-grow: 1; }
#undiscord .importJson { display: flex; flex-direction: row; }
#undiscord .importJson button { margin-left: 5px; width: fit-content; }

`);

	var scrollbarCss = (`
#undiscord .scroll::-webkit-scrollbar { width: 8px; height: 8px; }
#undiscord .scroll::-webkit-scrollbar-corner { background-color: transparent; }
#undiscord .scroll::-webkit-scrollbar-thumb { background-clip: padding-box; border: 2px solid transparent; border-radius: 4px; background-color: var(--scrollbar-thin-thumb); min-height: 40px; }
#undiscord .scroll::-webkit-scrollbar-track { border-color: var(--scrollbar-thin-track); background-color: var(--scrollbar-thin-track); border: 2px solid var(--scrollbar-thin-track); }
/* fade scrollbar when not hovering */
#undiscord .scroll::-webkit-scrollbar-thumb,
#undiscord .scroll::-webkit-scrollbar-track { visibility: hidden; }
#undiscord .scroll:hover::-webkit-scrollbar-thumb,
#undiscord .scroll:hover::-webkit-scrollbar-track { visibility: visible; }

`);

	var redactCss = (`
/**** Streamer mode (redact) ****/
#undiscord.redact .priv { display: none !important; }
#undiscord.redact x:not(:active) { color: transparent !important; background-color: var(--background-surface-high, var(--primary-700)) !important; cursor: default; user-select: none; }
#undiscord.redact x:hover { position: relative; }
#undiscord.redact x:hover::after { content: "Redacted information (Streamer mode: ON)"; position: absolute; display: inline-block; top: -32px; left: -20px; padding: 4px; width: 150px; font-size: 8pt; text-align: center; white-space: pre-wrap; background-color: var(--background-surface-highest, var(--background-floating)); -webkit-box-shadow: var(--elevation-high); box-shadow: var(--elevation-high); color: var(--text-default, var(--text-normal)); border-radius: 5px; pointer-events: none; }
#undiscord.redact [priv] { -webkit-text-security: disc !important; }

`);

	var logCss = (`
#undiscord .log { margin-bottom: 0.25em; }
#undiscord .log-debug { color: inherit; }
#undiscord .log-info { color: #00b0f4; }
#undiscord .log-verb { color: #72767d; }
#undiscord .log-warn { color: #faa61a; }
#undiscord .log-error { color: #f04747; }
#undiscord .log-success { color: #43b581; }

`);

	var dragCss = (`
#undiscord [name^="grab-"] { position: absolute; --size: 6px; --corner-size: 16px; --offset: -1px; z-index: 9; }
#undiscord [name^="grab-"]:hover{ background: rgba(128,128,128,0.1); }
#undiscord [name="grab-t"] { top: 0px; left: var(--corner-size); right: var(--corner-size); height: var(--size); margin-top: var(--offset); cursor: ns-resize; }
#undiscord [name="grab-r"] { top: var(--corner-size); bottom: var(--corner-size); right: 0px; width: var(--size); margin-right: var(--offset); cursor: ew-resize; }
#undiscord [name="grab-b"] { bottom: 0px; left: var(--corner-size); right: var(--corner-size); height: var(--size); margin-bottom: var(--offset); cursor: ns-resize; }
#undiscord [name="grab-l"] { top: var(--corner-size); bottom: var(--corner-size); left: 0px; width: var(--size); margin-left: var(--offset); cursor: ew-resize; }
#undiscord [name="grab-tl"] { top: 0px; left: 0px; width: var(--corner-size); height: var(--corner-size); margin-top: var(--offset); margin-left: var(--offset); cursor: nwse-resize; }
#undiscord [name="grab-tr"] { top: 0px; right: 0px; width: var(--corner-size); height: var(--corner-size); margin-top: var(--offset); margin-right: var(--offset); cursor: nesw-resize; }
#undiscord [name="grab-br"] { bottom: 0px; right: 0px; width: var(--corner-size); height: var(--corner-size); margin-bottom: var(--offset); margin-right: var(--offset); cursor: nwse-resize; }
#undiscord [name="grab-bl"] { bottom: 0px; left: 0px; width: var(--corner-size); height: var(--corner-size); margin-bottom: var(--offset); margin-left: var(--offset); cursor: nesw-resize; }

`);

	var buttonHtml = (`
<div id="undicord-btn" tabindex="0" role="button" aria-label="Delete Messages" title="Delete Messages with Undiscord">
    <svg aria-hidden="false" width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"></path>
        <path fill="currentColor" d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"></path>
    </svg>
    <progress></progress>
</div>
`);

	var undiscordTemplate = (`
<div id="undiscord" class="browser container redact" style="display:none;">
    <div class="header">
        <svg class="icon" aria-hidden="false" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"></path>
            <path fill="currentColor"
                d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z">
            </path>
        </svg>
        <h3>Undiscord</h3>
        <div class="vert-divider"></div>
        <span> Bulk delete messages</span>
        <div class="spacer"></div>
        <div id="hide" class="icon" aria-label="Close" role="button" tabindex="0">
            <svg aria-hidden="false" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor"
                    d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z">
                </path>
            </svg>
        </div>
    </div>
    <div class="window-body" style="display: flex; flex-direction: row;">
        <div class="sidebar scroll">
            <details open>
                <summary>General</summary>
                <fieldset>
                    <legend>
                        Author ID
                        <a href="{{WIKI}}/authorId" title="Help" target="_blank" rel="noopener noreferrer">help</a>
                    </legend>
                    <div class="multiInput">
                        <div class="input-wrapper">
                            <input class="input" id="authorId" type="text" priv>
                        </div>
                        <button id="getAuthor">me</button>
                    </div>
                </fieldset>
                <hr>
                <fieldset>
                    <legend>
                        Server ID
                        <a href="{{WIKI}}/guildId" title="Help" target="_blank" rel="noopener noreferrer">help</a>
                    </legend>
                    <div class="multiInput">
                        <div class="input-wrapper">
                            <input class="input" id="guildId" type="text" priv>
                        </div>
                        <button id="getGuild">current</button>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        Channel ID
                        <a href="{{WIKI}}/channelId" title="Help" target="_blank" rel="noopener noreferrer">help</a>
                    </legend>
                    <div class="multiInput mb1">
                        <div class="input-wrapper">
                            <input class="input" id="channelId" type="text" priv>
                        </div>
                        <button id="getChannel">current</button>
                    </div>
                    <div class="sectionDescription">
                        <label class="row"><input id="includeNsfw" type="checkbox">This is a NSFW channel</label>
                    </div>
                </fieldset>
            </details>
            <details>
                <summary>Wipe Archive</summary>
                <fieldset>
                    <legend>
                        Import index.json
                        <a href="{{WIKI}}/importJson" title="Help" target="_blank" rel="noopener noreferrer">help</a>
                    </legend>
                    <div class="input-wrapper">
                        <input type="file" id="importJsonInput" accept="application/json,.json" style="width:100%">
                    </div>
                    <div class="sectionDescription">
                        <br>
                        After requesting your data from discord, you can import it here.<br>
                        Select the "messages/index.json" file from the discord archive.
                    </div>
                </fieldset>
            </details>
            <hr>
            <details>
                <summary>Filter</summary>
                <fieldset>
                    <legend>
                        Search
                        <a href="{{WIKI}}/filters" title="Help" target="_blank" rel="noopener noreferrer">help</a>
                    </legend>
                    <div class="input-wrapper">
                        <input id="search" type="text" placeholder="Containing text" priv>
                    </div>
                    <div class="sectionDescription">
                        Only delete messages that contain the text
                    </div>
                    <div class="sectionDescription">
                        <label><input id="hasLink" type="checkbox">has: link</label>
                    </div>
                    <div class="sectionDescription">
                        <label><input id="hasFile" type="checkbox">has: file</label>
                    </div>
                    <div class="sectionDescription">
                        <label><input id="includePinned" type="checkbox">Include pinned</label>
                    </div>
                    <div class="sectionDescription">
                        <label><input id="includeApplications" type="checkbox" checked>Include bot/application messages</label>
                    </div>
                </fieldset>
                <hr>
                <fieldset>
                    <legend>
                        Pattern
                        <a href="{{WIKI}}/pattern" title="Help" target="_blank" rel="noopener noreferrer">help</a>
                    </legend>
                    <div class="sectionDescription">
                        Delete messages that match the regular expression
                    </div>
                    <div class="input-wrapper">
                        <span class="info">/</span>
                        <input id="pattern" type="text" placeholder="regular expression" priv>
                        <span class="info">/</span>
                    </div>
                </fieldset>
            </details>
            <details>
                <summary>Messages interval</summary>
                <fieldset>
                    <legend>
                        Interval of messages
                        <a href="{{WIKI}}/messageId" title="Help" target="_blank" rel="noopener noreferrer">help</a>
                    </legend>
                    <div class="multiInput mb1">
                        <div class="input-wrapper">
                            <input id="minId" type="text" placeholder="After a message" priv>
                        </div>
                        <button id="pickMessageAfter">Pick</button>
                    </div>
                    <div class="multiInput">
                        <div class="input-wrapper">
                            <input id="maxId" type="text" placeholder="Before a message" priv>
                        </div>
                        <button id="pickMessageBefore">Pick</button>
                    </div>
                    <div class="sectionDescription">
                        Specify an interval to delete messages.
                    </div>
                </fieldset>
            </details>
            <details>
                <summary>Date interval</summary>
                <fieldset>
                    <legend>
                        After date
                        <a href="{{WIKI}}/dateRange" title="Help" target="_blank" rel="noopener noreferrer">help</a>
                    </legend>
                    <div class="input-wrapper mb1">
                        <input id="minDate" type="datetime-local" title="Messages posted AFTER this date">
                    </div>
                    <legend>
                        Before date
                        <a href="{{WIKI}}/dateRange" title="Help" target="_blank" rel="noopener noreferrer">help</a>
                    </legend>
                    <div class="input-wrapper">
                        <input id="maxDate" type="datetime-local" title="Messages posted BEFORE this date">
                    </div>
                    <div class="sectionDescription">
                        Delete messages that were posted between the two dates.
                        Make sure you enter both a date AND time, otherwise the filter will not work.
                    </div>
                    <div class="sectionDescription">
                        * Filtering by date doesn't work if you use the "Messages interval".
                    </div>
                </fieldset>
            </details>
            <hr>
            <details>
                <summary>Advanced settings</summary>
                <fieldset>
                    <legend>
                        Search delay
                        <a href="{{WIKI}}/delay" title="Help" target="_blank" rel="noopener noreferrer">help</a>
                    </legend>
                    <div class="input-wrapper">
                        <input id="searchDelay" type="range" value="30000" step="100" min="100" max="60000">
                        <div id="searchDelayValue"></div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        Delete delay
                        <a href="{{WIKI}}/delay" title="Help" target="_blank" rel="noopener noreferrer">help</a>
                    </legend>
                    <div class="input-wrapper">
                        <input id="deleteDelay" type="range" value="1000" step="50" min="50" max="10000">
                        <div id="deleteDelayValue"></div>
                    </div>
                    <br>
                    <div class="sectionDescription">
                        This will affect the speed in which the messages are deleted.
                        Use the help link for more information.
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Empty page retries</legend>
                    <div class="input-wrapper">
                        <input id="emptyPageRetries" type="number" value="2" min="0" max="10" step="1">
                    </div>
                    <div class="sectionDescription">
                        Number of retries when the API returns an empty page before stopping.
                    </div>
                </fieldset>
                <hr>
                <fieldset>
                    <legend>
                        Authorization Token
                        <a href="{{WIKI}}/authToken" title="Help" target="_blank" rel="noopener noreferrer">help</a>
                    </legend>
                    <div class="multiInput">
                        <div class="input-wrapper">
                            <input class="input" id="token" type="text" autocomplete="dont" priv>
                        </div>
                        <button id="getToken">fill</button>
                    </div>
                </fieldset>
            </details>
            <hr>
            <div></div>
            <div class="info">
                Undiscord {{VERSION}}
                <br> victornpb
            </div>
        </div>
        <div class="main col">
            <div class="tbar col">
                <div class="row">
                    <button id="toggleSidebar" class="sizeMedium icon">☰</button>
                    <button id="start" class="sizeMedium danger" style="width: 150px;" title="Start the deletion process">▶︎ Delete</button>
                    <button id="stop" class="sizeMedium" title="Stop the deletion process" disabled>🛑 Stop</button>
                    <button id="clear" class="sizeMedium">Clear log</button>
                    <label class="row" title="Hide sensitive information on your screen for taking screenshots">
                        <input id="redact" type="checkbox" checked> Streamer mode
                    </label>
                </div>
                <div class="row">
                    <progress id="progressBar" style="display:none;"></progress>
                </div>
            </div>
            <pre id="logArea" class="scroll">
                <div class="" style="background: var(--message-mentioned-background-default, var(--background-mentioned)); padding: .5em;">Notice: Undiscord may be working slower than usual and<wbr>require multiple attempts due to a recent Discord update.<br>We're working on a fix, and we thank you for your patience.</div>
                <center>
                    <div>Star <a href="{{HOME}}" target="_blank" rel="noopener noreferrer">this project</a> on GitHub!</div>
                    <div><a href="{{HOME}}/discussions" target="_blank" rel="noopener noreferrer">Issues or help</a></div>
                </center>
            </pre>
            <div class="tbar footer row">
                <div id="progressPercent"></div>
                <span class="spacer"></span>
                <label>
                    <input id="autoScroll" type="checkbox" checked> Auto scroll
                </label>
                <div class="resize-handle"></div>
            </div>
        </div>
    </div>
</div>

`);

	const log = {
	  debug() { return logFn ? logFn('debug', arguments) : console.debug.apply(console, arguments); },
	  info() { return logFn ? logFn('info', arguments) : console.info.apply(console, arguments); },
	  verb() { return logFn ? logFn('verb', arguments) : console.log.apply(console, arguments); },
	  warn() { return logFn ? logFn('warn', arguments) : console.warn.apply(console, arguments); },
	  error() { return logFn ? logFn('error', arguments) : console.error.apply(console, arguments); },
	  success() { return logFn ? logFn('success', arguments) : console.info.apply(console, arguments); },
	};

	var logFn; // custom console.log function
	const setLogFn = (fn) => logFn = fn;

	const VALID_LOG_TYPES = new Set(['debug', 'info', 'verb', 'warn', 'error', 'success']);
	const isValidLogType = (type) => VALID_LOG_TYPES.has(type);

	/**
	 * Wait for a given number of milliseconds.
	 * @param {number} ms - Milliseconds to wait
	 * @returns {Promise<void>}
	 */
	const wait = async ms => new Promise(done => setTimeout(done, ms));

	/**
	 * Convert milliseconds to human-readable "Xh Ym Zs" format.
	 * @param {number} s - Milliseconds
	 * @returns {string}
	 */
	const msToHMS = s => `${s / 3.6e6 | 0}h ${(s % 3.6e6) / 6e4 | 0}m ${(s % 6e4) / 1000 | 0}s`;

	/**
	 * Escape HTML special characters to prevent XSS.
	 * @param {string} html - Raw string
	 * @returns {string} Escaped string safe for innerHTML
	 */
	const escapeHTML = html => String(html).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#039;' })[m]);

	/**
	 * Wrap a string in `<x>` tags with HTML-escaped content for streamer mode.
	 * The `<x>` tag is styled via CSS to hide content when redact mode is on.
	 * @param {string} str - Sensitive string to redact
	 * @returns {string} HTML string with `<x>` wrapper
	 */
	const redact = str => `<x>${escapeHTML(str)}</x>`;

	/**
	 * Replace `{{KEY}}` interpolation tokens in a string with values from an object.
	 * @param {string} str - Template string
	 * @param {Object} obj - Key-value pairs
	 * @param {boolean} [removeMissing=false] - Remove unmatched tokens
	 * @returns {string}
	 */
	const replaceInterpolations = (str, obj, removeMissing = false) => str.replace(/\{\{([\w_]+)\}\}/g, (m, key) => obj[key] ?? (removeMissing ? '' : m));

	/**
	 * Build a URL query string from key-value pairs, filtering out undefined values.
	 * @param {Array<[string, *]>} params - Array of [key, value] pairs
	 * @returns {string} Encoded query string
	 */
	const queryString = params => params.filter(p => p[1] !== undefined).map(p => p[0] + '=' + encodeURIComponent(p[1])).join('&');

	/**
	 * Show a confirmation dialog asynchronously (via setTimeout to avoid blocking).
	 * @param {string} msg - Confirmation message
	 * @returns {Promise<boolean>}
	 */
	const ask = async msg => new Promise(resolve => setTimeout(() => resolve(window.confirm(msg)), 10));

	/**
	 * Convert a date string to a Discord snowflake ID, or return as-is if already a snowflake.
	 * @param {string} date - Date string (with `:`) or snowflake ID
	 * @returns {number|string} Snowflake ID
	 */
	const toSnowflake = (date) => /:/.test(date) ? ((new Date(date).getTime() - 1420070400000) * Math.pow(2, 22)) : date;

	const API_VERSION = 'v9';
	const MESSAGES_PER_PAGE = 25;
	const OBSERVER_THROTTLE_MS = 3000;
	const MAX_SEARCH_DELAY_MS = 60000;
	const MAX_DELETE_DELAY_MS = 30000;

	const DELETE_RESULT = Object.freeze({
	  OK: 'OK',
	  RETRY: 'RETRY',
	  FAILED: 'FAILED',
	  FAIL_SKIP: 'FAIL_SKIP',
	});

	// Discord message types that can be deleted by the message author.
	// type 0 = default, types 6-19 = various deletable system messages,
	// type 20 = CHAT_INPUT_COMMAND (not deletable without manage messages),
	// type 21 = THREAD_STARTER_MESSAGE (not deletable),
	// type 46 = polls (self-deletable)
	const DELETABLE_MSG_TYPES = new Set([
	  0, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 46,
	]);

	const BASE_URL = `https://discord.com/api/${API_VERSION}`;
	const DEFAULT_TIMEOUT_MS = 30000;

	/**
	 * Search messages in a guild or DM channel.
	 * @param {string} authToken - Discord authorization token
	 * @param {Object} params - Search parameters
	 * @param {string} params.guildId - Guild ID or '@me' for DMs
	 * @param {string} [params.channelId] - Channel ID
	 * @param {string} [params.authorId] - Author ID filter
	 * @param {string} [params.minId] - Min message ID or date
	 * @param {string} [params.maxId] - Max message ID or date
	 * @param {number} [params.offset] - Pagination offset
	 * @param {boolean} [params.hasLink] - Filter messages with links
	 * @param {boolean} [params.hasFile] - Filter messages with files
	 * @param {string} [params.content] - Text content filter
	 * @param {boolean} [params.includeNsfw] - Include NSFW channels
	 * @returns {Promise<Response>} Raw fetch response
	 */
	async function searchMessages(authToken, params) {
	  const { guildId, channelId, authorId, minId, maxId, offset, hasLink, hasFile, content, includeNsfw } = params;

	  let url;
	  if (guildId === '@me') url = `${BASE_URL}/channels/${channelId}/messages/`;
	  else url = `${BASE_URL}/guilds/${guildId}/messages/`;

	  return fetch(url + 'search?' + queryString([
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
	  ]), {
	    headers: { 'Authorization': authToken },
	    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
	  });
	}

	/**
	 * Delete a single message from a channel.
	 * @param {string} authToken - Discord authorization token
	 * @param {string} channelId - Channel containing the message
	 * @param {string} messageId - Message to delete
	 * @returns {Promise<Response>} Raw fetch response
	 */
	async function deleteMessage(authToken, channelId, messageId) {
	  return fetch(`${BASE_URL}/channels/${channelId}/messages/${messageId}`, {
	    method: 'DELETE',
	    headers: { 'Authorization': authToken },
	    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
	  });
	}

	/**
	 * Unarchive a thread channel so messages can be deleted.
	 * @param {string} authToken - Discord authorization token
	 * @param {string} channelId - Thread channel ID
	 * @returns {Promise<Response>} Raw fetch response
	 */
	async function unarchiveThread(authToken, channelId) {
	  return fetch(`${BASE_URL}/channels/${channelId}`, {
	    method: 'PATCH',
	    headers: {
	      'Authorization': authToken,
	      'Content-Type': 'application/json',
	    },
	    body: JSON.stringify({ archived: false }),
	    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
	  });
	}

	/**
	 * Get channel information (used for thread detection).
	 * @param {string} authToken - Discord authorization token
	 * @param {string} channelId - Channel ID
	 * @returns {Promise<Response>} Raw fetch response
	 */
	async function getChannel(authToken, channelId) {
	  return fetch(`${BASE_URL}/channels/${channelId}`, {
	    headers: { 'Authorization': authToken },
	    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
	  });
	}

	const MAX_SEARCH_RETRIES = 20;

	/**
	 * Search for messages with automatic retry on rate-limit (429) and indexing (202).
	 * Handles 403/400 errors gracefully for batch job resilience.
	 * @param {Object} options - Core options (authToken, guildId, channelId, filters, etc.)
	 * @param {Object} state - Core state (offset, running, _searchResponse)
	 * @param {Object} stats - Core stats (throttledCount, throttledTotalTime)
	 * @param {Function} beforeRequest - Ping tracking: called before fetch
	 * @param {Function} afterRequest - Ping tracking: called after fetch
	 * @param {Function} printStats - Logs current delay/throttle stats
	 * @returns {Promise<Object>} Search response data `{ messages: [], total_results: number }`
	 */
	async function searchWithRetry(options, state, stats, beforeRequest, afterRequest, printStats) {
	  for (let attempt = 0; attempt < MAX_SEARCH_RETRIES; attempt++) {
	    let resp;
	    try {
	      beforeRequest();
	      resp = await searchMessages(options.authToken, {
	        guildId: options.guildId,
	        channelId: options.channelId,
	        authorId: options.authorId,
	        minId: options.minId,
	        maxId: options.maxId,
	        offset: state.offset,
	        hasLink: options.hasLink,
	        hasFile: options.hasFile,
	        content: options.content,
	        includeNsfw: options.includeNsfw,
	      });
	      afterRequest();
	    } catch (err) {
	      state.running = false;
	      log.error('Search request threw an error:', err);
	      throw err;
	    }

	    // not indexed yet (not a rate limit — don't count as throttled)
	    if (resp.status === 202) {
	      let w = (await resp.json()).retry_after * 1000;
	      w = Math.max(w, 0) || options.searchDelay;
	      log.warn(`This channel isn't indexed yet. Waiting ${w}ms for discord to index it...`);
	      await wait(w);
	      continue;
	    }

	    if (!resp.ok) {
	      if (resp.status === 429) {
	        let w = (await resp.json()).retry_after * 1000;
	        w = Math.max(w, 0) || options.searchDelay;
	        stats.throttledCount++;
	        const cooldown = w * 2;
	        stats.throttledTotalTime += cooldown;
	        options.searchDelay = Math.min(options.searchDelay + 100, MAX_SEARCH_DELAY_MS);
	        log.warn(`Being rate limited by the API for ${w}ms! Increasing search delay to ${options.searchDelay}ms...`);
	        printStats();
	        log.verb(`Cooling down for ${cooldown}ms before retrying...`);
	        await wait(cooldown);
	        continue;
	      }
	      else if (resp.status === 403) {
	        log.warn('Insufficient permissions to search this channel. Skipping...');
	        state._searchResponse = { messages: [], total_results: 0 };
	        return state._searchResponse;
	      }
	      else {
	        try {
	          const errorData = await resp.json();
	          if (resp.status === 400 && errorData.code === 50024) {
	            log.warn('Channel not found (possibly deleted). Skipping...');
	            state._searchResponse = { messages: [], total_results: 0 };
	            return state._searchResponse;
	          }
	          if (resp.status === 403 && errorData.code === 50001) {
	            log.warn('Missing access to this guild. Skipping...');
	            state._searchResponse = { messages: [], total_results: 0 };
	            return state._searchResponse;
	          }
	          state.running = false;
	          log.error(`Error searching messages, API responded with status ${resp.status}!\n`, errorData);
	          throw resp;
	        } catch (e) {
	          if (e === resp) throw e;
	          state.running = false;
	          log.error(`Error searching messages, API responded with status ${resp.status}!\n`);
	          throw resp;
	        }
	      }
	    }

	    // success
	    let data = await resp.json();
	    if (!data || typeof data !== 'object') {
	      data = { messages: [], total_results: 0 };
	    } else if (!Array.isArray(data.messages)) {
	      data.messages = [];
	      data.total_results = data.total_results || 0;
	    }
	    state._searchResponse = data;
	    return data;
	  }

	  state.running = false;
	  log.error('Too many search retries. Stopping.');
	  throw new Error('Search max retries exceeded');
	}

	/**
	 * Filter the search response to determine which messages should be deleted.
	 * Pure function - returns result instead of mutating state.
	 * @param {Object} data - Search response `{ messages: [], total_results: number }`
	 * @param {Object} options - Filter options
	 * @param {boolean} [options.includePinned] - Include pinned messages
	 * @param {boolean} [options.includeApplications] - Include bot/application messages
	 * @param {boolean} [options.isThread] - Whether filtering for a specific thread
	 * @param {string} [options.threadId] - Thread ID to filter by
	 * @param {string} [options.pattern] - Regex pattern to match content
	 * @returns {{ toDelete: Object[], skipped: Object[], grandTotal: number }}
	 */
	function filterMessages(data, options) {
	  if (!data || !Array.isArray(data.messages)) {
	    return { toDelete: [], skipped: [], grandTotal: 0 };
	  }

	  const grandTotal = data.total_results;

	  // search returns messages near the actual message, only get the messages we searched for
	  const discoveredMessages = data.messages
	    .map(convo => convo.find(message => message.hit === true))
	    .filter(Boolean);

	  // filter by deletable message types
	  let messagesToDelete = discoveredMessages.filter(msg => DELETABLE_MSG_TYPES.has(msg.type));

	  // filter pinned
	  messagesToDelete = messagesToDelete.filter(msg => msg.pinned ? options.includePinned : true);

	  // filter bot/application messages
	  if (!options.includeApplications) {
	    messagesToDelete = messagesToDelete.filter(msg => !msg.author?.bot);
	  }

	  // filter by thread
	  if (options.isThread && options.threadId) {
	    messagesToDelete = messagesToDelete.filter(msg => msg.channel_id === options.threadId);
	  }

	  // filter by regex pattern
	  if (options.pattern) {
	    try {
	      const regex = new RegExp(options.pattern, 'i');
	      messagesToDelete = messagesToDelete.filter(msg => {
	        try {
	          return regex.test(msg.content);
	        } catch (e) {
	          return false;
	        }
	      });
	    } catch (e) {
	      log.warn('Ignoring RegExp because pattern is malformed!', e);
	    }
	  }

	  // compute skipped messages (used for offset calculation)
	  const deleteIds = new Set(messagesToDelete.map(m => m.id));
	  const skipped = discoveredMessages.filter(msg => !deleteIds.has(msg.id));

	  log.verb('filterMessages', `toDelete: ${messagesToDelete.length}, skipped: ${skipped.length}`);

	  return { toDelete: messagesToDelete, skipped, grandTotal };
	}

	/**
	 * Attempt to unarchive a thread so its messages can be deleted.
	 * @param {string} authToken - Discord authorization token
	 * @param {string} channelId - Thread channel ID
	 * @param {Function} beforeRequest - Ping tracking: called before fetch
	 * @param {Function} afterRequest - Ping tracking: called after fetch
	 * @returns {Promise<string>} DELETE_RESULT (RETRY on success, FAIL_SKIP or FAILED on error)
	 */
	async function tryUnarchiveThread(authToken, channelId, beforeRequest, afterRequest) {
	  let resp;
	  try {
	    beforeRequest();
	    resp = await unarchiveThread(authToken, channelId);
	    afterRequest();
	  } catch (err) {
	    log.error('Failed to unarchive thread:', err);
	    return DELETE_RESULT.FAILED;
	  }

	  if (resp.ok) {
	    log.success('Thread unarchived successfully. Retrying deletion...');
	    return DELETE_RESULT.RETRY;
	  } else {
	    log.warn(`Failed to unarchive thread (status ${resp.status}). Skipping...`);
	    return DELETE_RESULT.FAIL_SKIP;
	  }
	}

	/**
	 * Delete a single message via the Discord API with error handling.
	 * @param {Object} message - Discord message object
	 * @param {Object} options - Core options (authToken, deleteDelay)
	 * @param {Object} stats - Core stats (throttledCount, throttledTotalTime)
	 * @param {Function} beforeRequest - Ping tracking
	 * @param {Function} afterRequest - Ping tracking
	 * @param {Function} printStats - Logs current stats
	 * @returns {Promise<string>} DELETE_RESULT value
	 */
	async function deleteSingleMessage(message, options, stats, beforeRequest, afterRequest, printStats) {
	  let resp;
	  try {
	    beforeRequest();
	    resp = await deleteMessage(options.authToken, message.channel_id, message.id);
	    afterRequest();
	  } catch (err) {
	    log.error('Delete request throwed an error:', err);
	    log.verb('Related object:', redact(JSON.stringify(message)));
	    return DELETE_RESULT.FAILED;
	  }

	  if (!resp.ok) {
	    if (resp.status === 429) {
	      const w = Math.max((await resp.json()).retry_after * 1000, 0) || options.deleteDelay;
	      stats.throttledCount++;
	      const cooldown = w * 2;
	      stats.throttledTotalTime += cooldown;
	      if (w > options.deleteDelay) {
	        options.deleteDelay = Math.min(options.deleteDelay + w, MAX_DELETE_DELAY_MS);
	        log.warn(`Being rate limited by the API for ${w}ms! Adjusted delete delay to ${options.deleteDelay}ms.`);
	      } else {
	        log.warn(`Being rate limited by the API for ${w}ms!`);
	      }
	      printStats();
	      log.verb(`Cooling down for ${cooldown}ms before retrying...`);
	      await wait(cooldown);
	      return DELETE_RESULT.RETRY;
	    } else if (resp.status === 403) {
	      log.warn('Insufficient permissions to delete message. Skipping...');
	      return DELETE_RESULT.FAIL_SKIP;
	    } else {
	      const body = await resp.text();
	      try {
	        const r = JSON.parse(body);
	        if (resp.status === 400 && r.code === 50083) {
	          log.warn('Thread is archived. Attempting to unarchive...');
	          return tryUnarchiveThread(options.authToken, message.channel_id, beforeRequest, afterRequest);
	        }
	        log.error(`Error deleting message, API responded with status ${resp.status}!`, r);
	        log.verb('Related object:', redact(JSON.stringify(message)));
	        return DELETE_RESULT.FAILED;
	      } catch (e) {
	        log.error(`Fail to parse JSON. API responded with status ${resp.status}!`, body);
	        return DELETE_RESULT.FAILED;
	      }
	    }
	  }

	  return DELETE_RESULT.OK;
	}

	/**
	 * Delete all messages in the current batch with retry logic.
	 * @param {Object} state - Core state (running, delCount, failCount, offset, grandTotal, _messagesToDelete)
	 * @param {Object} options - Core options (maxAttempt, deleteDelay, authToken)
	 * @param {Object} stats - Core stats
	 * @param {Function} beforeRequest - Ping tracking
	 * @param {Function} afterRequest - Ping tracking
	 * @param {Function} printStats - Logs current stats
	 * @param {Function} calcEtr - Recalculate estimated time remaining
	 * @param {Function} [onProgress] - Progress callback
	 */
	async function deleteMessagesFromList(state, options, stats, beforeRequest, afterRequest, printStats, calcEtr, onProgress) {
	  for (let i = 0; i < state._messagesToDelete.length; i++) {
	    const message = state._messagesToDelete[i];
	    if (!state.running) return log.error('Stopped by you!');

	    log.debug(
	      `[${state.delCount + state.failCount + 1}/${state.grandTotal}] ` +
	      `${new Date(message.timestamp).toLocaleString()} ` +
	      `${redact((message.author?.username || 'Unknown') + '#' + (message.author?.discriminator || '0000'))}` +
	      `: ${redact((message.content || '').replace(/\n/g, '↵'))}` +
	      (message.attachments?.length ? ` [${message.attachments.length} attachment(s)]` : ''),
	      `{ID:${redact(message.id)}}`
	    );

	    // retry loop
	    let attempt = 0;
	    while (attempt < options.maxAttempt) {
	      const result = await deleteSingleMessage(message, options, stats, beforeRequest, afterRequest, printStats);
	      attempt++;

	      if (result === DELETE_RESULT.RETRY || result === DELETE_RESULT.FAILED) {
	        if (attempt >= options.maxAttempt) {
	          state.offset++;
	          state.failCount++;
	          break;
	        }
	        log.verb(`Retrying in ${options.deleteDelay}ms... (${attempt}/${options.maxAttempt})`);
	        await wait(options.deleteDelay);
	        continue;
	      } else if (result === DELETE_RESULT.FAIL_SKIP) {
	        state.offset++;
	        state.failCount++;
	      } else {
	        state.delCount++;
	      }
	      break;
	    }

	    calcEtr();
	    if (onProgress) onProgress(state, stats);

	    await wait(options.deleteDelay);
	  }
	}

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

	const MOVE = 0;
	const RESIZE_T = 1;
	const RESIZE_B = 2;
	const RESIZE_L = 4;
	const RESIZE_R = 8;
	const RESIZE_TL = RESIZE_T + RESIZE_L;
	const RESIZE_TR = RESIZE_T + RESIZE_R;
	const RESIZE_BL = RESIZE_B + RESIZE_L;
	const RESIZE_BR = RESIZE_B + RESIZE_R;

	/**
	 * Make an element draggable/resizable
	 * @author Victor N. wwww.vitim.us
	 */
	class DragResize {
	  constructor({ elm, moveHandle, options }) {
	    this.options = defaultArgs({
	      enabledDrag: true,
	      enabledResize: true,
	      minWidth: 200,
	      maxWidth: Infinity,
	      minHeight: 100,
	      maxHeight: Infinity,
	      dragAllowX: true,
	      dragAllowY: true,
	      resizeAllowX: true,
	      resizeAllowY: true,
	      draggingClass: 'drag',
	      useMouseEvents: true,
	      useTouchEvents: true,
	      createHandlers: true,
	    }, options);
	    Object.assign(this, options);
	    options = undefined;

	    elm.style.position = 'fixed';

	    this.drag_m = new Draggable(elm, moveHandle, MOVE, this.options);

	    if (this.options.createHandlers) {
	      this.el_t = createElement('div', { name: 'grab-t' }, elm);
	      this.drag_t = new Draggable(elm, this.el_t, RESIZE_T, this.options);
	      this.el_r = createElement('div', { name: 'grab-r' }, elm);
	      this.drag_r = new Draggable(elm, this.el_r, RESIZE_R, this.options);
	      this.el_b = createElement('div', { name: 'grab-b' }, elm);
	      this.drag_b = new Draggable(elm, this.el_b, RESIZE_B, this.options);
	      this.el_l = createElement('div', { name: 'grab-l' }, elm);
	      this.drag_l = new Draggable(elm, this.el_l, RESIZE_L, this.options);
	      this.el_tl = createElement('div', { name: 'grab-tl' }, elm);
	      this.drag_tl = new Draggable(elm, this.el_tl, RESIZE_TL, this.options);
	      this.el_tr = createElement('div', { name: 'grab-tr' }, elm);
	      this.drag_tr = new Draggable(elm, this.el_tr, RESIZE_TR, this.options);
	      this.el_br = createElement('div', { name: 'grab-br' }, elm);
	      this.drag_br = new Draggable(elm, this.el_br, RESIZE_BR, this.options);
	      this.el_bl = createElement('div', { name: 'grab-bl' }, elm);
	      this.drag_bl = new Draggable(elm, this.el_bl, RESIZE_BL, this.options);
	    }
	  }
	}

	class Draggable {
	  constructor(targetElm, handleElm, op, options) {
	    Object.assign(this, options);
	    options = undefined;

	    this._targetElm = targetElm;
	    this._handleElm = handleElm;

	    let vw = window.innerWidth;
	    let vh = window.innerHeight;
	    let initialX, initialY, initialT, initialL, initialW, initialH;

	    const clamp = (value, min, max) => value < min ? min : value > max ? max : value;

	    const moveOp = (x, y) => {
	      const deltaX = (x - initialX);
	      const deltaY = (y - initialY);
	      const t = clamp(initialT + deltaY, 0, vh - initialH);
	      const l = clamp(initialL + deltaX, 0, vw - initialW);
	      this._targetElm.style.top = t + 'px';
	      this._targetElm.style.left = l + 'px';
	    };

	    const resizeOp = (x, y) => {
	      x = clamp(x, 0, vw);
	      y = clamp(y, 0, vh);
	      const deltaX = (x - initialX);
	      const deltaY = (y - initialY);
	      const resizeDirX = (op & RESIZE_L) ? -1 : 1;
	      const resizeDirY = (op & RESIZE_T) ? -1 : 1;
	      const deltaXMax = (this.maxWidth - initialW);
	      const deltaXMin = (this.minWidth - initialW);
	      const deltaYMax = (this.maxHeight - initialH);
	      const deltaYMin = (this.minHeight - initialH);
	      const t = initialT + clamp(deltaY * resizeDirY, deltaYMin, deltaYMax) * resizeDirY;
	      const l = initialL + clamp(deltaX * resizeDirX, deltaXMin, deltaXMax) * resizeDirX;
	      const w = initialW + clamp(deltaX * resizeDirX, deltaXMin, deltaXMax);
	      const h = initialH + clamp(deltaY * resizeDirY, deltaYMin, deltaYMax);
	      if (op & RESIZE_T) { // resize ↑
	        this._targetElm.style.top = t + 'px';
	        this._targetElm.style.height = h + 'px';
	      }
	      if (op & RESIZE_B) { // resize ↓
	        this._targetElm.style.height = h + 'px';
	      }
	      if (op & RESIZE_L) { // resize ←
	        this._targetElm.style.left = l + 'px';
	        this._targetElm.style.width = w + 'px';
	      }
	      if (op & RESIZE_R) { // resize →
	        this._targetElm.style.width = w + 'px';
	      }
	    };

	    let operation = op === MOVE ? moveOp : resizeOp;

	    function dragStartHandler(e) {
	      const touch = e.type === 'touchstart';
	      if ((e.buttons === 1 || e.which === 1) || touch) {
	        e.preventDefault();
	        const x = touch ? e.touches[0].clientX : e.clientX;
	        const y = touch ? e.touches[0].clientY : e.clientY;
	        initialX = x;
	        initialY = y;
	        vw = window.innerWidth;
	        vh = window.innerHeight;
	        initialT = this._targetElm.offsetTop;
	        initialL = this._targetElm.offsetLeft;
	        initialW = this._targetElm.clientWidth;
	        initialH = this._targetElm.clientHeight;
	        if (this.useMouseEvents) {
	          document.addEventListener('mousemove', this._dragMoveHandler);
	          document.addEventListener('mouseup', this._dragEndHandler);
	        }
	        if (this.useTouchEvents) {
	          document.addEventListener('touchmove', this._dragMoveHandler, { passive: false });
	          document.addEventListener('touchend', this._dragEndHandler);
	        }
	        this._targetElm.classList.add(this.draggingClass);
	      }
	    }

	    function dragMoveHandler(e) {
	      e.preventDefault();
	      let x, y;
	      const touch = e.type === 'touchmove';
	      if (touch) {
	        const t = e.touches[0];
	        x = t.clientX;
	        y = t.clientY;
	      } else { //mouse
	        // If the button is not down, dispatch a "fake" mouse up event, to stop listening to mousemove
	        // This happens when the mouseup is not captured (outside the browser)
	        if ((e.buttons || e.which) !== 1) {
	          this._dragEndHandler();
	          return;
	        }
	        x = e.clientX;
	        y = e.clientY;
	      }
	      // perform drag / resize operation
	      operation(x, y);
	    }

	    function dragEndHandler(e) {
	      if (this.useMouseEvents) {
	        document.removeEventListener('mousemove', this._dragMoveHandler);
	        document.removeEventListener('mouseup', this._dragEndHandler);
	      }
	      if (this.useTouchEvents) {
	        document.removeEventListener('touchmove', this._dragMoveHandler);
	        document.removeEventListener('touchend', this._dragEndHandler);
	      }
	      this._targetElm.classList.remove(this.draggingClass);
	    }

	    // We need to bind the handlers to this instance
	    this._dragStartHandler = dragStartHandler.bind(this);
	    this._dragMoveHandler = dragMoveHandler.bind(this);
	    this._dragEndHandler = dragEndHandler.bind(this);

	    this.enable();
	  }

	  /** Turn on the drag and drop of the instance */
	  enable() {
	    this.destroy(); // prevent events from getting binded twice
	    if (this.useMouseEvents) this._handleElm.addEventListener('mousedown', this._dragStartHandler);
	    if (this.useTouchEvents) this._handleElm.addEventListener('touchstart', this._dragStartHandler, { passive: false });
	  }

	  /** Teardown all events bound to the document and elements. You can resurrect this instance by calling enable() */
	  destroy() {
	    this._targetElm.classList.remove(this.draggingClass);
	    if (this.useMouseEvents) {
	      this._handleElm.removeEventListener('mousedown', this._dragStartHandler);
	      document.removeEventListener('mousemove', this._dragMoveHandler);
	      document.removeEventListener('mouseup', this._dragEndHandler);
	    }
	    if (this.useTouchEvents) {
	      this._handleElm.removeEventListener('touchstart', this._dragStartHandler);
	      document.removeEventListener('touchmove', this._dragMoveHandler);
	      document.removeEventListener('touchend', this._dragEndHandler);
	    }
	  }
	}

	function createElement(tag='div', attrs, parent) {
	  const elm = document.createElement(tag);
	  if (attrs) Object.entries(attrs).forEach(([k, v]) => elm.setAttribute(k, v));
	  if (parent) parent.appendChild(elm);
	  return elm;
	}

	function defaultArgs(defaults, options) {
	  function isObj(x) { return x !== null && typeof x === 'object'; }
	  function hasOwn(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
	  if (isObj(options)) for (let prop in defaults) {
	    if (hasOwn(defaults, prop) && hasOwn(options, prop) && options[prop] !== undefined) {
	      if (isObj(defaults[prop])) defaultArgs(defaults[prop], options[prop]);
	      else defaults[prop] = options[prop];
	    }
	  }
	  return defaults;
	}

	/**
	 * Parse an HTML string and return the first element.
	 * @param {string} html - HTML string
	 * @returns {HTMLElement}
	 */
	function createElm(html) {
	  const temp = document.createElement('div');
	  temp.innerHTML = html;
	  return temp.removeChild(temp.firstElementChild);
	}

	/**
	 * Inject a CSS string into the document head as a `<style>` element.
	 * @param {string} css - CSS string
	 * @returns {HTMLStyleElement}
	 */
	function insertCss(css) {
	  const style = document.createElement('style');
	  style.appendChild(document.createTextNode(css));
	  document.head.appendChild(style);
	  return style;
	}

	const messagePickerCss = `
body.undiscord-pick-message [data-list-id="chat-messages"] {
  background-color: var(--background-surface-low, var(--background-secondary-alt));
  box-shadow: inset 0 0 0px 2px var(--brand-500, var(--button-outline-brand-border));
}

body.undiscord-pick-message [id^="message-content-"]:hover {
  cursor: pointer;
  cursor: cell;
  background: var(--background-message-automod-hover, var(--message-highlight-background-default, rgba(255, 199, 0, 0.1)));
}
body.undiscord-pick-message [id^="message-content-"]:hover::after {
  position: absolute;
  top: calc(50% - 11px);
  left: 4px;
  z-index: 1;
  width: 65px;
  height: 22px;
  line-height: 22px;
  font-family: var(--font-display);
  background-color: var(--control-secondary-background-default, var(--button-secondary-background));
  color: var(--text-muted, var(--header-secondary));
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  text-align: center;
  border-radius: 3px;
  content: 'This 👉';
}
body.undiscord-pick-message.before [id^="message-content-"]:hover::after {
  content: 'Before 👆';
}
body.undiscord-pick-message.after [id^="message-content-"]:hover::after {
  content: 'After 👇';
}
`;

	const PICKER_TIMEOUT_MS = 30000;

	const messagePicker = {
	  /** Inject picker CSS into the document. */
	  init() {
	    insertCss(messagePickerCss);
	  },

	  /**
	   * Wait for the user to click a message in the chat.
	   * @param {string} [auxiliary] - Direction class ('before' or 'after')
	   * @returns {Promise<string|null>} Message ID or null on timeout
	   */
	  grab(auxiliary) {
	    return new Promise((resolve) => {
	      document.body.classList.add('undiscord-pick-message');
	      if (auxiliary) document.body.classList.add(auxiliary);

	      function cleanup() {
	        if (auxiliary) document.body.classList.remove(auxiliary);
	        document.body.classList.remove('undiscord-pick-message');
	        document.removeEventListener('click', clickHandler);
	        clearTimeout(timeout);
	      }

	      function clickHandler(e) {
	        const message = e.target.closest('[id^="message-content-"]');
	        if (message) {
	          e.preventDefault();
	          e.stopPropagation();
	          e.stopImmediatePropagation();
	          cleanup();
	          try {
	            resolve(message.id.match(/message-content-(\d+)/)[1]);
	          } catch (e) {
	            resolve(null);
	          }
	        }
	      }

	      const timeout = setTimeout(() => {
	        cleanup();
	        resolve(null);
	      }, PICKER_TIMEOUT_MS);

	      document.addEventListener('click', clickHandler);
	    });
	  }
	};
	window.messagePicker = messagePicker;

	const PREFIX = '[UNDISCORD]';
	const MAX_LOG_ENTRIES = 5000;

	/**
	 * Create the printLog function bound to UI elements.
	 * Renders log entries safely: external data is escaped, `<x>` redact tags are preserved.
	 * Implements ring buffer: removes oldest entries when exceeding MAX_LOG_ENTRIES.
	 * @param {Object} ui - UI element references
	 * @param {HTMLElement} ui.logArea - Log container element
	 * @param {HTMLInputElement} ui.autoScroll - Auto-scroll checkbox
	 * @returns {Function} printLog(type, args)
	 */
	function createPrintLog(ui) {
	  return function printLog(type = '', args) {
	    const safeType = isValidLogType(type) ? type : 'debug';
	    const safeHtml = Array.from(args).map(o => {
	      if (typeof o === 'object') return escapeHTML(JSON.stringify(o, o instanceof Error && Object.getOwnPropertyNames(o)));
	      const str = String(o);
	      // preserve <x>...</x> redact tags (already escaped inside by redact())
	      // escape everything else to prevent XSS from external data
	      const parts = str.split(/(<x>.*?<\/x>)/gs);
	      return parts.map(part =>
	        part.startsWith('<x>') && part.endsWith('</x>') ? part : escapeHTML(part)
	      ).join('');
	    }).join('\t');
	    ui.logArea.insertAdjacentHTML('beforeend', `<div class="log log-${safeType}">${safeHtml}</div>`);

	    // ring buffer: trim oldest entries to prevent unbounded DOM growth
	    while (ui.logArea.children.length > MAX_LOG_ENTRIES) {
	      ui.logArea.removeChild(ui.logArea.firstChild);
	    }

	    if (ui.autoScroll.checked) ui.logArea.querySelector('div:last-child').scrollIntoView(false);
	    if (type === 'error') console.error(PREFIX, ...Array.from(args));
	  };
	}

	/**
	 * Setup progress callbacks on the UndiscordCore instance.
	 * @param {UndiscordCore} undiscordCore - Core instance
	 * @param {Object} ui - UI element references
	 * @param {Function} $ - Scoped querySelector shorthand
	 */
	function setupProgress(undiscordCore, ui, $) {

	  undiscordCore.onStart = (state, stats) => {
	    $('#start').disabled = true;
	    $('#stop').disabled = false;
	    ui.undiscordBtn.classList.add('running');
	    ui.progressMain.style.display = 'block';
	    ui.percent.style.display = 'block';
	  };

	  undiscordCore.onProgress = (state, stats) => {
	    let max = state.grandTotal;
	    const value = state.delCount + state.failCount;
	    max = Math.max(max, value, 0);

	    const percent = value >= 0 && max ? Math.round(value / max * 100) + '%' : '';
	    const elapsed = msToHMS(Date.now() - stats.startTime.getTime());
	    const remaining = msToHMS(stats.etr);
	    ui.percent.textContent = `${percent} (${value}/${max}) Elapsed: ${elapsed} Remaining: ${remaining}`;

	    // set max before value to avoid brief 100% glitch on first update
	    if (max) {
	      ui.progressIcon.setAttribute('max', max);
	      ui.progressMain.setAttribute('max', max);
	      ui.progressIcon.value = value;
	      ui.progressMain.value = value;
	    } else {
	      ui.progressIcon.removeAttribute('value');
	      ui.progressMain.removeAttribute('value');
	      ui.percent.textContent = '...';
	    }

	    // sync delay sliders with core values
	    const searchDelayInput = $('input#searchDelay');
	    searchDelayInput.value = undiscordCore.options.searchDelay;
	    $('div#searchDelayValue').textContent = undiscordCore.options.searchDelay + 'ms';

	    const deleteDelayInput = $('input#deleteDelay');
	    deleteDelayInput.value = undiscordCore.options.deleteDelay;
	    $('div#deleteDelayValue').textContent = undiscordCore.options.deleteDelay + 'ms';
	  };

	  undiscordCore.onStop = (state, stats) => {
	    $('#start').disabled = false;
	    $('#stop').disabled = true;
	    ui.undiscordBtn.classList.remove('running');
	    ui.progressMain.style.display = 'none';
	    ui.percent.style.display = 'none';
	  };
	}

	function getIframeLocalStorage() {
	  const iframe = document.body.appendChild(document.createElement('iframe'));
	  iframe.style.display = 'none';
	  const LS = iframe.contentWindow.localStorage;
	  return { LS, iframe };
	}

	/**
	 * Extract the Discord authorization token using multiple methods.
	 * @returns {string|null} Token or null if all methods fail
	 */
	function getToken() {
	  window.dispatchEvent(new Event('beforeunload'));

	  // Method 1: iframe localStorage
	  try {
	    const { LS, iframe } = getIframeLocalStorage();
	    try {
	      const token = JSON.parse(LS.token);
	      if (token) return token;
	    } finally {
	      iframe.remove();
	    }
	  } catch { /* ignore */ }

	  // Method 2: webpack/rspack module cache
	  log.info('Could not automatically detect Authorization Token in local storage!');
	  log.info('Attempting to grab token using webpack');
	  try {
	    return (window.webpackChunkdiscord_app.push([[''], {}, e => { window.m = []; for (let c in e.c) window.m.push(e.c[c]); }]), window.m).find(m => m?.exports?.default?.getToken !== void 0).exports.default.getToken();
	  } catch { /* ignore */ }

	  // Method 3: alternative webpack export path
	  try {
	    const tokenModule = window.m?.find(m => m?.exports?.getToken !== void 0);
	    if (tokenModule) return tokenModule.exports.getToken();
	  } catch { /* ignore */ }

	  log.error('All token extraction methods failed.');
	  log.info('Please enter your token manually in "Advanced Settings".');
	  return null;
	}

	/**
	 * Get the current user's author ID from localStorage.
	 * @returns {string} Author ID or empty string
	 */
	function getAuthorId() {
	  try {
	    const { LS, iframe } = getIframeLocalStorage();
	    try {
	      return JSON.parse(LS.user_id_cache);
	    } finally {
	      iframe.remove();
	    }
	  } catch { /* ignore */ }
	  log.error('Could not get Author ID from local storage.');
	  return '';
	}

	/**
	 * Extract the guild ID from the current URL.
	 * @returns {string|undefined} Guild ID or undefined (with alert)
	 */
	function getGuildId() {
	  const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
	  if (m) return m[1];
	  else alert('Could not find the Guild ID!\nPlease make sure you are on a Server or DM.');
	}

	/**
	 * Extract the channel ID from the current URL.
	 * @returns {string|undefined} Channel ID or undefined (with alert)
	 */
	function getChannelId() {
	  const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
	  if (m) return m[2];
	  else alert('Could not find the Channel ID!\nPlease make sure you are on a Channel or DM.');
	}

	/**
	 * Check if the current channel is a thread and return thread info.
	 * Thread types: 10 = announcement thread, 11 = public thread, 12 = private thread
	 * @param {string} authToken - Authorization token for API calls
	 * @returns {Promise<{channelId: string, isThread: boolean, threadId: string|null}>}
	 */
	async function getChannelThread(authToken) {
	  const channelId = getChannelId();
	  if (!channelId) return { channelId: null, isThread: false, threadId: null };

	  try {
	    const resp = await getChannel(authToken, channelId);
	    if (resp.ok) {
	      const data = await resp.json();
	      if ([10, 11, 12].includes(data.type) && data.parent_id) {
	        return { channelId: data.parent_id, isThread: true, threadId: channelId };
	      }
	    }
	  } catch {
	    // fallback: treat as non-thread
	  }
	  return { channelId, isThread: false, threadId: null };
	}

	/**
	 * Try to fill the token automatically, with error logging.
	 * @returns {string} Token or empty string
	 */
	function fillToken() {
	  try {
	    return getToken();
	  } catch (err) {
	    log.verb(err);
	    log.error('Could not automatically detect Authorization Token!');
	    log.info('Please make sure Undiscord is up to date');
	    log.debug('Alternatively, you can try entering a Token manually in the "Advanced Settings" section.');
	  }
	  return '';
	}

	/**
	 * Register all event handlers on the Undiscord UI.
	 * @param {UndiscordCore} undiscordCore - Core instance
	 * @param {Object} ui - UI element references
	 * @param {Function} $ - Scoped querySelector shorthand
	 * @param {Function} toggleWindow - Show/hide the Undiscord window
	 */
	function registerHandlers(undiscordCore, ui, $, toggleWindow) {
	  $('#hide').onclick = toggleWindow;
	  $('#toggleSidebar').onclick = () => ui.undiscordWindow.classList.toggle('hide-sidebar');
	  $('button#start').onclick = () => startAction(undiscordCore, ui, $);
	  $('button#stop').onclick = () => undiscordCore.stop();
	  $('button#clear').onclick = () => ui.logArea.innerHTML = '';
	  $('button#getAuthor').onclick = () => $('input#authorId').value = getAuthorId();
	  $('button#getGuild').onclick = () => {
	    const guildId = $('input#guildId').value = getGuildId();
	    if (guildId === '@me') $('input#channelId').value = getChannelId();
	  };
	  $('button#getChannel').onclick = async () => {
	    try {
	      const authToken = $('input#token').value.trim() || fillToken();
	      if (authToken) {
	        const threadInfo = await getChannelThread(authToken);
	        if (threadInfo.isThread) {
	          $('input#channelId').value = threadInfo.channelId;
	          log.info(`Detected thread. Using parent channel ${threadInfo.channelId}, will filter by thread ${threadInfo.threadId}.`);
	          ui._threadId = threadInfo.threadId;
	          ui._isThread = true;
	        } else {
	          $('input#channelId').value = threadInfo.channelId || getChannelId();
	          ui._threadId = null;
	          ui._isThread = false;
	        }
	      } else {
	        $('input#channelId').value = getChannelId();
	        ui._threadId = null;
	        ui._isThread = false;
	      }
	    } catch (err) {
	      log.error('Failed to detect channel:', err);
	      $('input#channelId').value = getChannelId();
	      ui._threadId = null;
	      ui._isThread = false;
	    }
	    $('input#guildId').value = getGuildId();
	  };
	  $('#redact').onchange = () => {
	    const b = ui.undiscordWindow.classList.toggle('redact');
	    if (b) alert('This mode will attempt to hide personal information, so you can screen share / take screenshots.\nAlways double check you are not sharing sensitive information!');
	  };
	  $('#pickMessageAfter').onclick = async () => {
	    try {
	      alert('Select a message on the chat.\nThe message below it will be deleted.');
	      toggleWindow();
	      const id = await messagePicker.grab('after');
	      if (id) $('input#minId').value = id;
	    } catch (err) {
	      log.error('Failed to pick message:', err);
	    }
	    toggleWindow();
	  };
	  $('#pickMessageBefore').onclick = async () => {
	    try {
	      alert('Select a message on the chat.\nThe message above it will be deleted.');
	      toggleWindow();
	      const id = await messagePicker.grab('before');
	      if (id) $('input#maxId').value = id;
	    } catch (err) {
	      log.error('Failed to pick message:', err);
	    }
	    toggleWindow();
	  };
	  $('button#getToken').onclick = () => $('input#token').value = fillToken();

	  // sync delays
	  $('input#searchDelay').onchange = (e) => {
	    const v = parseInt(e.target.value, 10);
	    if (!isNaN(v) && v > 0) undiscordCore.options.searchDelay = v;
	  };
	  $('input#deleteDelay').onchange = (e) => {
	    const v = parseInt(e.target.value, 10);
	    if (!isNaN(v) && v > 0) undiscordCore.options.deleteDelay = v;
	  };
	  $('input#searchDelay').addEventListener('input', (event) => {
	    $('div#searchDelayValue').textContent = event.target.value + 'ms';
	  });
	  $('input#deleteDelay').addEventListener('input', (event) => {
	    $('div#deleteDelayValue').textContent = event.target.value + 'ms';
	  });

	  // import json
	  const fileSelection = $('input#importJsonInput');
	  fileSelection.onchange = async () => {
	    const files = fileSelection.files;
	    if (files.length === 0) return log.warn('No file selected.');

	    const channelIdField = $('input#channelId');
	    $('input#guildId').value = '@me';
	    $('input#authorId').value = getAuthorId();

	    try {
	      const file = files[0];
	      const text = await file.text();
	      const json = JSON.parse(text);
	      const channelIds = Object.keys(json);
	      channelIdField.value = channelIds.join(',');
	      log.info(`Loaded ${channelIds.length} channels.`);
	    } catch (err) {
	      log.error('Error parsing file!', err);
	    }
	  };
	}

	/**
	 * Start the deletion process from UI input values.
	 * @param {UndiscordCore} undiscordCore - Core instance
	 * @param {Object} ui - UI element references
	 * @param {Function} $ - Scoped querySelector shorthand
	 */
	async function startAction(undiscordCore, ui, $) {
	  const authorId = $('input#authorId').value.trim();
	  const guildId = $('input#guildId').value.trim();
	  const channelIds = $('input#channelId').value.trim().split(/\s*,\s*/);
	  const includeNsfw = $('input#includeNsfw').checked;
	  const content = $('input#search').value.trim();
	  const hasLink = $('input#hasLink').checked;
	  const hasFile = $('input#hasFile').checked;
	  const includePinned = $('input#includePinned').checked;
	  const includeApplications = $('input#includeApplications').checked;
	  const pattern = $('input#pattern').value;
	  const minId = $('input#minId').value.trim();
	  const maxId = $('input#maxId').value.trim();
	  const minDate = $('input#minDate').value.trim();
	  const maxDate = $('input#maxDate').value.trim();
	  const searchDelay = parseInt($('input#searchDelay').value.trim(), 10);
	  const deleteDelay = parseInt($('input#deleteDelay').value.trim(), 10);
	  const emptyPageRetries = parseInt($('input#emptyPageRetries').value.trim(), 10);

	  const authToken = $('input#token').value.trim() || fillToken();
	  if (!authToken) return;
	  if (!guildId) return log.error('You must fill the "Server ID" field!');

	  ui.logArea.innerHTML = '';

	  undiscordCore.resetState();
	  undiscordCore.options = {
	    ...undiscordCore.options,
	    authToken,
	    authorId,
	    guildId,
	    channelId: channelIds.length === 1 ? channelIds[0] : undefined,
	    minId: minId || minDate,
	    maxId: maxId || maxDate,
	    content,
	    hasLink,
	    hasFile,
	    includeNsfw,
	    includePinned,
	    includeApplications,
	    pattern,
	    searchDelay,
	    deleteDelay,
	    emptyPageRetries: isNaN(emptyPageRetries) ? 2 : emptyPageRetries,
	    threadId: ui._threadId || null,
	    isThread: ui._isThread || false,
	  };

	  if (channelIds.length > 1) {
	    const jobs = channelIds.map(ch => ({ guildId, channelId: ch }));
	    try {
	      await undiscordCore.runBatch(jobs);
	    } catch (err) {
	      log.error('CoreException', err);
	    }
	  } else {
	    try {
	      await undiscordCore.run();
	    } catch (err) {
	      log.error('CoreException', err);
	      undiscordCore.stop();
	    }
	  }
	}

	const HOME = 'https://github.com/victornpb/undiscord';
	const WIKI = 'https://github.com/victornpb/undiscord/wiki';

	const undiscordCore = new UndiscordCore();
	messagePicker.init();

	const ui = {
	  undiscordWindow: null,
	  undiscordBtn: null,
	  logArea: null,
	  autoScroll: null,
	  progressMain: null,
	  progressIcon: null,
	  percent: null,
	};

	/**
	 * Initialize the Undiscord UI: mount DOM, inject CSS, register handlers.
	 */
	function initUI() {
	  // inject all CSS
	  insertCss(layoutCss);
	  insertCss(componentsCss);
	  insertCss(scrollbarCss);
	  insertCss(redactCss);
	  insertCss(logCss);
	  insertCss(dragCss);

	  // create undiscord window
	  const undiscordUI = replaceInterpolations(undiscordTemplate, { VERSION, HOME, WIKI });
	  ui.undiscordWindow = createElm(undiscordUI);
	  document.body.appendChild(ui.undiscordWindow);

	  const $ = s => ui.undiscordWindow.querySelector(s);

	  // enable drag and resize
	  new DragResize({ elm: ui.undiscordWindow, moveHandle: $('.header') });

	  // create trash icon button
	  ui.undiscordBtn = createElm(buttonHtml);
	  ui.undiscordBtn.onclick = toggleWindow;
	  function mountBtn() {
	    const toolbar = document.querySelector('#app-mount [class*="toolbar__"]') || document.querySelector('#app-mount [class*="-toolbar"]');
	    if (toolbar) toolbar.appendChild(ui.undiscordBtn);
	  }
	  mountBtn();

	  // watch for DOM changes and re-mount button
	  const discordElm = document.querySelector('#app-mount');
	  if (discordElm) {
	    let observerThrottle = null;
	    const observer = new MutationObserver(() => {
	      if (observerThrottle) return;
	      observerThrottle = setTimeout(() => {
	        observerThrottle = null;
	        if (!discordElm.contains(ui.undiscordBtn)) mountBtn();
	      }, OBSERVER_THROTTLE_MS);
	    });
	    observer.observe(discordElm, { attributes: false, childList: true, subtree: true });
	  }

	  function toggleWindow() {
	    if (ui.undiscordWindow.style.display !== 'none') {
	      ui.undiscordWindow.style.display = 'none';
	      ui.undiscordBtn.style.color = 'var(--interactive-icon-default, var(--interactive-normal))';
	    } else {
	      ui.undiscordWindow.style.display = '';
	      ui.undiscordBtn.style.color = 'var(--interactive-icon-active, var(--interactive-active))';
	    }
	  }

	  // cache element references
	  ui.logArea = $('#logArea');
	  ui.autoScroll = $('#autoScroll');
	  ui.progressMain = $('#progressBar');
	  ui.progressIcon = ui.undiscordBtn.querySelector('progress');
	  ui.percent = $('#progressPercent');

	  // register handlers, progress, and log
	  registerHandlers(undiscordCore, ui, $, toggleWindow);
	  setupProgress(undiscordCore, ui, $);
	  setLogFn(createPrintLog(ui));
	}

	initUI();

})();
