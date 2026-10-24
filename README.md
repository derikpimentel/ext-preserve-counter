# SAFE-PreserveHub

Extensão de navegador desenvolvida para auxiliar na contagem e no acompanhamento de confirmações de envio para aprovação e de processos a verificar no PreserveHub.

## Objetivo

O SAFE-PreserveHub registra interações identificadas nos fluxos de Aprovação e Verificar, permitindo acompanhar os totais diários e consultar ou exportar o histórico dos registros.

O projeto continua em desenvolvimento. As funcionalidades descritas abaixo representam o comportamento implementado ou pretendido no código disponível; a validação integrada no PreserveHub ainda é necessária.

## Funcionalidades

- Organização dos dados por usuário identificado na página.
- Contadores diários para as categorias **Aprovação** e **Verificar**, além do total diário.
- Exibição de informações contextuais, como usuário, repositório e data, conforme os elementos identificados na página.
- Exibição temporária de um contador flutuante na página.
- Histórico com status, repositório arquivístico, identificador, data/hora e nome do usuário.
- Exibição dos registros mais recentes no popup, com limite de cinco entradas quando aplicado pelo código.
- Exportação do histórico completo disponível para CSV, com proposta de consolidação dos registros de todos os usuários.
- Exportação diária para CSV, com seleção de uma data e proposta de consolidação dos registros de todos os usuários naquela data.
- Detecção da ação de salvamento de metadados e análise dos campos **Repositório Físico** e **Localização Física** para classificar possíveis operações como Verificar.
- Restrição da classificação **Verificar** a objetos cujo status identificado seja `DIGITALIZADO`.
- Verificação de registros existentes por identificador e status, com tratamento da transição de Verificar para Aprovação conforme a implementação atual.

### Tratamento de falhas

- A leitura de `chrome.storage.local` diferencia a ausência inicial de dados de uma estrutura armazenada inválida.
- Erros de leitura são registrados no console e propagados, em vez de serem tratados silenciosamente como um armazenamento vazio.
- O contador visual não deve ser atualizado quando a rotina de gravação indicar falha.
- Se o popup não conseguir ler o armazenamento, os contadores exibem `X` para sinalizar indisponibilidade, em vez de apresentar `0` como se a consulta tivesse sido concluída com sucesso.

Esses comportamentos precisam ser confirmados por testes na extensão integrada.

### Limitações conhecidas

- A identificação dos elementos da página, do usuário, do repositório e do registro precisa ser validada nos ambientes integrados.
- O seletor usado para localizar o status `DIGITALIZADO` depende da estrutura real do DOM do PreserveHub.
- A classificação Verificar, a prevenção de duplicidades e a transição para Aprovação precisam ser testadas com operações reais controladas.
- A contagem diária depende do formato de data armazenado e da regra aplicada ao atualizar um registro durante a transição de status.
- A compatibilidade com dados de versões anteriores ainda não está confirmada.
- O botão de limpeza de dados não faz parte da interface atual do popup.
- A implementação atual usa `chrome.storage.local`; os dados previamente mantidos no `localStorage` da página não devem ser considerados migrados automaticamente.
- A exportação de auditoria entre usuários depende da consolidação correta dos históricos e da identificação do usuário de origem em cada linha do CSV; esse comportamento ainda precisa ser validado.

## Tecnologias

- HTML
- CSS
- JavaScript
- Chrome Extensions Manifest V3
- APIs de extensão do navegador

## Requisitos

- Navegador compatível com extensões baseadas no Manifest V3.
- Acesso a um dos ambientes configurados no `manifest.json`:
  - `https://preserve.cedae.com.br/`
  - `http://preserve.faetec.rj.gov.br/`
  - `https://preserve.faetec.rj.gov.br/`
- Permissões de extensão declaradas no `manifest.json`.
- Arquivo `Logo_SAFE.png` e arquivos de ícone presentes nos caminhos referenciados pela extensão.

> **Nota de segurança:** o endereço FAETEC por HTTP não usa TLS. Quando possível, prefira HTTPS e confirme se a permissão HTTP é necessária antes de distribuir a extensão.

