// src/commands/run-pipeline/run-pipeline.tsx
import React from 'react'
import { PipelineRunner } from '../../ui/PipelineRunner.js'
import { render } from '../../ink.js'
import { executeStandardPipeline } from '../../engine/pipeline/builtInPipeline.js'
import type { LocalCommandResult } from '../../types/command.js'

export async function call(args: string): Promise<LocalCommandResult> {
  const isCI = args.includes('--ci') || process.env.CI === 'true'
  const cwd = process.cwd()

  if (isCI) {
    try {
      const result = await executeStandardPipeline(cwd)
      process.stdout.write(JSON.stringify(result, null, 2) + '\n')
      
      const exitCode = result.grade === 'fail' ? 2 : result.grade === 'warn' ? 1 : 0
      // En modo local no tenemos onDone, usamos process.exit directamente si es CI
      process.exit(exitCode)
    } catch (err: any) {
      process.stderr.write(`Pipeline Error: ${err.message}\n`)
      process.exit(1)
    }
  }

  // Modo Interactivo: Renderizamos manualmente usando el helper de ink.ts
  // Esto nos permite mantener la UI pro dentro de un comando 'local'
  await render(<PipelineRunner cwd={cwd} onDone={() => {}} />)
  
  return { type: 'text', value: '' }
}
