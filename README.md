# Validador de Solução de Sudoku com Multithreading

## Informações Acadêmicas

**Universidade:** Pontifícia Universidade Católica de Goiás  
**Escola:** Escola Politécnica e de Artes  
**Disciplina:** CMP2351 - Sistemas Operacionais I  
**Professora:** Angélica da Silva Nunes  
**Projeto:** AED - Validador de Solução de Sudoku
**Alunos Responsáveis:**  
- Arthur Cardoso Marques  
- Maria Rita Veríssimo  
- Jennifer Vitória da Silva Peixoto  

---

## Índice

1. [Sobre o Projeto](#sobre-o-projeto)
2. [Conceitos de Paralelismo Aplicados](#conceitos-de-paralelismo-aplicados)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Tecnologias Utilizadas](#tecnologias-utilizadas)
5. [Estrutura de Arquivos](#estrutura-de-arquivos)
6. [Como Executar](#como-executar)
7. [Como Usar](#como-usar)
8. [Implementação Técnica](#implementacao-tecnica)
9. [Conceitos de Sistemas Operacionais Aplicados](#conceitos-de-sistemas-operacionais-aplicados)

---

## Sobre o Projeto

Este projeto implementa um **validador de soluções de Sudoku** com **27 threads (Web Workers) em paralelo**. A interface gera um desafio aleatório a cada carregamento, permite edição das células livres e mostra, em tempo real, o status de cada thread responsável pelas linhas, colunas e sub-grades.

### Requisitos do Sudoku

Um tabuleiro válido precisa garantir:

- Cada **coluna** contém os dígitos 1 a 9 sem repetição.
- Cada **linha** contém os dígitos 1 a 9 sem repetição.
- Cada **sub-grade 3x3** contém os dígitos 1 a 9 sem repetição.

---

## Conceitos de Paralelismo Aplicados

### O que são Threads?

**Thread** é a menor unidade de processamento agendada pelo sistema operacional. Ao usar múltiplas threads, tarefas independentes podem ocorrer simultaneamente, aproveitando melhor os núcleos da CPU.

### Implementação no Projeto

Este projeto dispara **27 threads em paralelo** para validar todo o tabuleiro.

| Tipo de Validação | Quantidade | Descrição |
|-------------------|------------|-----------|
| **Colunas** | 9 threads | Uma thread para cada coluna |
| **Linhas** | 9 threads | Uma thread para cada linha |
| **Sub-grades 3x3** | 9 threads | Uma thread para cada sub-grade |
| **TOTAL** | **27 threads** | Executando em paralelo |

### Vantagens do Paralelismo

1. **Performance:** 27 validações rodando simultaneamente.
2. **Eficiência:** Melhor uso dos núcleos disponíveis.
3. **Escalabilidade:** Fácil estender regras ou novas checagens.
4. **Isolamento:** Cada unidade é analisada separadamente.

### Web Workers - Threads no Navegador

No navegador, as threads são implementadas com **Web Workers**, permitindo:

- Execução de JavaScript em threads separadas.
- Comunicação assíncrona via `postMessage`.
- Isolamento de contexto entre workers.
- Processamento paralelo real em CPUs multi-core.

---

## Arquitetura do Sistema

### Visão Geral

- **Interface (index.html + styles.css):** constrói o tabuleiro 9x9, botões de controle e painel de monitoramento.
- **Orquestração (script.js):** gera desafios aleatórios, controla estado, dispara e consolida os resultados das threads.
- **Validação paralela (validatorWorker.js):** cada worker analisa apenas sua unidade (linha, coluna ou sub-grade) e devolve conflitos encontrados.

### Fluxo de Execução

```
1. Usuário clica em "Rodar Threads".
2. A interface coleta os 81 valores do tabuleiro.
3. São criados 27 Web Workers (9 linhas, 9 colunas, 9 sub-grades).
4. Cada worker valida sua fatia do tabuleiro em paralelo.
5. Resultados retornam com posições e tipos de conflito.
6. A UI destaca células problemáticas e registra o tempo de cada thread.
7. Se nenhuma thread reportar conflito, o tabuleiro é considerado válido.
```

---

## Tecnologias Utilizadas

### Frontend

- **HTML5:** Estrutura da aplicação.
- **CSS3:** Estilização moderna e responsiva (Grid e Flexbox).
- **JavaScript (ES6+):** Lógica e controle das threads.

### Conceitos Aplicados

- **Programação Orientada a Objetos** (quando aplicável).
- **Programação Assíncrona** com Promises e `postMessage`.
- **Comunicação entre Threads** (Web Workers).
- **Event-Driven Architecture** para respostas da UI.

---

## Estrutura de Arquivos

```
Sudoku_Threads/
+-- index.html            # Página principal e markup do tabuleiro
+-- styles.css            # Estilos e layout
+-- script.js             # Gera desafios e orquestra 27 threads
+-- validatorWorker.js    # Web Worker que valida cada unidade
```

### Descrição dos Arquivos

#### `index.html`
- Grid 9x9 construído dinamicamente.
- Botões para novo desafio, reset, limpar livres e disparar threads.
- Painel de monitoramento das threads.

#### `styles.css`
- Tema escuro com gradiente e destaques para células inválidas.
- Layout responsivo para desktop e mobile.
- Estilos do painel de threads e banners de status.

#### `script.js`
- Gera uma solução completa e mascara células para criar desafios aleatórios.
- Controla estado de células bloqueadas e editáveis.
- Dispara 27 Web Workers na validação completa e 3 workers ao digitar (linha/coluna/sub-grade da célula).
- Destaca conflitos (duplicados, valores inválidos ou vazios) e registra o tempo de cada thread.

#### `validatorWorker.js`
- Validação isolada por unidade.
- Retorna `invalidPositions` com o tipo de problema (`duplicate`, `invalid`, `empty`).
- Suporta modo `ignoreEmpty` para checagens em tempo real sem exigir o tabuleiro completo.

---

## Como Executar

### Pré-requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari).
- Servidor web local (Web Workers não funcionam via `file://`).

### Opção 1: Acessando a página no GitHub Pages (recomendado)
https://arthurcmarques.github.io/Sudoku-com-Threads/

### Opção 2: Usando Python

```bash
# Navegue até a pasta do projeto
cd Sudoku_Threads

# Python 3
python -m http.server 8000

# Acesse no navegador
http://localhost:8000
```

### Opção 3: Usando Node.js

```bash
npm install -g http-server
http-server -p 8000
# Acesse no navegador
http://localhost:8000
```

### Opção 4: Usando VS Code

1. Instale a extensão "Live Server".
2. Clique com o botão direito em `index.html`.
3. Selecione "Open with Live Server".

### Importante

**Web Workers não funcionam com o protocolo `file://`.** É obrigatório servir os arquivos via HTTP local.

---

## Como Usar

### 1. Carregar um desafio

- Clique em **"Novo Desafio"** para gerar um tabuleiro aleatório (clues são bloqueados).
- Use **"Reiniciar"** para restaurar o desafio atual.
- Use **"Limpar livres"** para apagar apenas as células editáveis.

### 2. Preencher manualmente

- Clique nas células livres e digite números de 1 a 9.
- A interface bloqueia caracteres inválidos e limita a um dígito por célula.

### 3. Validar com threads

1. Clique em **"Rodar Threads"**.
2. 27 workers são criados (9 linhas, 9 colunas, 9 sub-grades).
3. O painel lateral mostra o status de cada thread e o tempo gasto.
4. Células com conflito são destacadas e recebem tooltip com o motivo.

### 4. Validação em tempo real

- Ao alterar uma célula, 3 workers (linha, coluna e sub-grade) rodam imediatamente com `ignoreEmpty=true`.
- Apenas conflitos de duplicação são destacados enquanto o tabuleiro não está completo.

---

## Implementação Técnica

### 1. Geração e máscara do tabuleiro

```javascript
function generateRandomPuzzle() {
  const solution = buildSolvedBoard();
  const clues = maskBoard(solution, 0.62); // ~38% das células permanecem
  const stamp = Math.floor(Math.random() * 10000);
  return { name: `Aleatorio #${stamp}`, clues };
}
```

### 2. Payload das threads

```javascript
// Cada payload identifica o tipo e as células daquela unidade
{ kind: "row", index: 0, cells: [{ row: 0, col: 0, value: 6 }, ...] }
{ kind: "column", index: 3, cells: [...] }
{ kind: "box", index: 8, cells: [...] }
```

### 3. Execução paralela

```javascript
async function validateBoard() {
  const matrix = collectMatrixFromBoard();
  const payloads = buildPayloads(matrix); // 27 payloads
  const results = await Promise.all(payloads.map(runValidationWorker));
  // Consolida conflitos e atualiza UI
}
```

### 4. Worker isolado

```javascript
self.onmessage = ({ data }) => {
  const { kind, index, cells, ignoreEmpty = false } = data;
  // Marca duplicados, vazios ou valores fora de 1..9
  self.postMessage({ kind, index, valid, invalidPositions });
};
```

---

## Conceitos de Sistemas Operacionais Aplicados

### 1. Multithreading
- Execução paralela com Web Workers.
- Isolamento de contexto por thread.

### 2. Concorrência
- Múltiplas unidades validadas simultaneamente.
- Prevenção de race conditions via isolamento das estruturas.

### 3. Paralelismo
- Trabalho dividido entre 27 unidades independentes.

### 4. Comunicação Inter-Processos (IPC)
- `postMessage` para troca de mensagens entre UI e workers.

### 5. Sincronização
- `Promise.all` para aguardar todas as threads e consolidar o resultado.

Escola Politécnica e de Artes  
CMP2351 - Sistemas Operacionais I

---

**(c) 2025 - Projeto Acadêmico**
