import type { QuizProfile, SearchItem, UserProfile } from '../../shared/types';

export type MenuKey = 'A' | 'B' | 'C' | 'D';
export type AppMode = 'normal' | 'demo';
export type CoachStep = 0 | 1 | 2 | 3 | 4 | 5;

export type AppState = {
  quiz: QuizProfile;
  profile: UserProfile;
  jobs: SearchItem[];
  courses: SearchItem[];
  gaps: string[];
};

export type Activity = {
  role: 'Maestro' | 'Scout' | 'Curator' | 'Coach' | 'Sistema';
  message: string;
  kind: 'neutral' | 'success' | 'warning' | 'error';
};

export type CoachPrompt = {
  step: CoachStep;
  title: string;
  prompt: string;
  hint: string;
};

export type PersistedUiState = {
  page: string;
  selectedMenu: MenuKey;
  lastAction: string;
  coachStep: CoachStep;
  coachResponses: Record<CoachStep, string>;
  mode: AppMode;
  demoLoaded: boolean;
};

export const storageKeys = {
  ui: 'recoloca-ui-state',
} as const;

export const appPages = [
  { key: 'home', label: 'Início', hint: 'Visão geral' },
  { key: 'quiz', label: 'Quiz', hint: 'Perfil' },
  { key: 'jobs', label: 'Vagas', hint: 'Scout' },
  { key: 'courses', label: 'Cursos', hint: 'Curator' },
  { key: 'coach', label: 'Coach', hint: 'Entrevista' },
] as const;

export type AppPageKey = typeof appPages[number]['key'];

export const menuEntries: Array<{ key: MenuKey; title: string; subtitle: string; color: 'emerald' | 'cyan' | 'violet' | 'amber' }> = [
  { key: 'A', title: 'Buscar vagas', subtitle: 'Scout com firecrawl e fallback via fetch.', color: 'emerald' },
  { key: 'B', title: 'Encontrar cursos', subtitle: 'Curator cruza vagas e lacunas.', color: 'cyan' },
  { key: 'C', title: 'Entrevista simulada', subtitle: 'Coach em 6 etapas guiadas.', color: 'violet' },
  { key: 'D', title: 'Refazer quiz', subtitle: 'Reinicia o perfil e bloqueia o menu.', color: 'amber' },
];

export const coachFlow: CoachPrompt[] = [
  { step: 0, title: 'Abertura e contexto', prompt: 'Me apresente uma versão curta da sua trajetória e o que você quer mudar agora.', hint: '2 a 4 frases, focando em objetivo profissional e momento atual.' },
  { step: 1, title: 'Experiência técnica', prompt: 'Quais projetos ou responsabilidades comprovam sua experiência mais forte na área?', hint: 'Mencione stack, tipo de produto e impacto percebido.' },
  { step: 2, title: 'Desafio recente', prompt: 'Conte sobre um desafio difícil e como você lidou com ele.', hint: 'Use contexto, ação e resultado.' },
  { step: 3, title: 'Força atual', prompt: 'Se eu te contratasse amanhã, qual seria sua maior vantagem no primeiro mês?', hint: 'Algo concreto: velocidade, comunicação, domínio técnico ou liderança.' },
  { step: 4, title: 'Perguntas ao recrutador', prompt: 'Que perguntas você faria para a empresa para demonstrar senioridade e curiosidade?', hint: 'Pense em cultura, métricas, time e expectativas.' },
  { step: 5, title: 'Fechamento e feedback', prompt: 'Faça seu fechamento final em tom confiante, curto e profissional.', hint: 'Responda como se estivesse encerrando uma entrevista real.' },
];

