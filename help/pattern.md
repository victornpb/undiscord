# Pattern (Regular Expression)

Delete only messages whose content matches a regular expression pattern.

## How to use

Enter a regex pattern in the text field. The pattern is case-insensitive (`/i` flag).

## Examples

| Pattern | Matches |
|---------|---------|
| `hello` | Messages containing "hello", "Hello", "HELLO" |
| `^hello` | Messages starting with "hello" |
| `hello$` | Messages ending with "hello" |
| `hello\|world` | Messages containing "hello" OR "world" |
| `\d{4}` | Messages containing 4 consecutive digits |
| `https?://` | Messages containing URLs |

## Notes

- If the pattern is malformed (invalid regex syntax), it will be ignored with a warning in the log
- The pattern is tested against the message `content` field from the Discord API
- Messages without text content (e.g., image-only messages) will not match any pattern
- The pattern is applied **after** other filters (message type, pinned, bot messages)

## Caution

Avoid complex patterns with excessive backtracking (e.g., `(a+)+$`) as they can cause the browser tab to freeze temporarily.
