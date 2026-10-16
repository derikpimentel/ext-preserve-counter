let aguardandoConfirmacao = false;
let ultimoClique = 0;
let janelaContadorTimer = null;

const CHAVE_DADOS_USUARIOS = "dadosContadorCedAprovacaoPorUsuario";

const ID_JANELA_CONTADOR = "janela-contador";


/**
 * Exibe uma janela flutuante dentro da página temporariamente.
 */
function mostrarJanelaContador(contador) {

  let janela = document.getElementById(ID_JANELA_CONTADOR);

  // Se a janela ainda não existir, cria.
  if (!janela) {

    janela = document.createElement("div");

    janela.id = ID_JANELA_CONTADOR;

    janela.innerHTML = `
      <div class="titulo">Contador SAFE</div>
      <div class="numero"></div>
      <div class="mensagem">Confirmação contabilizada</div>
    `;

    janela.style.position = "fixed";
    janela.style.top = "20px";
    janela.style.right = "20px";
    janela.style.width = "230px";
    janela.style.padding = "18px";
    janela.style.background = "#ffffff";
    janela.style.border = "1px solid #198754";
    janela.style.borderRadius = "10px";
    janela.style.boxShadow = "0 4px 15px rgba(0,0,0,0.20)";
    janela.style.zIndex = "2147483647";
    janela.style.fontFamily = "Arial, sans-serif";
    janela.style.textAlign = "center";
    janela.style.boxSizing = "border-box";

    const titulo = janela.querySelector(".titulo");

    titulo.style.fontSize = "16px";
    titulo.style.fontWeight = "bold";
    titulo.style.marginBottom = "8px";

    const numero = janela.querySelector(".numero");

    numero.style.fontSize = "36px";
    numero.style.fontWeight = "bold";
    numero.style.margin = "5px 0 8px";

    const mensagem = janela.querySelector(".mensagem");

    mensagem.style.fontSize = "12px";
    mensagem.style.color = "#555";

    document.body.appendChild(janela);
  }

  // Atualiza o número.
  const numero = janela.querySelector(".numero");

  numero.textContent = contador;


  // Mostra a janela.
  janela.style.display = "block";


  // Cancela o desaparecimento anterior.
  if (janelaContadorTimer) {
    clearTimeout(janelaContadorTimer);
  }


  // Esconde depois de 10 segundos.
  janelaContadorTimer = setTimeout(() => {

    janela.style.display = "none";

  }, 10000);
}


/**
 * Normaliza texto:
 * - remove acentos
 * - remove espaços extras
 * - converte para maiúsculas
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
 * Verifica se é o botão ENVIAR PARA APROVAÇÃO.
 */
function ehBotaoEnviarAprovacao(elemento) {
  if (!elemento || elemento.tagName !== "BUTTON") {
    return false;
  }

  const texto = normalizarTexto(elemento.textContent);

  return texto.includes("ENVIAR PARA APROVACAO");
}


/**
 * Verifica se é o botão SIM.
 */
function ehBotaoSim(elemento) {
  if (!elemento || elemento.tagName !== "BUTTON") {
    return false;
  }

  const label = elemento.querySelector(".mud-button-label");

  if (!label) {
    return false;
  }

  return normalizarTexto(label.textContent) === "SIM";
}


/**
 * Obtém o Identificador Único.
 *
 * Exemplo:
 * PRT.001.xxxxxxxx/xxxx-xx
 */
function obterIdentificadorUnico() {
  const elemento = document.querySelector(
    "h6.mud-typography.mud-typography-subtitle1.truncate"
  );

  if (!elemento) {
    return null;
  }

  const identificador = elemento.textContent
    .replace(/\s+/g, " ")
    .trim();

  return identificador || null;
}


/**
 * Obtém o Repositório Arquivístico.
 *
 * Exemplo na página:
 * REPOSITÓRIO ARQUIVÍSTICO CEDAE RJ
 *
 * Retorno:
 * CEDAE RJ
 */
