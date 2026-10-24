// ============================================================
// SAFE-PRESERVEHUB - POPUP
// VERSÃO 1.0.0
// CRIADO POR DERIK PIMENTEL
// ============================================================

const VERSAO = "1.0.0";

const CHAVE_DADOS_USUARIOS = "dadosContadorPorUsuario";


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

const botaoExportarCSV =
    document.getElementById("exportar-csv");

const botaoExportarCSVPorDia =
    document.getElementById("exportar-csv-dia");

const seletorDia =
    document.getElementById("seletor-dia");

const dataAtualElemento =
    document.getElementById("data-atual");


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

    try {

        const abas = await chrome.tabs.query({
            active: true, currentWindow: true
        });


        if (!abas || !abas.length) {
            throw new Error("Aba ativa não encontrada.");
        }


        const aba = abas[0];


        const ambientesSuportados = [
            "https://preserve.cedae.com.br/",
            "http://preserve.faetec.rj.gov.br/",
            "https://preserve.faetec.rj.gov.br/",

            // Links acessados por ambiente interno com VPN
            "http://preserve.proderj.rj.gov.br/",
            "http://preserve.detro.rj.gov.br/",
            "http://preserve.casacivil.rj.gov.br/",
            "http://preserve.sedsdh.rj.gov.br/",
            "http://preserve.procon.rj.gov.br/",
            "http://preserve/", //  Agenersa
            "http://preserve.degase.rj.gov.br.local/",

            "http://monaco-preserve.safeconversaodigital.com.br/",
            "https://monaco-preserve.safeconversaodigital.com.br/"
        ];


        const ambienteSuportado =
            !!aba.url && ambientesSuportados.some(
                urlBase => aba.url.startsWith(urlBase)
            );


        if (!ambienteSuportado) {

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


                    // --------------------------------------------
                    // USUÁRIO
                    // --------------------------------------------

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


                    // --------------------------------------------
                    // REPOSITÓRIO
                    // --------------------------------------------

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


                    return {

                        nomeUsuario,

                        repositorio

                    };
                }

            });


        if (!resultado || !resultado.length) {

            throw new Error(
                "Não foi possível obter os dados da página."
            );
        }


        return resultado[0].result;

    } catch (erro) {

        throw erro;
    }
}


// ============================================================
// STORAGE CENTRAL
// ============================================================


async function obterDadosStorage() {

    try {

        const resultado = await chrome.storage.local.get(
            CHAVE_DADOS_USUARIOS
        );

        const dados = resultado[CHAVE_DADOS_USUARIOS];


        if (dados === undefined) {

            return {};
        }

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

        console.error("Erro ao acessar storage:", erro);
        throw erro;
    }
}



// ============================================================
// DATA ATUAL
// ============================================================

function obterDataAtual() {

    const agora = new Date();

    const dia = String(agora.getDate()).padStart(2, "0");

    const mes = String(agora.getMonth() + 1).padStart(2, "0");

    const ano = agora.getFullYear();

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


    return historico.filter(
        registro => {

            return (

                typeof registro.dataHora === "string" &&

                registro.dataHora.startsWith(dataAtual)

            );
        }
    );
}


// ============================================================
// CONTADORES DO DIA
// ============================================================

