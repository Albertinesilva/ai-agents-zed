# Protocolo de Despacho e Handoff de Agentes

## Tabela de Roteamento

1. Opção: A
   Agente: Scout
   Responsabilidade: Busca de vagas (InfoJobs, Vagas.com, Indeed)

2. Opção: B
   Agente: Curator
   Responsabilidade: Busca de cursos para preencher lacunas de habilidades (Alura)

3. Opção: C
   Agente: Coach
   Responsabilidade: Simulação de entrevistas

4. Opção: D
   Agente: Maestro
   Responsabilidade: Lida com o quiz (refazer quiz)

## Envelope de Despacho

O Maestro constrói este prompt para `spawn_agent`:

```
## DESPACHO: [NOME_DO_AGENTE]
### referencia_persona
[Conteúdo completo de personas/<nome_do_agente_minusculo>.md]

### tarefa
[Uma frase descrevendo o que o agente deve fazer]

### perfil_usuario
[Conteúdo de data/user-profile.md]

### contexto
[Contexto específico: ex: qual vaga para entrevistar, quais habilidades buscar cursos]

### saida_esperada
[Exatamente em que formato o agente deve retornar]
```

## Envelope de Resposta

O agente despachado retorna isto:

```
## RESPOSTA: [NOME_DO_AGENTE]
### estado
[sucesso | erro]

### resumo
[Resumo legível de 2-3 frases para o usuário]

### dados
[Resultados como listas numeradas com pares chave-valor. Sem tabelas markdown.]

### erros
[Apenas se estado for erro: o que deu errado]
```

## Especificações de Handoff por Agente

### Scout (Opção A - Buscar Vagas)
- **Tarefa**: Buscar vagas de emprego nos sites InfoJobs, Vagas.com e Indeed
- **Contexto**: Usar Área de interesse, Nível de experiência, Localização e Preferências de trabalho do perfil
- **Saída esperada**: Lista de vagas encontradas com título, empresa, localização, link e descrição
- **Ferramentas**: Priorizar firecrawl CLI; se falhar, usar fetch como fallback
- **Sites**: InfoJobs (https://www.infojobs.com.br), Vagas.com (https://www.vagas.com.br), Indeed (https://www.indeed.com.br)
- **Skill**: `skills/scout-job-search.md` deve ser carregado pelo Scout

### Curator (Opção B - Encontrar Cursos)
- **Tarefa**: Encontrar cursos para preencher lacunas de habilidades
- **Contexto**: Comparar Habilidades atuais com Funções alvo e identificar lacunas
- **Saída esperada**: Lista de cursos recomendados com título, plataforma, duração e link

### Coach (Opção C - Entrevista Simulada)
- **Tarefa**: Praticar com uma entrevista simulada
- **Contexto**: Usar Área de interesse e Nível de experiência para simular perguntas relevantes
- **Saída esperada**: Perguntas da entrevista, feedback e dicas de melhoria
- **Despacho sequencial**: O Coach é despachado 6 vezes para uma entrevista completa:
  1. Apresentação e quebra-gelo
  2. Perguntas técnicas da área
  3. Perguntas comportamentais
  4. Perguntas sobre experiências anteriores
  5. Perguntas do candidato para a empresa
  6. Feedback final e encerramento

## Regras de Tratamento de Erros

1. Se uma ferramenta falhar, o agente deve relatar a falha no campo `erros` e não continuar silenciosamente
2. Se o arquivo `data/user-profile.md` não existir ou estiver incompleto, o agente deve retornar erro solicitando que o usuário complete o quiz primeiro
3. Se uma busca web falhar, reporte o erro exato e pare
4. Em caso de erro, o Maestro deve informar ao usuário o que aconteceu e sugerir próximos passos
