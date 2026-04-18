// src/engine/config/configLoader.ts
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { AuditConfigSchema, DEFAULT_CONFIG } from './auditConfig.js'
import type { AuditConfig } from './auditConfig.js'

const FILENAME = '.auditrc'

export interface ConfigLoadResult {
  config:   AuditConfig
  source:   'file' | 'defaults'
  filePath: string | null
  warnings: string[]
}

export function loadConfig(cwd: string): ConfigLoadResult {
  const filePath = join(cwd, FILENAME)
  const warnings: string[] = []

  if (!existsSync(filePath)) {
    return {
      config:   DEFAULT_CONFIG,
      source:   'defaults',
      filePath: null,
      warnings: [],
    }
  }

  let raw: unknown
  try {
    raw = JSON.parse(readFileSync(filePath, 'utf8'))
  } catch (err: any) {
    warnings.push(`.auditrc found but invalid JSON — using defaults. (${err.message})`)
    return {
      config:   DEFAULT_CONFIG,
      source:   'defaults',
      filePath,
      warnings,
    }
  }

  const parsed = AuditConfigSchema.safeParse(raw)

  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`)
    warnings.push(`.auditrc has invalid fields — using defaults for those:\n${issues.join('\n')}`)
    // parse con defaults para los campos inválidos — zod rellena lo que falta
    return {
      config:   AuditConfigSchema.parse(raw),
      source:   'file',
      filePath,
      warnings,
    }
  }

  return {
    config:   parsed.data,
    source:   'file',
    filePath,
    warnings: [],
  }
}