function obterContadoresDoDia(dadosUsuario) {

    const historicoDoDia = obterHistoricoDoDia(dadosUsuario);

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
// HORA
// ============================================================

function obterHora(dataHora) {

    if (typeof dataHora !== "string") {

        return "-";
    }


    const partes = dataHora.trim().split(" ");


    if (partes.length >= 2) {

        return partes[1];
    }


    return dataHora;
}


// ============================================================
// DATA DOS REGISTROS
// ============================================================

function obterDataDoRegistro(registro) {

    if (
        !registro || typeof registro.dataHora !== "string"
    ) {

        return null;
    }


    const correspondencia =
        registro.dataHora.match(/^(\d{2}\/\d{2}\/\d{4})/);


    if (!correspondencia) {

        return null;
    }


    return correspondencia[1];
}


// ============================================================
// CONVERTER DATA DD/MM/AAAA PARA COMPARAÇÃO
// ============================================================

function converterDataParaNumero(data) {

    if (typeof data !== "string") {

        return 0;
    }


    const partes = data.split("/");


    if (partes.length !== 3) {

        return 0;
    }


    const dia = Number(partes[0]);

    const mes = Number(partes[1]);

    const ano = Number(partes[2]);


    if (!dia || !mes || !ano) {

        return 0;
    }


    return (ano * 10000 + mes * 100 + dia);
}


// ============================================================
// OBTER DATAS COM REGISTROS
// ============================================================

function obterDatasComRegistros(historico) {

    const datas = new Set();


    if (!Array.isArray(historico)) {

        return [];
    }


    for (const registro of historico) {

        const data = obterDataDoRegistro(registro);


        if (data) {

            datas.add(data);
        }
    }


    return [...datas].sort(
            (dataA, dataB) => {

                return (
                    converterDataParaNumero(dataB) -
                    converterDataParaNumero(dataA)
                );

            }
        );
}


// ============================================================
// OBTER DATA PADRÃO DO RELATÓRIO
// ============================================================

function obterDataPadraoRelatorio(datas) {

    if (!Array.isArray(datas) || !datas.length) {

        return "";
    }


    const hoje = converterDataParaNumero(obterDataAtual());


    /*
     * Primeiro procura a data mais recente
     * que seja anterior ao dia atual.
     */

    const dataAnterior = datas.find(
            data => converterDataParaNumero(data) < hoje
        );


    if (dataAnterior) {

        return dataAnterior;
    }


    /*
     * Se não existir nenhuma data anterior,
     * utiliza a data mais recente disponível.
     */

    return datas[0];
}


// ============================================================
// PREENCHER SELETOR DE DATAS
// ============================================================

function atualizarSeletorDeDatas(historico) {

    seletorDia.innerHTML = "";


    const datas = obterDatasComRegistros(historico);


    if (!datas.length) {

        const opcao = document.createElement("option");

        opcao.value = "";

        opcao.textContent = "Nenhum dia disponível";

        seletorDia.appendChild(opcao);

        seletorDia.disabled = true;

        botaoExportarCSVPorDia.disabled = true;

        return;
    }


    seletorDia.disabled = false;

    botaoExportarCSVPorDia.disabled = false;


    const dataPadrao = obterDataPadraoRelatorio(datas);


    for (const data of datas) {

        const opcao = document.createElement("option");


        opcao.value = data;


        opcao.textContent = data;


        if (data === dataPadrao) {

            opcao.selected = true;
        }


        seletorDia.appendChild(opcao);
    }
}


// ============================================================
// OBTER HISTÓRICO DE TODOS OS USUÁRIOS
// ============================================================

function obterHistoricoTodosUsuarios(dadosUsuarios) {

    const historicoTodos = [];

    if (!dadosUsuarios || typeof dadosUsuarios !== "object") {

        return historicoTodos;
    }

    for (const chaveUsuario of Object.keys(dadosUsuarios)) {

        const dadosUsuario = dadosUsuarios[chaveUsuario];

        if (
            !dadosUsuario ||
            !Array.isArray(dadosUsuario.historico)
        ) {
            continue;
        }

        for (const registro of dadosUsuario.historico) {
            historicoTodos.push(registro);
        }
    }

    return historicoTodos;
}


// ============================================================
// ATUALIZAR POPUP
// ============================================================

async function atualizarPopup() {

    try {

        const dados = await obterDadosPagina();


        const dadosUsuarios = await obterDadosStorage();


        const chaveUsuario = obterChaveUsuario(dados.nomeUsuario);


        const dadosUsuario = dadosUsuarios[chaveUsuario] || {

                contadorAprovacao: 0,

                contadorVerificar: 0,

                historico: []

            };


        const dataAtual = obterDataAtual();


        const contadores = obterContadoresDoDia(dadosUsuario);


        // ----------------------------------------------------
        // CONTADORES
        //
        // CONTINUAM SENDO INDIVIDUAIS POR USUÁRIO.
        // ----------------------------------------------------

        contadorElemento.textContent =
            contadores.contadorTotal;


        contadorAprovacaoElemento.textContent =
            contadores.contadorAprovacao;


        contadorVerificarElemento.textContent =
            contadores.contadorVerificar;


        // ------------------------------------------------
        // USUÁRIO
        // ------------------------------------------------

        usuarioElemento.textContent =
            dados.nomeUsuario;


        // ------------------------------------------------
        // REPOSITÓRIO
        // ------------------------------------------------

        repositorioElemento.textContent =
            dados.repositorio;


        // ------------------------------------------------
        // DATA ATUAL
        // ------------------------------------------------

        dataAtualElemento.textContent =
            dataAtual;


        // ------------------------------------------------
        // SELETOR DE DATAS
        //
        // RELATÓRIOS CONSIDERAM TODOS OS USUÁRIOS.
        // ------------------------------------------------

        const historicoTodosUsuarios =
            obterHistoricoTodosUsuarios(dadosUsuarios);

        atualizarSeletorDeDatas(historicoTodosUsuarios);


        // ------------------------------------------------
        // HISTÓRICO
        //
        // CONTINUA SENDO DO USUÁRIO ATUAL.
        // ------------------------------------------------

        historicoElemento.innerHTML = "";


        const historicoDoDia =
            obterHistoricoDoDia(dadosUsuario);


        const historicoExibido =
            [...historicoDoDia].reverse().slice(0, 5);


        if (!historicoExibido.length) {

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


        for (const registro of historicoExibido) {

            const linha = document.createElement("tr");


            // --------------------------------------------
            // STATUS
            // --------------------------------------------

            const celulaStatus = document.createElement("td");


            celulaStatus.textContent = registro.status || "-";


            if (registro.status === "Aprovação") {

                celulaStatus.classList.add("status-aprovacao");

            } else if (registro.status === "Verificar") {

                celulaStatus.classList.add("status-verificar");
            }


            // --------------------------------------------
            // REPOSITÓRIO
            // --------------------------------------------

            const celulaRepositorio =
                document.createElement("td");


            celulaRepositorio.textContent =
                registro.repositorioArquivistico || "-";


            // --------------------------------------------
            // IDENTIFICADOR
            // --------------------------------------------

            const celulaIdentificador =
                document.createElement("td");


            celulaIdentificador.textContent =
                registro.identificadorUnico || "-";


            // --------------------------------------------
            // HORA
            // --------------------------------------------

            const celulaData =
                document.createElement("td");


            celulaData.textContent =
                obterHora(registro.dataHora);


            // --------------------------------------------
            // MONTAR LINHA
            // --------------------------------------------

            linha.appendChild(celulaStatus);

            linha.appendChild(celulaRepositorio);

            linha.appendChild(celulaIdentificador);

            linha.appendChild(celulaData);


            historicoElemento.appendChild(linha);
        }


    } catch (erro) {

        console.error("Erro ao atualizar popup:", erro);


        contadorElemento.textContent = "X";

        contadorAprovacaoElemento.textContent = "X";

        contadorVerificarElemento.textContent = "X";


        usuarioElemento.textContent = "Não disponível";


        repositorioElemento.textContent = "Não disponível";


        seletorDia.innerHTML = `
            <option value="">
                Não disponível
            </option>
        `;

        seletorDia.disabled = true;

        botaoExportarCSVPorDia.disabled = true;


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


// ============================================================
// GERAR CSV
// ============================================================

function gerarCSV(historico) {

    const cabecalho = [
        "Status",
        "Repositório Arquivístico",
        "Identificador Único",
        "Data/Hora",
        "Nome de Usuário"
    ];


    const linhas = [];


    // ------------------------------------------------
    // CABEÇALHO
    // ------------------------------------------------

    linhas.push(cabecalho.map(escaparCampoCSV).join(";"));


    // ------------------------------------------------
    // DADOS
    // ------------------------------------------------

    for (const registro of historico) {

        const linha = [

            registro.status || "",

            registro.repositorioArquivistico || "",

            registro.identificadorUnico || "",

            registro.dataHora || "",

            registro.nomeUsuario || ""

        ];


        linhas.push(linha.map(escaparCampoCSV).join(";"));
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
// CRIAR DOWNLOAD CSV
// ============================================================

function baixarCSV(conteudoCSV, nomeArquivo) {

    const blob = new Blob([conteudoCSV],
            {
                type: "text/csv;charset=utf-8;"
            }
        );


    const url = URL.createObjectURL(blob);


    const link = document.createElement("a");


    link.href = url;


    link.download = nomeArquivo;


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    setTimeout(
        () => {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );
}


// ============================================================
// NOME DO USUÁRIO PARA ARQUIVO
// ============================================================

function obterNomeUsuarioParaArquivo(nomeUsuario) {

    return normalizarTexto(nomeUsuario)
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_-]/g, "");
}


// ============================================================
// DATA ATUAL PARA NOME DO ARQUIVO
// ============================================================

function obterDataAtualParaArquivo() {

    const agora = new Date();


    const ano = agora.getFullYear();


    const mes =
        String(agora.getMonth() + 1).padStart(2, "0");


    const dia =
        String(agora.getDate()).padStart(2, "0");


    return `${ano}-${mes}-${dia}`;
}


// ============================================================
// EXPORTAR CSV COMPLETO
//
// TODOS OS USUÁRIOS.
// ============================================================

async function exportarCSV() {

    try {

        // IMPORTANTE:
        // Aqui usamos o histórico COMPLETO.
        //
        // Portanto, mesmo que o popup mostre somente
        // os registros do dia, o CSV continua contendo
        // todo o histórico armazenado.

        const dadosUsuarios = await obterDadosStorage();

        const historicoTodosUsuarios =
            obterHistoricoTodosUsuarios(dadosUsuarios);

        if (!historicoTodosUsuarios.length) {
            alert("Não existem registros no histórico para exportar.");

            return;
        }


        // ----------------------------------------------------
        // GERA CSV
        // ----------------------------------------------------

        const conteudoCSV = gerarCSV(historicoTodosUsuarios);


        const dataArquivo = obterDataAtualParaArquivo();


        const nomeArquivo =
            `Relatorio_Auditoria_${dataArquivo}.csv`;


        baixarCSV(conteudoCSV, nomeArquivo);


    } catch (erro) {

        console.error("Erro ao exportar CSV:", erro);


        alert("Não foi possível exportar o relatório CSV.");
    }
}


// ============================================================
// EXPORTAR CSV POR DIA
//
// TODOS OS USUÁRIOS.
// ============================================================

async function exportarCSVPorDia() {

    try {

        const dataSelecionada = seletorDia.value;


        if (!dataSelecionada) {

            alert("Selecione um dia para exportar.");

            return;
        }


        const dadosUsuarios = await obterDadosStorage();


        const historicoTodosUsuarios =
            obterHistoricoTodosUsuarios(dadosUsuarios);


        if (!historicoTodosUsuarios.length) {

            alert(
                "Não existem registros no histórico para exportar."
            );

            return;
        }


        const historicoDoDia =
            historicoTodosUsuarios.filter(
                registro => obterDataDoRegistro(
                        registro
                    ) === dataSelecionada
            );


        if (!historicoDoDia.length) {

            alert(
                `Não existem registros para o dia ${dataSelecionada}.`
            );

            return;
        }


        const conteudoCSV = gerarCSV(historicoDoDia);


        const dataArquivo =
            dataSelecionada.split("/").reverse().join("-");


        const nomeArquivo =
            `Relatorio_Diario_${dataArquivo}.csv`;


        baixarCSV(conteudoCSV, nomeArquivo);


    } catch (erro) {

        console.error("Erro ao exportar relatório diário:", erro);


        alert("Não foi possível exportar o relatório do dia.");
    }
}


// ============================================================
// EVENTO CSV COMPLETO
// ============================================================

botaoExportarCSV.addEventListener("click",
    async () => {

        await exportarCSV();

    }
);


// ============================================================
// EVENTO CSV POR DIA
// ============================================================

botaoExportarCSVPorDia.addEventListener("click",
    async () => {

        await exportarCSVPorDia();

    }
);


// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        atualizarPopup();


        console.log(`Popup v${VERSAO} carregado.`);

    }
);