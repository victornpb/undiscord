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
// @downloadURL     https://raw.githubusercontent.com/victornpb/undiscord/master/deleteDiscordMessages.user.js
// @contributionURL https://www.buymeacoffee.com/vitim
// @grant           none
// @attribution     Original project (https://github.com/victornpb/undiscord)
// ==/UserScript==
(function () {
	'use strict';

	/* rollup-plugin-baked-env */
	const VERSION = "5.2.6";

	var themeCss = (`

/* undiscord window */
#undiscord {
  --uc-bg: #0b1020;
  --uc-surface: #11182b;
  --uc-panel: #141d36;
  --uc-panel-strong: #1a2442;
  --uc-accent: #7c5cff;
  --uc-accent-2: #2de2a6;
  --uc-danger: #ff5c7a;
  --uc-border: rgba(255, 255, 255, 0.08);
  --uc-text: #e7ecff;
  --uc-muted: #98a4c8;
  --uc-shadow: 0 24px 60px rgba(4, 8, 18, 0.6);
  --uc-window-bg: radial-gradient(1200px 600px at 10% -10%, rgba(124, 92, 255, 0.18), transparent 40%), linear-gradient(180deg, #0b1020, #0a0f1f);
  --uc-header-bg: linear-gradient(90deg, #101833, #141b35 60%, #101833);
  --uc-tbar-bg: linear-gradient(180deg, rgba(20, 29, 54, 0.9), rgba(14, 20, 40, 0.9));
  --uc-log-bg: linear-gradient(180deg, rgba(10, 15, 31, 0.6), rgba(10, 15, 31, 0.2));
  --uc-summary-bg: rgba(124, 92, 255, 0.08);
  --uc-summary-hover: rgba(124, 92, 255, 0.16);
  --uc-fieldset-bg: rgba(20, 29, 54, 0.6);
  --uc-option-bg: #11182b;
  --uc-option-text: #e7ecff;
}

#undiscord.theme-dark {
  --uc-bg: #050505;
  --uc-surface: #0b0b0b;
  --uc-panel: #121212;
  --uc-panel-strong: #1c1c1c;
  --uc-accent: #7c5cff;
  --uc-accent-2: #2de2a6;
  --uc-danger: #ff5c7a;
  --uc-border: rgba(255, 255, 255, 0.08);
  --uc-text: #f2f4ff;
  --uc-muted: #9aa3c0;
  --uc-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
  --uc-window-bg: radial-gradient(1200px 600px at 10% -10%, rgba(124, 92, 255, 0.16), transparent 45%), linear-gradient(180deg, #050505, #000000);
  --uc-header-bg: linear-gradient(90deg, #0b0b0b, #121212 60%, #0b0b0b);
  --uc-tbar-bg: linear-gradient(180deg, rgba(12, 12, 12, 0.95), rgba(8, 8, 8, 0.95));
  --uc-log-bg: linear-gradient(180deg, rgba(8, 8, 8, 0.75), rgba(5, 5, 5, 0.45));
  --uc-summary-bg: rgba(124, 92, 255, 0.12);
  --uc-summary-hover: rgba(124, 92, 255, 0.2);
  --uc-fieldset-bg: rgba(14, 14, 14, 0.9);
  --uc-option-bg: #0b0b0b;
  --uc-option-text: #f2f4ff;
}

#undiscord.theme-light {
  --uc-bg: #f4f6ff;
  --uc-surface: #f8f9ff;
  --uc-panel: #ffffff;
  --uc-panel-strong: #eef1ff;
  --uc-accent: #6c4eff;
  --uc-accent-2: #24c997;
  --uc-danger: #e24f6a;
  --uc-border: rgba(15, 23, 42, 0.12);
  --uc-text: #1f2433;
  --uc-muted: #5b6680;
  --uc-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
  --uc-window-bg: radial-gradient(1200px 600px at 10% -10%, rgba(108, 78, 255, 0.12), transparent 45%), linear-gradient(180deg, #f7f8ff, #eef2ff);
  --uc-header-bg: linear-gradient(90deg, #eef1ff, #e4e9ff 60%, #eef1ff);
  --uc-tbar-bg: linear-gradient(180deg, rgba(238, 241, 255, 0.95), rgba(225, 231, 255, 0.9));
  --uc-log-bg: linear-gradient(180deg, rgba(245, 247, 255, 0.9), rgba(235, 239, 255, 0.7));
  --uc-summary-bg: rgba(108, 78, 255, 0.12);
  --uc-summary-hover: rgba(108, 78, 255, 0.2);
  --uc-fieldset-bg: rgba(255, 255, 255, 0.9);
  --uc-option-bg: #ffffff;
  --uc-option-text: #1f2433;
}

#undiscord.theme-glass-default {
  --uc-surface: rgba(17, 24, 43, 0.14);
  --uc-panel: rgba(20, 29, 54, 0.12);
  --uc-panel-strong: rgba(26, 36, 66, 0.18);
  --uc-border: rgba(255, 255, 255, 0.38);
  --uc-shadow: 0 30px 70px rgba(4, 8, 18, 0.65);
  --uc-window-bg: radial-gradient(1200px 600px at 10% -10%, rgba(124, 92, 255, 0.2), transparent 45%), linear-gradient(180deg, rgba(11, 16, 32, 0.75), rgba(10, 15, 31, 0.6));
  --uc-header-bg: linear-gradient(90deg, rgba(16, 24, 51, 0.6), rgba(20, 27, 53, 0.6) 60%, rgba(16, 24, 51, 0.6));
  --uc-tbar-bg: linear-gradient(180deg, rgba(20, 29, 54, 0.2), rgba(14, 20, 40, 0.14));
  --uc-log-bg: linear-gradient(180deg, rgba(10, 15, 31, 0.08), rgba(10, 15, 31, 0.03));
  --uc-summary-bg: rgba(124, 92, 255, 0.16);
  --uc-summary-hover: rgba(124, 92, 255, 0.24);
  --uc-fieldset-bg: rgba(20, 29, 54, 0.1);
  --uc-option-bg: rgba(13, 18, 36, 0.95);
  --uc-option-text: #e7ecff;
}

#undiscord.theme-glass-dark {
  --uc-surface: rgba(8, 8, 8, 0.18);
  --uc-panel: rgba(12, 12, 12, 0.16);
  --uc-panel-strong: rgba(18, 18, 18, 0.2);
  --uc-border: rgba(255, 255, 255, 0.36);
  --uc-shadow: 0 30px 70px rgba(0, 0, 0, 0.7);
  --uc-window-bg: radial-gradient(1200px 600px at 10% -10%, rgba(124, 92, 255, 0.14), transparent 50%), linear-gradient(180deg, rgba(5, 5, 5, 0.85), rgba(0, 0, 0, 0.7));
  --uc-header-bg: linear-gradient(90deg, rgba(10, 10, 10, 0.65), rgba(14, 14, 14, 0.65) 60%, rgba(10, 10, 10, 0.65));
  --uc-tbar-bg: linear-gradient(180deg, rgba(12, 12, 12, 0.24), rgba(6, 6, 6, 0.16));
  --uc-log-bg: linear-gradient(180deg, rgba(6, 6, 6, 0.1), rgba(3, 3, 3, 0.05));
  --uc-summary-bg: rgba(124, 92, 255, 0.14);
  --uc-summary-hover: rgba(124, 92, 255, 0.22);
  --uc-fieldset-bg: rgba(8, 8, 8, 0.12);
  --uc-option-bg: rgba(8, 8, 8, 0.98);
  --uc-option-text: #f2f4ff;
}

#undiscord.theme-glass-light {
  --uc-surface: rgba(255, 255, 255, 0.26);
  --uc-panel: rgba(255, 255, 255, 0.32);
  --uc-panel-strong: rgba(238, 241, 255, 0.38);
  --uc-border: rgba(15, 23, 42, 0.36);
  --uc-text: #1f2433;
  --uc-muted: #56607a;
  --uc-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
  --uc-window-bg: radial-gradient(1200px 600px at 10% -10%, rgba(108, 78, 255, 0.14), transparent 50%), linear-gradient(180deg, rgba(250, 251, 255, 0.97), rgba(232, 236, 255, 0.9));
  --uc-header-bg: linear-gradient(90deg, rgba(232, 236, 255, 0.85), rgba(224, 230, 255, 0.85) 60%, rgba(232, 236, 255, 0.85));
  --uc-tbar-bg: linear-gradient(180deg, rgba(244, 246, 255, 0.34), rgba(226, 231, 255, 0.26));
  --uc-log-bg: linear-gradient(180deg, rgba(246, 248, 255, 0.28), rgba(232, 236, 255, 0.2));
  --uc-summary-bg: rgba(108, 78, 255, 0.14);
  --uc-summary-hover: rgba(108, 78, 255, 0.22);
  --uc-fieldset-bg: rgba(255, 255, 255, 0.24);
  --uc-option-bg: rgba(248, 250, 255, 0.98);
  --uc-option-text: #1f2433;
}

#undiscord.theme-glass-default,
#undiscord.theme-glass-dark,
#undiscord.theme-glass-light { backdrop-filter: blur(48px) saturate(1.35); }

#undiscord.theme-transparent {
  --uc-surface: rgba(0, 0, 0, 0);
  --uc-panel: rgba(0, 0, 0, 0);
  --uc-panel-strong: rgba(0, 0, 0, 0);
  --uc-border: rgba(255, 255, 255, 0.18);
  --uc-window-bg: transparent;
  --uc-tbar-bg: rgba(0, 0, 0, 0.22);
  --uc-log-bg: rgba(0, 0, 0, 0.12);
  --uc-summary-bg: rgba(124, 92, 255, 0.16);
  --uc-summary-hover: rgba(124, 92, 255, 0.26);
  --uc-fieldset-bg: rgba(0, 0, 0, 0);
  --uc-option-bg: rgba(12, 12, 12, 0.98);
  --uc-option-text: #f2f4ff;
  backdrop-filter: blur(12px) saturate(1.1);
}
#undiscord.browser { box-shadow: var(--uc-shadow); border: 1px solid var(--uc-border); border-radius: 16px; overflow: hidden; }
#undiscord.container,
#undiscord .container { background-color: var(--uc-surface); border-radius: 16px; box-sizing: border-box; cursor: default; flex-direction: column; }
#undiscord .header { background: var(--uc-header-bg); height: 60px; align-items: center; min-height: 60px; padding: 0 22px; display: flex; color: var(--uc-muted); cursor: grab; box-shadow: inset 0 -1px 0 var(--uc-border); }
#undiscord .header .icon { color: var(--uc-muted); margin-right: 10px; flex-shrink: 0; width: 24; height: 24; }
#undiscord .header .icon:hover { color: var(--uc-text); }
#undiscord .header h3 { font-size: 16px; line-height: 20px; font-weight: 700; font-family: var(--font-display); color: var(--uc-text); flex-shrink: 0; margin-right: 16px; letter-spacing: 0.4px; }
#undiscord .spacer { flex-grow: 1; }
#undiscord .header .vert-divider { width: 1px; height: 24px; background-color: var(--uc-border); margin-right: 16px; flex-shrink: 0; }
#undiscord legend,
#undiscord label { color: var(--uc-muted); font-size: 11px; line-height: 16px; font-weight: 600; text-transform: uppercase; cursor: default; font-family: var(--font-display); margin-bottom: 8px; letter-spacing: 0.4px; }
#undiscord legend { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 0 2px; margin: 0 0 8px; }
#undiscord .multiInput { display: flex; align-items: center; font-size: 16px; box-sizing: border-box; width: 100%; border-radius: 12px; color: var(--uc-text); background-color: var(--uc-panel); border: 1px solid var(--uc-border); transition: border-color 0.2s ease-in-out 0s, box-shadow 0.2s ease-in-out 0s; }
#undiscord .multiInput :first-child { flex-grow: 1; }
#undiscord .multiInput button:last-child { margin-right: 4px; }
#undiscord .input { font-size: 15px; width: 100%; transition: border-color 0.2s ease-in-out 0s, box-shadow 0.2s ease-in-out 0s; padding: 10px 12px; height: 42px; background-color: var(--uc-panel); border: 1px solid var(--uc-border); border-radius: 12px; box-sizing: border-box; color: var(--uc-text); }
#undiscord fieldset { margin-top: 16px; }
#undiscord .input-wrapper { display: flex; align-items: center; font-size: 16px; box-sizing: border-box; width: 100%; border-radius: 12px; color: var(--uc-text); background-color: var(--uc-panel); border: none; transition: border-color 0.2s ease-in-out 0s; }
#undiscord input[type="text"],
#undiscord input[type="search"],
#undiscord input[type="password"],
#undiscord input[type="datetime-local"],
#undiscord input[type="number"],
#undiscord input[type="range"] { background-color: var(--uc-panel); border: 1px solid var(--uc-border); border-radius: 12px; box-sizing: border-box; color: var(--uc-text); font-size: 16px; height: 44px; padding: 12px 10px; transition: border-color .2s ease-in-out, box-shadow .2s ease-in-out, background 0.2s ease, color 0.2s ease; width: 100%; }
#undiscord select { background-color: var(--uc-panel); border: 1px solid var(--uc-border); border-radius: 12px; box-sizing: border-box; color: var(--uc-text); font-size: 16px; height: 44px; padding: 10px 12px; transition: border-color .2s ease-in-out, box-shadow .2s ease-in-out, background 0.2s ease, color 0.2s ease; width: 100%; }
#undiscord select option { background-color: var(--uc-option-bg); color: var(--uc-option-text); }
#undiscord .divider,
#undiscord hr { border: none; margin-bottom: 24px; padding-bottom: 4px; border-bottom: 1px solid var(--uc-border); }
#undiscord .sectionDescription { margin: 8px 0 16px; color: var(--uc-muted); font-size: 13px; line-height: 18px; font-weight: 400; }
#undiscord a { color: var(--uc-accent); text-decoration: none; }
#undiscord .btn,
#undiscord button { position: relative; display: flex; -webkit-box-pack: center; justify-content: center; -webkit-box-align: center; align-items: center; box-sizing: border-box; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; line-height: 16px; padding: 2px 16px; user-select: none; /* sizeSmall */     width: 60px; height: 38px; min-width: 60px; min-height: 38px; /* lookFilled colorPrimary */     color: #ffffff; background: linear-gradient(135deg, var(--uc-accent), #9a7bff); box-shadow: 0 10px 20px rgba(124, 92, 255, 0.35), inset 0 0 0 1px rgba(255, 255, 255, 0.18); transition: transform 0.08s ease, filter 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease; }
#undiscord button:hover { filter: brightness(1.06); }
#undiscord button:active { transform: translateY(1px); }
#undiscord .sizeMedium { width: 96px; height: 38px; min-width: 96px; min-height: 38px; }
#undiscord .sizeMedium.icon { width: 38px; min-width: 38px; }
#undiscord sup { vertical-align: top; }
/* lookFilled colorPrimary */
#undiscord .accent { background: linear-gradient(135deg, var(--uc-accent), #9a7bff); box-shadow: 0 10px 20px rgba(124, 92, 255, 0.35); }
#undiscord .danger { background: linear-gradient(135deg, var(--uc-danger), #ff8aa0); box-shadow: 0 10px 20px rgba(255, 92, 122, 0.35); }
#undiscord .positive { background: linear-gradient(135deg, var(--uc-accent-2), #59f0c0); box-shadow: 0 10px 20px rgba(45, 226, 166, 0.3); }
#undiscord .info { font-size: 12px; line-height: 16px; padding: 8px 10px; color: var(--uc-muted); }
#undiscord #redact { appearance: none; width: 38px; height: 22px; border-radius: 999px; background: rgba(255, 255, 255, 0.15); border: 1px solid var(--uc-border); position: relative; cursor: pointer; transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
#undiscord #redact::before { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25); transition: transform 0.2s ease; }
#undiscord #redact:checked { background: linear-gradient(135deg, var(--uc-accent), #9a7bff); border-color: rgba(124, 92, 255, 0.6); box-shadow: 0 0 0 2px rgba(124, 92, 255, 0.15); }
#undiscord #redact:checked::before { transform: translateX(16px); }
#undiscord .tbar label.row { gap: 8px; color: var(--uc-text); text-transform: none; }
#undiscord input[type="checkbox"]:not(#redact) { appearance: none; width: 36px; height: 20px; border-radius: 999px; background: rgba(255, 255, 255, 0.12); border: 1px solid var(--uc-border); position: relative; cursor: pointer; margin-right: 8px; transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
#undiscord input[type="checkbox"]:not(#redact)::before { content: ""; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25); transition: transform 0.2s ease; }
#undiscord input[type="checkbox"]:not(#redact):checked { background: linear-gradient(135deg, var(--uc-accent-2), #59f0c0); border-color: rgba(45, 226, 166, 0.6); box-shadow: 0 0 0 2px rgba(45, 226, 166, 0.15); }
#undiscord input[type="checkbox"]:not(#redact):checked::before { transform: translateX(16px); }
#undiscord label.row,
#undiscord .sectionDescription label,
#undiscord .footer label { display: flex; align-items: center; gap: 8px; text-transform: none; color: var(--uc-text); line-height: 20px; min-height: 20px; }
#undiscord input:focus,
#undiscord select:focus,
#undiscord textarea:focus { outline: none; box-shadow: 0 0 0 2px rgba(124, 92, 255, 0.5); border-color: var(--uc-accent); }
/* Scrollbar */
#undiscord .scroll::-webkit-scrollbar { width: 8px; height: 8px; }
#undiscord .scroll::-webkit-scrollbar-corner { background-color: transparent; }
#undiscord .scroll::-webkit-scrollbar-thumb { background-clip: padding-box; border: 2px solid transparent; border-radius: 4px; background-color: var(--scrollbar-thin-thumb); min-height: 40px; }
#undiscord .scroll::-webkit-scrollbar-track { background-color: var(--scrollbar-thin-track); border: 2px solid var(--scrollbar-thin-track); }
/* fade scrollbar */
#undiscord .scroll::-webkit-scrollbar-thumb,
#undiscord .scroll::-webkit-scrollbar-track { visibility: hidden; }
#undiscord .scroll:hover::-webkit-scrollbar-thumb,
#undiscord .scroll:hover::-webkit-scrollbar-track { visibility: visible; }
/**** functional classes ****/
#undiscord.redact .priv { display: none !important; }
#undiscord.redact x:not(:active) { color: transparent !important; background-color: var(--primary-700) !important; cursor: default; user-select: none; }
#undiscord.redact x:hover { position: relative; }
#undiscord.redact x:hover::after { content: "Redacted information (Streamer mode: ON)"; position: absolute; display: inline-block; top: -32px; left: -20px; padding: 4px; width: 150px; font-size: 8pt; text-align: center; white-space: pre-wrap; background-color: var(--background-floating); -webkit-box-shadow: var(--elevation-high); box-shadow: var(--elevation-high); color: var(--text-default); border-radius: 5px; pointer-events: none; }
#undiscord.redact [priv] { -webkit-text-security: disc !important; }
#undiscord :disabled { display: none; }
/**** layout and utility classes ****/
#undiscord,
#undiscord * { box-sizing: border-box; }
#undiscord .col { display: flex; flex-direction: column; }
#undiscord .row { display: flex; flex-direction: row; align-items: center; }
#undiscord .mb1 { margin-bottom: 8px; }
#undiscord .log { margin-bottom: 0.25em; }
#undiscord .log-debug { color: inherit; }
#undiscord .log-info { color: #00b0f4; }
#undiscord .log-verb { color: #72767d; }
#undiscord .log-warn { color: #faa61a; }
#undiscord .log-error { color: #f04747; }
#undiscord .log-success { color: #43b581; }
`);

	var mainCss = (`

/**** Undiscord Button ****/
#undicord-btn { position: relative; width: auto; height: 28px; margin: 0 8px; cursor: pointer; color: var(--interactive-normal); flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; padding: 6px; border-radius: 10px; transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease; }
#undicord-btn:hover { background-color: var(--background-modifier-hover); color: var(--interactive-hover); box-shadow: inset 0 0 0 1px var(--background-modifier-accent); }
#undicord-btn svg,
#undiscord .header svg.icon { overflow: visible; }
#undicord-btn svg path,
#undiscord .header svg.icon path { transform-box: fill-box; transform-origin: center; transition: transform 0.2s ease; }
#undicord-btn:hover svg path:first-child,
#undiscord .header svg.icon:hover path:first-child { transform: translateY(-2px) rotate(-18deg); transform-origin: left center; }
#undicord-btn progress { position: absolute; top: 23px; left: -4px; width: 32px; height: 12px; display: none; }
#undicord-btn.running { color: var(--button-danger-background) !important; }
#undicord-btn.running progress { display: block; }
/**** Undiscord Interface ****/
#undiscord { position: fixed; z-index: 100; top: 58px; right: 10px; display: flex; flex-direction: column; width: 860px; height: 82vh; min-width: 680px; max-width: 100vw; min-height: 480px; max-height: 100vh; color: var(--uc-text); border-radius: 16px; background: var(--uc-window-bg); box-shadow: var(--uc-shadow); backdrop-filter: blur(10px); will-change: top, left, width, height; animation: undi-fade-in 220ms ease-out; }
#undiscord .header .icon { cursor: pointer; }
#undiscord .window-body { height: calc(100% - 60px); display: flex; flex-direction: column; }
#undiscord .main { display: flex; flex-direction: column; flex-grow: 1; min-height: 0; }
#undiscord .content-grid { display: grid; grid-template-columns: 340px 1fr; gap: 16px; padding: 16px; flex-grow: 1; min-height: 0; transition: grid-template-columns 0.25s ease, gap 0.25s ease; }
#undiscord .sidebar { overflow: hidden scroll; overflow-y: auto; height: 100%; max-height: 100%; padding: 16px; background: var(--uc-panel); border: 1px solid var(--uc-border); border-radius: 16px; transition: background 0.25s ease, border-color 0.25s ease, opacity 0.25s ease, transform 0.25s ease, width 0.25s ease, padding 0.25s ease, border-width 0.25s ease; }
#undiscord .sidebar legend,
#undiscord .sidebar label {
    display: contents;
    width: 100%;
}
#undiscord .sidebar fieldset { position: relative; }
#undiscord .sidebar legend a { position: absolute; right: 12px; top: 10px; margin-left: 0; }
#undiscord .sectionDescription label {
  display: flex;
  align-items: center;
}
#undiscord .activity { display: flex; flex-direction: column; min-height: 0; background: var(--uc-panel); border: 1px solid var(--uc-border); border-radius: 16px; overflow: hidden; transition: background 0.25s ease, border-color 0.25s ease; }
#undiscord.hide-sidebar .sidebar { opacity: 0; transform: translateX(-8px); width: 0; padding: 0; border-width: 0; pointer-events: none; }
#undiscord.hide-sidebar .content-grid { grid-template-columns: 0 1fr; gap: 0; }
#undiscord #logArea { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; font-size: 0.78rem; overflow: auto; padding: 14px; user-select: text; flex-grow: 1; cursor: auto; color: var(--uc-text); background: var(--uc-log-bg); transition: background 0.25s ease, color 0.25s ease; }
#undiscord .tbar { padding: 12px 16px; background: var(--uc-tbar-bg); border-bottom: 1px solid var(--uc-border); transition: background 0.25s ease, border-color 0.25s ease; }
#undiscord .tbar button { margin-right: 4px; margin-bottom: 4px; }
#undiscord .footer { padding-right: 30px; }
#undiscord .footer #progressPercent { padding: 0 1em; font-size: small; color: var(--interactive-muted); flex-grow: 1; }
#undiscord .export-wrap { position: relative; display: inline-flex; align-items: center; margin-right: 4px; }
#undiscord .export-wrap .sizeMedium.icon { width: 52px; min-width: 52px; height: 44px; }
#undiscord .export-wrap svg { width: 26px; height: 26px; }
#undiscord .export-menu { position: absolute; right: -160px; bottom: 46px; min-width: 210px; padding: 8px; border-radius: 12px; background: var(--uc-panel); border: 1px solid var(--uc-border); box-shadow: var(--uc-shadow); display: none; flex-direction: column; gap: 6px; z-index: 50; }
#undiscord .export-menu button { width: 100%; justify-content: flex-start; height: 34px; min-height: 34px; padding: 0 12px; background: none; color: var(--uc-text); box-shadow: none; }
#undiscord .export-menu button:hover { background: rgba(124, 92, 255, 0.18); filter: none; }
#undiscord .export-menu.open { display: flex; }
.resize-handle { position: absolute; bottom: -15px; right: -15px; width: 30px; height: 30px; transform: rotate(-45deg); background: repeating-linear-gradient(0, var(--background-modifier-accent), var(--background-modifier-accent) 1px, transparent 2px, transparent 4px); cursor: nwse-resize; }
/**** Elements ****/
#undiscord details { background: var(--uc-fieldset-bg); border: 1px solid var(--uc-border); border-radius: 14px; padding: 10px; margin-bottom: 12px; transition: background 0.25s ease, border-color 0.25s ease; }
#undiscord summary { font-size: 14px; font-weight: 700; line-height: 20px; position: relative; overflow: hidden; margin-bottom: 8px; padding: 10px 36px 10px 12px; cursor: pointer; white-space: nowrap; text-overflow: ellipsis; color: var(--uc-text); border-radius: 10px; flex-shrink: 0; background: var(--uc-summary-bg); transition: background-color 0.2s ease, color 0.2s ease, transform 0.18s ease; }
#undiscord summary:hover { background-color: var(--uc-summary-hover); }
#undiscord summary::-webkit-details-marker { display: none; }
#undiscord summary::marker { content: ""; }
#undiscord summary::after { content: "▾"; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; line-height: 1; color: var(--uc-muted); transition: transform 0.2s ease, color 0.2s ease; }
#undiscord details[open] > summary::after { transform: translateY(-50%) rotate(180deg); color: var(--uc-text); }
#undiscord details[open] > summary { transform: translateY(-1px); }
#undiscord details > *:not(summary) { opacity: 0; transform: translateY(-4px); transition: opacity 0.2s ease, transform 0.2s ease; }
#undiscord details[open] > *:not(summary) { opacity: 1; transform: translateY(0); }
#undiscord details.closing > *:not(summary) { opacity: 0; transform: translateY(-4px); }
#undiscord fieldset { padding: 10px; margin-bottom: 8px; border-radius: 12px; background: var(--uc-fieldset-bg); border: 1px solid var(--uc-border); transition: background 0.25s ease, border-color 0.25s ease; }
#undiscord legend a { float: none; text-transform: initial; margin-left: auto; }
#undiscord progress { height: 8px; margin-top: 6px; flex-grow: 1; border-radius: 999px; overflow: hidden; background-color: rgba(255, 255, 255, 0.08); }
#undiscord .importJson { display: flex; flex-direction: row; }
#undiscord .importJson button { margin-left: 5px; width: fit-content; }

@keyframes undi-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes undi-section-in {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
    #undiscord,
    #undiscord * {
        animation: none !important;
        transition: none !important;
    }
}
`);

	var dragCss = (`
[name^="grab-"] { position: absolute; --size: 6px; --corner-size: 16px; --offset: -1px; z-index: 9; }
[name^="grab-"]:hover{ background: rgba(128,128,128,0.1); }
[name="grab-t"] { top: 0px; left: var(--corner-size); right: var(--corner-size); height: var(--size); margin-top: var(--offset); cursor: ns-resize; }
[name="grab-r"] { top: var(--corner-size); bottom: var(--corner-size); right: 0px; width: var(--size); margin-right: var(--offset); 
  cursor: ew-resize; }
[name="grab-b"] { bottom: 0px; left: var(--corner-size); right: var(--corner-size); height: var(--size); margin-bottom: var(--offset); cursor: ns-resize; }
[name="grab-l"] { top: var(--corner-size); bottom: var(--corner-size); left: 0px; width: var(--size); margin-left: var(--offset); cursor: ew-resize; }
[name="grab-tl"] { top: 0px; left: 0px; width: var(--corner-size); height: var(--corner-size); margin-top: var(--offset); margin-left: var(--offset); cursor: nwse-resize; }
[name="grab-tr"] { top: 0px; right: 0px; width: var(--corner-size); height: var(--corner-size); margin-top: var(--offset); margin-right: var(--offset); cursor: nesw-resize; }
[name="grab-br"] { bottom: 0px; right: 0px; width: var(--corner-size); height: var(--corner-size); margin-bottom: var(--offset); margin-right: var(--offset); cursor: nwse-resize; }
[name="grab-bl"] { bottom: 0px; left: 0px; width: var(--corner-size); height: var(--corner-size); margin-bottom: var(--offset); margin-left: var(--offset); cursor: nesw-resize; }
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
    <div class="window-body">
        <div class="main col">
            <div class="tbar col">
                <div class="row">
                    <button id="toggleSidebar" class="sizeMedium icon">☰</button>
                    <button id="start" class="sizeMedium danger" style="width: 150px;" title="Start the deletion process">▶︎ Delete</button>
                    <button id="stop" class="sizeMedium" title="Stop the deletion process" disabled>🛑 Stop</button>
                    <button id="clear" class="sizeMedium">Clear log</button>
                    <span class="spacer"></span>
                    <label class="row" title="Hide sensitive information on your screen for taking screenshots">
                        <input id="redact" type="checkbox" checked> Streamer mode
                    </label>
                </div>
                <div class="row">
                    <progress id="progressBar" style="display:none;"></progress>
                </div>
            </div>
            <div class="content-grid">
                <div class="sidebar settings scroll">
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
                        <input type="file" id="importJsonInput" accept="application/json,.json" style="width:100%";>
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
                    </div>
                    <div class="sectionDescription">
                        * Filtering by date doesn't work if you use the "Messages interval".
                    </div>
                </fieldset>
            </details>
            <hr>
            <details>
                <summary>Theme</summary>
                <fieldset>
                    <legend>
                        Theme
                    </legend>
                    <div class="input-wrapper">
                        <select id="themeMode">
                            <option value="default" selected>Default</option>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="glass-default">Glass Default</option>
                            <option value="glass-dark">Glass Dark</option>
                            <option value="glass-light">Glass Light</option>
                            <option value="transparent">Transparent</option>
                        </select>
                    </div>
                    <div class="sectionDescription">
                        Choose a visual theme for the Undiscord window.
                    </div>
                </fieldset>
            </details>
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
                Undiscord {{VERSION}} · Better UX by Astrogaming057
                <br> victornpb
            </div>
        </div>
                <div class="activity col">
            <pre id="logArea" class="logarea scroll">
                <div class="" style="background: var(--background-mentioned); padding: .5em;">Notice: Undiscord may be working slower than usual and<wbr>require multiple attempts due to a recent Discord update.<br>We're working on a fix, and we thank you for your patience.</div>
                <center>
                    <div>Star <a href="{{HOME}}" target="_blank" rel="noopener noreferrer">this project</a> on GitHub!</div>
                    <div><a href="{{HOME}}/discussions" target="_blank" rel="noopener noreferrer">Issues or help</a></div>
                </center>
            </pre>
                    <div class="tbar footer row">
                        <div class="export-wrap">
                            <button id="exportBtn" class="sizeMedium icon" title="Export log" aria-haspopup="true" aria-expanded="false">
                                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12 3v10.17l3.59-3.58L17 11l-5 5-5-5 1.41-1.41L11 13.17V3h1zm-7 14h14v2H5v-2z"></path>
                                </svg>
                            </button>
                            <div id="exportMenu" class="export-menu" role="menu">
                                <button type="button" data-export="json">Export log as JSON</button>
                                <button type="button" data-export="txt">Export log as TXT</button>
                                <button type="button" data-export="html">Export log as HTML</button>
                            </div>
                        </div>
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
	  themeMode: null,
	  exportBtn: null,
	  exportMenu: null,

	  // progress handler
	  progressMain: null,
	  progressIcon: null,
	  percent: null,
	};
	const $ = s => ui.undiscordWindow.querySelector(s);

	function initUI() {

	  insertCss(themeCss);
	  insertCss(mainCss);
	  insertCss(dragCss);

	  // create undiscord window
	  const undiscordUI = replaceInterpolations(undiscordTemplate, {
	    VERSION,
	    HOME,
	    WIKI,
	  });
	  ui.undiscordWindow = createElm(undiscordUI);
	  document.body.appendChild(ui.undiscordWindow);

	  // enable drag and resize on undiscord window
	  new DragResize({ elm: ui.undiscordWindow, moveHandle: $('.header') });

	  // create undiscord Trash icon
	  ui.undiscordBtn = createElm(buttonHtml);
	  ui.undiscordBtn.onclick = toggleWindow;
	  function mountBtn() {
	    const toolbar = document.querySelector('#app-mount [class^=toolbar]');
	    if (toolbar) toolbar.appendChild(ui.undiscordBtn);
	  }
	  mountBtn();
	  // watch for changes and re-mount button if necessary
	  const discordElm = document.querySelector('#app-mount');
	  let observerThrottle = null;
	  const observer = new MutationObserver((_mutationsList, _observer) => {
	    if (observerThrottle) return;
	    observerThrottle = setTimeout(() => {
	      observerThrottle = null;
	      if (!discordElm.contains(ui.undiscordBtn)) mountBtn(); // re-mount the button to the toolbar
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

	  // cached elements
	  ui.logArea = $('#logArea');
	  ui.autoScroll = $('#autoScroll');
	  ui.progressMain = $('#progressBar');
	  ui.progressIcon = ui.undiscordBtn.querySelector('progress');
	  ui.percent = $('#progressPercent');
	  ui.themeMode = $('#themeMode');
	  ui.exportBtn = $('#exportBtn');
	  ui.exportMenu = $('#exportMenu');

	  const applyTheme = (mode) => {
	    const theme = mode || 'default';
	    ui.undiscordWindow.classList.remove(
	      'theme-light',
	      'theme-dark',
	      'theme-glass-default',
	      'theme-glass-dark',
	      'theme-glass-light',
	      'theme-transparent'
	    );
	    if (theme !== 'default') ui.undiscordWindow.classList.add(`theme-${theme}`);
	  };
	  applyTheme(ui.themeMode.value);

	  const setupDetailsAnimation = () => {
	    const detailsEls = ui.undiscordWindow.querySelectorAll('details');
	    detailsEls.forEach((details) => {
	      const summary = details.querySelector('summary');
	      if (!summary) return;
	      summary.addEventListener('click', (event) => {
	        if (details.open) {
	          event.preventDefault();
	          if (details.classList.contains('closing')) return;
	          details.classList.add('closing');
	          window.setTimeout(() => {
	            details.open = false;
	            details.classList.remove('closing');
	          }, 200);
	        }
	      });
	    });
	  };
	  setupDetailsAnimation();

	  const closeExportMenu = () => {
	    ui.exportMenu.classList.remove('open');
	    ui.exportBtn.setAttribute('aria-expanded', 'false');
	  };
	  const toggleExportMenu = () => {
	    const open = ui.exportMenu.classList.toggle('open');
	    ui.exportBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
	  };

	  const downloadFile = (content, filename, type) => {
	    const blob = new Blob([content], { type });
	    const url = URL.createObjectURL(blob);
	    const a = document.createElement('a');
	    a.href = url;
	    a.download = filename;
	    document.body.appendChild(a);
	    a.click();
	    a.remove();
	    URL.revokeObjectURL(url);
	  };

	  const exportLog = (format) => {
	    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	    if (format === 'json') {
	      const entries = Array.from(ui.logArea.querySelectorAll('.log')).map((node) => {
	        const match = node.className.match(/log-([\w-]+)/);
	        return { type: match ? match[1] : 'log', text: node.textContent || '' };
	      });
	      downloadFile(JSON.stringify(entries, null, 2), `undiscord-log-${timestamp}.json`, 'application/json');
	      return;
	    }
	    if (format === 'html') {
	      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Undiscord log</title><style>
body { margin: 0; padding: 24px; background: #0b1020; color: #e7ecff; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; }
.console { max-width: 1100px; margin: 0 auto; padding: 16px; background: #11182b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; box-shadow: 0 20px 40px rgba(4, 8, 18, 0.5); }
.log { margin-bottom: 0.4em; white-space: pre-wrap; word-break: break-word; }
.log-debug { color: inherit; }
.log-info { color: #00b0f4; }
.log-verb { color: #72767d; }
.log-warn { color: #faa61a; }
.log-error { color: #f04747; }
.log-success { color: #43b581; }
a { color: #7c5cff; text-decoration: none; }
</style></head><body><div class="console">${ui.logArea.innerHTML}</div></body></html>`;
	      downloadFile(html, `undiscord-log-${timestamp}.html`, 'text/html');
	      return;
	    }
	    const text = ui.logArea.innerText || '';
	    downloadFile(text, `undiscord-log-${timestamp}.txt`, 'text/plain');
	  };

	  // register event listeners
	  $('#hide').onclick = toggleWindow;
	  $('#toggleSidebar').onclick = ()=> ui.undiscordWindow.classList.toggle('hide-sidebar');
	  $('button#start').onclick = startAction;
	  $('button#stop').onclick = stopAction;
	  $('button#clear').onclick = () => ui.logArea.innerHTML = '';
	  ui.exportBtn.onclick = (event) => {
	    event.stopPropagation();
	    toggleExportMenu();
	  };
	  ui.exportMenu.onclick = (event) => {
	    event.stopPropagation();
	    const target = event.target.closest('button[data-export]');
	    if (!target) return;
	    exportLog(target.dataset.export);
	    closeExportMenu();
	  };
	  document.addEventListener('click', closeExportMenu);
	  document.addEventListener('keydown', (event) => {
	    if (event.key === 'Escape') closeExportMenu();
	  });
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
	  ui.themeMode.onchange = (event) => {
	    const theme = event.target.value || 'default';
	    applyTheme(theme);
	  };

	  // sync delays
	  $('input#searchDelay').onchange = (e) => {
	    const v = parseInt(e.target.value);
	    if (v) undiscordCore.options.searchDelay = v;
	  };
	  $('input#deleteDelay').onchange = (e) => {
	    const v = parseInt(e.target.value);
	    if (v) undiscordCore.options.deleteDelay = v;
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

	    // No files added
	    if (files.length === 0) return log.warn('No file selected.');

	    // Get channel id field to set it later
	    const channelIdField = $('input#channelId');

	    // Force the guild id to be ourself (@me)
	    const guildIdField = $('input#guildId');
	    guildIdField.value = '@me';

	    // Set author id in case its not set already
	    $('input#authorId').value = getAuthorId();
	    try {
	      const file = files[0];
	      const text = await file.text();
	      const json = JSON.parse(text);
	      const channelIds = Object.keys(json);
	      channelIdField.value = channelIds.join(',');
	      log.info(`Loaded ${channelIds.length} channels.`);
	    } catch(err) {
	      log.error('Error parsing file!', err);
	    }
	  };

	  // redirect console logs to inside the window after setting up the UI
	  setLogFn(printLog);

	  setupUndiscordCore();
	}

	function printLog(type = '', args) {
	  ui.logArea.insertAdjacentHTML('beforeend', `<div class="log log-${type}">${Array.from(args).map(o => typeof o === 'object' ? JSON.stringify(o, o instanceof Error && Object.getOwnPropertyNames(o)) : o).join('\t')}</div>`);
	  if (ui.autoScroll.checked) ui.logArea.querySelector('div:last-child').scrollIntoView(false);
	  if (type==='error') console.error(PREFIX, ...Array.from(args));
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
	    $('div#searchDelayValue').textContent = undiscordCore.options.searchDelay+'ms';

	    const deleteDelayInput = $('input#deleteDelay');
	    deleteDelayInput.value = undiscordCore.options.deleteDelay;
	    $('div#deleteDelayValue').textContent = undiscordCore.options.deleteDelay+'ms';
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
	  // date range
	  const minDate = $('input#minDate').value.trim();
	  const maxDate = $('input#maxDate').value.trim();
	  //advanced
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
	    channelId: channelIds.length === 1 ? channelIds[0] : undefined, // single or multiple channel
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
	    // maxAttempt: 2,
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
	  // single channel
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

	// ---- END Undiscord ----

	initUI();

})();
