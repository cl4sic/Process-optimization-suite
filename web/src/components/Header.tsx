import React from 'react';
import { Cpu, Github } from 'lucide-react';

interface HeaderProps {
  isRunning: boolean;
  workerReady: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isRunning, workerReady }) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-400 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                Process Optimization Suite
              </h1>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PFSP
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Permutation Flow Shop Scheduling &bull; Metaheuristics Engine
            </p>
          </div>
        </div>

        {/* Status Indicators & Links */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isRunning
                  ? 'bg-amber-400 animate-pulse'
                  : workerReady
                  ? 'bg-emerald-400'
                  : 'bg-zinc-500'
              }`}
            />
            <span className="text-zinc-300">
              {isRunning
                ? 'Optimizando en hilo Worker...'
                : 'Web Worker activo (0% UI Block)'}
            </span>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors text-xs font-medium"
          >
            <Github className="w-4 h-4" />
            <span className="hidden md:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
