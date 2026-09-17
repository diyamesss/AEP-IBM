# AEP × IBM — Backend Server

Secure proxy backend for the monday.com portfolio analytics integration.

## Setup

```bash
# From project root
cp .env.example .env
# Edit .env and set your MONDAY_API_TOKEN

cd server
npm install
```

## Development

```bash
# From server/ directory
npm run build   # Compile TypeScript
npm start       # Run compiled JS

# Or using ts-node if available:
npm run dev
```

The server starts on http://localhost:3001 (configure PORT in .env).

## Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/health` | Liveness check |
| `GET /api/monday/test` | Safe connection test |
| `GET /api/monday/discover` | Full board discovery (columns + views) |
| `GET /api/portfolios/:slug/analytics` | Portfolio dashboard data |
| `GET /api/monday/cache-status` | Cache metadata |

## Security

- The `MONDAY_API_TOKEN` never leaves the server
- No endpoint returns the token
- GraphQL errors are sanitized before forwarding
- Only safe metadata is exposed

## Environment

```env
MONDAY_API_TOKEN=your_token_here
MONDAY_BOARD_ID=18431218352
PORT=3001
ALLOWED_ORIGIN=*
```

## Re-running Discovery

After any monday board schema changes:

```bash
node discover.js
```

This prints the full board structure (columns, views, sample items)
without exposing any secrets.
