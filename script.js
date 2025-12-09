function embaralhar(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const indice = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[indice]] = [copia[indice], copia[i]];
  }
  return copia;
}

function construirTabuleiroResolvido() {
  const base = [0, 1, 2];
  const linhas = embaralhar(base).flatMap((grupo) => embaralhar(base).map((linha) => grupo * 3 + linha));
  const colunas = embaralhar(base).flatMap((grupo) => embaralhar(base).map((coluna) => grupo * 3 + coluna));
  const tabuleiro = Array.from({ length: 9 }, () => Array(9).fill(0));

  const padrao = (linha, coluna) => (linha * 3 + Math.floor(linha / 3) + coluna) % 9;

  linhas.forEach((linhaValor, indiceLinha) => {
    colunas.forEach((colunaValor, indiceColuna) => {
      tabuleiro[indiceLinha][indiceColuna] = padrao(linhaValor, colunaValor) + 1;
    });
  });

  return tabuleiro;
}

function mascararTabuleiro(solucao, proporcaoOculta = 0.6) {
  const mascarado = solucao.map((linha) => [...linha]);
  mascarado.forEach((linha, indiceLinha) => {
    linha.forEach((_, indiceColuna) => {
      if (Math.random() < proporcaoOculta) {
        mascarado[indiceLinha][indiceColuna] = 0;
      }
    });
  });
  return mascarado;
}

function gerarDesafioAleatorio() {
  const solucao = construirTabuleiroResolvido();
  const pistas = mascararTabuleiro(solucao, 0.62);
  const carimbo = Math.floor(Math.random() * 10000);
  return { nome: `Aleatorio #${carimbo}`, pistas, solucao };
}

const ROTULOS_TIPOS = {
  linha: "Linha",
  coluna: "Coluna",
  bloco: "Sub-grade",
};

const elementoTabuleiro = document.getElementById("sudoku-board");
const faixaStatus = document.getElementById("status-banner");
const logThreads = document.getElementById("thread-log");

const estado = {
  modelo: null,
  solucao: null,
  celulasBloqueadas: new Set(),
  nomeDesafio: "",
};

iniciar();

function iniciar() {
  carregarDesafioAleatorio();
  document.getElementById("btn-new").addEventListener("click", carregarDesafioAleatorio);
  document.getElementById("btn-reset").addEventListener("click", reiniciarTabuleiro);
  document.getElementById("btn-clear").addEventListener("click", limparCelulasEditaveis);
  document.getElementById("btn-check").addEventListener("click", validarTabuleiro);
  document.getElementById("btn-fill-correct").addEventListener("click", completarCorreto);
  document.getElementById("btn-fill-wrong").addEventListener("click", completarIncorreto);
}

function carregarDesafioAleatorio() {
  const desafio = gerarDesafioAleatorio();
  estado.modelo = clonarMatriz(desafio.pistas);
  estado.solucao = desafio.solucao;
  estado.celulasBloqueadas = construirConjuntoBloqueado(desafio.pistas);
  estado.nomeDesafio = desafio.nome;
  renderizarTabuleiro(estado.modelo);
  definirStatus(`Desafio aleatorio (${desafio.nome}) pronto. Boa sorte!`);
  logThreads.innerHTML = "";
}

function renderizarTabuleiro(matriz) {
  elementoTabuleiro.innerHTML = "";
  matriz.forEach((linha, indiceLinha) => {
    linha.forEach((valor, indiceColuna) => {
      const input = document.createElement("input");
      input.type = "text";
      input.classList.add("cell");
      input.dataset.row = String(indiceLinha);
      input.dataset.col = String(indiceColuna);
      input.autocomplete = "off";
      input.inputMode = "numeric";
      input.pattern = "[1-9]";
      if ((indiceColuna + 1) % 3 === 0 && indiceColuna !== 8) {
        input.classList.add("block-right");
      }
      if ((indiceLinha + 1) % 3 === 0 && indiceLinha !== 8) {
        input.classList.add("block-bottom");
      }
      const chave = `${indiceLinha}-${indiceColuna}`;
      if (estado.celulasBloqueadas.has(chave) && valor !== 0) {
        input.value = valor;
        input.disabled = true;
        input.classList.add("prefilled");
      }
      input.addEventListener("input", () => {
        imporSimboloNumerico(input);
        tratarAlteracaoCelula(indiceLinha, indiceColuna);
      });
      elementoTabuleiro.appendChild(input);
    });
  });
  limparDestaques();
}

