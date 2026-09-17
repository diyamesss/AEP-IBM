/**
 * PortfolioDashboard
 *
 * Renders four live data dashboards sourced from monday.com board 18431218352.
 *
 * Dashboards:
 *   1. Geographic Distribution  — geography__1
 *   2. CoreFlex                 — core_flex__1
 *   3. Onshore / Nearshore / Offshore — onsite___offshore__1 (pie chart)
 *   4. Resource by Manager      — aep_manager__1 (horizontal bar chart)
 *
 * Usage:
 *   <PortfolioDashboard portfolioSlug="wam" portfolioName="WAM" />
 *
 * Architecture:
 *   PortfolioDashboard
 *     → usePortfolioAnalytics(portfolioSlug)          [hook]
 *       → getPortfolioAnalytics(slug)                 [service]
 *         → GET /api/portfolios/{slug}/analytics       [backend]
 *           → monday.com board items filtered by group (server-side only)
 *
 * The token NEVER appears in this file or any file it imports.
 */

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import { usePortfolioAnalytics } from '../../../hooks/usePortfolioAnalytics'
import type { ChartDefinition, ChartDataPoint } from '../../../services/portfolioAnalyticsService'
import styles from './PortfolioDashboard.module.scss'

// ─── AEP × IBM brand palette ─────────────────────────────────────────────────
const CHART_COLORS = [
  '#c8102e', '#1d3557', '#457b9d', '#e63946', '#2a9d8f',
  '#e9c46a', '#f4a261', '#264653', '#6d6875', '#b5838d',
  '#0d6efd', '#6610f2', '#198754', '#0dcaf0',
]

function getColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>{payload[0].value} resources</p>
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{name}</p>
      <p className={styles.tooltipValue}>{value} resources</p>
    </div>
  )
}

// ─── Bar chart ────────────────────────────────────────────────────────────────