export const demoPreset = {
  profile: {
    areaInterest: 'Backend',
    experienceLevel: 'Júnior',
    workPreference: 'Remoto',
    location: 'Brasil',
    softSkills: 'Comunicação, trabalho em equipe, proatividade, organização',
    careerGoal: 'Transição de carreira',
    techSkills: 'Java, Spring Boot, PostgreSQL, MySQL, Git, Thymeleaf, JasperReports',
    completed: true,
    targetRoles: ['Desenvolvedor Backend', 'Desenvolvedor API Júnior', 'Desenvolvedor de Software'],
  } satisfies UserProfile,
  jobs: [
    {
      title: 'Desenvolvedor Java - Tecban',
      company: 'Tecban',
      location: 'São Paulo, SP (Home Office)',
      link: 'https://br.indeed.com/viewjob?jk=demo-1',
      description: 'Atuar como Analista de Tecnologia da Informação Júnior com Java e Spring Boot.',
      relatedSkill: 'Java',
      source: 'Indeed',
      skills: ['Java', 'Spring Boot', 'Angular', 'JavaScript'],
    },
    {
      title: 'Desenvolvedor Java Júnior - BairesDev',
      company: 'BairesDev',
      location: 'Remoto',
      link: 'https://br.indeed.com/viewjob?jk=demo-2',
      description: 'Atuar como desenvolvedor Java Júnior em equipe de produto.',
      relatedSkill: 'Java',
      source: 'Indeed',
      skills: ['Java', 'APIs', 'Git'],
    },
  ],
  courses: [
    {
      title: 'Java: criando sua primeira API com Spring Boot',
      company: 'Alura',
      location: 'Alura',
      link: 'https://www.alura.com.br/curso-online-spring-boot-api',
      description: 'Construa APIs REST com Spring Boot, validação e persistência.',
      relatedSkill: 'Spring Boot',
      source: 'Alura',
      platform: 'Alura',
      hours: '10h',
      instructor: 'Equipe Alura',
      skills: ['Spring Boot', 'APIs', 'REST'],
    },
    {
      title: 'Git e GitHub: compartilhando e colaborando em projetos',
      company: 'Alura',
      location: 'Alura',
      link: 'https://www.alura.com.br/curso-online-git-github',
      description: 'Fluxo de colaboração, versionamento e boas práticas de times ágeis.',
      relatedSkill: 'Git',
      source: 'Alura',
      platform: 'Alura',
      hours: '8h',
      instructor: 'Equipe Alura',
      skills: ['Git', 'GitHub'],
    },
  ],
  gaps: ['Angular', 'APIs', 'Testes automatizados', 'Docker'],
  coachResponses: {
    0: 'Sou um profissional em transição para backend, com base em Java e Spring Boot e foco em entregas confiáveis.',
    1: 'Participei da manutenção de aplicações Java com Spring Boot, banco relacional e geração de relatórios.',
    2: 'Em um projeto com prazo curto, reorganizei prioridades, quebrei o problema em etapas e entreguei a solução com menos retrabalho.',
    3: 'Eu já chego com disciplina de código, entendimento de base técnica e boa comunicação com o time.',
    4: 'Eu perguntaria sobre métricas de sucesso, desafios técnicos do time e expectativa de crescimento no primeiro trimestre.',
    5: 'Tenho interesse genuíno pela vaga, consigo contribuir rápido e estou pronto para evoluir junto com o time.',
  } satisfies Record<CoachStep, string>,
};

export function calcProgress(profile: QuizProfile) {
  const values = [profile.areaInterest, profile.experienceLevel, profile.workPreference, profile.location, profile.softSkills, profile.careerGoal, profile.techSkills];
  const filled = values.filter(Boolean).length;
  return Math.round((filled / values.length) * 100);
}

export function isQuizReady(profile: QuizProfile) {
  return [profile.areaInterest, profile.experienceLevel, profile.workPreference, profile.location, profile.softSkills, profile.careerGoal, profile.techSkills].every((value) => Boolean(value.trim()));
}

export function buildDemoMarkdown() {
  return [
    '## MODO DEMO',
    '### perfil',
    'Backend · Júnior · Remoto · Brasil',
    '### vagas',
    'Desenvolvedor Java - Tecban',
    'Desenvolvedor Java Júnior - BairesDev',
    '### cursos',
    'Java: criando sua primeira API com Spring Boot',
    'Git e GitHub: compartilhando e colaborando em projetos',
    '### coach',
    'Fluxo pronto com 6 respostas base para demonstração.',
  ].join('\n');
}

export function getSelectedMeta(menu: MenuKey) {
  switch (menu) {
    case 'A':
      return { title: 'Scout ativo', summary: 'Nossa inteligência buscará vagas alinhadas ao seu perfil no mercado e as salvará para você.', hint: 'Busca inteligente ligada.', accent: 'text-emerald-200' };
    case 'B':
      return { title: 'Curator ativo', summary: 'Vamos cruzar as habilidades que faltam para as vagas com cursos focados no seu crescimento.', hint: 'Focado no seu gap de habilidades.', accent: 'text-cyan-200' };
    case 'C':
      return { title: 'Coach reservado', summary: 'A entrevista simulada é guiada em 6 etapas para treinar e refinar o seu discurso.', hint: 'Pronto para testar seus conhecimentos.', accent: 'text-violet-200' };
    case 'D':
      return { title: 'Quiz em reinício', summary: 'Refaça suas respostas do perfil. O menu ficará oculto até que o novo perfil seja traçado.', hint: 'Recomeçar o perfil.', accent: 'text-amber-200' };
  }
}

