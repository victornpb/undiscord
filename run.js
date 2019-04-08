//Your token, you can find it in other requests headers
var authToken = "NabcdefghiU4NDY5ODI2NTY.KXx1ab.aU8FUz9fOABxdsi1LYORJuv666f";

//Right click your avatar in any chat, Copy ID
var authorId = "112233445566778899";

//Right click a channel or DM, Copy ID
var channelId = "112233445566778899";

//Delete all messages after this one, (leave blank to delete all your messages in a channel)
var firstMessageId = "";

//start
deleteMessages(authToken, authorId, channelId, firstMessageId);