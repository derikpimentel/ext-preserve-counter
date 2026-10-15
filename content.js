let ultimoClique = 0;

function ehBotaoSim(elemento) {
  if (!elemento || elemento.tagName !== "BUTTON") {
    return false;
  }

  const texto = elemento.querySelector(".mud-button-label");

  if (!texto) {
    return false;
  }

  return texto.textContent.trim() === "Sim";
}

function registrarClique() {
  const agora = Date.now();

  // Evita contar duas vezes o mesmo evento em situações
  // em que a interface dispara eventos muito rapidamente.
  if (agora - ultimoClique < 100) {
    return;
  }

  ultimoClique = agora;

  chrome.storage.local.get(
    ["contador"],
    (resultado) => {
      const contadorAtual = resultado.contador || 0;

      chrome.storage.local.set({
        contador: contadorAtual + 1
      });
    }
  );
}

function configurarBotao(botao) {
  if (botao.dataset.contadorCedae === "true") {
    return;
  }

  botao.dataset.contadorCedae = "true";

  botao.addEventListener("click", registrarClique);
}

function procurarBotoes() {
  const botoes = document.querySelectorAll("button");

  botoes.forEach((botao) => {
    if (ehBotaoSim(botao)) {
      configurarBotao(botao);
    }
  });
}

// Primeira procura
procurarBotoes();

// Observa alterações na página.
// Isso é importante para interfaces como MudBlazor/Blazor,
// que podem criar ou substituir elementos depois do carregamento.
const observer = new MutationObserver(() => {
  procurarBotoes();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});