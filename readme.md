# Delete all messages in a Discord channel or DM

1. Open discord in a browser

2. Open DevTools pressing F12 or CMD-OPTION-J  

3. Paste the **deleteMessages.js** script in the Console and press ENTER
   
4. Edit and paste the following variables:

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
      
.


> **NOTE:** if the `Copy ID` menu doens't show up when right clicking  
> Enable developer mode in discord
>   Go to user **Settings** > **Appearance** in discord and enable **Developer mode**.

----
DO NOT SHARE YOUR `authToken` !
----

**DISCLAIMER:** *USE AT YOUR OWN RISK! I TAKE NO RESPONSABILITY FOR ANYTHING POSTED HERE!*

Tested: 2019-APRIL