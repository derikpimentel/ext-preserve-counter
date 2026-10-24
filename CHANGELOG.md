# Changelog — SAFE-PreserveHub

Este arquivo registra as mudanças relevantes do SAFE-PreserveHub durante o desenvolvimento. As entradas descrevem alterações no código ou comportamentos pretendidos; não significam que todos os cenários tenham sido validados.

## [Em desenvolvimento]

### Adicionado

- Configuração de novos ambientes Preserve no `manifest.json`.
- Inclusão dos novos endereços na lista de ambientes reconhecidos pelo `popup.js`.
- Expansão da configuração para ambientes internos que podem depender de VPN ou rede corporativa.
- Documentação dos ambientes configurados e dos respectivos protocolos de acesso.

### Alterado

- Ampliação de `host_permissions` para incluir os novos endereços configurados.
- Ampliação de `content_scripts.matches` para permitir a execução do `content.js` nos endereços adicionados.
- Atualização da lista `ambientesSuportados` em `popup.js`.
- Documentação da separação entre contadores e histórico individuais e relatórios CSV que devem consolidar registros de vários usuários.
- Manutenção da versão `1.0.0` no manifesto durante esta etapa de desenvolvimento.

### Ambientes configurados

- CEDAE — `https://preserve.cedae.com.br/`
- FAETEC — `http://preserve.faetec.rj.gov.br/`
- FAETEC — `https://preserve.faetec.rj.gov.br/`
- PRODERJ — `http://preserve.proderj.rj.gov.br/`
- DETRO — `http://preserve.detro.rj.gov.br/`
- Casa Civil — `http://preserve.casacivil.rj.gov.br/`
- SEDSDH — `http://preserve.sedsdh.rj.gov.br/`
- PROCON — `http://preserve.procon.rj.gov.br/`
- AGENERSA — `http://preserve/`
- DEGASE — `http://preserve.degase.rj.gov.br.local/`
- Monaco Preserve — `http://monaco-preserve.safeconversaodigital.com.br/`
- Monaco Preserve — `https://monaco-preserve.safeconversaodigital.com.br/`

A lista registra os endereços declarados na configuração. Não representa confirmação de conectividade, compatibilidade dos seletores ou funcionamento integral da extensão em cada ambiente.

### Em validação

- Confirmar que a função de gravação retorna corretamente sucesso ou falha.
- Confirmar que `content.js` e `popup.js` usam a mesma chave e o mesmo mecanismo de armazenamento.
- Validar os seletores de DOM para status, usuário, repositório e identificador nos ambientes reais.
- Validar a contagem das categorias Aprovação e Verificar.
- Validar prevenção de duplicidades sem bloquear ocorrências legítimas.
- Validar a transição de Verificar para Aprovação sem duplicação e com atualização coerente dos contadores.
- Validar persistência, leitura e consistência do histórico e dos contadores.
- Validar ordenação do histórico por data/hora.
- Validar tratamento de falhas de leitura e gravação.
- Confirmar compatibilidade com dados de versões anteriores e eventual migração de `localStorage`.
- Confirmar que o relatório completo inclui registros de todos os usuários esperados.
- Confirmar que o relatório diário inclui somente registros de todos os usuários para a data selecionada.
- Confirmar que cada linha do CSV identifica corretamente o usuário de origem.
- Validar cabeçalhos, delimitadores, acentos, caracteres especiais e proteção contra fórmulas em planilhas.
- Validar datas disponíveis, unicidade, ordenação e seleção inicial no seletor.
- Confirmar o nome do arquivo completo como `Relatorio_Auditoria_<AAAA-MM-DD>.csv` e corrigir eventual erro de grafia.
- Confirmar o nome do arquivo diário e a data utilizada no nome de cada modalidade.
- Validar formatos de data, inclusive registros cuja `dataHora` não comece com `DD/MM/AAAA`.
- Validar a consistência entre contadores do popup e indicador flutuante.
- Confirmar que os endereços de `host_permissions`, `content_scripts.matches` e `ambientesSuportados` permanecem alinhados.
- Testar cada novo ambiente em condições reais de acesso, incluindo VPN e DNS interno quando aplicável.
- Confirmar que `http://preserve/` corresponde ao endereço esperado para a AGENERSA.
- Confirmar que `http://preserve.degase.rj.gov.br.local/` corresponde ao hostname utilizado no ambiente do DEGASE.
- Avaliar a necessidade das permissões HTTP e utilizar HTTPS quando disponível e compatível com o ambiente.
- Testar o funcionamento integrado nos ambientes CEDAE e FAETEC.
- Confirmar ausência de erros relevantes no console durante testes funcionais.

## Versão declarada no manifesto

A versão `1.0.0` permanece declarada no `manifest.json` durante esta etapa. A atualização documental não altera a versão.

## Convenção

- **Adicionado:** novas funcionalidades ou configurações.
- **Alterado:** mudanças em funcionalidades ou configurações existentes.
- **Corrigido:** correções de erros confirmadas.
- **Removido:** funcionalidades ou configurações retiradas.
- **Em validação:** comportamentos que ainda precisam de confirmação prática.

As entradas devem ser atualizadas conforme as alterações reais do código e os resultados dos testes.
