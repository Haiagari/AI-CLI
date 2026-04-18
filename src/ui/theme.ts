// src/ui/theme.ts
// Usa los tokens del design system de ink.ts, no colores hardcodeados.

import type { PipelineStatus, StepStatus } from '../engine/pipeline/pipelineTypes.js'

// ─── Íconos ─────────────────────────────────────────────────────────────────

export const icons = {
  brand:     '▲',
  step:      '◆',
  success:   '✔',
  failure:   '✖',
  skipped:   '○',
  highlight: '✦',
  info:      '◇',
  arrow:     '→',
} as const

// ─── Tokens de color para <Text color={...}> ─────────────────────────────────

export const tokens = {
  text:      'text',       // color principal
  secondary: 'secondary',  // gris tenue
  success:   'success',    // verde
  warning:   'warning',    // amarillo
  error:     'error',      // rojo
  info:      'info',       // cian
} as const

export type ColorToken = typeof tokens[keyof typeof tokens]

// ─── Helpers de semántica ────────────────────────────────────────────────────

export function statusToken(status: PipelineStatus): ColorToken {
  return {
    PASS: tokens.success,
    WARN: tokens.warning,
    FAIL: tokens.error,
  }[status]
}

export function statusEmoji(status: PipelineStatus): string {
  return {
    PASS: '✅',
    WARN: '⚠️ ',
    FAIL: '❌',
  }[status]
}

export function statusGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}

export function stepToken(status: StepStatus): ColorToken {
  return {
    pending: tokens.secondary,
    running: tokens.secondary,
    success: tokens.success,
    skipped: tokens.secondary,
    failed:  tokens.error,
  }[status]
}

export function stepIcon(status: StepStatus): string {
  return {
    pending: icons.step,
    running: icons.step,   // el Spinner reemplaza visualmente este
    success: icons.success,
    skipped: icons.skipped,
    failed:  icons.failure,
  }[status]
}

export function severityToken(severity: 'high' | 'medium' | 'low'): ColorToken {
  return {
    high:   tokens.error,
    medium: tokens.warning,
    low:    tokens.secondary,
  }[severity]
}

// ─── Formato de duración ─────────────────────────────────────────────────────

export function fmtMs(ms: number): string {
  return `(${(ms / 1000).toFixed(1)}s)`
}
