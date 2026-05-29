import type { AppMode, AppPageKey, Activity, MenuKey } from '../lib/recoloca';
import { appPages, menuEntries, menuTone } from '../lib/recoloca';
import type { UserProfile } from '../../shared/types';

export function HomePage({
  profile,
  quizProgress,
  quizComplete,
  selectedMenu,
  mode,
  lastAction,
  activities,
  statusMessage,
  busy,
  onNavigate,
  onOpenDemo,
  onLeaveDemo,
  onSelectMenu,
  summary,
}: {
  profile: UserProfile;
  quizProgress: number;
  quizComplete: boolean;
  selectedMenu: MenuKey;
  mode: AppMode;
  lastAction: string;
  activities: Activity[];
  statusMessage: string;
  busy: MenuKey | null;
  onNavigate: (page: AppPageKey) => void;
  onOpenDemo: () => void;
  onLeaveDemo: () => void;
  onSelectMenu: (key: MenuKey) => void;
  summary: string;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
      <div className="glass-panel rounded-[2rem] p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">Maestro / Scout / Curator / Coach</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-5xl">
              Seu relaunch de carreira em páginas separadas, prontas para demo e mobile.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">{statusMessage}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 px-4 py-4 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Resumo rápido</p>
            <p className="mt-2 font-medium text-white">{summary}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-400">
              <span className="rounded-full bg-white/5 px-3 py-1">{quizComplete ? 'menu liberado' : 'quiz bloqueado'}</span>
              <span className="rounded-full bg-white/5 px-3 py-1">{mode === 'demo' ? 'demo ligada' : 'modo normal'}</span>
              <span className="rounded-full bg-white/5 px-3 py-1">{busy ? `executando ${busy}` : 'pronto'}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {appPages.map((page) => (
            <button
              key={page.key}
              type="button"
              onClick={() => onNavigate(page.key)}
              className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{page.hint}</p>
              <p className="mt-2 text-lg font-semibold text-white">{page.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {page.key === 'quiz' && 'Preencha e libere o menu.'}
                {page.key === 'jobs' && 'Veja as vagas encontradas pelo Scout.'}
                {page.key === 'courses' && 'Veja cursos recomendados pelo Curator.'}
                {page.key === 'coach' && 'Faça a entrevista simulada em 6 etapas.'}
                {page.key === 'home' && 'Navegue pelo estado atual do app.'}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/35 p-4 text-sm leading-6 text-slate-300">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Estado do perfil</p>
            <p className="mt-2">{profile.areaInterest || 'Área ainda não informada'} · {profile.experienceLevel || 'nível pendente'} · {profile.workPreference || 'preferência pendente'}</p>
            <p className="mt-2">Progresso do quiz: {quizProgress}%.</p>
            <p className="mt-2">Última ação: {lastAction}.</p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Modo demo</p>
            <p className="mt-2 leading-6">
              A demo pré-carrega perfil, vagas, cursos e respostas do Coach para apresentar o fluxo sem depender de uma busca ao vivo.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={onOpenDemo} className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200">
                Ativar demo
              </button>
              <button type="button" onClick={onLeaveDemo} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                Sair da demo
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside className="flex flex-col gap-6">
        <section className="glass-panel rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Menu Maestro</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">A/B/C/D</span>
          </div>
          <div className="mt-4 space-y-3">
            {menuEntries.map((entry) => {
              const tone = menuTone(entry.color);
              const selected = selectedMenu === entry.key;
              return (
                <button
                  key={entry.key}
                  type="button"
                  onClick={() => onSelectMenu(entry.key)}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${selected ? tone.selected : tone.rest}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Opção {entry.key}</p>
                      <p className="mt-1 text-base font-semibold text-white">{entry.title}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${tone.badge}`}>{selected ? 'selecionado' : 'ver'}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{entry.subtitle}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="glass-panel rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Atividades recentes</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">timeline</span>
          </div>
          <div className="mt-4 space-y-3">
            {activities.map((activity, index) => (
              <article key={`${activity.role}-${index}`} className={`rounded-2xl border px-4 py-3 ${activity.kind === 'success' ? 'border-emerald-400/20 bg-emerald-400/10' : activity.kind === 'warning' ? 'border-amber-400/20 bg-amber-400/10' : activity.kind === 'error' ? 'border-rose-400/20 bg-rose-400/10' : 'border-white/10 bg-white/5'}`}>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{activity.role}</p>
                <p className="mt-1 text-sm leading-6 text-slate-100">{activity.message}</p>
              </article>
            ))}
          </div>
        </section>
      </aside>
    </section>
  );
}
