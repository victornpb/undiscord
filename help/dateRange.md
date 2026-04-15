# Date Range Filter

Delete only messages posted between two dates.

## After date
Messages posted **after** this date will be deleted. Messages before this date are skipped.

## Before date
Messages posted **before** this date will be deleted. Messages after this date are skipped.

## Important

- **You must enter both a date AND a time** for each field. If you leave the time empty, the `datetime-local` input will be `null` and the filter will be silently ignored.
- Date filtering does **not** work if you also use the "Messages interval" (min/max message ID). The message ID interval takes priority.
- Dates are converted to Discord snowflake IDs internally using the Discord epoch (January 1, 2015).

## Examples

- Delete messages from a specific day: Set "After" to `2024-01-15 00:00` and "Before" to `2024-01-16 00:00`
- Delete old messages: Set "Before" to `2023-01-01 00:00` and leave "After" empty
- Delete recent messages: Set "After" to `2024-06-01 00:00` and leave "Before" empty
