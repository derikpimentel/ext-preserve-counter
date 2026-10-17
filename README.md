# Contador SAFE
Extensão de navegador desenvolvida para auxiliar na contagem e no acompanhamento de confirmações de envio para aprovação no PreserveHub.

## Objetivo

O Contador SAFE tem como objetivo registrar as confirmações realizadas no fluxo de envio para aprovação, facilitando o acompanhamento da quantidade de operações contabilizadas e a consulta ao histórico dos registros.

## Funcionalidades

- Contagem de acionamentos por usuário.
- Contadores separados para as categorias Aprovação e Verificar, com validação do fluxo Verificar ainda pendente.
- Exibição do total geral e dos totais por categoria.
- Histórico de acionamentos com status, repositório, identificador único e data/hora.
- Consulta dos dados do usuário identificado no PreserveHub.
- Limpeza do contador e do histórico do usuário atual, mediante confirmação.
- Exibição de um contador temporário na página.
- Exportação do histórico do usuário atual para CSV.
- Detecção da ação de salvamento de metadados para identificar possíveis operações da categoria Verificar.
- Verificação dos campos Repositório Físico e Localização Física para identificar a categoria Verificar.
- Proteção contra a contabilização repetida da mesma combinação de identificador único e status já presente no histórico.

> Observação 1: as funcionalidades devem ser consideradas implementadas no código, mas precisam ser verificadas na versão integrada antes de serem declaradas como plenamente validadas.

> Observação 2: a categoria Verificar e a prevenção de duplicidades ainda precisam ser validadas no PreserveHub. O comportamento esperado depende da confirmação dos campos identificados, das regras de contabilização e dos testes na versão integrada.

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

Na implementação atualmente discutida, o contador e o histórico são armazenados no `localStorage` da página do PreserveHub, organizados por usuário.

A chave de armazenamento utilizada é  `dadosContadorAprovacaoPorUsuario`. Para cada usuário identificado, a estrutura contém:

- `contadorAprovacao`: total de acionamentos da categoria Aprovação.
- `contadorVerificar`: total de acionamentos da categoria Verificar.
- `historico`: lista de registros associados ao usuário.

Os registros do histórico incluem informações como:

| Campo	| Finalidade |
|---|---|
| `identificadorUnico` | Identifica o registro no PreserveHub. |
| `dataHora` | Registra a data e hora da confirmação. |
| `repositorioArquivistico` | Identifica o repositório associado. |
| `nomeUsuario` | Registra o nome de usuário identificado na página. |
| `status` | Identifica a categoria da ação contabilizada. |

O popup utiliza a permissão de execução de scripts para consultar e alterar esses dados na aba compatível. Por isso, seu funcionamento depende da disponibilidade de uma aba do PreserveHub.

A compatibilidade com os dados armazenados por versões anteriores ainda precisa ser verificada.

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