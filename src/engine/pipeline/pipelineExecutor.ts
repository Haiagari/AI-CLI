// src/engine/pipeline/pipelineExecutor.ts
import { analyzeProject } from '../project/analyzeProject.js';
import { runSecurityScan } from '../security/securityAggregator.js';
import { buildReport } from '../report/reportBuilder.js';
import { writeReportFiles } from '../report/reportWriter.js';
import { calculateScore, getGrade } from '../score/scoreCalculator.js';
import { explainScore } from '../score/scoreExplainer.js';
import { loadConfig } from '../config/configLoader.js';
import type { PipelineResult } from './pipelineTypes.js';

export async function runPipeline(cwd: string): Promise<PipelineResult> {
  // 0. Load Configuration
  const { config } = loadConfig(cwd);

  // 1. Analyze Project
  const project = await analyzeProject(cwd);

  // 2. Security Scan
  const security = await runSecurityScan(cwd);

  // 3. Build Report
  const reportData = await buildReport(cwd);
  const paths = await writeReportFiles(reportData, cwd);

  // 4. Calculate Score
  const scoreBreakdown = calculateScore(security.findings, project, config);
  const score = scoreBreakdown.finalScore;
  const grade = getGrade(score, config);

  // 5. Explain Score
  const explanation = explainScore(scoreBreakdown);

  return {
    project,
    securityFindings: security.findings,
    securityWarnings: security.warnings,
    report: {
      ...reportData,
      markdownPath: paths.markdownPath,
      jsonPath: paths.jsonPath,
    },
    score,
    grade,
    explanation,
  };
}
