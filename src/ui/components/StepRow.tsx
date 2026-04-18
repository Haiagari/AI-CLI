// src/ui/components/StepRow.tsx
import React from 'react'
import { Box, Text } from '../../ink.js'
import { Spinner } from '../../components/Spinner.js'
import { stepToken, stepIcon, fmtMs } from '../theme.js'
import type { StepStatus } from '../../engine/pipeline/pipelineTypes.js'

interface StepRowProps {
  status:      StepStatus
  message:     string
  durationMs?: number
}

export function StepRow({ status, message, durationMs }: StepRowProps) {
  const isRunning = status === 'running'
  const isPending = status === 'pending'
  const token     = stepToken(status)
  const icon      = stepIcon(status)

  return (
    <Box gap={1} paddingLeft={2}>
      {isRunning
        ? <Spinner />
        : <Text color={isPending ? 'secondary' : token}>{icon}</Text>
      }
      <Text color={isRunning || isPending ? 'secondary' : token}>
        {message}
      </Text>
      {durationMs !== undefined && !isRunning && !isPending && (
        <Text color="secondary">{fmtMs(durationMs)}</Text>
      )}
    </Box>
  )
}
