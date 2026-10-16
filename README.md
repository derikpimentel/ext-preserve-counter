# Contador SAFE
Extensão de navegador desenvolvida para auxiliar na contagem e no acompanhamento de confirmações de envio para aprovação no PreserveHub.

## Objetivo

O Contador SAFE tem como objetivo registrar as confirmações realizadas no fluxo de envio para aprovação, facilitando o acompanhamento da quantidade de operações contabilizadas e a consulta ao histórico dos registros.

## Funcionalidades

- Identificação do fluxo de envio para aprovação no PreserveHub.
- Detecção da confirmação por meio do botão **Sim**.
- Contagem das confirmações identificadas.
- Registro do identificador único e da data e hora da ocorrência, conforme a implementação.
- Exibição temporária de uma janela flutuante com o total contabilizado.
- Exibição do contador e do histórico no popup da extensão.
- Opção para zerar o contador e limpar o histórico.
- Contador independente por usuário identificado.
- Histórico de confirmações organizado por usuário.
- Limpeza do contador e do histórico do usuário atual.

> Observação: as funcionalidades devem ser consideradas implementadas no código, mas precisam ser verificadas na versão integrada antes de serem declaradas como plenamente validadas.

## Tecnologias

- HTML
- CSS
- JavaScript
- Chrome Extensions Manifest V3
- APIs de extensão do navegador

## Requisitos

- Navegador compatível com extensões baseadas no Manifest V3.
- Acesso ao PreserveHub.
- Permissões de extensão declaradas no arquivo `manifest.json`.

## Instalação para desenvolvimento

1. Clone o repositório ou obtenha os arquivos do projeto.
2. Abra a página de gerenciamento de extensões do navegador.
3. Ative o modo de desenvolvedor.
4. Selecione a opção para carregar uma extensão sem compactação.
5. Selecione a pasta que contém o arquivo `manifest.json`.
6. Acesse o PreserveHub e teste o fluxo de envio para aprovação.

Os nomes das opções podem variar conforme o navegador.

## Armazenamento

Na implementação atualmente discutida, o contador e o histórico são armazenados no `localStorage` da página do PreserveHub, utilizando as chaves:

- `contadorAprovacao`
- `historicoContadorAprovacao`

Os registros do histórico incluem quatro campos:

| Campo	| Finalidade |
|---|---|
| `identificadorUnico` | Identifica o registro no PreserveHub. |
| `dataHora` | Registra a data e hora da confirmação. |
| `repositorioArquivistico` | Identifica o repositório associado. |
| `nomeUsuario` | Registra o nome de usuário identificado na página. |

O popup utiliza a permissão de execução de scripts para consultar e alterar esses dados na aba compatível. Por isso, seu funcionamento depende da disponibilidade de uma aba do PreserveHub.

## Estrutura do projeto

| Arquivo | Responsabilidade |
|---|---|
| `manifest.json` | Define os metadados, as permissões e a configuração da extensão. |
| `content.js` | Identifica as interações relevantes na página e registra as ocorrências. |
| `popup.html` | Define a interface do popup. |
| `popup.js` | Atualiza o contador, apresenta o histórico e executa a limpeza dos dados. |

## Versão

A versão declarada no manifesto durante esta etapa de desenvolvimento é `1.0.0`.

O número da versão não representa, por si só, que a extensão esteja pronta para produção.

## Estado do projeto

O projeto está em desenvolvimento. Antes de uma distribuição definitiva, devem ser verificadas a contagem, a persistência dos dados, a identificação do registro, a apresentação do histórico, a limpeza dos dados e o comportamento diante de interações repetidas.

## Histórico de alterações

Consulte o arquivo [CHANGELOG.md](CHANGELOG.md) para acompanhar a evolução do projeto.