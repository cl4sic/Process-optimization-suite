import React from 'react';
import { Trophy, Clock, TrendingDown } from 'lucide-react';
import { OptimizationResult } from '../core/types';

interface BenchmarkTableProps {
  results: OptimizationResult[];
  onSelectResult: (result: OptimizationResult) => void;
  selectedAlgorithm?: string;
}

export const BenchmarkTable: React.FC<BenchmarkTableProps> = ({
  results,
  onSelectResult,
  selectedAlgorithm,
}) => {
  if (results.length === 0) return null;

  // Find overall best makespan
  const minMakespan = Math.min(...results.map((r) => r.bestMakespan));

  return (
    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2.5">
        <Trophy className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-zinc-100">
          Resultados del Torneo Comparativo Multi-Algoritmo
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400">
              <th className="py-2 px-3 font-medium">Algoritmo</th>
              <th className="py-2 px-3 font-medium">Makespan Final</th>
              <th className="py-2 px-3 font-medium">Mejora %</th>
              <th className="py-2 px-3 font-medium">Tiempo (ms)</th>
              <th className="py-2 px-3 font-medium">Estado</th>
              <th className="py-2 px-3 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {results.map((r) => {
              const isWinner = r.bestMakespan === minMakespan;
              const isSelected = selectedAlgorithm === r.algorithm;

              return (
                <tr
                  key={r.algorithm}
                  className={`hover:bg-zinc-800/40 transition-colors ${
                    isSelected ? 'bg-indigo-950/20' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-medium text-zinc-200 flex items-center space-x-2">
                    {isWinner && <Trophy className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                    <span>{r.algorithmName}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold">
                    <span
                      className={
                        isWinner
                          ? 'text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50'
                          : 'text-zinc-200'
                      }
                    >
                      {r.bestMakespan}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-indigo-400">
                    <span className="flex items-center space-x-1">
                      <TrendingDown className="w-3 h-3" />
                      <span>{r.improvementPct.toFixed(2)}%</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-zinc-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>{r.executionTimeMs.toFixed(1)} ms</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {isWinner ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Ganador
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-[11px]">
                        +{r.bestMakespan - minMakespan} u.t.
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onSelectResult(r)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      Ver en Gantt
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
