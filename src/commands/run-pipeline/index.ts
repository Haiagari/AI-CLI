// src/commands/run-pipeline/index.ts
import type { Command, LocalCommandCall } from '../../types/command.js';

// Usamos tipo 'local' para que sea ejecutable desde el CLI con el flag -p (--print),
// pero con la capacidad de renderizar JSX manualmente si no es modo CI.
const call: LocalCommandCall = async (args) => {
  const mod = await import('./run-pipeline.js');
  return mod.call(args);
};

const runPipeline = {
  type: 'local',
  name: 'run-pipeline',
  description: 'Execute full audit pipeline with automated scoring (v0.2.0)',
  immediate: true,
  supportsNonInteractive: true,
  load: () => Promise.resolve({ call }),
} satisfies Command;

export default runPipeline;
