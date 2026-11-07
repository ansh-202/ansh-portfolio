import { Reveal, SectionHeader, Tilt } from './ui'
import { skillGroups } from '../data/resume'

export default function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
      <SectionHeader index="03" title="Technical Stack" ghost="TOOLING" note="// no progress bars were harmed" />
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {skillGroups.map((group, gi) => (
          <Reveal
            key={group.code}
            delay={gi * 0.06}
            from={gi % 3 === 0 ? 'left' : gi % 3 === 2 ? 'right' : 'up'}
            className="h-full"
          >
            <Tilt max={7} className="h-full">
              <div className="bg-ink-2/90 border border-line rounded-lg hover:border-pass-dim transition-colors p-6 sm:p-7 h-full flex flex-col">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display font-semibold text-lg text-fog tracking-tight">
                  {group.name}
                </h3>
                <span className="font-mono text-[10px] text-pass tracking-widest">
                  [{group.code}]
                </span>
              </div>
              <div className="rule-dotted my-4" />
              <ul className="space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="font-mono text-[13px] text-mist flex gap-2.5">
                    <span className="text-dim select-none">·</span>
                    {item}
                  </li>
                ))}
              </ul>
              </div>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
