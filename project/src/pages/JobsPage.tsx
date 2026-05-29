import type { MenuKey } from '../lib/recoloca';
import { accentTone } from '../lib/recoloca';
import type { SearchItem, UserProfile } from '../../shared/types';

function ResultList({ items, accent, emptyText }: { items: SearchItem[]; accent: 'emerald' | 'cyan'; emptyText: string }) {
  const tone = accentTone(accent);

  if (!items.length) {
    return <p className="rounded-2xl border border-dashed border-white/15 bg-slate-950/35 p-4 text-sm text-slate-400">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={`${item.company}-${item.title}`} className={`rounded-2xl border ${tone.border} ${tone.badgeBackground} p-4`}>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{item.source}</p>
              <h3 className="mt-1 text-base font-semibold text-white">{item.title}</h3>
            </div>
            {item.hours ? <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">{item.hours}</span> : null}
          </div>
          <p className="mt-2 text-sm text-slate-300">{item.company} · {item.location}</p>
          <p className="mt-3 text-sm leading-6 text-slate-200">{item.description}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-slate-300">
            <span className="rounded-full bg-white/5 px-3 py-1">{item.relatedSkill}</span>
            {item.skills?.slice(0, 3).map((skill) => <span key={skill} className="rounded-full bg-white/5 px-3 py-1">{skill}</span>)}
          </div>
          <a href={item.link} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15">
            Abrir fonte
          </a>
        </article>
      ))}
    </div>
  );
}

export function JobsPage({
  profile,
  jobs,
  gaps,
  busy,
  selectedMenu,
  onRunScout,
  onNavigate,
  dispatchPreview,
}: {
  profile: UserProfile;
  jobs: SearchItem[];
  gaps: string[];
  busy: MenuKey | null;
  selectedMenu: MenuKey;
  onRunScout: () => void;
  onNavigate: (page: 'home' | 'quiz' | 'courses' | 'coach') => void;
  onSelectMenu?: (menu: MenuKey) => void;
  dispatchPreview: string;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="glass-panel rounded-[2rem] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">Oportunidades</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Buscar vagas</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Inicie a busca inteligente e veja as oportunidades conectadas ao seu perfil no mercado.
            </p>
          </div>
          <button type="button" onClick={onRunScout} disabled={busy !== null} className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60">
            {busy === 'A' ? 'Buscando...' : 'Iniciar Busca'}
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Perfil</p>
            <p className="mt-2 font-medium text-white">{profile.areaInterest || 'não informado'}</p>
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Vagas encontradas</p>
            <p className="mt-2 font-medium text-white">{jobs.length}</p>
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Lacunas</p>
            <p className="mt-2 font-medium text-white">{gaps.length ? gaps.join(' · ') : 'aguardando análise'}</p>
          </div>
        </div>

        <div className="mt-6">
          <ResultList items={jobs} accent="emerald" emptyText="Nenhuma vaga encontrada ainda. Rode o Scout para preencher a lista." />
        </div>
      </div>

      <aside className="flex flex-col gap-6">
        <section className="glass-panel rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Ações rápidas</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">menu {selectedMenu}</span>
          </div>
          <div className="mt-4 grid gap-3">
            <button type="button" onClick={() => onNavigate('courses')} className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-cyan-400/10">
              Ver cursos
            </button>
            <button type="button" onClick={() => onNavigate('coach')} className="rounded-2xl border border-violet-400/10 bg-violet-400/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-violet-400/10">
              Abrir Coach
            </button>
            <button type="button" onClick={() => onNavigate('quiz')} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10">
              Revisar quiz
            </button>
          </div>
        </section>
      </aside>
    </section>
  );
}
