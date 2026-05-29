import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import type { QuizProfile, SearchEnvelope, UserProfile } from '../shared/types';
import { deriveTargetRoles, emptyQuizProfile, emptyUserProfile } from '../shared/types';
import { CoachPage } from './pages/CoachPage';
import { CoursesPage } from './pages/CoursesPage';
import { HomePage } from './pages/HomePage';
import { JobsPage } from './pages/JobsPage';
import { QuizPage } from './pages/QuizPage';
import {
  type Activity,
  type AppPageKey,
  type AppState,
  type CoachStep,
  type MenuKey,
  type PersistedUiState,
  appPages,
  buildDispatchPreview,
  demoPreset,
  getSelectedMeta,
  menuEntries,
  storageKeys,
} from './lib/recoloca';

const defaultUiState: PersistedUiState = {
  page: 'home',
  selectedMenu: 'A',
  lastAction: 'Aguardando entrada do quiz',
  coachStep: 0,
  coachResponses: demoPreset.coachResponses,
  mode: 'normal',
  demoLoaded: false,
};

const emptyState: AppState = {
  quiz: emptyQuizProfile(),
  profile: emptyUserProfile(),
  jobs: [],
  courses: [],
  gaps: [],
};

function readUiState(): PersistedUiState {
  if (typeof window === 'undefined') {
    return defaultUiState;
  }

  try {
    const raw = window.localStorage.getItem(storageKeys.ui);
    if (!raw) {
      return defaultUiState;
    }

    const parsed = JSON.parse(raw) as Partial<PersistedUiState>;
    return {
      ...defaultUiState,
      ...parsed,
      coachResponses: {
        ...defaultUiState.coachResponses,
        ...(parsed.coachResponses ?? {}),
      },
    };
  } catch {
    return defaultUiState;
  }
}

