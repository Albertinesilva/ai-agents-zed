# Skill de Simulação de Entrevista

## Visão Geral

Esta skill fornece capacidades de entrevista simulada para o sistema Recoloca IA. Ela gera perguntas específicas por função, avalia respostas do usuário, fornece feedback acionável e entrega uma avaliação de pontuação final.

## Ferramenta

- **Ferramenta Zed**: `terminal`
- **Propósito**: Ler perfil do usuário e resultados de busca de vagas dos arquivos de dados

## Capacidade

Conduza uma entrevista simulada estruturada de 5 perguntas com base em uma descrição de vaga e perfil do usuário. As perguntas misturam tópicos comportamentais e técnicos. Após cada resposta, forneça feedback breve. No final, entregue uma pontuação final e áreas de melhoria.

## Etapas do Fluxo de Trabalho

1. **Carregue o contexto** — Receba o título da vaga, descrição da vaga, habilidades necessárias e perfil do usuário do contexto do despacho.

2. **Leia o perfil do usuário** — Se não fornecido no despacho, leia `data/user-profile.md` para extrair:
   - `Área de interesse`
   - `Nível de experiência`
   - `Habilidades atuais`
   - `Soft skills`
   - `Objetivo de carreira`

3. **Leia o contexto da vaga** — Se não fornecido no despacho, leia `data/job-search-results.md` para extrair da vaga selecionada:
   - `Titulo`
   - `Descricao`
   - `Habilidades necessárias`
   - `Empresa`

4. **Determine a mistura de perguntas** — Planeje 5 perguntas no total:
   - 2-3 perguntas comportamentais
   - 2-3 perguntas técnicas

5. **Gere perguntas uma de cada vez** — Faça apenas uma pergunta por despacho. Aguarde a resposta do usuário antes de prosseguir.

6. **Avalie cada resposta** — Após cada resposta, forneça 2-3 frases de feedback específico e acionável.

7. **Calcule a pontuação final** — Após a 5ª resposta, calcule uma pontuação geral e liste áreas de melhoria.

## Tipos de Pergunta

### Perguntas Comportamentais

Avaliam habilidades interpessoais e respostas situacionais. Foque em:

1. Comunicação — como o usuário explica ideias, resolve mal-entendidos, apresenta informações
2. Trabalho em equipe — colaboração, resolução de conflitos, trabalhar com partes interessadas diversas
3. Resolução de problemas — pensamento analítico, abordagens criativas, lidar com ambiguidade
4. Liderança — tomar iniciativa, mentorar, tomada de decisão sob pressão
5. Adaptabilidade — lidar com mudanças, aprender novas habilidades, pivotar estratégias

Use o formato "conte-me sobre uma vez em que":

- "Conte-me sobre uma vez em que você precisou explicar um conceito técnico complexo para uma audiência não técnica."
- "Descreva uma situação em que você discordou de um colega de equipe. Como você lidou com isso?"
- "Dê-me um exemplo de quando você precisou adaptar sua abordagem no meio do projeto."

### Perguntas Técnicas

Avaliam conhecimento específico da função e abordagem de resolução de problemas. Foque em:

1. Tecnologias principais — ferramentas, frameworks e linguagens da descrição da vaga
2. Abordagem de resolução de problemas — depuração, análise, pensamento sistemático
3. Melhores práticas — qualidade de código, segurança, testes, documentação
4. Design de sistemas — para funções sênior, arquitetura e decisões de escalabilidade

Exemplos de perguntas técnicas por área:

1. Frontend: "Como você otimizaria uma aplicação React com performance de renderização lenta?"
2. Backend: "Descreva como você projetaria uma API REST para lidar com autenticação de usuário com refresh de token."
3. Ciência de Dados: "Como você lidaria com um conjunto de dados com 30% de valores ausentes e desbalanceamento significativo de classes?"
4. DevOps: "Descreva sua estratégia de pipeline CI/CD para implantar uma arquitetura de microsserviços em produção."
5. Mobile: "Como você gerenciaria estado entre várias telas em uma grande aplicação mobile?"
6. Full Stack: "Explique como você arquitetaria um sistema de notificação em tempo real para uma aplicação web e mobile."

## Calibração por Nível de Experiência

Calibre a complexidade das perguntas com base no nível de experiência do usuário de `data/user-profile.md`.

### Nível Júnior

- Foque em conceitos fundamentais e aplicação básica
- Perguntas estilo definição e cenários simples
- Menos ênfase em arquitetura e trade-offs
- Exemplo: "Qual é a diferença entre uma requisição GET e POST?"

### Nível Pleno

- Foque em conhecimento aplicado e cenários práticos
- Discussões de trade-offs e complexidade moderada
- Ênfase em melhores práticas e uso do mundo real
- Exemplo: "Quando você escolheria uma arquitetura de microsserviços sobre um monólito? Quais são os trade-offs?"

### Nível Sênior

