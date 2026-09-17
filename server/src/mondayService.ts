/**
 * mondayService.ts
 *
 * All monday.com GraphQL communication lives here.
 * The API token NEVER leaves the server.
 */

import fetch from 'node-fetch'

const MONDAY_API_URL = 'https://api.monday.com/v2'

function getToken(): string {
  const token = process.env.MONDAY_API_TOKEN
  if (!token || token === 'REPLACE_WITH_YOUR_MONDAY_API_TOKEN') {
    throw new Error('MONDAY_API_TOKEN is not configured in .env')
  }
  return token
}

function getBoardId(): string {
  return process.env.MONDAY_BOARD_ID ?? '18431218352'
}

async function query<T>(gql: string): Promise<T> {
  const token = getToken()
  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      'API-Version': '2024-01',
    },
    body: JSON.stringify({ query: gql }),
  })

  if (!response.ok) {
    throw new Error(`monday API HTTP ${response.status}: ${response.statusText}`)
  }

  const json = (await response.json()) as { data?: T; errors?: { message: string }[] }

  if (json.errors?.length) {
    throw new Error(`monday GraphQL error: ${json.errors.map(e => e.message).join('; ')}`)
  }
  if (!json.data) {
    throw new Error('monday API returned no data')
  }

  return json.data
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MondayColumn {
  id: string
  title: string
  type: string
}

export interface MondayView {
  id: string
  name: string
  type: string
  settings_str: string
}

export interface MondayBoard {
  id: string
  name: string
  columns: MondayColumn[]
  views: MondayView[]
}

export interface MondayColumnValue {
  id: string
  text: string
  value: string | null
}

export interface MondayGroup {
  id: string
  title: string
}

export interface MondayItem {
  id: string
  name: string
  group: MondayGroup
  column_values: MondayColumnValue[]
}

export interface MondayItemPage {
  cursor: string | null
  items: MondayItem[]
}

// ─── Board discovery ──────────────────────────────────────────────────────────

export async function discoverBoard(): Promise<MondayBoard> {
  const boardId = getBoardId()
  const gql = `
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
  `

  const data = await query<{ boards: MondayBoard[] }>(gql)
  const board = data.boards?.[0]
  if (!board) throw new Error(`Board ${boardId} not found`)
  return board
}

// ─── Item pagination ──────────────────────────────────────────────────────────

const PAGE_LIMIT = 500

// Only fetch the columns actually used by the dashboards — reduces payload size significantly
const REQUIRED_COLUMN_IDS = [
  'status__1',           // portfolio filter
  'on_boarding_status__1', // rolled-off exclusion
  'geography__1',        // Geographic Distribution
  'core_flex__1',        // CoreFlex
  'onsite___offshore__1', // Onshore / Nearshore / Offshore
  'aep_manager__1',      // Resource by Manager
  'billable__1',         // Billable x Non-Billable
]

async function fetchItemPage(
  boardId: string,
  cursor: string | null
): Promise<MondayItemPage> {
  const cursorArg = cursor ? `, cursor: "${cursor}"` : ''
  const colIds = REQUIRED_COLUMN_IDS.map(id => `"${id}"`).join(', ')

  const gql = `
    query {
      boards(ids: [${boardId}]) {
        items_page(limit: ${PAGE_LIMIT}${cursorArg}) {
          cursor
          items {
            id
            name
            group {
              id
              title
            }
            column_values(ids: [${colIds}]) {
              id
              text
              value
            }
          }
        }
      }
    }
  `

  const data = await query<{ boards: { items_page: MondayItemPage }[] }>(gql)
  const page = data.boards?.[0]?.items_page
  if (!page) throw new Error('No items_page returned')
  return page
}

/**
 * Fetch ALL items from the board, following cursor pagination.
 * Returns a flat array of every item on the board.
 */
export async function fetchAllBoardItems(): Promise<MondayItem[]> {
  const boardId = getBoardId()
  const allItems: MondayItem[] = []
  let cursor: string | null = null

  do {
    const page = await fetchItemPage(boardId, cursor)
    allItems.push(...page.items)
    cursor = page.cursor ?? null
  } while (cursor !== null)

  return allItems
}
