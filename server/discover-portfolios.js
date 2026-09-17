/**
 * discover-portfolios.js
 * Fetches ALL items and prints all unique portfolio values from status__1
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

async function run() {
  const { default: fetch } = await import('node-fetch');

  const allItems = [];
  let cursor = null;
  let pageNum = 0;

  console.log('Fetching all board items (with pagination)...\n');

  do {
    pageNum++;
    const cursorArg = cursor ? `, cursor: "${cursor}"` : '';
    const q = `
      query {
        boards(ids: [${boardId}]) {
          items_page(limit: 100${cursorArg}) {
            cursor
            items {
              id
              name
              group { id title }
              column_values { id text }
            }
          }
        }
      }
    `;

    const res = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token, 'API-Version': '2024-01' },
      body: JSON.stringify({ query: q }),
    });
    const json = await res.json();

    if (json.errors?.length) {
      console.error('GraphQL errors:', JSON.stringify(json.errors));
      break;
    }

    const page = json.data?.boards?.[0]?.items_page;
    if (!page) break;

    allItems.push(...page.items);
    cursor = page.cursor ?? null;
    process.stdout.write(`  Page ${pageNum}: ${page.items.length} items (total so far: ${allItems.length}), cursor: ${cursor ? 'yes' : 'done'}\n`);
  } while (cursor);

  console.log(`\nTotal items fetched: ${allItems.length}`);

  // Collect unique values for key columns
  const portfolioValues = new Map(); // status__1 values -> count
  const groupValues = new Map(); // group title -> count
  const geographyValues = new Map(); // geography__1 -> count
  const locationValues = new Map();
  const roleValues = new Map();
  const coreFlexValues = new Map();
  const onboardingStatusValues = new Map();

  for (const item of allItems) {
    const cvMap = {};
    for (const cv of item.column_values) cvMap[cv.id] = cv.text?.trim() ?? '';

    const portfolio = cvMap['status__1'] || '(empty)';
    portfolioValues.set(portfolio, (portfolioValues.get(portfolio) ?? 0) + 1);

    const group = item.group?.title || '(none)';
    groupValues.set(group, (groupValues.get(group) ?? 0) + 1);

    const geo = cvMap['geography__1'] || '(empty)';
    geographyValues.set(geo, (geographyValues.get(geo) ?? 0) + 1);

    const loc = cvMap['location__1'] || '(empty)';
    locationValues.set(loc, (locationValues.get(loc) ?? 0) + 1);

    const role = cvMap['rate_card_role__1'] || '(empty)';
    roleValues.set(role, (roleValues.get(role) ?? 0) + 1);

    const cf = cvMap['core_flex__1'] || '(empty)';
    coreFlexValues.set(cf, (coreFlexValues.get(cf) ?? 0) + 1);

    const obs = cvMap['on_boarding_status__1'] || '(empty)';
    onboardingStatusValues.set(obs, (onboardingStatusValues.get(obs) ?? 0) + 1);
  }

  function printMap(title, map, topN = 50) {
    console.log(`\n─── ${title} ───`);
    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, topN);
    for (const [k, v] of entries) console.log(`  ${String(v).padStart(4)}  ${k}`);
  }

  printMap('PORTFOLIO VALUES (status__1)', portfolioValues, 100);
  printMap('GROUP TITLES', groupValues, 50);
  printMap('GEOGRAPHY (geography__1)', geographyValues, 50);
  printMap('LOCATION (location__1)', locationValues, 100);
  printMap('RATE CARD ROLE (rate_card_role__1)', roleValues, 100);
  printMap('CORE/FLEX (core_flex__1)', coreFlexValues, 20);
  printMap('ONBOARDING STATUS (on_boarding_status__1)', onboardingStatusValues, 20);

  console.log('\n═══════════════════════════════════════════════════');
  console.log('Complete. Use these values to configure PORTFOLIO_FILTER_MAP.');
}

run().catch(err => { console.error(err); process.exit(1); });
