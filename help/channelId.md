# guildId / channelId

## The easy way

### DMs or a Channel
1. Go to the desired Channel or DM conversation on discord
2. Click the "current" button next to Channel ID

### Entire Server
1. Go to any Channel in the Server you want to delete
2. Click the "current" button next to Server ID
3. Leave the *Channel ID* box empty

### Threads
When you click "current" while viewing a thread, Undiscord automatically detects it and:
- Uses the **parent channel ID** for searching (Discord's search API doesn't support thread-specific searches)
- Filters results to only delete messages from that specific thread
- Shows a log message: "Detected thread. Using parent channel X, will filter by thread Y."

> **Note**: Thread detection requires the Authorization Token to be filled in (it makes an API call to check the channel type).

----

## The manual way

### For public channels:
- Right click a channel, [Copy ID](./developerMode.md)

### For a DM/Direct messages:
- Copy the number after `/@me/` in the URL

---

You can target multiple channels in sequence by separating them with a comma.

---

## Deleting all messages by using the "Request a Copy of your Data" option

To delete all messages from every (user) channel:
1. Go to "User Settings -> Privacy and Safety" and click on "Request all my Data."
2. You should receive an email within the next 30 days
3. Click on the "Import JSON" button — the right JSON file is called "index.json" and is located in the messages folder (messages/index.json).
4. The channel IDs will be imported separated by a comma.

> **Note**: When using archive wipe, if a channel no longer exists or you don't have access, Undiscord will skip it automatically and continue with the next channel instead of stopping.

-----

> If the `Copy ID` doesn't show up, you need to enable [Developer mode](./developerMode.md) first.
