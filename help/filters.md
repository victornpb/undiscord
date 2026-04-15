# Filters

You can filter messages to delete only specific types.

## Search text
Only delete messages that contain the specified text.

## has link
If you select this option, only messages with links are going to be deleted.

## has file
If you select this option, only messages with files are going to be deleted.
Images, videos are also files.

## Include pinned
If checked, pinned messages will also be deleted. By default, pinned messages are skipped.

## Include bot/application messages
If checked, messages from bots and application commands (slash commands) will be included in deletion. If unchecked, bot messages are skipped — this is useful to avoid 403 errors when you don't have "Manage Messages" permission, since bot command responses can only be deleted by users with that permission.

> **Note**: Poll messages (type 46) are always included when found, as they can be self-deleted by the poll creator.

> **Note**: Thread starter messages (type 21) and bot slash command responses (type 20) are automatically excluded from deletion as they cannot be deleted by the message author.

----
This feature uses the Discord search to find messages:
https://support.discord.com/hc/en-us/articles/115000468588-Using-Search
