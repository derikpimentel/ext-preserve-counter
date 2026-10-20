# SAFE-PreserveHub
Extensão de navegador desenvolvida para auxiliar na contagem e no acompanhamento de confirmações de envio para aprovação e processos a verificar no PreserveHub.

## Objetivo

O SAFE-PreserveHub tem como objetivo registrar as confirmações realizadas no fluxo de envio para aprovação, e contabilizar processos analisados ainda a verificar, facilitando o acompanhamento da quantidade de operações contabilizadas e a consulta ao histórico dos registros.

A interface apresenta os totais referentes ao dia atual, enquanto o histórico armazenado permite manter registros de diferentes datas.

## Funcionalidades

- Contagem de acionamentos por usuário.
- Contadores diários separados para as categorias Aprovação e Verificar, com validação do fluxo Verificar ainda pendente.
- Exibição do total de acionamentos do dia atual e dos totais diários por categoria.
- Exibição da data atual no popup e no contador flutuante.
- Exibição do repositório arquivístico no contador flutuante.
- Histórico de acionamentos com status, repositório, identificador único e data/hora, filtrado pela data atual e limitado aos cinco registros mais recentes no popup.
- Consulta dos dados do usuário identificado no PreserveHub.
- Limpeza do contador e do histórico do usuário atual, mediante confirmação, conforme a implementação disponível.
- Exibição de um contador temporário na página.
- Exportação do histórico do usuário atual para CSV, utilizando o histórico completo armazenado.
- Detecção da ação de salvamento de metadados para identificar possíveis operações da categoria Verificar.
- Verificação dos campos Repositório Físico e Localização Física para identificar a categoria Verificar.
- Proteção contra a contabilização repetida da mesma combinação de identificador único e status já presente no histórico.
- Atualização do registro existente na transição de Verificar para Aprovação, conforme a implementação em desenvolvimento.

> Observação 1: as funcionalidades devem ser consideradas implementadas no código, mas precisam ser verificadas na versão integrada antes de serem declaradas como plenamente validadas.

> Observação 2: a categoria Verificar e a prevenção de duplicidades ainda precisam ser validadas no PreserveHub. O comportamento esperado depende da confirmação dos campos identificados, das regras de contabilização e dos testes na versão integrada.

> Observação 3: a contagem diária depende da compatibilidade entre o formato de data utilizado no filtro e os valores armazenados no histórico. A compatibilidade com registros antigos deve ser verificada.

## Tecnologias

- HTML
- CSS
- JavaScript
- Chrome Extensions Manifest V3
- APIs de extensão do navegador

## Requisitos

- Navegador compatível com extensões baseadas no Manifest V3.
- Acesso a um dos ambientes configurados no manifesto:
 - https://preserve.cedae.com.br/
 - http://preserve.faetec.rj.gov.br/
 - https://preserve.faetec.rj.gov.br/
- Permissões de extensão declaradas no arquivo `manifest.json`.
- Arquivo Logo_SAFE.png presente na pasta da extensão.

## Instalação para desenvolvimento

1. Clone o repositório ou obtenha os arquivos do projeto.
2. Abra a página de gerenciamento de extensões do navegador.
3. Ative o modo de desenvolvedor.
4. Selecione a opção para carregar uma extensão sem compactação.
5. Selecione a pasta que contém o arquivo `manifest.json`.
6. Acesse o PreserveHub e teste o fluxo de envio para aprovação.

Os nomes das opções podem variar conforme o navegador.

### Contagem diária e histórico

Os contadores apresentados no popup e no contador flutuante são calculados com base nos registros do histórico que correspondem à data atual.

A contagem diária é dividida em três valores:

- Aprovação: quantidade de registros do dia atual com status Aprovação.
- Verificar: quantidade de registros do dia atual com status Verificar.
- Total do dia: soma dos registros contabilizados nas duas categorias.

O popup apresenta somente os registros correspondentes à data atual, exibindo até cinco entradas mais recentes. Essa limitação se aplica à visualização do popup e não significa que os registros de dias anteriores sejam excluídos do armazenamento.

A exportação CSV utiliza o histórico completo disponível no armazenamento, incluindo registros de dias anteriores, conforme a implementação atual.

Na transição de um registro de Verificar para Aprovação, a data associada ao registro pode ser atualizada para o momento da aprovação. Esse comportamento deve ser considerado na validação da contagem diária, pois pode alterar o dia ao qual o registro é atribuído.

## Armazenamento

Na implementação atualmente discutida, o contador e o histórico são armazenados no `localStorage` da página do PreserveHub, organizados por usuário.

A chave de armazenamento utilizada é  `dadosContadorPorUsuario`. Para cada usuário identificado, a estrutura contém:

- `contadorAprovacao`: total de acionamentos da categoria Aprovação.
- `contadorVerificar`: total de acionamentos da categoria Verificar.
- `historico`: lista de registros associados ao usuário.

Os dados são armazenados no contexto da origem da página. Portanto, ambientes acessados por endereços diferentes possuem armazenamentos separados.

Os registros do histórico incluem os seguintes campos:

| Campo	| Finalidade |
|---|---|
| `identificadorUnico` | Identifica o registro no PreserveHub. |
| `dataHora` | Registra a data e hora da confirmação. |
| `repositorioArquivistico` | Identifica o repositório associado. |
| `nomeUsuario` | Registra o nome de usuário identificado na página. |
| `status` | Identifica a categoria da ação contabilizada. |

O popup utiliza a execução de scripts para consultar os dados na aba compatível do PreserveHub. Por isso, seu funcionamento depende da disponibilidade de uma aba que atenda aos critérios definidos pela extensão.

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

O projeto está em desenvolvimento. Antes de uma distribuição definitiva, devem ser verificadas:

- A contagem diária e a consistência dos totais por categoria.
- A persistência e a integridade dos dados armazenados.
- A identificação do usuário, do repositório e do registro.
- A compatibilidade dos formatos de data com o filtro diário.
- A apresentação do histórico e a exportação completa para CSV.
- A limpeza dos dados e seus efeitos sobre os contadores.
- O comportamento diante de interações repetidas.
- A transição de Verificar para Aprovação.
- A compatibilidade com dados existentes de versões anteriores.

## Histórico de alterações

Consulte o arquivo [CHANGELOG.md](CHANGELOG.md) para acompanhar a evolução do projeto.