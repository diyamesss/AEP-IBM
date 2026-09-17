/**
 * discover-groups.js
 * Fetches all GROUPS from board 18431218352 and prints group IDs + titles.
 * Run: node server/discover-groups.js
 */
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 0) continue;
    process.env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
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

  // Step 1: Fetch all groups
  const groupQuery = `
    query {
      boards(ids: [${boardId}]) {
        id
        name
        groups {
          id
          title
          color
          position
        }
      }
    }
  `;

  console.log('Fetching groups from board', boardId, '...\n');

  const res = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query: groupQuery }),
  });

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

  console.log('Board:', board.name, '(id:', board.id + ')');
  console.log('\n─── GROUPS ────────────────────────────────────────────');
  const groups = board.groups ?? [];
  console.log(`Found ${groups.length} groups:\n`);

  const idWidth = Math.max(...groups.map(g => g.id.length), 2) + 2;
  const titleWidth = Math.max(...groups.map(g => g.title.length), 5) + 2;
  console.log('ID'.padEnd(idWidth) + 'TITLE'.padEnd(titleWidth) + 'COLOR');
  console.log('─'.repeat(idWidth + titleWidth + 10));
  for (const g of groups) {
    console.log(g.id.padEnd(idWidth) + g.title.padEnd(titleWidth) + (g.color ?? ''));
  }

  // Step 2: For each group, count items using next_items_page with group filter
  // This helps us confirm which groups map to which portfolios
  console.log('\n─── ITEM COUNTS PER GROUP ─────────────────────────────');
  console.log('(fetching first page of each group — may take a moment)\n');

  for (const g of groups) {
    const countQuery = `
      query {
        boards(ids: [${boardId}]) {
          groups(ids: ["${g.id}"]) {
            id
            title
            items_page(limit: 1) {
              cursor
              items { id }
            }
          }
        }
      }
    `;

    try {
      const r = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
          'API-Version': '2024-01',
        },
        body: JSON.stringify({ query: countQuery }),
      });
      const j = await r.json();
      const grp = j.data?.boards?.[0]?.groups?.[0];
      const hasCursor = grp?.items_page?.cursor ? ' (has more pages)' : '';
      const count = grp?.items_page?.items?.length ?? 0;
      console.log(`  ${g.title.padEnd(40)} id=${g.id}  items_on_first_page=${count}${hasCursor}`);
    } catch (e) {
      console.log(`  ${g.title.padEnd(40)} id=${g.id}  ERROR: ${e.message}`);
    }
  }

  // Step 3: Sample items from each group to show column values
  console.log('\n─── SAMPLE ITEM FROM EACH GROUP ───────────────────────');
  console.log('(checking geography__1, core_flex__1, onsite___offshore__1, aep_manager__1)\n');

  for (const g of groups) {
    const sampleQuery = `
      query {
        boards(ids: [${boardId}]) {
          groups(ids: ["${g.id}"]) {
            title
            items_page(limit: 3) {
              items {
                id
                name
                column_values(ids: ["geography__1", "core_flex__1", "onsite___offshore__1", "aep_manager__1"]) {
                  id
                  text
                }
              }
            }
          }
        }
      }
    `;

    try {
      const r = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
          'API-Version': '2024-01',
        },
        body: JSON.stringify({ query: sampleQuery }),
      });
      const j = await r.json();
      const grp = j.data?.boards?.[0]?.groups?.[0];
      if (!grp) continue;
      console.log(`\nGroup: "${grp.title}" (id: ${g.id})`);
      for (const item of grp.items_page?.items ?? []) {
        console.log(`  Item: ${item.name}`);
        for (const cv of item.column_values) {
          console.log(`    [${cv.id}] = "${cv.text ?? ''}"`);
        }
      }
    } catch (e) {
      console.log(`Group ${g.id}: ERROR ${e.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('Group discovery complete.');
  console.log('Copy the group IDs above into PORTFOLIO_GROUP_MAP in portfolioAnalyticsService.ts');
}

run().catch(err => {
  console.error('Discovery failed:', err.message);
  process.exit(1);
});
