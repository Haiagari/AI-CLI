// src/ui/components/SummaryTable.tsx
import React from 'react'
import { Box, Text } from '../../ink.js'
import {
  icons,
  tokens,
  statusToken,
  statusEmoji,
} from '../theme.js'
import type { PipelineResultV2 } from '../../engine/pipeline/pipelineTypes.js'

interface SummaryTableProps {
  result: PipelineResultV2
}

// ─── Primitivos de layout ────────────────────────────────────────────────────

const W_LABEL = 14  // ancho de la columna izquierda

function Border({ char }: { char: string }) {
  return <Text color="secondary">{`  ${char}`}</Text>
}

function DataRow({
  label,
  value,
  valueColor,
}: {
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <Box>
      <Text color="secondary">{'  │  '}</Text>
      <Box width={W_LABEL}>
        <Text color="secondary">{label}</Text>
      </Box>
      <Text color={valueColor as any ?? 'text'}>{value}</Text>
    </Box>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export function SummaryTable({ result }: SummaryTableProps) {
  const { score, project, sast, sca } = result
  const sc = statusToken(score.status)

  const allFindings = [...sast.findings, ...sca.findings]
  const high   = allFindings.filter(f => f.severity === 'high').length
  const medium = allFindings.filter(f => f.severity === 'medium').length
  const low    = allFindings.filter(f => f.severity === 'low').length

  // Penalidades que no son de severity (CI, tests, etc.)
  const structuralPenalties = score.penalties.filter(
    p => !p.reason.includes('severity')
  )

  return (
    <Box flexDirection="column" marginTop={1}>

      {/* ── Borde superior ── */}
      <Border char="┌──────────────────────────────────────────┐" />

      {/* ── Score y grade ── */}
      <Box>
        <Text color="secondary">{'  │  '}</Text>
        <Text color={sc} bold>{`Score  ${score.score} / 100`}</Text>
        <Text color="secondary">{'     '}</Text>
        <Text color={sc}>{`Grade  ${score.grade}`}</Text>
      </Box>

      {/* ── Status ── */}
      <Box>
        <Text color="secondary">{'  │  '}</Text>
        <Text color={sc}>
          {`Status  ${statusEmoji(score.status)} ${score.status}`}
        </Text>
      </Box>

      {/* ── Separador ── */}
      <Border char="├──────────────────────────────────────────┤" />

      {/* ── Estructura del proyecto ── */}
      <DataRow label="Project" value={project.type} />
      <DataRow
        label="Tests"
        value={project.hasTests ? '✅ present' : '❌ missing'}
        valueColor={project.hasTests ? tokens.success : tokens.error}
      />
      <DataRow
        label="CI"
        value={project.hasCI ? '✅ present' : '❌ missing'}
        valueColor={project.hasCI ? tokens.success : tokens.error}
      />
      <DataRow
        label="Docker"
        value={project.hasDocker ? '✅ present' : '— none'}
        valueColor={project.hasDocker ? tokens.success : tokens.secondary}
      />

      {/* ── Separador ── */}
      <Border char="├──────────────────────────────────────────┤" />

      {/* ── Findings ── */}
      <DataRow
        label="High"
        value={high > 0 ? `${high}   (−${high * 15} pts)` : `${high}   —`}
        valueColor={high > 0 ? tokens.error : tokens.secondary}
      />
      <DataRow
        label="Medium"
        value={medium > 0 ? `${medium}   (−${medium * 5} pts)` : `${medium}   —`}
        valueColor={medium > 0 ? tokens.warning : tokens.secondary}
      />
      <DataRow
        label="Low"
        value={`${low}   —`}
        valueColor={tokens.secondary}
      />

      {/* ── Penalidades estructurales ── */}
      {structuralPenalties.length > 0 && (
        <>
          <Border char="├──────────────────────────────────────────┤" />
          {structuralPenalties.map((p, i) => (
            <DataRow
              key={i}
              label={p.label}
              value={`${p.points} pts`}
              valueColor={tokens.error}
            />
          ))}
        </>
      )}

      {/* ── Borde inferior ── */}
      <Border char="└──────────────────────────────────────────┘" />
    </Box>
  )
}
