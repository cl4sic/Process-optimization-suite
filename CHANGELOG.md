# Changelog

All notable changes to the **Process Optimization Suite** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-11-23

### Added
- **Modern Web Dashboard:** Full React 19 + Vite 6 + TypeScript + Tailwind CSS 4 web application.
- **Web Worker Engine:** Background optimization worker (`web/src/core/worker.ts`) with throttled progress streaming (~30fps) for non-blocking execution.
- **Interactive SVG Gantt Chart:**
  - Machine timeline with machine utilization rate metrics.
  - Golden-angle HSL deterministic color palette per job.
  - Hover tooltips showing Job ID, Machine ID, start/end times, durations, and idle gaps.
  - Zoom controls (30% to 600%) and horizontal scroll for large datasets.
  - Job isolation mode (highlighting a single job across all machines).
- **Real-time Convergence Charts:** Live Makespan vs Iteration/Generation line charts powered by Recharts.
- **Tournament Mode:** Multi-algorithm benchmark runner comparing Random Search, Local Search (Best/First), Simulated Annealing, and Genetic Algorithm side-by-side.
- **Dataset Manager:**
  - Preloaded benchmarks (`datos_5_2.txt`, `ta001_20_5.txt`, `instancia_200_20.txt`).
  - Drag-and-drop custom `.txt` file uploader.
  - In-browser synthetic instance generator.
- **CI/CD:** Automated GitHub Actions workflow (`.github/workflows/deploy.yml`) deploying to GitHub Pages on push to `main`.
- **Engineering Guidelines & Skills:**
  - `AGENTS.md` specifying repository architecture, design aesthetic, and coding rules.
  - `MEMORY.md` documenting mathematical formulation and metaheuristic inventory.
  - Custom skills: `flow-shop-solver` and `web-worker-runner`.

### Changed
- Reorganized C++ native engine into `cpp/` folder with `Makefile`, `src/`, `data/`, and dedicated `README.md`.
- Converted repository into a decoupled hybrid architecture (C++ CLI + Web App).

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
