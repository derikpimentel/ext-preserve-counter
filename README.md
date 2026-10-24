# SAFE-PreserveHub

Extensão de navegador baseada no Chrome Extensions Manifest V3 para auxiliar na contagem e no acompanhamento de registros dos fluxos de **Aprovação** e **Verificar** no PreserveHub.

> **Estado:** projeto em desenvolvimento. Os ambientes listados refletem a configuração apresentada no código, mas precisam ser testados individualmente antes de qualquer distribuição.

## Objetivo

Registrar interações relacionadas aos fluxos de Aprovação e Verificar, organizar o histórico por usuário e disponibilizar contadores e relatórios CSV para acompanhamento e auditoria.

## Funcionalidades

- Organização dos dados por usuário identificado na página.
- Contadores diários para Aprovação e Verificar e total do dia.
- Exibição de informações contextuais, como usuário, repositório, identificador e data/hora, conforme os elementos encontrados na página.
- Indicador flutuante temporário na página.
- Histórico de registros com status, repositório arquivístico, identificador, data/hora e nome do usuário, conforme os dados disponíveis.
- Exibição dos registros recentes no popup.
- Exportação CSV do histórico completo, com a intenção de agregar os registros de todos os usuários armazenados.
- Exportação CSV diária, filtrada pela data selecionada, com a intenção de considerar os registros de todos os usuários.
- Seletor de datas com dias que possuem registros, em ordem decrescente.
- Detecção de ações relacionadas ao salvamento de metadados e avaliação da categoria Verificar.
- Restrição pretendida da classificação Verificar a objetos cujo status identificado seja `DIGITALIZADO`.
- Tratamento da transição de Verificar para Aprovação e prevenção de duplicidades, ainda sujeitos a testes integrados.

## Ambientes configurados

Os seguintes endereços foram adicionados ou mantidos na configuração do `manifest.json` e na lista de ambientes reconhecidos pelo popup:

| Órgão ou ambiente | Endereço configurado |
|---|---|
| CEDAE | `https://preserve.cedae.com.br/` |
| FAETEC | `http://preserve.faetec.rj.gov.br/` |
| FAETEC | `https://preserve.faetec.rj.gov.br/` |
| PRODERJ | `http://preserve.proderj.rj.gov.br/` |
| DETRO | `http://preserve.detro.rj.gov.br/` |
| Casa Civil | `http://preserve.casacivil.rj.gov.br/` |
| SEDSDH | `http://preserve.sedsdh.rj.gov.br/` |
| PROCON | `http://preserve.procon.rj.gov.br/` |
| AGENERSA | `http://preserve/` |
| DEGASE | `http://preserve.degase.rj.gov.br.local/` |
| Monaco Preserve | `http://monaco-preserve.safeconversaodigital.com.br/` |
| Monaco Preserve | `https://monaco-preserve.safeconversaodigital.com.br/` |

**Importante:** essa lista documenta os endereços configurados, não uma confirmação de funcionamento em todos eles. Alguns podem depender de VPN, DNS interno, rede corporativa ou outras condições de acesso.

### Considerações de segurança

- Os endereços configurados por HTTP não usam TLS para proteger o tráfego entre o navegador e o servidor.
- Sempre que o ambiente disponibilizar HTTPS, avalie a utilização do endereço seguro.
- Mantenha apenas as permissões de host necessárias ao funcionamento da extensão.
- Confirme que os endereços internos, especialmente `http://preserve/` e o hostname do DEGASE com sufixo `.local`, correspondem aos endereços realmente utilizados pelos usuários.
- A disponibilidade de um endereço na configuração não garante que o navegador consiga acessá-lo ou que a estrutura da página seja compatível com os seletores da extensão.

## Exportação CSV

O popup oferece duas modalidades de exportação:

- **Relatório completo:** deve reunir os registros disponíveis no histórico de todos os usuários armazenados.
- **Relatório diário:** deve reunir os registros de todos os usuários cuja data corresponda ao dia selecionado.

A exportação diária deve usar as datas existentes no histórico, sem repetir datas no seletor. Quando não houver datas disponíveis, os controles da exportação diária devem permanecer indisponíveis. A data selecionada é interpretada conforme o formato de data usado nos registros, atualmente esperado como `DD/MM/AAAA` no início de `dataHora`.

Os padrões esperados para os nomes dos arquivos são:

| Tipo | Padrão de nome |
|---|---|
| Completo | `Relatorio_Auditoria_<AAAA-MM-DD>.csv` |
| Diário | `Relatorio_Diario_<AAAA-MM-DD>.csv` |

No relatório completo, a data do nome representa o dia de geração do arquivo. No relatório diário, representa a data selecionada. Os nomes definitivos devem ser confirmados no código e em testes manuais.

**Importante:** agregar históricos de vários usuários não garante, por si só, que cada linha do CSV identifique corretamente o usuário de origem. A consolidação, a identificação do usuário, o filtro por data e os nomes dos arquivos devem ser validados antes de considerar os relatórios adequados para auditoria.

## Contagem diária e histórico

A regra pretendida é calcular os contadores com base nos registros do histórico cuja data corresponda ao dia atual:

