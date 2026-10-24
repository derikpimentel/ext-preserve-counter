// ============================================================
// SAFE-PRESERVEHUB
// VERSÃO 1.0.0
// CRIADO POR DERIK PIMENTEL
// ============================================================

const VERSAO = "1.0.0";

const CHAVE_DADOS_USUARIOS = "dadosContadorPorUsuario";

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
// STORAGE
// ============================================================

async function obterDadosStorage() {

    try {

        const resultado =
            await chrome.storage.local.get(CHAVE_DADOS_USUARIOS);

        const dados = resultado[CHAVE_DADOS_USUARIOS];

        // Nenhum dado salvo ainda: armazenamento vazio.
        if (dados === undefined) {

            return {};
        }

        // Impede que uma estrutura inválida seja tratada
        // como um conjunto válido de dados.
        if (
            dados === null ||
            typeof dados !== "object" ||
            Array.isArray(dados)
        ) {
            throw new Error(
                "O armazenamento possui uma estrutura inválida."
            );
        }

        return dados;

    } catch (erro) {
        console.error("Erro ao ler storage:", erro);

        // Não transformar uma falha de leitura em dados vazios.
        throw erro;
    }
}


async function salvarDadosStorage(dadosUsuarios) {

    try {

        await chrome.storage.local.set({

            [CHAVE_DADOS_USUARIOS]: dadosUsuarios

        });

        return true;

    } catch (erro) {

        console.error("Erro ao salvar storage:", erro);

        return false;
    }
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

    const elementos = document.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, p, span, div"
    );


    for (const elementoAtual of elementos) {

        const texto = elementoAtual.textContent.trim();


        // Exemplo:
        // PRT.001.xxxxxxxx/xxxx-xx

        const correspondencia =
            texto.match(/PRT\.\d+\.\d+\/\d{4}-\d+/i);


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
// DATA ATUAL
// ============================================================

function obterDataAtual() {

    const agora = new Date();

    const dia =
        String(agora.getDate()).padStart(2, "0");

    const mes =
        String(agora.getMonth() + 1).padStart(2, "0");

    const ano =
        agora.getFullYear();

    return `${dia}/${mes}/${ano}`;
}


// ============================================================
// HISTÓRICO DO DIA
// ============================================================

function obterHistoricoDoDia(dadosUsuario) {

    const dataAtual = obterDataAtual();

    const historico =
        Array.isArray(dadosUsuario.historico)
            ? dadosUsuario.historico : [];

    return historico.filter(registro => {

        return (
            typeof registro.dataHora === "string" &&
            registro.dataHora.startsWith(dataAtual)
        );
    });
}


// ============================================================
// CONTADORES DO DIA
// ============================================================

function obterContadoresDoDia(dadosUsuario) {

    const historicoDoDia =
        obterHistoricoDoDia(dadosUsuario);

    let contadorAprovacao = 0;
    let contadorVerificar = 0;

    for (const registro of historicoDoDia) {

        if (registro.status === "Aprovação") {

            contadorAprovacao++;

        } else if (registro.status === "Verificar") {

            contadorVerificar++;
        }
    }

    return {
        contadorAprovacao,
        contadorVerificar,
        contadorTotal: contadorAprovacao + contadorVerificar
    };
}


// ============================================================
// ESTRUTURA PADRÃO DO USUÁRIO
// ============================================================

function obterDadosUsuario(dadosUsuarios, chaveUsuario) {

    if (
        !dadosUsuarios[chaveUsuario] ||
        typeof dadosUsuarios[chaveUsuario] !== "object"
    ) {

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

async function registrarAcao(status) {

    try {

        const dadosUsuarios = await obterDadosStorage();

        const usuarioAtual = obterUsuarioLogado();

        if (
            !usuarioAtual || usuarioAtual === "Usuário não identificado"
        ) {

            console.warn("Não foi possível identificar o usuário.");

            return;
        }

        const chaveUsuario = obterChaveUsuario(usuarioAtual);

        const dadosUsuario =
            obterDadosUsuario(dadosUsuarios, chaveUsuario);

        const identificadorUnico = obterIdentificadorUnico();

        const repositorioArquivistico = obterRepositorioArquivistico();

        const dataHora = obterDataHoraAtual();


        console.log("==========================================");
        console.log("REGISTRAR AÇÃO");
        console.log("Status:", status);
        console.log("Usuário:", usuarioAtual);
        console.log("Chave usuário:", chaveUsuario);
        console.log("Identificador:", identificadorUnico);
        console.log("Repositório:", repositorioArquivistico);
        console.log("==========================================");


        // ------------------------------------------------------------
        // TRANSIÇÃO:
        //
        // VERIFICAR → APROVAÇÃO
        //
        // O mesmo objeto não deve ocupar duas posições no contador.
        // ------------------------------------------------------------

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
                    "Objeto encontrado como VERIFICAR."
                );
                console.log(
                    "Executando transição VERIFICAR → APROVAÇÃO."
                );


                // ----------------------------------------------------
                // Remove do contador de Verificar
                // ----------------------------------------------------

                if (dadosUsuario.contadorVerificar > 0) {

                    dadosUsuario.contadorVerificar--;
                }


                // ----------------------------------------------------
                // Adiciona ao contador de Aprovação
                // ----------------------------------------------------

                dadosUsuario.contadorAprovacao++;


                // ----------------------------------------------------
                // Altera o registro existente
                // ----------------------------------------------------

                registroVerificar.status = "Aprovação";

                registroVerificar.dataHora = dataHora;

                registroVerificar.repositorioArquivistico =
                    repositorioArquivistico;

                registroVerificar.nomeUsuario = usuarioAtual;


                // ----------------------------------------------------
                // Salva
                // ----------------------------------------------------

                const salvou = await salvarDadosStorage(dadosUsuarios);

                if (!salvou) {

                    console.error("A transição não foi salva.");
                    console.error(
                        "O contador visual não será atualizado."
                    );

                    return;
                }


                // ----------------------------------------------------
                // Atualiza o contador visual
                // ----------------------------------------------------

                mostrarContador(dadosUsuario);


                console.log("VERIFICAR → APROVAÇÃO concluído.");
                console.log("Aprovação:", dadosUsuario.contadorAprovacao);
                console.log("Verificar:", dadosUsuario.contadorVerificar);
                console.log(
                    "Total:",
                    dadosUsuario.contadorAprovacao +
                    dadosUsuario.contadorVerificar
                );

                return;
            }
        }


        // --------------------------------------------------------
        // PROTEÇÃO CONTRA DUPLICIDADE
        // --------------------------------------------------------

        const registroExistente =
            dadosUsuario.historico.some(
                registro =>
                    registro.identificadorUnico ===
                        identificadorUnico &&
                    registro.status === status
            );


        if (
            identificadorUnico !==
                "Não identificado" &&
            registroExistente
        ) {

            console.log(
                `Registro já contabilizado: ${identificadorUnico}`
            );
            console.log(`Status do registro: ${status}`);

            return;
        }


        // --------------------------------------------------------
        // NOVO REGISTRO
        // --------------------------------------------------------

        const novoRegistro = {

            status: status,
            repositorioArquivistico: repositorioArquivistico,
            identificadorUnico: identificadorUnico,
            dataHora: dataHora,
            nomeUsuario: usuarioAtual
        };


        // --------------------------------------------------------
        // HISTÓRICO
        // --------------------------------------------------------

        dadosUsuario.historico.push(novoRegistro);


        // --------------------------------------------------------
        // CONTADOR POR STATUS
        // --------------------------------------------------------

        if (status === "Aprovação") {

            dadosUsuario.contadorAprovacao++;

        } else if (status === "Verificar") {

            dadosUsuario.contadorVerificar++;
        }


        // --------------------------------------------------------
        // SALVAR
        // --------------------------------------------------------

        const salvou = await salvarDadosStorage(dadosUsuarios);

        if (!salvou) {

            console.error("O registro não foi salvo.");
            console.error(
                "O contador visual não será atualizado."
            );

            return;
        }


        // --------------------------------------------------------
        // MOSTRAR CONTADOR
        // --------------------------------------------------------

        mostrarContador(dadosUsuario);


        // ------------------------------------------------------------
        // LOG
        // ------------------------------------------------------------


        console.log(`Objeto contabilizado: ${status}`, novoRegistro);


    } catch (erro) {

        console.error("Erro ao registrar ação:", erro);
    }
}


