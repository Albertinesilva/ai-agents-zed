export interface QuizProfile {
  areaInterest: string;
  experienceLevel: string;
  workPreference: string;
  location: string;
  softSkills: string;
  careerGoal: string;
  techSkills: string;
  completed: boolean;
}

export interface UserProfile extends QuizProfile {
  targetRoles: string[];
}

export interface SearchItem {
  title: string;
  company: string;
  location: string;
  link: string;
  description: string;
  relatedSkill: string;
  source: string;
  platform?: string;
  hours?: string;
  instructor?: string;
  skills?: string[];
}

export interface SearchEnvelope {
  status: 'success' | 'error';
  summary: string;
  data: SearchItem[];
  errors: string[];
  gaps?: string[];
  markdown: string;
}

export const areaExperienceRoleMap: Record<string, Record<string, string[]>> = {
  'Frontend': {
    'Júnior': ['Desenvolvedor Frontend', 'Desenvolvedor UI Júnior', 'Desenvolvedor Web'],
    'Pleno': ['Engenheiro Frontend', 'Desenvolvedor UI', 'Desenvolvedor React'],
    'Sênior': ['Engenheiro Frontend Sênior', 'Líder de Desenvolvimento UI', 'Arquiteto Frontend'],
  },
  'Backend': {
    'Júnior': ['Desenvolvedor Backend', 'Desenvolvedor API Júnior', 'Desenvolvedor de Software'],
    'Pleno': ['Engenheiro Backend', 'Desenvolvedor API', 'Desenvolvedor Python/Java'],
    'Sênior': ['Engenheiro Backend Sênior', 'Arquiteto de Sistemas', 'Líder Técnico'],
  },
  'Ciência de Dados': {
    'Júnior': ['Analista de Dados', 'Cientista de Dados Júnior', 'Analista BI'],
    'Pleno': ['Cientista de Dados', 'Engenheiro de Machine Learning', 'Engenheiro de Dados'],
    'Sênior': ['Cientista de Dados Sênior', 'Arquiteto ML', 'Líder IA'],
  },
  'Mobile': {
    'Júnior': ['Desenvolvedor Mobile', 'Desenvolvedor iOS/Android Júnior'],
    'Pleno': ['Desenvolvedor iOS', 'Desenvolvedor Android', 'Desenvolvedor React Native'],
    'Sênior': ['Engenheiro Mobile Sênior', 'Arquiteto Mobile', 'Líder Flutter'],
  },
  'DevOps': {
    'Júnior': ['Engenheiro DevOps Júnior', 'Suporte Cloud', 'SysAdmin'],
    'Pleno': ['Engenheiro DevOps', 'Engenheiro Cloud', 'SRE'],
    'Sênior': ['Engenheiro DevOps Sênior', 'Arquiteto Cloud', 'Líder de Plataforma'],
  },
  'Full Stack': {
    'Júnior': ['Desenvolvedor Full Stack', 'Desenvolvedor Web Júnior'],
    'Pleno': ['Engenheiro Full Stack', 'Desenvolvedor de Aplicações Web'],
    'Sênior': ['Engenheiro Full Stack Sênior', 'Líder Técnico', 'Arquiteto de Soluções'],
  },
  'Governança de Dados': {
    'Júnior': ['Analista de Governança de Dados Júnior', 'Gestor de Dados Júnior', 'Assistente de Compliance'],
    'Pleno': ['Analista de Governança de Dados', 'DPO', 'Analista de Qualidade de Dados'],
    'Sênior': ['Head de Governança de Dados', 'Diretor Chefe de Dados', 'Líder de Arquitetura de Dados'],
  },
  'Design UX': {
    'Júnior': ['Designer UX Júnior', 'Assistente UI/UX', 'Pesquisador UX Jr'],
    'Pleno': ['Designer UX', 'Pesquisador UX', 'Designer de Produto'],
    'Sênior': ['Designer UX Sênior', 'Líder UX', 'Head de UX'],
  },
  'Design UI': {
    'Júnior': ['Designer UI Júnior', 'Designer Visual Jr', 'Assistente de Design System'],
    'Pleno': ['Designer UI', 'Designer Visual', 'Designer de Interação'],
    'Sênior': ['Designer UI Sênior', 'Líder UI', 'Arquiteto de Design System'],
  },
  'Liderança': {
    'Júnior': ['Líder de Equipe Júnior', 'Coordenador de Projetos', 'Scrum Master Jr'],
    'Pleno': ['Gerente de Engenharia', 'Gerente de Projetos', 'Agile Coach'],
    'Sênior': ['Diretor de Engenharia', 'VP de Tecnologia', 'CTO'],
  },
  'RH': {
    'Júnior': ['Analista de RH Júnior', 'Assistente de Aquisição de Talentos', 'Coordenador de RH'],
    'Pleno': ['Analista de RH', 'Recrutador', 'Especialista em Operações de Pessoas'],
    'Sênior': ['Gerente de RH', 'Head de Pessoas', 'Diretor de Talentos'],
  },
  'Marketing de Mídias Sociais': {
    'Júnior': ['Assistente de Mídias Sociais', 'Criador de Conteúdo Jr', 'Community Manager Jr'],
    'Pleno': ['Gerente de Mídias Sociais', 'Estrategista de Conteúdo', 'Analista de Marketing Digital'],
    'Sênior': ['Head de Mídias Sociais', 'Diretor de Mídias Sociais', 'Líder Estrategista de Marca'],
  },
  'Growth Marketing': {
    'Júnior': ['Assistente de Growth Marketing', 'Analista de Marketing Jr', 'Marketing de Performance Jr'],
    'Pleno': ['Growth Marketer', 'Gerente de Marketing de Performance', 'Especialista CRO'],
    'Sênior': ['Head de Growth', 'Diretor de Growth', 'VP de Marketing'],
  },
  'Gestão de Produtos': {
    'Júnior': ['Analista de Produto', 'Gerente de Produto Associado', 'Product Owner Jr'],
    'Pleno': ['Gerente de Produto', 'Product Owner', 'Gerente de Produto Técnico'],
    'Sênior': ['Gerente de Produto Sênior', 'Head de Produto', 'VP de Produto'],
  },
  'Cibersegurança': {
    'Júnior': ['Analista de Segurança Júnior', 'Analista SOC', 'Assistente de Segurança da Informação'],
    'Pleno': ['Engenheiro de Segurança', 'Testador de Penetração', 'Consultor de Segurança'],
    'Sênior': ['Engenheiro de Segurança Sênior', 'CISO', 'Líder Arquiteto de Segurança'],
  },
};

export function emptyQuizProfile(): QuizProfile {
  return {
    areaInterest: '',
    experienceLevel: '',
    workPreference: '',
    location: '',
    softSkills: '',
    careerGoal: '',
    techSkills: '',
    completed: false,
  };
}

export function emptyUserProfile(): UserProfile {
  return {
    ...emptyQuizProfile(),
    targetRoles: [],
  };
}

export function deriveTargetRoles(areaInterest: string, experienceLevel: string): string[] {
  return areaExperienceRoleMap[areaInterest]?.[experienceLevel] ?? [];
}

export function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

export function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
