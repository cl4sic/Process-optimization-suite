#include <algorithm>
#include <cmath>
#include <cstdlib>
#include <ctime>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>

using namespace std;

// ==========================================
// 1. VARIABLES GLOBALES Y ESTRUCTURAS
// ==========================================

struct Individuo {
  vector<int> orden;
  int fitness;
};

int num_trabajos = 0;
int num_maquinas = 0;
int num_iteraciones = 0;
vector<vector<int>> tiempos;

// Función auxiliar para mezclar un vector usando rand()
void desordenar_vector(vector<int> &v) {
  for (int i = v.size() - 1; i > 0; i--) {
    int j = rand() % (i + 1);
    swap(v[i], v[j]);
  }
}

// ==========================================
// 2. MÓDULO DE CARGA DE DATOS
// ==========================================
bool cargar_datos(const string &nombre_archivo) {
  ifstream archivo(nombre_archivo);
  if (!archivo.is_open()) {
    cerr << "[!] Error al abrir el archivo: " << nombre_archivo << "\n";
    return false;
  }

  if (!(archivo >> num_trabajos >> num_maquinas)) {
    cerr << "[!] Error al leer las dimensiones del archivo.\n";
    return false;
  }

  tiempos.assign(num_trabajos, vector<int>(num_maquinas, 0));

  for (int i = 0; i < num_trabajos; i++) {
    for (int j = 0; j < num_maquinas; j++) {
      int id_maquina, tiempo;
      archivo >> id_maquina >> tiempo;
      tiempos[i][id_maquina] = tiempo;
    }
  }

  archivo.close();
  return true;
}

// ==========================================
// 3. MOTOR DE EVALUACIÓN
// ==========================================
int calcular_makespan(const vector<int> &orden) {
  if (num_trabajos == 0 || num_maquinas == 0)
    return 0;

  vector<vector<int>> fin(num_trabajos, vector<int>(num_maquinas, 0));
  int primer = orden[0];
  fin[0][0] = tiempos[primer][0];

  for (int j = 1; j < num_maquinas; j++) {
    fin[0][j] = fin[0][j - 1] + tiempos[primer][j];
  }
  for (int i = 1; i < num_trabajos; i++) {
    int actual = orden[i];
    fin[i][0] = fin[i - 1][0] + tiempos[actual][0];
  }
  for (int i = 1; i < num_trabajos; i++) {
    int actual = orden[i];
    for (int j = 1; j < num_maquinas; j++) {
      int max_anterior =
          (fin[i][j - 1] > fin[i - 1][j]) ? fin[i][j - 1] : fin[i - 1][j];
      fin[i][j] = max_anterior + tiempos[actual][j];
    }
  }
  return fin[num_trabajos - 1][num_maquinas - 1];
}

// Se recibe const & para evitar copiar innecesariamente
vector<int> generar_vecino(const vector<int> &s) {
  vector<int> vecino = s;
  int i = rand() % vecino.size();
  int j = rand() % vecino.size();

  while (i == j) {
    j = rand() % vecino.size();
  }

  swap(vecino[i], vecino[j]);
  return vecino;
}

// Búsqueda local acotada para pulir la solución
vector<int> pulir_solucion(vector<int> s, int max_pasos = 20) {
  int n = s.size();
  int q_actual = calcular_makespan(s);
  int pasos = 0;
  bool mejora = true;

  while (mejora && pasos < max_pasos) {
    mejora = false;
    for (int i = 0; i < n - 1; i++) {
      for (int j = i + 1; j < n; j++) {
        swap(s[i], s[j]);
        int q_nuevo = calcular_makespan(s);

        if (q_nuevo < q_actual) {
          q_actual = q_nuevo;
          mejora = true;
          break;
        } else {
          swap(s[i], s[j]);
        }
      }
      if (mejora)
        break;
    }
    pasos++;
  }
  return s;
}

