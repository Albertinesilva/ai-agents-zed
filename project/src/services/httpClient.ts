import type { SearchEnvelope, SearchItem } from '../../shared/types';

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text.trim()) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function extractErrorMessage(payload: unknown, status: number, url: string) {
  if (payload && typeof payload === 'object' && 'error' in payload && isString((payload as { error?: unknown }).error)) {
    return (payload as { error: string }).error;
  }

  return `Request failed with ${status} for ${url}`;
}

export async function postJson<TResponse>(url: string, body: unknown, timeoutMs = 30000): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const payload = await readJsonResponse(response);

    if (!response.ok) {
      throw new Error(extractErrorMessage(payload, response.status, url));
    }

    if (payload === undefined) {
      throw new Error(`Empty response from ${url}`);
    }

    return payload as TResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Timeout while calling ${url}`);
    }

    throw error instanceof Error ? error : new Error(`Unexpected request failure for ${url}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

export function isSearchItem(value: unknown): value is SearchItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<SearchItem>;

  return Boolean(
    isString(item.title) &&
    isString(item.company) &&
    isString(item.location) &&
    isString(item.link) &&
    isString(item.description) &&
    isString(item.relatedSkill) &&
    isString(item.source),
  );
}

export function normalizeSearchEnvelope(payload: unknown, sourceLabel: string): SearchEnvelope {
  if (!payload || typeof payload !== 'object') {
    throw new Error(`${sourceLabel} returned an invalid payload`);
  }

  const envelope = payload as Partial<SearchEnvelope> & {
    data?: unknown;
    errors?: unknown;
    gaps?: unknown;
  };

  const data = Array.isArray(envelope.data) ? envelope.data.filter(isSearchItem) : [];
  const errors = Array.isArray(envelope.errors) ? envelope.errors.filter(isString) : [];
  const gaps = Array.isArray(envelope.gaps) ? envelope.gaps.filter(isString) : undefined;

  const summary = isString(envelope.summary)
    ? envelope.summary
    : `${sourceLabel} completed without a summary.`;

  const markdown = isString(envelope.markdown) ? envelope.markdown : '';
  const status = data.length ? 'success' : 'error';

  return {
    status,
    summary,
    data,
    errors,
    markdown,
    ...(gaps?.length ? { gaps } : {}),
  };
}