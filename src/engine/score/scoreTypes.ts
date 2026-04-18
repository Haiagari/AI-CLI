// src/engine/score/scoreTypes.ts

export interface PenaltyLine {
  reason: string;   // "medium_severity" | "missing_ci" | etc.
  label:  string;   // "Medium severity (×9)"
  points: number;   // siempre negativo
}

export interface ScoreBreakdown {
  baseScore:  number;
  finalScore: number;
  penalties:  number;        // total deducido
  lines:      PenaltyLine[]; // detalle por línea para la UI y el reporte
}
