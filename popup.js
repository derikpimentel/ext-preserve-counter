const CHAVE_CONTADOR = "contadorAprovacao";
const CHAVE_HISTORICO = "historicoContadorAprovacao";


/**
 * Obtém a aba ativa do Preserve CEDAE.
 */
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


/**
 * Obtém contador e histórico da página.
 */
async function obterDados() {

  const aba = await obterAbaPreserve();

  if (!aba) {
    return {
      contador: 0,
      historico: []
    };
  }


  const resultado =
    await chrome.scripting.executeScript({

      target: {
        tabId: aba.id
      },

      func: (chaveContador, chaveHistorico) => {

        const contador =
          localStorage.getItem(chaveContador) || "0";


        let historico = [];

        try {

          const salvo =
            localStorage.getItem(chaveHistorico);

          if (salvo) {
            historico = JSON.parse(salvo);
          }

        } catch (erro) {

          historico = [];
        }


        return {
          contador: Number.parseInt(
            contador,
            10
          ),

          historico: historico
        };
      },

      args: [
        CHAVE_CONTADOR,
        CHAVE_HISTORICO
      ]

    });


  return (
    resultado?.[0]?.result || {
      contador: 0,
      historico: []
    }
  );
}


/**
 * Atualiza o contador e o histórico na tela.
 */
async function atualizarTela() {

  const contadorElemento =
    document.getElementById("contador");

  const historicoElemento =
    document.getElementById("historico");


try {

    const dados =
      await obterDados();


    // ---------------------------------------------
    // Contador
    // ---------------------------------------------

    contadorElemento.textContent =
      dados.contador;


    // ---------------------------------------------
    // Histórico
    // ---------------------------------------------

    historicoElemento.innerHTML = "";


    if (
      !dados.historico ||
      dados.historico.length === 0
    ) {

      const linha =
        document.createElement("tr");

      const coluna =
        document.createElement("td");

      coluna.colSpan = 2;

      coluna.className =
        "sem-registros";

      coluna.textContent =
        "Nenhum registro.";

      linha.appendChild(coluna);

      historicoElemento.appendChild(linha);

      return;
    }


    // Mais recente primeiro
    const historico =
      [...dados.historico].reverse();


    historico.forEach((registro) => {

      const linha =
        document.createElement("tr");


      const colunaIdentificador =
        document.createElement("td");

      colunaIdentificador.textContent =
        registro.identificadorUnico || "";


      const colunaDataHora =
        document.createElement("td");

      colunaDataHora.textContent =
        registro.dataHora || "";


      linha.appendChild(
        colunaIdentificador
      );

      linha.appendChild(
        colunaDataHora
      );


      historicoElemento.appendChild(
        linha
      );
    });

  } catch (erro) {

    console.error(
      "[Contador SAFE] Erro ao atualizar tela:",
      erro
    );

    contadorElemento.textContent = "0";
  }
}


/**
 * Zera contador e histórico.
 */
async function zerarDados() {

  try {

    const aba =
      await obterAbaPreserve();


    if (!aba) {
      return;
    }


    await chrome.scripting.executeScript({

      target: {
        tabId: aba.id
      },

      func: (
        chaveContador,
        chaveHistorico
      ) => {

        localStorage.setItem(
          chaveContador,
          "0"
        );

        localStorage.setItem(
          chaveHistorico,
          JSON.stringify([])
        );

      },

      args: [
        CHAVE_CONTADOR,
        CHAVE_HISTORICO
      ]

    });


    await atualizarTela();

  } catch (erro) {

    console.error(
      "[Contador SAFE] Erro ao zerar dados:",
      erro
    );
  }
}


/**
 * Botão Zerar.
 */
document
  .getElementById("zerar")
  .addEventListener(
    "click",
    zerarDados
  );


/**
 * Inicialização.
 */
atualizarTela();
