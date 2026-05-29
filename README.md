# 🤖 Recoloca IA

Projeto experimental focado na aplicação prática de conceitos de Agentes de IA, orquestração de tarefas e integração com modelos de linguagem.

A proposta surgiu a partir dos conceitos apresentados na Imersão IA da Alura e foi expandida com implementações próprias, incluindo a construção de um MVP em React e Vite para validar a experiência proposta pelos agentes.
## 🚀 O que foi explorado

Durante o desenvolvimento deste laboratório foram estudados conceitos como:

* Criação de agentes especializados
* Orquestração de agentes
* Engenharia de Prompts
* Engenharia de Contexto
* Definição de Personas para IA
* Estruturação de fluxos multiagente
* Planejamento orientado por IA
* Busca e extração de dados na web
* Integração com modelos de linguagem (LLMs)

## 🛠️ Ferramentas Utilizadas

### Zed

Utilizado para definição e execução dos agentes através de arquivos de instrução e contexto.

Aprendizados:

* Estruturação de personas
* Separação de responsabilidades entre agentes
* Fluxos de despacho (handoff)
* Organização de contexto compartilhado

### Firecrawl

Utilizado para pesquisa e extração de informações da web.

Aprendizados:

* Busca automatizada de conteúdo
* Extração estruturada de dados
* Alimentação de agentes com informações externas

### OpenRouter

Utilizado como provedor para acesso aos modelos de linguagem.

Aprendizados:

* Integração com diferentes LLMs
* Configuração de modelos para execução dos agentes

## 🧠 Estrutura dos Agentes

### Maestro

Agente responsável por coordenar o fluxo principal e direcionar tarefas para os demais agentes.

### Scout

Agente especializado em pesquisa de oportunidades de trabalho e análise de requisitos de vagas.

### Curator

Agente responsável por identificar lacunas de conhecimento e sugerir materiais de estudo.

### Coach

Agente focado em simulações de entrevistas e feedback das respostas fornecidas pelo usuário.

## 📂 Estrutura do Projeto

```text
RECOLOCA-IA
├── agents/
├── data/
├── docs/
├── personas/
│   ├── maestro.md
│   ├── scout.md
│   ├── curator.md
│   └── coach.md
├── skills/
│   ├── dispatch.md
│   ├── firecrawl.md
│   ├── job-search.md
│   ├── course-analysis.md
│   └── interview-sim.md
└── AGENTS.md
```

## 💻 MVP Front-end

Como extensão do laboratório, desenvolvi um MVP utilizando:

* React
* Vite
* JavaScript
* Netlify

O objetivo foi transformar a proposta conceitual dos agentes em uma interface navegável para experimentação.

O MVP demonstra o fluxo principal definido durante o planejamento, mas ainda está em evolução e possui melhorias previstas em usabilidade, integração e experiência do usuário.

## 📚 Principais Aprendizados

Este projeto serviu como laboratório para compreender na prática:

* Como agentes de IA podem ser especializados por contexto.
* Como dividir responsabilidades entre múltiplos agentes.
* Como construir fluxos orientados por planejamento.
* Como utilizar dados externos para enriquecer respostas.
* Como transformar uma ideia baseada em IA em um MVP funcional.

## 🎓 Contexto

O projeto foi inspirado nos conceitos apresentados durante a Imersão IA da Alura e posteriormente expandido com implementações próprias, permitindo explorar na prática a criação de agentes especializados, planejamento de tarefas, integração com ferramentas de busca e desenvolvimento de uma interface web funcional.
