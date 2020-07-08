# Undiscord - Delete all messages in a Discord channel or DM

1. Install a **browser extension** for managing **user scripts** (skip if you already have one):
    
    - Chrome: [Violentmonkey](https://chrome.google.com/webstore/detail/violent-monkey/jinjaccalgkegednnccohejagnlnfdag) or [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)     
    - Firefox: [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/), [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/), or [Violentmonkey](https://addons.mozilla.org/firefox/addon/violentmonkey/)  
    - Safari: ~[Tampermonkey](https://github.com/victornpb/deleteDiscordMessages/issues/91#issuecomment-654514364)~ 
    - Microsoft Edge: [Tampermonkey](https://www.microsoft.com/store/p/tampermonkey/9nblggh5162s)  
    - Opera: [Tampermonkey](https://addons.opera.com/extensions/details/tampermonkey-beta/) or [Violentmonkey](https://addons.opera.com/extensions/details/violent-monkey/)  

1. Install Undiscord **<a href="https://openuserjs.org/scripts/victornpb/Undiscord_-_Delete_all_messages_in_a_Discord_channel_or_DM_(Bulk_deletion)" target="_blank">Install from OpenUserJS</a> or <a href="https://greasyfork.org/en/scripts/406540-undiscord-delete-all-messages-in-a-discord-channel-or-dm-bulk-deletion" target="_blank">Install from GreasyFork</a>**

1. Open <a href="https://discordapp.com/channels/@me" target="_blank">Discord</a> in your __browser__ (Not the App) and go to the Channel/Conversation you want to delete

1. Click the *Trash icon* that was added in the *top right corner*

1. Click on the blue buttons near **Authorization**, **Author** and **Channel**.  
   *(Optional: getting [authToken](./help/authToken.md), [authorId](./help/authorId.md), [channelId](./help/channelId.md) and [messageId](./help/messageId.md)  manually)*

1. Click the **START** button.

![Screenshot](https://user-images.githubusercontent.com/3372598/86538983-b60c7980-becf-11ea-8cad-1a33950e77fc.gif)

I made this tool just for you ❤️ , it would be awesome if you could just click the [⭐️ Star button](https://github.com/victornpb/deleteDiscordMessages) at the top! 
   
If you have issues or just need help [open an issue here](https://github.com/victornpb/deleteDiscordMessages/issues)

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
# DO NOT SHARE YOUR `authToken`!

Sharing your authToken on the internet will give full access to your account! [There are bots gathering credentials all over the internet](https://github.com/rndinfosecguy/Scavenger).
If you post your token by accident, LOGOUT from discord on that **same browser** you got that token imediately.
Changing your password will make sure that you get logged out of every device. I advice that you turn on [2FA](https://support.discordapp.com/hc/en-us/articles/219576828-Setting-up-Two-Factor-Authentication) afterwards.

If you are unsure do not share screenshots, or copy paste logs on the internet.

----
> **DISCLAIMER:**
> THE SOFTWARE AND ALL INFORMATION HERE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
>
> By using any code or information provided here you are agreeing to all parts of the above Disclaimer.