function imporSimboloNumerico(input) {
  let valorLimpo = input.value.replace(/[^\d]/g, "");
  if (valorLimpo.length > 1) {
    valorLimpo = valorLimpo.charAt(0);
  }
  if (valorLimpo && (valorLimpo === "0" || Number(valorLimpo) > 9)) {
    valorLimpo = "";
  }
  input.value = valorLimpo;
}

function reiniciarTabuleiro() {
  if (!estado.modelo) return;
  document.querySelectorAll(".cell").forEach((input) => {
    const linha = Number(input.dataset.row);
    const coluna = Number(input.dataset.col);
    if (estado.celulasBloqueadas.has(`${linha}-${coluna}`)) {
      input.value = estado.modelo[linha][coluna] || "";
    } else {
      input.value = "";
    }
  });
  limparDestaques();
  logThreads.innerHTML = "";
  definirStatus("Tabuleiro reiniciado para o desafio atual.");
}

function limparCelulasEditaveis() {
  document.querySelectorAll(".cell").forEach((input) => {
    const linha = Number(input.dataset.row);
    const coluna = Number(input.dataset.col);
    if (!estado.celulasBloqueadas.has(`${linha}-${coluna}`)) {
      input.value = "";
    }
  });
  limparDestaques();
  definirStatus("Celulas livres limpas. Complete antes de rodar as threads.");
}

function preencherTabuleiroComMatriz(matriz) {
  document.querySelectorAll(".cell").forEach((input) => {
    const linha = Number(input.dataset.row);
    const coluna = Number(input.dataset.col);
    const valor = matriz[linha][coluna];
    input.value = valor ? String(valor) : "";
  });
}

function completarCorreto() {
  if (!estado.solucao) {
    definirStatus("Nenhum desafio carregado para completar.", "error");
    return;
  }
  preencherTabuleiroComMatriz(estado.solucao);
  limparDestaques();
  logThreads.innerHTML = "";
  definirStatus("Tabuleiro preenchido com a solucao correta. Rode as threads para conferir.", "success");
}

function construirMatrizIncorreta(solucao) {
  const matriz = clonarMatriz(solucao);
  let linhaEscolhida = -1;
  let colunasEditaveis = [];

  for (let linha = 0; linha < 9; linha += 1) {
    const livres = [];
    for (let coluna = 0; coluna < 9; coluna += 1) {
      if (!estado.celulasBloqueadas.has(`${linha}-${coluna}`)) {
        livres.push(coluna);
      }
    }
    if (livres.length >= 2) {
      linhaEscolhida = linha;
      colunasEditaveis = livres;
      break;
    }
  }

  if (linhaEscolhida === -1) {
    for (let linha = 0; linha < 9; linha += 1) {
      for (let coluna = 0; coluna < 9; coluna += 1) {
        if (!estado.celulasBloqueadas.has(`${linha}-${coluna}`)) {
          matriz[linha][coluna] = 0;
          return matriz;
        }
      }
    }
    return matriz;
  }

  const [colunaA, colunaB] = colunasEditaveis;
  const valorDuplicado = matriz[linhaEscolhida][colunaA];
  matriz[linhaEscolhida][colunaB] = valorDuplicado;
  return matriz;
}

function completarIncorreto() {
  if (!estado.solucao) {
    definirStatus("Nenhum desafio carregado para completar.", "error");
    return;
  }
  const matrizIncorreta = construirMatrizIncorreta(estado.solucao);
  preencherTabuleiroComMatriz(matrizIncorreta);
  limparDestaques();
  logThreads.innerHTML = "";
  definirStatus("Tabuleiro preenchido com uma solucao incorreta para demonstracao.", "error");
}

function definirStatus(mensagem, variante = null) {
  faixaStatus.classList.remove("success", "error");
  if (variante) {
    faixaStatus.classList.add(variante);
  }
  faixaStatus.textContent = mensagem;
}

