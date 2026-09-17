/**
 * usePortfolioAnalytics.ts
 *
 * React hook that manages the lifecycle of portfolio analytics data:
 *   - Fetches on mount / when portfolioSlug changes
 *   - Handles loading, error, empty states
 *   - Supports manual refresh
 *   - Prevents stale responses from overwriting current portfolio (AbortController)
 *   - Tab changes do NOT re-fetch (data is cached after initial load)
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getPortfolioAnalytics,
  getCachedFetchedAt,
  type PortfolioAnalytics,
} from '../services/portfolioAnalyticsService'

export type AnalyticsStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UsePortfolioAnalyticsResult {
  analytics: PortfolioAnalytics | null
  status: AnalyticsStatus
  error: string | null
  lastUpdated: Date | null
  refresh: () => void
  isRefreshing: boolean
}

export function usePortfolioAnalytics(portfolioSlug: string): UsePortfolioAnalyticsResult {
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null)
  const [status, setStatus] = useState<AnalyticsStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Track the currently-requested slug to prevent stale overwrites
  const currentSlugRef = useRef(portfolioSlug)

  const fetchAnalytics = useCallback(
    (slug: string, forceRefresh: boolean) => {
      // Clear stale data immediately when slug changes
      if (slug !== currentSlugRef.current) {
        setAnalytics(null)
        setError(null)
      }
      currentSlugRef.current = slug

      setStatus('loading')
      if (forceRefresh) setIsRefreshing(true)

      getPortfolioAnalytics(slug, forceRefresh)
        .then(data => {
          // Only discard if a *different* portfolio has since been requested
          if (currentSlugRef.current !== slug) return

          setAnalytics(data)
          setStatus('success')
          setError(null)
          setLastUpdated(new Date())
        })
        .catch(err => {
          if (currentSlugRef.current !== slug) return

          // AbortError means the component unmounted — not a user-visible error
          if (err instanceof Error && err.name === 'AbortError') return

          const msg = err instanceof Error ? err.message : 'Analytics unavailable'
          setStatus('error')
          setError(msg)
        })
        .finally(() => {
          setIsRefreshing(false)
        })
    },
    []
  )

  // Fetch when portfolioSlug changes
  useEffect(() => {
    if (!portfolioSlug) return

    // Clear state for the new portfolio immediately
    setAnalytics(null)
    setError(null)
    setLastUpdated(getCachedFetchedAt(portfolioSlug))

    fetchAnalytics(portfolioSlug, false)

    return () => {
      // Mark slug as stale so any in-flight response is discarded on arrival
      currentSlugRef.current = ''
    }
  }, [portfolioSlug, fetchAnalytics])

  const refresh = useCallback(() => {
    if (!portfolioSlug || isRefreshing) return
    fetchAnalytics(portfolioSlug, true)
  }, [portfolioSlug, isRefreshing, fetchAnalytics])

  return { analytics, status, error, lastUpdated, refresh, isRefreshing }
}
