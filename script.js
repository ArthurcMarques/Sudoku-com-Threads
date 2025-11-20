function shuffle(array) {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function buildSolvedBoard() {
  const base = [0, 1, 2];
  const rows = shuffle(base).flatMap((group) => shuffle(base).map((r) => group * 3 + r));
  const cols = shuffle(base).flatMap((group) => shuffle(base).map((c) => group * 3 + c));
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));

  const pattern = (row, col) => (row * 3 + Math.floor(row / 3) + col) % 9;

  rows.forEach((r, rowIndex) => {
    cols.forEach((c, colIndex) => {
      board[rowIndex][colIndex] = pattern(r, c) + 1;
    });
  });

  return board;
}

function maskBoard(solution, hideRatio = 0.6) {
  const masked = solution.map((row) => [...row]);
  masked.forEach((row, r) => {
    row.forEach((_, c) => {
      if (Math.random() < hideRatio) {
        masked[r][c] = 0;
      }
    });
  });
  return masked;
}

function generateRandomPuzzle() {
  const solution = buildSolvedBoard();
  const clues = maskBoard(solution, 0.62);
  const stamp = Math.floor(Math.random() * 10000);
  return { name: `Aleatorio #${stamp}`, clues };
}

const KIND_LABELS = {
  row: "Linha",
  column: "Coluna",
  box: "Sub-grade",
};

const boardElement = document.getElementById("sudoku-board");
const statusBanner = document.getElementById("status-banner");
const threadLog = document.getElementById("thread-log");

const state = {
  template: null,
  lockedCells: new Set(),
  puzzleName: "",
};

init();

function init() {
  loadRandomPuzzle();
  document.getElementById("btn-new").addEventListener("click", loadRandomPuzzle);
  document.getElementById("btn-reset").addEventListener("click", resetBoard);
  document.getElementById("btn-clear").addEventListener("click", clearEditableCells);
  document.getElementById("btn-check").addEventListener("click", validateBoard);
}

function loadRandomPuzzle() {
  const picked = generateRandomPuzzle();
  state.template = cloneMatrix(picked.clues);
  state.lockedCells = buildLockedSet(picked.clues);
  state.puzzleName = picked.name;
  renderBoard(state.template);
  setStatus(`Desafio aleatorio (${picked.name}) pronto. Boa sorte!`);
  threadLog.innerHTML = "";
}

function renderBoard(matrix) {
  boardElement.innerHTML = "";
  matrix.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      const input = document.createElement("input");
      input.type = "text";
      input.classList.add("cell");
      input.dataset.row = String(rowIndex);
      input.dataset.col = String(colIndex);
      input.autocomplete = "off";
      input.inputMode = "numeric";
      input.pattern = "[1-9]";
      if ((colIndex + 1) % 3 === 0 && colIndex !== 8) {
        input.classList.add("block-right");
      }
      if ((rowIndex + 1) % 3 === 0 && rowIndex !== 8) {
        input.classList.add("block-bottom");
      }
      const key = `${rowIndex}-${colIndex}`;
      if (state.lockedCells.has(key) && value !== 0) {
        input.value = value;
        input.disabled = true;
        input.classList.add("prefilled");
      }
      input.addEventListener("input", () => {
        enforceNumericSymbol(input);
        handleCellChange(rowIndex, colIndex);
      });
      boardElement.appendChild(input);
    });
  });
  clearHighlights();
}

function enforceNumericSymbol(input) {
  let clean = input.value.replace(/[^\d]/g, "");
  if (clean.length > 1) {
    clean = clean.charAt(0);
  }
  if (clean && (clean === "0" || Number(clean) > 9)) {
    clean = "";
  }
  input.value = clean;
}

function resetBoard() {
  if (!state.template) return;
  document.querySelectorAll(".cell").forEach((input) => {
    const row = Number(input.dataset.row);
    const col = Number(input.dataset.col);
    if (state.lockedCells.has(`${row}-${col}`)) {
      input.value = state.template[row][col] || "";
    } else {
      input.value = "";
    }
  });
  clearHighlights();
  threadLog.innerHTML = "";
  setStatus("Tabuleiro reiniciado para o desafio atual.");
}

function clearEditableCells() {
  document.querySelectorAll(".cell").forEach((input) => {
    const row = Number(input.dataset.row);
    const col = Number(input.dataset.col);
    if (!state.lockedCells.has(`${row}-${col}`)) {
      input.value = "";
    }
  });
  clearHighlights();
  setStatus("Células livres limpas. Complete antes de rodar as threads.");
}

function setStatus(message, variant = null) {
  statusBanner.classList.remove("success", "error");
  if (variant) {
    statusBanner.classList.add(variant);
  }
  statusBanner.textContent = message;
}

function collectMatrixFromBoard() {
  const matrix = Array.from({ length: 9 }, () => Array(9).fill(0));
  document.querySelectorAll(".cell").forEach((input) => {
    const row = Number(input.dataset.row);
    const col = Number(input.dataset.col);
    const value = Number(input.value);
    matrix[row][col] = Number.isInteger(value) ? value : 0;
  });
  return matrix;
}

function buildPayloads(matrix) {
  const payloads = [];

  for (let row = 0; row < 9; row += 1) {
    const cells = matrix[row].map((value, col) => ({ row, col, value }));
    payloads.push({ kind: "row", index: row, cells });
  }

  for (let col = 0; col < 9; col += 1) {
    const cells = matrix.map((row, rowIndex) => ({ row: rowIndex, col, value: row[col] }));
    payloads.push({ kind: "column", index: col, cells });
  }

  for (let box = 0; box < 9; box += 1) {
    const cells = [];
    const startRow = Math.floor(box / 3) * 3;
    const startCol = (box % 3) * 3;
    for (let r = startRow; r < startRow + 3; r += 1) {
      for (let c = startCol; c < startCol + 3; c += 1) {
        cells.push({ row: r, col: c, value: matrix[r][c] });
      }
    }
    payloads.push({ kind: "box", index: box, cells });
  }

  return payloads;
}

