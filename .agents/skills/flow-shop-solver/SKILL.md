---
name: flow-shop-solver
description: >-
  Use this skill to inspect, run, test, or validate the Flow Shop Permutational
  Optimization algorithms, either in C++ (CLI) or TypeScript (Web core).
---

# Flow Shop Solver Skill

Use this skill whenever you need to:
1. Parse or validate a Flow Shop problem instance (.txt file).
2. Calculate the Makespan ($C_{\max}$) for a job sequence.
3. Compile or execute the C++ native optimizer.
4. Validate algorithmic correctness between C++ and TypeScript implementations.

---

## 1. File Format Reference

The standard instance format is:
```text
<num_trabajos> <num_maquinas>
<machine_0> <time_0> <machine_1> <time_1> ... <machine_m-1> <time_m-1>
... (repeated for each job)
```
- Total lines: $1 + n$
- All IDs are 0-indexed internally, but output solutions to humans are typically 1-indexed.

---

## 2. Compiling and Running the C++ CLI

### Compilation
```bash
# Inside cpp/
make
# Or directly:
g++ -O3 -Wall -Wextra -std=c++17 src/cod-flow-shop-perm.cpp -o flow_shop_optimizer
```

### Execution
```bash
./flow_shop_optimizer data/datos.txt
./flow_shop_optimizer data/instancia_200_20.txt
```

---

## 3. Algorithm Validation Logic

When testing or porting an algorithm to TypeScript:
- **Makespan Invariant:** For a given fixed permutation $\pi$, both C++ `calcular_makespan` and TypeScript `calculateMakespan` MUST produce the exact same integer value.
- **Order Crossover (OX) Invariant:** Offspring must be a valid permutation with no duplicate jobs and no omitted jobs.
- **Completion Matrix:** To draw the Gantt chart, record both `startTime[job][machine]` and `endTime[job][machine]`.
  - `startTime[job][machine] = max(endTime[prev_job][machine], endTime[job][prev_machine])`
  - `endTime[job][machine] = startTime[job][machine] + processingTime[job][machine]`
