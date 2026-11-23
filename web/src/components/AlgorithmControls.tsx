import React from 'react';
import { Play, Square, Trophy, Shuffle, Search, Flame, Dna, Settings2 } from 'lucide-react';
import { AlgorithmConfig, AlgorithmType } from '../core/types';

interface AlgorithmControlsProps {
  selectedAlgorithm: AlgorithmType;
  onSelectAlgorithm: (algo: AlgorithmType) => void;
  config: AlgorithmConfig;
  onChangeConfig: (newConfig: AlgorithmConfig) => void;
  onRun: () => void;
  onCancel: () => void;
  onRunBenchmark: () => void;
  isRunning: boolean;
  isBenchmarkRunning: boolean;
}

const ALGORITHMS: {
  id: AlgorithmType;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    id: 'random',
    label: 'Búsqueda Aleatoria',
    badge: 'Baseline',
    icon: Shuffle,
    description: 'Muestreo estocástico uniforme de permutaciones.',
  },
  {
    id: 'local_best',
    label: 'Local (Mejor Vecino)',
    badge: 'Voraz',
    icon: Search,
    description: 'Explora vecindad 2-opt completa y adopta el mejor.',
  },
  {
    id: 'local_first',
    label: 'Local (Primer Mejor)',
    badge: 'Rápido',
    icon: Search,
    description: 'Explora vecindad 2-opt y adopta la primera mejora.',
  },
  {
    id: 'sa',
    label: 'Recocido Simulado',
    badge: 'Metropolis',
    icon: Flame,
    description: 'Enfriamiento geométrico y escape de mínimos locales.',
  },
  {
    id: 'ga',
    label: 'Algoritmo Genético',
    badge: 'Evolutivo',
    icon: Dna,
    description: 'Cruce OX, torneo, mutación swap y elitismo.',
  },
];

export const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  selectedAlgorithm,
  onSelectAlgorithm,
  config,
  onChangeConfig,
  onRun,
  onCancel,
  onRunBenchmark,
  isRunning,
  isBenchmarkRunning,
}) => {
  return (
    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <Settings2 className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Metaheurística & Parámetros</h2>
        </div>
      </div>

      {/* Algorithm Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {ALGORITHMS.map((algo) => {
          const Icon = algo.icon;
          const isSelected = selectedAlgorithm === algo.id;
          return (
            <button
              key={algo.id}
              onClick={() => onSelectAlgorithm(algo.id)}
              disabled={isRunning || isBenchmarkRunning}
              className={`p-3 rounded-lg text-left border transition-all ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500/60 text-white ring-1 ring-indigo-500/40'
                  : 'bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-zinc-400'}`} />
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                  {algo.badge}
                </span>
              </div>
              <h3 className="text-xs font-semibold text-white truncate">{algo.label}</h3>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                {algo.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Dynamic Hyperparameters Panel */}
      <div className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs space-y-3">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
          Configuración de Hiperparámetros
        </span>

        {selectedAlgorithm === 'random' && (
          <div>
            <div className="flex justify-between text-zinc-300 mb-1">
              <span>Iteraciones de muestreo:</span>
              <span className="font-mono text-indigo-400 font-bold">{config.iterations ?? 2000}</span>
            </div>
            <input
              type="range"
              min="100"
              max="20000"
              step="100"
              value={config.iterations ?? 2000}
              onChange={(e) => onChangeConfig({ ...config, iterations: Number(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>
        )}

        {(selectedAlgorithm === 'local_best' || selectedAlgorithm === 'local_first') && (
          <p className="text-zinc-400 leading-relaxed text-[11px]">
            La búsqueda local explora la vecindad 2-opt ($O(N^2)$ intercambios) hasta converger a un óptimo local. No requiere hiperparámetros adicionales.
          </p>
        )}

        {selectedAlgorithm === 'sa' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span>Pasos por temp (L):</span>
                <span className="font-mono text-indigo-400 font-bold">{config.L ?? 100}</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={config.L ?? 100}
                onChange={(e) => onChangeConfig({ ...config, L: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span>Factor enfriamiento (&alpha;):</span>
                <span className="font-mono text-indigo-400 font-bold">{config.alpha ?? 0.95}</span>
              </div>
              <input
                type="range"
                min="0.80"
                max="0.99"
                step="0.01"
                value={config.alpha ?? 0.95}
                onChange={(e) => onChangeConfig({ ...config, alpha: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span>Pasos de pulido local:</span>
                <span className="font-mono text-indigo-400 font-bold">{config.polishSteps ?? 20}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={config.polishSteps ?? 20}
                onChange={(e) => onChangeConfig({ ...config, polishSteps: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        )}

        {selectedAlgorithm === 'ga' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span>Población:</span>
                <span className="font-mono text-indigo-400 font-bold">{config.populationSize ?? 80}</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                step="10"
                value={config.populationSize ?? 80}
                onChange={(e) => onChangeConfig({ ...config, populationSize: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span>Generaciones:</span>
                <span className="font-mono text-indigo-400 font-bold">{config.maxGenerations ?? 100}</span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="20"
                value={config.maxGenerations ?? 100}
                onChange={(e) => onChangeConfig({ ...config, maxGenerations: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span>Cruce OX (P):</span>
                <span className="font-mono text-indigo-400 font-bold">{config.crossoverProb ?? 0.85}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.05"
                value={config.crossoverProb ?? 0.85}
                onChange={(e) => onChangeConfig({ ...config, crossoverProb: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-zinc-300 mb-1">
                <span>Mutación (P):</span>
                <span className="font-mono text-indigo-400 font-bold">{config.mutationProb ?? 0.20}</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.50"
                step="0.01"
                value={config.mutationProb ?? 0.20}
                onChange={(e) => onChangeConfig({ ...config, mutationProb: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
        {isRunning ? (
          <button
            onClick={onCancel}
            className="w-full sm:flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors shadow-lg shadow-rose-900/20"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Detener Optimización</span>
          </button>
        ) : (
          <button
            onClick={onRun}
            disabled={isBenchmarkRunning}
            className="w-full sm:flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs transition-all shadow-lg shadow-indigo-900/30 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Iniciar Optimización</span>
          </button>
        )}

        <button
          onClick={onRunBenchmark}
          disabled={isRunning || isBenchmarkRunning}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 hover:text-white font-medium text-xs transition-colors border border-zinc-700"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{isBenchmarkRunning ? 'Ejecutando Torneo...' : 'Comparar Todos (Torneo)'}</span>
        </button>
      </div>
    </div>
  );
};
