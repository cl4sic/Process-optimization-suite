CXX = g++
CXXFLAGS = -O3 -Wall -Wextra -std=c++17

BIN_DIR = bin
SRC_DIR = src
DATA_DIR = data

TARGET_OPTIMIZER = $(BIN_DIR)/flow_shop_optimizer
TARGET_GENERATOR = $(BIN_DIR)/generador_datos

.PHONY: all clean run-test

all: $(TARGET_OPTIMIZER) $(TARGET_GENERATOR)

$(BIN_DIR):
	mkdir -p $(BIN_DIR)

$(TARGET_OPTIMIZER): $(SRC_DIR)/cod-flow-shop-perm.cpp | $(BIN_DIR)
	$(CXX) $(CXXFLAGS) $< -o $@

$(TARGET_GENERATOR): $(SRC_DIR)/generador_datos.cpp | $(BIN_DIR)
	$(CXX) $(CXXFLAGS) $< -o $@

run-test: $(TARGET_OPTIMIZER)
	./$(TARGET_OPTIMIZER) $(DATA_DIR)/datos.txt

clean:
	rm -rf $(BIN_DIR)
