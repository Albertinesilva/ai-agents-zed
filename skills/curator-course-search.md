# Procedimento de Busca de Cursos (Curator)

## Passo 1: Validar Perfil do Usuário

1. Ler o arquivo `data/user-profile.md` usando `read_file`
2. Verificar se o arquivo existe e contém o campo `Habilidades atuais`
3. Se o arquivo não existir ou estiver incompleto, retornar erro no envelope de resposta solicitando que o usuário complete o quiz primeiro

## Passo 2: Analisar Vagas Encontradas

1. Ler o arquivo `data/job-search-results.md` usando `read_file`
2. Verificar se o arquivo existe e contém vagas com descrições
3. Se o arquivo não existir, retornar erro no envelope de resposta solicitando que o usuário execute a busca de vagas (opção A) primeiro

## Passo 3: Identificar Lacunas de Habilidades

1. Extrair habilidades das descrições das vagas em `data/job-search-results.md`
2. Comparar com as `Habilidades atuais` do usuário em `data/user-profile.md`
3. Listar habilidades faltantes (exigidas nas vagas mas não possuídas pelo usuário)
4. Se não houver lacunas, retornar estado `sucesso` com mensagem de que todas as habilidades já estão cobertas

## Passo 4: Buscar Cursos na Alura via Firecrawl

Para cada habilidade faltante:
1. Construir query de busca: `curso [habilidade]`
2. Executar comando firecrawl:
   ```
   firecrawl search --query "curso [habilidade]" --site "https://www.alura.com.br"
   ```
3. Verificar saída do comando:
   - Se sucesso: extrair dados dos cursos (título, carga horária, instrutor, link)
   - Se erro (código diferente de 0): registrar em `erros` e prosseguir para Passo 5 (fallback)

## Passo 5: Fallback para Fetch (se firecrawl falhar)

Para cada habilidade faltante onde firecrawl falhou:
1. Usar `fetch` para acessar a URL de busca da Alura:
   ```
   https://www.alura.com.br/busca?query=[habilidade]
   ```
2. Extrair dados dos cursos do HTML retornado:
   - Título do curso
   - Carga horária
   - Instrutor
   - Link do curso
   - Descrição curta

## Passo 6: Normalizar Resultados

Para cada curso encontrado, formatar como:
1. Título: [valor]
   Plataforma: Alura
   Carga Horária: [valor]
   Instrutor: [valor]
   Link: [valor]
   Descrição: [valor]
   Habilidade Relacionada: [habilidade faltante]

## Passo 7: Salvar Resultados

1. Escrever resultados em `data/course-search-results.md` usando `write_file`
2. Formato do arquivo:
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
   Erros: [apenas se houver erros de busca]
   ```

## Passo 8: Retornar Envelope de Resposta

Seguir formato de `skills/dispatch.md`:
```
## RESPOSTA: CURATOR
### estado
[sucesso | erro]

### resumo
[Resumo legível de 2-3 frases para o usuário]

### dados
[Resultados como listas numeradas com pares chave-valor. Sem tabelas markdown.]

### erros
[Apenas se estado for erro: o que deu errado]
```
