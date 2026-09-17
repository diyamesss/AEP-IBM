/**
 * discover.js — Phase 2 discovery script
 *
 * Run: node discover.js
 * Reads MONDAY_API_TOKEN and MONDAY_BOARD_ID from ../.env
 * Prints board metadata (columns + views) to stdout.
 * NEVER prints the API token.
 */
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx);
    const val = trimmed.slice(idx + 1);
    process.env[key] = val;
  }
}

const token = process.env.MONDAY_API_TOKEN;
const boardId = process.env.MONDAY_BOARD_ID || '18431218352';

if (!token || token === 'REPLACE_WITH_YOUR_MONDAY_API_TOKEN') {
  console.error('ERROR: MONDAY_API_TOKEN is not set in .env');
  process.exit(1);
}

async function run() {
  const { default: fetch } = await import('node-fetch');

  const query = `
    query {
      boards(ids: [${boardId}]) {
        id
        name
        columns {
          id
          title
          type
        }
        views {
          id
          name
          type
          settings_str
        }
      }
    }
  `;

  console.log('Querying monday.com board', boardId, '...\n');

  const res = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    console.error('HTTP error:', res.status, res.statusText);
    process.exit(1);
  }

  const json = await res.json();

  if (json.errors?.length) {
    console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2));
    process.exit(1);
  }

  const board = json.data?.boards?.[0];
  if (!board) {
    console.error('No board returned');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════');
  console.log('MONDAY BOARD DISCOVERY');
  console.log('═══════════════════════════════════════════════════');
  console.log('Board ID  :', board.id);
  console.log('Board Name:', board.name);
  console.log('');

  console.log('─── COLUMNS (' + board.columns.length + ') ───────────────────────────────');
  const colWidth = Math.max(...board.columns.map(c => c.id.length), 4);
  const titleWidth = Math.max(...board.columns.map(c => c.title.length), 5);
  const hdr = 'ID'.padEnd(colWidth + 2) + 'TITLE'.padEnd(titleWidth + 2) + 'TYPE';
  console.log(hdr);
  console.log('─'.repeat(hdr.length + 10));
  for (const col of board.columns) {
    console.log(col.id.padEnd(colWidth + 2) + col.title.padEnd(titleWidth + 2) + col.type);
  }
  console.log('');

  console.log('─── VIEWS (' + board.views.length + ') ─────────────────────────────────');
  const vidWidth = Math.max(...board.views.map(v => v.id.length), 2);
  const vnameWidth = Math.max(...board.views.map(v => v.name.length), 4);
  const vhdr = 'ID'.padEnd(vidWidth + 2) + 'NAME'.padEnd(vnameWidth + 2) + 'TYPE';
  console.log(vhdr);
  console.log('─'.repeat(vhdr.length + 10));
  for (const view of board.views) {
    console.log(view.id.padEnd(vidWidth + 2) + view.name.padEnd(vnameWidth + 2) + view.type);
  }
  console.log('');

  // Also print view settings for inspection
  console.log('─── VIEW SETTINGS_STR (raw) ──────────────────────');
  for (const view of board.views) {
    console.log(`\nView: ${view.name} (${view.id})`);
    try {
      const parsed = JSON.parse(view.settings_str || '{}');
      console.log(JSON.stringify(parsed, null, 2));
    } catch {
      console.log('(unparseable):', view.settings_str);
    }
  }

  // Also fetch a sample of items to understand item structure
  console.log('\n─── SAMPLE ITEMS (first page, limit 10) ─────────');
  const itemQuery = `
    query {
      boards(ids: [${boardId}]) {
        items_page(limit: 10) {
          cursor
          items {
            id
            name
            group { id title }
            column_values { id text value }
          }
        }
      }
    }
  `;

  const itemRes = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query: itemQuery }),
  });

  const itemJson = await itemRes.json();
  const page = itemJson.data?.boards?.[0]?.items_page;

  if (page) {
    console.log('Cursor:', page.cursor ?? '(none — all items fit on one page)');
    console.log('Items on this page:', page.items.length);
    for (const item of page.items) {
      console.log(`\n  Item: ${item.name} (id: ${item.id}, group: ${item.group?.title})`);
      for (const cv of item.column_values) {
        if (cv.text) {
          console.log(`    [${cv.id}] ${cv.text}`);
        }
      }
    }
  } else if (itemJson.errors) {
    console.log('Error fetching items:', JSON.stringify(itemJson.errors));
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('Discovery complete.');
}

run().catch(err => {
  console.error('Discovery failed:', err.message);
  process.exit(1);
});
