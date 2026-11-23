# Project Memory: Process Optimization Suite

## Overview
This document stores persistent institutional knowledge, architectural decisions, mathematical foundations, and technical context for the Process Optimization Suite.

---

## 1. Domain Knowledge & Problem Definition

### Permutation Flow Shop Scheduling Problem (PFSP)
- **Jobs:** $J = \{0, 1, \dots, n-1\}$
- **Machines:** $M = \{0, 1, \dots, m-1\}$
- **Processing Time:** $p(i, j)$ is the processing time of job $i$ on machine $j$.
- **Permutation Constraint:** The processing order of jobs is identical across all machines. A solution is a permutation $\pi = (\pi_1, \pi_2, \dots, \pi_n)$ of jobs.
- **Completion Times $C(\pi_i, j)$:**
  $$C(\pi_1, 0) = p(\pi_1, 0)$$
  $$C(\pi_1, j) = C(\pi_1, j-1) + p(\pi_1, j) \quad \forall j \in \{1, \dots, m-1\}$$
  $$C(\pi_i, 0) = C(\pi_{i-1}, 0) + p(\pi_i, 0) \quad \forall i \in \{1, \dots, n-1\}$$
  $$C(\pi_i, j) = \max\{C(\pi_i, j-1), C(\pi_{i-1}, j)\} + p(\pi_i, j)$$
- **Objective (Makespan):**
  $$C_{\max}(\pi) = C(\pi_{n-1}, m-1)$$

### Input Data Format (Standard Taillard / OR-Library Format)
Line 1: `<num_trabajos> <num_maquinas>`
Next $n$ lines (one per job):
`<machine_0_id> <time_0> <machine_1_id> <time_1> ... <machine_m-1_id> <time_m-1>`

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

## 2. Metaheuristics Inventory

| Algorithm | Method Details | Key Hyperparameters |
| :--- | :--- | :--- |
| **Random Search** | Evaluates $k$ uniformly random permutations; tracks best makespan. | `iterations` |
| **Local Search (Best Neighbor)** | Full 2-opt neighborhood swap exploration; greedily adopts best neighbor until local minimum. | Neighborhood: $O(n^2)$ swaps per step |
| **Local Search (First Best)** | 2-opt neighborhood swap exploration; immediately adopts first improving neighbor found. | First improvement |
| **Simulated Annealing** | Starts at $T_0 = 0.4 \times C_{\max}(s_0)$, geometric cooling $T \leftarrow \alpha \cdot T$ ($\alpha = 0.95$), accept worse with $P = e^{-\Delta / T}$, polished with local search. | $L$ (iter/temp), $\alpha$, $T_f = 0.01$ |
| **Genetic Algorithm** | Population size 80, Tournament selection (size 2), Order Crossover (OX) with $P_{\text{cross}} = 0.85$, swap mutation ($P_{\text{mut}} = 0.20$), 3 elite individuals preserved, stopping by max generations or consecutive generations without improvement. | Population size, generations, stall limit |
| **Local Polish** | 2-opt swap search limited to 20 passes to clean up heuristic solutions. | `max_pasos = 20` |

---

## 3. Key Design Decisions

- **Web Stack Selection:** React 19 / 18 + Vite + TypeScript + Tailwind CSS.
  - *Rationale:* Maximum accuracy with generative AI, modular component ecosystem, zero-config GitHub Pages export.
- **Client-Side Execution (TypeScript Web Worker):**
  - *Rationale:* Zero server hosting cost, infinite uptime, privacy (data never leaves user browser), and real-time streaming capability.
- **Decoupled Architecture:**
  - `cpp/` houses the original CLI implementation for academic/benchmark C++ users.
  - `web/` provides the modern visual interface for showcase on GitHub and web demonstrations.
- **GitHub Actions Auto-Deployment:**
  - Automated build and publication to GitHub Pages on every push to `main`.
