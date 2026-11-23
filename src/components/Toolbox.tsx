import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bot, Boxes, Code2, MousePointerClick, Network, Workflow } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Reveal, SectionHeader } from './ui'
import { Bug } from './BugHunt'
import { skillGroups } from '../data/resume'
import { guide } from '../lib/guide'

/* Skills as a tool chest: each category is a drawer. One drawer is open at
 * rest so the section reads complete; opening another slides it out and
 * springs its tools up onto the bench. */

const ICONS: Record<string, LucideIcon> = {
  LANG: Code2,
  UI: MousePointerClick,
  API: Network,
  FWK: Boxes,
  OPS: Workflow,
  AI: Bot,
}

export default function Toolbox() {
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(skillGroups[1].code)

  return (
    <section id="skills" className="relative mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
      <SectionHeader index="03" title="The Toolbox" ghost="TOOLING" note="// open a drawer" />
      <Bug id="toolbox" className="absolute right-6 top-40 sm:top-48" />

      <Reveal delay={0.05}>
        <div className="mt-12 max-w-4xl">
          {/* lid */}
          <div className="relative rounded-t-2xl border border-line-2 bg-ink-3 px-5 py-4 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
              ansh.kumar · test kit
            </span>
            <span aria-hidden className="h-2.5 w-24 rounded-full border border-line-2 bg-ink" />
            <span className="font-mono text-[11px] text-pass">{skillGroups.length} drawers</span>
          </div>

          {/* drawers */}
          <div className="border-x border-b border-line-2 rounded-b-2xl bg-ink-2/95 p-2 sm:p-3 space-y-2">
            {skillGroups.map((g) => {
              const Icon = ICONS[g.code] ?? Boxes
              const isOpen = open === g.code
              return (
                <div key={g.code}>
                  <motion.button
                    onClick={() => {
                      setOpen(g.code)
                      if (!isOpen) guide.react('tool', `Borrowing from ${g.name}.`)
                    }}
                    aria-expanded={isOpen}
                    animate={reduced ? undefined : { y: isOpen ? -2 : 0 }}
                    whileHover={reduced ? undefined : { x: 6 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                    className={`group w-full flex items-center gap-4 rounded-lg border px-4 py-3.5 text-left transition-colors ${
                      isOpen
                        ? 'border-pass-dim bg-ink-3'
                        : 'border-line bg-ink hover:border-line-2'
                    }`}
                  >
                    <Icon size={18} className={isOpen ? 'text-pass' : 'text-dim group-hover:text-mist'} />
                    <span className="font-display font-semibold text-fog tracking-tight">{g.name}</span>
                    <span className="font-mono text-[10px] text-dim tracking-widest">[{g.code}]</span>
                    {/* drawer pull */}
                    <span
                      aria-hidden
                      className={`ml-auto h-1.5 w-12 rounded-full transition-colors ${
                        isOpen ? 'bg-pass' : 'bg-line-2 group-hover:bg-dim'
                      }`}
                    />
                  </motion.button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="tray"
                        initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                        exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <motion.ul
                          className="flex flex-wrap gap-2.5 px-2 pt-4 pb-3"
                          initial="hidden"
                          animate="shown"
                          variants={{ shown: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } }}
                        >
                          {g.items.map((item) => (
                            <motion.li
                              key={item}
                              variants={{
                                hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 22, rotate: -4 },
                                shown: reduced
                                  ? { opacity: 1 }
                                  : {
                                      opacity: 1,
                                      y: 0,
                                      rotate: 0,
                                      transition: { type: 'spring', stiffness: 420, damping: 18 },
                                    },
                              }}
                              whileHover={reduced ? undefined : { y: -4 }}
                              className="font-mono text-[13px] text-fog bg-ink border border-line-2 rounded-md px-3 py-2 shadow-[0_6px_0_-2px_var(--color-line)]"
                            >
                              {item}
                            </motion.li>
                          ))}
                        </motion.ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
