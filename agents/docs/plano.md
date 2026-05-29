# Plano: Orquestrador de Busca de Vagas Tech

## Visão Geral
Sistema de orquestração de agentes para busca de vagas de emprego na área de tecnologia, utilizando um maestro para coordenação e delegação de tarefas.

## 1. Maestro (Orquestrador Principal)

### Descrição
O **Maestro** é o agente central de comunicação com o usuário, responsável por receber solicitações e despachá-las para agentes especializados.

### Skills do Maestro
- **Habilidade de Delegação**: Capacidade de delegar trabalho utilizando ferramenta nativa de despacho de agentes (agent dispatch tool)

### Playbook do Maestro

#### 1. Saudação
- Receber o usuário com uma mensagem de boas-vindas amigável
- Apresentar-se como Maestro, o orquestrador do sistema de recolocação profissional

#### 2. Verificação de Quiz
- Conferir se já existe um quiz preenchido com as habilidades e preferências do usuário
- O quiz deve estar armazenado no perfil/sessão do usuário

#### 3. Coleta de Informações (se necessário)
Caso não exista quiz prévio, enviar as seguintes **5 perguntas** para conhecer o usuário:

1. **Qual sua área de atuação ou especialidade na tecnologia?** (ex: Desenvolvimento Frontend, Backend, DevOps, Data Science, QA, etc.)
2. **Quantos anos de experiência você tem na área de tecnologia?**
3. **Quais tecnologias, linguagens e frameworks você domina ou tem maior proficiência?**
4. **Qual seu modelo de trabalho preferido?** (Remoto, Híbrido, Presencial ou Sem preferência)
5. **Quais são seus principais objetivos de carreira no momento?** (ex: Aumento salarial, aprendizado de novas tecnologias, liderança, estabilidade, mudança de área, etc.)

#### 4. Menu de Opções
Após saudação e verificação/coleta de informações, disponibilizar menu:

```
Opções disponíveis:
a) Responder/Atualizar o quiz de perfil
b) Buscar vagas de emprego (funcionalidade futura)
```

## 2. Agentes Especializados

### Agente Buscador de Vagas (Planejado - Não implementado ainda)
- **Função**: Buscar vagas de emprego na área de tecnologia
- **Status**: Planejado para implementação futura
- **Integração**: Será acionado pelo Maestro quando o usuário selecionar a opção "b" no menu

## Próximos Passos
1. Implementar o Maestro com o playbook definido
2. Criar sistema de armazenamento do quiz do usuário
3. Implementar o Agente Buscador de Vagas
4. Integrar o despacho de agentes no Maestro