// ==========================================
// 4. MÓDULOS DE ALGORITMOS
// ==========================================

// ALGORITMO 1: Búsqueda Aleatoria Pura
vector<int> algoritmo_busqueda_aleatoria(int iteraciones) {
  cout << "\n[*] Ejecutando Búsqueda Aleatoria Pura (" << iteraciones
       << " iteraciones)...\n";

  vector<int> best(num_trabajos);
  for (int i = 0; i < num_trabajos; i++) {
    best[i] = i;
  }
  desordenar_vector(best);

  int quality_best = calcular_makespan(best);

  for (int i = 0; i < iteraciones; i++) {
    vector<int> S = best;
    desordenar_vector(S);
    int quality_S = calcular_makespan(S);

    if (quality_S < quality_best) {
      quality_best = quality_S;
      best = S;
    }
  }
  return best;
}

// ALGORITMO 2A: Búsqueda Local del Mejor
vector<int> algoritmo_local_mejor() {
  cout << "\n[*] Ejecutando Búsqueda Local (El Mejor Vecino)...\n";

  vector<int> s(num_trabajos);
  for (int i = 0; i < num_trabajos; i++) {
    s[i] = i;
  }
  desordenar_vector(s);

  int quality_s = calcular_makespan(s);
  bool improvement = true;

  while (improvement) {
    improvement = false;
    vector<int> best_s_prime = s;
    int quality_best_prime = quality_s;

    for (int i = 0; i < num_trabajos - 1; i++) {
      for (int j = i + 1; j < num_trabajos; j++) {
        vector<int> s_prime = s;
        swap(s_prime[i], s_prime[j]);
        int quality_prime = calcular_makespan(s_prime);

        if (quality_prime < quality_best_prime) {
          quality_best_prime = quality_prime;
          best_s_prime = s_prime;
        }
      }
    }

    if (quality_best_prime < quality_s) {
      s = best_s_prime;
      quality_s = quality_best_prime;
      improvement = true;
    }
  }
  return s;
}

// ALGORITMO 2B: Búsqueda Local del Primer Mejor
vector<int> algoritmo_local_primer_mejor() {
  cout << "\n[*] Ejecutando Búsqueda Local (El Primer Mejor Vecino)...\n";

  vector<int> s(num_trabajos);
  for (int i = 0; i < num_trabajos; i++) {
    s[i] = i;
  }
  desordenar_vector(s);

  int quality_s = calcular_makespan(s);
  bool improvement = true;

  while (improvement) {
    improvement = false;

    for (int i = 0; i < num_trabajos - 1; i++) {
      for (int j = i + 1; j < num_trabajos; j++) {
        vector<int> s_prime = s;
        swap(s_prime[i], s_prime[j]);
        int quality_prime = calcular_makespan(s_prime);

        if (quality_prime < quality_s) {
          s = s_prime;
          quality_s = quality_prime;
          improvement = true;
          break;
        }
      }
      if (improvement)
        break;
    }
  }
  return s;
}

// ALGORITMO 3: Recocido Simulado
vector<int> algoritmo_sa() {
  int L = 0;
  cout << "\n Introduce el numero de iteraciones que deseas por "
          "temperatura(L): ";
  if (!(cin >> L) || L <= 0)
    return {};
  cout << "\n[*] Ejecutando recocido simulado\n";

  vector<int> s(num_trabajos);
  for (int i = 0; i < num_trabajos; i++) {
    s[i] = i;
  }
  desordenar_vector(s);

  int quality = calcular_makespan(s);
  vector<int> mejor_s = s;
  int mejor_quality = quality;

  float temp_0 = float(quality) * 0.4;
  float temp_f = 0.01;
  float temp_actual = temp_0;
  float alfa = 0.95;

  while (temp_actual > temp_f) {
    for (int i = 0; i < L; i++) {
      vector<int> vecino = generar_vecino(s);
      int quality_vecino = calcular_makespan(vecino);
      int delta = quality_vecino - quality;

      if (delta < 0) {
        s = vecino;
        quality = quality_vecino;

        if (quality < mejor_quality) {
          mejor_quality = quality;
          mejor_s = s;
        }
      } else {
        double limite = exp(-delta / temp_actual);
        double r = (double)rand() / RAND_MAX;

        if (r < limite) {
          s = vecino;
          quality = quality_vecino;
        }
      }
    }
    temp_actual *= alfa;
  }
  cout << "[*] Aplicando pulido local...\n";

  mejor_s = pulir_solucion(mejor_s, 20);
  return mejor_s;
}

