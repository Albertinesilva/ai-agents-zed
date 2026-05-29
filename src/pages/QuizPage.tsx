import type { MenuKey } from '../lib/recoloca';
import { calcProgress, isQuizReady } from '../lib/recoloca';
import type { QuizProfile } from '../../shared/types';

type QuizTextFieldKey = Exclude<keyof QuizProfile, 'completed'>;

const quizFields: Array<{
  key: QuizTextFieldKey;
  label: string;
  question: string;
  placeholder: string;
  multiline?: boolean;
}> = [
    { key: 'areaInterest', label: 'Área de interesse', question: 'Qual área você quer seguir agora?', placeholder: 'Ex.: Backend, Frontend, Dados...' },
    { key: 'experienceLevel', label: 'Nível atual', question: 'Como você se considera hoje?', placeholder: 'Ex.: Júnior, Pleno, Sênior...' },
    { key: 'workPreference', label: 'Preferência de trabalho', question: 'Qual formato de trabalho faz mais sentido?', placeholder: 'Ex.: Remoto, híbrido, presencial...' },
    { key: 'location', label: 'Localização', question: 'Em qual cidade ou país você quer atuar?', placeholder: 'Ex.: São Paulo, Brasil...' },
    { key: 'softSkills', label: 'Pontos fortes comportamentais', question: 'O que você faz bem em colaboração?', placeholder: 'Ex.: comunicação, organização...', multiline: true },
    { key: 'careerGoal', label: 'Objetivo de carreira', question: 'Qual é a sua meta nos próximos meses?', placeholder: 'Ex.: primeira vaga, transição, promoção...', multiline: true },
    { key: 'techSkills', label: 'Tecnologias e ferramentas', question: 'Quais habilidades técnicas você quer usar?', placeholder: 'Ex.: Java, Spring Boot, SQL...', multiline: true },
  ];

export function QuizPage({
  profile,
  busy,
  onChange,
  onSaveDraft,
  onComplete,
  onReset,
  onNavigate,
  onRunAction,
  selectedMenu,
  dispatchPreview,
}: {
  profile: QuizProfile;
  busy: MenuKey | null;
  onChange: (field: QuizTextFieldKey, value: string) => void;
  onSaveDraft: () => void;
  onComplete: () => void;
  onReset: () => void;
  onNavigate: (page: 'home' | 'jobs' | 'courses' | 'coach') => void;
  onRunAction: (menu: MenuKey) => void;
  selectedMenu: MenuKey;
  dispatchPreview: string;
}) {
  const progress = calcProgress(profile);
  const canComplete = isQuizReady(profile);

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="glass-panel rounded-[2rem] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">Fluxo do Maestro</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Quiz de entrada</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              O quiz libera o menu principal. Quando os campos estiverem completos, o fluxo destrava Scout, Curator e Coach.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 px-4 py-4 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Progresso</p>
            <p className="mt-2 font-medium text-white">{progress}% preenchido</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-300 via-emerald-300 to-cyan-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {quizFields.map((field, index) => (
            <label key={field.key} className="group rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4 transition hover:border-white/20 hover:bg-slate-950/55">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/7 text-sm font-semibold text-slate-200">{String(index + 1).padStart(2, '0')}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{field.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{field.question}</p>
                  {field.multiline ? (
                    <textarea
                      value={profile[field.key]}
                      onChange={(event) => onChange(field.key, event.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-300/40 focus:bg-white/8"
                    />
                  ) : (
                    <input
                      value={profile[field.key]}
                      onChange={(event) => onChange(field.key, event.target.value)}
                      placeholder={field.placeholder}
                      className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-300/40 focus:bg-white/8"
                    />
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/35 p-4 text-sm leading-6 text-slate-300">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Regra do menu</p>
            <p className="mt-2">A e B ficam disponíveis quando o quiz estiver completo. C abre a experiência do Coach. D reinicia o fluxo.</p>
          </div>

          <div className="flex flex-col gap-3">
            <button type="button" onClick={onSaveDraft} disabled={busy !== null} className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60">
              Salvar rascunho
            </button>
            <button type="button" onClick={onComplete} disabled={busy !== null || !canComplete} className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60">
              Concluir e liberar menu
            </button>
            <button type="button" onClick={onReset} disabled={busy !== null} className="rounded-full border border-rose-400/20 bg-rose-400/10 px-5 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-60">
              Refazer quiz
            </button>
          </div>
        </div>
      </div>

      <aside className="flex flex-col gap-6">
        <section className="glass-panel rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Próximos passos</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">navegação</span>
          </div>
          <div className="mt-4 space-y-3">
            <button type="button" onClick={() => onNavigate('jobs')} className="w-full rounded-2xl border border-emerald-400/10 bg-emerald-400/5 px-4 py-3 text-left transition hover:bg-emerald-400/10">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/80">Scout</p>
              <p className="mt-1 font-semibold text-white">Buscar vagas</p>
            </button>
            <button type="button" onClick={() => onNavigate('courses')} className="w-full rounded-2xl border border-cyan-400/10 bg-cyan-400/5 px-4 py-3 text-left transition hover:bg-cyan-400/10">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Curator</p>
              <p className="mt-1 font-semibold text-white">Encontrar cursos</p>
            </button>
            <button type="button" onClick={() => onNavigate('coach')} className="w-full rounded-2xl border border-violet-400/10 bg-violet-400/5 px-4 py-3 text-left transition hover:bg-violet-400/10">
              <p className="text-xs uppercase tracking-[0.25em] text-violet-200/80">Coach</p>
              <p className="mt-1 font-semibold text-white">Simular entrevista</p>
            </button>
          </div>
        </section>

        <section className="glass-panel rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Ação atual</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">menu {selectedMenu}</span>
          </div>
          <button type="button" onClick={() => onRunAction(selectedMenu)} disabled={busy !== null} className="mt-4 w-full rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60">
            Executar opção {selectedMenu}
          </button>
        </section>
      </aside>
    </section>
  );
}
