import { calculateMakespan } from '../evaluator';
import { ConvergencePoint, ProgressUpdate } from '../types';
import { generateNeighbor, polishSolution, shuffleArray } from './polish';

interface Individual {
  order: number[];
  fitness: number;
}

/**
 * Order Crossover (OX).
 * Matches exact logic of C++ cruce_OX.
 */
export function crossoverOX(p1: number[], p2: number[]): number[] {
  const n = p1.length;
  const child = new Array<number>(n).fill(-1);
  const used = new Array<boolean>(n).fill(false);

  let c1 = Math.floor(Math.random() * n);
  let c2 = Math.floor(Math.random() * n);
  if (c1 > c2) {
    const temp = c1;
    c1 = c2;
    c2 = temp;
  }

  // Copy segment from parent 1
  for (let i = c1; i <= c2; i++) {
    child[i] = p1[i];
    used[p1[i]] = true;
  }

  // Fill remainder from parent 2
  let posChild = (c2 + 1) % n;
  for (let i = 0; i < n; i++) {
    const idxP2 = (c2 + 1 + i) % n;
    const gene = p2[idxP2];
    if (!used[gene]) {
      child[posChild] = gene;
      posChild = (posChild + 1) % n;
    }
  }

  return child;
}

/**
 * Binary Tournament Selection.
 * Matches C++ seleccion_torneo.
 */
function tournamentSelection(population: Individual[]): Individual {
  const i1 = Math.floor(Math.random() * population.length);
  const i2 = Math.floor(Math.random() * population.length);
  return population[i1].fitness < population[i2].fitness
    ? population[i1]
    : population[i2];
}

/**
 * Genetic Algorithm for PFSP.
 * Matches C++ algoritmo_ga.
 */
export function runGeneticAlgorithm(
  numJobs: number,
  times: number[][],
  options: {
    populationSize?: number;
    crossoverProb?: number;
    mutationProb?: number;
    maxGenerations?: number;
    stallLimit?: number;
    stopCriterion?: 'generations' | 'stall';
    polishSteps?: number;
  } = {},
  onProgress?: (update: ProgressUpdate) => void
): {
  bestOrder: number[];
  bestMakespan: number;
  initialMakespan: number;
  convergenceHistory: ConvergencePoint[];
  iterationsCount: number;
} {
  const populationSize = options.populationSize ?? 80;
  const crossoverProb = options.crossoverProb ?? 0.85;
  const mutationProb = options.mutationProb ?? 0.20;
  const numElites = 3;
  const numOffspring = populationSize - numElites;
  const stopCriterion = options.stopCriterion ?? 'stall';
  const maxGenerations = options.maxGenerations ?? (stopCriterion === 'generations' ? 100 : 500);
  const stallLimit = options.stallLimit ?? 25;
  const polishSteps = options.polishSteps ?? 20;

  // 1. Population Initialization
  const baseOrder = Array.from({ length: numJobs }, (_, i) => i);
  let population: Individual[] = Array.from({ length: populationSize }, () => {
    const order = shuffleArray(baseOrder);
    return {
      order,
      fitness: calculateMakespan(order, times),
    };
  });

  population.sort((a, b) => a.fitness - b.fitness);
  let globalBest: Individual = { ...population[0], order: [...population[0].order] };
  const initialMakespan = globalBest.fitness;

  const convergenceHistory: ConvergencePoint[] = [
    { iteration: 0, makespan: globalBest.fitness },
  ];

  let generationsWithoutImprovement = 0;
  let generation = 0;

  while (generation < maxGenerations) {
    generation++;

    const newPopulation: Individual[] = [];

    // Elitism: copy top individuals
    for (let i = 0; i < numElites; i++) {
      newPopulation.push(population[i]);
    }

    // Reproduction
    for (let i = 0; i < numOffspring; i++) {
      const p1 = tournamentSelection(population);
      const p2 = tournamentSelection(population);

      let childOrder: number[];
      if (Math.random() < crossoverProb) {
        childOrder = crossoverOX(p1.order, p2.order);
      } else {
        childOrder = [...p1.order];
      }

      // Mutation
      if (Math.random() < mutationProb) {
        childOrder = generateNeighbor(childOrder);
      }

      newPopulation.push({
        order: childOrder,
        fitness: calculateMakespan(childOrder, times),
      });
    }

    population = newPopulation;
    population.sort((a, b) => a.fitness - b.fitness);

    if (population[0].fitness < globalBest.fitness) {
      globalBest = { ...population[0], order: [...population[0].order] };
      generationsWithoutImprovement = 0;
    } else {
      generationsWithoutImprovement++;
    }

    convergenceHistory.push({
      iteration: generation,
      makespan: globalBest.fitness,
    });

    if (onProgress) {
      onProgress({
        iteration: generation,
        maxIterations: maxGenerations,
        currentMakespan: population[0].fitness,
        bestMakespan: globalBest.fitness,
        bestOrder: [...globalBest.order],
        generation,
      });
    }

    if (stopCriterion === 'stall' && generationsWithoutImprovement >= stallLimit) {
      break;
    }
  }

  // Local Polish
  let finalOrder = [...globalBest.order];
  if (polishSteps > 0) {
    finalOrder = polishSolution(finalOrder, times, polishSteps);
    const polishedFitness = calculateMakespan(finalOrder, times);
    if (polishedFitness < globalBest.fitness) {
      globalBest.fitness = polishedFitness;
      convergenceHistory.push({
        iteration: generation + 1,
        makespan: polishedFitness,
      });
    }
  }

  return {
    bestOrder: finalOrder,
    bestMakespan: globalBest.fitness,
    initialMakespan,
    convergenceHistory,
    iterationsCount: generation,
  };
}
