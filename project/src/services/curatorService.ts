import type { SearchEnvelope, SearchItem, UserProfile } from '../../shared/types';
import { normalizeSearchEnvelope, postJson } from './httpClient';

const curatorEndpoint = '/.netlify/functions/curator';

export async function searchCourses(profile: UserProfile, jobs: SearchItem[]): Promise<SearchEnvelope> {
  const payload = await postJson<unknown>(curatorEndpoint, { profile, jobs });
  return normalizeSearchEnvelope(payload, 'Curator');
}