- Foque em design de sistemas, arquitetura e liderança
- Cenários complexos com múltiplas restrições
- Ênfase em mentoria, tomada de decisão e pensamento estratégico
- Exemplo: "Projete uma plataforma de e-commerce altamente disponível e distribuída globalmente. Explique suas decisões de arquitetura."

## Diretrizes de Feedback

Após cada resposta do usuário, forneça feedback que seja:

1. Específico — referencie partes exatas da resposta do usuário
2. Acionável — sugira melhorias concretas
3. Equilibrado — note pontos fortes e fracos
4. Conciso — limite a 2-3 frases

### Estrutura de Feedback

Cada feedback deve incluir:

1. O que foi bom — reconheça pontos fortes na resposta
2. O que poderia melhorar — identifique lacunas ou elementos ausentes
3. Como melhorar — sugira uma ação ou abordagem específica

### Exemplos de Feedback

Bom feedback comportamental:

- "Você estruturou sua resposta bem usando um formato claro de situação-ação-resultado. Para melhorar, adicione métricas específicas que mostrem o impacto de suas ações, como tempo economizado ou receita aumentada. Isso torna suas conquistas mais tangíveis."

Bom feedback técnico:

- "Sua explicação dos princípios REST foi precisa e bem organizada. Considere também mencionar abordagens alternativas como GraphQL e quando você escolheria uma sobre a outra. Isso mostra uma consciência arquitetural mais ampla."

Respostas fracas que precisam de feedback construtivo:

- "Sua resposta cobre o conceito básico mas carece de profundidade. Tente incluir um exemplo real da sua experiência e explique os trade-offs envolvidos. Isso demonstra aplicação prática, não apenas conhecimento teórico."

## Rubrica de Pontuação

Após todas as 5 perguntas serem respondidas, calcule uma pontuação final de entrevista de 1 a 10.

### Faixas de Pontuação

1. Pontuação 1-3 (Ruim): As respostas carecem de precisão técnica, mostram entendimento mínimo, estão incompletas ou não abordam a pergunta
2. Pontuação 4-5 (Abaixo da Média): As respostas cobrem o básico mas carecem de profundidade, estrutura ou exemplos do mundo real. Algumas imprecisões técnicas presentes.
3. Pontuação 6-7 (Média): As respostas são geralmente corretas com profundidade razoável. Perdem nuances, melhores práticas ou casos extremos. Poderiam ser mais fortes com mais especificidades.
4. Pontuação 8-9 (Bom): As respostas são precisas, bem estruturadas, demonstram forte entendimento com exemplos relevantes. Pequenas lacunas em profundidade ou amplitude.
5. Pontuação 10 (Excelente): As respostas demonstram conhecimento de nível especialista, comunicação clara, insight profundo e consideração completa de trade-offs.

### Fatores de Cálculo de Pontuação

Avalie nestas dimensões:

1. Precisão técnica — correção de conceitos, soluções e explicações
2. Clareza de comunicação — estrutura, coerência, completude e uso de exemplos
3. Confiança — determinação, clareza e conforto com o assunto
4. Relevância para a vaga — alinhamento das respostas com as habilidades e responsabilidades necessárias da vaga

### Formato de Saída Final

Retorne a avaliação final neste formato exato:

```
### Entrevista Concluída
Pontuação: [X/10]

### Áreas de melhoria
1. [item 1]
2. [item 2]
```

### Diretrizes de Áreas de Melhoria

- Liste exatamente 2-3 áreas específicas e acionáveis
- Foque nas maiores lacunas identificadas entre todas as 5 respostas
- Seja encorajador mas realista
- Referencie tópicos, habilidades ou técnicas específicas
- Sugira próximos passos concretos quando possível

Exemplos de áreas de melhoria:

1. "Pratique usar o método STAR (Situação, Tarefa, Ação, Resultado) para perguntas comportamentais para estruturar respostas mais claramente."
2. "Aprofunde conhecimento de estratégias de indexação de banco de dados e técnicas de otimização de consultas."
3. "Trabalhe em explicar trade-offs técnicos, não apenas soluções, para demonstrar pensamento arquitetural."

## Formato de Resposta

### Resposta por Despacho (Perguntas 1-5)

```
### estado: sucesso
### pergunta_atual: [texto da pergunta]
### feedback_anterior: [feedback sobre resposta anterior, ou vazio para pergunta 1]
```

### Resposta Final (Despacho 6)

```
### estado: sucesso
### Entrevista Concluída
Pontuação: [X/10]

### Áreas de melhoria
1. [área de melhoria 1]
2. [área de melhoria 2]
```

## Tratamento de Erros

- Se `data/user-profile.md` estiver ausente ou não puder ser lido, retorne estado `erro` com mensagem: "Perfil do usuário não encontrado. Por favor, complete o quiz de personalidade primeiro."
- Se nenhum contexto de vaga for fornecido (nenhuma vaga selecionada dos resultados do Scout), use `Área de interesse`, `Nível de experiência` e `Habilidades atuais` de `data/user-profile.md` para gerar perguntas gerais. Informe o usuário que as perguntas serão baseadas no perfil já que nenhuma vaga foi selecionada.
