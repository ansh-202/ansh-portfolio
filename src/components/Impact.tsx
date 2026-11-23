import { motion, useReducedMotion } from 'framer-motion'
import { Reveal, SectionHeader } from './ui'
import { NumberTicker, SpotlightCard } from './effects'
import { impact2026 } from '../data/resume'

/** Bento grid of 2026 Brevo impact: spotlight tiles with count-up numbers.
 *  The wide hero tile carries a slow "border beam" travelling its edge. */
export default function Impact() {
  const reduced = useReducedMotion()

  return (
    <section id="impact" className="mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
      <SectionHeader
        index="2026"
        title="Impact at Brevo"
        ghost="SHIPPED"
        note="// may → nov 2026"
      />
      <Reveal delay={0.05}>
        <p className="mt-10 max-w-2xl text-mist leading-relaxed">
          This year the work moved from keeping tests honest to rebuilding the ground they run on:
          migrating to Playwright, putting every module on a self-healing Jenkins nightly, and
          teaching AI agents to write tests the team can trust.
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(150px,auto)] gap-3">
        {impact2026.map((t, i) => {
          const span = t.wide ? 'col-span-2' : 'col-span-2 sm:col-span-1'
          return (
            <motion.div
              key={t.label}
              className={span}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.96 }}
              whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.7,
                delay: (i % 4) * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <SpotlightCard className="h-full">
                {t.wide && !reduced && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute top-0 h-px w-40 bg-gradient-to-r from-transparent via-pass to-transparent"
                    animate={{ left: ['-10rem', '100%'] }}
                    transition={{
                      duration: 3.6,
                      repeat: Infinity,
                      ease: 'linear',
                      repeatDelay: 1.2,
                    }}
                  />
                )}
                <div className="h-full flex flex-col justify-end p-5 sm:p-6">
                  <div>
                    <p
                      className={`font-display font-extrabold tracking-tight text-fog leading-none ${
                        t.wide ? 'text-5xl sm:text-6xl' : 'text-4xl sm:text-5xl'
                      }`}
                    >
                      <NumberTicker value={t.value} prefix={t.prefix} suffix={t.suffix} />
                    </p>
                    <p className="mt-3 font-mono text-xs uppercase tracking-widest text-pass">
                      {t.label}
                    </p>
                    <p className="mt-2 text-sm text-mist leading-relaxed">{t.detail}</p>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
