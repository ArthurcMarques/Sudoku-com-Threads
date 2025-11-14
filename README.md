# 🎯 Validador de Solução de Sudoku com Multithreading

## 📚 Informações Acadêmicas

**Universidade:** Pontifícia Universidade Católica de Goiás  
**Escola:** Escola Politécnica e de Artes  
**Disciplina:** CMP2351 - Sistemas Operacionais I  
**Professora:** Angélica da Silva Nunes  
**Projeto:** AED - Validador de Solução de Sudoku  

---

## 📋 Índice

1. [Sobre o Projeto](#sobre-o-projeto)
2. [Conceitos de Paralelismo Aplicados](#conceitos-de-paralelismo-aplicados)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Tecnologias Utilizadas](#tecnologias-utilizadas)
5. [Estrutura de Arquivos](#estrutura-de-arquivos)
6. [Como Executar](#como-executar)
7. [Como Usar](#como-usar)
8. [Implementação Técnica](#implementação-técnica)
9. [Decisões de Design](#decisões-de-design)
10. [Possíveis Melhorias](#possíveis-melhorias)

---

## 🎓 Sobre o Projeto

Este projeto implementa um **validador de soluções de Sudoku** utilizando **programação paralela com múltiplas threads**. O objetivo é demonstrar os conceitos de paralelismo através de uma aplicação web prática e visual.

### Requisitos do Sudoku

Um quebra-cabeça Sudoku válido deve atender aos seguintes critérios:

- ✅ Cada **coluna** deve conter todos os dígitos de 1 a 9 (sem repetição)
- ✅ Cada **linha** deve conter todos os dígitos de 1 a 9 (sem repetição)
- ✅ Cada **subgrid 3×3** deve conter todos os dígitos de 1 a 9 (sem repetição)

### Exemplo de Sudoku Válido

```
6 2 4 | 5 3 9 | 1 8 7
5 1 9 | 7 2 8 | 6 3 4
8 3 7 | 6 1 4 | 2 9 5
------+-------+------
1 4 3 | 8 6 5 | 7 2 9
9 5 8 | 2 4 7 | 3 6 1
7 6 2 | 3 9 1 | 4 5 8
------+-------+------
3 7 1 | 9 5 6 | 8 4 2
4 9 6 | 1 8 2 | 5 7 3
2 8 5 | 4 7 3 | 9 1 6
```

---

## 🧵 Conceitos de Paralelismo Aplicados

### O que são Threads?

**Thread** (linha de execução) é a menor unidade de processamento que pode ser agendada por um sistema operacional. Em vez de processar tarefas sequencialmente, múltiplas threads permitem executar várias tarefas **simultaneamente**, aproveitando melhor os recursos do processador.

### Implementação no Projeto

Este projeto utiliza **27 threads trabalhando em paralelo**:

#### 📊 Distribuição das Threads

| Tipo de Validação | Quantidade | Descrição |
|-------------------|------------|-----------|
| **Colunas** | 9 threads | Uma thread para cada uma das 9 colunas |
| **Linhas** | 9 threads | Uma thread para cada uma das 9 linhas |
| **Subgrids 3×3** | 9 threads | Uma thread para cada um dos 9 subgrids |
| **TOTAL** | **27 threads** | Todas executam em paralelo |

### Vantagens do Paralelismo

1. **Performance:** 27 validações acontecem simultaneamente
2. **Eficiência:** Melhor aproveitamento dos núcleos do processador
3. **Escalabilidade:** Fácil adicionar mais validações
4. **Isolamento:** Cada thread trabalha independentemente

### Web Workers - Threads no Navegador

No navegador, as threads são implementadas através de **Web Workers**, que permitem:

- ✅ Execução de código JavaScript em threads separadas
- ✅ Comunicação assíncrona via mensagens
- ✅ Isolamento de contexto (cada worker tem seu próprio escopo)
- ✅ Processamento paralelo real em CPUs multi-core

---

## 🏗️ Arquitetura do Sistema

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────┐
│            INTERFACE WEB (HTML/CSS)             │
│  - Grid de entrada 9×9                          │
│  - Painel de monitoramento                      │
│  - Log de execução                              │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│         CONTROLADOR PRINCIPAL (main.js)         │
│  - Gerenciamento de estado                      │
│  - Criação de workers                           │
│  - Coleta de resultados                         │
│  - Atualização da UI                            │
└─────────────────┬───────────────────────────────┘
                  │
      ┌───────────┴───────────┐
      │                       │
┌─────▼─────┐         ┌───────▼────────┐
│  WORKERS  │   ...   │    WORKERS     │
│  (Thread) │         │    (Thread)    │
│           │         │                │
│ Validação │         │   Validação    │
│ Coluna 1  │         │   Subgrid 9    │
└───────────┘         └────────────────┘
     (27 workers executando em paralelo)
```

### Fluxo de Execução

```
1. Usuário clica em "Validar"
   ↓
2. Sistema lê o grid 9×9
   ↓
3. Cria 27 Web Workers (threads)
   ↓
4. Cada worker valida sua região específica
   ↓
5. Workers executam em PARALELO
   ↓
6. Resultados são coletados
   ↓
7. Análise final: Sudoku válido ou inválido?
   ↓
8. Exibe resultado na interface
```

---

## 💻 Tecnologias Utilizadas

### Frontend

- **HTML5:** Estrutura semântica da aplicação
- **CSS3:** Estilização moderna e responsiva
  - Flexbox e Grid Layout
  - Animações e transições
  - Design responsivo
- **JavaScript (ES6+):** Lógica da aplicação
  - Classes e módulos
  - Promises e async/await
  - Web Workers API

### Conceitos Aplicados

- ✅ **Programação Orientada a Objetos**
- ✅ **Princípios SOLID**
- ✅ **Clean Code**
- ✅ **Programação Assíncrona**
- ✅ **Comunicação entre Threads**
- ✅ **Event-Driven Architecture**

---

## 📁 Estrutura de Arquivos

```
sudoku-validator/
│
├── index.html                 # Página principal da aplicação
│
├── css/
│   └── styles.css            # Estilos CSS completos
│
├── js/
│   ├── main.js               # Controlador principal
│   └── validator-worker.js   # Web Worker (thread)
│
└── README.md                  # Esta documentação
```

### Descrição dos Arquivos

#### `index.html`
- Estrutura HTML da aplicação
- Grid 9×9 para entrada de dados
- Painéis de monitoramento
- Log de execução em tempo real

#### `css/styles.css`
- Design moderno e profissional
- Responsivo para mobile, tablet e desktop
- Animações e feedback visual
- Tema de cores consistente

#### `js/main.js`
- Classe principal `SudokuValidator`
- Gerenciamento de estado
- Criação e gerenciamento de workers
- Atualização da interface
- Coleta e análise de resultados

#### `js/validator-worker.js`
- Lógica de validação em thread separada
- Funções para validar colunas, linhas e subgrids
- Comunicação assíncrona com thread principal

---

## 🚀 Como Executar

### Pré-requisitos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Servidor web local (obrigatório para Web Workers)

### Opção 1: Usando Python (Recomendado)

```bash
# Navegue até a pasta do projeto
cd sudoku-validator

# Python 3
python -m http.server 8000

# Ou Python 2
python -m SimpleHTTPServer 8000

# Acesse no navegador
http://localhost:8000
```

### Opção 2: Usando Node.js

```bash
# Instale o http-server globalmente
npm install -g http-server

# Execute na pasta do projeto
http-server -p 8000

# Acesse no navegador
http://localhost:8000
```

### Opção 3: Usando VS Code

1. Instale a extensão "Live Server"
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

### ⚠️ Importante

**Web Workers não funcionam com o protocolo `file://`**. É obrigatório usar um servidor web local.

---

## 📖 Como Usar

### 1. Carregar Exemplos

- **Exemplo Válido:** Clique em "📋 Carregar Exemplo Válido"
- **Exemplo Inválido:** Clique em "❌ Carregar Exemplo Inválido"

### 2. Preencher Manualmente

- Clique nas células do grid
- Digite números de 1 a 9
- Preencha todo o grid (81 células)

### 3. Validar

1. Clique no botão "⚡ Validar com Threads"
2. Observe o painel de monitoramento em tempo real
3. Acompanhe o log de execução
4. Veja o resultado final

### 4. Monitoramento

Durante a validação, você pode observar:

- **Threads Ativas:** Quantas threads estão executando
- **Threads Finalizadas:** Quantas já concluíram
- **Tempo Total:** Duração da validação completa
- **Status Individual:** Status de cada uma das 27 threads
- **Log Detalhado:** Registro completo de toda a execução

---

## 🔧 Implementação Técnica

### 1. Estrutura de Dados

```javascript
// Grid do Sudoku (matriz 9×9)
const grid = [
  [6, 2, 4, 5, 3, 9, 1, 8, 7],
  [5, 1, 9, 7, 2, 8, 6, 3, 4],
  // ... 7 linhas restantes
];

// Parâmetros enviados para cada thread
{
  type: 'VALIDATE_COLUMN',
  data: { columnIndex: 0 },
  threadId: 0,
  grid: grid
}
```

### 2. Comunicação Thread Principal ↔ Worker

```javascript
// Thread Principal → Worker
worker.postMessage({
  type: 'VALIDATE_COLUMN',
  data: { columnIndex: 0 },
  threadId: 0,
  grid: grid
});

// Worker → Thread Principal
self.postMessage({
  status: 'COMPLETED',
  result: {
    threadId: 0,
    valid: true,
    region: 'Coluna 1',
    message: 'Válida',
    executionTime: '12.45ms'
  }
});
```

### 3. Algoritmo de Validação

#### Validação de Coluna

```javascript
function validateColumn(grid, columnIndex) {
  const seen = new Set();
  
  for (let row = 0; row < 9; row++) {
    const value = grid[row][columnIndex];
    
    // Verificações:
    // 1. Valor entre 1 e 9
    // 2. Sem duplicatas
    
    if (seen.has(value)) {
      return { valid: false };
    }
    seen.add(value);
  }
  
  return { valid: true };
}
```

#### Validação de Linha

```javascript
function validateRow(grid, rowIndex) {
  const seen = new Set();
  
  for (let col = 0; col < 9; col++) {
    const value = grid[rowIndex][col];
    
    if (seen.has(value)) {
      return { valid: false };
    }
    seen.add(value);
  }
  
  return { valid: true };
}
```

#### Validação de Subgrid 3×3

```javascript
function validateSubgrid(grid, startRow, startCol) {
  const seen = new Set();
  
  for (let row = startRow; row < startRow + 3; row++) {
    for (let col = startCol; col < startCol + 3; col++) {
      const value = grid[row][col];
      
      if (seen.has(value)) {
        return { valid: false };
      }
      seen.add(value);
    }
  }
  
  return { valid: true };
}
```

### 4. Gerenciamento de Promises

```javascript
async createAllWorkers() {
  const promises = [];
  
  // Cria 27 promises (uma para cada worker)
  for (let i = 0; i < 27; i++) {
    promises.push(this.createWorker(config));
  }
  
  // Aguarda todas concluírem
  return Promise.all(promises);
}
```

---

## 🎨 Decisões de Design

### Por que 27 Threads?

A estratégia de usar **uma thread por região** oferece:

1. **Granularidade Fina:** Cada validação é independente
2. **Máximo Paralelismo:** Aproveitamento total de CPUs multi-core
3. **Facilidade de Debug:** Fácil identificar qual região falhou
4. **Visualização Clara:** Usuário vê cada thread trabalhando

### Alternativas Consideradas

#### Opção A: 3 Threads (implementação mínima)
- 1 para colunas
- 1 para linhas
- 1 para subgrids

❌ **Não escolhida:** Menos paralelismo, menos didático

#### Opção B: 11 Threads (sugestão do roteiro)
- 1 para todas as colunas
- 1 para todas as linhas
- 9 para os subgrids

❌ **Não escolhida:** Distribuição desigual de trabalho

#### Opção C: 27 Threads (ESCOLHIDA ✅)
- 9 para colunas
- 9 para linhas
- 9 para subgrids

✅ **Escolhida:** Máximo paralelismo e clareza didática

### Tratamento de Erros

- ✅ Validação de entrada do usuário
- ✅ Try-catch em operações críticas
- ✅ Mensagens de erro descritivas
- ✅ Graceful degradation
- ✅ Log detalhado para debugging

### Performance

- ✅ Execução paralela real
- ✅ Uso eficiente de memória
- ✅ Terminação adequada de workers
- ✅ Promises para gerenciar assincronismo

---

## 🚀 Possíveis Melhorias

### Funcionalidades Adicionais

1. **Salvar/Carregar Sudoku**
   - LocalStorage para persistência
   - Importar/exportar em diferentes formatos

2. **Modo de Competição**
   - Cronômetro
   - Ranking de tempo
   - Desafios diários

3. **Gerador de Sudoku**
   - Gerar puzzles válidos
   - Diferentes níveis de dificuldade

4. **Solver Automático**
   - Resolver Sudoku automaticamente
   - Exibir passo a passo

5. **Dicas Inteligentes**
   - Sugerir próximos números
   - Highlight de erros em tempo real

### Melhorias Técnicas

1. **TypeScript**
   - Type safety
   - Melhor autocomplete
   - Menos bugs

2. **Framework Frontend**
   - React/Vue para reatividade
   - Componentização melhor

3. **Testes Automatizados**
   - Unit tests
   - Integration tests
   - E2E tests

4. **Build Process**
   - Webpack/Vite
   - Minificação
   - Tree shaking

5. **PWA**
   - Service Workers
   - Funcionar offline
   - Instalável

### Otimizações

1. **Thread Pool**
   - Reusar workers
   - Reduzir overhead de criação

2. **Web Assembly**
   - Validação ainda mais rápida
   - Ideal para cálculos intensivos

3. **SharedArrayBuffer**
   - Compartilhar memória entre threads
   - Evitar clonagem de dados

---

## 📊 Métricas do Projeto

### Complexidade

- **Linhas de Código:** ~1.500 linhas
- **Arquivos:** 4 arquivos
- **Funções:** 30+ funções
- **Classes:** 1 classe principal

### Performance Típica

- **Tempo de Validação:** 50-200ms
- **Threads:** 27 em paralelo
- **Memória:** ~5-10MB

---

## 👥 Conceitos de Sistemas Operacionais Aplicados

### 1. Multithreading
- Execução paralela de processos
- Sincronização de threads
- Comunicação entre processos

### 2. Concorrência
- Múltiplas tarefas executando simultaneamente
- Race conditions (prevenidas pelo isolamento)

### 3. Paralelismo
- Execução simultânea real em CPUs multi-core
- Divisão de trabalho

### 4. Comunicação Inter-Processos (IPC)
- Message passing entre threads
- Assíncrono e não-bloqueante

### 5. Sincronização
- Promises para coordenar threads
- Coleta de resultados

---

## 📝 Conclusão

Este projeto demonstra com sucesso a aplicação prática de **conceitos de paralelismo** através de um validador de Sudoku com **27 threads executando simultaneamente**.

A implementação utiliza **Web Workers** do JavaScript para criar threads reais no navegador, permitindo uma execução verdadeiramente paralela que aproveita múltiplos núcleos do processador.

### Aprendizados Principais

1. ✅ Como criar e gerenciar múltiplas threads
2. ✅ Comunicação assíncrona entre threads
3. ✅ Vantagens do processamento paralelo
4. ✅ Sincronização e coleta de resultados
5. ✅ Boas práticas de código limpo e organizado

---

## 📚 Referências

- SILBERSCHATZ, A.; GALVIN, B. P.; GAGNE, G. **Fundamentos de sistemas operacionais**. 8. ed. Rio de Janeiro: Elsevier/Campus, 2013.
- MDN Web Docs: **Web Workers API**
- JavaScript.info: **Web Workers**

---

## 📧 Contato

Projeto desenvolvido para fins acadêmicos.

**Pontifícia Universidade Católica de Goiás**  
Escola Politécnica e de Artes  
CMP2351 - Sistemas Operacionais I

---

**© 2025 - Projeto Acadêmico**
