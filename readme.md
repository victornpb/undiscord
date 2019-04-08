# Delete all messages in a Discord channel or DM

1. Open Discord in a browser like Chrome or Firefox;

2. Open DevTools pressing <kbd>F12</kbd> or <kbd>CMD</kbd>+<kbd>OPTION</kbd>+<kbd>J</kbd>;

3. Copy the [deleteMessages.js](https://gist.github.com/victornpb/135f5b346dea4decfc8f63ad7d9cc182#file-deletemessages-js) script and paste it in the Console and press ENTER;
   
4. Edit the following variables, then paste it in the console:

    ```js
    // Your token, you can find it in other requests headers
    var authToken = "NabcdefghiU4NDY5ODI2NTY.KXx1ab.aU8FUz9fOABxdsi1LYORJuv666f";

    // Right click your avatar in any chat, Copy ID
    var authorId = "112233445566778899";

    // Right click a channel or DM, Copy ID
    var channelId = "112233445566778899";

    // Delete all messages after this one, (leave blank to delete all your messages in a channel)
    var firstMessageId = "";


    deleteMessages(authToken, authorId, channelId, firstMessageId); //start
    ```

    #### authToken
      - Open the dev tools (F12), open the Network tab. (You should clear all requests for better readability if you see some.)
      - Delete one message manually. In the request log, you will see a request with a DELETE method.
      - Click on the request to open the details, and on the Headers tab, copy the 'authorization' token. It's a long text with dots like `MTX5MzQ1MjAyMjU0NjA2MzM2.ROFLMAO.UvqZqBMXLpDuOY3Z456J3JRIfbk`.

    #### authorId
      - Right click your avatar in any chat, Copy ID
      
    #### channelId
      - Right click a channel, Copy ID, For DM copy the number after /@me/ in the URL

    #### firstMessageId
      - Right click a message, Copy ID (Leave this variable empty for deleting all your messages in a channel)
      
<br>

> **NOTE:** if the `Copy ID` menu doens't show up when right clicking  
> Enable developer mode in discord
>   Go to user **Settings** > **Appearance** in discord and enable **Developer mode**.


5. The script will start to run, a popup will be opened showing the progress and the messages being deleted, as well as a remaining time. Do not close it.

----

You can stop the process by typing `STOP=1` in the console (UPPERCASE) and pressing ENTER.

----
DO NOT SHARE YOUR `authToken` !
----

**DISCLAIMER:** *USE AT YOUR OWN RISK! I TAKE NO RESPONSABILITY FOR ANYTHING POSTED HERE!*

Tested: 2019-APRIL