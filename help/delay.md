# Search and Delete Delay

These settings control the timing of API requests to Discord.

## Search Delay
Controls how long to wait between each search request (fetching pages of messages). Default: 30,000ms (30 seconds).

When the Discord API rate limits your search requests (HTTP 429), the search delay is automatically increased by 100ms per rate limit event. The delay is capped at a maximum of **60 seconds** to prevent starvation.

## Delete Delay
Controls how long to wait between each message deletion. Default: 1,000ms (1 second).

When the Discord API rate limits your delete requests (HTTP 429), the delete delay is increased by adding the `retry_after` value on top of the current delay. The delay is capped at a maximum of **30 seconds**. The delay **never decreases** automatically — this is intentional to prevent hitting rate limits repeatedly.

You can manually adjust both delays using the sliders in "Advanced Settings" at any time during execution. The sliders update in real-time to reflect the current values (including automatic adjustments from rate limiting).

## Empty Page Retries
When the Discord API returns an empty page of results (which can happen intermittently due to caching), Undiscord will retry up to this many times before stopping. Default: 2 retries. Set to 0 to stop immediately on empty pages.

## Tips
- If you're getting rate limited frequently, increase both delays
- The delete delay has the most impact on speed — lower values are faster but more likely to trigger rate limits
- During batch operations (multiple channels), there is an automatic 30-second delay between each job to prevent API spam
