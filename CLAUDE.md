# Undiscord - Development Guide

## Commands

```bash
npm run lint        # ESLint check
npm run lint:fix    # ESLint auto-fix
npm run build       # Production build (rollup -> deleteDiscordMessages.user.js)
npm run watch       # Dev server with hot reload at localhost:10001
npm test            # lint + build
```

## Architecture

Browser userscript (Tampermonkey/Violentmonkey) that bulk-deletes Discord messages.
Rollup bundles `src/` into a single IIFE file `deleteDiscordMessages.user.js`.

### Module structure

```
src/
  index.js              # Entry point - calls initUI()
  api/
    discord-api.js      # Pure fetch layer - all Discord REST calls with AbortController
  core/
    undiscord-core.js   # Orchestrator class - run(), runBatch(), stop()
    search.js           # Search with iterative retry (202/429 handling)
    filter.js           # Message filtering (types, pinned, bots, threads, regex)
    delete.js           # Delete with retry loop + rate limit adaptation
    unarchive.js        # Thread unarchive before delete
  ui/
    init.js             # Mount DOM, inject CSS, setup toolbar button + MutationObserver
    handlers.js         # All event handlers (start, stop, getChannel, pick message, etc)
    progress.js         # onStart/onProgress/onStop callbacks, progress bar
    logger.js           # printLog with XSS-safe rendering, redact tag preservation
    css/                # CSS modules (layout, components, scrollbar, redact, log, drag)
    html/               # HTML templates
  utils/
    constants.js        # API_VERSION, DELETE_RESULT, DELETABLE_MSG_TYPES
    time.js             # wait(), msToHMS()
    html.js             # escapeHTML(), redact(), replaceInterpolations()
    discord.js          # queryString(), toSnowflake(), ask()
    log.js              # Log system with custom function support
    dom.js              # createElm(), insertCss()
    drag.js             # DragResize + Draggable classes
    message-picker.js   # Interactive message selection in chat
    get-ids.js          # Token, authorId, guildId, channelId extraction
```

### Data flow

```
User clicks Delete -> startAction() -> core.run() or core.runBatch()
  -> search loop: api.searchMessages() -> filter.filterMessages() -> delete.deleteMessages()
  -> each message: api.deleteMessage() with retry
  -> callbacks update UI (onProgress, onStop)
```

## Key decisions

- **IIFE bundle**: Required for userscripts - no module system in browser context
- **`@grant none`**: Runs in Discord's page context, access to DOM and localStorage
- **CSS injection via `<style>`**: Userscripts can't load external CSS files
- **`innerHTML` in `createElm()`**: Accepted for static templates from our own code
- **`insertAdjacentHTML` in logger**: Safe because all external data passes through `escapeHTML()`
- **`window.messagePicker`**: Intentional global exposure for interactive message picking
- **`webpackChunkdiscord_app`**: Required to extract token when localStorage fails

## CSS variables

Always use fallback pattern: `var(--new-name, var(--old-name))`
Discord renames CSS variables frequently. See mapping in `/review` command.

## Discord API

- Version: `v9` (from `constants.js`)
- Search: `GET /guilds/{id}/messages/search` or `/channels/{id}/messages/search`
- Delete: `DELETE /channels/{id}/messages/{id}`
- Unarchive: `PATCH /channels/{id}` with `{archived: false}`
- Rate limit: 429 -> respect `retry_after`, increase delay
- Indexing: 202 -> retry after `retry_after`

## Version

Single source of truth: `package.json` -> embedded via rollup `baked-env` plugin.
Branch: `master`. Commit style: bare version number (e.g. `5.3.0`).
