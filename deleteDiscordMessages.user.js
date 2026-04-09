// ==UserScript==
// @name            Undiscord
// @description     Delete all messages in a Discord channel or DM (Bulk deletion)
// @version         5.2.6
// @author          victornpb
// @homepageURL     https://github.com/victornpb/undiscord
// @supportURL      https://github.com/victornpb/undiscord/discussions
// @match           https://*.discord.com/app
// @match           https://*.discord.com/channels/*
// @match           https://*.discord.com/login
// @license         MIT
// @namespace       https://github.com/victornpb/deleteDiscordMessages
// @icon            https://victornpb.github.io/undiscord/images/icon128.png
// @contributionURL https://www.buymeacoffee.com/vitim
// @grant           GM_setValue
// @grant           GM_getValue
// @attribution     Original project (https://github.com/victornpb/undiscord)
// @downloadURL https://update.greasyfork.org/scripts/406540/Undiscord.user.js
// @updateURL https://update.greasyfork.org/scripts/406540/Undiscord.meta.js
// ==/UserScript==
(function () {
	'use strict';

	/* rollup-plugin-baked-env */
	const VERSION = "5.2.6";

var themeCss = (`
#undiscord {
	--ud-bg-base:      #0e0f11;
	--ud-bg-surface:   #14161a;
	--ud-bg-raised:    #1b1e24;
	--ud-bg-hover:     #22262e;
	--ud-bg-input:     #0c0d10;
	--ud-border:       rgba(255,255,255,0.07);
	--ud-border-hi:    rgba(255,255,255,0.13);
	--ud-amber:        #f59e0b;
	--ud-amber-dim:    #b45309;
	--ud-amber-muted:  rgba(245,158,11,0.10);
	--ud-text-primary: #e8eaf0;
	--ud-text-sec:     #8b90a0;
	--ud-text-muted:   #4a5060;
	--ud-red:          #ef4444;
	--ud-green:        #4ade80;
	--ud-blue:         #60a5fa;
	--ud-yellow:       #fbbf24;
	--ud-font-ui:      'Segoe UI', system-ui, -apple-system, sans-serif;
	--ud-font-mono:    'Consolas', 'Menlo', 'Liberation Mono', monospace;

	/* control tokens */
	--ud-control-bg:       var(--ud-bg-raised);
	--ud-control-bg-hover: var(--ud-bg-hover);
	--ud-control-border:   var(--ud-border-hi);
	--ud-control-text:     var(--ud-text-primary);
	--ud-control-scheme:   dark;
}

/* Base window */
#undiscord.browser {
	border: 1px solid var(--ud-border-hi);
	overflow: hidden;
}
#undiscord, #undiscord * {
	box-sizing: border-box;
	font-family: var(--ud-font-ui);
}
#undiscord {
	color: var(--ud-text-primary);
	background: var(--ud-bg-surface);
}

/* Header / titlebar */
#undiscord .header {
	background: var(--ud-bg-base);
	border-bottom: 1px solid var(--ud-border);
	height: 44px;
	min-height: 44px;
	display: flex;
	align-items: center;
	padding: 0 14px;
	gap: 10px;
	cursor: grab;
}
#undiscord .header .icon {
	color: var(--ud-amber);
	flex-shrink: 0;
	cursor: pointer;
	display: flex;
	align-items: center;
}
#undiscord .header .icon:hover { color: var(--ud-text-primary); }
#undiscord .header h3 {
	font-size: 13px;
	font-weight: 600;
	color: var(--ud-text-primary);
	letter-spacing: 0.02em;
	flex-shrink: 0;
}
#undiscord .header .vert-divider {
	display: none;
}
#undiscord .header > span {
	font-size: 11px;
	font-weight: 600;
	background: var(--ud-amber-muted);
	color: var(--ud-amber);
	border: 1px solid rgba(245,158,11,0.2);
	padding: 2px 8px;
	border-radius: 999px;
	letter-spacing: 0.05em;
}
#undiscord .spacer { flex: 1; }

/* Sidebar */
#undiscord .sidebar {
	background: var(--ud-bg-base) !important;
	border-right: 1px solid var(--ud-border);
	width: 240px !important;
	min-width: 240px !important;
	padding: 0 !important;
	overflow-y: auto;
	overflow-x: hidden;
}

/* Section headers (details > summary) */
#undiscord .sidebar summary {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 9px 14px;
	font-size: 10px;
	font-weight: 600;
	letter-spacing: 0.10em;
	text-transform: uppercase;
	color: var(--ud-text-muted);
	cursor: pointer;
	user-select: none;
	border-bottom: 1px solid var(--ud-border);
	white-space: nowrap;
	border-radius: 0;
	list-style: none;
}
#undiscord .sidebar summary::-webkit-details-marker { display: none; }
#undiscord .sidebar summary::before {
	content: '';
	width: 5px;
	height: 5px;
	border-radius: 50%;
	background: var(--ud-amber);
	flex-shrink: 0;
	opacity: 0.5;
}
#undiscord .sidebar details[open] summary::before { opacity: 1; }
#undiscord .sidebar summary:hover { color: var(--ud-text-sec); }

#undiscord .sidebar fieldset {
	border: none;
	padding: 0;
	margin: 0;
}
#undiscord .sidebar details {
	border-bottom: 1px solid var(--ud-border);
}
#undiscord .sidebar details > *:not(summary) {
	padding: 10px 14px;
}

/* Labels */
#undiscord legend,
#undiscord .sidebar label:not(.row) {
	display: block;
	font-size: 10px;
	font-weight: 600;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: var(--ud-text-muted);
	margin-bottom: 6px;
	font-family: var(--ud-font-ui);
	cursor: default;
}

#undiscord fieldset {
	min-width: 0;
}

#undiscord legend {
	display: block;
	position: relative;
	width: 100%;
	padding-right: 42px;
	margin-bottom: 6px;
}

#undiscord legend a {
	position: absolute;
	right: 0;
	top: 0;
}

/* Inputs */
#undiscord input[type="text"],
#undiscord input[type="search"],
#undiscord input[type="password"],
#undiscord input[type="datetime-local"],
#undiscord input[type="number"],
#undiscord select {
	background: var(--ud-bg-input) !important;
	border: 1px solid var(--ud-border-hi) !important;
	border-radius: 4px !important;
	color: var(--ud-text-primary) !important;
	font-family: var(--ud-font-mono) !important;
	font-size: 11px !important;
	height: 32px !important;
	padding: 0 10px !important;
	outline: none;
	transition: border-color 0.15s, background 0.15s, color 0.15s;
}

#undiscord input[type="text"],
#undiscord input[type="search"],
#undiscord input[type="password"],
#undiscord input[type="datetime-local"],
#undiscord input[type="number"] {
	width: 100%;
}

#undiscord input[type="text"]:focus,
#undiscord input[type="search"]:focus,
#undiscord input[type="password"]:focus,
#undiscord input[type="datetime-local"]:focus,
#undiscord input[type="number"]:focus,
#undiscord select:focus {
	border-color: var(--ud-amber) !important;
}
#undiscord input::placeholder { color: var(--ud-text-muted) !important; }

#undiscord input[type="checkbox"] {
	accent-color: var(--ud-amber);
	width: 13px;
	height: 13px;
	cursor: pointer;
	flex-shrink: 0;
}
#undiscord input[type="range"] {
	accent-color: var(--ud-amber);
	height: 3px;
	cursor: pointer;
	background: transparent;
	border: none !important;
	padding: 0 !important;
	width: 100%;
}

/* Select / dropdown styling */
#undiscord select,
#undiscord #themeSelect {
	background: var(--ud-control-bg) !important;
	color: var(--ud-control-text) !important;
	border: 1px solid var(--ud-control-border) !important;
	color-scheme: var(--ud-control-scheme);
	appearance: none;
	-webkit-appearance: none;
	-moz-appearance: none;
	padding-right: 32px !important;
	background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'><path d='M5 7.5L10 12.5L15 7.5' stroke='%238b90a0' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/></svg>");
	background-repeat: no-repeat;
	background-position: right 8px center;
	background-size: 14px 14px;
	width: auto;
	max-width: 100%;
}

#undiscord select:hover,
#undiscord #themeSelect:hover {
	background-color: var(--ud-control-bg-hover) !important;
	color: var(--ud-control-text) !important;
}

#undiscord select option,
#undiscord #themeSelect option {
	background: var(--ud-control-bg) !important;
	color: var(--ud-control-text) !important;
}

/* full width selects only where forms need it */
#undiscord .sidebar select,
#undiscord fieldset select,
#undiscord .input-wrapper select,
#undiscord .multiInput select {
	width: 100%;
	min-width: 0;
}

/* compact header controls */
#undiscord .header select,
#undiscord .header #themeSelect {
	width: auto !important;
	min-width: 88px;
	max-width: 140px;
	flex: 0 0 auto;
}

#undiscord .header button,
#undiscord .header .btn,
#undiscord .header #themeButton,
#undiscord .header .themeBtn {
	width: auto !important;
	min-width: 32px;
	flex: 0 0 auto;
}

/* multiInput / input-wrapper */
#undiscord .multiInput,
#undiscord .input-wrapper {
	display: flex;
	align-items: center;
	gap: 4px;
	background: none;
	border: none;
}
#undiscord .multiInput :first-child,
#undiscord .input-wrapper :first-child { flex: 1; min-width: 0; }
#undiscord .date-mask-overlay span { flex: none; }

/* Buttons */
#undiscord .btn,
#undiscord button {
	background: var(--ud-control-bg);
	border: 1px solid var(--ud-control-border);
	border-radius: 4px;
	color: var(--ud-control-text);
	font-family: var(--ud-font-ui);
	font-size: 10px;
	font-weight: 600;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	padding: 0 10px;
	height: 32px;
	min-height: 32px;
	min-width: 40px;
	width: auto;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	white-space: nowrap;
	flex-shrink: 0;
	transition: background 0.15s, color 0.15s, border-color 0.15s;
	position: relative;
}
#undiscord .btn:hover,
#undiscord button:hover {
	background: var(--ud-control-bg-hover);
	color: var(--ud-text-primary);
}

/* delete button */
#undiscord .danger {
	background: rgba(239,68,68,0.10) !important;
	border-color: rgba(239,68,68,0.25) !important;
	color: var(--ud-red) !important;
	width: auto !important;
	padding: 0 16px !important;
}
#undiscord .danger:hover {
	background: rgba(239,68,68,0.20) !important;
	border-color: rgba(239,68,68,0.45) !important;
	color: #f87171 !important;
}

#undiscord .sizeMedium { height: 32px; min-height: 32px; }
#undiscord .sizeMedium.icon { width: 32px; min-width: 32px; padding: 0; }

/* Divider */
#undiscord .divider,
#undiscord hr {
	border: none;
	border-bottom: 1px solid var(--ud-border);
	margin: 8px 0;
	padding: 0;
}
#undiscord .sidebar hr { margin: 0; }

/* Section description (small helper text) */
#undiscord .sectionDescription {
	font-size: 11px;
	color: var(--ud-text-sec);
	line-height: 1.5;
	margin-top: 6px;
	font-family: var(--ud-font-ui);
}
#undiscord .sectionDescription label {
	display: flex !important;
	align-items: center;
	gap: 7px;
	font-size: 11px !important;
	font-weight: 400 !important;
	letter-spacing: 0 !important;
	text-transform: none !important;
	color: var(--ud-text-sec) !important;
	cursor: pointer !important;
}

/* row / col helpers */
#undiscord .col { display: flex; flex-direction: column; }
#undiscord .row { display: flex; flex-direction: row; align-items: center; }
#undiscord .mb1 { margin-bottom: 6px; }

/* Info (bottom of sidebar) */
#undiscord .info {
	font-size: 10px;
	font-family: var(--ud-font-mono);
	color: var(--ud-text-muted);
	padding: 12px 14px;
	line-height: 1.7;
	border-top: 1px solid var(--ud-border);
}

/* Log area */
#undiscord #logArea {
	font-family: var(--ud-font-mono);
	font-size: 11px;
	line-height: 1.7;
	color: var(--ud-text-sec);
	padding: 14px 18px;
	cursor: auto;
	user-select: text;
	flex: 1;
	overflow: auto;
	white-space: pre-wrap;
}
/* Log level colours */
#undiscord .log         { margin-bottom: 2px; }
#undiscord .log-debug   { color: var(--ud-text-sec); }
#undiscord .log-info    { color: var(--ud-blue); }
#undiscord .log-verb    { color: var(--ud-text-muted); }
#undiscord .log-warn    { color: var(--ud-yellow); }
#undiscord .log-error   { color: var(--ud-red); }
#undiscord .log-success { color: var(--ud-green); }

/* Streamer mode */
#undiscord.redact .priv { display: none !important; }
#undiscord.redact x:not(:active) {
	color: transparent !important;
	background: var(--ud-bg-raised) !important;
	border-radius: 3px;
	cursor: default;
	user-select: none;
}
#undiscord.redact x:hover { position: relative; }
#undiscord.redact x:hover::after {
	content: "Redacted (Streamer mode: ON)";
	position: absolute;
	top: -28px;
	left: -10px;
	padding: 3px 8px;
	font-size: 10px;
	background: var(--ud-bg-raised);
	color: var(--ud-text-sec);
	border: 1px solid var(--ud-border-hi);
	border-radius: 4px;
	white-space: nowrap;
	pointer-events: none;
}
#undiscord.redact [priv] { -webkit-text-security: disc !important; }

/* Disabled = hidden (original behaviour kept) */
#undiscord :disabled { display: none; }

/* Scrollbar */
#undiscord .scroll::-webkit-scrollbar { width: 6px; height: 6px; }
#undiscord .scroll::-webkit-scrollbar-thumb {
	background: var(--ud-border-hi);
	border-radius: 3px;
}
#undiscord .scroll::-webkit-scrollbar-track { background: transparent; }

/* Links */
#undiscord a { color: var(--ud-amber-dim); text-decoration: none; }
#undiscord a:hover { color: var(--ud-amber); }

/* Misc */
#undiscord sup { vertical-align: top; font-size: 9px; color: var(--ud-text-muted); }
#undiscord .log b { color: var(--ud-text-primary); font-weight: 600; }
#undiscord .log i { color: var(--ud-text-sec); font-style: normal; }

/* Default theme */
#undiscord[data-theme="default"] {
	--ud-amber:       #5865f2;
	--ud-amber-dim:   #4752c4;
	--ud-amber-muted: rgba(88,101,242,0.12);
}

/* White theme */
#undiscord[data-theme="white"] {
	--ud-bg-base:      #f2f3f5;
	--ud-bg-surface:   #ffffff;
	--ud-bg-raised:    #e3e5e8;
	--ud-bg-hover:     #d4d7dc;
	--ud-bg-input:     #ebedef;
	--ud-border:       rgba(0,0,0,0.08);
	--ud-border-hi:    rgba(0,0,0,0.15);
	--ud-text-primary: #060607;
	--ud-text-sec:     #4e5058;
	--ud-text-muted:   #80848e;
	--ud-amber:        #5865f2;
	--ud-amber-dim:    #4752c4;
	--ud-amber-muted:  rgba(88,101,242,0.12);
	--ud-red:          #da373c;
	--ud-green:        #23a55a;
	--ud-blue:         #5865f2;
	--ud-yellow:       #f0b232;

	/* control fix */
	--ud-control-bg:       #f2f3f5;
	--ud-control-bg-hover: #e3e5e8;
	--ud-control-border:   rgba(0,0,0,0.18);
	--ud-control-text:     #2e3338;
	--ud-control-scheme:   light;
}

/* white theme - main panel background */
#undiscord[data-theme="white"] .main   { background: #ffffff; }
#undiscord[data-theme="white"] .tbar   { background: #f2f3f5; border-color: rgba(0,0,0,0.08); }
#undiscord[data-theme="white"] .footer { background: #e3e5e8; border-color: rgba(0,0,0,0.08); }

/* white theme arrow */
#undiscord[data-theme="white"] select,
#undiscord[data-theme="white"] #themeSelect {
	background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'><path d='M5 7.5L10 12.5L15 7.5' stroke='%234e5058' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/></svg>");
}
`);

// MAIN LAYOUT CSS
var mainCss = (`
/* Trash icon button in Discord toolbar */
#undicord-btn {
	position: relative;
	width: auto;
	height: 24px;
	margin: 0 8px;
	cursor: pointer;
	color: var(--interactive-normal);
	flex: 0 0 auto;
}
#undicord-btn progress {
	position: absolute;
	top: 23px;
	left: -4px;
	width: 32px;
	height: 4px;
	display: none;
	accent-color: #f59e0b;
}
#undicord-btn.running { color: #ef4444 !important; }
#undicord-btn.running progress { display: block; }

/* Main window */
#undiscord {
	position: fixed;
	z-index: 100;
	top: 58px;
	right: 10px;
	display: flex;
	flex-direction: column;
	width: 820px;
	height: 80vh;
	min-width: 560px;
	max-width: 100vw;
	min-height: 420px;
	max-height: 100vh;
	border-radius: 10px;
	will-change: top, left, width, height;
}
#undiscord .header .icon { cursor: pointer; }

/* Window body split */
#undiscord .window-body {
	display: flex;
	flex-direction: row;
	height: calc(100% - 44px);
}

/* Sidebar toggle */
#undiscord.hide-sidebar .sidebar { display: none; }
#undiscord.hide-sidebar .main { max-width: 100%; }

/* Main panel */
#undiscord .main {
	display: flex;
	flex-direction: column;
	flex: 1;
	min-width: 0;
	background: #14161a;
}

/* Toolbar */
#undiscord .tbar {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: center;
	gap: 6px;
	padding: 8px 12px;
	background: #1b1e24;
	border-bottom: 1px solid rgba(255,255,255,0.07);
	flex-shrink: 0;
}
#undiscord .tbar button { margin: 0; }

/* Progress bar */
#undiscord #progressBar {
	flex: 1 0 100%;
	height: 3px;
	border-radius: 2px;
	accent-color: #f59e0b;
	display: none;
}

/* Footer */
#undiscord .footer {
	height: 34px;
	padding: 0 14px;
	padding-right: 30px;
	display: flex;
	align-items: center;
	gap: 10px;
	border-top: 1px solid rgba(255,255,255,0.07);
	background: #0e0f11;
	flex-shrink: 0;
}
#undiscord .footer #progressPercent {
	font-size: 10px;
	font-family: 'Consolas', 'Menlo', monospace;
	color: rgba(255,255,255,0.3);
	flex: 1;
}
#undiscord .footer label {
	font-size: 10px;
	font-weight: 600;
	letter-spacing: 0.07em;
	text-transform: uppercase;
	color: rgba(255,255,255,0.3);
	display: flex;
	align-items: center;
	gap: 5px;
	cursor: pointer;
	user-select: none;
}

/* Log notice box (startup message) */
#undiscord .log-notice {
	background: rgba(245,158,11,0.08);
	border: 1px solid rgba(245,158,11,0.18);
	border-left: 3px solid #f59e0b;
	border-radius: 4px;
	padding: 9px 12px;
	font-size: 11px;
	color: #8b90a0;
	margin-bottom: 14px;
	line-height: 1.6;
	white-space: normal;
	word-wrap: break-word;
	width: fit-content;
	max-width: 100%;
}

/* Import JSON horizontal row layout */
#undiscord .importJson {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
}

#undiscord .importJson .fileInputReal {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
}

#undiscord .importJson .filePickerBtn {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    height: 32px !important;
    line-height: 32px;
    padding: 0 10px;
    margin: 0;
    background: var(--ud-control-bg);
    border: 1px solid var(--ud-control-border);
    border-radius: 4px;
    color: var(--ud-control-text);
    font-family: var(--ud-font-ui);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    transition: background 0.15s, color 0.15s;
}

#undiscord .importJson .filePickerBtn:hover {
    background: var(--ud-control-bg-hover);
    color: var(--ud-text-primary);
}

#undiscord .importJson .filePickerName {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    height: 32px !important;
    line-height: 32px;
    padding: 0 10px;
    margin: 0;
    background: var(--ud-bg-input);
    border: 1px solid var(--ud-border-hi);
    border-radius: 4px;
    color: var(--ud-text-sec);
    font-family: var(--ud-font-mono);
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

#undicord-btn progress { accent-color: var(--ud-amber); }

#undiscord #progressBar { accent-color: var(--ud-amber); }

#undiscord .log-notice {
    background: var(--ud-amber-muted);
    border: 1px solid rgba(245,158,11,0.18);
    border-left: 3px solid var(--ud-amber);
}

/* Date input mask overlay */
#undiscord .date-input-wrap {
    position: relative;
    width: 100%;
}
#undiscord .date-input-wrap input {
    width: 100%;
    position: relative;
    z-index: 1;
    background: var(--ud-bg-input) !important;
    color: transparent !important;
    caret-color: transparent !important; /* fake caret handles this */
}
#undiscord .date-mask-overlay {
    position: absolute;
    inset: 1px;
    display: block;
    line-height: 30px;
    padding: 0 10px;
    font-family: var(--ud-font-mono);
    font-size: 11px;
    pointer-events: none;
    z-index: 2;
    overflow: hidden;
    white-space: pre;
}
#undiscord .date-mask-overlay .typed {
    color: var(--ud-text-primary);      /* show typed text via overlay */
    white-space: pre;
}
#undiscord .date-mask-overlay .remaining {
    color: var(--ud-text-muted);
    white-space: pre;
}
#undiscord .date-fake-caret {
    display: none;
    width: 1px;
    height: 0.85em;
    background: var(--ud-text-primary);
    vertical-align: middle;
    margin-right: -1px;
    animation: ud-caret-blink 1.2s step-end infinite;
}
@keyframes ud-caret-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}

`);
	var dragCss = (`
[name^="grab-"] { position: absolute; --size: 6px; --corner-size: 16px; --offset: -1px; z-index: 201; }
[name^="grab-"]:hover{ background: rgba(128,128,128,0.1); }
[name="grab-t"] { top: 0px; left: var(--corner-size); right: var(--corner-size); height: var(--size); margin-top: var(--offset); cursor: ns-resize; }
[name="grab-r"] { top: var(--corner-size); bottom: var(--corner-size); right: 0px; width: var(--size); margin-right: var(--offset); cursor: ew-resize; }
[name="grab-b"] { bottom: 0px; left: var(--corner-size); right: var(--corner-size); height: var(--size); margin-bottom: var(--offset); cursor: ns-resize; }
[name="grab-l"] { top: var(--corner-size); bottom: var(--corner-size); left: 0px; width: var(--size); margin-left: var(--offset); cursor: ew-resize; }
[name="grab-tl"] { top: 0px; left: 0px; width: var(--corner-size); height: var(--corner-size); margin-top: var(--offset); margin-left: var(--offset); cursor: nwse-resize; }
[name="grab-tr"] { top: 0px; right: 0px; width: var(--corner-size); height: var(--corner-size); margin-top: var(--offset); margin-right: var(--offset); cursor: nesw-resize; }
[name="grab-br"] { bottom: 0px; right: 0px; width: var(--corner-size); height: var(--corner-size); margin-bottom: var(--offset); margin-right: var(--offset); cursor: nwse-resize; }
[name="grab-bl"] { bottom: 0px; left: 0px; width: var(--corner-size); height: var(--corner-size); margin-bottom: var(--offset); margin-left: var(--offset); cursor: nesw-resize; }
`);

	// Trash button injected into Discord's toolbar
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
<div id="undiscord" class="browser">
    <div class="header">
        <svg class="icon" aria-hidden="false" width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"></path>
            <path fill="currentColor" d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"></path>
        </svg>
        <h3>Undiscord</h3>
        <span>v{{VERSION}}</span>
      <select id="themeSelect" title="Theme" style="
      background:#0c0d10;border:1px solid rgba(255,255,255,0.1);
      color:#8b90a0;border-radius:4px;font-size:10px;font-weight:600;
      letter-spacing:0.05em;height:22px;padding:0 6px;cursor:pointer;
      text-transform:uppercase;outline:none;flex-shrink:0;">
      <option value="default">Default</option>
      <option value="white">White</option>
      <option value="orange">Orange</option>
      </select>
        <div class="spacer"></div>
        <div id="hide" class="icon" aria-label="Close" role="button" tabindex="0"
             style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:4px;cursor:pointer;color:#4a5060;transition:background 0.15s,color 0.15s;"
             onmouseover="this.style.background='rgba(239,68,68,0.15)';this.style.color='#ef4444'"
             onmouseout="this.style.background='';this.style.color='#4a5060'">
            <svg aria-hidden="false" width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"></path>
            </svg>
        </div>
    </div>

    <div class="window-body">
        <div class="sidebar scroll">

            <details open>
                <summary>General</summary>
                <fieldset>
                    <legend>Author ID <a href="{{WIKI}}/authorId" target="_blank" rel="noopener noreferrer">help</a></legend>
                    <div class="multiInput">
                        <div class="input-wrapper">
                            <input class="input" id="authorId" type="text" placeholder="000000000000000000" priv>
                        </div>
                        <button id="getAuthor">me</button>
                    </div>
                </fieldset>
                <fieldset style="margin-top:10px;">
                    <legend>Server ID <a href="{{WIKI}}/guildId" target="_blank" rel="noopener noreferrer">help</a></legend>
                    <div class="multiInput">
                        <div class="input-wrapper">
                            <input class="input" id="guildId" type="text" placeholder="000000000000000000" priv>
                        </div>
                        <button id="getGuild">current</button>
                    </div>
                </fieldset>
                <fieldset style="margin-top:10px;">
                    <legend>Channel ID <a href="{{WIKI}}/channelId" target="_blank" rel="noopener noreferrer">help</a></legend>
                    <div class="multiInput mb1">
                        <div class="input-wrapper">
                            <input class="input" id="channelId" type="text" placeholder="000000000000000000" priv>
                        </div>
                        <button id="getChannel">current</button>
                    </div>
                    <div class="sectionDescription">
                        <label class="row"><input id="includeNsfw" type="checkbox"> NSFW channel</label>
                    </div>
                </fieldset>
            </details>

            <details>
                <summary>Wipe Archive</summary>
                <fieldset>
                    <legend>Import index.json <a href="{{WIKI}}/importJson" target="_blank" rel="noopener noreferrer">help</a></legend>

                    <div class="importJson">
                        <input
                            type="file"
                            id="importJsonInput"
                            class="fileInputReal"
                            accept="application/json,.json"
                            aria-describedby="importJsonFileName"
                        >
                        <label for="importJsonInput" class="filePickerBtn">Choose File</label>
                        <span id="importJsonFileName" class="filePickerName">No file selected</span>
                    </div>

                    <div class="sectionDescription" style="margin-top:8px;">
                        Import the <code style="font-family:monospace;font-size:10px;color:var(--ud-amber);">messages/index.json</code> file from your Discord data archive.
                    </div>
                </fieldset>
            </details>

            <details>
                <summary>Filter</summary>
                <fieldset>
                    <legend>Contains text <a href="{{WIKI}}/filters" target="_blank" rel="noopener noreferrer">help</a></legend>
                    <div class="input-wrapper">
                        <input id="search" type="text" placeholder="Search phrase…" priv>
                    </div>
                </fieldset>
                <fieldset style="margin-top:10px;">
                    <legend>Pattern (regex) <a href="{{WIKI}}/pattern" target="_blank" rel="noopener noreferrer">help</a></legend>
                    <div class="input-wrapper">
                        <input id="pattern" type="text" placeholder="/expression/i" priv>
                    </div>
                </fieldset>
                <div class="sectionDescription" style="margin-top:10px;">
                    <label><input id="hasLink" type="checkbox"> has: link</label>
                </div>
                <div class="sectionDescription">
                    <label><input id="hasFile" type="checkbox"> has: file</label>
                </div>
                <div class="sectionDescription">
                    <label><input id="includePinned" type="checkbox"> include pinned</label>
                </div>
            </details>

            <details>
                <summary>Message Range</summary>
                <fieldset>
                    <legend>After message <a href="{{WIKI}}/messageId" target="_blank" rel="noopener noreferrer">help</a></legend>
                    <div class="multiInput mb1">
                        <div class="input-wrapper">
                            <input id="minId" type="text" placeholder="Message ID" priv>
                        </div>
                        <button id="pickMessageAfter">pick</button>
                    </div>
                </fieldset>
                <fieldset style="margin-top:10px;">
                    <legend>Before message</legend>
                    <div class="multiInput">
                        <div class="input-wrapper">
                            <input id="maxId" type="text" placeholder="Message ID" priv>
                        </div>
                        <button id="pickMessageBefore">pick</button>
                    </div>
                </fieldset>
            </details>

            <details>
                <summary>Date Range</summary>
                <fieldset>
                    <legend>After date <a href="{{WIKI}}/dateRange" target="_blank" rel="noopener noreferrer">help</a></legend>
                    <div class="input-wrapper mb1">
                        <div class="date-input-wrap">
                            <input id="minDate" type="text" maxlength="16" title="Messages posted AFTER this date">
                            <div class="date-mask-overlay" aria-hidden="true"><span class="typed"></span><span class="date-fake-caret" aria-hidden="true"></span><span class="remaining">YYYY-MM-DD HH:MM</span></div>
                        </div>
                    </div>
                </fieldset>
                <fieldset style="margin-top:10px;">
                    <legend>Before date <a href="{{WIKI}}/dateRange" target="_blank" rel="noopener noreferrer">help</a></legend>
                    <div class="input-wrapper">
                        <div class="date-input-wrap">
                            <input id="maxDate" type="text" maxlength="16" title="Messages posted BEFORE this date">
                            <div class="date-mask-overlay" aria-hidden="true"><span class="typed"></span><span class="remaining">YYYY-MM-DD HH:MM</span></div>
                        </div>
                    </div>
                </fieldset>
                <div class="sectionDescription" style="margin-top:8px;">
                    * Date range is ignored when a message interval is set.
                </div>
            </details>

            <details>
                <summary>Advanced</summary>
                <fieldset>
                    <legend>Search delay <a href="{{WIKI}}/delay" target="_blank" rel="noopener noreferrer">help</a></legend>
                    <div class="input-wrapper" style="gap:8px;">
                        <input id="searchDelay" type="range" value="30000" step="100" min="100" max="60000">
                        <div id="searchDelayValue" style="font-size:10px;font-family:monospace;color:var(--ud-amber);width:92px;flex-shrink:0;text-align:right;"></div>
                    </div>
                </fieldset>
                <fieldset style="margin-top:10px;">
                    <legend>Delete delay <a href="{{WIKI}}/delay" target="_blank" rel="noopener noreferrer">help</a></legend>
                    <div class="input-wrapper" style="gap:8px;">
                        <input id="deleteDelay" type="range" value="1000" step="50" min="50" max="10000">
                        <div id="deleteDelayValue" style="font-size:10px;font-family:monospace;color:var(--ud-amber);width:92px;flex-shrink:0;text-align:right;"></div>
                    </div>
                </fieldset>
                <fieldset style="margin-top:10px;">
                    <legend>Auth token <a href="{{WIKI}}/authToken" target="_blank" rel="noopener noreferrer">help</a></legend>
                    <div class="multiInput">
                        <div class="input-wrapper">
                            <input class="input" id="token" type="password" autocomplete="dont" placeholder="••••••••••••••••" priv>
                        </div>
                        <button id="getToken">fill</button>
                    </div>
                </fieldset>
            </details>
          <div class="info" style="display:flex;align-items:center;justify-content:space-between;">
          <span>Undiscord {{VERSION}}</span>
          <button id="creditsBtn" style="font-size:9px;padding:0 8px;height:22px;min-height:22px;">Credits</button>
          </div>

          <div id="creditsModal" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.7);z-index:200;align-items:center;justify-content:center;pointer-events:none;">
              <div style="background:var(--ud-bg-raised);border:1px solid var(--ud-border-hi);border-radius:8px;padding:24px 28px;min-width:280px;max-width:380px;position:relative;pointer-events:auto;">
              <div style="font-size:13px;font-weight:700;color:var(--ud-text-primary);margin-bottom:16px;letter-spacing:0.02em;">Credits</div>
              <div style="font-size:11px;color:var(--ud-text-muted);font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">Original Author</div>
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                <div>
                    <a href="https://github.com/victornpb" target="_blank" rel="noopener noreferrer" style="font-size:12px;color:var(--ud-text-primary);font-weight:600;text-decoration:none;">victornpb</a>
                    <a href="https://github.com/victornpb/undiscord" target="_blank" rel="noopener noreferrer" style="font-size:10px;display:block;">github.com/victornpb/undiscord</a>
                    </div>
                </div>
                <div style="font-size:11px;color:var(--ud-text-muted);font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">UI Redesign &amp; Modifications</div>
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
                    <div>
                        <a href="https://github.com/ForceWarrior" target="_blank" rel="noopener noreferrer" style="font-size:12px;color:var(--ud-text-primary);font-weight:600;text-decoration:none;">Force Warrior</a>
                        <a href="https://github.com/ForceWarrior/undiscord-Fixed" target="_blank" rel="noopener noreferrer" style="font-size:10px;display:block;">https://github.com/ForceWarrior/undiscord-Fixed</a>
                        <div style="font-size:10px;color:var(--ud-text-sec);">Theme system · UX improvements · Fixed trashcan not appearing</div>
                    </div>
                </div>
                <div style="border-top:1px solid var(--ud-border);padding-top:12px;font-size:10px;color:var(--ud-text-muted);line-height:1.6;">
                    Licensed under MIT. Original project by victornpb.
                </div>
                <button id="creditsClose" style="position:absolute;top:12px;right:12px;width:24px;height:24px;min-height:24px;min-width:24px;padding:0;font-size:14px;">✕</button>
           </div>
          </div>
        </div>

        <div class="main col">
            <div class="tbar col">
                <div class="row" style="gap:6px;">
                    <button id="toggleSidebar" class="sizeMedium icon" title="Toggle sidebar">☰</button>
                    <button id="start" class="sizeMedium danger" style="width:140px;" title="Start the deletion process">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="margin-right:6px;flex-shrink:0;">
                            <path d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"/>
                            <path d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"/>
                        </svg>
                        Delete
                    </button>
                    <button id="stop" class="sizeMedium" title="Stop the deletion process" disabled>⏹ Stop</button>
                    <button id="clear" class="sizeMedium">Clear log</button>
                    <div class="spacer"></div>
                    <label class="row" style="gap:6px;font-size:10px;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;color:#4a5060;cursor:pointer;user-select:none;" title="Hide sensitive information on screen">
                        <input id="redact" type="checkbox" checked> Streamer mode
                    </label>
                </div>
                <div class="row" style="margin-top:6px;">
                    <progress id="progressBar" style="display:none;"></progress>
                </div>
            </div>

            <pre id="logArea" class="logarea scroll">
                <div class="log-notice">Undiscord may be working slower than usual and require multiple attempts due to a recent Discord update. We're working on a fix, thanks for your patience.</div>
            </pre>

            <div class="tbar footer row">
                <div id="progressPercent"></div>
                <a href="{{HOME}}" target="_blank" rel="noopener noreferrer"
                   style="font-size:10px;font-weight:600;letter-spacing:0.05em;white-space:nowrap;flex-shrink:0;">
                    ⭐ Star original
                </a>
                <a href="https://github.com/ForceWarrior/undiscord-Fixed" target="_blank" rel="noopener noreferrer"
                   style="font-size:10px;font-weight:600;letter-spacing:0.05em;white-space:nowrap;flex-shrink:0;">
                    ⭐ Star this version
                </a>
                <a href="{{HOME}}/discussions" target="_blank" rel="noopener noreferrer"
                   style="font-size:10px;font-weight:600;letter-spacing:0.05em;white-space:nowrap;flex-shrink:0;">
                    Issues or help
                </a>
                <span class="spacer"></span>
                <label style="display:flex;align-items:center;gap:5px;font-size:10px;font-weight:600;letter-spacing:0.07em;text-transform:uppercase;color:#4a5060;cursor:pointer;user-select:none;">
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

	var logFn;
	const setLogFn = (fn) => logFn = fn;

	// Helpers
	const wait = async ms => new Promise(done => setTimeout(done, ms));
	const msToHMS = s => `${s / 3.6e6 | 0}h ${(s % 3.6e6) / 6e4 | 0}m ${(s % 6e4) / 1000 | 0}s`;
	const escapeHTML = html => String(html).replace(/[&<"']/g, m => ({ '&': '&amp;', '<': '&lt;', '"': '&quot;', '\'': '&#039;' })[m]);
	const redact = str => `<x>${escapeHTML(str)}</x>`;
	const queryString = params => params.filter(p => p[1] !== undefined).map(p => p[0] + '=' + encodeURIComponent(p[1])).join('&');
	const ask = async msg => new Promise(resolve => setTimeout(() => resolve(window.confirm(msg)), 10));
	const toSnowflake = (date) => /:/.test(date) ? ((new Date(date).getTime() - 1420070400000) * Math.pow(2, 22)) : date;
	const replaceInterpolations = (str, obj, removeMissing = false) => str.replace(/\{\{([\w_]+)\}\}/g, (m, key) => obj[key] || (removeMissing ? '' : m));

	const PREFIX$1 = '[UNDISCORD]';

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
			includePinned: null, // Delete messages that are pinned
			pattern: null, // Only delete messages that match the regex (insensitive)
			searchDelay: null, // Delay each time we fetch for more messages
			deleteDelay: null, // Delay between each delete operation
			maxAttempt: 2, // Attempts to delete a single message if it fails
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
				offset: 0,
				iterations: 0,

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

					if (await this.confirm() === false) {
						this.state.running = false; // break out of a job
						break; // immmediately stop this iteration
					}

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
					log.verb('[End state]', this.state);
					if (isJob) break; // break without stopping if this is part of a job
					this.state.running = false;
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
			this.stats.etr = (this.options.searchDelay * Math.round(this.state.grandTotal / 25)) + ((this.options.deleteDelay + this.stats.avgPing) * this.state.grandTotal);
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
				log.error('Search request threw an error:', err);
				throw err;
			}

			// not indexed yet
			if (resp.status === 202) {
				let w = (await resp.json()).retry_after * 1000;
				w = w || this.stats.searchDelay; // Fix retry_after 0
				this.stats.throttledCount++;
				this.stats.throttledTotalTime += w;
				log.warn(`This channel isn't indexed yet. Waiting ${w}ms for discord to index it...`);
				await wait(w);
				return await this.search();
			}

			if (!resp.ok) {
				// searching messages too fast
				if (resp.status === 429) {
					let w = (await resp.json()).retry_after * 1000;
					w = w || this.stats.searchDelay; // Fix retry_after 0

					this.stats.throttledCount++;
					this.stats.throttledTotalTime += w;
					this.stats.searchDelay += w; // increase delay
					w = this.stats.searchDelay;
					log.warn(`Being rate limited by the API for ${w}ms! Increasing search delay...`);
					this.printStats();
					log.verb(`Cooling down for ${w * 2}ms before retrying...`);

					await wait(w * 2);
					return await this.search();
				}
				else {
					this.state.running = false;
					log.error(`Error searching messages, API responded with status ${resp.status}!\n`, await resp.json());
					throw resp;
				}
			}
			const data = await resp.json();
			this.state._seachResponse = data;
			console.log(PREFIX$1, 'search', data);
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

			console.log(PREFIX$1, 'filterResponse', this.state);
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
					const body = await resp.text();

					try {
						const r = JSON.parse(body);

						if (resp.status === 400 && r.code === 50083) {
							// 400 can happen if the thread is archived (code=50083)
							// in this case we need to "skip" this message from the next search
							// otherwise it will come up again in the next page (and fail to delete again)
							log.warn('Error deleting message (Thread is archived). Will increment offset so we don\'t search this in the next page...');
							this.state.offset++;
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

	function createElement(tag = 'div', attrs, parent) {
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

	function createElm(html) {
		const temp = document.createElement('div');
		temp.innerHTML = html;
		return temp.removeChild(temp.firstElementChild);
	}

	function insertCss(css) {
		const style = document.createElement('style');
		style.appendChild(document.createTextNode(css));
		document.head.appendChild(style);
		return style;
	}

	const messagePickerCss = `
body.undiscord-pick-message [data-list-id="chat-messages"] {
  background-color: var(--background-secondary-alt);
  box-shadow: inset 0 0 0px 2px var(--button-outline-brand-border);
}

body.undiscord-pick-message [id^="message-content-"]:hover {
  cursor: pointer;
  cursor: cell;
  background: var(--background-message-automod-hover);
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
  background-color: var(--button-secondary-background);
  color: var(--header-secondary);
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

	const messagePicker = {
		init() {
			insertCss(messagePickerCss);
		},
		grab(auxiliary) {
			return new Promise((resolve, reject) => {
				document.body.classList.add('undiscord-pick-message');
				if (auxiliary) document.body.classList.add(auxiliary);
				function clickHandler(e) {
					const message = e.target.closest('[id^="message-content-"]');
					if (message) {
						e.preventDefault();
						e.stopPropagation();
						e.stopImmediatePropagation();
						if (auxiliary) document.body.classList.remove(auxiliary);
						document.body.classList.remove('undiscord-pick-message');
						document.removeEventListener('click', clickHandler);
						try {
							resolve(message.id.match(/message-content-(\d+)/)[1]);
						} catch (e) {
							resolve(null);
						}
					}
				}
				document.addEventListener('click', clickHandler);
			});
		}
	};
	window.messagePicker = messagePicker;

	function getToken() {
		window.dispatchEvent(new Event('beforeunload'));
		const LS = document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage;
		try {
			return JSON.parse(LS.token);
		} catch {
			log.info('Could not automatically detect Authorization Token in local storage!');
			log.info('Attempting to grab token using webpack');
			return (window.webpackChunkdiscord_app.push([[''], {}, e => { window.m = []; for (let c in e.c) window.m.push(e.c[c]); }]), window.m).find(m => m?.exports?.default?.getToken !== void 0).exports.default.getToken();
		}
	}

	function getAuthorId() {
		const LS = document.body.appendChild(document.createElement('iframe')).contentWindow.localStorage;
		return JSON.parse(LS.user_id_cache);
	}

	function getGuildId() {
		const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
		if (m) return m[1];
		else alert('Could not find the Guild ID!\nPlease make sure you are on a Server or DM.');
	}

	function getChannelId() {
		const m = location.href.match(/channels\/([\w@]+)\/(\d+)/);
		if (m) return m[2];
		else alert('Could not find the Channel ID!\nPlease make sure you are on a Channel or DM.');
	}

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

	const PREFIX = '[UNDISCORD]';

	// -------------------------- User interface ------------------------------- //

	// links
	const HOME = 'https://github.com/victornpb/undiscord';
	const WIKI = 'https://github.com/victornpb/undiscord/wiki';

	const undiscordCore = new UndiscordCore();
	messagePicker.init();

	const ui = {
		undiscordWindow: null,
		undiscordBtn: null,
		logArea: null,
		autoScroll: null,

		// progress handler
		progressMain: null,
		progressIcon: null,
		percent: null,
	};
	const $ = s => ui.undiscordWindow.querySelector(s);

  const msLabel = ms => `${ms}ms (${+(ms / 1000).toFixed(1)}s)`; // helper for converting ms -> sec :D

	function initUI() {
		// Inject CSS in order: theme vars -> layout -> drag handles
		insertCss(themeCss);
		insertCss(mainCss);
		insertCss(dragCss);

		// Build the window from our template (interpolates VERSION, HOME, WIKI)
		const undiscordUI = replaceInterpolations(undiscordTemplate, {
			VERSION,
			HOME,
			WIKI,
		});
		ui.undiscordWindow = createElm(undiscordUI);
		document.body.appendChild(ui.undiscordWindow);

		// Enable drag and resize on the window using the header as the move handle
		new DragResize({ elm: ui.undiscordWindow, moveHandle: $('.header') });

		// Inject the trash-can button into Discord's toolbar
		ui.undiscordBtn = createElm(buttonHtml);
		ui.undiscordBtn.onclick = toggleWindow;
		function mountBtn() {
			const toolbar = document.querySelector('#app-mount [class*="toolbar"]')
				|| document.querySelector('[class*="toolBar"]')
				|| document.querySelector('[class*="chat"]')
				|| document.body;
			if (toolbar) toolbar.appendChild(ui.undiscordBtn);
		}
		mountBtn();

		// Re-mount the button if Discord's React tree re-renders and removes it
		const discordElm = document.querySelector('#app-mount');
		let observerThrottle = null;
		const observer = new MutationObserver((_mutationsList, _observer) => {
			if (observerThrottle) return;
			observerThrottle = setTimeout(() => {
				observerThrottle = null;
				if (!discordElm.contains(ui.undiscordBtn)) mountBtn();
			}, 3000);
		});
		observer.observe(discordElm, { attributes: false, childList: true, subtree: true });

		function toggleWindow() {
			if (ui.undiscordWindow.style.display !== 'none') {
				ui.undiscordWindow.style.display = 'none';
				ui.undiscordBtn.style.color = 'var(--interactive-normal)';
			}
			else {
				ui.undiscordWindow.style.display = '';
				ui.undiscordBtn.style.color = 'var(--interactive-active)';
			}
		}

		// Cache frequently-accessed elements
		ui.logArea = $('#logArea');
		ui.autoScroll = $('#autoScroll');
		ui.progressMain = $('#progressBar');
		ui.progressIcon = ui.undiscordBtn.querySelector('progress');
		ui.percent = $('#progressPercent');

		// Register event listeners (all unchanged from original)
		$('#hide').onclick = toggleWindow;
		$('#toggleSidebar').onclick = () => ui.undiscordWindow.classList.toggle('hide-sidebar');
		$('button#start').onclick = startAction;
		$('button#stop').onclick = stopAction;
		$('button#clear').onclick = () => ui.logArea.innerHTML = '';
		$('button#getAuthor').onclick = () => $('input#authorId').value = getAuthorId();
		$('button#getGuild').onclick = () => {
			const guildId = $('input#guildId').value = getGuildId();
			if (guildId === '@me') $('input#channelId').value = getChannelId();
		};
		$('button#getChannel').onclick = () => {
			$('input#channelId').value = getChannelId();
			$('input#guildId').value = getGuildId();
		};
		$('#redact').onchange = () => {
			const b = ui.undiscordWindow.classList.toggle('redact');
			if (b) alert('This mode will attempt to hide personal information, so you can screen share / take screenshots.\nAlways double check you are not sharing sensitive information!');
		};

    // importjson english only avoids scaling issues. might someday add a language choice if someone is ever willing to translate :)
    const importJsonInput = document.getElementById('importJsonInput');
    const importJsonFileName = document.getElementById('importJsonFileName');

    if (importJsonInput && importJsonFileName) {
      importJsonInput.addEventListener('change', () => {
        const name = importJsonInput.files && importJsonInput.files.length
          ? importJsonInput.files[0].name
          : 'No file selected';
        importJsonFileName.textContent = name;
        importJsonFileName.title = importJsonInput.files?.length ? name : '';
      });
    }

    // Theme switcher
    const themeSelect = $('#themeSelect');

    // localStorage is scoped to Discord's domain and gets wiped on refresh,
    // so I used GM_getValue/GM_setValue which persists in the userscript manager's own storage instead. :-)
    const savedTheme = GM_getValue('ud-theme', 'default');
    ui.undiscordWindow.dataset.theme = savedTheme;
    themeSelect.value = savedTheme;
    themeSelect.oninput = (e) => {
        ui.undiscordWindow.dataset.theme = e.target.value;
        GM_setValue('ud-theme', e.target.value);
    };

    themeSelect.addEventListener('mousedown', e => e.stopPropagation());

    const creditsModal = $('#creditsModal');
    $('#creditsBtn').onclick = () => { creditsModal.style.display = 'flex'; };
    $('#creditsClose').onclick = () => { creditsModal.style.display = 'none'; };
    creditsModal.onclick = (e) => { if (e.target === creditsModal) creditsModal.style.display = 'none'; };

		$('#pickMessageAfter').onclick = async () => {
			alert('Select a message on the chat.\nThe message below it will be deleted.');
			toggleWindow();
			const id = await messagePicker.grab('after');
			if (id) $('input#minId').value = id;
			toggleWindow();
		};
		$('#pickMessageBefore').onclick = async () => {
			alert('Select a message on the chat.\nThe message above it will be deleted.');
			toggleWindow();
			const id = await messagePicker.grab('before');
			if (id) $('input#maxId').value = id;
			toggleWindow();
		};
		$('button#getToken').onclick = () => $('input#token').value = fillToken();

    $('input#searchDelay').oninput = (e) => {
        const v = parseInt(e.target.value);
        if (v) { undiscordCore.options.searchDelay = v; GM_setValue('ud-searchDelay', v); }
        $('div#searchDelayValue').textContent = msLabel(e.target.value);
    };
    $('input#deleteDelay').oninput = (e) => {
        const v = parseInt(e.target.value);
        if (v) { undiscordCore.options.deleteDelay = v; GM_setValue('ud-deleteDelay', v); }
        $('div#deleteDelayValue').textContent = msLabel(e.target.value);
    };

    const savedSearchDelay = GM_getValue('ud-searchDelay', parseInt($('input#searchDelay').value));
    const savedDeleteDelay = GM_getValue('ud-deleteDelay', parseInt($('input#deleteDelay').value));
    $('input#searchDelay').value = savedSearchDelay;
    $('input#deleteDelay').value = savedDeleteDelay;
    undiscordCore.options.searchDelay = savedSearchDelay;
    undiscordCore.options.deleteDelay = savedDeleteDelay;
    $('div#searchDelayValue').textContent = msLabel(savedSearchDelay);
    $('div#deleteDelayValue').textContent = msLabel(savedDeleteDelay);
    
		// Wipe Archive import index.json from a Discord data export
		const fileSelection = $('input#importJsonInput');
		fileSelection.onchange = async () => {
			const files = fileSelection.files;

			// No files added
			if (files.length === 0) return log.warn('No file selected.');

			const channelIdField = $('input#channelId');

			// Force the guild id to be ourself (@me) since this is a DM archive
			const guildIdField = $('input#guildId');
			guildIdField.value = '@me';

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

		// Redirect console output into the log area now that UI is ready
		setLogFn(printLog);

		setupUndiscordCore();

    setupDateMask($('input#minDate'));
    setupDateMask($('input#maxDate'));
	}

	function printLog(type = '', args) {
		ui.logArea.insertAdjacentHTML('beforeend', `<div class="log log-${type}">${Array.from(args).map(o => typeof o === 'object' ? JSON.stringify(o, o instanceof Error && Object.getOwnPropertyNames(o)) : o).join('\t')}</div>`);
		if (ui.autoScroll.checked) ui.logArea.querySelector('div:last-child').scrollIntoView(false);
		if (type === 'error') console.error(PREFIX, ...Array.from(args));
	}

	function setupUndiscordCore() {

		undiscordCore.onStart = (state, stats) => {
			console.log(PREFIX, 'onStart', state, stats);
			$('#start').disabled = true;
			$('#stop').disabled = false;

			ui.undiscordBtn.classList.add('running');
			ui.progressMain.style.display = 'block';
			ui.percent.style.display = 'block';
		};

		undiscordCore.onProgress = (state, stats) => {
			// console.log(PREFIX, 'onProgress', state, stats);
			let max = state.grandTotal;
			const value = state.delCount + state.failCount;
			max = Math.max(max, value, 0); // clamp max

			// status bar
			const percent = value >= 0 && max ? Math.round(value / max * 100) + '%' : '';
			const elapsed = msToHMS(Date.now() - stats.startTime.getTime());
			const remaining = msToHMS(stats.etr);
			ui.percent.innerHTML = `${percent} (${value}/${max}) Elapsed: ${elapsed} Remaining: ${remaining}`;

			ui.progressIcon.value = value;
			ui.progressMain.value = value;

			// indeterminate progress bar
			if (max) {
				ui.progressIcon.setAttribute('max', max);
				ui.progressMain.setAttribute('max', max);
			} else {
				ui.progressIcon.removeAttribute('value');
				ui.progressMain.removeAttribute('value');
				ui.percent.innerHTML = '...';
			}

			// update delays
			const searchDelayInput = $('input#searchDelay');
			searchDelayInput.value = undiscordCore.options.searchDelay;
			$('div#searchDelayValue').textContent = undiscordCore.options.searchDelay + 'ms';

			const deleteDelayInput = $('input#deleteDelay');
			deleteDelayInput.value = undiscordCore.options.deleteDelay;
			$('div#deleteDelayValue').textContent = undiscordCore.options.deleteDelay + 'ms';
		};

		undiscordCore.onStop = (state, stats) => {
			console.log(PREFIX, 'onStop', state, stats);
			$('#start').disabled = false;
			$('#stop').disabled = true;
			ui.undiscordBtn.classList.remove('running');
			ui.progressMain.style.display = 'none';
			ui.percent.style.display = 'none';
		};
}


    function setupDateMask(input) {
        const separators = { 4: '-', 7: '-', 10: ' ', 13: ':' };
        const sepPositions = new Set([4, 7, 10, 13]);
        const mask = 'YYYY-MM-DD HH:MM';

        const overlay   = input.parentElement.querySelector('.date-mask-overlay');
        const typedSpan = overlay.querySelector('.typed');
        const hintSpan  = overlay.querySelector('.remaining');
        const fakeCaret = overlay.querySelector('.date-fake-caret');

        function updateOverlay() {
            const val = input.value;
            typedSpan.textContent = val;
            hintSpan.textContent  = mask.slice(val.length);
        }
        input.addEventListener('focus', () => {
            if (fakeCaret) fakeCaret.style.display = 'inline-block';
            updateOverlay();
        });
        input.addEventListener('blur', () => {
            if (fakeCaret) fakeCaret.style.display = 'none';
        });

        // Returns max digit allowed at a given formatted-string position
        function maxDigit(pos, val) {
            const month = parseInt(val.slice(5, 7));
            const year  = parseInt(val.slice(0, 4)) || 2000; // for february
            switch (pos) {
                case 5:  return 1; // month tens: 0–1
                case 6:  return parseInt(val[5]) === 1 ? 2 : 9; // month units: 10–12
                case 8:  { // day tens: depends on month
                    const maxDay = (!isNaN(month) && month >= 1 && month <= 12)
                        ? new Date(year, month, 0).getDate() : 31;
                    return Math.floor(maxDay / 10);
                }
                case 9:  { // day units: depends on tens + month
                    const d1 = parseInt(val[8]);
                    const maxDay = (!isNaN(month) && month >= 1 && month <= 12)
                        ? new Date(year, month, 0).getDate() : 31;
                    return Math.min(maxDay - d1 * 10, 9);
                }
                case 11: return 2; // hour tens: 0–2
                case 12: return parseInt(val[11]) === 2 ? 3 : 9; // hour units: 00–23
                case 14: return 5; // minute tens: 0–5
                default: return 9;
            }
        }

        // Returns min digit allowed (prevents 00 month / 00 day)
        function minDigit(pos, val) {
            if (pos === 6 && parseInt(val[5]) === 0) return 1; // month 00 invalid
            if (pos === 9 && parseInt(val[8]) === 0) return 1; // day 00 invalid
            return 0;
        }

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                e.preventDefault();
                const val = input.value;
                if (!val) return;
                // Eat separator + preceding digit together so it never gets stuck on a separator
                const lastIsSep = ['-', ' ', ':'].includes(val[val.length - 1]);
                input.value = (lastIsSep && val.length >= 2) ? val.slice(0, -2) : val.slice(0, -1);
                updateOverlay();
                return;
            }

            if (['Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) return;
            if (!/^\d$/.test(e.key)) { e.preventDefault(); return; }
            if (input.value.length >= 16) { e.preventDefault(); return; }

            let targetPos = input.value.length;
            if (sepPositions.has(targetPos)) targetPos++;

            const digit = parseInt(e.key);
            if (digit > maxDigit(targetPos, input.value) ||
                digit < minDigit(targetPos, input.value)) {
                e.preventDefault();
                return;
            }
        });

        input.addEventListener('input', () => {
            let digits = input.value.replace(/\D/g, '');
            let result = '';
            for (let i = 0; i < digits.length && result.length < 16; i++) {
                if (separators[result.length]) {
                    result += separators[result.length];
                    if (result.length >= 16) break;
                }
                result += digits[i];
            }
            if (separators[result.length] && result.length < 16) {
                result += separators[result.length];
            }
            input.value = result;
            updateOverlay();
        });

        updateOverlay();
    }

    function parseDateField(val) {
        if (!val || val.length < 10) return '';
        return val.trim().replace(' ', 'T');
    }

  async function startAction() {
      console.log(PREFIX, 'startAction');
      // general
      const authorId = $('input#authorId').value.trim();
      const guildId = $('input#guildId').value.trim();
      const channelIds = $('input#channelId').value.trim().split(/\s*,\s*/);
      const includeNsfw = $('input#includeNsfw').checked;
      // filter
      const content = $('input#search').value.trim();
      const hasLink = $('input#hasLink').checked;
      const hasFile = $('input#hasFile').checked;
      const includePinned = $('input#includePinned').checked;
      const pattern = $('input#pattern').value;
      // message interval
      const minId = $('input#minId').value.trim();
      const maxId = $('input#maxId').value.trim();
      // date range parsed from masked text input "YYYY-MM-DD HH:MM"
      const minDate = parseDateField($('input#minDate').value);
      const maxDate = parseDateField($('input#maxDate').value);
      // advanced
      const searchDelay = parseInt($('input#searchDelay').value.trim());
      const deleteDelay = parseInt($('input#deleteDelay').value.trim());
      // token
      const authToken = $('input#token').value.trim() || fillToken();
      if (!authToken) return; // get token already logs an error.
      // validate input
      if (!guildId) return log.error('You must fill the "Server ID" field!');
      // clear logArea
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
          pattern,
          searchDelay,
          deleteDelay,
      };

      if (channelIds.length > 1) {
          const jobs = channelIds.map(ch => ({
              guildId: guildId,
              channelId: ch,
          }));
          try {
              await undiscordCore.runBatch(jobs);
          } catch (err) {
              log.error('CoreException', err);
          }
      }
      else {
          try {
              await undiscordCore.run();
          } catch (err) {
              log.error('CoreException', err);
              undiscordCore.stop();
          }
      }
  }

  function stopAction() {
      console.log(PREFIX, 'stopAction');
      undiscordCore.stop();
  }

	initUI();

})();
