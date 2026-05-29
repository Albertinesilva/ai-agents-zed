# Skill de Busca de Empregos

## Visão Geral

Esta skill fornece capacidades de busca de empregos usando o CLI do Firecrawl. Ela agrega listagens de emprego do Indeed, Catho, LinkedIn, Glassdoor, Infojobs e outros portais de emprego através de uma única interface de busca.

## Ferramenta

- **Ferramenta Zed**: `terminal`
- **CLI**: `firecrawl`

## Comandos

### Descoberta de Empregos

Execute uma busca para encontrar vagas correspondentes à área de interesse e localização do usuário:

```
firecrawl search "vagas [area_de_interesse] [localização]" --json
```

**Parâmetros**:

- `[area_de_interesse]` — a área alvo do usuário (ex: Frontend, Backend, Ciência de Dados)
- `[localização]` — a localização do usuário (ex: São Paulo, Remoto)

**Retorna**: Array JSON onde cada resultado contém (chaves em inglês do firecrawl):

- `url` — a URL da listagem de emprego
- `title` — o título da vaga
- `description` — uma breve descrição da vaga
- `position` — o título da posição

> **Nota**: O firecrawl retorna chaves JSON em inglês. Mapeie `title` → `titulo` e `description` → `descricao`. O campo `position` é redundante com `title` — use `title` como fonte primária do título da vaga.

### Detalhes Completos do Emprego

Faça scrape de uma URL individual de emprego para obter a descrição completa e requisitos:

```
firecrawl scrape <url> --format markdown
```

**Parâmetros**:

- `<url>` — a URL do emprego dos resultados de busca

**Retorna**: Conteúdo da página formatado em markdown incluindo descrição completa do emprego, requisitos, benefícios e detalhes de candidatura.

**Fallback**: Se `firecrawl scrape` falhar ou expirar para uma URL, use os campos `title` e `description` do resultado de busca em vez disso.

## Etapas do Fluxo de Trabalho

1. **Leia o perfil do usuário** — Carregue `data/user-profile.md` e extraia:
   - `Área de interesse`
   - `Localização`
   - `Nível de experiência`
   - `Habilidades atuais`

2. **Execute a busca** — Execute:

   ```
   firecrawl search "vagas [area_de_interesse] [localização]" --json
   ```

3. **Lide com resultados vazios** — Se a busca não retornar resultados:
   - Informe ao usuário que nenhum emprego foi encontrado
   - Sugira ampliar os termos de busca (ex: remover filtro de localização, usar área de interesse mais ampla)
   - Pare e retorne um estado de erro

4. **Processe até 5 resultados** — Para cada emprego nos resultados de busca (máximo 5):
   a. Extraia `url`, `title`, `description` do JSON
   b. Tente fazer scrape da página completa do emprego:

   ```
   firecrawl scrape <url> --format markdown
   ```

   c. Se o scrape tiver sucesso, extraia a descrição completa do emprego e habilidades necessárias do markdown
   d. Se o scrape falhar, use os campos `title` e `description` do resultado de busca como fallback
   e. Analise e extraia:
   - **titulo**: título da vaga
   - **empresa**: derive do domínio da URL, texto do título ou conteúdo raspado
   - **localizacao**: nome da cidade ou "Remoto"
   - **link**: a URL do emprego
   - **habilidades_necessarias**: lista de habilidades técnicas e interpessoais mencionadas nos requisitos

5. **Correspondência de habilidades** — Para cada emprego:
   a. Obtenha as habilidades atuais do usuário de `data/user-profile.md`
   b. Compare cada habilidade necessária com as habilidades do usuário usando correspondência de string sem distinção entre maiúsculas e minúsculas
   c. Construa duas listas:
   - `habilidades_correspondentes`: habilidades necessárias encontradas na lista de habilidades do usuário
   - `habilidades_faltantes`: habilidades necessárias não encontradas na lista de habilidades do usuário
     d. Calcule `contagem_correspondencia` como: `[X] de [Y] habilidades correspondem` onde X = contagem correspondente, Y = total de habilidades necessárias

6. **Filtragem por nível de experiência** — Se a listagem de emprego mencionar um nível de experiência (Júnior, Pleno, Sênior):
   - Compare com o `Nível de experiência` do usuário do perfil
   - Prefira e priorize empregos que correspondam ao nível do usuário
   - Ainda inclua empregos em outros níveis mas classifique-os mais abaixo

7. **Retorne os resultados** — Formate os resultados no Envelope de Resposta. **NÃO escreva em arquivos** — o Maestro salva os resultados em `data/job-search-results.md`.

8. **Exiba os resultados** — Exiba até 5 vagas de emprego com análise de correspondência de habilidades.

## Lógica de Correspondência de Habilidades

Use correspondência de string sem distinção entre maiúsculas e minúsculas:

```
habilidades_usuario = ["python", "sql", "git", "docker"]
habilidades_necessarias = ["Python", "SQL", "AWS", "Docker", "Kubernetes"]

habilidades_correspondentes = ["Python", "SQL", "Docker"]
habilidades_faltantes = ["AWS", "Kubernetes"]
contagem_correspondencia = "3 de 5 habilidades correspondem"
```

Normalize ambas as listas para minúsculas antes da comparação. Retorne os nomes de habilidades com caixa original na saída.

## Formato de Dados de Resposta

Retorne os resultados de emprego neste formato exato. Sem tabelas markdown:

```
1. titulo: [título da vaga]
   empresa: [nome da empresa]
   localizacao: [cidade ou Remoto]
   link: [URL]
   habilidades_correspondentes: [habilidade1, habilidade2]
   habilidades_faltantes: [habilidade3, habilidade4]
   contagem_correspondencia: [X de Y habilidades correspondem]

2. titulo: [próximo título de vaga]
   empresa: [próxima empresa]
   localizacao: [cidade ou Remoto]
   link: [URL]
   habilidades_correspondentes: [habilidade1]
   habilidades_faltantes: [habilidade2, habilidade3, habilidade4]
   contagem_correspondencia: [1 de 4 habilidades correspondem]
```

## Regras de Erro

- **Busca falha**: Se `firecrawl search` retornar um erro ou código de saída diferente de zero, relate a mensagem de erro exata ao usuário e pare. Não tente fazer scrape.
- **Scrape falha em URL individual**: Se `firecrawl scrape` falhar para uma URL de emprego específica, use os dados do resultado de busca como fallback e note a URL com falha no campo de erros. Continue processando empregos restantes.
- **Scrape expira**: Trate como falha. Use os dados do resultado de busca como fallback.
- **Nenhum resultado encontrado**: Retorne um erro sugerindo que o usuário amplie os termos de busca (ex: tente uma localização mais ampla, remova o filtro de localização, use uma área de interesse mais ampla).
- **Dados de perfil ausentes**: Se `data/user-profile.md` estiver ausente ou faltar campos obrigatórios (Área de interesse, Localização, Habilidades atuais), retorne um erro informando ao usuário para completar o quiz de personalidade primeiro.
