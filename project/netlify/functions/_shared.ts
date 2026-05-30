import {
  deriveSkillGaps,
  deriveTargetRoles,
  normalizeToken,
  splitCsv,
  toTitleCase,
  type SearchEnvelope,
  type SearchItem,
  type UserProfile,
  skillLexiconByArea,
} from '../../shared/types.js';

type FirecrawlSearchResult = {
  title?: string;
  description?: string;
  url?: string;
  markdown?: string;
  metadata?: {
    title?: string;
    description?: string;
    sourceURL?: string;
    url?: string;
  };
};

type FirecrawlSearchResponse = {
  success?: boolean;
  warning?: string | null;
  data?: {
    web?: FirecrawlSearchResult[];
  };
};

type SiteConfig = {
  name: string;
  domains: string[];
};

const firecrawlEndpoint = 'https://api.firecrawl.dev/v2/search';
const firecrawlTimeoutMs = 25000;
const requestTimeoutMs = 30000;

const jobSites: SiteConfig[] = [
  { name: 'InfoJobs', domains: ['infojobs.com.br'] },
  { name: 'Vagas.com', domains: ['vagas.com.br'] },
  { name: 'Indeed', domains: ['br.indeed.com', 'indeed.com'] },
];

const aluraSite: SiteConfig = {
  name: 'Alura',
  domains: ['alura.com.br'],
};

const allSkills = Object.values(skillLexiconByArea).flat();

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function normalizeList(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const token = normalizeToken(value);
    if (!token || seen.has(token)) {
      continue;
    }

    seen.add(token);
    result.push(value.trim());
  }

  return result;
}

function readSnippet(text?: string) {
  if (!text) {
    return '';
  }

  return text
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240);
}

function extractMatchedSkills(text: string, limit = 5): string[] {
  const normalizedText = normalizeToken(text);
  const matches = allSkills
    .filter((skill) => normalizedText.includes(normalizeToken(skill)))
    .sort((left, right) => right.length - left.length);

  return normalizeList(matches).slice(0, limit);
}

function extractHours(text: string): string | undefined {
  const match = text.match(/(\d{1,3})\s*(?:h|horas?)/i);
  if (!match) {
    return undefined;
  }

  return `${match[1]}h`;
}

function extractCompanyName(result: FirecrawlSearchResult, fallback: string): string {
  const title = result.title ?? result.metadata?.title ?? '';
  const titleParts = title.split(/\s[-|]\s/).map((part) => part.trim()).filter(Boolean);

  if (titleParts.length > 1) {
    return titleParts[titleParts.length - 1] || fallback;
  }

  const description = result.description ?? result.metadata?.description ?? '';
  const companyMatch = description.match(/(?:empresa|company|contratante)[:\s]+([^.;|\n]+)/i);
  if (companyMatch?.[1]) {
    return companyMatch[1].trim();
  }

  return fallback;
}

function extractLocationLabel(text: string, fallback: string): string {
  const remoteMatch = text.match(/(remoto|home office|híbrido|hibrido|presencial)/i);
  if (remoteMatch?.[1]) {
    return toTitleCase(remoteMatch[1]);
  }

  return fallback;
}

function uniqueResults(items: SearchItem[]): SearchItem[] {
  const seen = new Set<string>();
  const result: SearchItem[] = [];

  for (const item of items) {
    const key = normalizeToken(item.link || `${item.title}-${item.company}`);
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}

async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();

  if (!text.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Body must be a JSON object');
    }

    return parsed as Record<string, unknown>;
  } catch (error) {
    throw new Error(error instanceof Error ? `Invalid JSON payload: ${error.message}` : 'Invalid JSON payload');
  }
}

function ensureApiKey() {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    throw new Error('FIRECRAWL_API_KEY is not configured');
  }

  return apiKey;
}