function coletarMatrizDoTabuleiro() {
  const matriz = Array.from({ length: 9 }, () => Array(9).fill(0));
  document.querySelectorAll(".cell").forEach((input) => {
    const linha = Number(input.dataset.row);
    const coluna = Number(input.dataset.col);
    const valor = Number(input.value);
    matriz[linha][coluna] = Number.isInteger(valor) ? valor : 0;
  });
  return matriz;
}

function construirCargas(matriz) {
  const cargas = [];

  for (let linha = 0; linha < 9; linha += 1) {
    const celulas = matriz[linha].map((valor, coluna) => ({ linha, coluna, valor }));
    cargas.push({ tipo: "linha", indice: linha, celulas });
  }

  for (let coluna = 0; coluna < 9; coluna += 1) {
    const celulas = matriz.map((linhaValores, indiceLinha) => ({ linha: indiceLinha, coluna, valor: linhaValores[coluna] }));
    cargas.push({ tipo: "coluna", indice: coluna, celulas });
  }

  for (let bloco = 0; bloco < 9; bloco += 1) {
    const celulas = [];
    const linhaInicial = Math.floor(bloco / 3) * 3;
    const colunaInicial = (bloco % 3) * 3;
    for (let linha = linhaInicial; linha < linhaInicial + 3; linha += 1) {
      for (let coluna = colunaInicial; coluna < colunaInicial + 3; coluna += 1) {
        celulas.push({ linha, coluna, valor: matriz[linha][coluna] });
      }
    }
    cargas.push({ tipo: "bloco", indice: bloco, celulas });
  }

  return cargas;
}

function construirCargasParaCelula(matriz, linha, coluna) {
  const cargas = [];

  const celulasLinha = matriz[linha].map((valor, indiceColuna) => ({ linha, coluna: indiceColuna, valor }));
  cargas.push({ tipo: "linha", indice: linha, celulas: celulasLinha });

  const celulasColuna = matriz.map((valoresLinha, indiceLinha) => ({ linha: indiceLinha, coluna, valor: valoresLinha[coluna] }));
  cargas.push({ tipo: "coluna", indice: coluna, celulas: celulasColuna });

  const linhaInicial = Math.floor(linha / 3) * 3;
  const colunaInicial = Math.floor(coluna / 3) * 3;
  const celulasBloco = [];
  for (let l = linhaInicial; l < linhaInicial + 3; l += 1) {
    for (let c = colunaInicial; c < colunaInicial + 3; c += 1) {
      celulasBloco.push({ linha: l, coluna: c, valor: matriz[l][c] });
    }
  }
  const indiceBloco = Math.floor(linha / 3) * 3 + Math.floor(coluna / 3);
  cargas.push({ tipo: "bloco", indice: indiceBloco, celulas: celulasBloco });

  return cargas;
}

function executarWorkerValidacao(carga) {
  const tempoInicio = performance.now();
  return new Promise((resolve, reject) => {
    const worker = new Worker("validatorWorker.js");
    worker.onmessage = (evento) => {
      worker.terminate();
      resolve({ ...evento.data, duracao: performance.now() - tempoInicio });
    };
    worker.onerror = (erro) => {
      worker.terminate();
      reject(erro);
    };
    worker.postMessage(carga);
  });
}

async function validarTabuleiro() {
  limparDestaques();
  logThreads.innerHTML = "";
  definirStatus("Executando 27 threads em paralelo...");

  const matriz = coletarMatrizDoTabuleiro();
  const cargas = construirCargas(matriz);

  try {
    const resultados = await Promise.all(cargas.map(executarWorkerValidacao));
    const celulasProblematicas = [];
    let todasValidas = true;

    resultados.forEach((resultado) => {
      registrarResultadoThread(resultado);
      if (!resultado.valido) {
        todasValidas = false;
        celulasProblematicas.push(...resultado.posicoesInvalidas);
      }
    });

    destacarCelulasInvalidas(celulasProblematicas);

    if (todasValidas) {
      definirStatus("Parabens! Todas as threads confirmaram o tabuleiro.", "success");
    } else {
      definirStatus("Algumas threads reportaram problemas. Passe o mouse sobre as celulas destacadas.", "error");
    }
  } catch (erro) {
    console.error(erro);
    definirStatus("Erro ao executar as threads de validacao.", "error");
  }
}