- **Aprovação:** registros do dia com status `Aprovação`.
- **Verificar:** registros do dia com status `Verificar`.
- **Total do dia:** soma das categorias.

Os contadores e o histórico apresentados no popup continuam sendo individuais para o usuário atual. A intenção de consolidar todos os usuários se aplica aos relatórios CSV, e não à exibição individual dos contadores ou do histórico.

Limites aplicados à exibição do histórico no popup não devem remover registros do histórico armazenado nem limitar indevidamente os relatórios CSV.

Na transição de Verificar para Aprovação, a data/hora associada ao registro pode ser atualizada para o momento da aprovação. Esse comportamento pode alterar o dia ao qual o registro é atribuído e precisa ser validado.

## Armazenamento

A implementação atual utiliza `chrome.storage.local` com a chave `dadosContadorPorUsuario`. O `content.js` registra ocorrências e o `popup.js` consulta os dados armazenados.

A estrutura lógica por usuário contém, conforme a implementação:

- `contadorAprovacao`: contador associado à categoria Aprovação.
- `contadorVerificar`: contador associado à categoria Verificar.
- `historico`: lista de registros associados ao usuário.

Os registros podem conter campos como:

| Campo | Finalidade |
|---|---|
| `identificadorUnico` | Identifica o registro no PreserveHub. |
| `dataHora` | Data e hora associadas à ocorrência. |
| `repositorioArquivistico` | Repositório associado ao registro. |
| `nomeUsuario` | Nome do usuário identificado na página, quando disponível. |
| `status` | Categoria da ação contabilizada. |

A ausência da chave de armazenamento deve ser diferenciada de uma estrutura inválida ou de uma falha de leitura. A compatibilidade com dados de versões anteriores não está confirmada; a mudança de `localStorage` da página para `chrome.storage.local` não implica migração automática.

## Requisitos

- Navegador compatível com extensões Manifest V3.
- Acesso de rede aos ambientes pretendidos.
- Permissões de host declaradas no manifesto.
- Arquivos de ícone referenciados no manifesto presentes nos caminhos corretos.
- Estrutura de página compatível com os seletores usados pela extensão.

## Instalação para desenvolvimento

1. Obtenha o repositório ou os arquivos do projeto.
2. Abra a página `chrome://extensions` no Chrome ou a página equivalente no navegador compatível.
3. Ative o modo de desenvolvedor.
4. Escolha a opção para carregar uma extensão sem compactação.
5. Selecione a pasta que contém `manifest.json`.
6. Acesse um ambiente configurado e execute testes controlados.
7. Consulte o console da extensão e o console da página durante a validação.

Os nomes das opções podem variar conforme o navegador.

## Estrutura do projeto

| Arquivo | Responsabilidade |
|---|---|
| `manifest.json` | Metadados, permissões, ícones e configuração da extensão. |
| `content.js` | Identifica interações na página, avalia condições e registra ocorrências. |
| `popup.html` | Interface do popup. |
| `popup.js` | Consulta armazenamento, apresenta contadores e histórico, prepara os dados e executa as exportações CSV. |
| `Logo_SAFE.png` e arquivos em `icons/` | Recursos visuais referenciados pelo projeto, conforme os caminhos reais. |
| `README.md` | Instalação, funcionalidades, ambientes, limitações e procedimentos de validação. |
| `CHANGELOG.md` | Histórico das alterações relevantes. |

Confira os arquivos efetivamente versionados antes do commit.

## Versão

A versão declarada no manifesto nesta etapa é `1.0.0`. A atualização da documentação não altera o número da versão, e esse número não significa que o projeto esteja pronto para produção.

## Validações pendentes

Antes da distribuição, validar:

- Identificação correta do usuário, repositório, registro e status no DOM real.
- Contagem diária e consistência entre contadores, histórico e indicador flutuante.
- Persistência, leitura e integridade dos dados, incluindo falhas de leitura e gravação.
- Retorno de sucesso ou falha da rotina de gravação e atualização visual somente após gravação bem-sucedida.
- Classificação Verificar e localização do status `DIGITALIZADO`.
- Prevenção de duplicidades e transição de Verificar para Aprovação.
- Compatibilidade com dados existentes e eventual necessidade de migração.
- Exportação completa com registros de vários usuários.
- Exportação diária com vários usuários e filtro correto da data selecionada.
- Identificação da origem/usuário em cada linha do CSV.
- Cabeçalhos, separadores, acentos, caracteres especiais e proteção contra fórmulas em planilhas.
- Nomes dos arquivos, incluindo a grafia `Relatorio_Auditoria` e a data correta para cada modalidade.
- Datas vazias, datas disponíveis, ordenação e seleção inicial do seletor.
- Reconhecimento correto de cada endereço no popup.
- Correspondência entre `host_permissions`, `content_scripts.matches` e `ambientesSuportados`.
- Funcionamento real em cada ambiente, incluindo os que dependem de VPN ou DNS interno.
- Necessidade de acesso HTTP nos ambientes que não oferecem ou não utilizam HTTPS.
- Ausência de erros relevantes no console durante os fluxos principais.

## Histórico de alterações

Consulte [CHANGELOG.md](CHANGELOG.md) para acompanhar a evolução do projeto.
