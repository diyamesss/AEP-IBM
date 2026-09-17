/**
 * portfolioAnalyticsService.ts
 *
 * Frontend service — calls the secure backend API.
 * This file has NO knowledge of monday.com, its API token, or GraphQL.
 *
 * React components call getPortfolioAnalytics(portfolioSlug) and receive
 * chart-ready data.  All monday complexity lives in the backend.
 *
 * Security: this file does NOT contain, reference, or import any monday
 * API token.  The token lives only in server/.env on the backend.
 */

export interface ChartDataPoint {
  label: string
  value: number
}

export interface ChartDefinition {
  id: string
  title: string
  type: 'bar' | 'pie' | 'line' | 'donut'
  data: ChartDataPoint[]
}

export interface PortfolioAnalytics {
  portfolioId: string
  portfolioSlug: string
  updatedAt: string
  totalRecords: number
  charts: ChartDefinition[]
}

// ─── Backend URL configuration ────────────────────────────────────────────────
// In production this should point to the deployed backend.
// During local development the backend runs on port 3001.
//
// IMPORTANT: This is the URL of OUR backend, not monday.com directly.
// No monday API token is transmitted from the React application.

const BACKEND_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  'http://localhost:3001'

const cache = new Map<string, { data: PortfolioAnalytics; fetchedAt: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes — matches backend TTL
const inflightRequests = new Map<string, Promise<PortfolioAnalytics>>()

export async function getPortfolioAnalytics(
  portfolioSlug: string,
  forceRefresh = false
): Promise<PortfolioAnalytics> {
  const now = Date.now()
  const cached = cache.get(portfolioSlug)

  if (!forceRefresh && cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data
  }

  const inflight = inflightRequests.get(portfolioSlug)
  if (inflight && !forceRefresh) return inflight

  const url = `${BACKEND_URL}/api/portfolios/${encodeURIComponent(portfolioSlug)}/analytics${forceRefresh ? '?refresh=true' : ''}`

  const promise = fetch(url)
    .then(async res => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Server error ${res.status}`)
      }
      return res.json() as Promise<PortfolioAnalytics>
    })
    .then(data => {
      cache.set(portfolioSlug, { data, fetchedAt: Date.now() })
      inflightRequests.delete(portfolioSlug)
      return data
    })
    .catch(err => {
      inflightRequests.delete(portfolioSlug)
      throw err
    })

  inflightRequests.set(portfolioSlug, promise)
  return promise
}

export function getCachedFetchedAt(portfolioSlug: string): Date | null {
  const entry = cache.get(portfolioSlug)
  return entry ? new Date(entry.fetchedAt) : null
}
