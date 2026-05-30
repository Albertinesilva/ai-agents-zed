import type { UserProfile } from '../../shared/types.js';
import { readJsonRequestBody, runScoutSearch } from './_shared.js';

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

export default async function handler(request: Request): Promise<Response> {
  const startedAt = Date.now();

  try {
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const body = await readJsonRequestBody(request);
    const profile = parseProfile(body);
    console.info('[Scout] Request received', { areaInterest: profile.areaInterest, experienceLevel: profile.experienceLevel, location: profile.location });

    if (!profile.areaInterest || !profile.experienceLevel) {
      return jsonResponse({ error: 'Profile must include areaInterest and experienceLevel' }, 400);
    }

    const envelope = await runScoutSearch(profile);
    console.info('[Scout] Request finished', { durationMs: Date.now() - startedAt, results: envelope.data.length });
    return jsonResponse(envelope);
  } catch (error) {
    console.error('[Scout] Failed', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unexpected scout failure' }, 500);
  }
}