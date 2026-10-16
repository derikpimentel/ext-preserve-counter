const CHAVE_DADOS_USUARIOS = "dadosContadorAprovacaoPorUsuario";


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
 * Obtém dados do usuário atualmente logado
 * e seus respectivos registros.
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

      func: (chaveDadosUsuarios) => {


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


        // Busca os elementos da página
        const elementos =
          document.querySelectorAll(
            "p.mud-typography.mud-typography-body2"
          );


        // -----------------------------------------
        // Repositório
        // -----------------------------------------

        let repositorio =
          "Não identificado";

        const prefixo =
          "REPOSITORIO ARQUIVISTICO";


        for (
          const elemento
          of elementos
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
          of elementos
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


        // -----------------------------------------
        // Banco de dados dos usuários
        // -----------------------------------------

        let dadosUsuarios =
          {};


        try {

          const salvo =
            localStorage.getItem(
              chaveDadosUsuarios
            );


          if (salvo) {

            dadosUsuarios =
              JSON.parse(
                salvo
              );
          }

        } catch (erro) {

          dadosUsuarios = {};
        }


        // -----------------------------------------
        // Localiza dados deste usuário
        // -----------------------------------------

        const chaveUsuario =
          normalizarTexto(
            usuario
          );


        const dadosUsuario =
          dadosUsuarios[
            chaveUsuario
          ] || {
            contador: 0,
            historico: []
          };


        return {

          contador: Number.parseInt(
            dadosUsuario.contador || 0,
            10
          ),

          historico:
            Array.isArray(
              dadosUsuario.historico
            )
              ? dadosUsuario.historico
              : [],

          usuario: usuario,

          repositorio: repositorio
        };
      },

      args: [
        CHAVE_DADOS_USUARIOS
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
 * Atualiza a tela.
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
 * Zera contador e histórico,
 * somente do usuário atual.
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
        chaveDadosUsuarios
      ) => {

        function normalizarTexto(
          texto
        ) {

          return (texto || "")
            .normalize("NFD")
            .replace(
              /[\u0300-\u036f]/g,
              ""
            )
            .replace(
              /\s+/g,
              " "
            )
            .trim()
            .toUpperCase();
        }


        // -----------------------------------------
        // Localiza usuário atual
        // -----------------------------------------

        let usuario =
          null;


        const elementos =
          document.querySelectorAll(
            "p.mud-typography.mud-typography-body2"
          );


        for (
          const elemento
          of elementos
        ) {

          const estilo =
            (
              elemento.getAttribute(
                "style"
              ) || ""
            )
              .replace(
                /\s+/g,
                ""
              )
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
              .replace(
                /\s+/g,
                " "
              )
              .trim();


          if (nome) {

            usuario =
              nome;

            break;
          }
        }


        if (!usuario) {
          return;
        }


        const chaveUsuario =
          normalizarTexto(
            usuario
          );


        // -----------------------------------------
        // Obtém dados existentes
        // -----------------------------------------

        let dadosUsuarios =
          {};


        try {

          const salvo =
            localStorage.getItem(
              chaveDadosUsuarios
            );


          if (salvo) {

            dadosUsuarios =
              JSON.parse(
                salvo
              );
          }

        } catch (erro) {

          dadosUsuarios = {};
        }


        // -----------------------------------------
        // Zera somente este usuário
        // -----------------------------------------

        dadosUsuarios[
          chaveUsuario
        ] = {

          contador: 0,

          historico: []
        };


        localStorage.setItem(

          chaveDadosUsuarios,

          JSON.stringify(
            dadosUsuarios
          )
        );

      },

      args: [
        CHAVE_DADOS_USUARIOS
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