function obterRepositorioArquivistico() {
  const elementos = document.querySelectorAll(
    "p.mud-typography.mud-typography-body2"
  );

  const prefixo = "REPOSITORIO ARQUIVISTICO";

  for (const elemento of elementos) {

    const textoOriginal = elemento.textContent
      .replace(/\s+/g, " ")
      .trim();

    const textoNormalizado =
      normalizarTexto(textoOriginal);

    if (textoNormalizado.startsWith(prefixo)) {

      const repositorio =
        textoNormalizado
          .substring(prefixo.length)
          .trim();

      return repositorio || null;
    }
  }

  return null;
}


/**
 * Obtém o nome do usuário logado.
 *
 * Procura o elemento:
 *
 * <p class="mud-typography mud-typography-body2"
 *    style="color:white">
 *   Derik Pimentel
 * </p>
 */
function obterNomeUsuario() {
  const elementos = document.querySelectorAll(
    "p.mud-typography.mud-typography-body2"
  );

  for (const elemento of elementos) {

    const estilo =
      (elemento.getAttribute("style") || "")
        .replace(/\s+/g, "")
        .toLowerCase();

    if (!estilo.includes("color:white")) {
      continue;
    }

    const nome = elemento.textContent
      .replace(/\s+/g, " ")
      .trim();

    if (nome) {
      return nome;
    }
  }

  return null;
}


/**
 * Formata a data/hora no padrão:
 *
 * DD/MM/AAAA HH:mm:ss
 *
 * Exemplo:
 * 05/10/2026 16:49:30
 */
function obterDataHoraAtual() {

  const agora = new Date();

  const dia = String(agora.getDate()).padStart(2, "0");
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const ano = agora.getFullYear();

  const horas = String(agora.getHours()).padStart(2, "0");
  const minutos = String(agora.getMinutes()).padStart(2, "0");
  const segundos = String(agora.getSeconds()).padStart(2, "0");

  return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
}


/**
 * Obtém o banco de dados de usuários.
 */
function obterDadosUsuarios() {

  try {

    const salvo =
      localStorage.getItem(
        CHAVE_DADOS_USUARIOS
      );

    if (!salvo) {
      return {};
    }

    const dados =
      JSON.parse(salvo);

    if (
      typeof dados !== "object" ||
      dados === null ||
      Array.isArray(dados)
    ) {
      return {};
    }

    return dados;

  } catch (erro) {

    console.error(
      "[Contador SAFE] Erro ao ler dados por usuário:",
      erro
    );

    return {};
  }
}


/**
 * Salva o banco de dados de usuários.
 */
function salvarDadosUsuarios(dados) {

  localStorage.setItem(
    CHAVE_DADOS_USUARIOS,
    JSON.stringify(dados)
  );
}


/**
 * Registra uma nova contagem
 * somente para o usuário atual.
 */
function registrarContagem(
  identificadorUnico,
  dataHora,
  repositorioArquivistico,
  nomeUsuario
) {

  const chaveUsuario =
    normalizarTexto(
      nomeUsuario
    );


  if (!chaveUsuario) {

    console.error(
      "[Contador SAFE] Usuário não identificado."
    );

    return;
  }


  const dadosUsuarios =
    obterDadosUsuarios();


  if (
    !dadosUsuarios[chaveUsuario]
  ) {

    dadosUsuarios[chaveUsuario] = {
      contador: 0,
      historico: []
    };
  }


  const dadosUsuario =
    dadosUsuarios[chaveUsuario];


  // ---------------------------------------------
  // Incrementa apenas o contador deste usuário
  // ---------------------------------------------

  dadosUsuario.contador =
    Number.parseInt(
      dadosUsuario.contador || 0,
      10
    ) + 1;


  // --------------------------------------------------
  // Adiciona novo registro deste usuário
  // --------------------------------------------------

  dadosUsuario.historico.push({
    identificadorUnico: identificadorUnico,
    dataHora: dataHora,
    repositorioArquivistico: repositorioArquivistico,
    nomeUsuario: nomeUsuario
  });


  // --------------------------------------------------
  // Salva estrutura completa
  // --------------------------------------------------

  dadosUsuarios[chaveUsuario] =
    dadosUsuario;


  salvarDadosUsuarios(
    dadosUsuarios
  );


  // ---------------------------------------------
  // Mostra contador
  // ---------------------------------------------

  mostrarJanelaContador(dadosUsuario.contador); // Exibe a página temporária do contador.


  console.log(
    `[Contador SAFE] Contagem: ${novoContador}`
  );

  console.log(
    `[Contador SAFE] Identificador: ${identificadorUnico}`
  );

  console.log(
    `[Contador SAFE] Data/Hora: ${dataHora}`
  );

  console.log(
    "[Contador SAFE] Repositório:", repositorioArquivistico
  );

  console.log(
    "[Contador SAFE] Usuário:", nomeUsuario
  );
}


