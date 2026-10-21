# SAFE-PreserveHub

Extensão de navegador desenvolvida para auxiliar na contagem e no acompanhamento de confirmações de envio para aprovação e de processos a verificar no PreserveHub.

## Objetivo

O SAFE-PreserveHub registra interações identificadas nos fluxos de Aprovação e Verificar, permitindo acompanhar os totais diários e consultar ou exportar o histórico dos registros.

O projeto continua em desenvolvimento. As funcionalidades descritas abaixo representam o comportamento pretendido ou implementado no código disponível; a validação integrada no PreserveHub ainda é necessária.

## Funcionalidades

- Organização dos dados por usuário identificado na página.
- Contadores diários para as categorias **Aprovação** e **Verificar**, além do total diário.
- Exibição de informações contextuais, como usuário, repositório e data, conforme os elementos identificados na página.
- Exibição temporária de um contador flutuante na página.
- Histórico com status, repositório arquivístico, identificador único, data/hora e nome do usuário.
- Exibição dos registros mais recentes no popup, com limite de cinco entradas quando aplicado pelo código.
- Exportação do histórico disponível para CSV.
- Detecção da ação de salvamento de metadados e análise dos campos **Repositório Físico** e **Localização Física** para classificar possíveis operações como Verificar.
- Verificação de registros existentes por identificador único e status, com tratamento da transição de Verificar para Aprovação em desenvolvimento.

### Limitações conhecidas

- A identificação dos elementos da página, do usuário, do repositório e do registro precisa ser validada nos ambientes integrados.
- A classificação Verificar, a prevenção de duplicidades e a transição para Aprovação precisam ser testadas com operações reais controladas.
- A contagem diária depende do formato de data armazenado e da regra aplicada ao atualizar um registro durante a transição de status.
- A compatibilidade com dados de versões anteriores ainda não está confirmada.
- O botão de limpeza de dados não faz parte da interface atual do popup. Não considere a limpeza disponível pela interface sem verificar o código integrado.
- A migração de `localStorage` da página para `chrome.storage.local`, se aplicável à versão final, precisa ser concluída de maneira consistente entre `content.js` e `popup.js`. Alterar o mecanismo ou a chave não migra automaticamente os dados existentes.

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
- Arquivo `Logo_SAFE.png` presente na pasta da extensão, caso continue sendo referenciado pelo cabeçalho do popup.
- Arquivos de ícone presentes nos caminhos declarados no `manifest.json`.

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

A exportação CSV deve utilizar o histórico completo disponível, incluindo registros de dias anteriores. Esse comportamento deve ser confirmado por teste na versão integrada.

Na transição de Verificar para Aprovação, a data/hora do registro pode ser atualizada para o momento da aprovação. Esse comportamento pode alterar o dia ao qual o registro pertence e deve ser validado.

## Armazenamento

A arquitetura de armazenamento está em validação. A versão anterior utilizava `localStorage` da página do PreserveHub, enquanto a implementação mais recente compartilhada para `content.js` passou a utilizar `chrome.storage.local` com a chave `dadosContadorPorUsuario`.

Antes de considerar essa mudança concluída, confirme que `content.js` e `popup.js` leem e gravam no mesmo mecanismo e na mesma chave. Também deve ser verificado se é necessário migrar dados da implementação anterior. Não presuma que os dados existentes serão migrados automaticamente.

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

O popup depende de uma aba do PreserveHub que atenda aos critérios definidos pela extensão e das permissões declaradas no manifesto.

## Estrutura do projeto

| Arquivo | Responsabilidade |
|---|---|
| `manifest.json` | Define os metadados, as permissões, os ícones e a configuração da extensão. |
| `content.js` | Identifica interações na página e registra as ocorrências. |
| `popup.html` | Define a interface do popup. |
| `popup.js` | Atualiza os contadores, apresenta o histórico e executa as ações disponíveis na interface. |
| `Logo_SAFE.png` e arquivos em `icons/` | Recursos visuais referenciados pela interface e pelo manifesto, conforme os arquivos presentes no projeto. |
| `README.md` | Documentação de instalação, funcionalidades e limitações. |
| `CHANGELOG.md` | Registro das mudanças relevantes durante o desenvolvimento. |

A lista acima deve ser conferida com os arquivos efetivamente versionados antes do commit.

## Versão

A versão declarada no `manifest.json` nesta etapa é `1.0.0`. O número da versão não significa, por si só, que a extensão esteja pronta para produção.

## Estado do projeto

Antes de uma distribuição, validar pelo menos:

- A contagem diária e a consistência dos totais por categoria.
- A persistência, leitura e integridade dos dados.
- A identificação do usuário, do repositório e do registro.
- A compatibilidade dos formatos de data com o filtro diário.
- A apresentação do histórico e a exportação completa para CSV.
- O comportamento diante de interações repetidas.
- A transição de Verificar para Aprovação sem duplicar registros.
- A compatibilidade com dados existentes de versões anteriores.
- O funcionamento integrado nos ambientes CEDAE e FAETEC.
- A necessidade de acesso ao ambiente FAETEC por HTTP.
- A ausência de erros relevantes no console.

## Histórico de alterações

Consulte o arquivo [CHANGELOG.md](CHANGELOG.md) para acompanhar a evolução do projeto.