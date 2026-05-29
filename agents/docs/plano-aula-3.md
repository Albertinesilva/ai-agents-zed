# Plano Aula 3 — Agente Curator (Buscador de Cursos)

## Visão Geral

Terceira fase do projeto Maestro: implementação do agente **Curator**, responsável por buscar cursos na Alura (alura.com.br) que complementem as habilidades faltantes do usuário em relação às vagas encontradas, utilizando a ferramenta firecrawl (CLI) ou, em caso de falha, a ferramenta de acesso web nativa (`fetch`).

**Objetivo**: Criar o Curator — agente especializado em busca de cursos, integrá-lo ao Maestro via protocolo de despacho e disponibilizar a opção B (Encontrar cursos) no menu.

## Diretrizes para Modelos MoE

Reutilize as diretrizes dos planos anteriores (`plano.md`, `plano-aula-2.md`), adicionando:
- O Curator deve priorizar o uso da ferramenta firecrawl (executável via linha de comando) para raspagem de dados do site da Alura.
- Se o firecrawl falhar (ex: erro de execução, site bloqueado), o Curator deve usar a ferramenta de acesso web nativa (`fetch`) para buscar cursos.
- A busca deve ser realizada no site: Alura (https://www.alura.com.br).
- O Curator deve identificar lacunas de habilidades comparando as habilidades atuais do usuário com as habilidades exigidas nas vagas encontradas pelo Scout.
- Resultados de cursos devem ser retornados como listas numeradas com pares chave-valor, sem tabelas markdown.
- Se uma ferramenta falhar, o agente deve relatar a falha no campo `erros` e não continuar silenciosamente.

## Arquitetura

Atualize a arquitetura para incluir o Curator como agente funcional:

```
┌─────────────────────────────────────────────────┐
│                  Usuário                          │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│              MAESTRO (Orquestrador)              │
│  - Interface principal com o usuário             │
│  - Coordena os agentes especializados            │
│  - Consolida resultados e apresenta ao usuário   │
└──┬──────────────┬──────────────┬────────────────┘
   │              │              │
   ▼              ▼              ▼
┌─────────┐  ┌──────────┐  ┌──────────────┐
│ SCOUT   │  │ CURATOR  │  │ COACH        │
│ (Busca  │  │ (Busca   │  │ (Simulação   │
│  de     │  │  de      │  │  de          │
│  Vagas) │  │  Cursos) │  │  Entrevistas)│
│ [OK]    │  │ [NOVO]   │  │ [FUTURO]     │
└─────────┘  └──────────┘  └──────────────┘
```

## Estrutura de Diretórios

Adicione os novos arquivos à estrutura existente:

```
recoloca-ia/
├── AGENTS.md                   # Instruções de inicialização para o agente
├── plano.md                    # Plano original (Aula 1)
├── plano-aula-2.md             # Plano Aula 2 (Scout)
├── plano-aula-3.md             # Este plano (Aula 3 - Curator)
├── personas/
│   ├── maestro.md              # Orquestrador principal
│   ├── scout.md                # Agente Scout (Buscador de Vagas)
│   └── curator.md              # [NOVO] Persona do Curator
├── skills/
│   ├── dispatch.md             # Despacho de agentes e protocolo de handoff
│   ├── scout-job-search.md     # Procedimento de busca de vagas
│   └── curator-course-search.md # [NOVO] Procedimento de busca de cursos
└── data/
    ├── personality-quiz.md       # Quiz de personalidade do usuário
    ├── user-profile.md           # Perfil consolidado derivado do quiz
    ├── job-search-results.md     # Resultados de busca de vagas (Scout)
    └── course-search-results.md  # [NOVO] Resultados de busca de cursos
```

## Tasks

### 1. Criar `personas/curator.md`

Persona do Curator com:
- **Responsabilidade**: Buscar cursos na Alura que complementem as habilidades faltantes do usuário em relação às vagas encontradas, utilizando firecrawl ou ferramenta web nativa.
- **Skills**:
  - `skills/curator-course-search.md` — Procedimento detalhado de busca de cursos (DEVE ser carregado como parte do playbook).
- **Ferramentas**:
  - `terminal` — executar firecrawl CLI
  - `fetch` — acesso web nativo (fallback)
  - `read_file` — ler `data/user-profile.md` e `data/job-search-results.md`
  - `write_file` — salvar resultados em `data/course-search-results.md`
- **Arquivos de Estado**:
  - `data/user-profile.md` — para obter habilidades atuais e funções alvo
  - `data/job-search-results.md` — para analisar habilidades exigidas nas vagas
  - `data/course-search-results.md` — salvar resultados
- **Fluxo de Execução**:
  1. Receber perfil do usuário e contexto via despacho do Maestro
  2. Ler `data/user-profile.md` para obter habilidades atuais
  3. Ler `data/job-search-results.md` para identificar habilidades exigidas nas vagas
  4. Identificar lacunas de habilidades (habilidades exigidas que o usuário não possui)
  5. Para cada lacuna, buscar cursos na Alura usando firecrawl
  6. Se firecrawl falhar, usar `fetch` para buscar no site da Alura
  7. Filtrar cursos relevantes para as lacunas identificadas
  8. Salvar resultados em `data/course-search-results.md`
  9. Retornar resposta via envelope de resposta

### 2. Criar `skills/curator-course-search.md`

Procedimento detalhado de busca de cursos (dentro de `skills/`):
- **Passo 1**: Validar perfil do usuário (obter `data/user-profile.md`)
- **Passo 2**: Analisar vagas encontradas (obter `data/job-search-results.md`)
- **Passo 3**: Identificar lacunas de habilidades:
  - Extrair habilidades das descrições das vagas
  - Comparar com habilidades atuais do usuário
  - Listar habilidades faltantes
- **Passo 4**: Para cada habilidade faltante, executar busca na Alura:
  - Comando firecrawl: `firecrawl search --query "curso [habilidade]" --site "https://www.alura.com.br"`
  - Verificar saída do comando; se erro, registrar em `erros` e prosseguir para fallback
- **Passo 5**: Fallback para `fetch` se firecrawl falhar:
  - Usar `fetch` para acessar a URL de busca da Alura (ex: `https://www.alura.com.br/busca?query=python`)
  - Extrair dados dos cursos do HTML retornado (título, carga horária, instrutor, link)
- **Passo 6**: Normalizar resultados (título, plataforma, carga horária, instrutor, link, descrição curta)
- **Passo 7**: Salvar em `data/course-search-results.md` no formato:
  ```
  Cursos Encontrados:
  1. Título: [valor]
     Plataforma: Alura
     Carga Horária: [valor]
     Instrutor: [valor]
     Link: [valor]
     Descrição: [valor]
     Habilidade Relacionada: [valor]
  ...
  ```
- **Passo 8**: Retornar envelope de resposta seguindo o formato de `skills/dispatch.md`

### 3. Atualizar `skills/dispatch.md`

Atualizar especificações de handoff para o Curator (já existe referência na tabela de roteamento, mas precisa de detalhamento):
- Referenciar `personas/curator.md` e `skills/curator-course-search.md`
- Especificar que o contexto deve incluir as lacunas de habilidades identificadas

### 4. Atualizar `personas/maestro.md`

Modificar o menu para que a opção B agora despache o Curator:
- Quando o usuário selecionar B, o Maestro constrói o envelope de despacho para o Curator com o perfil do usuário e contexto de busca de cursos (incluindo lacunas de habilidades).

### 5. Criar template `data/course-search-results.md`

Template para armazenar resultados de busca de cursos.

## Esquemas dos Arquivos de Dados

### data/course-search-results.md

```
Cursos Encontrados:
1. Título: [valor]
   Plataforma: Alura
   Carga Horária: [valor]
   Instrutor: [valor]
   Link: [valor]
   Descrição: [valor]
   Habilidade Relacionada: [valor]
2. Título: [valor]
   ...
Erros: [apenas se houver erros de busca]
```

## Fluxo Atualizado

```
1. Usuário abre o agente
        │
        ▼
2. Maestro saúda e verifica o quiz
        │
        ├─ Quiz ausente/incompleto → guiar pelo quiz → salvar user-profile.md
        ├─ Quiz existente completo → carregar user-profile.md
        ▼
3. Maestro apresenta menu: A (vagas), B (cursos), C (entrevista), D (refazer quiz)
        │
        ├─ Usuário seleciona A → Maestro despacha Scout via spawn_agent
        │       │
        │       ▼
        │   Scout executa busca (firecrawl ou fetch)
        │       │
        │       ▼
        │   Scout retorna resultados → Maestro exibe ao usuário
        │
        ├─ Usuário seleciona B → Maestro despacha Curator via spawn_agent
        │       │
        │       ▼
        │   Curator identifica lacunas de habilidades
        │       │
        │       ▼
        │   Curator busca cursos na Alura (firecrawl ou fetch)
        │       │
        │       ▼
        │   Curator retorna resultados → Maestro exibe ao usuário
        │
        ├─ Usuário seleciona C → ainda não implementado (fase futura)
        ├─ Usuário seleciona D → refazer quiz
```

## Notas Técnicas

- **Ferramenta firecrawl**: Assume-se que o firecrawl está instalado e disponível no PATH do sistema. O comando CLI deve ser testado previamente.
- **Fallback**: Se o firecrawl não estiver disponível ou falhar, o Curator usa a ferramenta `fetch` nativa para acessar o site da Alura.
- **Site de busca**: Alura (https://www.alura.com.br) — priorizar URLs de busca específicas (ex: `https://www.alura.com.br/busca?query=[habilidade]`).
- **Identificação de lacunas**: O Curator deve analisar as descrições das vagas em `data/job-search-results.md` para extrair habilidades exigidas e comparar com as habilidades atuais do usuário em `data/user-profile.md`.
- **Formatação**: Resultados devem seguir as regras MoE (listas numeradas, sem tabelas).

## Testes

- Curator é despachado corretamente via Maestro quando o usuário seleciona B
- Curator identifica corretamente as lacunas de habilidades comparando perfil e vagas
- Curator tenta usar firecrawl primeiro; se falhar, usa `fetch`
- Resultados de cursos são salvos em `data/course-search-results.md`
- Maestro exibe os resultados do Curator ao usuário
- Opção B no menu funciona conforme esperado

## Entregável

Curator agent funcional, integrado ao Maestro, capaz de identificar lacunas de habilidades e buscar cursos na Alura usando firecrawl ou ferramenta web nativa. Opção B (Encontrar cursos) disponível no menu.