function saveUiState(nextState: PersistedUiState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKeys.ui, JSON.stringify(nextState));
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState<AppState>(emptyState);
  const [uiState, setUiState] = useState<PersistedUiState>(readUiState);
  const [busy, setBusy] = useState<MenuKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  const quizComplete = Boolean(state.profile.completed);
  const quizProgress = useMemo(() => {
    const fields: Array<Exclude<keyof QuizProfile, 'completed'>> = ['areaInterest', 'experienceLevel', 'workPreference', 'location', 'softSkills', 'careerGoal', 'techSkills'];
    const filled = fields.filter((field) => state.quiz[field].trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [state.quiz]);

  const currentCoachStep = uiState.coachStep;
  const dispatchPreview = useMemo(() => buildDispatchPreview(uiState.selectedMenu, state.profile, uiState.page === 'quiz' ? 'quiz' : 'menu', state), [state, uiState.page, uiState.selectedMenu]);
  const selectedMeta = getSelectedMeta(uiState.selectedMenu);
  const statusMessage = quizComplete
    ? 'Perfil concluído. Você pode alternar entre as páginas de vagas, cursos e Coach sem perder a navegação.'
    : 'Preencha o quiz para liberar o menu principal e manter o fluxo coerente entre Maestro, Scout, Curator e Coach.';

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const [serverState, storedUi] = await Promise.all([
          requestJson<Partial<AppState>>('/api/state'),
          Promise.resolve(readUiState()),
        ]);

        if (cancelled) {
          return;
        }

        const nextState: AppState = {
          quiz: serverState.quiz ?? emptyQuizProfile(),
          profile: serverState.profile ?? emptyUserProfile(),
          jobs: serverState.jobs ?? [],
          courses: serverState.courses ?? [],
          gaps: serverState.gaps ?? [],
        };

        setState(nextState);
        setUiState(storedUi);

        if (storedUi.mode === 'demo') {
          setState({
            quiz: { ...demoPreset.profile, completed: true },
            profile: demoPreset.profile,
            jobs: demoPreset.jobs,
            courses: demoPreset.courses,
            gaps: demoPreset.gaps,
          });
        }

        navigate(`/${storedUi.page}`, { replace: true });
      } catch (error) {
        if (!cancelled) {
          setStatusError(error instanceof Error ? error.message : 'Falha ao carregar o estado inicial');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    saveUiState(uiState);
  }, [uiState]);

  useEffect(() => {
    if (location.pathname === '/') {
      navigate(`/${uiState.page}`, { replace: true });
    }
  }, [location.pathname, navigate, uiState.page]);

  useEffect(() => {
    if (state.profile.completed && !uiState.demoLoaded && uiState.mode === 'normal') {
      setUiState((current) => ({ ...current, lastAction: 'Quiz concluído e menu liberado' }));
    }
  }, [state.profile.completed, uiState.demoLoaded, uiState.mode]);

  const currentActivities: Activity[] = [
    { role: 'Maestro', message: statusMessage, kind: quizComplete ? 'success' : 'warning' },
    { role: 'Scout', message: state.jobs.length ? `${state.jobs.length} vagas disponíveis no painel.` : 'Aguardando nova busca de vagas.', kind: state.jobs.length ? 'success' : 'neutral' },
    { role: 'Curator', message: state.courses.length ? `${state.courses.length} cursos salvos em destaque.` : 'Aguardando nova busca de cursos.', kind: state.courses.length ? 'success' : 'neutral' },
    { role: 'Coach', message: `Etapa atual: ${currentCoachStep + 1}/6.`, kind: 'neutral' },
  ];

  const persistPage = (page: AppPageKey) => {
    setUiState((current) => ({ ...current, page }));
    navigate(`/${page}`);
  };

  const openDemoMode = () => {
    setState({
      quiz: { ...demoPreset.profile, completed: true },
      profile: demoPreset.profile,
      jobs: demoPreset.jobs,
      courses: demoPreset.courses,
      gaps: demoPreset.gaps,
    });
    setUiState((current) => ({
      ...current,
      mode: 'demo',
      demoLoaded: true,
      page: 'home',
      selectedMenu: 'A',
      lastAction: 'Modo demo carregado com dados de exemplo',
    }));
    navigate('/home');
  };

  const leaveDemoMode = async () => {
    setUiState((current) => ({
      ...current,
      mode: 'normal',
      demoLoaded: false,
      lastAction: 'Demo desligada e estado local restaurado',
    }));

    try {
      const serverState = await requestJson<Partial<AppState>>('/api/state');
      setState({
        quiz: serverState.quiz ?? emptyQuizProfile(),
        profile: serverState.profile ?? emptyUserProfile(),
        jobs: serverState.jobs ?? [],
        courses: serverState.courses ?? [],
        gaps: serverState.gaps ?? [],
      });
    } catch {
      setState(emptyState);
    }

    navigate('/home');
  };

  const updateProfileField = (field: keyof QuizProfile, value: string) => {
    setState((current) => ({
      ...current,
      quiz: {
        ...current.quiz,
        [field]: value,
      },
      profile: {
        ...current.profile,
        [field]: value,
      },
    }));
  };

  const saveProfile = async (complete: boolean) => {
    if (busy !== null) {
      return;
    }

    const payload: UserProfile = {
      ...state.profile,
      targetRoles: deriveTargetRoles(state.quiz.areaInterest, state.quiz.experienceLevel),
      completed: complete,
    };

    setBusy('D');
    try {
      const result = await requestJson<{ quiz: QuizProfile; profile: UserProfile }>('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setState((current) => ({
        ...current,
        quiz: result.quiz,
        profile: result.profile,
      }));
      setUiState((current) => ({
        ...current,
        page: 'jobs',
        selectedMenu: 'A',
        lastAction: complete ? 'Quiz salvo e menu liberado' : 'Rascunho do quiz salvo',
      }));
      navigate('/jobs');
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Falha ao salvar perfil');
    } finally {
      setBusy(null);
    }
  };

  const resetQuiz = async () => {
    if (busy !== null) {
      return;
    }

    setBusy('D');
    try {
      await requestJson('/api/reset', { method: 'POST' });
      setState(emptyState);
      setUiState({ ...defaultUiState, page: 'quiz', lastAction: 'Quiz reiniciado' });
      navigate('/quiz');
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Falha ao reiniciar o quiz');
    } finally {
      setBusy(null);
    }
  };

  const runMenuAction = async (menu: MenuKey) => {
    if (busy !== null) {
      return;
    }

    if (menu === 'D') {
      await resetQuiz();
      return;
    }

    if (!quizComplete) {
      setUiState((current) => ({ ...current, lastAction: 'Conclua o quiz antes de liberar Scout e Curator' }));
      return;
    }

    setBusy(menu);
    setUiState((current) => ({
      ...current,
      selectedMenu: menu,
      lastAction: menu === 'A' ? 'Scout em execução' : menu === 'B' ? 'Curator em execução' : 'Coach em execução',
    }));

    try {
      if (menu === 'A') {
        const result = await requestJson<SearchEnvelope>('/api/scout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state.profile),
        });

        setState((current) => ({
          ...current,
          jobs: result.data,
          gaps: result.gaps ?? current.gaps,
        }));
        setUiState((current) => ({ ...current, lastAction: 'Scout concluiu a busca de vagas' }));
        navigate('/jobs');
      }

      if (menu === 'B') {
        const result = await requestJson<SearchEnvelope>('/api/curator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: state.profile, gaps: state.gaps }),
        });

        setState((current) => ({
          ...current,
          courses: result.data,
          gaps: result.gaps ?? current.gaps,
        }));
        setUiState((current) => ({ ...current, lastAction: 'Curator concluiu a busca de cursos' }));
        navigate('/courses');
      }

      if (menu === 'C') {
        setUiState((current) => ({ ...current, lastAction: 'Coach aberto para simulação' }));
        navigate('/coach');
      }
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Falha ao executar ação');
      setUiState((current) => ({ ...current, lastAction: 'Falha ao executar a ação selecionada' }));
    } finally {
      setBusy(null);
    }
  };

  const handleCoachResponse = (step: CoachStep, value: string) => {
    setUiState((current) => ({
      ...current,
      coachResponses: {
        ...current.coachResponses,
        [step]: value,
      },
    }));
  };

  const nextCoachStep = () => {
    setUiState((current) => ({ ...current, coachStep: Math.min(5, current.coachStep + 1) as CoachStep }));
  };

  const previousCoachStep = () => {
    setUiState((current) => ({ ...current, coachStep: Math.max(0, current.coachStep - 1) as CoachStep }));
  };

  const goToCoachStep = (step: CoachStep) => {
    setUiState((current) => ({ ...current, coachStep: step }));
  };

  const finishCoach = () => {
    setUiState((current) => ({ ...current, lastAction: 'Coach finalizado com sucesso' }));
    navigate('/home');
  };

  const summary = `${state.profile.areaInterest || 'Perfil sem área'} · ${state.profile.experienceLevel || 'nível pendente'} · ${state.profile.workPreference || 'formato pendente'}`;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-slate-200">
        <div className="glass-panel rounded-[1.75rem] px-6 py-5 text-sm">Carregando estado do Maestro...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-grid">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8">
        <header className="glass-panel rounded-[1.8rem] px-4 py-4 md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-amber-200/80">recoloca ia</p>
              <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">Maestro, Scout, Curator e Coach em módulos separados</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{statusMessage}</p>
              {statusError ? <p className="mt-2 text-sm text-rose-200">{statusError}</p> : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">{uiState.mode === 'demo' ? 'demo' : 'normal'}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">{busy ? `executando ${busy}` : 'pronto'}</span>
              <button type="button" onClick={openDemoMode} className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200">
                Demo
              </button>
              <button type="button" onClick={leaveDemoMode} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                Sair da demo
              </button>
            </div>
          </div>

          <nav className="mt-4 hidden gap-2 overflow-x-auto pb-1 lg:flex">
            {appPages.map((page) => (
              <NavLink
                key={page.key}
                to={`/${page.key}`}
                onClick={() => persistPage(page.key)}
                className={({ isActive }) => `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
              >
                {page.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mt-5 flex-1">
          <Routes>
            <Route path="/" element={<Navigate to={`/${uiState.page}`} replace />} />
            <Route path="/home" element={<HomePage profile={state.profile} quizProgress={quizProgress} quizComplete={quizComplete} selectedMenu={uiState.selectedMenu} mode={uiState.mode} lastAction={uiState.lastAction} activities={currentActivities} statusMessage={statusMessage} busy={busy} onNavigate={persistPage} onOpenDemo={openDemoMode} onLeaveDemo={leaveDemoMode} onSelectMenu={(menu) => setUiState((current) => ({ ...current, selectedMenu: menu }))} summary={summary} />} />
            <Route path="/quiz" element={<QuizPage profile={state.quiz} busy={busy} onChange={updateProfileField} onSaveDraft={() => void saveProfile(false)} onComplete={() => void saveProfile(true)} onReset={() => void resetQuiz()} onNavigate={persistPage} onRunAction={runMenuAction} selectedMenu={uiState.selectedMenu} dispatchPreview={dispatchPreview} />} />
            <Route path="/jobs" element={<JobsPage profile={state.profile} jobs={state.jobs} gaps={state.gaps} busy={busy} selectedMenu={uiState.selectedMenu} onRunScout={() => void runMenuAction('A')} onNavigate={persistPage} dispatchPreview={dispatchPreview} />} />
            <Route path="/courses" element={<CoursesPage profile={state.profile} courses={state.courses} gaps={state.gaps} busy={busy} selectedMenu={uiState.selectedMenu} onRunCurator={() => void runMenuAction('B')} onNavigate={persistPage} dispatchPreview={dispatchPreview} />} />
            <Route path="/coach" element={<CoachPage step={currentCoachStep} responses={uiState.coachResponses} onResponseChange={handleCoachResponse} onNext={nextCoachStep} onBack={previousCoachStep} onJump={goToCoachStep} onFinish={finishCoach} onNavigate={persistPage} />} />
            <Route path="*" element={<Navigate to={`/${uiState.page}`} replace />} />
          </Routes>
        </main>

        <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="glass-panel rounded-[1.6rem] p-4 md:p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Estado do fluxo</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">persistência local</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Stat label="Quiz" value={quizComplete ? 'concluído' : `${quizProgress}% preenchido`} />
              <Stat label="Menu" value={uiState.selectedMenu} />
              <Stat label="Perfil" value={state.profile.areaInterest || 'não definido'} />
              <Stat label="Última ação" value={uiState.lastAction} />
            </div>
          </div>

          <div className="glass-panel rounded-[1.6rem] p-4 md:p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Envelope do menu</p>
            <p className="mt-2 text-sm text-slate-300">{selectedMeta.summary}</p>
            <button type="button" onClick={() => void runMenuAction(uiState.selectedMenu)} disabled={busy !== null} className="mt-4 w-full rounded-full bg-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60">
              Executar {menuEntries.find((entry) => entry.key === uiState.selectedMenu)?.title ?? 'ação'}
            </button>
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/85 px-3 py-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-[960px] grid-cols-5 gap-2">
          {appPages.map((page) => (
            <NavLink
              key={page.key}
              to={`/${page.key}`}
              onClick={() => persistPage(page.key)}
              className={({ isActive }) => `rounded-2xl px-2 py-2 text-center text-[11px] font-medium uppercase tracking-[0.18em] ${isActive ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-300'}`}
            >
              {page.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-300">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-2 leading-6 text-white">{value}</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
