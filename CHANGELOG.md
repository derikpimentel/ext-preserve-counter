# Changelog

Este arquivo registra as mudanças relevantes do SAFE-PreserveHub ao longo do desenvolvimento.

O formato segue uma organização inspirada no Keep a Changelog. As entradas descrevem a evolução funcional do projeto; não significam, necessariamente, que cada funcionalidade tenha sido validada em todos os cenários.

## [Em desenvolvimento]

### Adicionado

- Estrutura inicial da extensão baseada no Chrome Extensions Manifest V3.
- Popup para apresentação do contador.
- Funcionalidade de zerar o contador.
- Identificação de interações relacionadas ao fluxo de envio para aprovação no PreserveHub.
- Registro das confirmações identificadas.
- Histórico contendo identificador único e data e hora do registro.
- Indicador flutuante temporário com o total contabilizado.
- Interface de histórico no popup.
- Funcionalidade para limpar o contador e o histórico simultaneamente.
- Identificação do repositório arquivístico na página do PreserveHub.
- Identificação do usuário exibido na página.
- Inclusão do repositório e do usuário nos registros do histórico.
- Exibição do usuário e do repositório atuais no popup.
- Estrutura de armazenamento de contadores e históricos organizada por usuário.
- Consulta dos registros associados ao usuário atual no popup.
- Limpeza individual do contador e do histórico do usuário atual.
- Separação dos contadores por categoria de acionamento.
- Exibição do total geral e dos totais por categoria no popup.
- Exibição do status de cada registro no histórico.
- Confirmação antes de zerar o contador e o histórico.
- Exportação do histórico do usuário atual para CSV, com status, repositório, identificador único, data/hora e nome de usuário.
- Detecção do acionamento de salvamento de metadados para avaliar operações da categoria Verificar.
- Identificação dos campos Repositório Físico e Localização Física para auxiliar na classificação da operação.
- Verificação do histórico por identificador único e status antes de registrar uma nova ocorrência.

### Alterado

- Ampliação dos dados apresentados no histórico de confirmações.
- Atualização da interface do popup para apresentar informações contextuais.
- Substituição da estrutura global de contador e histórico por uma estrutura organizada por usuário.
- Reorganização do popup para exibir os novos contadores e as informações do histórico.
- Atualização da identificação e da extração de informações da página.
- Reorganização da detecção de cliques para tratar separadamente as ações de Aprovação e Verificar.
- Atualização do identificador do elemento flutuante do contador para `janela-contador`.
- Inclusão de mensagens de diagnóstico para auxiliar na validação da identificação dos campos e das ações.
- Limitação da exibição do histórico no popup aos cinco registros mais recentes, sem alteração intencional do histórico armazenado.
- Ocultação e desativação do botão de limpeza do contador e do histórico na interface do popup.
- Implementada a transição de um registro existente de Verificar para Aprovação, com atualização do status e dos contadores correspondentes.
-Contadores do popup e do contador flutuante ajustados para considerar os registros do dia atual.
- Histórico visível no popup filtrado pela data atual, mantendo a exibição limitada aos cinco registros mais recentes.
- Exportação CSV mantida com base no histórico completo armazenado.
- Renomeação da extensão de Contador SAFE para SAFE-PreserveHub.
- Atualização da chave de armazenamento para dadosContadorPorUsuario.
- Ampliação dos endereços configurados para execução da extensão, incluindo os ambientes CEDAE e FAETEC.
- Atualização do cabeçalho do popup e do contador flutuante.
- Inclusão da logo na interface do popup.

### Em validação

- Identificação correta do registro, do usuário e do repositório no PreserveHub.
- Precisão dos seletores utilizados para identificar os campos e preservação da grafia dos valores.
- Contagem correta das categorias Aprovação e Verificar.
- Prevenção de duplicidades sem bloquear novas ocorrências legítimas.
- Persistência, leitura e consistência dos contadores e do histórico.
- Exibição do histórico em ordem decrescente de data e hora.
- Consistência da interface após zerar os dados.
- Isolamento dos dados entre usuários.
- Tratamento de dados armazenados inválidos e de falhas na identificação dos campos.
- Compatibilidade com registros armazenados pela estrutura anterior.
- Funcionamento da exportação CSV, incluindo acentos, caracteres especiais e proteção contra fórmulas em planilhas.
- Correspondência entre o status contabilizado e a mensagem apresentada no contador flutuante.
- Compatibilidade do identificador do contador flutuante com os demais arquivos da extensão.
- Funcionamento da extensão após a integração dos scripts e permissões definidos no manifesto.
- Confirmar que a transição mantém o histórico sem duplicar o registro.
- Validar o comportamento com dados armazenados inválidos e a ausência de erros no console.
- Compatibilidade do filtro diário com os formatos de data existentes.
- Comportamento da contagem diária na transição de Verificar para Aprovação.
- Consistência entre os contadores do popup e do contador flutuante.
- Funcionamento integrado nos ambientes CEDAE e FAETEC.
- Necessidade de acesso HTTP no ambiente FAETEC.
- Identificação de usuário e repositório, contabilização e exportação nos ambientes adicionados.

## Versão declarada no manifesto

A versão `1.0.0` é a versão declarada no `manifest.json` durante esta etapa. A criação deste changelog não altera o número da versão.

## Convenção de registro

- **Adicionado:** novas funcionalidades.
- **Alterado:** mudanças em funcionalidades existentes.
- **Corrigido:** correções de erros.
- **Removido:** funcionalidades retiradas.
- **Em validação:** comportamentos que ainda precisam de confirmação prática.

As entradas devem ser atualizadas conforme as alterações reais do código e os resultados dos testes.