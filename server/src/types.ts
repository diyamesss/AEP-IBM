/**
 * types.ts
 *
 * Shared type contracts between the backend and the React frontend.
 * The frontend imports these shapes; the backend produces them.
 * No monday-specific schema leaks into these types.
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

export interface BoardDiscovery {
  connected: boolean
  boardId: string
  boardName: string
  columnCount: number
  viewCount: number
  columns: { id: string; title: string; type: string }[]
  views: { id: string; name: string; type: string }[]
}

export interface TestConnectionResult {
  connected: boolean
  boardId: string
  boardName: string
  viewCount: number
  columnCount: number
}
