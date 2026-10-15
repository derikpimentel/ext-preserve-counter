const CHAVE_CONTADOR = "contadorAprovacao";


async function obterAbaPreserve() {
  const abas = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!abas.length) {
    return null;
  }

  const aba = abas[0];

  if (
    !aba.url ||
    !aba.url.startsWith("https://preserve.cedae.com.br/")
  ) {
    return null;
  }

  return aba;
}


async function atualizarContador() {

  const contadorElemento =
    document.getElementById("contador");

  try {

    const aba = await obterAbaPreserve();

    if (!aba) {
      contadorElemento.textContent = "0";
      return;
    }


    const resultado =
      await chrome.scripting.executeScript({
        target: {
          tabId: aba.id
        },

        func: (chave) => {
          return localStorage.getItem(chave) || "0";
        },

        args: [CHAVE_CONTADOR]
      });


    const contador =
      resultado?.[0]?.result || "0";


    contadorElemento.textContent = contador;

  } catch (erro) {

    console.error(
      "[Contador SAFE] Erro ao obter contador:",
      erro
    );

    contadorElemento.textContent = "0";
  }
}


async function zerarContador() {

  try {

    const aba = await obterAbaPreserve();

    if (!aba) {
      return;
    }


    await chrome.scripting.executeScript({
      target: {
        tabId: aba.id
      },

      func: (chave) => {
        localStorage.setItem(chave, "0");
      },

      args: [CHAVE_CONTADOR]
    });


    atualizarContador();

  } catch (erro) {

    console.error(
      "[Contador SAFE] Erro ao zerar contador:",
      erro
    );
  }
}


document
  .getElementById("zerar")
  .addEventListener(
    "click",
    zerarContador
  );

atualizarContador();