// ============================================================
// OVERLAY
// ============================================================

let timerOverlay = null;


function mostrarContador(dadosUsuario) {

    let janela = document.querySelector("#janela-contador");


    if (!janela) {

        janela = document.createElement("div");

        janela.id = "janela-contador";

        janela.style.position = "fixed";
        janela.style.top = "20px";
        janela.style.right = "20px";
        janela.style.zIndex = "999999";
        janela.style.background = "#ffffff";
        janela.style.color = "#000000";
        janela.style.border = "1px solid #ccc";
        janela.style.borderRadius = "8px";
        janela.style.padding = "15px";
        janela.style.boxShadow =
            "0 4px 12px rgba(0,0,0,0.25)";
        janela.style.fontFamily = "Arial, sans-serif";
        janela.style.minWidth = "220px";

        document.body.appendChild(janela);
    }


    const contadores = obterContadoresDoDia(dadosUsuario);


    janela.innerHTML = `
        <div style="font-size:16px;font-weight:bold;margin-bottom:8px;">
            SAFE-PreserveHub
        </div>

        <div style="font-size:30px;font-weight:bold;text-align:center;">
            ${contadores.contadorTotal}
        </div>

        <div style="font-size:12px;text-align:center;margin-bottom:10px;">
            Total do dia
        </div>

        <div style="font-size:13px;">
            <strong>Aprovação:</strong>
            ${contadores.contadorAprovacao}
        </div>

        <div style="font-size:13px;">
            <strong>Verificar:</strong>
            ${contadores.contadorVerificar}
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
        document.querySelectorAll(".mud-input-control");


    console.log(`Procurando campo: ${rotulo}`);


    for (const controle of controles) {

        const textoControle =
            normalizarTexto(controle.textContent).toUpperCase();


        const input =
            controle.querySelector("input.mud-input-slot");


        if (!input) {

            continue;
        }


        console.log(
            "Controle encontrado:", textoControle,
            "Valor:", input.value
        );


        if (textoControle.includes(rotuloNormalizado)) {

            console.log(`Campo "${rotulo}" identificado.`, input);


            return input;
        }
    }


    console.warn(`Campo "${rotulo}" não foi encontrado.`);


    return null;
}


// ============================================================
// REPOSITÓRIO FÍSICO
// ============================================================

function obterRepositorioFisico() {

    const input = obterInputPorRotulo("Repositorio Fisico");


    if (!input) {

        return "";
    }


    return (
        input.value || input.getAttribute("value") || ""
    ).trim();
}


// ============================================================
// LOCALIZAÇÃO FÍSICA
// ============================================================

function obterLocalizacaoFisica() {

    const input = obterInputPorRotulo("Localização Fisica");


    if (!input) {

        return "";
    }


    return (
        input.value || input.getAttribute("value") || ""
    ).trim();
}


// ============================================================
// STATUS DIGITALIZADO
// ============================================================

function possuiStatusDigitalizado() {

    const elementos = document.querySelectorAll(
        "span.mud-chip-content"
    );

    for (const elemento of elementos) {

        const texto = normalizarTexto(
            elemento.textContent
        ).toUpperCase();


        if (texto === "DIGITALIZADO") {

            return true;
        }
    }

    return false;
}


// ============================================================
// VERIFICAR SE EXISTE "VERIFICAR"
// ============================================================

function possuiVerificar() {

    // Só permite a condição "Verificar"
    // quando o objeto estiver DIGITALIZADO.
    if (!possuiStatusDigitalizado()) {

        return false;
    }

    const repositorioFisico = obterRepositorioFisico();


    const localizacaoFisica = obterLocalizacaoFisica();


    const repositorioNormalizado =
        normalizarTexto(repositorioFisico).toUpperCase();


    const localizacaoNormalizada =
        normalizarTexto(localizacaoFisica).toUpperCase();


    const verificarRepositorio =
        repositorioNormalizado.includes("VERIFICAR");


    const verificarLocalizacao =
        localizacaoNormalizada.includes("VERIFICAR");


    console.log("==========================================");
    console.log("VERIFICAÇÃO DE A VERIFICAR");
    console.log("Repositório Físico:", repositorioFisico);
    console.log("Localização Física:", localizacaoFisica);
    console.log("Verificar no Repositório:", verificarRepositorio);
    console.log("Verificar na Localização:", verificarLocalizacao);
    console.log("Resultado:", verificarRepositorio || verificarLocalizacao);
    console.log("==========================================");


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
        normalizarTexto(botao.textContent).toUpperCase();


    // ----------------------------------------------------
    // Se não encontrou, procura o mud-button-label
    // ----------------------------------------------------

    if (!textoBotao) {

        const label =
            botao.querySelector(".mud-button-label");


        if (label) {

            textoBotao =
                normalizarTexto(label.textContent).toUpperCase();
        }
    }


    console.log("Botão clicado:", textoBotao);


    // ====================================================
    // SALVAR METADADOS
    // ====================================================

    if (textoBotao === "SALVAR METADADOS") {

        console.log("SALVAR METADADOS detectado.");


        const agora = Date.now();


        // Proteção contra duplo clique
        if (agora - ultimoCliqueVerificar < 1000) {

            console.log("Clique duplicado ignorado.");

            return;
        }


        ultimoCliqueVerificar = agora;


        // ------------------------------------------------
        // Verifica os campos
        // ------------------------------------------------

        setTimeout(
            () => {

                if (possuiVerificar()) {

                    console.log(">>> REGISTRANDO VERIFICAR <<<");


                    registrarAcao("Verificar");

                } else {

                    console.log("Nenhum campo contém VERIFICAR.");
                }

            },
            500
        );


        return;
    }


    // ====================================================
    // ENVIAR PARA APROVAÇÃO
    // ====================================================

    if (textoBotao.includes("ENVIAR PARA APROVACAO")) {

        console.log("ENVIAR PARA APROVAÇÃO detectado.");


        aguardandoConfirmacao = true;


        console.log("Aguardando confirmação SIM.");


        return;
    }


    // ====================================================
    // CONFIRMAÇÃO SIM
    // ====================================================

    if (aguardandoConfirmacao && textoBotao === "SIM") {

        const agora = Date.now();


        if (agora - ultimoClique < 1000) {

            return;
        }


        ultimoClique = agora;


        aguardandoConfirmacao = false;


        console.log(">>> REGISTRANDO APROVAÇÃO <<<");


        registrarAcao("Aprovação");
    }

}, true);


// ============================================================
// INICIALIZAÇÃO
// ============================================================

console.log(`SAFE-PreserveHub v${VERSAO} carregado.`);