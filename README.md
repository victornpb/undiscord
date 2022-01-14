# Undiscord Plus - Wipe your messages in a Discord channel or private conversation

> :warning: **Any tool for deleting messages, including this one, could result in the termination of your account** (see [self-bots](https://support.discordapp.com/hc/en-us/articles/115002192352-Automated-user-accounts-self-bots-)). Use at your own risk!

1. Install a browser extension for managing user scripts.

    - Chrome: [Violentmonkey](https://chrome.google.com/webstore/detail/violent-monkey/jinjaccalgkegednnccohejagnlnfdag) or [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)     
    - Firefox: [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/), [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/), or [Violentmonkey](https://addons.mozilla.org/firefox/addon/violentmonkey/)  
    - Safari: ~[Tampermonkey](https://github.com/victornpb/deleteDiscordMessages/issues/91#issuecomment-654514364)~ 
    - Microsoft Edge: [Tampermonkey](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd) or [Violentmonkey](https://microsoftedge.microsoft.com/addons/detail/violentmonkey/eeagobfjdenkkddmbclomhiblgggliao)  
    - Opera: [Tampermonkey](https://addons.opera.com/extensions/details/tampermonkey-beta/) or [Violentmonkey](https://addons.opera.com/extensions/details/violent-monkey/)  

2. Install [Undiscord Plus](https://github.com/abbydiode/UndiscordPlus/raw/master/deleteDiscordMessages.user.js) from this repository.

3. Open [Discord](https://discord.com/channels/@me) in your __browser__ and go to the channel or private conversation that you would like to be wiped.

4. Click the <kbd>🗑️</kbd> button that was added in the top right corner.

5. Click on the <kbd>Get</kbd> buttons near **Authorization**, **Author** and **Channel**.  
   *(Optional: getting [authToken](./help/authToken.md), [authorId](./help/authorId.md), [channelId](./help/channelId.md) and [messageId](./help/messageId.md)  manually)*

6. Click the <kbd>Start</kbd> button.

![Screenshot](https://user-images.githubusercontent.com/3372598/86538983-b60c7980-becf-11ea-8cad-1a33950e77fc.gif)

# DO NOT SHARE YOUR AUTHORIZATION TOKEN!

Sharing your authToken on the internet will give full access to your account! [There are bots gathering credentials all over the internet](https://github.com/rndinfosecguy/Scavenger).
If you post your token by accident, LOGOUT from discord on that **same browser** you got that token imediately.
Changing your password will make sure that you get logged out of every device. I advice that you turn on [2FA](https://support.discord.com/hc/en-us/articles/219576828-Setting-up-Two-Factor-Authentication) afterwards.

If you are unsure do not share screenshots, or copy paste logs on the internet.

---

This project is a fork of [victornpb's deleteDiscordMessages project](https://github.com/victornpb/deleteDiscordMessages).

If you have issues or just need help feel free to [open an issue here](https://github.com/abbydiode/UndiscordPlus/issues).
