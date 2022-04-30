# Undiscord - Delete all messages in a Discord channel or DM
<!-- shields -->
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/victornpb/undiscord?color=%235865f2&display_name=tag&label=Undiscord&style=flat-square)][greasyfork_url]
[![GitHub Release Date](https://img.shields.io/github/release-date/victornpb/undiscord?style=flat-square)](https://github.com/victornpb/undiscord/releases)
[![GitHub License](https://img.shields.io/github/license/victornpb/undiscord?style=flat-square)](https://github.com/victornpb/undiscord/blob/master/LICENSE)
[![CodeFactor](https://www.codefactor.io/repository/github/victornpb/undiscord/badge?style=flat-square)](https://www.codefactor.io/repository/github/victornpb/undiscord?style=flat-square)
[![GitHub Stars](https://img.shields.io/github/stars/victornpb/undiscord?style=flat-square)](https://github.com/victornpb/undiscord/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/victornpb/undiscord?style=flat-square)](https://github.com/victornpb/undiscord/network/members)
[![GitHub Discussions](https://img.shields.io/github/discussions/victornpb/undiscord?style=flat-square)](https://github.com/victornpb/undiscord/discussions)
[![GitHub open issues](https://img.shields.io/github/issues/victornpb/undiscord?style=flat-square)](https://github.com/victornpb/undiscord/issues?q=is%3Aopen+is%3Aissue)
[![GitHub closed issues](https://img.shields.io/github/issues-closed/victornpb/undiscord?style=flat-square)](https://github.com/victornpb/undiscord/issues?q=is%3Aissue+is%3Aclosed)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/victornpb/undiscord?style=flat-square)](https://github.com/victornpb/undiscord/pulls)
[![GitHub closed pull requests](https://img.shields.io/github/issues-pr-closed/victornpb/undiscord?style=flat-square)](https://github.com/victornpb/undiscord/pulls?q=is%3Apr+is%3Aclosed)
<!-- end shields -->

> :warning: **Any tool for deleting messages, including this one, could result in the termination of your account** (see [self-bots][self-bots]).
> Discord appears to have recently started terminating accounts using self-bots ([thread](https://github.com/victornpb/deleteDiscordMessages/issues/193)). Use at your own risk.

1. First you need a Browser Extension for managing UserScripts[[1]][userscrips_faq] (skip if you already have one):
    
    - Chrome: [Violentmonkey][chrome_violentmonkey] or [Tampermonkey][chrome_tampermonkey]
    - Firefox: [Greasemonkey][firefox_greasemonkey], [Tampermonkey][firefox_tampermonkey], or [Violentmonkey][firefox_violentmonkey]  
    - Opera: [Tampermonkey][opera_tampermonkey] or [Violentmonkey][opera_violentmonkey]   
    - Edge: [Tampermonkey][edge_tampermonkey]  
    - Safari: ~[Tampermonkey][safari_tampermonkey]~ 
    

1. Install Undiscord:  
  [![][greasyfork_icon]][greasyfork_url] or [![][openuserjs_icon]][openuserjs_url]

1. Open <a href="https://discord.com/channels/@me" target="_blank">Discord</a> in your __browser__ (Not the App) and go to the Channel/Conversation you want to delete

1. Click the *Trash icon* that was added in the *top right corner*

1. Click on the `GET` buttons near **Authorization**, **Author** and **Channel**.  
   *(Optional: getting [authToken](./help/authToken.md), [authorId](./help/authorId.md), [channelId](./help/channelId.md) and [messageId](./help/messageId.md)  manually)*

1. Click the <kbd>START</kbd> button.

![Screenshot](https://user-images.githubusercontent.com/3372598/86538983-b60c7980-becf-11ea-8cad-1a33950e77fc.gif)

I made this tool just for you ❤️ , it would be awesome if you could just click the [⭐️ Star button](https://github.com/victornpb/deleteDiscordMessages) at the top! 
   
If you have issues or just need help [open a discussion here](https://github.com/victornpb/deleteDiscordMessages/discussions)

> A few extra generous people asked for this, so here you can [buy me a coffee](https://www.buymeacoffee.com/vitim). Thank you! You'll be in my special list ^_^

\* Looking for the old Copy/Paste version? [here](./help/copyPaste.md)

----

#### Features

- Fastest script out there, it auto adjusts the delay to be the fastest your internet and discords allows!
- Easy interface with instructions
- Respect discord API rate limits
- Auto detect current [authToken](./help/authToken.md), [authorId](./help/authorId.md), [channelId](./help/channelId.md)
- It can delete a specific [range of messages](./help/messageId.md)
- It can delete only [links or attached files](./help/filters.md)
- Comprehensive log of messages being deleted (with their content)
- Hide private information for taking screenshots
- Detects system messages and skips them like "You started a voice call"
- You can use your computer and discord while it is running (unlike macro key scripts)
- Start/stop whenever you want
- Works with even thousands of messages

----

Originally from https://gist.github.com/victornpb/135f5b346dea4decfc8f63ad7d9cc182

----

#### About running code on your console

I don't recommend running code from random places you get on the internet. For that same reason, I deliberately choose to make it readable (that's why it is a bit lenthy). That way people can analyze it and understand what does it does before running it, and be sure that nothing sketchy is happening under the hood.

----
# ⛔️ DO NOT SHARE YOUR AUTH TOKEN! ⛔️

Sharing your authToken on the internet will give full access to your account! [There are bots gathering credentials all over the internet](https://github.com/rndinfosecguy/Scavenger).
If you post your token by accident, LOGOUT from discord on that **same browser** you got that token imediately.
Changing your password will make sure that you get logged out of every device. I advice that you turn on [2FA](https://support.discord.com/hc/en-us/articles/219576828-Setting-up-Two-Factor-Authentication) afterwards.

If you are unsure do not post screenshots, or logs on the internet.

----
> **DISCLAIMER:**
> THE SOFTWARE AND ALL INFORMATION HERE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
>
> By using any code or information provided here you are agreeing to all parts of the above Disclaimer.


<!-- links -->
  [self-bots]: https://support.discordapp.com/hc/en-us/articles/115002192352-Automated-user-accounts-self-bots-
  [userscrips_faq]: https://en.wikipedia.org/wiki/Userscript
  [greasyfork_icon]: https://user-images.githubusercontent.com/3372598/166113712-1bc3d654-1342-4f1e-9845-21c3b21524b1.png
  [openuserjs_icon]: https://user-images.githubusercontent.com/3372598/166113714-5a2ede39-8d66-43a8-b5da-8f1897cb3121.png

<!-- Extensions -->
  [chrome_violentmonkey]: https://chrome.google.com/webstore/detail/violent-monkey/jinjaccalgkegednnccohejagnlnfdag
  [chrome_tampermonkey]: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
  [firefox_greasemonkey]: https://addons.mozilla.org/firefox/addon/greasemonkey/
  [firefox_tampermonkey]: https://addons.mozilla.org/firefox/addon/tampermonkey/
  [firefox_violentmonkey]: https://addons.mozilla.org/firefox/addon/violentmonkey/
  [safari_tampermonkey]: https://github.com/victornpb/deleteDiscordMessages/issues/91#issuecomment-654514364
  [edge_tampermonkey]: https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd
  [opera_tampermonkey]: https://addons.opera.com/extensions/details/tampermonkey-beta/
  [opera_violentmonkey]: https://addons.opera.com/extensions/details/violent-monkey/

<!-- Download links -->
  [greasyfork_url]: <https://greasyfork.org/en/scripts/406540-undiscord-delete-all-messages-in-a-discord-channel-or-dm-bulk-deletion> "Get Undiscord from GreasyFork"
  [openuserjs_url]: <https://openuserjs.org/scripts/victornpb/Undiscord_-_Delete_all_messages_in_a_Discord_channel_or_DM_(Bulk_deletion)> "Get Undiscord from OpenUserJS"
