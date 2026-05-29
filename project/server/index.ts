import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { join } from 'node:path';
import { URL } from 'node:url';
import {
  areaExperienceRoleMap,
  deriveTargetRoles,
  emptyQuizProfile,
  emptyUserProfile,
  normalizeToken,
  splitCsv,
  toTitleCase,
  type QuizProfile,
  type SearchEnvelope,
  type SearchItem,
  type UserProfile,
} from '../shared/types.js';

const port = Number(process.env.PORT ?? 8787);
const rootDir = process.cwd();
const dataDir = join(rootDir, 'data');
const quizFile = join(dataDir, 'personality-quiz.md');
const profileFile = join(dataDir, 'user-profile.md');
const jobsFile = join(dataDir, 'job-search-results.md');
const coursesFile = join(dataDir, 'course-search-results.md');

const jobSites = [
  {
    name: 'InfoJobs',
    url: 'https://www.infojobs.com.br',
    buildUrl: (query: string, location: string) => {
      const params = new URLSearchParams();
      params.set('palavra', query);
      if (location) params.set('where', location);
      return `https://www.infojobs.com.br/empregos.aspx?${params.toString()}`;
    },
  },
  {
    name: 'Vagas.com',
    url: 'https://www.vagas.com.br',
    buildUrl: (query: string, location: string) => {
      const params = new URLSearchParams();
      params.set('palavra', query);
      if (location) params.set('cidade', location);
      return `https://www.vagas.com.br/vagas-de?${params.toString()}`;
    },
  },
  {
    name: 'Indeed',
    url: 'https://br.indeed.com',
    buildUrl: (query: string, location: string) => {
      const params = new URLSearchParams();
      params.set('q', query);
      if (location) params.set('l', location);
      return `https://br.indeed.com/jobs?${params.toString()}`;
    },
  },
] as const;

const aluraSite = {
  name: 'Alura',
  url: 'https://www.alura.com.br',
  buildUrl: (query: string) => `https://www.alura.com.br/busca?query=${encodeURIComponent(query)}`,
};

const skillLexiconByArea: Record<string, string[]> = {
  'Frontend': ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Acessibilidade', 'Testes'],
  'Backend': ['Node.js', 'TypeScript', 'REST', 'APIs', 'SQL', 'Docker', 'AWS'],
  'Ciência de Dados': ['Python', 'SQL', 'Pandas', 'Machine Learning', 'Estatística', 'Power BI'],
  'Mobile': ['React Native', 'Flutter', 'Kotlin', 'Swift', 'Android', 'iOS'],
  'DevOps': ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD', 'Observabilidade'],
  'Full Stack': ['React', 'TypeScript', 'Node.js', 'APIs', 'SQL', 'Docker'],
  'Governança de Dados': ['LGPD', 'Qualidade de Dados', 'Catálogo de Dados', 'Governança', 'Compliance'],
  'Design UX': ['Pesquisa', 'Prototipação', 'Figma', 'Arquitetura da Informação', 'Testes de Usabilidade'],
  'Design UI': ['Figma', 'Design System', 'Tipografia', 'Color System', 'Prototipação'],
  'Liderança': ['Gestão de Pessoas', 'Comunicação', 'Agile', 'Feedback', 'Estratégia'],
  'RH': ['Recrutamento', 'Seleção', 'People Analytics', 'Entrevista', 'Employer Branding'],
  'Marketing de Mídias Sociais': ['Conteúdo', 'Social Media', 'Copywriting', 'Analytics', 'Engajamento'],
  'Growth Marketing': ['CRO', 'SEO', 'Analytics', 'Experimentação', 'Aquisição'],
  'Gestão de Produtos': ['Discovery', 'Roadmap', 'Product Metrics', 'Agile', 'Stakeholders'],
  'Cibersegurança': ['SOC', 'Threat Modeling', 'PenTest', 'Cloud Security', 'LGPD'],
};

type SearchKind = 'job' | 'course';

