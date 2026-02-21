export function computeReadinessScore(
  successfulAttempts: number,
  totalAttempts: number,
): number {
  if (!Number.isFinite(successfulAttempts) || !Number.isFinite(totalAttempts)) {
    throw new Error('Attempt counts must be finite numbers')
  }
  if (successfulAttempts < 0 || totalAttempts < 0) {
    throw new Error('Attempt counts cannot be negative')
  }
  if (totalAttempts === 0) return 0
  const raw = (successfulAttempts / totalAttempts) * 100
  if (!Number.isFinite(raw)) return 0
  return Math.max(0, Math.min(100, raw))
}

