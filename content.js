// ============================================================
// CONTADOR SAFE
// VERSÃO 1.0.0
// CRIADO POR DERIK PIMENTEL
// ============================================================

const VERSAO = "1.0.0";

const CHAVE_DADOS_USUARIOS = "dadosContadorAprovacaoPorUsuario";

let aguardandoConfirmacao = false;
let ultimoClique = 0;


// ============================================================
// UTILITÁRIOS
// ============================================================

function normalizarTexto(texto) {
    return (texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}


function obterChaveUsuario(nomeUsuario) {
    return normalizarTexto(nomeUsuario).toUpperCase();
}


// ============================================================
// IDENTIFICADOR ÚNICO
// ============================================================

function obterIdentificadorUnico() {

    // --------------------------------------------------------
    // 1. Tentativa principal: elemento conhecido
    // --------------------------------------------------------

    const elemento = document.querySelector("#qjbk3g");

    if (elemento) {

        const texto = elemento.textContent.trim();

        if (texto) {
            return texto;
        }
    }


    // --------------------------------------------------------
    // 2. Tentativa alternativa:
    // procurar pelo padrão do identificador
    // --------------------------------------------------------

    const elementos =
        document.querySelectorAll(
            "h1, h2, h3, h4, h5, h6, p, span, div"
        );


    for (const elementoAtual of elementos) {

        const texto =
            elementoAtual.textContent.trim();


        // Exemplo:
        // PRT.001.00644161/2026-18

        const correspondencia =
            texto.match(
                /PRT\.\d+\.\d+\/\d{4}-\d+/i
            );


        if (correspondencia) {

            return correspondencia[0];
        }
    }


    // --------------------------------------------------------
    // 3. Não encontrado
    // --------------------------------------------------------

    return "Não identificado";
}


// ============================================================
// REPOSITÓRIO ARQUIVÍSTICO
// ============================================================

function obterRepositorioArquivistico() {

    const elementos = document.querySelectorAll(
        "p.mud-typography.mud-typography-body2"
    );

    for (const elemento of elementos) {

        const texto = elemento.textContent.trim();

        const normalizado = normalizarTexto(texto).toUpperCase();

        if (normalizado.startsWith("REPOSITORIO ARQUIVISTICO")) {

            return texto
                .replace(/^REPOSITÓRIO ARQUIVÍSTICO\s*/i, "")
                .trim();
        }
    }

    return "Não identificado";
}


// ============================================================
// USUÁRIO LOGADO
// ============================================================

function obterUsuarioLogado() {

    const elementos = document.querySelectorAll(
        "p.mud-typography.mud-typography-body2"
    );

    for (const elemento of elementos) {

        const estilo = elemento.getAttribute("style") || "";

        if (estilo.toLowerCase().includes("color:white")) {

            const nome = elemento.textContent.trim();

            if (nome) {
                return nome;
            }
        }
    }

    return "Usuário não identificado";
}


// ============================================================
// DATA E HORA
// ============================================================

function obterDataHoraAtual() {

    const agora = new Date();

    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const ano = agora.getFullYear();

    const hora = String(agora.getHours()).padStart(2, "0");
    const minuto = String(agora.getMinutes()).padStart(2, "0");
    const segundo = String(agora.getSeconds()).padStart(2, "0");

    return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
}


// ============================================================
// ESTRUTURA PADRÃO DO USUÁRIO
// ============================================================

function obterDadosUsuario(dadosUsuarios, chaveUsuario) {

    if (!dadosUsuarios[chaveUsuario]) {

        dadosUsuarios[chaveUsuario] = {
            contadorAprovacao: 0,
            contadorVerificar: 0,
            historico: []
        };
    }

    // Compatibilidade com estruturas anteriores
    if (
        typeof dadosUsuarios[chaveUsuario].contadorAprovacao !== "number"
    ) {
        dadosUsuarios[chaveUsuario].contadorAprovacao = 0;
    }

    if (
        typeof dadosUsuarios[chaveUsuario].contadorVerificar !== "number"
    ) {
        dadosUsuarios[chaveUsuario].contadorVerificar = 0;
    }

    if (!Array.isArray(dadosUsuarios[chaveUsuario].historico)) {
        dadosUsuarios[chaveUsuario].historico = [];
    }

    return dadosUsuarios[chaveUsuario];
}


// ============================================================
// REGISTRAR AÇÃO
// ============================================================

function registrarAcao(status) {

    const nomeUsuario = obterUsuarioLogado();

    const chaveUsuario = obterChaveUsuario(nomeUsuario);

    let dadosUsuarios = {};

    try {

        const dadosSalvos = localStorage.getItem(
            CHAVE_DADOS_USUARIOS
        );

        if (dadosSalvos) {
            dadosUsuarios = JSON.parse(dadosSalvos);
        }

    } catch (erro) {

        console.error(
            "Erro ao ler dados do contador:",
            erro
        );

        dadosUsuarios = {};
    }


    const dadosUsuario = obterDadosUsuario(
        dadosUsuarios,
        chaveUsuario
    );


    const registro = {

        status: status,

        repositorioArquivistico:
            obterRepositorioArquivistico(),

        identificadorUnico:
            obterIdentificadorUnico(),

        dataHora:
            obterDataHoraAtual(),

        nomeUsuario:
            nomeUsuario
    };


    // ========================================================
    // CONTADOR POR STATUS
    // ========================================================

    if (status === "Aprovação") {

        dadosUsuario.contadorAprovacao++;

    } else if (status === "Verificar") {

        dadosUsuario.contadorVerificar++;
    }


    // ========================================================
    // HISTÓRICO
    // ========================================================

    dadosUsuario.historico.push(registro);


    // ========================================================
    // SALVAR
    // ========================================================

    localStorage.setItem(
        CHAVE_DADOS_USUARIOS,
        JSON.stringify(dadosUsuarios)
    );


    // ========================================================
    // MOSTRAR CONTADOR
    // ========================================================

    mostrarContador(dadosUsuario);
}


// ============================================================
// CONTADOR TOTAL
// ============================================================

function obterContadorTotal(dadosUsuario) {

    return (
        (dadosUsuario.contadorAprovacao || 0) +
        (dadosUsuario.contadorVerificar || 0)
    );
}


// ============================================================
// OVERLAY
// ============================================================

let timerOverlay = null;


function mostrarContador(dadosUsuario) {

    let janela =
        document.querySelector("#janela-contador-cedae");


    if (!janela) {

        janela = document.createElement("div");

        janela.id = "janela-contador-cedae";

        janela.style.position = "fixed";
        janela.style.top = "20px";
        janela.style.right = "20px";
        janela.style.zIndex = "999999";
        janela.style.background = "#ffffff";
        janela.style.border = "1px solid #ccc";
        janela.style.borderRadius = "8px";
        janela.style.padding = "15px";
        janela.style.boxShadow =
            "0 4px 12px rgba(0,0,0,0.25)";
        janela.style.fontFamily = "Arial, sans-serif";
        janela.style.minWidth = "220px";

        document.body.appendChild(janela);
    }


    const total = obterContadorTotal(dadosUsuario);


    janela.innerHTML = `
        <div style="font-size:16px;font-weight:bold;margin-bottom:8px;">
            Contador CEDAE
        </div>

        <div style="font-size:30px;font-weight:bold;text-align:center;">
            ${total}
        </div>

        <div style="font-size:12px;text-align:center;margin-bottom:10px;">
            Total Geral
        </div>

        <div style="font-size:13px;">
            <strong>Aprovação:</strong>
            ${dadosUsuario.contadorAprovacao}
        </div>

        <div style="font-size:13px;">
            <strong>Verificar:</strong>
            ${dadosUsuario.contadorVerificar}
        </div>

        <div style="
            font-size:12px;
            color:#555;
            margin-top:8px;
            text-align:center;
        ">
            Confirmação contabilizada
        </div>
    `;


    janela.style.display = "block";


    if (timerOverlay) {
        clearTimeout(timerOverlay);
    }


    timerOverlay = setTimeout(() => {

        janela.style.display = "none";

    }, 10000);
}


// ============================================================
// DETECTAR ENVIAR PARA APROVAÇÃO
// ============================================================

document.addEventListener("click", function (evento) {

    const botao = evento.target.closest("button");

    if (!botao) {
        return;
    }


    const textoBotao =
        normalizarTexto(botao.textContent).toUpperCase();


    // ========================================================
    // ENVIAR PARA APROVAÇÃO
    // ========================================================

    if (
        textoBotao === "ENVIAR PARA APROVACAO"
    ) {

        aguardandoConfirmacao = true;

        return;
    }


    // ========================================================
    // CONFIRMAÇÃO SIM
    // ========================================================

    if (
        aguardandoConfirmacao &&
        textoBotao === "SIM"
    ) {

        const agora = Date.now();


        // Proteção contra duplo clique
        if (agora - ultimoClique < 1000) {
            return;
        }


        ultimoClique = agora;


        aguardandoConfirmacao = false;


        registrarAcao("Aprovação");
    }

});


// ============================================================
// PREPARAÇÃO FUTURA - A VERIFICAR
// ============================================================
//
// A detecção de "A VERIFICAR" ainda não está ativa.
//
// Quando identificarmos exatamente o botão/elemento utilizado
// pela página para essa operação, será possível chamar:
//
// registrarAcao("Verificar");
//
// ============================================================

console.log(
    `Contador SAFE v${VERSAO} carregado.`
);