async function firecrawlSearch(query: string, includeDomains: string[], label: string): Promise<FirecrawlSearchResult[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), firecrawlTimeoutMs);
  const apiKey = ensureApiKey();

  try {
    console.info(`[${label}] Firecrawl search`, { query, includeDomains });

    const response = await fetch(firecrawlEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 5,
        includeDomains,
        timeout: requestTimeoutMs,
      }),
      signal: controller.signal,
    });

    const payload = (await response.json()) as FirecrawlSearchResponse;

    if (!response.ok || payload.success === false) {
      throw new Error(`Firecrawl search failed with ${response.status}`);
    }

    if (payload.warning) {
      console.info(`[${label}] Firecrawl warning`, payload.warning);
    }

    return Array.isArray(payload.data?.web) ? payload.data.web : [];
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Firecrawl timeout after ${firecrawlTimeoutMs}ms`);
    }

    throw error instanceof Error ? error : new Error('Unexpected Firecrawl failure');
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildJobQuery(profile: UserProfile): string {
  const targetRoles = profile.targetRoles.length ? profile.targetRoles : deriveTargetRoles(profile.areaInterest, profile.experienceLevel);
  return normalizeList([
    ...targetRoles,
    profile.areaInterest,
    profile.experienceLevel,
    profile.workPreference,
    profile.location,
    ...splitCsv(profile.techSkills),
  ]).join(' ');
}

function buildJobItem(result: FirecrawlSearchResult, site: SiteConfig, profile: UserProfile): SearchItem | null {
  const url = result.url ?? result.metadata?.url ?? result.metadata?.sourceURL;
  if (!url) {
    return null;
  }

  const title = result.title ?? result.metadata?.title ?? site.name;
  const description = readSnippet(result.description ?? result.metadata?.description ?? result.markdown);
  const skillMatches = extractMatchedSkills([title, description].join(' '));
  const relatedSkill = skillMatches[0] ?? profile.targetRoles[0] ?? (profile.areaInterest || site.name);
  const company = extractCompanyName(result, site.name);
  const location = extractLocationLabel([title, description].join(' '), profile.location || 'Brasil');

  return {
    title,
    company,
    location,
    link: url,
    description: description || `Vaga encontrada via ${site.name}.`,
    relatedSkill,
    source: site.name,
    skills: skillMatches.length ? skillMatches : undefined,
    hours: extractHours([title, description].join(' ')),
  };
}

function buildCourseQueries(profile: UserProfile, jobs: SearchItem[]): string[] {
  const gaps = deriveSkillGaps(profile, jobs);
  const queries = normalizeList([
    ...gaps.slice(0, 4).map((gap) => `${gap} curso`),
    `${profile.areaInterest} curso`,
    `${profile.experienceLevel} curso`,
  ]);

  if (queries.length) {
    return queries;
  }

  return normalizeList([
    `${profile.areaInterest} trilha Alura`,
    `${profile.targetRoles[0] || profile.experienceLevel} curso`,
  ]);
}

function buildCourseItem(result: FirecrawlSearchResult, profile: UserProfile, fallbackSkill: string): SearchItem | null {
  const url = result.url ?? result.metadata?.url ?? result.metadata?.sourceURL;
  if (!url) {
    return null;
  }

  const title = result.title ?? result.metadata?.title ?? 'Curso Alura';
  const description = readSnippet(result.description ?? result.metadata?.description ?? result.markdown);
  const skillMatches = extractMatchedSkills([title, description].join(' '));
  const relatedSkill = skillMatches[0] ?? (fallbackSkill || profile.areaInterest || 'Alura');

  return {
    title,
    company: 'Alura',
    location: 'Online',
    link: url,
    description: description || 'Curso encontrado via Alura.',
    relatedSkill,
    source: 'Alura',
    platform: 'Alura',
    hours: extractHours([title, description].join(' ')),
    instructor: 'Equipe Alura',
    skills: skillMatches.length ? skillMatches : undefined,
  };
}

function toEnvelope(kind: 'Scout' | 'Curator', items: SearchItem[], errors: string[], gaps: string[]): SearchEnvelope {
  const summary = items.length
    ? kind === 'Scout'
      ? `Scout encontrou ${items.length} vagas em InfoJobs, Vagas.com e Indeed.`
      : `Curator encontrou ${items.length} cursos na Alura.`
    : kind === 'Scout'
      ? 'Scout não encontrou vagas estruturadas nesta rodada.'
      : 'Curator não encontrou cursos estruturados nesta rodada.';

  const markdown = [
    `# ${kind === 'Scout' ? 'Vagas Encontradas' : 'Cursos Encontrados'}`,
    '',
    ...items.map((item, index) => `- ${index + 1}. ${item.title} | ${item.company} | ${item.location} | ${item.link}`),
    ...errors.length ? ['', '## Erros', ...errors.map((error) => `- ${error}`)] : [],
  ].join('\n');

  return {
    status: items.length ? 'success' : 'error',
    summary,
    data: items,
    errors,
    gaps,
    markdown,
  };
}

export async function runScoutSearch(profile: UserProfile): Promise<SearchEnvelope> {
  const jobQuery = buildJobQuery(profile);
  const requests = jobSites.map(async (site) => {
    const results = await firecrawlSearch(jobQuery, site.domains, `Scout:${site.name}`);
    return results.map((result) => buildJobItem(result, site, profile)).filter((item): item is SearchItem => Boolean(item));
  });

  const data = uniqueResults((await Promise.all(requests)).flat());
  const gaps = deriveSkillGaps(profile, data);
  console.info('[Scout] Completed', { results: data.length, gaps: gaps.length });
  return toEnvelope('Scout', data, [], gaps);
}

export async function runCuratorSearch(profile: UserProfile, jobs: SearchItem[]): Promise<SearchEnvelope> {
  const queries = buildCourseQueries(profile, jobs);
  const requests = queries.map(async (query) => {
    const results = await firecrawlSearch(query, aluraSite.domains, 'Curator:Alura');
    const fallbackSkill = query.replace(/\s+curso$/i, '').trim() || profile.areaInterest || 'Alura';
    return results.map((result) => buildCourseItem(result, profile, fallbackSkill)).filter((item): item is SearchItem => Boolean(item));
  });

  const data = uniqueResults((await Promise.all(requests)).flat());
  const gaps = deriveSkillGaps(profile, jobs.length ? jobs : data);
  console.info('[Curator] Completed', { results: data.length, gaps: gaps.length });
  return toEnvelope('Curator', data, [], gaps);
}

export async function readJsonRequestBody(request: Request): Promise<Record<string, unknown>> {
  return readJsonBody(request);
}