import { Reveal, SectionHeader } from './ui'
import { insightTopics } from '../data/resume'

export default function Insights() {
  return (
    <section id="writing" className="mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
      <SectionHeader index="05" title="Engineering Notes" ghost="NOTES" note="// queued, not yet published" />
      <Reveal delay={0.05}>
        <p className="mt-10 max-w-2xl text-mist leading-relaxed">
          Writing in progress — these are the pieces queued up from the systems I’ve built. Each
          will publish here as it lands.
        </p>
      </Reveal>
      <ol className="mt-8 border border-line rounded-lg overflow-hidden bg-line space-y-px">
        {insightTopics.map((topic, i) => (
          <Reveal key={topic} delay={i * 0.05} from="right">
            <li className="bg-ink-2 p-4 sm:p-5 flex items-center gap-4">
              <span className="font-mono text-flaky text-sm select-none">○</span>
              <p className="text-sm sm:text-base text-mist">{topic}</p>
              <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-dim whitespace-nowrap">
                queued
              </span>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}
