let aguardandoConfirmacao = false;
let ultimoClique = 0;
let janelaContadorTimer = null;

const ID_JANELA_CONTADOR = "janela-contador";
const CHAVE_CONTADOR = "contadorAprovacao";
const CHAVE_HISTORICO = "historicoContadorAprovacao";


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
 * Registra uma nova contagem e cria o histórico.
 */
function registrarContagem(identificadorUnico, dataHora) {

  // --------------------------------------------------
  // 1. Atualiza o contador
  // --------------------------------------------------

  const valorAtual = localStorage.getItem(CHAVE_CONTADOR);

  const contadorAtual = Number.parseInt(
    valorAtual || "0",
    10
  );

  const novoContador = contadorAtual + 1;

  localStorage.setItem(
    CHAVE_CONTADOR,
    String(novoContador)
  );

  mostrarJanelaContador(novoContador); // Exibe a página temporária do contador.


  // --------------------------------------------------
  // 2. Obtém o histórico existente
  // --------------------------------------------------

  let historico = [];

  try {

    const historicoSalvo =
      localStorage.getItem(CHAVE_HISTORICO);

    if (historicoSalvo) {
      historico = JSON.parse(historicoSalvo);
    }

  } catch (erro) {

    console.error(
      "[Contador SAFE] Erro ao ler histórico:",
      erro
    );

    historico = [];
  }


  // --------------------------------------------------
  // 3. Adiciona novo registro
  // --------------------------------------------------

  historico.push({
    identificadorUnico: identificadorUnico,
    dataHora: dataHora
  });


  // --------------------------------------------------
  // 4. Salva o histórico
  // --------------------------------------------------

  localStorage.setItem(
    CHAVE_HISTORICO,
    JSON.stringify(historico)
  );


  console.log(
    `[Contador SAFE] Contagem: ${novoContador}`
  );

  console.log(
    `[Contador SAFE] Identificador: ${identificadorUnico}`
  );

  console.log(
    `[Contador SAFE] Data/Hora: ${dataHora}`
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
  // Obtém o identificador antes de contabilizar
  // --------------------------------------------------

  const identificadorUnico =
    obterIdentificadorUnico();


  if (!identificadorUnico) {

    console.warn(
      "[Contador SAFE] Não foi possível localizar o Identificador Único."
    );

    return;
  }


  // --------------------------------------------------
  // Obtém data/hora
  // --------------------------------------------------

  const dataHora =
    obterDataHoraAtual();


  // --------------------------------------------------
  // Consome a confirmação
  // --------------------------------------------------

  aguardandoConfirmacao = false;


  // --------------------------------------------------
  // Registra contador + histórico
  // --------------------------------------------------

  registrarContagem(
    identificadorUnico,
    dataHora
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