function MondayBarChart({ data }: { data: ChartDataPoint[] }) {
  if (!data.length) {
    return <div className={styles.chartEmpty}>No data available for this chart.</div>
  }

  const isHorizontal = data.length > 6

  return (
    <div className={styles.chartWrapper}>
      {isHorizontal ? (
        <ResponsiveContainer width="100%" height={Math.max(260, data.length * 36)}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 4, right: 32, left: 16, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#6e6e73' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={180}
              tick={{ fontSize: 11, fill: '#3a3a3c' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(200,16,46,0.06)' }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {data.map((_: ChartDataPoint, index: number) => (
                <Cell key={index} fill={getColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 16 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#3a3a3c' }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6e6e73' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(200,16,46,0.06)' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((_: ChartDataPoint, index: number) => (
                <Cell key={index} fill={getColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ─── Pie chart ────────────────────────────────────────────────────────────────

const RADIAN = Math.PI / 180

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) {
  if (percent < 0.04) return null // skip labels for tiny slices
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function MondayPieChart({ data }: { data: ChartDataPoint[] }) {
  if (!data.length) {
    return <div className={styles.chartEmpty}>No data available for this chart.</div>
  }

  // Map to recharts Pie format
  const pieData = data.map(d => ({ name: d.label, value: d.value }))

  return (
    <div className={styles.chartWrapper}>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={110}
            labelLine={false}
            label={PieLabel}
          >
            {pieData.map((_, index) => (
              <Cell key={index} fill={getColor(index)} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: 12, color: '#3a3a3c' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Donut chart ──────────────────────────────────────────────────────────────
// Reuses the same chartWrapper + ResponsiveContainer pattern as MondayPieChart
// so layout, centering, and legend styling are identical.

const DONUT_COLORS: Record<string, string> = {
  yes: '#00c875',
  no: '#e2445c',
}

function getDonutColor(label: string, index: number): string {
  return DONUT_COLORS[label.toLowerCase()] ?? getColor(index)
}

function MondayDonutChart({ data }: { data: ChartDataPoint[] }) {
  if (!data.length) {
    return <div className={styles.chartEmpty}>No data available for this chart.</div>
  }

  const pieData = data.map(d => ({ name: d.label, value: d.value }))

  return (
    <div className={styles.chartWrapper}>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={110}
            labelLine={false}
            label={PieLabel}
            paddingAngle={2}
            strokeWidth={0}
          >
            {pieData.map((entry, index) => (
              <Cell key={index} fill={getDonutColor(entry.name, index)} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: 12, color: '#3a3a3c' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Chart dispatcher ─────────────────────────────────────────────────────────

function ChartRenderer({ chartDef }: { chartDef: ChartDefinition }) {
  if (chartDef.type === 'pie') {
    return <MondayPieChart data={chartDef.data} />
  }
  if (chartDef.type === 'donut') {
    return <MondayDonutChart data={chartDef.data} />
  }
  return <MondayBarChart data={chartDef.data} />
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Loading analytics">
      <div className={styles.skeletonTabBar}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={styles.skeletonTab} />
        ))}
      </div>
      <div className={styles.skeletonChart} />
    </div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const safeMessage =
    message.includes('token') || message.includes('auth') || message.includes('401') || message.includes('403')
      ? 'Portfolio analytics are temporarily unavailable.'
      : message

  return (
    <div className={styles.errorState} role="alert">
      <p className={styles.errorText}>{safeMessage}</p>
      <button className={styles.retryButton} onClick={onRetry}>Retry</button>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyText}>No analytics data is currently available for this portfolio.</p>
    </div>
  )
}

// ─── Chart descriptions ───────────────────────────────────────────────────────

const CHART_DESCRIPTIONS: Record<string, string> = {
  'geographic-distribution':
    'Distribution of resources by country/geography. Counts all active resources in this portfolio group by their Geography field.',
  'core-flex':
    'Distribution of resources by Core/Flex designation. Shows how many resources are classified as Core, Flex, Project, or N/A.',
  'onshore-nearshore-offshore':
    'Distribution of resources across delivery models — Onshore (US), Nearshore (Americas), and Offshore (India, Philippines, etc.).',
  'resource-by-manager':
    'Number of active resources associated with each AEP manager. Sorted by headcount — managers with the most resources appear first.',
  'billable-non-billable':
    'Breakdown of resources by billability — Yes (billable to the client) vs No (non-billable).',
}

// ─── Main component ───────────────────────────────────────────────────────────

interface PortfolioDashboardProps {
  portfolioSlug: string
  portfolioName: string
}

export default function PortfolioDashboard({
  portfolioSlug,
  portfolioName,
}: PortfolioDashboardProps) {
  const { analytics, status, error, lastUpdated, refresh, isRefreshing } =
    usePortfolioAnalytics(portfolioSlug)

  const [activeChartIdx, setActiveChartIdx] = useState(0)

  const charts = analytics?.charts ?? []

  const formatLastUpdated = (date: Date | null): string => {
    if (!date) return ''
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <section
      id="analytics"
      className={styles.section}
      aria-labelledby="analytics-heading"
    >
      {/* Section heading row */}
      <div className={styles.headingRow}>
        <div className={styles.headingLeft}>
          <span className={styles.eyebrow}>Analytics</span>
          <h2 id="analytics-heading" className={styles.heading}>
            {portfolioName} by the Numbers
          </h2>
          {analytics && (
            <p className={styles.totalCount}>
              {analytics.totalRecords} active resource{analytics.totalRecords !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Refresh control */}
        <div className={styles.headingRight}>
          <button
            className={styles.refreshButton}
            onClick={refresh}
            disabled={isRefreshing || status === 'loading'}
            aria-label="Refresh analytics"
            title="Refresh analytics"
          >
            <span className={isRefreshing ? styles.refreshIconSpinning : styles.refreshIcon}>↻</span>
          </button>
          {lastUpdated && (
            <p className={styles.lastUpdated}>Last updated: {formatLastUpdated(lastUpdated)}</p>
          )}
        </div>
      </div>

      {/* Content area */}
      {status === 'loading' && <AnalyticsSkeleton />}

      {status === 'error' && error && (
        <ErrorState message={error} onRetry={refresh} />
      )}

      {status === 'success' && charts.length === 0 && <EmptyState />}

      {status === 'success' && charts.length > 0 && (
        <div className={styles.dashboardContent}>
          {/* Tab bar */}
          <div
            role="tablist"
            aria-label={`${portfolioName} analytics charts`}
            className={styles.tabList}
          >
            {charts.map((chart, idx) => (
              <button
                key={chart.id}
                id={`dash-tab-${chart.id}`}
                role="tab"
                aria-selected={idx === activeChartIdx}
                aria-controls={`dash-panel-${chart.id}`}
                tabIndex={idx === activeChartIdx ? 0 : -1}
                className={`${styles.tab} ${idx === activeChartIdx ? styles.tabActive : ''}`}
                onClick={() => setActiveChartIdx(idx)}
                onKeyDown={e => {
                  let next = idx
                  if (e.key === 'ArrowRight') next = (idx + 1) % charts.length
                  else if (e.key === 'ArrowLeft') next = (idx - 1 + charts.length) % charts.length
                  else if (e.key === 'Home') next = 0
                  else if (e.key === 'End') next = charts.length - 1
                  else return
                  e.preventDefault()
                  setActiveChartIdx(next)
                }}
              >
                {chart.title}
              </button>
            ))}
          </div>

          {/* Active chart panel */}
          {charts[activeChartIdx] && (
            <div
              id={`dash-panel-${charts[activeChartIdx].id}`}
              role="tabpanel"
              aria-labelledby={`dash-tab-${charts[activeChartIdx].id}`}
              className={styles.panel}
            >
              <p className={styles.chartDescription}>
                {CHART_DESCRIPTIONS[charts[activeChartIdx].id] ?? ''}
              </p>
              <ChartRenderer chartDef={charts[activeChartIdx]} />
            </div>
          )}
        </div>
      )}
    </section>
  )
}