/**
 * Clique em ENVIAR PARA APROVAÇÃO.
 */
function registrarEnvioParaAprovacao() {

  aguardandoConfirmacao = true;

  console.log(
    "[Contador SAFE] ENVIAR PARA APROVAÇÃO detectado."
  );

  console.log(
    "[Contador SAFE] Aguardando confirmação SIM."
  );
}


/**
 * Clique no SIM.
 *
 * Só contabiliza se anteriormente houve
 * ENVIAR PARA APROVAÇÃO.
 */
function registrarConfirmacao() {

  // --------------------------------------------------
  // Verifica se existe uma aprovação pendente
  // --------------------------------------------------

  if (!aguardandoConfirmacao) {

    console.log(
      "[Contador SAFE] SIM ignorado: não houve ENVIAR PARA APROVAÇÃO."
    );

    return;
  }


  // --------------------------------------------------
  // Proteção contra eventos duplicados
  // --------------------------------------------------

  const agora = Date.now();


  // Evita eventos duplicados.
  if (agora - ultimoClique < 100) {
    return;
  }

  ultimoClique = agora;


  // --------------------------------------------------
  // Obtém as informações antes de contabilizar
  // --------------------------------------------------

  const identificadorUnico =
    obterIdentificadorUnico() ||
    "Não identificado";

  const dataHora =
    obterDataHoraAtual();

  const repositorioArquivistico =
    obterRepositorioArquivistico() ||
    "Não identificado";

  const nomeUsuario =
    obterNomeUsuario() ||
    "Não identificado";


  if (identificadorUnico == "Não identificado") {

    console.warn(
      "[Contador SAFE] Não foi possível localizar o Identificador Único."
    );

    return;
  }

  if (repositorioArquivistico == "Não identificado") {

    console.warn(
      "[Contador SAFE] Não foi possível localizar o Repositório Arquivístico."
    );

    return;
  }

  if (nomeUsuario == "Não identificado") {

    console.warn(
      "[Contador SAFE] Não foi possível localizar o Usuário."
    );

    return;
  }


  // --------------------------------------------------
  // Consome a confirmação
  // --------------------------------------------------

  aguardandoConfirmacao = false;


  // --------------------------------------------------
  // Registra somente para este usuário
  // --------------------------------------------------

  registrarContagem(
    identificadorUnico,
    dataHora,
    repositorioArquivistico,
    nomeUsuario
  );
}


/**
 * Monitora os cliques na página.
 *
 * Usamos delegação de eventos para funcionar
 * mesmo quando o Blazor recria os botões.
 */
document.addEventListener(
  "click",
  (evento) => {

    const alvo = evento.target;

    if (!(alvo instanceof Element)) {
      return;
    }


    const botao = alvo.closest("button");

    if (!botao) {
      return;
    }


    // ENVIAR PARA APROVAÇÃO
    if (ehBotaoEnviarAprovacao(botao)) {

      registrarEnvioParaAprovacao();

      return;
    }


    // SIM
    if (ehBotaoSim(botao)) {

      registrarConfirmacao();

      return;
    }

  },
  true
);


console.log(
  "[Contador SAFE] Monitoramento iniciado."
);
