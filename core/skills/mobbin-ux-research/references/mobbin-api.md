# Official Mobbin API

## Access

- Base URL: `https://api.mobbin.com`
- Plans: Team and Enterprise only.
- Auth: `Authorization: Bearer <API_KEY>` (key created in Settings > API Keys).
- Store the key in `MOBBIN_API_KEY` (env) or in `work/api_keys.txt` with the line `MOBBIN_API_KEY=...`.

## Screen search

`POST /v1/screens/search`

Body:

```json
{
  "query": "login screen with biometric authentication",
  "platform": "ios",
  "limit": 5
}
```

- `query` (required): natural language.
- `platform` (optional): `ios` or `web` (the API rejects `android` with a 400 error).
- `limit` (optional): default 10, max 50.

Response: `{ "screens": [...] }`. Each screen includes:

- `id`: identifier.
- `image_url` and `image.url`: image URL (expires; see `url_expires_at`).
- `image.width` / `image.height`.
- `mobbin_url`: canonical link.
- `app_name`, `platform`.

## Limits and failures

- `429`: concurrency/rate limit reached. Retry with backoff, lower `--limit`, or use the browser.
- `401`: invalid key or plan without access.
- Image URLs expire (~30 days); download promptly.
- The API covers screens with metadata and URLs; it does not expose flow videos, private collections, or saved boards. Use authenticated Mobbin web for those.
- Permitted use: personal or internal business use; no mass scraping or redistribution.
