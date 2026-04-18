// src/engine/score/scoreCalculator.ts
import type { ScoreBreakdown, PenaltyLine } from './scoreTypes.js'
import type { SecurityFinding } from '../security/securityTypes.js'
import type { ProjectInspection } from '../../types/project.js'
import type { AuditConfig } from '../config/auditConfig.js'
import { DEFAULT_CONFIG } from '../config/auditConfig.js'

export function calculateScore(
  securityFindings: SecurityFinding[],
  project:          ProjectInspection,
  config:           AuditConfig = DEFAULT_CONFIG,
): ScoreBreakdown {
  const p       = config.penalties
  const ignore  = config.ignore
  const lines:  PenaltyLine[] = []

  // ─── Security penalties ────────────────────────────────────────────────────

  const relevant = securityFindings.filter(f => {
    if (ignore.severities.includes(f.severity as any))  return false
    if (f.packageName && ignore.packages.includes(f.packageName)) return false
    if (f.ruleId      && ignore.rules.includes(f.ruleId))         return false
    return true
  })

  const counts = { critical: 0, high: 0, medium: 0, low: 0 }
  for (const f of relevant) {
    if (f.severity in counts) counts[f.severity as keyof typeof counts]++
  }

  if (counts.critical > 0) lines.push({
    reason: 'critical_severity',
    label:  `Critical severity (×${counts.critical})`,
    points: -(counts.critical * p.critical),
  })
  if (counts.high > 0) lines.push({
    reason: 'high_severity',
    label:  `High severity (×${counts.high})`,
    points: -(counts.high * p.high),
  })
  if (counts.medium > 0) lines.push({
    reason: 'medium_severity',
    label:  `Medium severity (×${counts.medium})`,
    points: -(counts.medium * p.medium),
  })
  if (counts.low > 0) lines.push({
    reason: 'low_severity',
    label:  `Low severity (×${counts.low})`,
    points: -(counts.low * p.low),
  })

  // ─── Structure penalties ───────────────────────────────────────────────────

  if (!project.files.hasTests)
    lines.push({ reason: 'missing_tests',       label: 'Tests missing',       points: -p.missing_tests })
  if (!project.files.hasCI)
    lines.push({ reason: 'missing_ci',          label: 'CI missing',          points: -p.missing_ci })
  if (!project.files.hasGitignore)
    lines.push({ reason: 'missing_gitignore',   label: '.gitignore missing',  points: -p.missing_gitignore })
  if (!project.files.hasEnvExample)
    lines.push({ reason: 'missing_env_example', label: '.env.example missing', points: -p.missing_env_example })

  // ─── Totals ────────────────────────────────────────────────────────────────

  const penalties  = lines.reduce((acc, l) => acc + Math.abs(l.points), 0)
  const finalScore = Math.max(0, 100 - penalties)

  return { baseScore: 100, penalties, finalScore, lines }
}

export function getGrade(
  score:  number,
  config: AuditConfig = DEFAULT_CONFIG,
): 'pass' | 'warn' | 'fail' {
  if (score >= config.thresholds.pass) return 'pass'
  if (score >= config.thresholds.warn) return 'warn'
  return 'fail'
}
