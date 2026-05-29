# Skill de Análise de Cursos

## Visão Geral

Esta skill fornece capacidades de análise e recomendação de cursos usando o CLI do Firecrawl. Ela busca na Alura (alura.com.br/formacoes) cursos que abordem lacunas de habilidades identificadas pelo agente Scout, extrai metadados de curso e retorna uma lista curada e ordenada de recomendações.

## Ferramenta

- **Ferramenta Zed**: `terminal`
- **CLI**: `firecrawl`

## Comandos

### Busca de Cursos

Busque na Alura cursos correspondentes a uma habilidade específica:

```
firecrawl search "alura [habilidade]" --json
```

**Parâmetros**:

- `[habilidade]` — o nome da habilidade para buscar (ex: "React", "Python", "Docker", "SQL")

**Retorna**: Array JSON onde cada resultado contém (chaves em inglês do firecrawl):

- `url` — a URL da página do curso em alura.com.br/formacoes
- `title` — o título do curso
- `description` — uma breve descrição ou trecho do curso

> **Nota**: O firecrawl retorna chaves JSON em inglês. Mapeie para os campos internos: `title` → `nome_curso`, `description` → `descricao`.

### Detalhes Completos do Curso

Faça scrape de uma URL individual de curso para extrair metadados detalhados (duração, nível, descrição completa):

```
firecrawl scrape <url> --format markdown
```

**Parâmetros**:

- `<url>` — a URL do curso dos resultados de busca

**Retorna**: Conteúdo da página formatado em markdown incluindo título do curso, duração, nível, descrição, pré-requisitos e lista de módulos.

**Fallback**: Se `firecrawl scrape` falhar ou expirar para uma URL, use os campos `title` e `description` do resultado de busca e marque campos desconhecidos (duração, nível) como `não especificado`.

## Etapas do Fluxo de Trabalho

1. **Valide pré-requisitos** — Verifique se `data/job-search-results.md` existe. Se não existir, relate um erro e pare.

2. **Extraia habilidades faltantes** — Leia `data/job-search-results.md` e colete todos os valores únicos de cada campo `habilidades_faltantes` em todos os resultados de vagas. Desduplica a lista.

3. **Lide com lacunas de habilidades vazias** — Se não houver habilidades faltantes (lista vazia), relate um erro: nenhuma lacuna de habilidade encontrada, então nenhum curso é necessário. Pare.

4. **Leia a área de interesse do usuário** — Carregue `data/user-profile.md` e extraia o campo `Área de interesse`.

5. **Execute busca para cada habilidade** — Para cada habilidade faltante (processe até 5 habilidades únicas), execute:

   ```
   firecrawl search "alura [habilidade]" --json
   ```

6. **Lide com falhas de busca** — Se `firecrawl search` falhar para uma habilidade (código de saída diferente de zero, timeout ou saída de erro):
   - Tente o fallback: `firecrawl search "site:alura.com.br [habilidade]" --json`
   - Se o fallback também falhar, pule essa habilidade
   - Note a habilidade ignorada no campo `erros`
   - Continue processando as habilidades restantes. Não pare o processamento inteiro por uma única falha.

7. **Lide com resultados de busca vazios** — Se uma busca retornar zero resultados para uma habilidade específica:
   - Pule essa habilidade
   - Note a habilidade ignorada no campo `erros`
   - Continue processando as habilidades restantes

8. **Selecione os melhores cursos** — De todos os resultados de busca em todas as habilidades:
   - Selecione até 5 cursos no total
   - Priorize cursos com o nome da habilidade aparecendo no título ou descrição
   - Garanta cobertura das habilidades faltantes mais críticas primeiro

9. **Enriqueça detalhes do curso** — Para cada curso selecionado:
   a. Extraia `url`, `title`, `description` do resultado de busca JSON
   b. Tente fazer scrape da página completa do curso:

   ```
   firecrawl scrape <url> --format markdown
   ```

   c. Se o scrape tiver sucesso, extraia:
   - **nome_curso**: do título do curso na página
   - **duracao**: a duração total do curso (ex: "20 horas", "12h30")
   - **nivel**: das tags ou texto da página — classifique como `iniciante`, `intermediario` ou `avancado`
   - **link**: a URL do curso
     d. Se o scrape falhar ou expirar:
   - Use o `title` do resultado de busca como `nome_curso`
   - Marque `duracao` e `nivel` como `não especificado`
   - Use a `url` do resultado de busca como `link`
   - Note a URL com falha no campo `erros`
     e. Registre qual habilidade faltante o curso aborda como `aborda_habilidade`

10. **Regras de classificação de nível** — Classifique o nível do curso usando estas heurísticas:
    - `iniciante`: título contém "Introdução", "Primeiros Passos", "Fundamentos", "Básico" ou "Para Iniciantes"
    - `intermediario`: título contém "Intermediário" ou implica conhecimento prévio
    - `avancado`: título contém "Avançado", "Profundo", "Expert", "Arquitetura" ou "Especialista"
    - Se o nível não puder ser determinado, marque como `não especificado`

11. **Ordene os cursos** — Ordene os resultados por nível:
    - Primeiro: todos os cursos `iniciante` (na ordem de descoberta)
    - Segundo: todos os cursos `intermediario` (na ordem de descoberta)
    - Terceiro: todos os cursos `avancado` (na ordem de descoberta)
    - Cursos marcados como `não especificado` vão por último

12. **Retorne os resultados** — Formate os resultados no Envelope de Resposta. **NÃO escreva em arquivos** — o Maestro salva os resultados em `data/course-recommendations.md`.

13. **Gere ordem sugerida** — Liste os nomes dos cursos na ordem ordenada como uma lista numerada sob o cabeçalho "Ordem sugerida".

## Formato de Dados de Resposta

Retorne os resultados de curso neste formato exato. Sem tabelas markdown:

```
1. nome_curso: [título do curso]
   duracao: [ex: 20 horas]
   nivel: [iniciante | intermediario | avancado]
   aborda_habilidade: [nome da habilidade]
   link: [URL]

2. nome_curso: [próximo título do curso]
   duracao: [ex: 12h30]
   nivel: [iniciante | intermediario | avancado]
   aborda_habilidade: [nome da habilidade]
   link: [URL]

Ordem sugerida:
1. [nome do curso]
2. [nome do curso]
3. [nome do curso]
```

## Tratamento de Erros

- **Busca falha para uma habilidade**: Se `firecrawl search` retornar um erro ou código de saída diferente de zero, tente o fallback `site:alura.com.br`. Se o fallback também falhar, pule essa habilidade, note-a no campo `erros` e continue com as habilidades restantes. Não pare o processamento inteiro por uma única falha.
- **Scrape falha em URL individual**: Se `firecrawl scrape` falhar para uma URL de curso específica, use dados do resultado de busca como fallback com `não especificado` para campos faltantes. Note a URL com falha no campo de erros. Continue processando outros cursos.
- **Scrape expira**: Trate como falha. Use dados do resultado de busca como fallback.
- **Nenhum resultado para uma habilidade**: Pule a habilidade e note-a no campo de erros. Continue com as habilidades restantes.
- **Nenhum resultado para todas as habilidades**: Retorne estado `erro` sugerindo que o usuário tente termos de busca diferentes ou verifique se a Alura oferece cursos para sua área alvo.
- **Dados de pré-requisito ausentes**: Se `data/job-search-results.md` estiver ausente ou não tiver habilidades faltantes, retorne estado `erro` solicitando que o usuário busque vagas primeiro (opção A do menu).
