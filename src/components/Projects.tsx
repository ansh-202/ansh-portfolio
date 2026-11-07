import { ArrowUpRight } from 'lucide-react'
import { Reveal, SectionHeader, Tilt } from './ui'
import { identity, projects } from '../data/resume'

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
      <SectionHeader index="04" title="Case Studies" ghost="SYSTEMS" note="// problem → approach → impact" />
      <div className="mt-14 space-y-16">
        {projects.map((p, i) => (
          <Reveal key={p.id} from={i % 2 === 0 ? 'left' : 'right'}>
            <article className="grid lg:grid-cols-[auto_1fr] gap-6 lg:gap-12">
              <div className="lg:w-40">
                <span className="font-mono text-xs text-pass tracking-widest">{p.id}</span>
                <div className="mt-3 hidden lg:flex flex-col gap-1.5">
                  {p.stack.map((s) => (
                    <span key={s} className="font-mono text-[11px] text-dim">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className={i % 2 === 1 ? 'lg:pr-16' : 'lg:pl-0 lg:pr-0'}>
                <h3 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-fog">
                  {p.name}
                </h3>
                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-fail/80">
                      ✗ problem
                    </p>
                    <p className="mt-2 text-sm text-mist leading-relaxed">{p.problem}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-flaky/90">
                      → approach
                    </p>
                    <p className="mt-2 text-sm text-mist leading-relaxed">{p.approach}</p>
                  </div>
                </div>
                <Tilt max={6} className="mt-6">
                  <div className="border border-line rounded-lg bg-ink-2/90 hover:border-pass-dim transition-colors p-4 sm:p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-pass">
                      ✓ impact
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-x-8 gap-y-1.5">
                      {p.impact.map((im) => (
                        <li key={im} className="font-mono text-[13px] text-fog">
                          {im}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Tilt>
                <div className="mt-4 flex lg:hidden flex-wrap gap-x-4 gap-y-1">
                  {p.stack.map((s) => (
                    <span key={s} className="font-mono text-[11px] text-dim">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </article>
            {i < projects.length - 1 && <div className="rule-dotted mt-16" />}
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.1}>
        <p className="mt-16 font-mono text-xs text-dim">
          Built inside company pipelines — code lives in private repos.{' '}
          <a
            href={identity.github}
            target="_blank"
            rel="noreferrer"
            className="text-mist hover:text-pass transition-colors inline-flex items-center gap-1"
          >
            Public work on GitHub <ArrowUpRight size={12} />
          </a>
        </p>
      </Reveal>
    </section>
  )
}
