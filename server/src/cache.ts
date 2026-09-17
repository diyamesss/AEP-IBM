/**
 * cache.ts
 *
 * Shared in-process cache for the full monday board.
 * TTL: 5 minutes — data is refreshed automatically after expiry.
 * First load fetches from monday (~5-10s), all subsequent loads within
 * the TTL window are served instantly from memory.
 */

import { fetchAllBoardItems } from './mondayService'
import { normalizeItems } from './portfolioAnalyticsService'
import type { NormalizedRecord } from './portfolioAnalyticsService'

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  records: NormalizedRecord[]
  fetchedAt: Date
}

let cache: CacheEntry | null = null
let inflightPromise: Promise<NormalizedRecord[]> | null = null

export async function getCachedRecords(forceRefresh = false): Promise<NormalizedRecord[]> {
  const now = Date.now()

  if (!forceRefresh && cache && now - cache.fetchedAt.getTime() < CACHE_TTL_MS) {
    return cache.records
  }

  // Deduplicate concurrent requests
  if (inflightPromise) return inflightPromise

  inflightPromise = fetchAllBoardItems()
    .then(items => {
      const records = normalizeItems(items)
      cache = { records, fetchedAt: new Date() }
      inflightPromise = null
      return records
    })
    .catch(err => {
      inflightPromise = null
      throw err
    })

  return inflightPromise
}

export function getCacheMetadata(): { fetchedAt: Date | null; recordCount: number } {
  return {
    fetchedAt: cache?.fetchedAt ?? null,
    recordCount: cache?.records.length ?? 0,
  }
}
