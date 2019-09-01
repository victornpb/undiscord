# Delete all messages in a Discord channel or DM

1. Open Discord in a browser like Chrome or Firefox;

2. Open DevTools pressing <kbd>F12</kbd> or <kbd>⌘ command</kbd>+<kbd>option</kbd>+<kbd>J</kbd>;

3. Copy the [deleteDiscordMessages.js](https://github.com/victornpb/deleteDiscordMessages/blob/master/deleteDiscordMessages.js) script and paste it in the Console tab, then press <kbd>ENTER</kbd>;  

4. A window will be opened, fill the [variables](#Variables) and click the <button>START</button> button.
   
  <img src="https://user-images.githubusercontent.com/3372598/63647194-f158ec00-c6f3-11e9-9419-79cfb04e2399.png" height="600">

------------

Read this entire document first!

After that if you need help post comments, questions or issues: [here](https://github.com/victornpb/deleteDiscordMessages/issues/new)

------------

## Variables
> 
> ### authToken
> <img src="https://user-images.githubusercontent.com/3372598/58374446-e5f7f800-7f2d-11e9-9db0-d1a723571d6d.png" width="100%"> 
> 
> 1. Open the DevTools (<kbd>F12</kbd> or <kbd>⌘ command</kbd>+<kbd>option</kbd>+<kbd>J</kbd>), open the "Network" tab.
> 2. Click on "XHR"
> 2. Type `api/v6` on the filter box.
> 4. Click on any request in the list, and then click on "Headers" tab in the side panel.
>   You're looking for something like this **authorization:** `MTX5MzQ1MjAyMjU0NjA2MzM2.ROFLMAO.UvqZqBMXLpDuOY3Z456J3JRIfbk`.
> 
> ### authorId
> - Right click your **avatar** in a message you sent in the chat, [Copy ID](#DeveloperMode)  
>   <img src="https://media.giphy.com/media/YnNTRqKRxVcjOuyFps/giphy.gif">  
>   NOT THE MESSAGE THE AVATAR.  
>   (You cannot delete the other's person messages a in DM channel, you will get Error 403)
> 
> ### channelId
> - **For public channels:** Right click a channel, [Copy ID](#DeveloperMode)  
>    <img src=https://media.giphy.com/media/UqBPG05BIP3Vkj7Pby/giphy.gif>
> - **For a DM/Direct messages:** copy the number after /@me/ in the URL)  
>    <img src="https://user-images.githubusercontent.com/3372598/58374439-d9739f80-7f2d-11e9-85f4-3c241a85a8bb.png" height="200">
> 
> ### firstMessageId
> - Delete messages after one message:  
>   Right click a message, [Copy ID](#DeveloperMode)  
>   <img src="https://user-images.githubusercontent.com/3372598/58374442-daa4cc80-7f2d-11e9-843b-10aec30fe349.png" height="250">  
> - Delete since the begining of a channel:  
>   Leave this variable empty.  


<br>

----
#### DeveloperMode
If the `Copy ID` menu doesn't show up when right clicking:  
 - Enable developer mode in discord
   Go to user **Settings** > **Appearance** in discord and enable **Developer mode**.  
   <img src="https://user-images.githubusercontent.com/3372598/58374693-fa3df400-7f31-11e9-9abd-ba17b9440326.png" height="50">  

----
# DO NOT SHARE YOUR `authToken`!

Sharing your authToken on the internet will give full access to your account! [There are bots gathering credentials all over the internet](https://github.com/rndinfosecguy/Scavenger).
If you post your token by accident, LOGOUT from discord on that **same browser** you got that token imediately.
Changing your password will make sure that you get logged out of every device. I advice that you turn on [2FA](https://support.discordapp.com/hc/en-us/articles/219576828-Setting-up-Two-Factor-Authentication) afterwards.

If you are unsure do not share screenshots, or copy paste logs on the internet.

----

#### Script

The script started small and it grew with time, as I made it more reliable and user friendly.
I did not attempt to make this script short, I deliberately choose to make it readable, so people can analyze it before running.

Started originally at https://gist.github.com/victornpb/135f5b346dea4decfc8f63ad7d9cc182

----
> **DISCLAIMER:**
> THE SOFTWARE AND ALL INFORMATION HERE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
>
> By using any code or information provided here you are agreeing to all parts of the above Disclaimer.

Last tested: 2019-AUG-21
