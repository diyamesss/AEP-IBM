/**
 * index.ts — AEP × IBM Backend Server
 *
 * Routes:
 *   GET /api/health                             — liveness check
 *   GET /api/monday/test                        — safe connection test (no token exposure)
 *   GET /api/monday/discover                    — full board discovery (columns + views)
 *   GET /api/portfolios/:portfolioSlug/analytics — portfolio dashboard data
 *
 * Security:
 *   - MONDAY_API_TOKEN never returned by any endpoint
 *   - GraphQL errors are sanitized before being forwarded
 *   - Only safe metadata is exposed
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { discoverBoard } from './mondayService'
import { buildPortfolioAnalytics, PORTFOLIO_FILTER_MAP } from './portfolioAnalyticsService'
import { getCachedRecords, getCacheMetadata } from './cache'
import type { BoardDiscovery, TestConnectionResult } from './types'

// Load .env from project root (one level up from server/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const app = express()
const PORT = process.env.PORT ?? 3001

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(express.json())
app.use(cors({
  // In production, restrict this to the actual GitHub Pages origin
  origin: process.env.ALLOWED_ORIGIN ?? '*',
  methods: ['GET'],
}))

// ─── Routes ───────────────────────────────────────────────────────────────────

/** Health check */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

/**
 * Safe connection test — confirms the server can reach monday.
 * NEVER returns the API token.
 */
app.get('/api/monday/test', async (_req, res) => {
  try {
    const board = await discoverBoard()
    const result: TestConnectionResult = {
      connected: true,
      boardId: board.id,
      boardName: board.name,
      viewCount: board.views.length,
      columnCount: board.columns.length,
    }
    res.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    // Do not expose internal details
    res.status(503).json({
      connected: false,
      error: 'Could not connect to monday.com. Check server logs.',
      // Safe diagnostic only — no token, no headers
      hint: message.includes('not configured') ? 'MONDAY_API_TOKEN is not configured' : undefined,
    })
  }
})

/**
 * Full board discovery endpoint.
 * Use this during Phase 2 to inspect actual column IDs, view IDs, and types.
 * NEVER returns the API token.
 */
app.get('/api/monday/discover', async (_req, res) => {
  try {
    const board = await discoverBoard()
    const result: BoardDiscovery = {
      connected: true,
      boardId: board.id,
      boardName: board.name,
      columnCount: board.columns.length,
      viewCount: board.views.length,
      columns: board.columns.map(c => ({
        id: c.id,
        title: c.title,
        type: c.type,
      })),
      views: board.views.map(v => ({
        id: v.id,
        name: v.name,
        type: v.type,
        settingsStr: v.settings_str,
      })),
    }
    res.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(503).json({
      connected: false,
      error: 'Board discovery failed. Check server logs.',
      hint: message.includes('not configured') ? 'MONDAY_API_TOKEN is not configured' : undefined,
    })
  }
})

/**
 * Portfolio analytics — the main dashboard data endpoint.
 *
 * GET /api/portfolios/:portfolioSlug/analytics
 *
 * Query params:
 *   ?refresh=true   — bypass the cache and fetch fresh data from monday
 *
 * Response: PortfolioAnalytics (see types.ts)
 */
app.get('/api/portfolios/:portfolioSlug/analytics', async (req, res) => {
  const { portfolioSlug } = req.params
  const forceRefresh = req.query.refresh === 'true'

  // Validate using PORTFOLIO_FILTER_MAP — the single source of truth for valid slugs.
  if (!(portfolioSlug in PORTFOLIO_FILTER_MAP)) {
    res.status(404).json({ error: `Unknown portfolio: ${portfolioSlug}` })
    return
  }

  const portfolioId = portfolioSlug

  try {
    const records = await getCachedRecords(forceRefresh)
    const analytics = buildPortfolioAnalytics(portfolioSlug, portfolioId, records)
    res.json(analytics)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    // Safe error — no internal details, no token, no stack trace
    console.error('[portfolio analytics] Error:', message)
    res.status(503).json({
      error: 'Portfolio analytics are temporarily unavailable.',
      hint: message.includes('not configured') ? 'MONDAY_API_TOKEN is not configured' : undefined,
    })
  }
})

/**
 * Cache status — safe metadata about the in-process cache.
 * Useful during development.
 */
app.get('/api/monday/cache-status', (_req, res) => {
  const meta = getCacheMetadata()
  res.json({
    hasCachedData: meta.fetchedAt !== null,
    fetchedAt: meta.fetchedAt?.toISOString() ?? null,
    recordCount: meta.recordCount,
  })
})

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`AEP × IBM backend running on http://localhost:${PORT}`)
  console.log(`  Board ID: ${process.env.MONDAY_BOARD_ID ?? '18431218352'}`)
  console.log(`  Token configured: ${!!(process.env.MONDAY_API_TOKEN && process.env.MONDAY_API_TOKEN !== 'REPLACE_WITH_YOUR_MONDAY_API_TOKEN')}`)
})

export default app
