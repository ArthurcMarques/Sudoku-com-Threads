/**
 * VALIDATOR WORKER
 * Web Worker que representa uma thread individual para validação de Sudoku
 * 
 * Este worker pode validar:
 * - Uma coluna específica
 * - Uma linha específica
 * - Um subgrid 3×3 específico
 */

// Processa mensagens recebidas da thread principal
self.onmessage = function(event) {
    const { type, data, threadId, grid } = event.data;
    
    // Registra início da execução
    const startTime = performance.now();
    
    let result = {
        threadId,
        type,
        valid: false,
        region: '',
        message: '',
        executionTime: 0
    };
    
    try {
        switch(type) {
            case 'VALIDATE_COLUMN':
                result = validateColumn(grid, data.columnIndex, threadId);
                break;
                
            case 'VALIDATE_ROW':
                result = validateRow(grid, data.rowIndex, threadId);
                break;
                
            case 'VALIDATE_SUBGRID':
                result = validateSubgrid(grid, data.startRow, data.startCol, threadId);
                break;
                
            default:
                throw new Error(`Tipo de validação desconhecido: ${type}`);
        }
        
        // Calcula tempo de execução
        result.executionTime = (performance.now() - startTime).toFixed(2);
        
        // Simula pequeno delay para visualizar melhor o paralelismo
        // Em produção, isso seria removido
        setTimeout(() => {
            self.postMessage({
                status: 'COMPLETED',
                result
            });
        }, Math.random() * 100 + 50);
        
    } catch (error) {
        self.postMessage({
            status: 'ERROR',
            result: {
                ...result,
                valid: false,
                message: `Erro: ${error.message}`,
                executionTime: (performance.now() - startTime).toFixed(2)
            }
        });
    }
};

/**
 * Valida uma coluna específica do Sudoku
 * Verifica se contém todos os dígitos de 1 a 9
 */
function validateColumn(grid, columnIndex, threadId) {
    const seen = new Set();
    const values = [];
    
    for (let row = 0; row < 9; row++) {
        const value = grid[row][columnIndex];
        values.push(value);
        
        // Validação: deve ser número entre 1 e 9
        if (value < 1 || value > 9) {
            return {
                threadId,
                type: 'VALIDATE_COLUMN',
                valid: false,
                region: `Coluna ${columnIndex + 1}`,
                message: `Valor inválido ${value} na posição [${row + 1}, ${columnIndex + 1}]`,
                values
            };
        }
        
        // Validação: não pode haver duplicatas
        if (seen.has(value)) {
            return {
                threadId,
                type: 'VALIDATE_COLUMN',
                valid: false,
                region: `Coluna ${columnIndex + 1}`,
                message: `Valor ${value} duplicado`,
                values
            };
        }
        
        seen.add(value);
    }
    
    // Se chegou aqui, a coluna é válida
    return {
        threadId,
        type: 'VALIDATE_COLUMN',
        valid: true,
        region: `Coluna ${columnIndex + 1}`,
        message: 'Válida - Contém todos os dígitos 1-9',
        values
    };
}

/**
 * Valida uma linha específica do Sudoku
 * Verifica se contém todos os dígitos de 1 a 9
 */
function validateRow(grid, rowIndex, threadId) {
    const seen = new Set();
    const values = [];
    
    for (let col = 0; col < 9; col++) {
        const value = grid[rowIndex][col];
        values.push(value);
        
        // Validação: deve ser número entre 1 e 9
        if (value < 1 || value > 9) {
            return {
                threadId,
                type: 'VALIDATE_ROW',
                valid: false,
                region: `Linha ${rowIndex + 1}`,
                message: `Valor inválido ${value} na posição [${rowIndex + 1}, ${col + 1}]`,
                values
            };
        }
        
        // Validação: não pode haver duplicatas
        if (seen.has(value)) {
            return {
                threadId,
                type: 'VALIDATE_ROW',
                valid: false,
                region: `Linha ${rowIndex + 1}`,
                message: `Valor ${value} duplicado`,
                values
            };
        }
        
        seen.add(value);
    }
    
    // Se chegou aqui, a linha é válida
    return {
        threadId,
        type: 'VALIDATE_ROW',
        valid: true,
        region: `Linha ${rowIndex + 1}`,
        message: 'Válida - Contém todos os dígitos 1-9',
        values
    };
}

/**
 * Valida um subgrid 3×3 específico do Sudoku
 * Verifica se contém todos os dígitos de 1 a 9
 */
function validateSubgrid(grid, startRow, startCol, threadId) {
    const seen = new Set();
    const values = [];
    const subgridNumber = getSubgridNumber(startRow, startCol);
    
    for (let row = startRow; row < startRow + 3; row++) {
        for (let col = startCol; col < startCol + 3; col++) {
            const value = grid[row][col];
            values.push(value);
            
            // Validação: deve ser número entre 1 e 9
            if (value < 1 || value > 9) {
                return {
                    threadId,
                    type: 'VALIDATE_SUBGRID',
                    valid: false,
                    region: `Subgrid ${subgridNumber}`,
                    message: `Valor inválido ${value} na posição [${row + 1}, ${col + 1}]`,
                    values
                };
            }
            
            // Validação: não pode haver duplicatas
            if (seen.has(value)) {
                return {
                    threadId,
                    type: 'VALIDATE_SUBGRID',
                    valid: false,
                    region: `Subgrid ${subgridNumber}`,
                    message: `Valor ${value} duplicado`,
                    values
                };
            }
            
            seen.add(value);
        }
    }
    
    // Se chegou aqui, o subgrid é válido
    return {
        threadId,
        type: 'VALIDATE_SUBGRID',
        valid: true,
        region: `Subgrid ${subgridNumber}`,
        message: 'Válido - Contém todos os dígitos 1-9',
        values
    };
}

/**
 * Determina o número do subgrid (1-9) baseado na posição inicial
 */
function getSubgridNumber(startRow, startCol) {
    const row = Math.floor(startRow / 3);
    const col = Math.floor(startCol / 3);
    return row * 3 + col + 1;
}

/**
 * Mensagem de erro padrão para tipos desconhecidos
 */
self.onerror = function(error) {
    self.postMessage({
        status: 'ERROR',
        result: {
            valid: false,
            message: `Erro no worker: ${error.message}`
        }
    });
};
