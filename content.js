let aguardandoConfirmacao = false;
let ultimoClique = 0;

const CHAVE_CONTADOR = "contadorAprovacao";


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

  const texto = elemento.querySelector(".mud-button-label");

  if (!label) {
    return false;
  }

  return normalizarTexto(label.textContent) === "SIM";
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
 * Incrementa o contador no armazenamento da página.
 */
function incrementarContador() {
  const valorAtual = localStorage.getItem(CHAVE_CONTADOR);

  const contadorAtual = Number.parseInt(valorAtual || "0", 10);

  const novoContador = contadorAtual + 1;

  localStorage.setItem(
    CHAVE_CONTADOR,
    String(novoContador)
  );

  console.log(
    `[Contador SAFE] Confirmação contabilizada. Total: ${novoContador}`
  );
}


/**
 * Clique no SIM.
 *
 * Só contabiliza se anteriormente houve
 * ENVIAR PARA APROVAÇÃO.
 */
function registrarConfirmacao() {

  if (!aguardandoConfirmacao) {

    console.log(
      "[Contador SAFE] SIM ignorado: não houve ENVIAR PARA APROVAÇÃO."
    );

    return;
  }


  const agora = Date.now();


  // Evita eventos duplicados.
  if (agora - ultimoClique < 100) {
    return;
  }


  ultimoClique = agora;


  // Consome a autorização.
  // Outro SIM não poderá ser contabilizado.
  aguardandoConfirmacao = false;


  incrementarContador();
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


    if (ehBotaoEnviarAprovacao(botao)) {

      registrarEnvioParaAprovacao();

      return;
    }


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
