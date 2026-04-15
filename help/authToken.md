# Authorization Token

Undiscord tries to detect your token automatically using three methods:

1. **localStorage** (via iframe) — the most reliable method
2. **Webpack module cache** — fallback if localStorage fails
3. **Alternative webpack export path** — second fallback

If all automatic methods fail, you'll see an error message and can enter your token manually.

## Getting your token manually

1. Open Discord in your browser
2. Press `F12` to open DevTools
3. Go to the **Network** tab
4. Type `api/v9` in the filter box
5. Click on any request in the list, then click the **Headers** tab
6. Look for the `authorization` header — it looks like:
   `MTX5MzQ1MjAyMjU0NjA2MzM2.ROFLMAO.UvqZqBMXLpDuOY3Z456J3JRIfbk`
7. Copy the value and paste it in the "Authorization Token" field in Advanced Settings

## Auto-fill button

Click the **"fill"** button next to the token field to attempt automatic detection. If it doesn't work, use the manual method above.

----

# DO NOT SHARE YOUR `authToken`!

> Sharing your authToken on the internet will give full access to your account! [There are bots gathering credentials all over the internet](https://github.com/rndinfosecguy/Scavenger).
If you post your token by accident, LOGOUT from discord on that **same browser** you got that token immediately.
Changing your password will make sure that you get logged out of every device. We advise that you turn on [2FA](https://support.discord.com/hc/en-us/articles/219576828-Setting-up-Two-Factor-Authentication) afterwards.

If you are unsure, do not share screenshots or copy-paste logs on the internet. Use **Streamer Mode** (enabled by default) to hide sensitive data.

----
