self.onmessage = (evento) => {
  const { tipo, indice, celulas, ignorarVazios = false } = evento.data;
  const vistos = new Map();
  const posicoesInvalidas = [];
  const registroDuplicados = new Set();

  celulas.forEach((celula) => {
    const valor = Number(celula.valor);
    const basePayload = { linha: celula.linha, coluna: celula.coluna };

    if (!Number.isInteger(valor) || valor === 0) {
      if (!ignorarVazios) {
        posicoesInvalidas.push({ ...basePayload, problema: "vazia" });
      }
      return;
    }

    if (valor < 1 || valor > 9) {
      posicoesInvalidas.push({ ...basePayload, problema: "invalida" });
      return;
    }

    if (vistos.has(valor)) {
      const anterior = vistos.get(valor);
      const chaveAnterior = `${anterior.linha}-${anterior.coluna}`;
      if (!registroDuplicados.has(chaveAnterior)) {
        posicoesInvalidas.push({ linha: anterior.linha, coluna: anterior.coluna, problema: "duplicada" });
        registroDuplicados.add(chaveAnterior);
      }
      posicoesInvalidas.push({ ...basePayload, problema: "duplicada" });
    } else {
      vistos.set(valor, basePayload);
    }
  });

  const valido = ignorarVazios
    ? posicoesInvalidas.length === 0
    : posicoesInvalidas.length === 0 && vistos.size === 9;
  self.postMessage({ tipo, indice, valido, posicoesInvalidas });
};
