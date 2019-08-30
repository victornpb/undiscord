<h1 align="center">
    deleteDiscordMessages
</h1>

<p align="center">
    Delete all messages in a Discord channel or DM
</p>

<p align="center">
<strong>
<br>
I am not responsible if you get banned for running this userbot, run at your own discretion.
<br>
You can suggest this feature to official <a href="https://discordapp.com/invite/discord-feedback">Discord Feedback</a> or via <a href="https://feedback.discordapp.com">website</a>
<br>
<br>
Read this entire document first!
After that if you need help post comments, questions or issues: <a href="https://github.com/victornpb/deleteDiscordMessages/issues/new">here</a>
<br>
<br>
Last tested: 2019-AUG-29
</strong>
</p>

## Table of contents

- [Quick start](#quick-start)
- [Variables](#variables)
    - [authToken](#authtoken)
    - [authorId](#authorid-user-id)
    - [channelId](#channel-id)
    - [firstMessageId](#firstmessageid-message-id)
- [How To Enable Developer Mode](#how-to-enable-developer-mode)
- [Script](#script)

## Quick start

1. Open Discord in a browser like Chrome or Firefox.

2. Open DevTools pressing <kbd>F12</kbd> or <kbd>⌘ command</kbd>+<kbd>option</kbd>+<kbd>J</kbd>

3. Copy the [script](https://raw.githubusercontent.com/victornpb/deleteDiscordMessages/master/deleteDiscordMessages.js) and paste it in the console, then press <kbd>ENTER</kbd>. 

4. A window will be opened, fill the variables and click the <button>START</button> button.

<div align="center">
    <img src="https://user-images.githubusercontent.com/3372598/63647194-f158ec00-c6f3-11e9-9419-79cfb04e2399.png" alt="deleteDiscordMessages window">
</div>

## Variables

### **authToken**

<h1 align="center">
    DO NOT SHARE YOUR <code>authToken</code>!
</h1>

Sharing your authToken (usertoken) on the internet will give full access to your account! [There are bots gathering credentials all over the internet](https://github.com/rndinfosecguy/Scavenger).
If you post your token by accident, LOGOUT from discord on that **same browser** you got that token imediately.
Changing your password will make sure that you get logged out of every device. I advice that you turn on [2FA](https://support.discordapp.com/hc/en-us/articles/219576828-Setting-up-Two-Factor-Authentication) afterwards.

If you are unsure do not share screenshots, or copy paste logs on the internet.

#

<img src="https://user-images.githubusercontent.com/3372598/58374446-e5f7f800-7f2d-11e9-9db0-d1a723571d6d.png" width="100%"> 

1. Open the dev tools <kbd>F12</kbd>, open the Network tab. (You should clear all requests for better readability if you see some.)
2. Delete one message manually. In the request log, you will see a request with a DELETE method.
3. Click on the request to open the details, and on the Headers tab, copy the 'authorization' token. It's a long text with dots like `MTX5MzQ1MjAyMjU0NjA2MzM2.ROFLMAO.UvqZqBMXLpDuOY3Z456J3JRIfbk`.

### **authorId (User ID)**

- Right click your **avatar or username** in a message you sent in the chat, [Copy ID](#how-to-enable-developer-mode)  
<div align="center">
    <img src="https://media.giphy.com/media/YnNTRqKRxVcjOuyFps/giphy.gif">  
</div>

<div align="center">
    <p><strong>You cannot delete the other's person messages a in DM channel, you will get Error 403.</strong></p>
</div>

### **Channel ID**

- **For public channels:** Right click a channel, [Copy ID](#how-to-enable-developer-mode)  
<div align="center">
    <img src=https://media.giphy.com/media/UqBPG05BIP3Vkj7Pby/giphy.gif>
</div>

- **For a DM/Direct messages:** copy the number after /@me/ in the URL)  
<div align="center">
    <img src="https://user-images.githubusercontent.com/3372598/58374439-d9739f80-7f2d-11e9-85f4-3c241a85a8bb.png" height="200">
</div>

### **firstMessageId (Message ID)**

- Delete messages after one message:  
  Right click a message, [Copy ID](#how-to-enable-developer-mode)  

    <div align="center">
    <img src="https://user-images.githubusercontent.com/3372598/58374442-daa4cc80-7f2d-11e9-843b-10aec30fe349.png" height="250">  
    </div>

- Delete since the begining of a channel:  
  Leave this variable empty.  

## How To Enable Developer Mode

If the `Copy ID` menu doesn't show up when right clicking:  
 - Enable developer mode in discord
   Go to user **Settings** > **Appearance** in discord and enable **Developer mode**.  

<div align="center">
    <img src="https://user-images.githubusercontent.com/3372598/58374693-fa3df400-7f31-11e9-9abd-ba17b9440326.png">
</div>

## Script

The script started small and it grew with time, as I made it more reliable and user friendly.
I did not attempt to make this script short, I deliberately choose to make it readable, so people can analyze it before running.

Started originally at https://gist.github.com/victornpb/135f5b346dea4decfc8f63ad7d9cc182
