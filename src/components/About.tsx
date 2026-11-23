import { Reveal, SectionHeader, Tilt } from './ui'
import { Bug } from './BugHunt'
import { TextScrollReveal } from './effects'
import { about, education } from '../data/resume'

const stats = [
  { value: '25,000+', label: 'test cases kept honest in CI' },
  { value: '~35%', label: 'fewer flaky executions' },
  { value: '~40%', label: 'faster mean-time-to-debug' },
  { value: 'hrs → min', label: 'release triage time' },
]

export default function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
      <Bug id="about" className="absolute right-4 sm:right-10 top-40" />
      <SectionHeader index="01" title="About" ghost="RELIABLE" note="// engineering philosophy" />
      <div className="mt-12 grid lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-16">
        <div className="space-y-6">
          {about.philosophy.map((p, i) => (
            i === 0 ? (
              <TextScrollReveal
                key={i}
                text={p}
                className="font-display text-2xl sm:text-3xl font-semibold tracking-tight leading-snug text-fog"
              />
            ) : (
              <Reveal key={i} delay={i * 0.08}>
                <p className="text-mist leading-relaxed text-base sm:text-lg">{p}</p>
              </Reveal>
            )
          ))}
          <Reveal delay={0.3}>
            <p className="font-mono text-xs text-dim pt-2">
              {education.degree} · {education.school} · {education.note}
            </p>
          </Reveal>
        </div>
        <div className="grid grid-cols-2 gap-3 self-start">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={0.1 + i * 0.07} from="right">
              <Tilt max={10} className="h-full">
                <div className="h-full bg-ink-2/90 border border-line rounded-lg p-5 sm:p-6 hover:border-pass-dim transition-colors">
                  <p className="font-mono text-pass text-xl sm:text-2xl font-bold tracking-tight">
                    {s.value}
                  </p>
                  <p className="mt-2 text-xs sm:text-[13px] text-mist leading-snug">{s.label}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
