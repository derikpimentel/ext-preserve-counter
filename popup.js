// ============================================================
// CONTADOR SAFE - POPUP
// VERSÃO 1.0.0
// CRIADO POR DERIK PIMENTEL
// ============================================================

const VERSAO = "1.0.0";

const CHAVE_DADOS_USUARIOS = "dadosContadorAprovacaoPorUsuario";


// ============================================================
// ELEMENTOS
// ============================================================

const contadorElemento =
    document.getElementById("contador");

const contadorAprovacaoElemento =
    document.getElementById("contador-aprovacao");

const contadorVerificarElemento =
    document.getElementById("contador-verificar");

const usuarioElemento =
    document.getElementById("usuario-logado");

const repositorioElemento =
    document.getElementById("repositorio-atual");

const historicoElemento =
    document.getElementById("historico");

const botaoZerar =
    document.getElementById("zerar");

const botaoExportarCSV =
    document.getElementById("exportar-csv");


// ============================================================
// NORMALIZAÇÃO
// ============================================================

function normalizarTexto(texto) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}


function obterChaveUsuario(nomeUsuario) {

    return normalizarTexto(nomeUsuario).toUpperCase();
}


// ============================================================
// OBTER DADOS DA PÁGINA
// ============================================================

async function obterDadosPagina() {

    const abas = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });


    if (!abas || !abas.length) {
        throw new Error("Aba ativa não encontrada.");
    }


    const aba = abas[0];


    if (
        !aba.url ||
        !aba.url.startsWith(
            "https://preserve.cedae.com.br/"
        )
    ) {

        throw new Error(
            "A página atual não é o PreserveHub."
        );
    }


    const resultado =
        await chrome.scripting.executeScript({

            target: {
                tabId: aba.id
            },

            func: () => {

                function normalizarTexto(texto) {

                    return (texto || "")
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/\s+/g, " ")
                        .trim();
                }


                function obterChaveUsuario(nomeUsuario) {

                    return normalizarTexto(
                        nomeUsuario
                    ).toUpperCase();
                }


                // ============================================
                // USUÁRIO
                // ============================================

                let nomeUsuario =
                    "Usuário não identificado";


                const elementos =
                    document.querySelectorAll(
                        "p.mud-typography.mud-typography-body2"
                    );


                for (const elemento of elementos) {

                    const estilo =
                        elemento.getAttribute("style") || "";


                    if (
                        estilo
                            .toLowerCase()
                            .includes("color:white")
                    ) {

                        const nome =
                            elemento.textContent.trim();


                        if (nome) {

                            nomeUsuario = nome;

                            break;
                        }
                    }
                }


                // ============================================
                // REPOSITÓRIO
                // ============================================

                let repositorio =
                    "Não identificado";


                for (const elemento of elementos) {

                    const texto =
                        elemento.textContent.trim();


                    const normalizado =
                        normalizarTexto(texto)
                            .toUpperCase();


                    if (
                        normalizado.startsWith(
                            "REPOSITORIO ARQUIVISTICO"
                        )
                    ) {

                        repositorio =
                            texto.replace(
                                /^REPOSITÓRIO ARQUIVÍSTICO\s*/i,
                                ""
                            ).trim();

                        break;
                    }
                }


                // ============================================
                // LOCAL STORAGE
                // ============================================

                let dadosUsuarios = {};


                try {

                    const dadosSalvos =
                        localStorage.getItem(
                            "dadosContadorAprovacaoPorUsuario"
                        );


                    if (dadosSalvos) {

                        dadosUsuarios =
                            JSON.parse(dadosSalvos);
                    }

                } catch (erro) {

                    console.error(
                        "Erro ao ler localStorage:",
                        erro
                    );
                }


                const chaveUsuario =
                    obterChaveUsuario(nomeUsuario);


                const dadosUsuario =
                    dadosUsuarios[chaveUsuario] || {

                        contadorAprovacao: 0,

                        contadorVerificar: 0,

                        historico: []
                    };


                // ============================================
                // COMPATIBILIDADE
                // ============================================

                if (
                    typeof dadosUsuario.contadorAprovacao
                    !== "number"
                ) {

                    dadosUsuario.contadorAprovacao = 0;
                }


                if (
                    typeof dadosUsuario.contadorVerificar
                    !== "number"
                ) {

                    dadosUsuario.contadorVerificar = 0;
                }


                if (
                    !Array.isArray(
                        dadosUsuario.historico
                    )
                ) {

                    dadosUsuario.historico = [];
                }


                return {

                    nomeUsuario,

                    repositorio,

                    dadosUsuario
                };
            }

        });


    if (!resultado || !resultado.length) {

        throw new Error(
            "Não foi possível obter os dados da página."
        );
    }


    return resultado[0].result;
}


// ============================================================
// ATUALIZAR POPUP
// ============================================================

