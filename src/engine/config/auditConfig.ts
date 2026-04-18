// src/engine/config/auditConfig.ts
import { z } from 'zod'

// ─── Schema de validación ────────────────────────────────────────────────────

export const AuditConfigSchema = z.object({
  thresholds: z.object({
    pass: z.number().min(0).max(100).default(80),
    warn: z.number().min(0).max(100).default(50),
  }).default({}),

  penalties: z.object({
    critical:             z.number().min(0).default(40),
    high:                 z.number().min(0).default(20),
    medium:               z.number().min(0).default(8),
    low:                  z.number().min(0).default(3),
    missing_tests:        z.number().min(0).default(10),
    missing_ci:           z.number().min(0).default(8),
    missing_gitignore:    z.number().min(0).default(10),
    missing_env_example:  z.number().min(0).default(3),
  }).default({}),

  ignore: z.object({
    severities: z.array(z.enum(['critical', 'high', 'medium', 'low'])).default([]),
    packages:   z.array(z.string()).default([]),
    rules:      z.array(z.string()).default([]),
  }).default({}),
})

export type AuditConfig = z.infer<typeof AuditConfigSchema>

// ─── Defaults explícitos ───────────────────────────────────────────────────

export const DEFAULT_CONFIG: AuditConfig = AuditConfigSchema.parse({})
