// src/ui/PipelineRunner.tsx
import React, { useEffect, useState } from 'react'
import { Box, Text } from '../ink.js'
import { StepRow } from './components/StepRow.js'
import { SummaryTable } from './components/SummaryTable.js'
import { icons } from './theme.js'
import { analyzeProject } from '../engine/project/analyzeProject.js'
import { runSecurityScan } from '../engine/security/securityAggregator.js'
import { buildReport } from '../engine/report/reportBuilder.js'
import { writeReportFiles } from '../engine/report/reportWriter.js'
import { calculateScore, getGrade } from '../engine/score/scoreCalculator.js'
import { explainScore } from '../engine/score/scoreExplainer.js'
import { loadConfig } from '../engine/config/configLoader.js'
import type { LocalJSXCommandOnDone } from '../types/command.js'
import type { ProjectInspection } from '../types/project.js'
import type { SecurityFinding as EngineSecurityFinding } from '../engine/security/securityTypes.js'
import type {
  PipelineUIState,
  PipelineResultV2,
  ProjectResult,
  SecurityResult,
  ReportResult,
  ScoreResult,
  ScorePenalty,
} from '../engine/pipeline/pipelineTypes.js'

// ─── Adaptadores ─────────────────────────────────────────────────────────────

function adaptProject(raw: ProjectInspection, durationMs: number): ProjectResult {
  return {
    type:      raw.type as ProjectResult['type'],
    fileCount: raw.files.detected.length,
    hasTests:  raw.files.hasTests,
    hasCI:     raw.files.hasCI,
    hasDocker: raw.files.hasDockerfile,
    durationMs,
  }
}

function adaptSecurityResult(
  findings: EngineSecurityFinding[],
  engine: 'semgrep' | 'trivy',
  durationMs: number,
): SecurityResult {
  const engineFindings = findings.filter(f => f.source === engine)

  return {
    engine,
    status:   'completed',
    durationMs,
    findings: engineFindings.map(f => ({
      severity: f.severity as 'high' | 'medium' | 'low',
      rule:     f.ruleId ?? f.vulnerabilityId ?? f.title,
      file:     f.file ?? f.packageName ?? 'unknown',
      line:     f.line ?? 0,
      message:  f.description,
    })),
  }
}

function adaptScore(
  scoreBreakdown: any,
  grade:       'pass' | 'warn' | 'fail',
  explanation: string[],
  project:     ProjectResult,
): ScoreResult {
  const score = scoreBreakdown.finalScore
  const status = grade.toUpperCase() as 'PASS' | 'WARN' | 'FAIL'
  const letter = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F'

  // Mapeamos las penalidades reales del breakdown
  const penalties: ScorePenalty[] = scoreBreakdown.lines.map((l: any) => ({
    reason: l.reason,
    label: l.label,
    points: l.points
  }))

  const suggestions = explanation.slice(0, 5)

  return { score, grade: letter, status, penalties, suggestions }
}

// ─── Estado inicial ───────────────────────────────────────────────────────────

const INITIAL: PipelineUIState = {
  project: { status: 'pending', message: 'Analyze project structure' },
  sast:    { status: 'pending', message: 'SAST scan (Semgrep)'       },
  sca:     { status: 'pending', message: 'SCA scan (Trivy)'          },
  report:  { status: 'pending', message: 'Generate audit report'     },
}

// ─── Orquestador async ───────────────────────────────────────────────────────