export function buildDispatchPreview(menu: MenuKey, profile: UserProfile, stage: 'quiz' | 'menu', state: AppState) {
  const roles = profile.targetRoles.length ? profile.targetRoles : [];
  const contextLines = [
    `Área de interesse: ${profile.areaInterest || 'não informada'}`,
    `Nível: ${profile.experienceLevel || 'não informado'}`,
    `Localização: ${profile.location || 'não informada'}`,
    `Funções alvo: ${roles.length ? roles.join(', ') : 'ainda não definidas'}`,
    `Lacunas calculadas: ${state.gaps.length ? state.gaps.join(', ') : 'aguardando Scout'}`,
  ];

  if (stage === 'quiz') {
    return [
      '## DESPACHO: MAESTRO',
      '### tarefa',
      'Conduzir o quiz até que o perfil esteja concluído.',
      '### contexto',
      ...contextLines,
      '### saida_esperada',
      'Salvar data/personality-quiz.md e data/user-profile.md antes de liberar o menu.',
    ].join('\n');
  }

  switch (menu) {
    case 'A':
      return [
        '## DESPACHO: SCOUT',
        '### referencia_persona',
        'personas/scout.md',
        '### tarefa',
        'Buscar vagas de emprego nos sites InfoJobs, Vagas.com e Indeed com base no perfil do usuário.',
        '### perfil_usuario',
        `Área: ${profile.areaInterest || '-'} | Nível: ${profile.experienceLevel || '-'} | Localização: ${profile.location || '-'}`,
        '### contexto',
        'Priorizar firecrawl CLI e usar fetch apenas se a extração falhar.',
        '### saida_esperada',
        'Envelope com vagas numeradas, pares chave-valor, sem tabelas markdown.',
      ].join('\n');
    case 'B':
      return [
        '## DESPACHO: CURATOR',
        '### referencia_persona',
        'personas/curator.md',
        '### tarefa',
        'Buscar cursos na Alura que preencham as lacunas de habilidades do usuário.',
        '### perfil_usuario',
        `Área: ${profile.areaInterest || '-'} | Nível: ${profile.experienceLevel || '-'} | Localização: ${profile.location || '-'}`,
        '### contexto',
        'Comparar data/user-profile.md com data/job-search-results.md e priorizar firecrawl.',
        '### saida_esperada',
        'Envelope com cursos numerados, pares chave-valor, sem tabelas markdown.',
      ].join('\n');
    case 'C':
      return [
        '## DESPACHO: COACH',
        '### referencia_persona',
        'personas/coach.md',
        '### tarefa',
        'Realizar entrevista simulada em seis etapas.',
        '### contexto',
        'Fluxo local persistido em localStorage para apresentação.',
        '### saida_esperada',
        'Perguntas, respostas, feedback e encerramento da simulação.',
      ].join('\n');
    case 'D':
      return [
        '## DESPACHO: MAESTRO',
        '### tarefa',
        'Reiniciar o quiz, limpar os resultados e retornar ao estado inicial.',
        '### contexto',
        'Data reset em personality-quiz.md, user-profile.md, job-search-results.md e course-search-results.md.',
        '### saida_esperada',
        'Formulário vazio e menu bloqueado até nova conclusão.',
      ].join('\n');
  }
}

export function menuTone(color: 'emerald' | 'cyan' | 'violet' | 'amber') {
  const map = {
    emerald: { rest: 'border-emerald-400/10 bg-emerald-400/5', selected: 'border-emerald-300/40 bg-emerald-300/15 ring-1 ring-emerald-200/20', badge: 'bg-emerald-400/15 text-emerald-100' },
    cyan: { rest: 'border-cyan-400/10 bg-cyan-400/5', selected: 'border-cyan-300/40 bg-cyan-300/15 ring-1 ring-cyan-200/20', badge: 'bg-cyan-400/15 text-cyan-100' },
    violet: { rest: 'border-violet-400/10 bg-violet-400/5', selected: 'border-violet-300/40 bg-violet-300/15 ring-1 ring-violet-200/20', badge: 'bg-violet-400/15 text-violet-100' },
    amber: { rest: 'border-amber-400/10 bg-amber-400/5', selected: 'border-amber-300/40 bg-amber-300/15 ring-1 ring-amber-200/20', badge: 'bg-amber-400/15 text-amber-100' },
  } as const;

  return map[color];
}

export function accentTone(accent: 'emerald' | 'cyan') {
  return accent === 'emerald'
    ? { accent: 'text-emerald-200', border: 'border-emerald-400/20', badgeBackground: 'bg-emerald-400/10' }
    : { accent: 'text-cyan-200', border: 'border-cyan-400/20', badgeBackground: 'bg-cyan-400/10' };
}

function sortByStep(items: CoachPrompt[]) {
  return [...items].sort((a, b) => a.step - b.step);
}

export const orderedCoachFlow = sortByStep(coachFlow);
