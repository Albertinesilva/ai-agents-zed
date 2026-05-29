import type { CoachStep } from '../lib/recoloca';
import { orderedCoachFlow } from '../lib/recoloca';

export function CoachPage({
  step,
  responses,
  onResponseChange,
  onNext,
  onBack,
  onJump,
  onFinish,
  onNavigate,
}: {
  step: CoachStep;
  responses: Record<CoachStep, string>;
  onResponseChange: (step: CoachStep, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  onJump: (step: CoachStep) => void;
  onFinish: () => void;
  onNavigate: (page: 'home' | 'quiz' | 'jobs' | 'courses') => void;
}) {
  const current = orderedCoachFlow[step];

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="glass-panel rounded-[2rem] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-violet-200/80">Coach</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Entrevista simulada</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Seis etapas para treinar narrativa profissional, confiança e fechamento. As respostas são guardadas localmente para a demo.
            </p>
          </div>
          <button type="button" onClick={onFinish} className="rounded-full bg-violet-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-200">
            Finalizar simulação
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {orderedCoachFlow.map((item) => {
            const active = item.step === step;
            const completed = Boolean(responses[item.step]?.trim());
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => onJump(item.step)}
                className={`rounded-2xl border px-3 py-3 text-left transition ${active ? 'border-violet-300/40 bg-violet-300/15' : 'border-white/10 bg-white/5 hover:bg-white/10'} ${completed ? 'ring-1 ring-white/10' : ''}`}
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Etapa {item.step + 1}</p>
                <p className="mt-1 text-sm font-semibold text-white">{item.title}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-violet-200/80">Etapa atual</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{current.title}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">{current.prompt}</p>
          <p className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">{current.hint}</p>
          <textarea
            value={responses[step]}
            onChange={(event) => onResponseChange(step, event.target.value)}
            rows={7}
            placeholder="Digite sua resposta aqui..."
            className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-300/40 focus:bg-white/8"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={onBack} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
              Voltar
            </button>
            <button type="button" onClick={onNext} className="rounded-full bg-violet-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-violet-200">
              Próxima etapa
            </button>
          </div>
        </div>
      </div>

      <aside className="flex flex-col gap-6">
        <section className="glass-panel rounded-[1.5rem] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Fluxo sugerido</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">guia</span>
          </div>
          <div className="mt-4 grid gap-3">
            <button type="button" onClick={() => onNavigate('jobs')} className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-emerald-400/10">
              Revisar vagas antes da entrevista
            </button>
            <button type="button" onClick={() => onNavigate('courses')} className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-cyan-400/10">
              Revisar cursos antes da entrevista
            </button>
            <button type="button" onClick={() => onNavigate('quiz')} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10">
              Voltar ao quiz
            </button>
          </div>
        </section>

        <section className="glass-panel rounded-[1.5rem] p-5">
          <h2 className="text-lg font-semibold text-white">Dicas de demo</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Use a resposta curta, fale em impacto e feche com confiança. O objetivo aqui é mostrar o fluxo, não simular perfeição.
          </p>
        </section>
      </aside>
    </section>
  );
}
