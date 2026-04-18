// src/engine/score/scoreExplainer.ts
import type { ScoreBreakdown } from './scoreTypes.js'

/**
 * Generates human-readable explanation from a score breakdown.
 * Now uses the calculated penalty lines instead of re-calculating everything.
 */
export function explainScore(breakdown: ScoreBreakdown): string[] {
  if (breakdown.lines.length === 0) {
    return ['Project follows major best practices and has no significant security findings.']
  }
  
  // Convert penalty lines to explanation strings
  return breakdown.lines.map(l => `${l.label}: ${l.points} pts`)
}
