# Changelog — SAFE-PreserveHub

Este arquivo registra as mudanças relevantes do SAFE-PreserveHub ao longo do desenvolvimento.

O formato segue uma organização inspirada no Keep a Changelog. As entradas descrevem a evolução funcional do projeto; não significam, necessariamente, que cada funcionalidade tenha sido validada em todos os cenários.

## [Em desenvolvimento]

### Adicionado

- Estrutura inicial da extensão baseada no Chrome Extensions Manifest V3.
- Popup para apresentação dos contadores e do histórico.
- Identificação de interações relacionadas aos fluxos de Aprovação e Verificar no PreserveHub.
- Histórico com identificador, status, repositório arquivístico, data/hora e nome do usuário.
- Indicador flutuante temporário com os totais contabilizados.
- Organização dos dados de contagem e histórico por usuário.
- Exportação do histórico disponível para CSV.
- Proposta de exportação de relatório completo em CSV consolidando os registros de todos os usuários.
- Proposta de exportação de relatório diário em CSV a partir de uma data selecionada, reunindo registros de todos os usuários.
- Seletor de datas com dias únicos que possuem registros, ordenados da data mais recente para a mais antiga.
- Padrões de nomes de arquivo distintos para os relatórios completo e diário.
- Detecção do acionamento de salvamento de metadados para avaliar operações da categoria Verificar.
- Verificação do status `DIGITALIZADO` como condição para permitir a classificação Verificar.

### Alterado

- Centralização do armazenamento em `chrome.storage.local`, usando a chave `dadosContadorPorUsuario`.
- Simplificação dos dados retornados pela consulta à página no popup; os contadores e o histórico são consultados pelo armazenamento central.
- Validação da estrutura retornada por `chrome.storage.local`: a ausência da chave é tratada como armazenamento vazio, enquanto valores de estrutura inválida geram erro.
- Propagação de erros de leitura do armazenamento, evitando tratá-los silenciosamente como dados vazios.
- Verificação do resultado da gravação antes de atualizar o contador visual.
- Exibição de `X` nos contadores do popup quando ocorre falha ao ler o armazenamento, evitando apresentar um zero que possa ser interpretado como resultado válido.
- Reorganização da área de exportação no popup para separar o relatório completo do relatório por dia.
- Extração da criação e do download do arquivo CSV para uma função reutilizável.
- Normalização de nomes utilizados nos arquivos de relatório.
- Manutenção da versão `1.0.0` no manifesto durante esta etapa de desenvolvimento.

### Corrigido

- Prevenção da atualização do contador visual quando a função de gravação informa falha, desde que `salvarDadosStorage()` retorne corretamente o indicador de sucesso ou falha.
- Tratamento explícito de estruturas inválidas no armazenamento central.

### Em validação

- Confirmar que `salvarDadosStorage()` retorna `true` em caso de sucesso e `false` em caso de falha.
- Confirmar que a leitura e a gravação de `content.js` e `popup.js` utilizam a mesma chave e o mesmo mecanismo.
- Validar o seletor de DOM usado para encontrar o status `DIGITALIZADO` nos ambientes reais do PreserveHub.
- Confirmar a identificação correta do registro, do usuário e do repositório.
- Validar a contagem correta das categorias Aprovação e Verificar.
- Testar a prevenção de duplicidades sem bloquear novas ocorrências legítimas.
- Testar a transição de Verificar para Aprovação sem duplicar o registro e com atualização coerente dos contadores.
- Validar a persistência, leitura e consistência dos contadores e do histórico.
- Confirmar a exibição do histórico em ordem decrescente de data e hora.
- Validar o tratamento de falhas de leitura e gravação sem apresentar dados incorretos.
- Verificar a compatibilidade com dados armazenados em versões anteriores e eventual necessidade de migração de `localStorage`.
- Confirmar que o relatório completo consolida os registros de todos os usuários.
- Confirmar que o relatório diário consolida os registros de todos os usuários na data selecionada.
- Confirmar que cada linha exportada identifica corretamente o usuário de origem, inclusive quando essa informação precisa ser obtida da estrutura que contém o histórico.
- Validar o conteúdo CSV, os acentos, os caracteres especiais, o cabeçalho e a quantidade de registros exportados.
- Verificar a proteção contra fórmulas em planilhas.
- Validar que a exportação diária inclui somente registros cuja `dataHora` corresponde à data selecionada, considerando o formato `DD/MM/AAAA`.
- Validar a ordenação e a unicidade das datas no seletor, além do comportamento da data selecionada por padrão.
- Conferir os nomes efetivamente gerados para os relatórios completo e diário.
- Confirmar o comportamento do seletor e do botão de exportação quando não existem registros.
- Validar a consistência entre os contadores do popup e do contador flutuante.
- Confirmar o funcionamento integrado nos ambientes CEDAE e FAETEC.
- Avaliar a necessidade de acesso HTTP no ambiente FAETEC.
- Confirmar a ausência de erros relevantes no console durante os testes funcionais.

## Versão declarada no manifesto

A versão `1.0.0` é a versão declarada no `manifest.json` durante esta etapa. A atualização da documentação não altera o número da versão.

## Convenção de registro

- **Adicionado:** novas funcionalidades.
- **Alterado:** mudanças em funcionalidades existentes.
- **Corrigido:** correções de erros.
- **Removido:** funcionalidades retiradas.
- **Em validação:** comportamentos que ainda precisam de confirmação prática.

As entradas devem ser atualizadas conforme as alterações reais do código e os resultados dos testes.