## Instalação para desenvolvimento

1. Clone o repositório ou obtenha os arquivos do projeto.
2. Abra a página de gerenciamento de extensões do navegador.
3. Ative o modo de desenvolvedor.
4. Selecione a opção para carregar uma extensão sem compactação.
5. Selecione a pasta que contém o arquivo `manifest.json`.
6. Acesse um ambiente compatível do PreserveHub e teste os fluxos com cuidado.
7. Consulte o console do navegador e da página para identificar erros durante a validação.

Os nomes das opções podem variar conforme o navegador.

## Contagem diária e histórico

A regra pretendida é calcular os contadores a partir dos registros do histórico cuja data corresponda ao dia atual:

- **Aprovação:** registros do dia com status `Aprovação`.
- **Verificar:** registros do dia com status `Verificar`.
- **Total do dia:** soma das duas categorias.

O popup pode limitar a visualização aos cinco registros mais recentes do dia. Esse limite visual não deve excluir registros antigos do histórico armazenado.

Na implementação atual, os dados são organizados por usuário. A proposta de exportação geral consolida os históricos desses usuários para permitir uma visão de auditoria abrangente. Essa consolidação deve preservar a identificação do usuário responsável por cada registro.

## Exportação CSV

O popup disponibiliza duas opções de exportação:

- **Relatório completo:** destina-se a reunir todos os registros disponíveis nos históricos de todos os usuários.
- **Relatório por dia:** permite selecionar uma data e reunir os registros de todos os usuários associados àquela data.

A exportação diária deve utilizar a data de cada registro, conforme o formato efetivamente armazenado. Registros com formato diferente podem não aparecer no filtro diário e precisam ser tratados ou sinalizados de maneira apropriada.

As duas exportações devem manter uma estrutura consistente de colunas. Cada registro precisa permitir identificar, no mínimo, o usuário de origem, o identificador do registro, o status, o repositório e a data/hora, conforme os campos disponíveis na implementação.

As datas disponíveis no seletor devem ser únicas e aparecer em ordem decrescente, da mais recente para a mais antiga. Quando não houver registros, o seletor e o botão de exportação diária devem ficar desabilitados.

A seleção inicial de data deve seguir a regra implementada no código. O comportamento esperado — por exemplo, escolher a data mais recente anterior ao dia atual, quando disponível — precisa ser confirmado no navegador.

Os nomes de arquivo previstos são:

| Tipo de relatório | Padrão do nome do arquivo |
|---|---|
| Completo | `Relatorio_Auditoria_<AAAA-MM-DD>.csv` |
| Por dia | `Relatorio_Diario_<AAAA-MM-DD>.csv` |

No relatório completo, a data no nome representa o dia em que o arquivo foi gerado. No relatório diário, representa a data selecionada.

**Validações pendentes:** confirmar a consolidação de todos os usuários, a identificação do usuário em cada linha, o filtro diário, os nomes dos arquivos, a acentuação, os caracteres especiais, a quantidade de registros exportados e a proteção contra fórmulas em planilhas. Os nomes acima representam o padrão documental esperado e devem ser conferidos com os nomes efetivamente gerados pelo código.

Na transição de Verificar para Aprovação, a data/hora do registro pode ser atualizada para o momento da aprovação. Esse comportamento pode alterar o dia ao qual o registro pertence e deve ser validado.

## Armazenamento

A implementação atual utiliza `chrome.storage.local` com a chave `dadosContadorPorUsuario`. `content.js` registra as ocorrências e `popup.js` consulta os dados armazenados nesse mecanismo.

A leitura valida a estrutura superior dos dados: uma chave ausente é tratada como armazenamento ainda vazio; valores `null`, tipos que não sejam objetos e arrays são tratados como estrutura inválida. Falhas de leitura são registradas e propagadas para que não sejam confundidas com ausência de registros.

