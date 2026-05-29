# Plano Aula 2 — Agente Scout (Buscador de Vagas)

## Visão Geral

Segunda fase do projeto Maestro: implementação do agente **Scout**, responsável por buscar vagas de emprego em sites como InfoJobs, Vagas.com e Indeed, utilizando a ferramenta firecrawl (CLI) ou, em caso de falha, a ferramenta de acesso web nativa.

**Objetivo**: Criar o Scout — agente especializado em busca de vagas, integrá-lo ao Maestro via protocolo de despacho e disponibilizar a opção A (Buscar vagas) no menu.

## Diretrizes para Modelos MoE

Reutilize as diretrizes do plano original (`plano.md`), adicionando:
- O Scout deve priorizar o uso da ferramenta firecrawl (executável via linha de comando) para raspagem de dados dos sites de vagas.
- Se o firecrawl falhar (ex: erro de execução, site bloqueado), o Scout deve usar a ferramenta de acesso web nativa (`fetch`) para buscar as vagas.
- Todas as buscas devem ser realizadas nos sites: InfoJobs (https://www.infojobs.com.br), Vagas.com (https://www.vagas.com.br), Indeed (https://www.indeed.com.br).
- Resultados de vagas devem ser retornados como listas numeradas com pares chave-valor, sem tabelas markdown.
- Se uma ferramenta falhar, o agente deve relatar a falha no campo `erros` e não continuar silenciosamente.

## Arquitetura

Atualize a arquitetura para incluir o Scout como agente funcional:

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
│ [NOVO]  │  │ [FUTURO] │  │ [FUTURO]     │
└─────────┘  └──────────┘  └──────────────┘
```

## Estrutura de Diretórios

Adicione os novos arquivos à estrutura existente:

```
recoloca-ia/
├── AGENTS.md                   # Instruções de inicialização para o agente
├── plano.md                    # Plano original (Aula 1)
├── plano-aula-2.md             # Este plano (Aula 2)
├── personas/
│   ├── maestro.md              # Orquestrador principal
│   └── scout.md                # [NOVO] Persona do Scout
├── skills/
│   ├── dispatch.md             # Despacho de agentes e protocolo de handoff
│   └── scout-job-search.md     # [NOVO] Procedimento de busca de vagas
└── data/
    ├── personality-quiz.md       # Quiz de personalidade do usuário
    ├── user-profile.md           # Perfil consolidado derivado do quiz
    └── job-search-results.md     # [NOVO] Resultados de busca de vagas
```

## Tasks

### 1. Criar `personas/scout.md`

Persona do Scout com:
- **Responsabilidade**: Buscar vagas de emprego em sites específicos, utilizando firecrawl ou ferramenta web nativa.
- **Skills**:
  - `skills/scout-job-search.md` — Procedimento detalhado de busca de vagas (DEVE ser carregado como parte do playbook).
- **Ferramentas**:
  - `terminal` — executar firecrawl CLI
  - `fetch` — acesso web nativo (fallback)
  - `spawn_agent` — não utilizado (apenas o Maestro despacha)
- **Arquivos de Estado**:
  - `data/user-profile.md` — para obter preferências de vagas
  - `data/job-search-results.md` — salvar resultados
- **Fluxo de Execução**:
  1. Receber perfil do usuário via despacho do Maestro
  2. Extrair critérios de busca (área, nível, localização, preferências de trabalho)
  3. Tentar busca via firecrawl nos sites: InfoJobs, Vagas.com, Indeed
  4. Se firecrawl falhar, usar `fetch` para buscar os sites
  5. Filtrar vagas conforme critérios do perfil
  6. Salvar resultados em `data/job-search-results.md`
  7. Retornar resposta via envelope de resposta

### 2. Criar `skills/scout-job-search.md`

Procedimento detalhado de busca de vagas (dentro de `skills/`):
- **Passo 1**: Validar perfil do usuário (obter `data/user-profile.md`)
- **Passo 2**: Construir query de busca com base na área, nível e localização (ex: "Desenvolvedor Python Pleno São Paulo")
- **Passo 3**: Executar firecrawl para cada site:
  - Comando firecrawl: `firecrawl search --query "query" --site "site_url"` (exemplo real: `firecrawl search --query "python pleno" --site "https://www.infojobs.com.br"`)
  - Verificar saída do comando; se erro (código diferente de 0), registrar em `erros` e prosseguir para fallback
- **Passo 4**: Fallback para `fetch` se firecrawl falhar:
  - Usar `fetch` para acessar a URL de busca do site (ex: `https://www.infojobs.com.br/vagas-de-emprego?q=python&l=sao-paulo`)
  - Extrair dados das vagas do HTML retornado (título, empresa, localização, link)
- **Passo 5**: Normalizar resultados (título, empresa, localização, link, descrição curta)
- **Passo 6**: Salvar em `data/job-search-results.md` no formato:
  ```
  Vagas Encontradas:
  1. Título: [valor]
     Empresa: [valor]
     Localização: [valor]
     Link: [valor]
     Descrição: [valor]
  ...
  ```
- **Passo 7**: Retornar envelope de resposta seguindo o formato de `skills/dispatch.md`

### 3. Atualizar `skills/dispatch.md`

Adicionar o Scout à tabela de roteamento:
- Opção A no menu → Despachar Scout
- Atualizar especificações de handoff para o Scout (referenciar `personas/scout.md` e `skills/scout-job-search.md`)

### 4. Atualizar `personas/maestro.md`

Modificar o menu para que a opção A agora despache o Scout:
- Quando o usuário selecionar A, o Maestro constrói o envelope de despacho para o Scout com o perfil do usuário e contexto de busca de vagas.

### 5. Criar template `data/job-search-results.md`

Template para armazenar resultados de busca de vagas.

## Esquemas dos Arquivos de Dados

### data/job-search-results.md

```
Vagas Encontradas:
1. Título: [valor]
   Empresa: [valor]
   Localização: [valor]
   Link: [valor]
   Descrição: [valor]
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
        ├─ Usuário seleciona B/C → ainda não implementado (fases futuras)
        ├─ Usuário seleciona D → refazer quiz
```

## Notas Técnicas

- **Ferramenta firecrawl**: Assume-se que o firecrawl está instalado e disponível no PATH do sistema. O comando CLI deve ser testado previamente.
- **Fallback**: Se o firecrawl não estiver disponível ou falhar, o Scout usa a ferramenta `fetch` nativa para acessar os sites de vagas.
- **Sites de busca**: InfoJobs, Vagas.com, Indeed — priorizar URLs de busca específicas para cada site.
- **Formatação**: Resultados devem seguir as regras MoE (listas numeradas, sem tabelas).

## Testes

- Scout é despachado corretamente via Maestro quando o usuário seleciona A
- Scout tenta usar firecrawl primeiro; se falhar, usa `fetch`
- Resultados de vagas são salvos em `data/job-search-results.md`
- Maestro exibe os resultados do Scout ao usuário
- Opção A no menu funciona conforme esperado

## Entregável

Scout agent funcional, integrado ao Maestro, capaz de buscar vagas em InfoJobs, Vagas.com e Indeed usando firecrawl ou ferramenta web nativa. Opção A (Buscar vagas) disponível no menu.
