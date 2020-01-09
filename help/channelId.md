# channelId

## The easy way

1.  Go to the desired channel or DM conversation on discord
2. Click the "<button>Current</button>" button next to Channel in the popup window

----

## The manual way

### For public channels:
- Right click a channel, [Copy ID](./developerMode.md)
<img src=https://media.giphy.com/media/UqBPG05BIP3Vkj7Pby/giphy.gif>


### For a DM/Direct messages:

- copy the number after /@me/ in the URL)
<img src="https://user-images.githubusercontent.com/3372598/58374439-d9739f80-7f2d-11e9-85f4-3c241a85a8bb.png" height="200">

---

## Deleting all messages by using the "Request a Copy of your Data" option

To delete all message from every (user) channel do following:
1. Go to "User Settings -> Privacy and Safety" and click on "Request all my Data."
2. You should receive an email within the next 30 days
3. Click on the "Import JSON" button the right JSON file is called "index.json" and is located in the messages folder (messages/index.json).
4. The channel IDs will be imported separated by a semi-colon.

-----

> If the `Copy ID` doesn't show up, you need to enable [Developer mode](./developerMode.md) first. You can target multiple channels at once by separating them with a semi-colon (;).
