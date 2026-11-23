import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingDown } from 'lucide-react';
import { ConvergencePoint } from '../core/types';

interface ConvergenceChartProps {
  data: ConvergencePoint[];
  algorithmName?: string;
  initialMakespan?: number;
  bestMakespan?: number;
  isRunning: boolean;
}

export const ConvergenceChart: React.FC<ConvergenceChartProps> = ({
  data,
  algorithmName,
  initialMakespan,
  bestMakespan,
  isRunning,
}) => {
  if (data.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 h-72 flex flex-col items-center justify-center text-zinc-500 text-xs">
        <TrendingDown className="w-8 h-8 mb-2 opacity-40 text-indigo-400" />
        <p>Inicia una optimización para visualizar la curva de convergencia en tiempo real.</p>
      </div>
    );
  }

  // Sample data if too large for smooth SVG line rendering
  const displayData =
    data.length > 250
      ? data.filter((_, idx) => idx % Math.ceil(data.length / 250) === 0 || idx === data.length - 1)
      : data;

  return (
    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <TrendingDown className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-zinc-100">
            Curva de Convergencia ({algorithmName || 'Optimizador'})
          </h3>
        </div>
        <div className="flex items-center space-x-3 text-xs font-mono">
          {initialMakespan != null && (
            <span className="text-zinc-500">
              Inicial: <span className="text-zinc-300">{initialMakespan}</span>
            </span>
          )}
          {bestMakespan != null && (
            <span className="text-indigo-400 font-semibold">
              Actual: {bestMakespan}
            </span>
          )}
          {isRunning && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          )}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="iteration"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
            />
            <YAxis
              stroke="#71717a"
              fontSize={11}
              domain={['auto', 'auto']}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const point = payload[0].payload as ConvergencePoint;
                  return (
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 shadow-xl text-xs space-y-1">
                      <p className="text-zinc-400">Iteración / Generación: <span className="font-mono text-zinc-200">{point.iteration}</span></p>
                      <p className="text-indigo-400 font-semibold">Makespan: <span className="font-mono text-white">{point.makespan}</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="makespan"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
