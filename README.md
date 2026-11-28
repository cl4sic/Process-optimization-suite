# Process Optimization Suite (PFSP)

> Modern, high-performance optimization suite for the **Permutation Flow Shop Scheduling Problem (PFSP)**. Built with a native **C++17** core and an interactive **React + TypeScript** web dashboard running background **Web Workers** for real-time visualization without UI blocking.

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-6366f1?style=for-the-badge&logo=github)](https://cl4sic.github.io/Process-optimization-suite/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![C++17](https://img.shields.io/badge/C++-17-00599c?style=flat-square&logo=c%2B%2B)](https://en.cppreference.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---
## Use it online!

| Main View | Results & Analysis |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/163338c7-9741-4746-900d-418f2d3d1a2f" width="100%" alt="Main View" /> | <img src="https://github.com/user-attachments/assets/723de038-7ad8-4823-8f07-7805d3383ac9" width="100%" alt="Results and Analysis" /> |

> 🚀 **Try the live demo here:** [cl4sic.github.io/Process-optimization-suite](https://cl4sic.github.io/Process-optimization-suite/)

## Problem Overview

The **Permutation Flow Shop Scheduling Problem (PFSP)** is a classic $\mathcal{NP}$-hard combinatorial optimization problem widely studied in industrial engineering and operations research:
- **Given:** $n$ jobs must be processed through $m$ machines in the identical technological sequence ($M_0 \rightarrow M_1 \rightarrow \dots \rightarrow M_{m-1}$).
- **Constraints:**
  1. Each machine can process at most one job at a time.
  2. Each job can only be processed on one machine at a time (no preemption).
  3. The processing sequence of jobs is identical across all machines (permutation schedule).
- **Objective:** Minimize the **Makespan** ($C_{\max}$), defined as the completion time of the last job on the final machine:
  $$C_{\max}(\pi) = C(\pi_n, M_m)$$

---

## Implemented Metaheuristics

| Algorithm | Paradigm | Key Characteristics |
| :--- | :--- | :--- |
| **Pure Random Search** | Stochastic Baseline | Uniform random permutation generation with best-so-far preservation. |
| **Local Search (Best Neighbor)** | Greedy Local Descent | Complete $O(n^2)$ 2-opt swap neighborhood exploration, adopting the best improving move. |
| **Local Search (First Best)** | Fast Local Descent | Evaluates 2-opt swaps and immediately moves to the first improving neighbor found. |
| **Simulated Annealing (SA)** | Thermodynamic Metaheuristic | Geometric cooling ($T_{k+1} = \alpha \cdot T_k$), Metropolis acceptance criterion for uphill moves ($e^{-\Delta / T}$), and bounded local polish. |
| **Genetic Algorithm (GA)** | Evolutionary Algorithm | Binary tournament selection, Order Crossover (OX), swap mutation, elite preservation ($k=3$), and automatic stall detection. |

---

## Key Features

### Interactive Web Dashboard
- **100% Client-Side Web Worker:** Heavy optimization loops run in a separate background thread (`worker.ts`) with throttled progress streaming (~30fps) ensuring silky 60fps UI responsiveness.
- **Dynamic SVG Gantt Chart:**
  - Machine rows with real-time utilization percentages.
  - Golden-angle HSL deterministic color palette per job.
  - Hover tooltips displaying Job ID, Machine ID, start time, end time, duration, and idle gaps.
  - Interactive job isolation (click to highlight a job across all machines).
  - Horizontal zoom (30% to 600%) and pan controls for massive instances (up to 200 jobs).
- **Real-Time Convergence Plots:** Live Recharts visualization showing makespan reduction over iterations and generations.
- **Multi-Algorithm Tournament Mode:** One-click benchmark running all 5 algorithms sequentially to compare makespan, improvement percentage, and runtime side-by-side.
- **Dataset Manager:**
  - Built-in benchmarks: *Mini Test (5×2)*, *Taillard Ta001 (20×5)*, and *Industrial Scale (200×20)*.
  - Drag & Drop custom `.txt` files in standard Taillard / OR-Library format.
  - Synthetic instance generator with customizable job/machine dimensions and processing time intervals.

### Native C++ CLI Engine
- Zero-dependency C++17 implementation for academic benchmarking or headless execution.
- Optimized with `-O3` compilation flags via a standard `Makefile`.

---

## Repository Structure

```text
Process-optimization-suite/
├── .agents/
│   └── skills/                 # Domain skills for AI agents (flow-shop, web-worker)
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated CI/CD to GitHub Pages
├── cpp/                        # High-performance C++ CLI
│   ├── src/
│   │   ├── cod-flow-shop-perm.cpp
│   │   └── generador_datos.cpp
│   ├── data/
│   │   ├── datos.txt
│   │   └── instancia_200_20.txt
│   ├── Makefile
│   └── README.md
├── web/                        # React + Vite + TypeScript Web Application
│   ├── public/datasets/        # Preloaded instances (.txt)
│   ├── src/
│   │   ├── core/               # Pure TS optimization engine & Web Worker
│   │   │   ├── algorithms/     # Metaheuristics (Random, Local, SA, GA)
│   │   │   ├── evaluator.ts    # Makespan and Gantt schedule matrices
│   │   │   ├── parser.ts       # Taillard format parser & serializer
│   │   │   ├── generator.ts    # Synthetic instance generator
│   │   │   ├── types.ts        # Strict TypeScript domain interfaces
│   │   │   └── worker.ts       # Web Worker thread executor
│   │   ├── components/         # Modern UI (Gantt, Charts, Benchmark, Presets)
│   │   ├── hooks/              # useOptimizationWorker custom hook
│   │   └── App.tsx
│   └── vite.config.ts
├── AGENTS.md                   # Engineering standards and agent guidelines
├── MEMORY.md                   # Technical memory and mathematical formulation
├── CHANGELOG.md                # Chronological version history
└── README.md                   # This documentation
```

---

## Quick Start

### 1. Web Application (Local Development)

```bash
# Navigate to web directory
cd web

# Install dependencies (npm, pnpm, or yarn)
pnpm install

# Start local development server
pnpm run dev
```

Visit `http://localhost:3000` to interact with the dashboard.

### 2. Native C++ Engine (CLI)

```bash
# Compile with standard Makefile
cd cpp
make

# Run optimizer on sample data
./bin/flow_shop_optimizer data/datos.txt

# Or run on large 200x20 instance
./bin/flow_shop_optimizer data/instancia_200_20.txt
```

---

## Dataset Format

Instance files follow the standard **Taillard / OR-Library** format:
```text
<num_jobs> <num_machines>
<machine_0> <time_0> <machine_1> <time_1> ... <machine_m-1> <time_m-1>
... (repeated for each of the n jobs)
```

Example (5 jobs, 2 machines):
```text
5 2
0 5 1 3
0 2 1 7
0 9 1 1
0 0 1 6
0 8 1 4
```

---

## License

This project is licensed under the **MIT License**.
