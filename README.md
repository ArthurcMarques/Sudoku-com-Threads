# Validador de Solucao de Sudoku com Multithreading

## Informacoes Academicas

**Universidade:** Pontificia Universidade Catolica de Goias  
**Escola:** Escola Politecnica e de Artes  
**Disciplina:** CMP2351 - Sistemas Operacionais I  
**Professora:** Angelica da Silva Nunes  
**Alunos Responsaveis:**  
- Arthur Cardoso Marques  
- Maria Rita Verissimo  
- Jennifer Vitoria da Silva Peixoto  
**Projeto:** AED - Validador de Solucao de Sudoku

---

## Indice

1. [Sobre o Projeto](#sobre-o-projeto)
2. [Conceitos de Paralelismo Aplicados](#conceitos-de-paralelismo-aplicados)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Tecnologias Utilizadas](#tecnologias-utilizadas)
5. [Estrutura de Arquivos](#estrutura-de-arquivos)
6. [Como Executar](#como-executar)
7. [Como Usar](#como-usar)
8. [Implementacao Tecnica](#implementacao-tecnica)
9. [Decisoes de Design](#decisoes-de-design)
10. [Possiveis Melhorias](#possiveis-melhorias)

---

## Sobre o Projeto

Este projeto implementa um **validador de solucoes de Sudoku** com **27 threads (Web Workers) em paralelo**. A interface gera um desafio aleatorio a cada carregamento, permite edicao das celulas livres e mostra, em tempo real, o status de cada thread responsavel pelas linhas, colunas e sub-grades.

### Requisitos do Sudoku

Um tabuleiro valido precisa garantir:

- Cada **coluna** contem os digitos 1 a 9 sem repeticao.
- Cada **linha** contem os digitos 1 a 9 sem repeticao.
- Cada **sub-grade 3x3** contem os digitos 1 a 9 sem repeticao.

---

## Conceitos de Paralelismo Aplicados

### O que sao Threads?

**Thread** e a menor unidade de processamento agendada pelo sistema operacional. Ao usar multiplas threads, tarefas independentes podem ocorrer simultaneamente, aproveitando melhor os nucleos da CPU.

### Implementacao no Projeto

Este projeto dispara **27 threads em paralelo** para validar todo o tabuleiro.

| Tipo de Validacao | Quantidade | Descricao |
|-------------------|------------|-----------|
| **Colunas** | 9 threads | Uma thread para cada coluna |
| **Linhas** | 9 threads | Uma thread para cada linha |
| **Sub-grades 3x3** | 9 threads | Uma thread para cada sub-grade |
| **TOTAL** | **27 threads** | Executando em paralelo |

### Vantagens do Paralelismo

1. **Performance:** 27 validacoes rodando simultaneamente.
2. **Eficiencia:** Melhor uso dos nucleos disponiveis.
3. **Escalabilidade:** Facil extender regras ou novas checagens.
4. **Isolamento:** Cada unidade e analisada separadamente.

### Web Workers - Threads no Navegador

No navegador, as threads sao implementadas com **Web Workers**, permitindo:

- Execucao de JavaScript em threads separadas.
- Comunicacao assincrona via `postMessage`.
- Isolamento de contexto entre workers.
- Processamento paralelo real em CPUs multi-core.

---

## Arquitetura do Sistema

### Visao Geral

- **Interface (index.html + styles.css):** constroi o tabuleiro 9x9, botoes de controle e painel de monitoramento.
- **Orquestracao (script.js):** gera desafios aleatorios, controla estado, dispara e consolida os resultados das threads.
- **Validacao paralela (validatorWorker.js):** cada worker analisa apenas sua unidade (linha, coluna ou sub-grade) e devolve conflitos encontrados.

### Fluxo de Execucao

```
1. Usuario clica em "Rodar Threads".
2. A interface coleta os 81 valores do tabuleiro.
3. Sao criados 27 Web Workers (9 linhas, 9 colunas, 9 sub-grades).
4. Cada worker valida sua fatia do tabuleiro em paralelo.
5. Resultados retornam com posicoes e tipos de conflito.
6. A UI destaca celulas problematicas e registra o tempo de cada thread.
7. Se nenhuma thread reportar conflito, o tabuleiro e considerado valido.
```

---

## Tecnologias Utilizadas

### Frontend

- **HTML5:** Estrutura da aplicacao.
- **CSS3:** Estilizacao moderna e responsiva (Grid e Flexbox).
- **JavaScript (ES6+):** Logica e controle das threads.

### Conceitos Aplicados

- **Programacao Orientada a Objetos** (quando aplicavel).
- **Programacao Assincrona** com Promises e `postMessage`.
- **Comunicacao entre Threads** (Web Workers).
- **Event-Driven Architecture** para respostas da UI.

---

## Estrutura de Arquivos

```
Sudoku_Threads/
+-- index.html            # Pagina principal e markup do tabuleiro
+-- styles.css            # Estilos e layout
+-- script.js             # Gera desafios e orquestra 27 threads
+-- validatorWorker.js    # Web Worker que valida cada unidade
```

### Descricao dos Arquivos

#### `index.html`
- Grid 9x9 construido dinamicamente.
- Botoes para novo desafio, reset, limpar livres e disparar threads.
- Painel de monitoramento das threads.

#### `styles.css`
- Tema escuro com gradiente e destaques para celulas invalidas.
- Layout responsivo para desktop e mobile.
- Estilos do painel de threads e banners de status.

#### `script.js`
- Gera uma solucao completa e mascara celulas para criar desafios aleatorios.
- Controla estado de celulas bloqueadas e editaveis.
- Dispara 27 Web Workers na validacao completa e 3 workers ao digitar (linha/coluna/sub-grade da celula).
- Destaca conflitos (duplicados, valores invalidos ou vazios) e registra o tempo de cada thread.

#### `validatorWorker.js`
- Validacao isolada por unidade.
- Retorna `invalidPositions` com o tipo de problema (`duplicate`, `invalid`, `empty`).
- Suporta modo `ignoreEmpty` para checagens em tempo real sem exigir o tabuleiro completo.

---

## Como Executar

### Pre-requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari).
- Servidor web local (Web Workers nao funcionam via `file://`).

### Opcao 1: Usando Python (Recomendado)

```bash
# Navegue ate a pasta do projeto
cd Sudoku_Threads

# Python 3
python -m http.server 8000

# Acesse no navegador
http://localhost:8000
```

### Opcao 2: Usando Node.js

```bash
npm install -g http-server
http-server -p 8000
# Acesse em http://localhost:8000
```

### Opcao 3: Usando VS Code

1. Instale a extensao "Live Server".
2. Clique com o botao direito em `index.html`.
3. Selecione "Open with Live Server".

### Importante

**Web Workers nao funcionam com o protocolo `file://`.** E obrigatorio servir os arquivos via HTTP local.

---

## Como Usar

### 1. Carregar um desafio

- Clique em **"Novo Desafio"** para gerar um tabuleiro aleatorio (clues sao bloqueados).
- Use **"Reiniciar"** para restaurar o desafio atual.
- Use **"Limpar livres"** para apagar apenas as celulas editaveis.

### 2. Preencher manualmente

- Clique nas celulas livres e digite numeros de 1 a 9.
- A interface bloqueia caracteres invalidos e limita a um digito por celula.

### 3. Validar com threads

1. Clique em **"Rodar Threads"**.
2. 27 workers sao criados (9 linhas, 9 colunas, 9 sub-grades).
3. O painel lateral mostra o status de cada thread e o tempo gasto.
4. Celulas com conflito sao destacadas e recebem tooltip com o motivo.

### 4. Validacao em tempo real

- Ao alterar uma celula, 3 workers (linha, coluna e sub-grade) rodam imediatamente com `ignoreEmpty=true`.
- Apenas conflitos de duplicacao sao destacados enquanto o tabuleiro nao esta completo.

---

## Implementacao Tecnica

### 1. Geracao e mascara do tabuleiro

```javascript
function generateRandomPuzzle() {
  const solution = buildSolvedBoard();
  const clues = maskBoard(solution, 0.62); // ~38% das celulas permanecem
  const stamp = Math.floor(Math.random() * 10000);
  return { name: `Aleatorio #${stamp}`, clues };
}
```

### 2. Payload das threads

```javascript
// Cada payload identifica o tipo e as celulas daquela unidade
{ kind: "row", index: 0, cells: [{ row: 0, col: 0, value: 6 }, ...] }
{ kind: "column", index: 3, cells: [...] }
{ kind: "box", index: 8, cells: [...] }
```

### 3. Execucao paralela

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

## Decisoes de Design

- **27 threads (linha/coluna/sub-grade):** maxima clareza didatica e paralelismo pleno.
- **Validacao incremental:** ao digitar, usamos `ignoreEmpty` para alertar apenas duplicatas sem exigir tabuleiro completo.
- **Geracao de desafios aleatorios:** evita depender de arquivos estaticos de exemplo.
- **Destaques contextuais:** tooltips indicam se e duplicado, vazio ou valor fora do intervalo.

### Alternativas Consideradas

- **3 threads (linha, coluna, sub-grades):** menos paralelismo e pouca visibilidade.
- **11 threads (1 para linhas, 1 para colunas, 9 para sub-grades):** distribuicao desigual de trabalho.
- **27 threads (adotado):** melhor visualizacao e balanceamento.

### Tratamento de Erros

- Sanitizacao de entrada (apenas digitos 1-9).
- `try...catch` em chamadas assincronas.
- Mensagens de status claras na UI em caso de falha.

### Performance

- Workers liberados imediatamente apos responder (`terminate`).
- Validacao completa tipica em poucos milissegundos em maquinas modernas.

---

## Possiveis Melhorias

### Funcionalidades Adicionais

1. **Salvar/Carregar Sudoku:** persistir progresso no `localStorage`.
2. **Gerador com dificuldades:** diferentes niveis ao mascarar o tabuleiro.
3. **Solver automatico:** resolver e mostrar passos.
4. **Dicas inteligentes:** sugerir proximo movimento.

### Melhorias Tecnicas

1. **TypeScript:** tipos mais seguros para payloads das threads.
2. **Testes automatizados:** testes unitarios para `validatorWorker` e geracao de puzzles.
3. **Thread pool:** reusar workers para reduzir overhead de criacao.
4. **PWA:** suporte offline e instalacao.

### Otimizacoes

1. **SharedArrayBuffer:** evitar copia de dados grandes entre threads.
2. **WebAssembly:** validar unidades mais rapidamente em dispositivos menos potentes.

---

## Metricas do Projeto

### Complexidade

- **Linhas de codigo:** ~500 (HTML + CSS + JS + Worker).
- **Arquivos:** 4 arquivos principais.
- **Workers:** 27 por validacao completa; 3 por celula editada.

### Performance tipica

- **Tempo de validacao:** dezenas de milissegundos para tabuleiros completos.
- **Memoria:** baixa, apenas matrizes 9x9 e payloads leves.

---

## Conceitos de Sistemas Operacionais Aplicados

### 1. Multithreading
- Execucao paralela com Web Workers.
- Isolamento de contexto por thread.

### 2. Concorrencia
- Multiplas unidades validadas simultaneamente.
- Prevencao de race conditions via isolamento das estruturas.

### 3. Paralelismo
- Trabalho dividido entre 27 unidades independentes.

### 4. Comunicacao Inter-Processos (IPC)
- `postMessage` para troca de mensagens entre UI e workers.

### 5. Sincronizacao
- `Promise.all` para aguardar todas as threads e consolidar o resultado.

---

## Conclusao

O projeto demonstra, de forma pratica, **paralelismo com 27 threads independentes** validando um Sudoku. Web Workers garantem execucao paralela verdadeira no navegador, enquanto a UI destaca conflitos e mostra o tempo gasto por cada unidade.

### Aprendizados Principais

1. Criacao, disparo e termino de multiplas threads.
2. Comunicacao assincrona entre threads e thread principal.
3. Beneficios do processamento paralelo em um problema classico.
4. Sincronizacao e agregacao de resultados com Promises.
5. Boas praticas de UX para feedback imediato.

---

## Referencias

- SILBERSCHATZ, A.; GALVIN, B. P.; GAGNE, G. **Fundamentos de sistemas operacionais**. 8. ed. Rio de Janeiro: Elsevier/Campus, 2013.
- MDN Web Docs: **Web Workers API**.
- JavaScript.info: **Web Workers**.

---

## Contato

Projeto desenvolvido para fins academicos.

**Pontificia Universidade Catolica de Goias**  
Escola Politecnica e de Artes  
CMP2351 - Sistemas Operacionais I

---

**(c) 2025 - Projeto Academico**
