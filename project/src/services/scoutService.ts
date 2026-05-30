import type { SearchEnvelope, UserProfile } from '../../shared/types';
import { normalizeSearchEnvelope, postJson } from './httpClient';

const scoutEndpoint = '/.netlify/functions/scout';

export async function searchJobs(profile: UserProfile): Promise<SearchEnvelope> {
  const payload = await postJson<unknown>(scoutEndpoint, { profile });
  return normalizeSearchEnvelope(payload, 'Scout');
}