// ALGORITMO 4: Algoritmo Genético

vector<int> cruce_OX(const vector<int> &p1, const vector<int> &p2) {
  int n = p1.size();
  vector<int> hijo(n, -1);
  vector<bool> usado(n, false);

  int c1 = rand() % n;
  int c2 = rand() % n;
  if (c1 > c2)
    swap(c1, c2);

  for (int i = c1; i <= c2; i++) {
    hijo[i] = p1[i];
    usado[p1[i]] = true;
  }

  int pos_hijo = (c2 + 1) % n;
  for (int i = 0; i < n; i++) {
    int idx_p2 = (c2 + 1 + i) % n;
    int gen = p2[idx_p2];
    if (!usado[gen]) {
      hijo[pos_hijo] = gen;
      pos_hijo = (pos_hijo + 1) % n;
    }
  }
  return hijo;
}

// Referencia constante a la población
Individuo seleccion_torneo(const vector<Individuo> &poblacion) {
  int i1 = rand() % poblacion.size();
  int i2 = rand() % poblacion.size();

  return (poblacion[i1].fitness < poblacion[i2].fitness) ? poblacion[i1]
                                                         : poblacion[i2];
}

vector<int> algoritmo_ga() {
  int tipo_parada = 1;
  int max_gen = 100;
  cout << "Selecciona criterio de parada:\n";
  cout << "1. Número de generaciones fijo\n";
  cout << "2. Parar tras generaciones consecutivas sin mejora\n";
  cout << "Opción: ";
  cin >> tipo_parada;

  int limite_sin_mejora = 25;
  if (tipo_parada == 1) {
    cout << "Introduce el número de generaciones: ";
    cin >> max_gen;
  } else {
    cout << "Introduce el número de generaciones sin mejora para parar: ";
    cin >> limite_sin_mejora;
    max_gen = 20000;
  }

  const int TAM_POBLACION = 80;
  const float PROB_CRUCE = 0.85; // Probabilidad de cruce estandar, el resto se
                                 // elige uno de los progenitores y se clona
  const float PROB_MUTACION = 0.20; // Probabilidad de mutación
  const int NUM_ELITES = 3;
  const int NUM_HIJOS = TAM_POBLACION - NUM_ELITES;

  // 1. Inicialización de la población
  vector<Individuo> poblacion(TAM_POBLACION);
  for (int i = 0; i < TAM_POBLACION; i++) {
    poblacion[i].orden.resize(num_trabajos);
    for (int j = 0; j < num_trabajos; j++) {
      poblacion[i].orden[j] = j;
    }
    desordenar_vector(poblacion[i].orden);
    poblacion[i].fitness = calcular_makespan(poblacion[i].orden);
  }

  sort(poblacion.begin(), poblacion.end(),
       [](const Individuo &a, const Individuo &b) {
         return a.fitness < b.fitness;
       });

  Individuo mejor_global = poblacion[0];
  int generaciones_sin_mejora = 0;
  int generacion = 0;

  while (generacion < max_gen) {
    generacion++;

    vector<Individuo> nueva_poblacion;
    nueva_poblacion.reserve(TAM_POBLACION);

    // Elitismo: los 3 mejores pasan intactos
    for (int i = 0; i < NUM_ELITES; i++) {
      nueva_poblacion.push_back(poblacion[i]);
    }

    // 2. Reproducción: selección, cruce probabilístico y mutación
    for (int i = 0; i < NUM_HIJOS; i++) {
      Individuo p1 = seleccion_torneo(poblacion);
      Individuo p2 = seleccion_torneo(poblacion);

      Individuo hijo;
      float r_cruce = (float)rand() / RAND_MAX;
      if (r_cruce < PROB_CRUCE) {
        hijo.orden = cruce_OX(p1.orden, p2.orden);
      } else {
        hijo.orden = p1.orden; // Clona a uno de los padres si no cruza
      }

      // Mutación
      float r_mut = (float)rand() / RAND_MAX;
      if (r_mut < PROB_MUTACION) {
        hijo.orden = generar_vecino(hijo.orden);
      }

      hijo.fitness = calcular_makespan(hijo.orden);
      nueva_poblacion.push_back(hijo);
    }

    poblacion = nueva_poblacion;

    sort(poblacion.begin(), poblacion.end(),
         [](const Individuo &a, const Individuo &b) {
           return a.fitness < b.fitness;
         });

    if (poblacion[0].fitness < mejor_global.fitness) {
      mejor_global = poblacion[0];
      generaciones_sin_mejora = 0;
    } else {
      generaciones_sin_mejora++;
    }

    if (tipo_parada == 2 && generaciones_sin_mejora >= limite_sin_mejora) {
      cout << "[+] Parada alcanzada en la generación " << generacion << " tras "
           << limite_sin_mejora << " generaciones sin mejora.\n";
      break;
    }
  }

  cout << "[*] Algoritmo Genético finalizado tras " << generacion
       << " generaciones.\n";

  cout << "[*] Aplicando pulido local...\n";
  mejor_global.orden = pulir_solucion(mejor_global.orden, 20);

  return mejor_global.orden;
}

