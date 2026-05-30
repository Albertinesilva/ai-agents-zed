import type { SearchItem, UserProfile } from '../../shared/types.js';
import { readJsonRequestBody, runCuratorSearch } from './_shared.js';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function parseProfile(body: Record<string, unknown>): UserProfile {
  const input = (body.profile ?? body) as Partial<UserProfile>;

  return {
    areaInterest: typeof input.areaInterest === 'string' ? input.areaInterest : '',
    experienceLevel: typeof input.experienceLevel === 'string' ? input.experienceLevel : '',
    workPreference: typeof input.workPreference === 'string' ? input.workPreference : '',
    location: typeof input.location === 'string' ? input.location : '',
    softSkills: typeof input.softSkills === 'string' ? input.softSkills : '',
    careerGoal: typeof input.careerGoal === 'string' ? input.careerGoal : '',
    techSkills: typeof input.techSkills === 'string' ? input.techSkills : '',
    completed: Boolean(input.completed),
    targetRoles: Array.isArray(input.targetRoles) ? input.targetRoles.filter((item): item is string => typeof item === 'string') : [],
  };
}

function parseJobs(body: Record<string, unknown>): SearchItem[] {
  const jobs = Array.isArray(body.jobs) ? body.jobs : [];

  return jobs.filter((item): item is SearchItem => Boolean(item && typeof item === 'object')) as SearchItem[];
}

export default async function handler(request: Request): Promise<Response> {
  const startedAt = Date.now();

  try {
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const body = await readJsonRequestBody(request);
    const profile = parseProfile(body);
    const jobs = parseJobs(body);
    console.info('[Curator] Request received', { areaInterest: profile.areaInterest, experienceLevel: profile.experienceLevel, jobs: jobs.length });

    if (!profile.areaInterest || !profile.experienceLevel) {
      return jsonResponse({ error: 'Profile must include areaInterest and experienceLevel' }, 400);
    }

    const envelope = await runCuratorSearch(profile, jobs);
    console.info('[Curator] Request finished', { durationMs: Date.now() - startedAt, results: envelope.data.length });
    return jsonResponse(envelope);
  } catch (error) {
    console.error('[Curator] Failed', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unexpected curator failure' }, 500);
  }
}