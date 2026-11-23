# Permutation Flow Shop Scheduler (C++ Engine)

Motor nativo de alto rendimiento para la resolución del **Permutation Flow Shop Scheduling Problem (PFSP)** mediante metaheurísticas de optimización combinatoria.

---

## 1. Algoritmos Implementados

1. **Búsqueda Aleatoria Pura:** Muestreo uniforme de permutaciones.
2. **Búsqueda Local (El Mejor Vecino):** Exploración completa del vecindario 2-opt adoptando la mejor mejora.
3. **Búsqueda Local (El Primer Mejor Vecino):** Exploración del vecindario 2-opt adoptando la primera mejora encontrada.
4. **Recocido Simulado (Simulated Annealing):** Enfriamiento geométrico con criterio de Metropolis ($T_0 = 0.4 \cdot C_{\max}$, $\alpha = 0.95$) y pulido local post-proceso.
5. **Algoritmo Genético:** Población de 80 individuos, selección por torneo binario, cruce de orden (Order Crossover - OX), mutación por intercambio (swap) y elitismo.

---

## 2. Compilación

Requiere un compilador C++ con soporte para **C++17** (`g++` o `clang++`).

```bash
cd cpp
make
```

Esto generará dos binarios en la carpeta `cpp/bin/`:
- `flow_shop_optimizer`: Optimizador interactivo CLI.
- `generador_datos`: Generador de instancias sintéticas aleatorias.

---

## 3. Uso

Ejecuta el optimizador pasando la ruta de la instancia deseada:

```bash
./bin/flow_shop_optimizer data/datos.txt
# O para la instancia grande:
./bin/flow_shop_optimizer data/instancia_200_20.txt
```

### Formato de Entrada de Instancias
El archivo `.txt` debe estructurarse así:
- **Línea 1:** `<número_de_trabajos> <número_de_máquinas>`
- **Siguientes líneas:** Para cada trabajo, la secuencia de pares `id_máquina tiempo_procesamiento`.

Ejemplo (`5` trabajos y `2` máquinas):
```text
5 2
0 5 1 3
0 2 1 7
0 9 1 1
0 0 1 6
0 8 1 4
```
