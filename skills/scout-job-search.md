# Procedimento de Busca de Vagas — Scout

## Visão Geral

Este procedimento define como o Scout deve buscar vagas de emprego em sites específicos, utilizando firecrawl (CLI) ou ferramenta web nativa (`fetch`).

## Passo 1: Validar Perfil do Usuário

- Ler o arquivo `data/user-profile.md` recebido no envelope de despacho
- Extrair os seguintes campos:
  - Área de interesse
  - Nível de experiência
  - Localização
  - Preferências de trabalho
  - Funções alvo
  - Habilidades atuais

## Passo 2: Construir Query de Busca

- Combinar área + nível + localização em uma string de busca
- Exemplo: "Desenvolvedor Python Pleno São Paulo"
- Exemplo: "Cientista de Dados Júnior Remoto"
- Usar as funções alvo como termos alternativos de busca

## Passo 3: Executar Busca via firecrawl

Para cada site, executar o comando firecrawl via `terminal`:

### InfoJobs
```
firecrawl search --query "query" --site "https://www.infojobs.com.br"
```
- URL de busca alternativa: `https://www.infojobs.com.br/vagas-de-emprego?q={query_formatada}`

### Vagas.com
```
firecrawl search --query "query" --site "https://www.vagas.com.br"
```
- URL de busca alternativa: `https://www.vagas.com.br/vagas-de-emprego?q={query_formatada}`

### Indeed
```
firecrawl search --query "query" --site "https://www.indeed.com.br"
```
- URL de busca alternativa: `https://www.indeed.com.br/vagas?q={query_formatada}`

### Tratamento de Erro do firecrawl
- Se o comando retornar erro (código diferente de 0) ou não retornar resultados válidos:
  - Registrar o erro no campo `erros` do envelope de resposta
  - Prosseguir para o Passo 4 (fallback com `fetch`)

## Passo 4: Fallback para `fetch` (se firecrawl falhar)

Se o firecrawl falhar em qualquer site, usar a ferramenta `fetch` para acessar diretamente:

### InfoJobs
- URL: `https://www.infojobs.com.br/vagas-de-emprego?q={query_formatada}`
- Extrair do HTML: título da vaga, empresa, localização, link, descrição

### Vagas.com
- URL: `https://www.vagas.com.br/vagas-de-emprego?q={query_formatada}`
- Extrair do HTML: título da vaga, empresa, localização, link, descrição

### Indeed
- URL: `https://www.indeed.com.br/vagas?q={query_formatada}`
- Extrair do HTML: título da vaga, empresa, localização, link, descrição

## Passo 5: Normalizar Resultados

Para cada vaga encontrada, extrair e formatar:
- **Título**: nome da vaga
- **Empresa**: nome da empresa contratante
- **Localização**: cidade/estado ou "Remoto"
- **Link**: URL completa da vaga
- **Descrição**: resumo curto (máximo 200 caracteres)

## Passo 6: Filtrar Vagas

Filtrar resultados conforme critérios do perfil:
- Área de interesse deve corresponder ao título ou descrição
- Nível de experiência deve corresponder (Júnior, Pleno, Sênior)
- Localização deve corresponder (ou aceitar "Remoto" se preferência for remoto)
- Modalidade de trabalho (remoto/híbrido/presencial) deve corresponder à preferência

## Passo 7: Salvar Resultados

Salvar em `data/job-search-results.md` no formato:

```
Vagas Encontradas:
1. Título: [valor]
   Empresa: [valor]
   Localização: [valor]
   Link: [valor]
   Descrição: [valor]
2. Título: [valor]
   Empresa: [valor]
   Localização: [valor]
   Link: [valor]
   Descrição: [valor]
...

Erros:
- [apenas se houver erros de busca em algum site]
```

## Passo 8: Retornar Envelope de Resposta

Seguir o formato de `skills/dispatch.md`:

```
## RESPOSTA: SCOUT
### estado
[sucesso | erro]

### resumo
[Resumo legível de 2-3 frases para o usuário]

### dados
[Resultados como listas numeradas com pares chave-valor. Sem tabelas markdown.]

### erros
[Apenas se estado for erro: o que deu errado]
```

## Notas Técnicas

- O firecrawl deve estar instalado e disponível no PATH do sistema
- Se o firecrawl não estiver disponível, pular direto para `fetch`
- Extrair dados do HTML retornado pelo `fetch` analisando a estrutura da página
- Limitar a no máximo 10 vagas por site para não sobrecarregar a resposta
- Se nenhuma vaga for encontrada, retornar lista vazia com mensagem explicativa