async function tratarAlteracaoCelula(linha, coluna) {
  const matriz = coletarMatrizDoTabuleiro();
  const cargas = construirCargasParaCelula(matriz, linha, coluna);
  limparDestaquesUnidade(cargas);
  logThreads.innerHTML = "";

  try {
    const resultados = await Promise.all(cargas.map((carga) => executarWorkerValidacao({ ...carga, ignorarVazios: true })));
    const celulasProblematicas = [];
    resultados.forEach((resultado) => {
      if (!resultado.valido) {
        celulasProblematicas.push(
          ...resultado.posicoesInvalidas.filter((celula) => celula.problema === "duplicada")
        );
      }
      registrarResultadoThread(resultado, "live");
    });

    destacarCelulasInvalidas(celulasProblematicas);
    const descritor = `(${linha + 1}, ${coluna + 1})`;
    if (celulasProblematicas.length === 0) {
      definirStatus(`Threads da celula ${descritor} concluidas sem conflitos.`);
    } else {
      definirStatus(`Threads da celula ${descritor} encontraram conflito(s).`, "error");
    }
  } catch (erro) {
    console.error(erro);
    definirStatus("Erro ao validar threads da celula editada.", "error");
  }
}

function registrarResultadoThread(resultado, contexto = "full") {
  const item = document.createElement("li");
  item.classList.add(resultado.valido ? "success" : "error");
  const prefixo = contexto === "live" ? "[edicao] " : "";
  const descritor = `${prefixo}${ROTULOS_TIPOS[resultado.tipo]} ${resultado.indice + 1}`;
  const textoStatus = resultado.valido
    ? "OK"
    : `${resultado.posicoesInvalidas.length} conflito(s)`;

  item.innerHTML = `<span>${descritor}</span><strong>${textoStatus}</strong>`;
  const tempo = document.createElement("small");
  tempo.textContent = `${resultado.duracao.toFixed(1)} ms`;
  item.appendChild(tempo);

  logThreads.appendChild(item);
}

function destacarCelulasInvalidas(celulas) {
  const vistas = new Set();
  celulas.forEach((celula) => {
    const chave = `${celula.linha}-${celula.coluna}`;
    if (vistas.has(chave)) return;
    vistas.add(chave);
    const input = obterElementoCelula(celula.linha, celula.coluna);
    if (!input) return;
    input.classList.add("invalid");
    const rotulo = celula.problema === "duplicada"
      ? "valor repetido"
      : celula.problema === "vazia"
        ? "em branco ou invalido"
        : "valor fora do intervalo";
    input.title = `Problema: ${rotulo}`;
  });
}

function limparDestaques() {
  document.querySelectorAll(".cell").forEach((input) => {
    input.classList.remove("invalid", "valid-unit");
    input.removeAttribute("title");
  });
}

function limparDestaquesUnidade(cargas) {
  const vistas = new Set();
  cargas.forEach((carga) => {
    carga.celulas.forEach((celula) => {
      const chave = `${celula.linha}-${celula.coluna}`;
      if (vistas.has(chave)) return;
      vistas.add(chave);
      const input = obterElementoCelula(celula.linha, celula.coluna);
      if (!input) return;
      input.classList.remove("invalid", "valid-unit");
      input.removeAttribute("title");
    });
  });
}

function obterElementoCelula(linha, coluna) {
  return elementoTabuleiro.querySelector(`.cell[data-row="${linha}"][data-col="${coluna}"]`);
}

function clonarMatriz(matriz) {
  return matriz.map((linha) => [...linha]);
}

function construirConjuntoBloqueado(matriz) {
  const bloqueadas = new Set();
  matriz.forEach((linha, indiceLinha) => {
    linha.forEach((valor, indiceColuna) => {
      if (valor !== 0) {
        bloqueadas.add(`${indiceLinha}-${indiceColuna}`);
      }
    });
  });
  return bloqueadas;
}
