# Wipe Archive (Import JSON)

Delete all your messages across every DM and channel using your Discord data export.

## How to get your data

1. Go to **User Settings > Privacy and Safety**
2. Click **"Request all of my Data"**
3. Wait for the email from Discord (can take up to 30 days)
4. Download and extract the ZIP file

## How to use

1. Click the **"Choose File"** button in the Wipe Archive section
2. Navigate to the extracted folder and select `messages/index.json`
3. The channel IDs will be automatically imported and separated by commas
4. The Guild ID will be set to `@me` (DMs) and your Author ID will be auto-filled
5. Click **"Delete"** to start

## What happens during archive wipe

- Undiscord processes each channel one at a time as a batch job
- There is an automatic **30-second delay** between each channel to prevent API rate limiting
- If a channel **no longer exists** (deleted server, closed DM), it is automatically skipped with a warning
- If you **don't have access** to a channel anymore, it is skipped gracefully
- If a channel fails for any reason, Undiscord continues with the next one instead of stopping

## Notes

- The `index.json` file only contains channel IDs, not the actual messages
- Undiscord still needs to search for your messages in each channel via the Discord API
- This process can take a very long time if you have many channels with many messages
- You can stop and restart at any time — already-deleted messages won't be found again
