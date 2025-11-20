self.onmessage = (event) => {
  const { kind, index, cells, ignoreEmpty = false } = event.data;
  const seen = new Map();
  const invalidPositions = [];
  const duplicateRegistry = new Set();

  cells.forEach((cell) => {
    const value = Number(cell.value);
    const basePayload = { row: cell.row, col: cell.col };

    if (!Number.isInteger(value) || value === 0) {
      if (!ignoreEmpty) {
        invalidPositions.push({ ...basePayload, issue: "empty" });
      }
      return;
    }

    if (value < 1 || value > 9) {
      invalidPositions.push({ ...basePayload, issue: "invalid" });
      return;
    }

    if (seen.has(value)) {
      const previous = seen.get(value);
      const previousKey = `${previous.row}-${previous.col}`;
      if (!duplicateRegistry.has(previousKey)) {
        invalidPositions.push({ row: previous.row, col: previous.col, issue: "duplicate" });
        duplicateRegistry.add(previousKey);
      }
      invalidPositions.push({ ...basePayload, issue: "duplicate" });
    } else {
      seen.set(value, basePayload);
    }
  });

  const valid = ignoreEmpty
    ? invalidPositions.length === 0
    : invalidPositions.length === 0 && seen.size === 9;
  self.postMessage({ kind, index, valid, invalidPositions });
};
