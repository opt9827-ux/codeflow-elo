import type { Attempt } from '../types/db'

export interface StrongestTopic {
  nodeId: string
  totalAttempts: number
  successfulAttempts: number
  successRate: number
}

export function getStrongestTopic(attempts: Attempt[]): StrongestTopic | null {
  if (attempts.length === 0) return null

  const byNode = new Map<string, { total: number; success: number }>()

  for (const a of attempts) {
    const prev = byNode.get(a.node_id) ?? { total: 0, success: 0 }
    const next = {
      total: prev.total + 1,
      success: prev.success + (a.score > 0 ? 1 : 0),
    }
    byNode.set(a.node_id, next)
  }

  let best: StrongestTopic | null = null
  for (const [nodeId, stats] of byNode.entries()) {
    const successRate = stats.total === 0 ? 0 : (stats.success / stats.total) * 100
    const candidate: StrongestTopic = {
      nodeId,
      totalAttempts: stats.total,
      successfulAttempts: stats.success,
      successRate,
    }

    if (!best) {
      best = candidate
      continue
    }

    if (candidate.successRate > best.successRate) {
      best = candidate
      continue
    }

    if (candidate.successRate === best.successRate) {
      if (candidate.totalAttempts > best.totalAttempts) {
        best = candidate
      }
    }
  }

  return best
}