A rotina de registro também verifica o resultado informado pela função de gravação antes de atualizar o contador visual. Esse controle depende de `salvarDadosStorage()` retornar corretamente um indicador de sucesso ou falha.

A estrutura lógica por usuário contém:

- `contadorAprovacao`: contador associado à categoria Aprovação.
- `contadorVerificar`: contador associado à categoria Verificar.
- `historico`: lista de registros associados ao usuário.

Os registros do histórico podem conter os campos abaixo, conforme a identificação disponível na página:

| Campo | Finalidade |
|---|---|
| `identificadorUnico` | Identifica o registro no PreserveHub. |
| `dataHora` | Data e hora associadas à ocorrência. |
| `repositorioArquivistico` | Repositório associado ao registro. |
| `nomeUsuario` | Nome do usuário identificado na página. |
| `status` | Categoria da ação contabilizada. |

A consolidação de históricos para exportação deve manter a associação entre cada registro e o usuário em cujo histórico ele foi armazenado. Se o próprio registro não contiver o nome do usuário, a rotina de consolidação deve acrescentar essa informação a partir da chave ou dos dados de usuário disponíveis.

A mudança de `localStorage` da página para `chrome.storage.local` não garante migração automática dos dados antigos. A compatibilidade e a eventual necessidade de migração devem ser verificadas separadamente.

O popup depende de uma aba do PreserveHub que atenda aos critérios definidos pela extensão e das permissões declaradas no manifesto.

## Estrutura do projeto

| Arquivo | Responsabilidade |
|---|---|
| `manifest.json` | Define os metadados, as permissões, os ícones e a configuração da extensão. |
| `content.js` | Identifica interações na página, valida condições de classificação e registra as ocorrências. |
| `popup.html` | Define a interface do popup. |
| `popup.js` | Consulta os dados armazenados, atualiza os contadores, apresenta o histórico, preenche o seletor de datas e exporta relatórios CSV completos ou diários. |
| `Logo_SAFE.png` e arquivos em `icons/` | Recursos visuais referenciados pela interface e pelo manifesto. |
| `README.md` | Documentação de instalação, funcionalidades e limitações. |
| `CHANGELOG.md` | Registro das mudanças relevantes durante o desenvolvimento. |

A lista de arquivos deve ser conferida com o conteúdo efetivamente versionado antes do commit.

## Versão

A versão declarada no `manifest.json` nesta etapa é `1.0.0`. O número da versão não significa, por si só, que a extensão esteja pronta para produção.

## Estado do projeto

Antes de uma distribuição, validar pelo menos:

- A contagem diária e a consistência dos totais por categoria.
- A persistência, leitura e integridade dos dados.
- O tratamento de estruturas armazenadas inválidas e de falhas de leitura/gravação.
- A confirmação de que `salvarDadosStorage()` informa corretamente sucesso ou falha.
- A identificação do usuário, do repositório e do registro.
- A identificação do status `DIGITALIZADO` no DOM real do PreserveHub.
- A compatibilidade dos formatos de data com o filtro diário.
- A apresentação do histórico e a exportação completa para CSV.
- A consolidação dos registros de todos os usuários no relatório completo.
- A exportação diária com registros de vários usuários na data selecionada.
- A identificação correta do usuário de origem em cada linha exportada.
- O comportamento do seletor quando não existem registros para exportar.
- A integridade dos campos CSV, caracteres especiais e proteção contra fórmulas em planilhas.
- A correspondência entre os nomes documentados e os nomes reais dos arquivos gerados.
- O comportamento da seleção inicial de data, especialmente quando existem registros do dia atual e de dias anteriores.
- O comportamento diante de interações repetidas.
- A transição de Verificar para Aprovação sem duplicar registros.
- A compatibilidade com dados existentes de versões anteriores.
- O funcionamento integrado nos ambientes CEDAE e FAETEC.
- A necessidade de acesso ao ambiente FAETEC por HTTP.
- A ausência de erros relevantes no console.

## Histórico de alterações

Consulte o arquivo [CHANGELOG.md](CHANGELOG.md) para acompanhar a evolução do projeto.
