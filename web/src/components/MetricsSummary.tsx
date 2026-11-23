import React, { useState } from 'react';
import { Clock, TrendingDown, Layers, Zap, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { OptimizationResult, ProgressUpdate } from '../core/types';

interface MetricsSummaryProps {
  result: OptimizationResult | null;
  progress: ProgressUpdate | null;
  isRunning: boolean;
  numJobs: number;
  numMachines: number;
}

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({
  result,
  progress,
  isRunning,
  numJobs,
  numMachines,
}) => {
  const [showSequence, setShowSequence] = useState(false);

  const currentMakespan = isRunning
    ? progress?.bestMakespan ?? '...'
    : result?.bestMakespan ?? '—';

  const initialMakespan = result?.initialMakespan ?? '—';
  const improvement = result?.improvementPct != null
    ? `${result.improvementPct.toFixed(2)}%`
    : isRunning && progress?.bestMakespan && result?.initialMakespan
    ? `${(((result.initialMakespan - progress.bestMakespan) / result.initialMakespan) * 100).toFixed(1)}%`
    : '—';

  const executionTime = result?.executionTimeMs != null
    ? `${result.executionTimeMs.toFixed(1)} ms`
    : isRunning
    ? 'Calculando...'
    : '—';

  const activeOrder = result?.bestOrder || progress?.bestOrder || [];

  return (
    <div className="space-y-4">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Makespan */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-1">
            <span>Makespan Óptimo (Cmax)</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {currentMakespan}
            </span>
            <span className="text-xs text-zinc-500">unidades de tiempo</span>
          </div>
          <div className="mt-2 text-xs text-zinc-400 flex items-center space-x-1">
            <span>Inicial:</span>
            <span className="text-zinc-300 font-mono">{initialMakespan}</span>
          </div>
        </div>

        {/* Improvement */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-1">
            <span>Reducción de Tiempo</span>
            <TrendingDown className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-indigo-400">
              {improvement}
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Mejora frente a permutación aleatoria
          </div>
        </div>

        {/* Execution Time */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-1">
            <span>Tiempo de Cómputo</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {executionTime}
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            Ejecutado en Web Worker
          </div>
        </div>

        {/* Dimensions */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-1">
            <span>Dimensión del Problema</span>
            <Layers className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {numJobs} <span className="text-zinc-500 font-normal text-sm">trabajos</span>
            </span>
            <span className="text-zinc-500">&times;</span>
            <span className="text-lg font-bold text-zinc-300">
              {numMachines} <span className="text-zinc-500 font-normal text-sm">máq</span>
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            {numJobs * numMachines} operaciones totales
          </div>
        </div>
      </div>

      {/* Best Sequence Drawer / Collapsible */}
      {activeOrder.length > 0 && (
        <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs">
          <button
            onClick={() => setShowSequence(!showSequence)}
            className="w-full flex items-center justify-between text-zinc-300 hover:text-white font-medium"
          >
            <div className="flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Secuencia Óptima de Trabajos ({activeOrder.length} trabajos)</span>
            </div>
            {showSequence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showSequence && (
            <div className="mt-3 flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pt-2 border-t border-zinc-800/60">
              {activeOrder.map((jobId, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-[11px]"
                  title={`Posición ${idx + 1}: Trabajo ${jobId + 1}`}
                >
                  <span className="text-zinc-500 text-[10px] mr-1">#{idx + 1}</span>
                  J{jobId + 1}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
