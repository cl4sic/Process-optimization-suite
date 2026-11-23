#include <cstdlib>
#include <ctime>
#include <fstream>
#include <iostream>

using namespace std;

int main() {
  srand(time(NULL));

  const int NUM_TRABAJOS = 200;
  const int NUM_MAQUINAS = 20;
  const string NOMBRE_ARCHIVO = "instancia_200_20.txt";

  ofstream salida(NOMBRE_ARCHIVO);
  if (!salida.is_open()) {
    cerr << "Error al crear el archivo.\n";
    return 1;
  }

  // Cabecera: número de trabajos y máquinas
  salida << NUM_TRABAJOS << " " << NUM_MAQUINAS << "\n";

  // Generar cada trabajo con sus pares (id_maquina tiempo)
  for (int i = 0; i < NUM_TRABAJOS; i++) {
    for (int m = 0; m < NUM_MAQUINAS; m++) {
      int tiempo = (rand() % 99) + 1; // Tiempos entre 1 y 99
      salida << m << " " << tiempo;
      if (m < NUM_MAQUINAS - 1) {
        salida << " ";
      }
    }
    salida << "\n";
  }

  salida.close();
  cout << "Archivo '" << NOMBRE_ARCHIVO << "' generado correctamente.\n";
  return 0;
}
