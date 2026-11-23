import React, { useRef, useState } from 'react';
import { Database, Upload, Wand2, FileText, CheckCircle2 } from 'lucide-react';
import { parseInstance, serializeInstance } from '../core/parser';
import { generateRandomInstance } from '../core/generator';
import { ProblemInstance } from '../core/types';

interface DatasetSelectorProps {
  currentInstance: ProblemInstance;
  onSelectInstance: (instance: ProblemInstance) => void;
  disabled: boolean;
}

interface PresetOption {
  id: string;
  label: string;
  description: string;
  path: string;
  jobs: number;
  machines: number;
}

const PRESETS: PresetOption[] = [
  {
    id: 'test_5_2',
    label: 'Mini Test (5 trabajos × 2 máq)',
    description: 'Instancia didáctica rápida original (datos.txt)',
    path: './datasets/datos_5_2.txt',
    jobs: 5,
    machines: 2,
  },
  {
    id: 'ta001_20_5',
    label: 'Taillard Ta001 (20 trabajos × 5 máq)',
    description: 'Benchmark de complejidad media estándar',
    path: './datasets/ta001_20_5.txt',
    jobs: 20,
    machines: 5,
  },
  {
    id: 'large_200_20',
    label: 'Gran Escala (200 trabajos × 20 máq)',
    description: 'Instancia industrial masiva (4000 operaciones)',
    path: './datasets/instancia_200_20.txt',
    jobs: 200,
    machines: 20,
  },
];

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  currentInstance,
  onSelectInstance,
  disabled,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'generator'>('presets');
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Generator inputs
  const [genJobs, setGenJobs] = useState(25);
  const [genMachines, setGenMachines] = useState(5);
  const [genMinTime, setGenMinTime] = useState(1);
  const [genMaxTime, setGenMaxTime] = useState(99);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLoadPreset = async (preset: PresetOption) => {
    setLoading(true);
    setUploadError(null);
    try {
      const response = await fetch(preset.path);
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status} al cargar ${preset.path}`);
      }
      const text = await response.text();
      const parsed = parseInstance(text, preset.label);
      onSelectInstance(parsed);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al cargar preset');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseInstance(content, file.name);
        onSelectInstance(parsed);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Formato de archivo no válido.');
      }
    };
    reader.readAsText(file);
  };

  const handleGenerate = () => {
    const generated = generateRandomInstance(
      genJobs,
      genMachines,
      genMinTime,
      genMaxTime,
      `Sintética (${genJobs} trabajos × ${genMachines} máquinas)`
    );
    onSelectInstance(generated);
  };

  const handleDownloadInstance = () => {
    const text = serializeInstance(currentInstance);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentInstance.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
      {/* Header and Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Instancia del Problema</h2>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center space-x-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'presets'
                ? 'bg-zinc-800 text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Presets
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'upload'
                ? 'bg-zinc-800 text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Subir Archivo
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'generator'
                ? 'bg-zinc-800 text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Generador
          </button>
        </div>
      </div>

      {/* Tab: Presets */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {PRESETS.map((p) => {
            const isSelected = currentInstance.numJobs === p.jobs && currentInstance.numMachines === p.machines;
            return (
              <button
                key={p.id}
                onClick={() => handleLoadPreset(p)}
                disabled={disabled || loading}
                className={`p-3 rounded-lg text-left border transition-all ${
                  isSelected
                    ? 'bg-indigo-950/30 border-indigo-500/50 text-white ring-1 ring-indigo-500/30'
                    : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">{p.label}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">{p.description}</p>
                <div className="mt-2 flex items-center space-x-2 text-[10px] text-zinc-500 font-mono">
                  <span>{p.jobs} Trabajos</span>
                  <span>&bull;</span>
                  <span>{p.machines} Máquinas</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab: Upload */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 hover:border-indigo-500/60 rounded-xl p-6 text-center cursor-pointer transition-colors bg-zinc-950/30"
          >
            <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-zinc-200">
              Haz clic o arrastra un archivo <span className="font-mono text-indigo-400">.txt</span> aquí
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Formato estándar Taillard / OR-Library (primera línea: trabajos y máquinas)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Tab: Generator */}
      {activeTab === 'generator' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-zinc-400 block mb-1">Trabajos (N)</label>
              <input
                type="number"
                min="3"
                max="300"
                value={genJobs}
                onChange={(e) => setGenJobs(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Máquinas (M)</label>
              <input
                type="number"
                min="2"
                max="50"
                value={genMachines}
                onChange={(e) => setGenMachines(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Tiempo Mín</label>
              <input
                type="number"
                min="1"
                value={genMinTime}
                onChange={(e) => setGenMinTime(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Tiempo Máx</label>
              <input
                type="number"
                min="2"
                max="999"
                value={genMaxTime}
                onChange={(e) => setGenMaxTime(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-white font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={disabled}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Generar Nueva Instancia Aleatoria</span>
          </button>
        </div>
      )}

      {/* Errors display */}
      {uploadError && (
        <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
          {uploadError}
        </div>
      )}

      {/* Current Instance Summary Footer */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800/60 text-zinc-400">
        <div className="flex items-center space-x-2">
          <FileText className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-zinc-300 font-medium">{currentInstance.name}</span>
          <span className="font-mono text-zinc-500">
            ({currentInstance.numJobs} &times; {currentInstance.numMachines})
          </span>
        </div>
        <button
          onClick={handleDownloadInstance}
          className="text-indigo-400 hover:text-indigo-300 text-[11px] underline underline-offset-2"
        >
          Descargar .txt
        </button>
      </div>
    </div>
  );
};
