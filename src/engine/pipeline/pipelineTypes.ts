// src/engine/pipeline/pipelineTypes.ts

import type { ProjectInspection } from '../../types/project.js';
import type { SecurityFinding as EngineSecurityFinding } from '../security/securityTypes.js';
import type { GeneratedReport } from '../report/reportTypes.js';

export type ProjectType = 'node' | 'python' | 'go' | 'rust' | 'unknown';

export interface ProjectResult {
  type: ProjectType;
  fileCount: number;
  hasTests: boolean;
  hasCI: boolean;
  hasDocker: boolean;
  durationMs: number;
  error?: string;
}

export interface SecurityFinding {
  severity: 'high' | 'medium' | 'low';
  rule: string;
  file: string;
  line: number;
  message: string;
}

export interface SecurityResult {
  engine: 'semgrep' | 'trivy';
  status: 'completed' | 'skipped' | 'failed';
  findings: SecurityFinding[];
  durationMs: number;
  skipReason?: string;
  error?: string;
}

export interface ReportResult {
  mdPath: string;
  jsonPath: string;
  durationMs: number;
  error?: string;
}

export type PipelineStatus = 'PASS' | 'WARN' | 'FAIL';

export interface ScorePenalty {
  reason: string;   // "high_severity" | "missing_ci" | "missing_tests" | etc
  label: string;    // texto humano para la tabla
  points: number;   // siempre negativo
}

export interface ScoreResult {
  score: number;          // 0–100
  grade: string;          // A B C D F
  status: PipelineStatus;
  penalties: ScorePenalty[];
  suggestions: string[];  // next steps ya calculados, máx 5
}

// Contrato completo que devuelve el pipeline (v0.2.0)
export interface PipelineResultV2 {
  project: ProjectResult;
  sast: SecurityResult;
  sca: SecurityResult;
  report: ReportResult;
  score: ScoreResult;
}

// Mantenemos el tipo original para compatibilidad con el engine actual
export type PipelineResult = {
  project: ProjectInspection;
  securityFindings: EngineSecurityFinding[];
  securityWarnings: string[];
  report: GeneratedReport;
  score: number;
  grade: 'pass' | 'warn' | 'fail';
  explanation: string[];
};

// Estado interno del componente <PipelineRunner />
export type StepStatus = 'pending' | 'running' | 'success' | 'skipped' | 'failed';

export interface StepState {
  status: StepStatus;
  message: string;   // mensaje que se muestra al lado del spinner o check
}

export interface PipelineUIState {
  project: StepState;
  sast: StepState;
  sca: StepState;
  report: StepState;
  result?: PipelineResultV2;  // undefined mientras no terminó
}
