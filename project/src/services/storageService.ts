import { deriveTargetRoles, emptyQuizProfile, emptyUserProfile, type QuizProfile, type SearchItem, type UserProfile } from '../../shared/types';

const storageKeys = {
  profile: 'recoloca-profile',
  quiz: 'recoloca-quiz',
  jobs: 'recoloca-jobs',
  courses: 'recoloca-courses',
} as const;

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJson<T>(key: string): T | null {
  if (!hasStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeQuiz(value: Partial<QuizProfile> | null): QuizProfile {
  return {
    ...emptyQuizProfile(),
    ...(value ?? {}),
    completed: Boolean(value?.completed),
  };
}

function normalizeProfile(value: Partial<UserProfile> | null): UserProfile {
  const quiz = normalizeQuiz(value);
  const targetRoles = Array.isArray(value?.targetRoles) && value?.targetRoles.length
    ? value.targetRoles
    : deriveTargetRoles(quiz.areaInterest, quiz.experienceLevel);

  return {
    ...emptyUserProfile(),
    ...quiz,
    ...(value ?? {}),
    targetRoles,
  };
}

function normalizeItems(value: unknown): SearchItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is SearchItem => {
    if (!item || typeof item !== 'object') {
      return false;
    }

    const candidate = item as Partial<SearchItem>;

    return Boolean(
      typeof candidate.title === 'string' &&
      typeof candidate.company === 'string' &&
      typeof candidate.location === 'string' &&
      typeof candidate.link === 'string' &&
      typeof candidate.description === 'string' &&
      typeof candidate.relatedSkill === 'string' &&
      typeof candidate.source === 'string',
    );
  });
}

export function saveQuiz(quiz: QuizProfile) {
  writeJson(storageKeys.quiz, normalizeQuiz(quiz));
}

export function loadQuiz(): QuizProfile {
  const storedQuiz = readJson<Partial<QuizProfile>>(storageKeys.quiz);
  if (storedQuiz) {
    return normalizeQuiz(storedQuiz);
  }

  const storedProfile = readJson<Partial<UserProfile>>(storageKeys.profile);
  return normalizeQuiz(storedProfile);
}

export function saveProfile(profile: UserProfile) {
  const nextProfile = normalizeProfile(profile);
  writeJson(storageKeys.profile, nextProfile);
  writeJson(storageKeys.quiz, normalizeQuiz(nextProfile));
}

export function loadProfile(): UserProfile {
  const storedProfile = readJson<Partial<UserProfile>>(storageKeys.profile);
  if (storedProfile) {
    return normalizeProfile(storedProfile);
  }

  return normalizeProfile(loadQuiz());
}

export function saveJobs(jobs: SearchItem[]) {
  writeJson(storageKeys.jobs, jobs);
}

export function loadJobs(): SearchItem[] {
  return normalizeItems(readJson<unknown>(storageKeys.jobs));
}

export function saveCourses(courses: SearchItem[]) {
  writeJson(storageKeys.courses, courses);
}

export function loadCourses(): SearchItem[] {
  return normalizeItems(readJson<unknown>(storageKeys.courses));
}

export function clearApplicationData() {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.removeItem(storageKeys.profile);
  window.localStorage.removeItem(storageKeys.quiz);
  window.localStorage.removeItem(storageKeys.jobs);
  window.localStorage.removeItem(storageKeys.courses);
}