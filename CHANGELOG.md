# Changelog

Este arquivo registra as mudanças relevantes do Contador SAFE ao longo do desenvolvimento.

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

### Alterado

- Ampliação dos dados apresentados no histórico de confirmações.
- Atualização da interface do popup para apresentar informações contextuais.
- Substituição da estrutura global de contador e histórico por uma estrutura organizada por usuário.

### Em validação

- Identificação correta do registro associado à confirmação.
- Contagem sem duplicidade em interações repetidas.
- Persistência e leitura consistente do contador e do histórico.
- Exibição do histórico em ordem decrescente de data e hora.
- Funcionamento do popup e da limpeza dos dados.
- Integração entre os scripts de conteúdo, popup e processo em segundo plano, caso este último faça parte da arquitetura final.
- Precisão dos seletores utilizados para identificar usuário e repositório.
- Preservação da grafia do nome do repositório.
- Comportamento da contagem quando uma das informações não é encontrada.
- Consistência da interface após zerar o contador e o histórico.
- Consistência da chave de armazenamento entre os scripts.
- Correspondência entre o contador salvo e o contador apresentado no popup.
- Isolamento dos dados entre usuários.
- Tratamento de dados armazenados inválidos.
- Tratamento ou migração dos registros criados pela versão anterior.

## Versão declarada no manifesto

A versão `1.0.0` é a versão declarada no `manifest.json` durante esta etapa. A criação deste changelog não altera o número da versão.

## Convenção de registro

- **Adicionado:** novas funcionalidades.
- **Alterado:** mudanças em funcionalidades existentes.
- **Corrigido:** correções de erros.
- **Removido:** funcionalidades retiradas.
- **Em validação:** comportamentos que ainda precisam de confirmação prática.

As entradas devem ser atualizadas conforme as alterações reais do código e os resultados dos testes.