function buildPayloadsForCell(matrix, row, col) {
  const payloads = [];

  const rowCells = matrix[row].map((value, colIndex) => ({ row, col: colIndex, value }));
  payloads.push({ kind: "row", index: row, cells: rowCells });

  const colCells = matrix.map((rowValues, rowIndex) => ({ row: rowIndex, col, value: rowValues[col] }));
  payloads.push({ kind: "column", index: col, cells: colCells });

  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  const boxCells = [];
  for (let r = startRow; r < startRow + 3; r += 1) {
    for (let c = startCol; c < startCol + 3; c += 1) {
      boxCells.push({ row: r, col: c, value: matrix[r][c] });
    }
  }
  const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
  payloads.push({ kind: "box", index: boxIndex, cells: boxCells });

  return payloads;
}

function runValidationWorker(payload) {
  const startTime = performance.now();
  return new Promise((resolve, reject) => {
    const worker = new Worker("validatorWorker.js");
    worker.onmessage = (event) => {
      worker.terminate();
      resolve({ ...event.data, duration: performance.now() - startTime });
    };
    worker.onerror = (error) => {
      worker.terminate();
      reject(error);
    };
    worker.postMessage(payload);
  });
}

async function validateBoard() {
  clearHighlights();
  threadLog.innerHTML = "";
  setStatus("Executando 27 threads em paralelo...");

  const matrix = collectMatrixFromBoard();
  const payloads = buildPayloads(matrix);

  try {
    const results = await Promise.all(payloads.map(runValidationWorker));
    const problematicCells = [];
    let allValid = true;

    results.forEach((result) => {
      logThreadResult(result);
      if (!result.valid) {
        allValid = false;
        problematicCells.push(...result.invalidPositions);
      }
    });

    highlightInvalidCells(problematicCells);

    if (allValid) {
      setStatus("Parabéns! Todas as threads confirmaram o tabuleiro.", "success");
    } else {
      setStatus("Algumas threads reportaram problemas. Passe o mouse sobre as células destacadas.", "error");
    }
  } catch (error) {
    console.error(error);
    setStatus("Erro ao executar as threads de validação.", "error");
  }
}

async function handleCellChange(row, col) {
  const matrix = collectMatrixFromBoard();
  const payloads = buildPayloadsForCell(matrix, row, col);
  clearUnitHighlights(payloads);

  try {
    const results = await Promise.all(payloads.map((payload) => runValidationWorker({ ...payload, ignoreEmpty: true })));
    const problematicCells = [];
    results.forEach((result) => {
      if (!result.valid) {
        problematicCells.push(
          ...result.invalidPositions.filter((cell) => cell.issue === "duplicate")
        );
      }
    });

    highlightInvalidCells(problematicCells);
    const descriptor = `(${row + 1}, ${col + 1})`;
    if (problematicCells.length === 0) {
      setStatus(`Threads da celula ${descriptor} concluidas sem conflitos.`);
    } else {
      setStatus(`Threads da celula ${descriptor} encontraram conflito(s).`, "error");
    }
  } catch (error) {
    console.error(error);
    setStatus("Erro ao validar threads da celula editada.", "error");
  }
}

function logThreadResult(result) {
  const item = document.createElement("li");
  item.classList.add(result.valid ? "success" : "error");
  const descriptor = `${KIND_LABELS[result.kind]} ${result.index + 1}`;
  const statusText = result.valid
    ? "OK"
    : `${result.invalidPositions.length} conflito(s)`;

  item.innerHTML = `<span>${descriptor}</span><strong>${statusText}</strong>`;
  const timing = document.createElement("small");
  timing.textContent = `${result.duration.toFixed(1)} ms`;
  item.appendChild(timing);

  threadLog.appendChild(item);
}

function highlightInvalidCells(cells) {
  const seen = new Set();
  cells.forEach((cell) => {
    const key = `${cell.row}-${cell.col}`;
    if (seen.has(key)) return;
    seen.add(key);
    const input = getCellElement(cell.row, cell.col);
    if (!input) return;
    input.classList.add("invalid");
    const label = cell.issue === "duplicate"
      ? "valor repetido"
      : cell.issue === "empty"
        ? "em branco ou inválido"
        : "valor fora do intervalo";
    input.title = `Problema: ${label}`;
  });
}

function clearHighlights() {
  document.querySelectorAll(".cell").forEach((input) => {
    input.classList.remove("invalid", "valid-unit");
    input.removeAttribute("title");
  });
}

function clearUnitHighlights(payloads) {
  const seen = new Set();
  payloads.forEach((payload) => {
    payload.cells.forEach((cell) => {
      const key = `${cell.row}-${cell.col}`;
      if (seen.has(key)) return;
      seen.add(key);
      const input = getCellElement(cell.row, cell.col);
      if (!input) return;
      input.classList.remove("invalid", "valid-unit");
      input.removeAttribute("title");
    });
  });
}

function getCellElement(row, col) {
  return boardElement.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
}

function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

function buildLockedSet(matrix) {
  const locked = new Set();
  matrix.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value !== 0) {
        locked.add(`${rowIndex}-${colIndex}`);
      }
    });
  });
  return locked;
}
