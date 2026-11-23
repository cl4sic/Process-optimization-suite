# Changelog

All notable changes to the **Process Optimization Suite** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- **Web Interface:** Interactive React + Vite + TypeScript dashboard deployed to GitHub Pages.
- **Web Worker Engine:** Ported PFSP algorithms (Random Search, Local Search, Simulated Annealing, Genetic Algorithm) with real-time streaming.
- **Visualizations:** Interactive Gantt chart (SVG-based) and live convergence curve (Recharts).
- **Benchmark Suite:** Multi-algorithm tournament comparator mode.
- **CI/CD:** Automated GitHub Actions workflow to build and deploy to GitHub Pages.

---

## [0.1.0] - 2026-11-18

### Added
- Initial C++ implementation of Permutation Flow Shop Scheduling optimizer (`cod-flow-shop-perm.cpp`).
- Evaluation engine calculating Makespan ($C_{\max}$) and job completion matrices.
- Metaheuristic algorithms in C++:
  - Pure Random Search.
  - Local Search (Best Neighbor).
  - Local Search (First Best Neighbor).
  - Simulated Annealing with geometric cooling and local polishing.
  - Genetic Algorithm with Order Crossover (OX), tournament selection, elitism, and swap mutation.
- Synthetic dataset generator (`generador_datos.cpp`).
- Sample problem instances: `datos.txt` (5x2) and `instancia_200_20.txt` (200x20).