async function runAudit(
  cwd:      string,
  setState: React.Dispatch<React.SetStateAction<PipelineUIState>>,
  onDone:   LocalJSXCommandOnDone,
): Promise<void> {

  const { config } = loadConfig(cwd)
  let t = Date.now()

  // ── Phase 1: Project ────────────────────────────────────────────────────────
  setState(s => ({ ...s, project: { status: 'running', message: 'Analyzing project structure...' } }))
  let rawProject: ProjectInspection
  let project: ProjectResult
  try {
    rawProject = await analyzeProject(cwd)
    project    = adaptProject(rawProject, Date.now() - t)
    setState(s => ({
      ...s,
      project: {
        status:  'success',
        message: `Project detected — ${project.type} · ${project.fileCount} files · tests ${project.hasTests ? '✅' : '❌'} · CI ${project.hasCI ? '✅' : '❌'}`,
      },
    }))
  } catch (err: any) {
    setState(s => ({
      ...s,
      project: { status: 'failed', message: `Could not analyze project — ${err.message}` },
    }))
    onDone(`Pipeline failed during project analysis: ${err.message}`)
    return
  }

  // ── Phase 2 + 3: Security ──────────────────────────────────────────────────
  setState(s => ({
    ...s,
    sast: { status: 'running', message: 'Running SAST scan (Semgrep)...' },
    sca:  { status: 'running', message: 'Running SCA scan (Trivy)...'    },
  }))

  t = Date.now()
  let sast: SecurityResult
  let sca:  SecurityResult
  let rawFindings: EngineSecurityFinding[] = []

  try {
    const security  = await runSecurityScan(cwd)
    const duration  = Date.now() - t
    rawFindings     = security.findings

    sast = adaptSecurityResult(rawFindings, 'semgrep', duration)
    sca  = adaptSecurityResult(rawFindings, 'trivy',   duration)

    const sastH = sast.findings.filter(f => f.severity === 'high').length
    const sastM = sast.findings.filter(f => f.severity === 'medium').length
    const scaH  = sca.findings.filter(f => f.severity === 'high').length
    const scaM  = sca.findings.filter(f => f.severity === 'medium').length

    setState(s => ({
      ...s,
      sast: { status: 'success', message: `SAST completed — ${sastH} high · ${sastM} medium` },
      sca:  { status: 'success', message: `SCA completed — ${scaH} high · ${scaM} medium`    },
    }))
  } catch (err: any) {
    const isSkip = /not found|not installed|command not found/i.test(err.message ?? '')
    const skipMsg = 'Scanner not found — install Semgrep and Trivy to enable'
    const failMsg = `Security scan failed — ${err.message}`

    sast = { engine: 'semgrep', status: isSkip ? 'skipped' : 'failed', findings: [], durationMs: Date.now() - t }
    sca  = { engine: 'trivy',   status: isSkip ? 'skipped' : 'failed', findings: [], durationMs: Date.now() - t }

    setState(s => ({
      ...s,
      sast: { status: isSkip ? 'skipped' : 'failed', message: isSkip ? skipMsg : failMsg },
      sca:  { status: isSkip ? 'skipped' : 'failed', message: isSkip ? skipMsg : failMsg },
    }))
  }

  // ── Phase 4: Report ─────────────────────────────────────────────────────────
  setState(s => ({ ...s, report: { status: 'running', message: 'Generating audit report...' } }))
  t = Date.now()
  let report: ReportResult

  try {
    const reportData = await buildReport(cwd)
    const paths = await writeReportFiles(reportData, cwd)
    
    report = {
      mdPath:     paths.markdownPath,
      jsonPath:   paths.jsonPath,
      durationMs: Date.now() - t,
    }
    setState(s => ({
      ...s,
      report: { status: 'success', message: `Report saved → ${report.mdPath}` },
    }))
  } catch (err: any) {
    report = { mdPath: '', jsonPath: '', durationMs: Date.now() - t, error: err.message }
    setState(s => ({
      ...s,
      report: { status: 'failed', message: `Report failed — ${err.message}` },
    }))
  }

  // ── Score final ─────────────────────────────────────────────────────────────
  const scoreBreakdown = calculateScore(rawFindings, rawProject, config)
  const rawGrade   = getGrade(scoreBreakdown.finalScore, config)
  const rawExplain = explainScore(scoreBreakdown)
  const score      = adaptScore(scoreBreakdown, rawGrade, rawExplain, project)

  const resultV2: PipelineResultV2 = { project, sast, sca, report, score }

  setState(s => ({ ...s, result: resultV2 }))

  onDone(
    `OzyAudit complete — Score: ${score.score}/100 (${score.grade}) · Status: ${score.status}`,
    { shouldQuery: false }
  )
}

interface PipelineRunnerProps {
  cwd:    string
  onDone: LocalJSXCommandOnDone
}

export function PipelineRunner({ cwd, onDone }: PipelineRunnerProps) {
  const [state, setState] = useState<PipelineUIState>(INITIAL)

  useEffect(() => {
    runAudit(cwd, setState, onDone)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { result } = state

  return (
    <Box flexDirection="column">
      <Box flexDirection="column" marginBottom={1}>
        <Text>{' '}</Text>
        <Box gap={2} paddingLeft={2}>
          <Text bold>{`${icons.brand} OzyAudit`}</Text>
          <Text color="secondary">v0.2.0</Text>
        </Box>
        <Box paddingLeft={2}>
          <Text color="secondary">Local-first audit platform</Text>
        </Box>
        <Text>{' '}</Text>
      </Box>

      <StepRow status={state.project.status} message={state.project.message} durationMs={result?.project.durationMs} />
      <StepRow status={state.sast.status}    message={state.sast.message}    durationMs={result?.sast.durationMs}    />
      <StepRow status={state.sca.status}     message={state.sca.message}     durationMs={result?.sca.durationMs}     />
      <StepRow status={state.report.status}  message={state.report.message}  durationMs={result?.report.durationMs}  />

      {result && (
        <>
          <SummaryTable result={result} />

          <Box flexDirection="column" marginTop={1} paddingLeft={2}>
            <Box gap={1}>
              <Text color="info">✦</Text>
              <Text color="info" bold>Next steps:</Text>
            </Box>
            {result.score.suggestions.map((s, i) => (
              <Box key={i} gap={1} paddingLeft={2}>
                <Text color="secondary">→</Text>
                <Text>{s}</Text>
              </Box>
            ))}
          </Box>

          <Box gap={1} paddingLeft={2} marginTop={1} marginBottom={1}>
            <Text color="secondary">◇</Text>
            <Text color="secondary">Full report</Text>
            <Text color="secondary">→</Text>
            <Text color="info">{result.report.mdPath}</Text>
          </Box>
        </>
      )}
    </Box>
  )
}
