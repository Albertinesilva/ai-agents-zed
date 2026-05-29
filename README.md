<div align="center">

# 🤖 Recoloca IA

...

</div>

Projeto experimental focado na aplicação prática de conceitos de Agentes de IA, orquestração de tarefas e integração com modelos de linguagem.

A proposta surgiu a partir dos conceitos apresentados na [Imersão IA da Alura](https://www.alura.com.br/?srsltid=AfmBOoqZOpSVJb0TTCVrzdiNZ3PeVGmvS-ngVp7pasbHYPeYGUaZaBuU) e foi expandida com implementações próprias, incluindo a construção de um MVP em React e Vite para validar a experiência proposta pelos agentes.

<div align="center">

[![Demo](https://img.shields.io/badge/Demo-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://recoloca-ia.netlify.app/jobs)
[![Alura](https://img.shields.io/badge/Imersão_IA-Alura-051933?style=for-the-badge)](https://www.alura.com.br/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-LLM-412991?style=for-the-badge)](https://openrouter.ai/)
[![Firecrawl](https://img.shields.io/badge/Firecrawl-Web_Search-FF6B35?style=for-the-badge)](https://www.firecrawl.dev/)
[![Zed](https://img.shields.io/badge/Zed-AI_Editor-084CCF?style=for-the-badge)](https://zed.dev/)
[![AI Agents](https://img.shields.io/badge/AI_Agents-Multi--Agent_System-blue?style=for-the-badge)](#)
[![Prompt Engineering](https://img.shields.io/badge/Prompt_Engineering-Applied-success?style=for-the-badge)](#)
[![Context Engineering](https://img.shields.io/badge/Context_Engineering-Applied-informational?style=for-the-badge)](#)
[![LLM](https://img.shields.io/badge/LLM-Integration-purple?style=for-the-badge)](#)
[![MVP](https://img.shields.io/badge/MVP-Functional-orange?style=for-the-badge)](https://recoloca-ia.netlify.app/jobs)
[![Status](https://img.shields.io/badge/Status-Experimental-yellow?style=for-the-badge)](#)

</div>

---

## 🚀 O que foi explorado

O projeto permitiu explorar conceitos como:

* Criação de agentes especializados
* Orquestração de agentes
* Engenharia de Prompts
* Engenharia de Contexto
* Definição de Personas para IA
* Estruturação de fluxos multiagente
* Planejamento orientado por IA
* Busca e extração de dados na web
* Integração com modelos de linguagem (LLMs)

---
## 🛠️ Ferramentas Utilizadas

### Zed

Utilizado para definição e execução dos agentes através de arquivos de instrução e contexto.

Explorado durante o projeto:

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

---
## 🧠 Estrutura dos Agentes

### Maestro

Agente responsável por coordenar o fluxo principal e direcionar tarefas para os demais agentes.

### Scout

Agente especializado em pesquisa de oportunidades de trabalho e análise de requisitos de vagas.

### Curator

Agente responsável por identificar lacunas de conhecimento e sugerir materiais de estudo.

### Coach

Agente focado em simulações de entrevistas e feedback das respostas fornecidas pelo usuário.

---
## 📂 Estrutura do Projeto

```text
RECOLOCA-IA
│
├── agents/
│   ├── AGENTS.md
│   │
│   ├── data/
│   │   ├── personality-quiz.md
│   │   ├── user-profile.md
│   │   ├── job-search-results.md
│   │   └── course-search-results.md
│   │
│   ├── docs/
│   │   ├── plano.md
│   │   ├── plano-aula-1.md
│   │   ├── plano-aula-2.md
│   │   ├── plano-aula-3.md
│   │   └── plano-aula-4.md
│   │
│   ├── personas/
│   │   ├── maestro.md
│   │   ├── scout.md
│   │   ├── curator.md
│   │   └── coach.md
│   │
│   └── skills/
│       ├── dispatch.md
│       ├── firecrawl.md
│       ├── job-search.md
│       ├── scout-job-search.md
│       ├── curator-course-search.md
│       ├── course-analysis.md
│       └── interview-sim.md
│
└── project/
    └── MVP desenvolvido com React + Vite
```

### Organização

| Diretório          | Responsabilidade                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `agents/`          | Núcleo do laboratório contendo agentes, personas, habilidades, documentação e dados utilizados durante as execuções. |
| `agents/data/`     | Armazena perfis, questionários e resultados gerados pelos agentes.                                                   |
| `agents/docs/`     | Planejamento e documentação produzidos durante a definição da solução.                                               |
| `agents/personas/` | Define o comportamento, contexto e responsabilidades de cada agente.                                                 |
| `agents/skills/`   | Contém os fluxos, instruções e capacidades utilizadas pelos agentes.                                                 |
| `agents/AGENTS.md` | Arquivo central de configuração e coordenação do ambiente multiagente.                                               |
| `project/`         | MVP desenvolvido em React e Vite para validar a proposta em uma interface web.                                       |

### Agentes

* **Maestro** → Orquestra o fluxo principal e coordena os demais agentes.
* **Scout** → Pesquisa oportunidades e analisa requisitos de vagas.
* **Curator** → Identifica lacunas de conhecimento e recomenda cursos.
* **Coach** → Simula entrevistas e fornece feedback sobre as respostas.

---
## 💻 MVP Front-end

Além da estrutura de agentes definida durante o laboratório, desenvolvi de forma independente um MVP...

- React
- Vite
- JavaScript
- Netlify

O objetivo foi transformar a proposta conceitual dos agentes em uma interface navegável para experimentação.

🔗 Acesse o Demo: [recoloca-ia](https://recoloca-ia.netlify.app/home)

O MVP demonstra o fluxo principal definido durante o planejamento, mas ainda está em evolução e possui melhorias previstas em usabilidade, integração e experiência do usuário.

---
## 📚 Principais Aprendizados

Entre os principais aprendizados obtidos durante o desenvolvimento estão:

* Como agentes de IA podem ser especializados por contexto.
* Como dividir responsabilidades entre múltiplos agentes.
* Como construir fluxos orientados por planejamento.
* Como utilizar dados externos para enriquecer respostas.
* Como transformar uma ideia baseada em IA em um MVP funcional.
* Como estruturar personas para diferentes objetivos.
* Como organizar contexto compartilhado entre agentes.

---
## 🎓 Contexto

Projeto inspirado nos conceitos apresentados durante a [Imersão IA da Alura](https://www.alura.com.br/?srsltid=AfmBOoqZOpSVJb0TTCVrzdiNZ3PeVGmvS-ngVp7pasbHYPeYGUaZaBuU) e expandido com implementações próprias para explorar arquiteturas baseadas em agentes, planejamento orientado por IA e integração com ferramentas de busca e modelos de linguagem.

Além da estrutura conceitual dos agentes, foi desenvolvido um MVP independente utilizando React, Vite e Netlify para validar a proposta em uma aplicação web funcional.

🔗 **MVP:** [recoloca IA](https://recoloca-ia.netlify.app/home)

---
## 👨‍💻 Autor

**Albert Silva de Jesus**  
Backend Developer • Java • Spring Boot • REST APIs

---

## 📎 Contato

[![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/albert-backend-java-spring-boot/)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:albertinesilva.17@gmail.com)