async function atualizarPopup() {

    try {

        const dados =
            await obterDadosPagina();


        const dadosUsuario =
            dados.dadosUsuario;


        // ================================================
        // CONTADORES
        // ================================================

        const contadorAprovacao =
            dadosUsuario.contadorAprovacao || 0;


        const contadorVerificar =
            dadosUsuario.contadorVerificar || 0;


        const contadorTotal =
            contadorAprovacao +
            contadorVerificar;


        contadorElemento.textContent =
            contadorTotal;


        contadorAprovacaoElemento.textContent =
            contadorAprovacao;


        contadorVerificarElemento.textContent =
            contadorVerificar;


        // ================================================
        // USUÁRIO
        // ================================================

        usuarioElemento.textContent =
            dados.nomeUsuario;


        // ================================================
        // REPOSITÓRIO
        // ================================================

        repositorioElemento.textContent =
            dados.repositorio;


        // ================================================
        // HISTÓRICO
        // ================================================

        historicoElemento.innerHTML = "";


        const historico =
            [...dadosUsuario.historico].reverse().slice(0, 5);


        if (!historico.length) {

            historicoElemento.innerHTML = `
                <tr>
                    <td
                        colspan="4"
                        class="sem-historico"
                    >
                        Nenhum registro encontrado.
                    </td>
                </tr>
            `;

            return;
        }


        for (const registro of historico) {

            const linha =
                document.createElement("tr");


            // ============================================
            // STATUS
            // ============================================

            const celulaStatus =
                document.createElement("td");


            celulaStatus.textContent =
                registro.status || "-";


            if (
                registro.status === "Aprovação"
            ) {

                celulaStatus.classList.add(
                    "status-aprovacao"
                );

            } else if (
                registro.status === "Verificar"
            ) {

                celulaStatus.classList.add(
                    "status-verificar"
                );
            }


            // ============================================
            // REPOSITÓRIO
            // ============================================

            const celulaRepositorio =
                document.createElement("td");


            celulaRepositorio.textContent =
                registro.repositorioArquivistico ||
                "-";


            // ============================================
            // IDENTIFICADOR
            // ============================================

            const celulaIdentificador =
                document.createElement("td");


            celulaIdentificador.textContent =
                registro.identificadorUnico ||
                "-";


            // ============================================
            // DATA/HORA
            // ============================================

            const celulaData =
                document.createElement("td");


            celulaData.textContent =
                registro.dataHora ||
                "-";


            // ============================================
            // MONTAR LINHA
            // ============================================

            linha.appendChild(
                celulaStatus
            );

            linha.appendChild(
                celulaRepositorio
            );

            linha.appendChild(
                celulaIdentificador
            );

            linha.appendChild(
                celulaData
            );


            historicoElemento.appendChild(
                linha
            );
        }


    } catch (erro) {

        console.error(
            "Erro ao atualizar popup:",
            erro
        );


        contadorElemento.textContent = "0";

        contadorAprovacaoElemento.textContent = "0";

        contadorVerificarElemento.textContent = "0";


        usuarioElemento.textContent =
            "Não disponível";


        repositorioElemento.textContent =
            "Não disponível";


        historicoElemento.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="sem-historico"
                >
                    Abra o PreserveHub para visualizar os dados.
                </td>
            </tr>
        `;
    }
}


// ============================================================
// ZERAR CONTADOR E HISTÓRICO
// ============================================================

async function zerarDados() {

    try {

        const abas =
            await chrome.tabs.query({
                active: true,
                currentWindow: true
            });


        if (!abas || !abas.length) {

            throw new Error(
                "Aba ativa não encontrada."
            );
        }


        const aba = abas[0];


        if (
            !aba.url ||
            !aba.url.startsWith(
                "https://preserve.cedae.com.br/"
            )
        ) {

            throw new Error(
                "Abra o PreserveHub para zerar os dados."
            );
        }


        await chrome.scripting.executeScript({

            target: {
                tabId: aba.id
            },

            func: () => {

                function normalizarTexto(texto) {

                    return (texto || "")
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/\s+/g, " ")
                        .trim();
                }


                function obterChaveUsuario(nomeUsuario) {

                    return normalizarTexto(
                        nomeUsuario
                    ).toUpperCase();
                }


                // ============================================
                // LOCALIZAR USUÁRIO
                // ============================================

                let nomeUsuario =
                    "Usuário não identificado";


                const elementos =
                    document.querySelectorAll(
                        "p.mud-typography.mud-typography-body2"
                    );


                for (const elemento of elementos) {

                    const estilo =
                        elemento.getAttribute("style") || "";


                    if (
                        estilo
                            .toLowerCase()
                            .includes("color:white")
                    ) {

                        const nome =
                            elemento.textContent.trim();


                        if (nome) {

                            nomeUsuario = nome;

                            break;
                        }
                    }
                }


                const chaveUsuario =
                    obterChaveUsuario(
                        nomeUsuario
                    );


                // ============================================
                // LER DADOS
                // ============================================

                let dadosUsuarios = {};


                try {

                    const dadosSalvos =
                        localStorage.getItem(
                            "dadosContadorAprovacaoPorUsuario"
                        );


                    if (dadosSalvos) {

                        dadosUsuarios =
                            JSON.parse(dadosSalvos);
                    }

                } catch (erro) {

                    console.error(
                        "Erro ao ler dados:",
                        erro
                    );
                }


                // ============================================
                // ZERAR SOMENTE O USUÁRIO ATUAL
                // ============================================

                dadosUsuarios[chaveUsuario] = {

                    contadorAprovacao: 0,

                    contadorVerificar: 0,

                    historico: []
                };


                // ============================================
                // SALVAR
                // ============================================

                localStorage.setItem(

                    "dadosContadorAprovacaoPorUsuario",

                    JSON.stringify(dadosUsuarios)
                );
            }

        });


        await atualizarPopup();


    } catch (erro) {

        console.error(
            "Erro ao zerar dados:",
            erro
        );

        alert(
            erro.message ||
            "Não foi possível zerar os dados."
        );
    }
}


// ============================================================
// EVENTO DO BOTÃO
// ============================================================

botaoZerar.addEventListener(
    "click",
    async () => {

        const confirmar =
            confirm(
                "Deseja realmente zerar o contador e o histórico deste usuário?"
            );


        if (!confirmar) {
            return;
        }


        await zerarDados();
    }
);


// ============================================================
// EXPORTAR HISTÓRICO PARA CSV
// ============================================================

function escaparCampoCSV(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }

    valor = String(valor);

    // Evita que conteúdos sejam interpretados
    // como fórmulas ao abrir o CSV em planilhas.
    if (/^[\t\r\n ]*[=+\-@]/.test(valor)) {
        valor = "'" + valor;
    }

    // Escapa aspas duplas
    valor = valor.replace(/"/g, '""');

    // Coloca o campo entre aspas
    return `"${valor}"`;
}


function gerarCSV(historico) {

    const cabecalho = [
        "Status",
        "Repositório Arquivístico",
        "Identificador Único",
        "Data/Hora",
        "Nome de Usuário"
    ];


    const linhas = [];

    // Cabeçalho
    linhas.push(
        cabecalho
            .map(escaparCampoCSV)
            .join(";")
    );


    // Dados
    for (const registro of historico) {

        const linha = [

            registro.status || "",

            registro.repositorioArquivistico || "",

            registro.identificadorUnico || "",

            registro.dataHora || "",

            registro.nomeUsuario || ""

        ];


        linhas.push(
            linha
                .map(escaparCampoCSV)
                .join(";")
        );
    }


    /*
     * BOM UTF-8
     *
     * O \uFEFF faz o Excel reconhecer
     * corretamente o arquivo como UTF-8.
     */

    return "\uFEFF" + linhas.join("\r\n");
}


// ============================================================
// EXPORTAR CSV
// ============================================================

async function exportarCSV() {

    try {

        const dados =
            await obterDadosPagina();


        const historico = dados?.dadosUsuario?.historico;
        

        if (!Array.isArray(historico)) {
            throw new Error("Histórico inválido para exportação.");
        }


        if (!historico.length) {

            alert(
                "Não existem registros no histórico para exportar."
            );

            return;
        }


        // ----------------------------------------------------
        // GERA CSV
        // ----------------------------------------------------

        const conteudoCSV =
            gerarCSV(historico);


        // ----------------------------------------------------
        // CRIA ARQUIVO
        // ----------------------------------------------------

        const blob =
            new Blob(
                [conteudoCSV],
                {
                    type: "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);


        // ----------------------------------------------------
        // NOME DO ARQUIVO
        // ----------------------------------------------------

        const nomeUsuario =
            normalizarTexto(
                dados.nomeUsuario
            )
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_-]/g, "");


        const dataAtual =
            new Date();


        const ano =
            dataAtual.getFullYear();


        const mes =
            String(
                dataAtual.getMonth() + 1
            ).padStart(2, "0");


        const dia =
            String(
                dataAtual.getDate()
            ).padStart(2, "0");


        const nomeArquivo =
            `Relatorio_Completo_${nomeUsuario}_${ano}-${mes}-${dia}.csv`;


        // ----------------------------------------------------
        // DOWNLOAD
        // ----------------------------------------------------

        const link =
            document.createElement("a");


        link.href = url;

        link.download = nomeArquivo;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);


        // Libera o objeto
        setTimeout(() => {

            URL.revokeObjectURL(url);

        }, 1000);


    } catch (erro) {

        console.error(
            "Erro ao exportar CSV:",
            erro
        );


        alert(
            "Não foi possível exportar o relatório CSV."
        );
    }
}


// ============================================================
// EVENTO - EXPORTAR CSV
// ============================================================

botaoExportarCSV.addEventListener(
    "click",
    async () => {

        await exportarCSV();

    }
);


// ============================================================
// INICIALIZAÇÃO
// ============================================================

atualizarPopup();


console.log(
    `Popup v${VERSAO} carregado.`
);