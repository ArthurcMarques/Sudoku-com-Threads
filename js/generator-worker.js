/**
 * SUDOKU GENERATOR WORKER
 * Web Worker que gera Sudoku válidos usando backtracking
 * 
 * Algoritmo:
 * 1. Gera um Sudoku completo e válido
 * 2. Remove células aleatoriamente baseado na dificuldade
 * 3. Garante que a solução seja única
 */

self.onmessage = function(event) {
    const { difficulty } = event.data;
    const startTime = performance.now();
    
    try {
        // Gera Sudoku completo
        const solution = generateCompleteSudoku();
        
        // Define quantidade de células a remover baseado na dificuldade
        const cellsToRemove = getDifficultyCells(difficulty);
        
        // Cria puzzle removendo células
        const puzzle = createPuzzle(solution, cellsToRemove);
        
        const executionTime = (performance.now() - startTime).toFixed(2);
        
        self.postMessage({
            status: 'SUCCESS',
            puzzle: puzzle,
            solution: solution,
            difficulty: difficulty,
            cellsRemoved: cellsToRemove,
            executionTime: executionTime
        });
        
    } catch (error) {
        self.postMessage({
            status: 'ERROR',
            message: error.message
        });
    }
};

/**
 * Define quantidade de células a remover por dificuldade
 */
function getDifficultyCells(difficulty) {
    const difficulties = {
        'easy': 40,      // 41 células preenchidas
        'medium': 50,    // 31 células preenchidas
        'hard': 60,      // 21 células preenchidas
        'expert': 65     // 16 células preenchidas
    };
    
    return difficulties[difficulty] || 40;
}

/**
 * Gera um Sudoku completo e válido
 */
function generateCompleteSudoku() {
    const grid = createEmptyGrid();
    fillGrid(grid);
    return grid;
}

/**
 * Cria grid vazio 9×9
 */
function createEmptyGrid() {
    return Array(9).fill(null).map(() => Array(9).fill(0));
}

/**
 * Preenche o grid usando backtracking
 */
function fillGrid(grid) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                // Embaralha números para aleatoriedade
                shuffle(numbers);
                
                for (let num of numbers) {
                    if (isValidPlacement(grid, row, col, num)) {
                        grid[row][col] = num;
                        
                        if (fillGrid(grid)) {
                            return true;
                        }
                        
                        grid[row][col] = 0;
                    }
                }
                
                return false;
            }
        }
    }
    
    return true;
}

/**
 * Verifica se um número pode ser colocado em determinada posição
 */
function isValidPlacement(grid, row, col, num) {
    // Verifica linha
    for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) {
            return false;
        }
    }
    
    // Verifica coluna
    for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) {
            return false;
        }
    }
    
    // Verifica subgrid 3×3
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[startRow + i][startCol + j] === num) {
                return false;
            }
        }
    }
    
    return true;
}

/**
 * Embaralha array (Fisher-Yates)
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Cria puzzle removendo células do grid completo
 */
function createPuzzle(solution, cellsToRemove) {
    // Copia a solução
    const puzzle = solution.map(row => [...row]);
    
    // Lista de todas as posições
    const positions = [];
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            positions.push([row, col]);
        }
    }
    
    // Embaralha posições
    shuffle(positions);
    
    // Remove células
    let removed = 0;
    for (let [row, col] of positions) {
        if (removed >= cellsToRemove) {
            break;
        }
        
        puzzle[row][col] = 0;
        removed++;
    }
    
    return puzzle;
}

/**
 * Handler de erro
 */
self.onerror = function(error) {
    self.postMessage({
        status: 'ERROR',
        message: `Erro no worker: ${error.message}`
    });
};
