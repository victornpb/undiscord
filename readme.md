# Delete all messages in a Discord channel or DM

1. Open Discord in a browser like Chrome or Firefox;

2. Open DevTools pressing <kbd>F12</kbd> or <kbd>⌘ command</kbd>+<kbd>option</kbd>+<kbd>J</kbd>;

3. Copy the [deleteDiscordMessages.js](#file-deletediscordmessages-js) script and paste it in the Console, then press <kbd>ENTER</kbd>;  
   
4. Edit the following text, then paste it in the console:

    **Continue reading for [instructions](#Variables) on how edit each variable**
    
    ```js
    // fill with your info
    var authToken = "MTX5MzQ1MjAyMjU0NjA2MzM2.ROFLMAO.UvqZqBMXLpDuOY3Z456J3JRIfbk";
    var authorId = "112233445566778899";
    var channelId = "112233445566778899";
    var firstMessageId = "";

    deleteMessages(authToken, authorId, channelId, firstMessageId); //start
    ```
    *I recommend that you paste it inside a text editor, change it and then paste it in the console.*
5. It will start to delete messages. You will be able to follow the progress and the remaining time in a popup window.  
**Do not close this window while it is running!**
  <img src="https://user-images.githubusercontent.com/3372598/55703780-ec97d380-59b0-11e9-93e6-73983cb32de5.png" height="300">

#### Abort / Stop
Inside the **console**, type (uppercase) `STOP=1` and press <kbd>ENTER</kbd>.  


## Variables
> 
> ### authToken
> <img src="https://user-images.githubusercontent.com/3372598/58374446-e5f7f800-7f2d-11e9-9db0-d1a723571d6d.png" width="100%"> 
> 
> 1. Open the dev tools (F12), open the Network tab. (You should clear all requests for better readability if you see some.)
> 2. Delete one message manually. In the request log, you will see a request with a DELETE method.
> 3. Click on the request to open the details, and on the Headers tab, copy the 'authorization' token. It's a long text > with dots like `MTX5MzQ1MjAyMjU0NjA2MzM2.ROFLMAO.UvqZqBMXLpDuOY3Z456J3JRIfbk`.
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
>   Leave this variable empty `""`.  


<br>

----
#### DeveloperMode
If the `Copy ID` menu doens't show up when right clicking:  
 - Enable developer mode in discord
   Go to user **Settings** > **Appearance** in discord and enable **Developer mode**.  
   <img src="https://user-images.githubusercontent.com/3372598/58374693-fa3df400-7f31-11e9-9abd-ba17b9440326.png" height="50">  

----
DO NOT SHARE YOUR `authToken` !
----

**DISCLAIMER:** *USE AT YOUR OWN RISK! I TAKE NO RESPONSABILITY FOR ANYTHING POSTED HERE!*

Last tested: 2019-MAY-25