type SiteConfig = {
  name: string;
  url: string;
  buildUrl: (query: string, location: string) => string;
};

async function main() {
  await mkdir(dataDir, { recursive: true });
  await ensureTemplate(quizFile, buildQuizMarkdown(emptyQuizProfile()));
  await ensureTemplate(profileFile, buildUserProfileMarkdown(emptyUserProfile()));
  await ensureTemplate(jobsFile, 'Vagas Encontradas:\n');
  await ensureTemplate(coursesFile, 'Cursos Encontrados:\n');

  const server = createServer(async (request, response) => {
    try {
      if (!request.url) {
        sendJson(response, 400, { error: 'URL ausente' });
        return;
      }

      const requestUrl = new URL(request.url, `http://${request.headers.host ?? '127.0.0.1'}`);

      if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
        sendJson(response, 200, { ok: true });
        return;
      }

      if (request.method === 'GET' && requestUrl.pathname === '/api/state') {
        const state = await loadState();
        sendJson(response, 200, state);
        return;
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/profile') {
        const body = await readJsonBody(request);
        const profile = parseUserProfile(body.profile ?? body);
        await saveProfile(profile);
        sendJson(response, 200, { ok: true, profile: await loadProfile() });
        return;
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/reset') {
        const profile = emptyUserProfile();
        await saveProfile(profile);
        await writeFile(quizFile, buildQuizMarkdown(emptyQuizProfile()), 'utf8');
        await writeFile(jobsFile, 'Vagas Encontradas:\n', 'utf8');
        await writeFile(coursesFile, 'Cursos Encontrados:\n', 'utf8');
        sendJson(response, 200, { ok: true, profile, jobs: [], courses: [] });
        return;
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/scout') {
        const body = await readJsonBody(request);
        const profile = parseUserProfile(body.profile ?? (await loadProfile()));
        const envelope = await runScoutSearch(profile);
        sendJson(response, 200, envelope);
        return;
      }

      if (request.method === 'POST' && requestUrl.pathname === '/api/curator') {
        const body = await readJsonBody(request);
        const profile = parseUserProfile(body.profile ?? (await loadProfile()));
        const envelope = await runCuratorSearch(profile);
        sendJson(response, 200, envelope);
        return;
      }

      sendJson(response, 404, { error: 'Rota não encontrada' });
    } catch (error) {
      sendJson(response, 500, {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  });

  server.listen(port, () => {
    console.log(`Recoloca IA API listening on http://127.0.0.1:${port}`);
  });
}

async function loadState() {
  const [quiz, profile, jobs, courses] = await Promise.all([
    loadQuiz(),
    loadProfile(),
    readMarkdownResults(jobsFile, 'job'),
    readMarkdownResults(coursesFile, 'course'),
  ]);

  const gaps = deriveSkillGaps(profile, jobs);

  return {
    quiz,
    profile,
    jobs,
    courses,
    gaps,
  };
}

async function loadQuiz(): Promise<QuizProfile> {
  const content = await readText(quizFile, buildQuizMarkdown(emptyQuizProfile()));
  const parsed = parseFieldMarkdown(content);
  return {
    ...emptyQuizProfile(),
    areaInterest: parsed['Área de interesse'] ?? '',
    experienceLevel: parsed['Nível de experiência'] ?? '',
    workPreference: parsed['Preferências de trabalho'] ?? '',
    location: parsed['Localização'] ?? '',
    softSkills: parsed['Soft skills'] ?? '',
    careerGoal: parsed['Objetivo de carreira'] ?? '',
    techSkills: parsed['Habilidades atuais'] ?? '',
    completed: parseBoolean(parsed['Concluído']),
  };
}

async function loadProfile(): Promise<UserProfile> {
  const content = await readText(profileFile, buildUserProfileMarkdown(emptyUserProfile()));
  const parsed = parseFieldMarkdown(content);
  const targetRoles = parsed['Funções alvo'] ? splitCsv(parsed['Funções alvo']) : deriveTargetRoles(parsed['Área de interesse'] ?? '', parsed['Nível de experiência'] ?? '');

  return {
    areaInterest: parsed['Área de interesse'] ?? '',
    experienceLevel: parsed['Nível de experiência'] ?? '',
    workPreference: parsed['Preferências de trabalho'] ?? '',
    location: parsed['Localização'] ?? '',
    softSkills: parsed['Soft skills'] ?? '',
    careerGoal: parsed['Objetivo de carreira'] ?? '',
    techSkills: parsed['Habilidades atuais'] ?? '',
    completed: parseBoolean(parsed['Concluído']),
    targetRoles,
  };
}

async function saveProfile(profile: UserProfile) {
  const quiz: QuizProfile = {
    areaInterest: profile.areaInterest,
    experienceLevel: profile.experienceLevel,
    workPreference: profile.workPreference,
    location: profile.location,
    softSkills: profile.softSkills,
    careerGoal: profile.careerGoal,
    techSkills: profile.techSkills,
    completed: profile.completed,
  };

  await Promise.all([
    writeFile(quizFile, buildQuizMarkdown(quiz), 'utf8'),
    writeFile(profileFile, buildUserProfileMarkdown(profile), 'utf8'),
  ]);
}

async function runScoutSearch(profile: UserProfile): Promise<SearchEnvelope> {
  const query = buildJobQuery(profile);
  const location = profile.location;

  const siteRuns = await Promise.all(jobSites.map(async (site) => searchSite(site, query, location, 'job')));
  const errors = siteRuns.flatMap((run) => run.errors);
  const data = uniqueBy(siteRuns.flatMap((run) => run.items), (item) => `${item.title}::${item.link}`);
  const markdown = buildJobMarkdown(data, errors);
  await writeFile(jobsFile, markdown, 'utf8');

  return {
    status: errors.length && !data.length ? 'error' : 'success',
    summary: data.length
      ? `Scout encontrou ${data.length} vagas distribuídas entre ${jobSites.length} sites.`
      : 'Scout não encontrou vagas estruturadas nesta rodada.',
    data,
    errors,
    markdown,
  };
}

async function runCuratorSearch(profile: UserProfile): Promise<SearchEnvelope> {
  const jobs = await readMarkdownResults(jobsFile, 'job');

  if (!jobs.length) {
    const markdown = 'Cursos Encontrados:\nErros:\n1. Execute primeiro a opção A para gerar vagas e lacunas de habilidades.';
    await writeFile(coursesFile, markdown, 'utf8');
    return {
      status: 'error',
      summary: 'Curator depende de vagas anteriores para identificar lacunas.',
      data: [],
      errors: ['Execute primeiro a busca de vagas para que o Curator possa comparar lacunas de habilidades.'],
      gaps: [],
      markdown,
    };
  }

  const gaps = deriveSkillGaps(profile, jobs);
  const searchGaps = gaps.length ? gaps.slice(0, 5) : fallbackGapSuggestions(profile);
  const searchRuns = await Promise.all(searchGaps.map(async (gap) => searchSite(aluraSite, `curso ${gap}`, '', 'course', gap)));
  const errors = searchRuns.flatMap((run) => run.errors);
  const data = uniqueBy(searchRuns.flatMap((run) => run.items), (item) => `${item.title}::${item.link}`);
  const markdown = buildCourseMarkdown(data, errors);
  await writeFile(coursesFile, markdown, 'utf8');

  return {
    status: errors.length && !data.length ? 'error' : 'success',
    summary: data.length
      ? `Curator identificou ${gaps.length} lacunas e retornou ${data.length} cursos da Alura.`
      : 'Curator não encontrou cursos estruturados nesta rodada.',
    data,
    errors,
    gaps,
    markdown,
  };
}

async function searchSite(
  site: SiteConfig,
  query: string,
  location: string,
  kind: SearchKind,
  relatedSkill = '',
): Promise<{ items: SearchItem[]; errors: string[] }> {
  const errors: string[] = [];

  try {
    const raw = await runFirecrawlSearch(site.url, query, kind);
    const items = parseSearchOutput(raw, site, kind, relatedSkill);
    if (items.length) {
      return { items, errors };
    }
    errors.push(`${site.name}: firecrawl não retornou itens estruturados.`);
  } catch (error) {
    errors.push(`${site.name}: firecrawl falhou - ${readError(error)}`);
  }

  try {
    const searchUrl = site.buildUrl(query, location);
    const response = await fetch(searchUrl, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ao acessar ${site.name}`);
    }

    const raw = await response.text();
    const items = parseSearchOutput(raw, site, kind, relatedSkill);
    if (items.length) {
      errors.push(`${site.name}: fallback via fetch foi usado.`);
      return { items, errors };
    }

    errors.push(`${site.name}: fetch não produziu resultados úteis.`);
  } catch (error) {
    errors.push(`${site.name}: fetch falhou - ${readError(error)}`);
  }

  return { items: [], errors };
}

function parseSearchOutput(raw: string, site: SiteConfig, kind: SearchKind, relatedSkill: string): SearchItem[] {
  const text = raw.trim();
  if (!text) {
    return [];
  }

  const jsonItems = tryParseJsonItems(text);
  if (jsonItems.length) {
    return jsonItems.map((item) => normalizeParsedItem(item, site, kind, relatedSkill)).filter(Boolean) as SearchItem[];
  }

  const htmlItems = extractItemsFromMarkup(text, site, kind, relatedSkill);
  if (htmlItems.length) {
    return htmlItems;
  }

  return extractFallbackSnippet(text, site, kind, relatedSkill);
}

function tryParseJsonItems(raw: string): Record<string, unknown>[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object');
    }

    if (parsed && typeof parsed === 'object') {
      const collection = (parsed as Record<string, unknown>).data
        ?? (parsed as Record<string, unknown>).results
        ?? (parsed as Record<string, unknown>).items
        ?? (parsed as Record<string, unknown>).content;
      if (Array.isArray(collection)) {
        return collection.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object');
      }
    }
  } catch {
    return [];
  }

  return [];
}

function normalizeParsedItem(item: Record<string, unknown>, site: SiteConfig, kind: SearchKind, relatedSkill: string): SearchItem | null {
  const url = readString(item.url) || readString(item.link) || readString(item.sourceURL) || readString(item.sourceUrl) || site.url;
  const title = readString(item.title) || readString(item.name) || readString(item.heading) || site.name;
  const description = compactText(
    readString(item.description)
    || readString(item.snippet)
    || readString(item.summary)
    || readString(item.content)
    || readString(item.markdown)
    || '',
  );

  return makeSearchItem({
    title,
    company: kind === 'job' ? readString(item.company) || site.name : 'Alura',
    location: readString(item.location) || extractLocation(description),
    link: url,
    description: description || `${site.name} · ${title}`,
    relatedSkill: relatedSkill || inferSkillFromText(`${title} ${description}`, site.name),
    source: site.name,
    platform: kind === 'course' ? 'Alura' : undefined,
    hours: kind === 'course' ? extractHours(description) : undefined,
    instructor: kind === 'course' ? extractInstructor(description) : undefined,
    skills: inferSkillsFromText(`${title} ${description}`, relatedSkill),
  });
}

function extractItemsFromMarkup(raw: string, site: SiteConfig, kind: SearchKind, relatedSkill: string): SearchItem[] {
  const cleaned = raw
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');

  const links = new Map<string, string>();

  for (const match of cleaned.matchAll(/\[([^\]]{2,})\]\((https?:\/\/[^)]+)\)/g)) {
    links.set(match[2], stripTags(match[1]));
  }

  for (const match of cleaned.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = resolveUrl(match[1], site.url);
    const text = stripTags(match[2]);
    if (text && !links.has(href)) {
      links.set(href, text);
    }
  }

  const plainText = compactText(stripTags(cleaned));
  const snippets = Array.from(links.entries())
    .filter(([href, title]) => title.length > 2 && !isIgnoredLink(href))
    .slice(0, 10)
    .map(([href, title]) => {
      const description = snippetAround(plainText, title) || plainText.slice(0, 180) || `${site.name} · ${title}`;
      return makeSearchItem({
        title,
        company: kind === 'job' ? site.name : 'Alura',
        location: extractLocation(description),
        link: href,
        description,
        relatedSkill: relatedSkill || inferSkillFromText(`${title} ${description}`, site.name),
        source: site.name,
        platform: kind === 'course' ? 'Alura' : undefined,
        hours: kind === 'course' ? extractHours(description) : undefined,
        instructor: kind === 'course' ? extractInstructor(description) : undefined,
        skills: inferSkillsFromText(`${title} ${description}`, relatedSkill),
      });
    });

  return snippets;
}

function extractFallbackSnippet(raw: string, site: SiteConfig, kind: SearchKind, relatedSkill: string): SearchItem[] {
  const lines = compactText(raw)
    .split(/\r?\n/)
    .map((line) => compactText(line))
    .filter((line) => line.length > 0)
    .filter((line) => !/^cookie|privacidade|aceitar|cadastre-se/i.test(line))
    .slice(0, 8);

  if (!lines.length) {
    return [];
  }

  const title = lines[0];
  const description = lines.slice(1, 4).join(' ');
  return [
    makeSearchItem({
      title,
      company: kind === 'job' ? site.name : 'Alura',
      location: extractLocation(description),
      link: site.url,
      description: description || `${site.name} · ${title}`,
      relatedSkill: relatedSkill || inferSkillFromText(`${title} ${description}`, site.name),
      source: site.name,
      platform: kind === 'course' ? 'Alura' : undefined,
      hours: kind === 'course' ? extractHours(description) : undefined,
      instructor: kind === 'course' ? extractInstructor(description) : undefined,
      skills: inferSkillsFromText(`${title} ${description}`, relatedSkill),
    }),
  ];
}

function makeSearchItem(input: SearchItem): SearchItem {
  return {
    ...input,
    title: compactText(input.title),
    company: compactText(input.company) || 'Não identificado',
    location: compactText(input.location) || 'Não identificado',
    link: input.link,
    description: compactText(input.description) || 'Sem descrição disponível',
    relatedSkill: compactText(input.relatedSkill) || 'Não identificado',
    source: compactText(input.source) || 'Não identificado',
    platform: input.platform,
    hours: input.hours ? compactText(input.hours) : undefined,
    instructor: input.instructor ? compactText(input.instructor) : undefined,
    skills: input.skills?.map((skill) => compactText(skill)).filter(Boolean),
  };
}

async function runFirecrawlSearch(siteUrl: string, query: string, kind: SearchKind): Promise<string> {
  const args = ['search', '--query', query, '--site', siteUrl];
  if (kind === 'course') {
    args.push('--focus', 'courses');
  }

  const result = await executeCommand('firecrawl', args);
  return result.stdout || result.stderr || '';
}

function executeCommand(command: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      shell: true,
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(stderr.trim() || `Processo ${command} finalizou com código ${code}`));
    });
  });
}

function buildJobQuery(profile: UserProfile): string {
  const parts = [
    profile.areaInterest,
    profile.experienceLevel,
    profile.location,
    profile.workPreference,
    ...profile.targetRoles.slice(0, 2),
  ];

  return compactText(parts.filter(Boolean).join(' ')) || 'vagas tecnologia';
}

function deriveSkillGaps(profile: UserProfile, jobs: SearchItem[]): string[] {
  const currentSkills = new Set(splitCsv(profile.techSkills).map(normalizeToken));
  const discovered = new Set<string>();

  for (const job of jobs) {
    for (const skill of job.skills ?? []) {
      const normalized = normalizeToken(skill);
      if (normalized && !currentSkills.has(normalized)) {
        discovered.add(skill);
      }
    }
  }

  if (!discovered.size) {
    const fallback = fallbackGapSuggestions(profile);
    fallback.forEach((skill) => discovered.add(skill));
  }

  return Array.from(discovered);
}

function fallbackGapSuggestions(profile: Pick<UserProfile, 'areaInterest' | 'experienceLevel'>): string[] {
  const options = areaExperienceRoleMap[profile.areaInterest]?.[profile.experienceLevel] ?? [];
  const lexicon = skillLexiconByArea[profile.areaInterest] ?? ['Comunicação', 'Aprendizado Contínuo', 'Pensamento Analítico'];
  return [...new Set([...options.slice(0, 2), ...lexicon.slice(0, 4)])].slice(0, 6);
}

async function readMarkdownResults(filePath: string, kind: SearchKind): Promise<SearchItem[]> {
  const content = await readText(filePath, kind === 'job' ? 'Vagas Encontradas:\n' : 'Cursos Encontrados:\n');
  return parseStoredResults(content, kind);
}

function parseStoredResults(content: string, kind: SearchKind): SearchItem[] {
  const lines = content.split(/\r?\n/);
  const items: SearchItem[] = [];
  let current: Partial<SearchItem> | null = null;

  for (const line of lines) {
    const numbered = line.match(/^\s*\d+\.\s*T[íi]tulo:\s*(.+)$/i);
    if (numbered) {
      if (current) {
        pushStoredItem(current, items);
      }
      current = {
        title: numbered[1].trim(),
      };
      continue;
    }

    if (!current) {
      continue;
    }

    const field = line.match(/^\s*([^:]+):\s*(.*)$/);
    if (!field) {
      continue;
    }

    const key = normalizeToken(field[1]);
    const value = field[2].trim();

    if (kind === 'job') {
      if (key.startsWith('empresa')) current.company = value;
      else if (key.startsWith('localização')) current.location = value;
      else if (key.startsWith('link')) current.link = value;
      else if (key.startsWith('descrição')) current.description = value;
      else if (key.startsWith('habilidade')) current.relatedSkill = value;
      else if (key.startsWith('fonte')) current.source = value;
      else if (key.startsWith('skills')) current.skills = splitCsv(value);
    } else {
      if (key.startsWith('plataforma')) current.platform = value;
      else if (key.startsWith('carga')) current.hours = value;
      else if (key.startsWith('instrutor')) current.instructor = value;
      else if (key.startsWith('link')) current.link = value;
      else if (key.startsWith('descrição')) current.description = value;
      else if (key.startsWith('habilidade')) current.relatedSkill = value;
      else if (key.startsWith('fonte')) current.source = value;
      else if (key.startsWith('skills')) current.skills = splitCsv(value);
      else if (key.startsWith('empresa')) current.company = value;
    }
  }

  if (current) {
    pushStoredItem(current, items);
  }

  return items.filter((item) => item.title && item.link);
}

function pushStoredItem(source: Partial<SearchItem>, items: SearchItem[]) {
  items.push(makeSearchItem({
    title: source.title ?? 'Item sem título',
    company: source.company ?? source.platform ?? 'Não identificado',
    location: source.location ?? 'Não identificado',
    link: source.link ?? '',
    description: source.description ?? 'Sem descrição disponível',
    relatedSkill: source.relatedSkill ?? 'Não identificado',
    source: source.source ?? source.platform ?? 'Não identificado',
    platform: source.platform,
    hours: source.hours,
    instructor: source.instructor,
    skills: source.skills,
  }));
}

function buildQuizMarkdown(profile: QuizProfile): string {
  return [
    `Área de interesse: ${profile.areaInterest}`,
    `Nível de experiência: ${profile.experienceLevel}`,
    `Preferências de trabalho: ${profile.workPreference}`,
    `Localização: ${profile.location}`,
    `Soft skills: ${profile.softSkills}`,
    `Objetivo de carreira: ${profile.careerGoal}`,
    `Habilidades atuais: ${profile.techSkills}`,
    `Concluído: ${String(profile.completed)}`,
  ].join('\n');
}

function buildUserProfileMarkdown(profile: UserProfile): string {
  return [
    `Área de interesse: ${profile.areaInterest}`,
    `Nível de experiência: ${profile.experienceLevel}`,
    `Preferências de trabalho: ${profile.workPreference}`,
    `Localização: ${profile.location}`,
    `Soft skills: ${profile.softSkills}`,
    `Objetivo de carreira: ${profile.careerGoal}`,
    `Habilidades atuais: ${profile.techSkills}`,
    `Funções alvo: ${profile.targetRoles.join(', ')}`,
    `Concluído: ${String(profile.completed)}`,
  ].join('\n');
}

function buildJobMarkdown(items: SearchItem[], errors: string[]): string {
  const lines: string[] = ['Vagas Encontradas:'];

  if (!items.length) {
    lines.push('');
    lines.push('Nenhuma vaga estruturada encontrada.');
  }

  items.forEach((item, index) => {
    lines.push(`${index + 1}. Título: ${item.title}`);
    lines.push(`   Empresa: ${item.company}`);
    lines.push(`   Localização: ${item.location}`);
    lines.push(`   Link: ${item.link}`);
    lines.push(`   Descrição: ${item.description}`);
    lines.push(`   Habilidade Relacionada: ${item.relatedSkill}`);
    lines.push(`   Fonte: ${item.source}`);
    if (item.skills?.length) {
      lines.push(`   Skills: ${item.skills.join(', ')}`);
    }
  });

  if (errors.length) {
    lines.push('');
    lines.push('Erros:');
    errors.forEach((error, index) => {
      lines.push(`${index + 1}. ${error}`);
    });
  }

  return lines.join('\n');
}

function buildCourseMarkdown(items: SearchItem[], errors: string[]): string {
  const lines: string[] = ['Cursos Encontrados:'];

  if (!items.length) {
    lines.push('');
    lines.push('Nenhum curso estruturado encontrado.');
  }

  items.forEach((item, index) => {
    lines.push(`${index + 1}. Título: ${item.title}`);
    lines.push(`   Plataforma: ${item.platform ?? 'Alura'}`);
    lines.push(`   Carga Horária: ${item.hours ?? 'Não identificado'}`);
    lines.push(`   Instrutor: ${item.instructor ?? 'Não identificado'}`);
    lines.push(`   Link: ${item.link}`);
    lines.push(`   Descrição: ${item.description}`);
    lines.push(`   Habilidade Relacionada: ${item.relatedSkill}`);
    lines.push(`   Fonte: ${item.source}`);
    if (item.skills?.length) {
      lines.push(`   Skills: ${item.skills.join(', ')}`);
    }
  });

  if (errors.length) {
    lines.push('');
    lines.push('Erros:');
    errors.forEach((error, index) => {
      lines.push(`${index + 1}. ${error}`);
    });
  }

  return lines.join('\n');
}

function parseFieldMarkdown(content: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (match) {
      fields[match[1].trim()] = match[2].trim();
    }
  }
  return fields;
}

function parseUserProfile(input: unknown): UserProfile {
  const source = isRecord(input) ? input : {};
  const areaInterest = normalizeOption(source.areaInterest ?? source['Área de interesse']);
  const experienceLevel = normalizeOption(source.experienceLevel ?? source['Nível de experiência']);
  const workPreference = normalizeOption(source.workPreference ?? source['Preferências de trabalho']);
  const location = compactText(readString(source.location ?? source['Localização']));
  const softSkills = compactText(readString(source.softSkills ?? source['Soft skills']));
  const careerGoal = compactText(readString(source.careerGoal ?? source['Objetivo de carreira']));
  const techSkills = compactText(readString(source.techSkills ?? source['Habilidades atuais']));
  const completed = parseBoolean(readString(source.completed ?? source['Concluído']));

  return {
    areaInterest,
    experienceLevel,
    workPreference,
    location,
    softSkills,
    careerGoal,
    techSkills,
    completed,
    targetRoles: deriveTargetRoles(areaInterest, experienceLevel),
  };
}

function inferSkillsFromText(text: string, relatedSkill = ''): string[] {
  const normalized = text.toLowerCase();
  const candidates = new Set<string>();

  if (relatedSkill) {
    candidates.add(relatedSkill);
  }

  for (const skills of Object.values(skillLexiconByArea)) {
    for (const skill of skills) {
      if (normalized.includes(skill.toLowerCase())) {
        candidates.add(skill);
      }
    }
  }

  return Array.from(candidates).slice(0, 5);
}

function inferSkillFromText(text: string, source: string): string {
  const normalized = text.toLowerCase();
  for (const skills of Object.values(skillLexiconByArea)) {
    for (const skill of skills) {
      if (normalized.includes(skill.toLowerCase())) {
        return skill;
      }
    }
  }

  return source;
}

function extractLocation(text: string): string {
  const match = text.match(/(?:localiza[cç][aã]o|cidade|vaga|presencial|remoto|h[ií]brido)[:\s-]*([^\n,;.]{3,50})/i);
  return match?.[1]?.trim() || 'Não identificado';
}

function extractHours(text: string): string {
  const match = text.match(/(?:carga hor[aá]ria|dura[cç][aã]o|tempo)[:\s-]*([^\n,;.]{2,40})/i);
  return match?.[1]?.trim() || 'Não identificado';
}

function extractInstructor(text: string): string {
  const match = text.match(/(?:instrutor|professor|teacher)[:\s-]*([^\n,;.]{2,60})/i);
  return match?.[1]?.trim() || 'Não identificado';
}

function resolveUrl(link: string, baseUrl: string): string {
  try {
    return new URL(link, baseUrl).toString();
  } catch {
    return link;
  }
}

function isIgnoredLink(link: string): boolean {
  return link.startsWith('#') || link.startsWith('javascript:') || link.includes('cookie');
}

function stripTags(value: string): string {
  return compactText(value.replace(/<[^>]+>/g, ' '));
}

function snippetAround(text: string, needle: string): string {
  const index = text.toLowerCase().indexOf(needle.toLowerCase());
  if (index === -1) {
    return '';
  }
  return compactText(text.slice(Math.max(0, index - 40), Math.min(text.length, index + needle.length + 140)));
}

function compactText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function readString(value: unknown): string {
  return typeof value === 'string' ? compactText(value) : '';
}

function parseBoolean(value: string | undefined): boolean {
  return (value ?? '').trim().toLowerCase() === 'true';
}

function uniqueBy<T>(items: T[], selector: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = selector(item);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function ensureTemplate(filePath: string, defaultContent: string) {
  try {
    const content = await readFile(filePath, 'utf8');
    if (!content.trim()) {
      await writeFile(filePath, defaultContent, 'utf8');
    }
  } catch {
    await writeFile(filePath, defaultContent, 'utf8');
  }
}

async function readText(filePath: string, fallbackContent: string): Promise<string> {
  try {
    const content = await readFile(filePath, 'utf8');
    if (content.trim()) {
      return content;
    }
    await writeFile(filePath, fallbackContent, 'utf8');
    return fallbackContent;
  } catch {
    await writeFile(filePath, fallbackContent, 'utf8');
    return fallbackContent;
  }
}

async function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) {
    return {};
  }

  return JSON.parse(raw) as Record<string, unknown>;
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown) {
  response.statusCode = statusCode;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeOption(value: unknown): string {
  return toTitleCase(readString(value));
}

function readError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
