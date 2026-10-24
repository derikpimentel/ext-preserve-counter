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
- Exportação de relatório diário em CSV a partir de uma data selecionada no popup.
- Seletor de datas com dias únicos que possuem registros, ordenados da data mais recente para a mais antiga.
- Geração de nomes de arquivo distintos para os relatórios completo e diário.
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
- Normalização do nome do usuário e padronização da data usada nos nomes dos arquivos.
- Manutenção da versão `1.0.0` no manifesto durante esta etapa de desenvolvimento.

### Corrigido

- Prevenção da atualização do contador visual quando a função de gravação informa falha, desde que `salvarDadosStorage()` retorne corretamente o indicador de sucesso ou falha.
- Tratamento explícito de estruturas inválidas no armazenamento central.

### Em validação

- Confirmar que `salvarDadosStorage()` retorna `true` em caso de sucesso e `false` em caso de falha.
- Confirmar que a leitura e a gravação de `content.js` e `popup.js` utilizam a mesma chave e o mesmo mecanismo.
- Validar o seletor de DOM usado para encontrar o status `DIGITALIZADO` nos ambientes reais do PreserveHub.
- Identificação correta do registro, do usuário e do repositório.
- Contagem correta das categorias Aprovação e Verificar.
- Prevenção de duplicidades sem bloquear novas ocorrências legítimas.
- Transição de Verificar para Aprovação sem duplicar o registro e com atualização coerente dos contadores.
- Persistência, leitura e consistência dos contadores e do histórico.
- Exibição do histórico em ordem decrescente de data e hora.
- Tratamento de falhas de leitura e gravação sem apresentar dados incorretos.
- Compatibilidade com dados armazenados em versões anteriores e eventual necessidade de migração de `localStorage`.
- Funcionamento da exportação CSV completa e diária, incluindo acentos, caracteres especiais, cabeçalho, quantidade de registros e proteção contra fórmulas em planilhas.
- Validação de que a exportação diária inclui somente registros cuja `dataHora` começa com a data selecionada no formato `DD/MM/AAAA`.
- Validação da ordenação e unicidade das datas no seletor, além do comportamento da data selecionada por padrão.
- Validação dos nomes de arquivo gerados para os dois tipos de relatório.
- Compatibilidade do filtro diário com os formatos de data existentes.
- Consistência entre os contadores do popup e do contador flutuante.
- Funcionamento integrado nos ambientes CEDAE e FAETEC.
- Necessidade de acesso HTTP no ambiente FAETEC.
- Ausência de erros relevantes no console durante os testes funcionais.

## Versão declarada no manifesto

A versão `1.0.0` é a versão declarada no `manifest.json` durante esta etapa. A atualização da documentação não altera o número da versão.

## Convenção de registro

- **Adicionado:** novas funcionalidades.
- **Alterado:** mudanças em funcionalidades existentes.
- **Corrigido:** correções de erros.
- **Removido:** funcionalidades retiradas.
- **Em validação:** comportamentos que ainda precisam de confirmação prática.

As entradas devem ser atualizadas conforme as alterações reais do código e os resultados dos testes.