// ==========================================
// 5. CONTROLADOR PRINCIPAL (Menú)
// ==========================================
int main(int argc, char *argv[]) {
  srand(time(NULL));

  if (argc != 2) {
    cerr << "[!] Uso: " << argv[0] << " <Nombre del archivo>\n";
    return 1;
  }

  if (!cargar_datos(argv[1]))
    return 1;

  cout << "\n[+] Archivo procesado: " << num_trabajos << " trabajos, "
       << num_maquinas << " máquinas.\n";

  int opcion;
  cout << "\n=== OPTIMIZADOR FLOW SHOP ===\n";
  cout << "1. Búsqueda Aleatoria Pura\n";
  cout << "2. Búsqueda Local (Mejor Vecino)\n";
  cout << "3. Búsqueda Local (Primer Mejor Vecino)\n";
  cout << "4. Recocido Simulado\n";
  cout << "5. Algoritmo Genético\n";
  cout << "Elige un algoritmo: ";

  if (!(cin >> opcion)) {
    cout << "[!] Entrada no válida.\n";
    return 1;
  }

  vector<int> solucion;

  switch (opcion) {
  case 1:
    cout << "\n¿Qué número de iteraciones deseas?: ";
    cin >> num_iteraciones;
    solucion = algoritmo_busqueda_aleatoria(num_iteraciones);
    break;
  case 2:
    solucion = algoritmo_local_mejor();
    break;
  case 3:
    solucion = algoritmo_local_primer_mejor();
    break;
  case 4:
    solucion = algoritmo_sa();
    break;
  case 5:
    solucion = algoritmo_ga();
    break;
  default:
    cout << "[!] Opción no válida.\n";
    return 1;
  }

  int makespan = calcular_makespan(solucion);

  cout << "\n=== RESULTADO FINAL ===\n";
  cout << "Mejor orden encontrado: ";
  for (int j : solucion) {
    cout << (j + 1) << " ";
  }
  cout << "\nTiempo total (Makespan): " << makespan << "\n\n";

  return 0;
}
