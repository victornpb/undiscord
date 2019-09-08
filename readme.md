# Delete all messages in a Discord channel or DM

<img src="https://user-images.githubusercontent.com/3372598/64483026-59b6cb80-d1d2-11e9-858a-caac4ff8cb0d.png" height="600">

1. Open Discord in a **browser** like Chrome, Safari or Firefox;

2. Open DevTools pressing
    - Chrome (Windows, Linux, Chrome OS):
    <kbd>F12</kbd> or <kbd>Control</kbd>+<kbd>Shift</kbd>+<kbd>J</kbd> 
    - Chrome (Mac): 
    <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>J</kbd>
    - Safari (Mac): <kbd>Command</kbd>+<kbd>Option</kbd>+<kbd>C</kbd>


3. Copy the [deleteDiscordMessages.js](https://github.com/victornpb/deleteDiscordMessages/blob/master/deleteDiscordMessages.js) script and paste it in the "Console" tab, then press <kbd>ENTER</kbd>, a popup window will open;

4. Provide your [authToken](./help/authToken.md) (click for instructions)

5. On discord go to a channel or a DM conversation, then
 click on the buttons named "<button>Current</button>".  
   *(Optional: Intructions on how to get [authorId](./help/authorId.md), [channelId](./help/channelId.md) and [messageId](./help/messageId.md)  manually)*

6. Click the "<button>START</button>" button.
   
If you have issues or just need help [open an issue here](https://github.com/victornpb/deleteDiscordMessages/issues)

I made this tool just for you, it would be awesome if you could just click the Star button at the top! 

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
----

Last tested: 2019-SEP-8
