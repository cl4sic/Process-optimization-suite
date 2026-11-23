import React, { useState, useMemo, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, BarChart3, HelpCircle, Eye } from 'lucide-react';
import { EvaluationResult, ScheduleBlock } from '../core/types';

interface GanttChartProps {
  evaluation: EvaluationResult | null;
  numJobs: number;
}

export const GanttChart: React.FC<GanttChartProps> = ({ evaluation, numJobs }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredBlock, setHoveredBlock] = useState<ScheduleBlock | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const makespan = evaluation?.makespan || 0;
  const schedules = evaluation?.schedules || [];
  const numMachines = schedules.length;

  // Dynamic geometry dimensions
  const rowHeight = 36;
  const headerHeight = 28;
  const labelWidth = 110;

  // Scale: pixels per time unit
  const baseScale = useMemo(() => {
    if (makespan === 0) return 1;
    // Target base width around 800px or comfortable viewing
    return Math.max(0.5, Math.min(25, 800 / makespan));
  }, [makespan]);

  const scale = baseScale * zoomLevel;
  const chartWidth = Math.max(600, makespan * scale);
  const totalSvgWidth = labelWidth + chartWidth + 40;
  const totalSvgHeight = headerHeight + numMachines * (rowHeight + 8) + 30;

  // Time grid tick calculation
  const timeTicks = useMemo(() => {
    if (makespan === 0) return [];
    const targetTicks = Math.min(20, Math.max(5, Math.floor(chartWidth / 80)));
    const rawStep = makespan / targetTicks;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const step = Math.max(1, Math.round(rawStep / magnitude) * magnitude);

    const ticks: number[] = [];
    for (let t = 0; t <= makespan; t += step) {
      ticks.push(t);
    }
    if (ticks[ticks.length - 1] !== makespan) {
      ticks.push(makespan);
    }
    return ticks;
  }, [makespan, chartWidth]);

  const handleMouseEnterBlock = (e: React.MouseEvent, block: ScheduleBlock) => {
    setHoveredBlock(block);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMoveBlock = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseLeaveBlock = () => {
    setHoveredBlock(null);
    setTooltipPos(null);
  };

  if (!evaluation || makespan === 0) {
    return (
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 h-80 flex flex-col items-center justify-center text-zinc-500 text-xs">
        <BarChart3 className="w-10 h-10 mb-2 opacity-30 text-indigo-400" />
        <p>Ejecuta una optimización para generar el diagrama de Gantt por máquinas y operaciones.</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3 relative" ref={containerRef}>
      {/* Chart Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-zinc-100">
            Cronograma de Gantt por Máquinas ({numMachines} máq &bull; {numJobs} trabajos)
          </h3>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center space-x-2">
          {selectedJobId !== null && (
            <button
              onClick={() => setSelectedJobId(null)}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-[11px] hover:bg-indigo-900/60 transition-colors"
            >
              <Eye className="w-3 h-3" />
              <span>Filtro: J{selectedJobId + 1} &times;</span>
            </button>
          )}

          <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.3, z * 0.8))}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white"
              title="Reducir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] text-zinc-400">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(6, z * 1.25))}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white ml-1 border-l border-zinc-800 pl-1.5"
              title="Reiniciar Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Scroll Area */}
      <div className="overflow-x-auto overflow-y-hidden border border-zinc-800/80 rounded-lg bg-zinc-950/80 p-2">
        <svg width={totalSvgWidth} height={totalSvgHeight} className="select-none font-sans">
          <defs>
            {/* Subtle glow filter for hovered job */}
            <filter id="job-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ffffff" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Time axis header ticks */}
          <g transform={`translate(${labelWidth}, 0)`}>
            {timeTicks.map((tick) => {
              const x = tick * scale;
              return (
                <g key={`tick-${tick}`} transform={`translate(${x}, 0)`}>
                  <line
                    y1={headerHeight - 6}
                    y2={totalSvgHeight - 20}
                    stroke="#27272a"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                  />
                  <text
                    y={headerHeight - 10}
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Machine Rows */}
          {schedules.map((schedule, mIdx) => {
            const y = headerHeight + mIdx * (rowHeight + 8);
            const utilPct = Math.round(schedule.utilizationRate * 100);

            return (
              <g key={`machine-${schedule.machineId}`} transform={`translate(0, ${y})`}>
                {/* Machine Label Column */}
                <rect
                  x="0"
                  y="0"
                  width={labelWidth - 10}
                  height={rowHeight}
                  rx="6"
                  fill="#18181b"
                  stroke="#27272a"
                />
                <text
                  x="12"
                  y={rowHeight / 2 - 3}
                  dominantBaseline="middle"
                  fill="#f4f4f5"
                  fontSize="11"
                  fontWeight="600"
                >
                  Máquina {schedule.machineId + 1}
                </text>
                <text
                  x="12"
                  y={rowHeight / 2 + 10}
                  dominantBaseline="middle"
                  fill="#a1a1aa"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  Uso: {utilPct}%
                </text>

                {/* Background Track */}
                <rect
                  x={labelWidth}
                  y="0"
                  width={makespan * scale}
                  height={rowHeight}
                  rx="4"
                  fill="#0e0e11"
                  stroke="#27272a"
                  strokeWidth="0.5"
                />

                {/* Job Blocks */}
                {schedule.blocks.map((block) => {
                  const x = labelWidth + block.startTime * scale;
                  const width = Math.max(2, block.duration * scale);
                  const isHovered = hoveredBlock?.jobId === block.jobId;
                  const isSelected = selectedJobId === block.jobId;
                  const isDimmed =
                    (selectedJobId !== null && selectedJobId !== block.jobId) ||
                    (hoveredBlock !== null && hoveredBlock.jobId !== block.jobId);

                  return (
                    <g
                      key={`block-${block.machineId}-${block.jobId}`}
                      onMouseEnter={(e) => handleMouseEnterBlock(e, block)}
                      onMouseMove={handleMouseMoveBlock}
                      onMouseLeave={handleMouseLeaveBlock}
                      onClick={() =>
                        setSelectedJobId(selectedJobId === block.jobId ? null : block.jobId)
                      }
                      className="cursor-pointer transition-opacity duration-150"
                      style={{ opacity: isDimmed ? 0.25 : 1 }}
                    >
                      <rect
                        x={x}
                        y="2"
                        width={Math.max(1, width - 1)}
                        height={rowHeight - 4}
                        rx="4"
                        fill={block.color}
                        stroke={isHovered || isSelected ? '#ffffff' : '#00000033'}
                        strokeWidth={isHovered || isSelected ? '1.5' : '1'}
                        filter={isHovered || isSelected ? 'url(#job-glow)' : undefined}
                      />
                      {/* Text inside block if wide enough */}
                      {width >= 22 && (
                        <text
                          x={x + width / 2}
                          y={rowHeight / 2}
                          dominantBaseline="middle"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="700"
                          pointerEvents="none"
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                        >
                          {block.jobId + 1}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Tooltip */}
      {hoveredBlock && tooltipPos && (
        <div
          className="absolute z-50 pointer-events-none p-3 rounded-xl bg-zinc-950/95 border border-zinc-700 shadow-2xl text-xs space-y-1.5 backdrop-blur-md"
          style={{
            left: Math.min(window.innerWidth - 300, tooltipPos.x + 15),
            top: tooltipPos.y - 10,
          }}
        >
          <div className="flex items-center space-x-2 border-b border-zinc-800 pb-1.5">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: hoveredBlock.color }}
            />
            <span className="font-bold text-white text-sm">
              Trabajo J{hoveredBlock.jobId + 1}
            </span>
            <span className="text-zinc-500 font-mono text-[11px]">
              &bull; Máquina M{hoveredBlock.machineId + 1}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-zinc-300 font-mono text-[11px]">
            <div>
              <span className="text-zinc-500">Inicio: </span>
              <span className="text-white font-semibold">{hoveredBlock.startTime}</span>
            </div>
            <div>
              <span className="text-zinc-500">Fin: </span>
              <span className="text-white font-semibold">{hoveredBlock.endTime}</span>
            </div>
            <div>
              <span className="text-zinc-500">Duración: </span>
              <span className="text-indigo-400 font-semibold">{hoveredBlock.duration} u.t.</span>
            </div>
            <div>
              <span className="text-zinc-500">Inactividad previa: </span>
              <span className="text-amber-400 font-semibold">{hoveredBlock.idleBefore} u.t.</span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
            Haz clic para resaltar este trabajo en todas las máquinas.
          </p>
        </div>
      )}

      {/* Help bar */}
      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
        <span className="flex items-center space-x-1">
          <HelpCircle className="w-3 h-3" />
          <span>Pasa el cursor para ver detalles &bull; Haz clic en un trabajo para aislar su recorrido</span>
        </span>
        <span className="font-mono text-zinc-400 font-semibold">
          Makespan Total: {makespan} u.t.
        </span>
      </div>
    </div>
  );
};
