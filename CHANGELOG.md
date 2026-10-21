# Changelog

Este arquivo registra as mudanças relevantes do SAFE-PreserveHub ao longo do desenvolvimento. O formato é inspirado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

As entradas descrevem a evolução do projeto e não significam, necessariamente, que cada funcionalidade tenha sido validada em todos os cenários.

## [Em desenvolvimento]

### Adicionado
- Estrutura inicial da extensão baseada no Chrome Extensions Manifest V3.
- Popup para apresentação do contador.
- Identificação de interações relacionadas ao envio para aprovação no PreserveHub.
- Registro das confirmações identificadas.
- Histórico com identificador único e data/hora.
- Indicador flutuante temporário com o total contabilizado.
- Interface de histórico no popup.
- Identificação do repositório arquivístico e do usuário exibido na página.
- Inclusão do repositório e do usuário nos registros do histórico.
- Exibição de informações contextuais no popup e no contador flutuante.
- Estrutura de contadores e histórico organizada por usuário.
- Separação dos contadores por categoria: Aprovação e Verificar.
- Exibição do total diário e dos totais por categoria.
- Exibição do status de cada registro no histórico.
- Exportação do histórico para CSV com status, repositório, identificador único, data/hora e nome de usuário.
- Detecção do acionamento de salvamento de metadados para avaliar possíveis operações da categoria Verificar.
- Análise dos campos Repositório Físico e Localização Física para auxiliar na classificação de operações.
- Verificação do histórico por identificador único e status para ajudar a evitar duplicidades.
- Tratamento da transição de um registro existente de Verificar para Aprovação, ainda sujeito a validação integrada.
- Reorganização visual do popup, com painel de contadores e apresentação do histórico.
- Inclusão da logo e atualização da identidade visual para SAFE-PreserveHub.

### Alterado
- Ampliação das informações apresentadas no histórico.
- Substituição da estrutura global de contador e histórico por uma estrutura organizada por usuário.
- Reorganização da detecção de interações para tratar separadamente as ações de Aprovação e Verificar.
- Atualização da identificação e da extração de informações da página.
- Atualização do identificador do elemento flutuante para `janela-contador`.
- Inclusão e reorganização de mensagens de diagnóstico para auxiliar a validação.
- Limitação da visualização do histórico no popup aos cinco registros mais recentes, sem intenção de excluir os registros anteriores do armazenamento.
- Ajuste dos contadores para considerar os registros associados ao dia atual.
- Manutenção da exportação CSV baseada no histórico completo disponível.
- Atualização dos endereços configurados para incluir os ambientes CEDAE e FAETEC, conforme o manifesto.
- Alteração da chave de dados por usuário para `dadosContadorPorUsuario` na implementação mais recente compartilhada.
- Início da mudança do armazenamento do `localStorage` da página para `chrome.storage.local` em `content.js`; a consistência com `popup.js` e a compatibilidade com dados anteriores precisam ser confirmadas.

### Removido
- O botão de limpeza de contador e histórico foi retirado da interface atual do popup. A limpeza não deve ser considerada disponível pela interface nesta etapa.

### Em validação
- Identificação correta do registro, do usuário e do repositório no PreserveHub.
- Precisão dos seletores e preservação da grafia dos valores identificados.
- Contagem correta das categorias Aprovação e Verificar.
- Prevenção de duplicidades sem bloquear novas ocorrências legítimas.
- Persistência, leitura e consistência dos contadores e do histórico.
- Consistência entre os contadores do popup e do contador flutuante.
- Exibição do histórico em ordem decrescente de data/hora.
- Comportamento da contagem diária na transição de Verificar para Aprovação.
- Transição sem duplicação e preservação dos dados históricos.
- Tratamento de dados inválidos e de falhas na identificação dos campos.
- Compatibilidade com dados armazenados pela implementação anterior.
- Consistência do mecanismo e da chave de armazenamento entre `content.js` e `popup.js`.
- Funcionamento da exportação CSV, incluindo acentos, caracteres especiais e proteção contra fórmulas em planilhas.
- Correspondência entre o status contabilizado e a mensagem apresentada no contador flutuante.
- Compatibilidade do identificador do contador flutuante com os demais arquivos.
- Funcionamento após a integração dos scripts, permissões e ícones definidos no manifesto.
- Compatibilidade do filtro diário com os formatos de data existentes.
- Funcionamento integrado nos ambientes CEDAE e FAETEC.
- Necessidade de acesso HTTP no ambiente FAETEC.
- Ausência de erros relevantes no console durante os fluxos principais.

## Versão declarada no manifesto

A versão declarada no `manifest.json` durante esta etapa de desenvolvimento é `1.0.0`. A atualização deste changelog não altera o número da versão.

## Convenção de registro

- **Adicionado:** novas funcionalidades.
- **Alterado:** mudanças em funcionalidades existentes.
- **Corrigido:** correções de erros.
- **Removido:** funcionalidades retiradas.
- **Em validação:** comportamentos que ainda precisam de confirmação prática.

As entradas devem ser atualizadas conforme as alterações reais do código e os resultados dos testes.