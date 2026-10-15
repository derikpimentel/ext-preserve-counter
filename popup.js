const CHAVE_CONTADOR = "contadorAprovacao";
const CHAVE_HISTORICO = "historicoContadorAprovacao";


/**
 * Normaliza texto.
 */
function normalizarTexto(texto) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}


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
 * Obtém contador, histórico, usuário
 * e repositório da página atual.
 */
async function obterDados() {

  const aba = await obterAbaPreserve();

  if (!aba) {
    return {
      contador: 0,
      historico: [],
      usuario: "Não identificado",
      repositorio: "Não identificado"
    };
  }


  const resultado =
    await chrome.scripting.executeScript({

      target: {
        tabId: aba.id
      },

      func: (chaveContador, chaveHistorico) => {

        // -----------------------------------------
        // Contador
        // -----------------------------------------

        const contador =
          localStorage.getItem(chaveContador) || "0";


        // -----------------------------------------
        // Histórico
        // -----------------------------------------

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


        // -----------------------------------------
        // Normalização
        // -----------------------------------------

        function normalizarTexto(texto) {
          return (texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .toUpperCase();
        }


        // -----------------------------------------
        // Repositório
        // -----------------------------------------

        let repositorio =
          "Não identificado";

        const elementosRepositorio =
          document.querySelectorAll(
            "p.mud-typography.mud-typography-body2"
          );

        const prefixo =
          "REPOSITORIO ARQUIVISTICO";


        for (
          const elemento
          of elementosRepositorio
        ) {

          const texto =
            elemento.textContent
              .replace(/\s+/g, " ")
              .trim();

          const textoNormalizado =
            normalizarTexto(texto);


          if (
            textoNormalizado.startsWith(
              prefixo
            )
          ) {

            const valor =
              textoNormalizado
                .substring(
                  prefixo.length
                )
                .trim();

            if (valor) {
              repositorio = valor;
            }

            break;
          }
        }


        // -----------------------------------------
        // Usuário
        // -----------------------------------------

        let usuario =
          "Não identificado";


        for (
          const elemento
          of elementosRepositorio
        ) {

          const estilo =
            (
              elemento.getAttribute(
                "style"
              ) || ""
            )
              .replace(/\s+/g, "")
              .toLowerCase();


          if (
            !estilo.includes(
              "color:white"
            )
          ) {
            continue;
          }


          const nome =
            elemento.textContent
              .replace(/\s+/g, " ")
              .trim();


          if (nome) {
            usuario = nome;
            break;
          }
        }


        return {
          contador: Number.parseInt(
            contador,
            10
          ),

          historico: historico,

          usuario: usuario,

          repositorio: repositorio
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
      historico: [],
      usuario: "Não identificado",
      repositorio: "Não identificado"
    }
  );
}


/**
 * Atualiza contador, usuário,
 * repositório e histórico.
 */
async function atualizarTela() {

  const contadorElemento =
    document.getElementById("contador");

  const usuarioElemento =
    document.getElementById("usuario-logado");

  const repositorioElemento =
    document.getElementById(
      "repositorio-atual"
    );

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


    // -----------------------------------------
    // Usuário
    // -----------------------------------------

    usuarioElemento.textContent =
      dados.usuario;


    // -----------------------------------------
    // Repositório
    // -----------------------------------------

    repositorioElemento.textContent =
      dados.repositorio;


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

    usuarioElemento.textContent =
      "Não identificado";

    repositorioElemento.textContent =
      "Não identificado";
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
