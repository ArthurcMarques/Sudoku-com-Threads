/**
 * SUDOKU VALIDATOR - MAIN CONTROLLER
 * Sistema de validação de Sudoku com 27 threads em paralelo
 * 
 * Arquitetura:
 * - 9 threads para colunas
 * - 9 threads para linhas
 * - 9 threads para subgrids 3×3
 * 
 * Autor: Desenvolvido para o projeto acadêmico CMP2351
 */

class SudokuValidator {
    constructor() {
        // Estado da aplicação
        this.grid = this.createEmptyGrid();
        this.workers = [];
        this.results = [];
        this.startTime = 0;
        this.activeThreadCount = 0;
        this.completedThreadCount = 0;
        
        // Configuração
        this.TOTAL_THREADS = 27; // 9 colunas + 9 linhas + 9 subgrids
        
        // Inicializa a aplicação
        this.init();
    }
    
    /**
     * Inicialização da aplicação
     */
    init() {
        this.createGrid();
        this.setupEventListeners();
        this.initializeThreadStatus();
        this.addLog('Sistema inicializado. Aguardando validação...', 'info');
    }
    
    /**
     * Cria a estrutura HTML do grid 9×9
     */
    createGrid() {
        const gridElement = document.getElementById('sudokuGrid');
        gridElement.innerHTML = '';
        
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.max = '9';
            input.maxLength = '1';
            input.dataset.index = i;
            
            // Validação de entrada
            input.addEventListener('input', (e) => this.handleCellInput(e));
            
            cell.appendChild(input);
            gridElement.appendChild(cell);
        }
    }
    
    /**
     * Valida entrada da célula
     */
    handleCellInput(event) {
        const input = event.target;
        let value = input.value;
        
        // Remove caracteres não numéricos
        value = value.replace(/[^1-9]/g, '');
        
        // Mantém apenas o primeiro dígito
        if (value.length > 1) {
            value = value.charAt(0);
        }
        
        input.value = value;
    }
    
    /**
     * Configura event listeners
     */
    setupEventListeners() {
        document.getElementById('btnValidate').addEventListener('click', () => this.validateSudoku());
        document.getElementById('btnLoadExample').addEventListener('click', () => this.loadValidExample());
        document.getElementById('btnLoadInvalid').addEventListener('click', () => this.loadInvalidExample());
        document.getElementById('btnClear').addEventListener('click', () => this.clearGrid());
        document.getElementById('btnClearLog').addEventListener('click', () => this.clearLog());
    }
    
    /**
     * Cria grid vazio 9×9
     */
    createEmptyGrid() {
        return Array(9).fill(null).map(() => Array(9).fill(0));
    }
    
    /**
     * Lê os valores do grid da interface
     */
    readGridFromUI() {
        const grid = this.createEmptyGrid();
        const inputs = document.querySelectorAll('.sudoku-cell input');
        
        inputs.forEach((input, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const value = parseInt(input.value) || 0;
            grid[row][col] = value;
        });
        
        return grid;
    }
    
    /**
     * Escreve valores no grid da interface
     */
    writeGridToUI(grid) {
        const inputs = document.querySelectorAll('.sudoku-cell input');
        
        grid.forEach((row, rowIndex) => {
            row.forEach((value, colIndex) => {
                const index = rowIndex * 9 + colIndex;
                inputs[index].value = value || '';
            });
        });
    }
    
    /**
     * VALIDAÇÃO PRINCIPAL
     * Cria e gerencia as 27 threads
     */
    async validateSudoku() {
        // Lê o grid atual
        this.grid = this.readGridFromUI();
        
        // Valida se o grid está preenchido
        if (!this.isGridComplete()) {
            alert('⚠️ Por favor, preencha todo o grid antes de validar!');
            return;
        }
        
        // Reseta estado
        this.resetValidation();
        
        // Desabilita botão de validação
        const btnValidate = document.getElementById('btnValidate');
        btnValidate.disabled = true;
        btnValidate.textContent = '⏳ Validando...';
        
        this.addLog('🚀 Iniciando validação com 27 threads em paralelo...', 'info');
        this.startTime = performance.now();
        
        try {
            // Cria todas as threads
            await this.createAllWorkers();
            
            // Aguarda conclusão de todas as threads
            await this.waitForAllWorkers();
            
            // Analisa resultados
            this.analyzeResults();
            
        } catch (error) {
            this.addLog(`❌ Erro durante validação: ${error.message}`, 'error');
        } finally {
            btnValidate.disabled = false;
            btnValidate.textContent = '⚡ Validar com Threads';
        }
    }
    
    /**
     * Cria todas as 27 threads (workers)
     */
    async createAllWorkers() {
        const promises = [];
        let threadId = 0;
        
        // 9 threads para colunas
        for (let col = 0; col < 9; col++) {
            promises.push(this.createWorker({
                type: 'VALIDATE_COLUMN',
                data: { columnIndex: col },
                threadId: threadId++,
                category: 'column'
            }));
        }
        
        // 9 threads para linhas
        for (let row = 0; row < 9; row++) {
            promises.push(this.createWorker({
                type: 'VALIDATE_ROW',
                data: { rowIndex: row },
                threadId: threadId++,
                category: 'row'
            }));
        }
        
        // 9 threads para subgrids 3×3
        for (let subgrid = 0; subgrid < 9; subgrid++) {
            const startRow = Math.floor(subgrid / 3) * 3;
            const startCol = (subgrid % 3) * 3;
            
            promises.push(this.createWorker({
                type: 'VALIDATE_SUBGRID',
                data: { startRow, startCol },
                threadId: threadId++,
                category: 'subgrid'
            }));
        }
        
        return Promise.all(promises);
    }
    
    /**
     * Cria uma thread individual (Web Worker)
     */
    createWorker(config) {
        return new Promise((resolve, reject) => {
            const worker = new Worker('js/validator-worker.js');
            
            // Atualiza status visual
            this.updateThreadStatus(config.threadId, config.category, 'running');
            this.activeThreadCount++;
            this.updateStats();
            
            this.addLog(`🔵 Thread ${config.threadId} iniciada: ${config.type}`, 'info');
            
            // Handler de mensagens do worker
            worker.onmessage = (event) => {
                const { status, result } = event.data;
                
                if (status === 'COMPLETED') {
                    this.handleWorkerComplete(config, result);
                    resolve(result);
                } else if (status === 'ERROR') {
                    this.handleWorkerError(config, result);
                    reject(result);
                }
                
                // Encerra o worker
                worker.terminate();
            };
            
            // Handler de erros
            worker.onerror = (error) => {
                this.addLog(`❌ Erro na Thread ${config.threadId}: ${error.message}`, 'error');
                reject(error);
                worker.terminate();
            };
            
            // Envia dados para o worker
            worker.postMessage({
                type: config.type,
                data: config.data,
                threadId: config.threadId,
                grid: this.grid
            });
            
            this.workers.push({
                worker,
                config,
                resolved: false
            });
        });
    }
    
    /**
     * Processa resultado de worker concluído
     */
    handleWorkerComplete(config, result) {
        this.results.push(result);
        this.activeThreadCount--;
        this.completedThreadCount++;
        
        const status = result.valid ? 'success' : 'error';
        const emoji = result.valid ? '✅' : '❌';
        
        this.updateThreadStatus(config.threadId, config.category, status);
        this.updateStats();
        
        this.addLog(
            `${emoji} Thread ${config.threadId} finalizada: ${result.region} - ${result.message} (${result.executionTime}ms)`,
            status
        );
    }
    
    /**
     * Processa erro de worker
     */
    handleWorkerError(config, result) {
        this.results.push(result);
        this.activeThreadCount--;
        this.completedThreadCount++;
        
        this.updateThreadStatus(config.threadId, config.category, 'error');
        this.updateStats();
        
        this.addLog(`❌ Thread ${config.threadId} erro: ${result.message}`, 'error');
    }
    
    /**
     * Aguarda conclusão de todos os workers
     */
    async waitForAllWorkers() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (this.completedThreadCount === this.TOTAL_THREADS) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }
    
    /**
     * Analisa os resultados finais
     */
    analyzeResults() {
        const totalTime = (performance.now() - this.startTime).toFixed(2);
        document.getElementById('totalTime').textContent = `${totalTime}ms`;
        
        const validResults = this.results.filter(r => r.valid);
        const invalidResults = this.results.filter(r => !r.valid);
        
        const isValid = invalidResults.length === 0;
        
        this.addLog('', 'info');
        this.addLog('═══════════════════════════════════════', 'info');
        this.addLog('📊 RESULTADO FINAL DA VALIDAÇÃO', 'info');
        this.addLog('═══════════════════════════════════════', 'info');
        this.addLog(`Total de threads: ${this.TOTAL_THREADS}`, 'info');
        this.addLog(`Validações bem-sucedidas: ${validResults.length}`, 'success');
        this.addLog(`Validações com erro: ${invalidResults.length}`, invalidResults.length > 0 ? 'error' : 'info');
        this.addLog(`Tempo total de execução: ${totalTime}ms`, 'info');
        
        if (isValid) {
            this.addLog('', 'info');
            this.addLog('🎉 SUDOKU VÁLIDO!', 'success');
            this.addLog('Todas as validações foram bem-sucedidas!', 'success');
            this.showResult(true, totalTime);
        } else {
            this.addLog('', 'info');
            this.addLog('❌ SUDOKU INVÁLIDO!', 'error');
            this.addLog('Foram encontrados erros nas seguintes regiões:', 'error');
            invalidResults.forEach(r => {
                this.addLog(`  • ${r.region}: ${r.message}`, 'error');
            });
            this.showResult(false, totalTime, invalidResults);
        }
    }
    
    /**
     * Exibe resultado final na interface
     */
    showResult(isValid, totalTime, errors = []) {
        const resultSection = document.getElementById('resultSection');
        const resultCard = document.getElementById('resultCard');
        const resultIcon = document.getElementById('resultIcon');
        const resultTitle = document.getElementById('resultTitle');
        const resultMessage = document.getElementById('resultMessage');
        const resultDetails = document.getElementById('resultDetails');
        
        resultSection.style.display = 'block';
        
        if (isValid) {
            resultCard.className = 'result-card success';
            resultIcon.textContent = '🎉';
            resultTitle.textContent = 'Sudoku Válido!';
            resultMessage.textContent = `Todas as 27 validações foram bem-sucedidas! Tempo total: ${totalTime}ms`;
            resultDetails.innerHTML = `
                <h3>Detalhes da Validação:</h3>
                <ul>
                    <li><strong>✅ 9 Colunas:</strong> Todas válidas</li>
                    <li><strong>✅ 9 Linhas:</strong> Todas válidas</li>
                    <li><strong>✅ 9 Subgrids 3×3:</strong> Todos válidos</li>
                    <li><strong>⏱️ Tempo de Execução:</strong> ${totalTime}ms</li>
                    <li><strong>🧵 Threads Utilizadas:</strong> 27 (execução paralela)</li>
                </ul>
            `;
        } else {
            resultCard.className = 'result-card error';
            resultIcon.textContent = '❌';
            resultTitle.textContent = 'Sudoku Inválido';
            resultMessage.textContent = `Foram encontrados ${errors.length} erro(s) na validação.`;
            
            const errorList = errors.map(e => 
                `<li><strong>${e.region}:</strong> ${e.message}</li>`
            ).join('');
            
            resultDetails.innerHTML = `
                <h3>Erros Encontrados:</h3>
                <ul>${errorList}</ul>
                <p><strong>⏱️ Tempo de Execução:</strong> ${totalTime}ms</p>
            `;
        }
        
        // Scroll suave até o resultado
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    /**
     * Inicializa status visual das threads
     */
    initializeThreadStatus() {
        const categories = [
            { id: 'columnThreads', prefix: 'Col', count: 9 },
            { id: 'rowThreads', prefix: 'Lin', count: 9 },
            { id: 'subgridThreads', prefix: 'Sub', count: 9 }
        ];
        
        categories.forEach(cat => {
            const container = document.getElementById(cat.id);
            container.innerHTML = '';
            
            for (let i = 0; i < cat.count; i++) {
                const threadItem = document.createElement('div');
                threadItem.className = 'thread-item pending';
                threadItem.id = `thread-${cat.prefix.toLowerCase()}-${i}`;
                threadItem.textContent = `${cat.prefix} ${i + 1}`;
                container.appendChild(threadItem);
            }
        });
    }
    
    /**
     * Atualiza status visual de uma thread
     */
    updateThreadStatus(threadId, category, status) {
        let prefix = '';
        let index = 0;
        
        if (category === 'column') {
            prefix = 'col';
            index = threadId;
        } else if (category === 'row') {
            prefix = 'lin';
            index = threadId - 9;
        } else if (category === 'subgrid') {
            prefix = 'sub';
            index = threadId - 18;
        }
        
        const element = document.getElementById(`thread-${prefix}-${index}`);
        if (element) {
            element.className = `thread-item ${status}`;
        }
    }
    
    /**
     * Atualiza estatísticas na interface
     */
    updateStats() {
        document.getElementById('activeThreads').textContent = this.activeThreadCount;
        document.getElementById('completedThreads').textContent = this.completedThreadCount;
    }
    
    /**
     * Verifica se o grid está completamente preenchido
     */
    isGridComplete() {
        return this.grid.every(row => 
            row.every(cell => cell >= 1 && cell <= 9)
        );
    }
    
    /**
     * Reseta estado da validação
     */
    resetValidation() {
        this.workers = [];
        this.results = [];
        this.activeThreadCount = 0;
        this.completedThreadCount = 0;
        this.initializeThreadStatus();
        this.updateStats();
        document.getElementById('resultSection').style.display = 'none';
        this.clearLog();
    }
    
    /**
     * Carrega exemplo válido
     */
    loadValidExample() {
        const validGrid = [
            [6, 2, 4, 5, 3, 9, 1, 8, 7],
            [5, 1, 9, 7, 2, 8, 6, 3, 4],
            [8, 3, 7, 6, 1, 4, 2, 9, 5],
            [1, 4, 3, 8, 6, 5, 7, 2, 9],
            [9, 5, 8, 2, 4, 7, 3, 6, 1],
            [7, 6, 2, 3, 9, 1, 4, 5, 8],
            [3, 7, 1, 9, 5, 6, 8, 4, 2],
            [4, 9, 6, 1, 8, 2, 5, 7, 3],
            [2, 8, 5, 4, 7, 3, 9, 1, 6]
        ];
        
        this.writeGridToUI(validGrid);
        this.addLog('✅ Exemplo válido carregado com sucesso!', 'success');
    }
    
    /**
     * Carrega exemplo inválido
     */
    loadInvalidExample() {
        const invalidGrid = [
            [6, 2, 4, 5, 3, 9, 1, 8, 7],
            [5, 1, 9, 7, 2, 8, 6, 3, 4],
            [8, 3, 7, 6, 1, 4, 2, 9, 5],
            [1, 4, 3, 8, 6, 5, 7, 2, 9],
            [9, 5, 8, 2, 4, 7, 3, 6, 1],
            [7, 6, 2, 3, 9, 1, 4, 5, 8],
            [3, 7, 1, 9, 5, 6, 8, 4, 2],
            [4, 9, 6, 1, 8, 2, 5, 7, 3],
            [2, 8, 5, 4, 7, 3, 9, 1, 1] // Última célula duplicada (1 ao invés de 6)
        ];
        
        this.writeGridToUI(invalidGrid);
        this.addLog('⚠️ Exemplo inválido carregado (última linha tem erro)', 'warning');
    }
    
    /**
     * Limpa o grid
     */
    clearGrid() {
        const inputs = document.querySelectorAll('.sudoku-cell input');
        inputs.forEach(input => input.value = '');
        this.addLog('🗑️ Grid limpo', 'info');
    }
    
    /**
     * Adiciona entrada no log
     */
    addLog(message, type = 'info') {
        const logContainer = document.getElementById('logContainer');
        
        // Remove mensagem vazia inicial
        const emptyMsg = logContainer.querySelector('.log-empty');
        if (emptyMsg) {
            emptyMsg.remove();
        }
        
        const timestamp = new Date().toLocaleTimeString('pt-BR');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span> ${message}`;
        
        logContainer.appendChild(logEntry);
        
        // Auto-scroll para o final
        logContainer.scrollTop = logContainer.scrollHeight;
    }
    
    /**
     * Limpa o log
     */
    clearLog() {
        const logContainer = document.getElementById('logContainer');
        logContainer.innerHTML = '<p class="log-empty">Log limpo. Aguardando validação...</p>';
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.sudokuValidator = new SudokuValidator();
});
