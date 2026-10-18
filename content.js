// ============================================================
// CONTADOR SAFE
// VERSÃO 1.0.0
// CRIADO POR DERIK PIMENTEL
// ============================================================

const VERSAO = "1.0.0";

const CHAVE_DADOS_USUARIOS = "dadosContadorAprovacaoPorUsuario";

let aguardandoConfirmacao = false;
let ultimoClique = 0;
let ultimoCliqueVerificar = 0;


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
        // PRT.001.xxxxxxxx/xxxx-xx

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

    const dadosUsuarios =
        JSON.parse(
            localStorage.getItem(CHAVE_DADOS_USUARIOS) || "{}"
        );

    // CORREÇÃO:
    // A função existente no código é obterUsuarioLogado()
    const usuarioAtual =
        obterUsuarioLogado();

    if (
        !usuarioAtual ||
        usuarioAtual === "Usuário não identificado"
    ) {
        console.warn(
            "[SAFE] Não foi possível identificar o usuário."
        );
        return;
    }

    const chaveUsuario =
        obterChaveUsuario(usuarioAtual);

    const dadosUsuario = obterDadosUsuario(
        dadosUsuarios,
        chaveUsuario
    );

    const identificadorUnico =
        obterIdentificadorUnico();

    const repositorioArquivistico =
        obterRepositorioArquivistico();

    const dataHora =
        obterDataHoraAtual();


    console.log("==========================================");
    console.log("[SAFE] REGISTRAR AÇÃO");
    console.log("[SAFE] Status:", status);
    console.log("[SAFE] Usuário:", usuarioAtual);
    console.log("[SAFE] Chave usuário:", chaveUsuario);
    console.log("[SAFE] Identificador:", identificadorUnico);
    console.log(
        "[SAFE] Repositório:",
        repositorioArquivistico
    );
    console.log("==========================================");


    // ============================================================
    // TRANSIÇÃO:
    //
    // VERIFICAR → APROVAÇÃO
    //
    // O mesmo objeto não deve ocupar duas posições no contador.
    // ============================================================

    if (status === "Aprovação") {

        const registroVerificar =
            dadosUsuario.historico.find(
                registro =>
                    registro.identificadorUnico ===
                        identificadorUnico &&
                    registro.status === "Verificar"
            );

        if (registroVerificar) {

            console.log(
                "[SAFE] Objeto encontrado como VERIFICAR."
            );

            console.log(
                "[SAFE] Executando transição VERIFICAR → APROVAÇÃO."
            );


            // ----------------------------------------------------
            // Remove do contador de Verificar
            // ----------------------------------------------------

            if (
                dadosUsuario.contadorVerificar > 0
            ) {
                dadosUsuario.contadorVerificar--;
            }


            // ----------------------------------------------------
            // Adiciona ao contador de Aprovação
            // ----------------------------------------------------

            dadosUsuario.contadorAprovacao++;


            // ----------------------------------------------------
            // Altera o registro existente
            // ----------------------------------------------------

            registroVerificar.status =
                "Aprovação";

            registroVerificar.dataHora =
                dataHora;

            registroVerificar.repositorioArquivistico =
                repositorioArquivistico;

            registroVerificar.nomeUsuario =
                usuarioAtual;


            // ----------------------------------------------------
            // Salva
            // ----------------------------------------------------

            localStorage.setItem(
                CHAVE_DADOS_USUARIOS,
                JSON.stringify(dadosUsuarios)
            );


            // ----------------------------------------------------
            // Atualiza o contador visual
            // ----------------------------------------------------

            mostrarContador(dadosUsuario);


            console.log(
                "[SAFE] VERIFICAR → APROVAÇÃO concluído."
            );

            console.log(
                "[SAFE] Aprovação:",
                dadosUsuario.contadorAprovacao
            );

            console.log(
                "[SAFE] Verificar:",
                dadosUsuario.contadorVerificar
            );

            console.log(
                "[SAFE] Total:",
                dadosUsuario.contadorAprovacao +
                dadosUsuario.contadorVerificar
            );

            return;
        }
    }


    // ========================================================
    // PROTEÇÃO CONTRA DUPLICIDADE
    // ========================================================

    const registroExistente =
        dadosUsuario.historico.some(
            registro =>
                registro.identificadorUnico ===
                    identificadorUnico &&
                registro.status === status
        );


    if (
        identificadorUnico !== "Não identificado" &&
        registroExistente
    ) {

        console.log(
            `Registro já contabilizado: ${identificadorUnico} - ${status}`
        );

        return;
    }


    // ========================================================
    // NOVO REGISTRO
    // ========================================================

    const novoRegistro = {

        status: status,

        repositorioArquivistico:
            repositorioArquivistico,

        identificadorUnico:
            identificadorUnico,

        dataHora:
            dataHora,

        nomeUsuario:
            usuarioAtual
    };


    // ========================================================
    // HISTÓRICO
    // ========================================================

    dadosUsuario.historico.push(novoRegistro);


    // ========================================================
    // CONTADOR POR STATUS
    // ========================================================

    if (status === "Aprovação") {

        dadosUsuario.contadorAprovacao++;

    } else if (status === "Verificar") {

        dadosUsuario.contadorVerificar++;
    }


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


    // ============================================================
    // LOG
    // ============================================================


    console.log(
        `Objeto contabilizado: ${status}`,
        novoRegistro
    );
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
        document.querySelector("#janela-contador");


    if (!janela) {

        janela = document.createElement("div");

        janela.id = "janela-contador";

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
            Contador SAFE
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
            ${dadosUsuario.contadorVerificar > 0
                ? "Ação contabilizada"
                : "Confirmação contabilizada"}
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
// LOCALIZAR INPUT PELO CONTROLE DO MUDBLAZOR
// ============================================================

function obterInputPorRotulo(rotulo) {

    const rotuloNormalizado =
        normalizarTexto(rotulo).toUpperCase();


    const controles =
        document.querySelectorAll(
            ".mud-input-control"
        );


    console.log(
        `[SAFE] Procurando campo: ${rotulo}`
    );


    for (const controle of controles) {

        const textoControle =
            normalizarTexto(
                controle.textContent
            ).toUpperCase();


        const input =
            controle.querySelector(
                "input.mud-input-slot"
            );


        if (!input) {
            continue;
        }


        console.log(
            "[SAFE] Controle encontrado:",
            textoControle,
            "Valor:",
            input.value
        );


        if (
            textoControle.includes(
                rotuloNormalizado
            )
        ) {

            console.log(
                `[SAFE] Campo "${rotulo}" identificado.`,
                input
            );


            return input;
        }
    }


    console.warn(
        `[SAFE] Campo "${rotulo}" não foi encontrado.`
    );


    return null;
}


// ============================================================
// REPOSITÓRIO FÍSICO
// ============================================================

function obterRepositorioFisico() {

    const input =
        obterInputPorRotulo(
            "Repositorio Fisico"
        );


    if (!input) {

        return "";
    }


    return (
        input.value ||
        input.getAttribute("value") ||
        ""
    ).trim();
}


// ============================================================
// LOCALIZAÇÃO FÍSICA
// ============================================================

function obterLocalizacaoFisica() {

    const input =
        obterInputPorRotulo(
            "Localização Fisica"
        );


    if (!input) {

        return "";
    }


    return (
        input.value ||
        input.getAttribute("value") ||
        ""
    ).trim();
}


// ============================================================
// VERIFICAR SE EXISTE "VERIFICAR"
// ============================================================

function possuiVerificar() {

    const repositorioFisico =
        obterRepositorioFisico();


    const localizacaoFisica =
        obterLocalizacaoFisica();


    const repositorioNormalizado =
        normalizarTexto(
            repositorioFisico
        ).toUpperCase();


    const localizacaoNormalizada =
        normalizarTexto(
            localizacaoFisica
        ).toUpperCase();


    const verificarRepositorio =
        repositorioNormalizado.includes(
            "VERIFICAR"
        );


    const verificarLocalizacao =
        localizacaoNormalizada.includes(
            "VERIFICAR"
        );


    console.log(
        "=========================================="
    );

    console.log(
        "[SAFE] VERIFICAÇÃO DE A VERIFICAR"
    );

    console.log(
        "[SAFE] Repositório Físico:",
        repositorioFisico
    );

    console.log(
        "[SAFE] Localização Física:",
        localizacaoFisica
    );

    console.log(
        "[SAFE] Verificar no Repositório:",
        verificarRepositorio
    );

    console.log(
        "[SAFE] Verificar na Localização:",
        verificarLocalizacao
    );

    console.log(
        "[SAFE] Resultado:",
        verificarRepositorio ||
        verificarLocalizacao
    );

    console.log(
        "=========================================="
    );


    return (
        verificarRepositorio ||
        verificarLocalizacao
    );
}


// ============================================================
// DETECÇÃO DE CLIQUES
// ============================================================

document.addEventListener("click", function (evento) {

    const botao = evento.target.closest("button");

    if (!botao) {
        return;
    }


    // ----------------------------------------------------
    // Primeiro tenta o texto do botão
    // ----------------------------------------------------

    let textoBotao =
        normalizarTexto(
            botao.textContent
        ).toUpperCase();


    // ----------------------------------------------------
    // Se não encontrou, procura o mud-button-label
    // ----------------------------------------------------

    if (!textoBotao) {

        const label =
            botao.querySelector(
                ".mud-button-label"
            );


        if (label) {

            textoBotao =
                normalizarTexto(
                    label.textContent
                ).toUpperCase();
        }
    }


    console.log(
        "[SAFE] Botão clicado:",
        textoBotao
    );


    // ====================================================
    // SALVAR METADADOS
    // ====================================================

    if (
        textoBotao ===
        "SALVAR METADADOS"
    ) {

        console.log(
            "[SAFE] SALVAR METADADOS detectado."
        );


        const agora =
            Date.now();


        // Proteção contra duplo clique
        if (
            agora -
            ultimoCliqueVerificar
            < 1000
        ) {

            console.log(
                "[SAFE] Clique duplicado ignorado."
            );

            return;
        }


        ultimoCliqueVerificar =
            agora;


        // ------------------------------------------------
        // Verifica os campos
        // ------------------------------------------------

        const deveContabilizar =
            possuiVerificar();


        if (
            deveContabilizar
        ) {

            console.log(
                "[SAFE] >>> REGISTRANDO VERIFICAR <<<"
            );


            registrarAcao(
                "Verificar"
            );

        } else {

            console.log(
                "[SAFE] Nenhum campo contém VERIFICAR."
            );
        }


        return;
    }


    // ====================================================
    // ENVIAR PARA APROVAÇÃO
    // ====================================================

    if (
        textoBotao ===
        "ENVIAR PARA APROVACAO"
    ) {

        console.log(
            "[SAFE] ENVIAR PARA APROVAÇÃO detectado."
        );


        aguardandoConfirmacao =
            true;


        return;
    }


    // ====================================================
    // CONFIRMAÇÃO SIM
    // ====================================================

    if (
        aguardandoConfirmacao &&
        textoBotao === "SIM"
    ) {

        const agora =
            Date.now();


        if (
            agora -
            ultimoClique
            < 1000
        ) {

            return;
        }


        ultimoClique =
            agora;


        aguardandoConfirmacao =
            false;


        console.log(
            "[SAFE] >>> REGISTRANDO APROVAÇÃO <<<"
        );


        registrarAcao(
            "Aprovação"
        );
    }

});


// ============================================================
// INICIALIZAÇÃO
// ============================================================

console.log(
    `Contador SAFE v${VERSAO} carregado.`
);