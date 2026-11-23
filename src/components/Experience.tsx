import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Bug } from './BugHunt'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  animate,
} from 'framer-motion'
import { Reveal, SectionHeader, Tag } from './ui'
import { experience } from '../data/resume'
import type { Role } from '../data/resume'

/* Each company's work hides behind a living eye. It blinks idly, its pupil
 * follows your cursor, and on click it snaps wide open: the log entries fall
 * in like shooting stars, streaking down from the top right, and land as a
 * deck of cards you can drag or step through. */

const EYE_OPEN = 'M3 20 C 16 4 48 4 61 20 C 48 36 16 36 3 20 Z'
const EYE_SHUT = 'M3 20 C 16 18 48 18 61 20 C 48 22 16 22 3 20 Z'

function Eye({
  open,
  px,
  py,
}: {
  open: boolean
  px: ReturnType<typeof useSpring>
  py: ReturnType<typeof useSpring>
}) {
  const reduced = useReducedMotion()
  const [blink, setBlink] = useState(false)

  // idle blinking at irregular intervals
  useEffect(() => {
    if (reduced) return
    let alive = true
    let t: number
    const schedule = () => {
      t = window.setTimeout(() => {
        if (!alive) return
        setBlink(true)
        window.setTimeout(() => {
          setBlink(false)
          schedule()
        }, 140)
      }, 2200 + Math.random() * 2600)
    }
    schedule()
    return () => {
      alive = false
      window.clearTimeout(t)
    }
  }, [reduced])

  const shut = blink && !open

  return (
    <motion.svg
      viewBox="0 0 64 40"
      className="w-14 h-9 sm:w-16 sm:h-10 shrink-0"
      animate={open ? { scale: 1.12 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 14 }}
      aria-hidden
    >
      <defs>
        <clipPath id="eye-clip">
          <path d={EYE_OPEN} />
        </clipPath>
      </defs>
      {/* iris + pupil track the cursor, squash during blinks */}
      <motion.g
        clipPath="url(#eye-clip)"
        style={{ x: px, y: py }}
        animate={{ scaleY: shut ? 0.05 : 1 }}
        transition={{ duration: 0.12 }}
      >
        <motion.circle
          cx="32"
          cy="20"
          fill="var(--color-ink-3)"
          stroke="var(--color-pass)"
          strokeWidth="1.5"
          animate={{ r: open ? 11.5 : 9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        />
        <motion.circle
          cx="32"
          cy="20"
          fill="var(--color-pass)"
          animate={{ r: open ? 5 : 3.5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        />
        <circle cx="35" cy="17" r="1.3" fill="#e9ede7" opacity="0.8" />
      </motion.g>
      <motion.path
        fill="none"
        stroke="var(--color-pass)"
        strokeWidth="1.8"
        strokeLinejoin="round"
        animate={{ d: shut ? EYE_SHUT : EYE_OPEN, opacity: open ? 1 : 0.75 }}
        transition={{ duration: 0.12 }}
      />
      {/* lashes flare out when wide open */}
      <motion.g
        stroke="var(--color-pass)"
        strokeWidth="1.4"
        strokeLinecap="round"
        animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.6 }}
        transition={{ duration: 0.25 }}
        style={{ transformOrigin: '32px 20px' }}
      >
        <line x1="32" y1="2.5" x2="32" y2="7" />
        <line x1="14" y1="6" x2="17" y2="10" />
        <line x1="50" y1="6" x2="47" y2="10" />
      </motion.g>
    </motion.svg>
  )
}

const TILT = [-3, 2, -1.5, 3, -2, 1.5]

/** One log entry as a shooting star: a glowing head with a tail streaks in from
 *  the top right, lands with a spring and a ring of impact, then rests tilted
 *  like a dealt card. */
function Meteor({ entry, i, reduced }: { entry: Role['log'][number]; i: number; reduced: boolean }) {
  const delay = 0.1 + i * 0.22
  const flight = 0.75
  return (
    <motion.li
      className="relative shrink-0 w-[78vw] max-w-[300px] sm:w-[300px]"
      initial={reduced ? { opacity: 0 } : { x: 420, y: -480, rotate: -32, scale: 0.25, opacity: 0 }}
      animate={reduced ? { opacity: 1 } : { x: 0, y: 0, rotate: TILT[i % TILT.length], scale: 1, opacity: 1 }}
      whileHover={reduced ? undefined : { rotate: 0, y: -8 }}
      transition={
        reduced
          ? { duration: 0.3, delay: i * 0.05 }
          : { type: 'spring', stiffness: 105, damping: 13, mass: 0.9, delay }
      }
    >
      {!reduced && (
        <>
          {/* tail, pointing back along the flight path */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -top-36 right-2 h-44 w-[3px] origin-bottom rotate-[41deg] rounded-full bg-gradient-to-t from-pass via-pass/40 to-transparent"
            initial={{ opacity: 1, scaleY: 1 }}
            animate={{ opacity: 0, scaleY: 0.2 }}
            transition={{ delay: delay + flight * 0.6, duration: 0.5 }}
          />
          {/* glowing head while in flight */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-xl bg-pass/50 blur-xl"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: delay + flight * 0.5, duration: 0.6 }}
          />
          {/* landing ring */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -inset-1 rounded-xl border-2 border-pass"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: [0, 0.9, 0], scale: [0.92, 1.08, 1.16] }}
            transition={{ delay: delay + flight, duration: 0.6 }}
          />
        </>
      )}
      <div className="relative h-full min-h-[200px] rounded-xl border border-line-2 bg-ink-2 p-5 flex flex-col shadow-[0_18px_40px_-20px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
          <span className="text-dim">#{String(i + 1).padStart(2, '0')}</span>
          {entry.tag && <span className="text-pass">{entry.tag}</span>}
        </div>
        <p className="mt-3 text-sm text-mist leading-relaxed flex-1">{entry.text}</p>
        <p className="mt-4 font-mono text-[11px] text-pass">✓ passed</p>
      </div>
    </motion.li>
  )
}

/** The landed entries form a deck you can drag sideways or step through. */
function MeteorDeck({ role }: { role: Role }) {
  const reduced = !!useReducedMotion()
  const viewport = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLOListElement>(null)
  const x = useMotionValue(0)
  const [index, setIndex] = useState(0)
  const count = role.log.length

  const step = () => {
    const first = track.current?.children[0] as HTMLElement | undefined
    return first ? first.offsetWidth + 16 : 316
  }
  const minX = () => Math.min(0, (viewport.current?.clientWidth ?? 0) - (track.current?.scrollWidth ?? 0))

  useEffect(() => x.on('change', (v) => setIndex(Math.min(count - 1, Math.round(-v / step())))), [x, count])

  // the deck is wider than its frame, so drag limits are explicit pixels
  const [left, setLeft] = useState(0)
  useEffect(() => {
    const ro = new ResizeObserver(() => setLeft(minX()))
    if (viewport.current) ro.observe(viewport.current)
    if (track.current) ro.observe(track.current)
    return () => ro.disconnect()
  }, [])

  const go = (dir: 1 | -1) => {
    const target = Math.max(minX(), Math.min(0, -(index + dir) * step()))
    animate(x, target, reduced ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 28 })
  }

  return (
    <div className="pt-6">
      <div ref={viewport} className="overflow-x-clip">
        <motion.ol
          ref={track}
          drag="x"
          dragConstraints={{ left, right: 0 }}
          dragElastic={0.12}
          style={{ x }}
          className="flex gap-4 py-3 pl-1 pr-8 cursor-grab active:cursor-grabbing"
          aria-label={`${role.company} work log`}
        >
          {role.log.map((entry, i) => (
            <Meteor key={i} entry={entry} i={i} reduced={reduced} />
          ))}
        </motion.ol>
      </div>
      <div className="mt-4 flex items-center gap-3 font-mono text-xs text-dim">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="Previous entry"
          className="h-8 w-8 grid place-items-center rounded-full border border-line-2 hover:border-pass hover:text-pass disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          onClick={() => go(1)}
          disabled={index >= count - 1}
          aria-label="Next entry"
          className="h-8 w-8 grid place-items-center rounded-full border border-line-2 hover:border-pass hover:text-pass disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={15} />
        </button>
        <span>
          <span className="text-pass">{String(index + 1).padStart(2, '0')}</span> / {String(count).padStart(2, '0')}
        </span>
        <span className="ml-auto hidden sm:inline">drag the deck ⇆</span>
      </div>
    </div>
  )
}

function WorkLog({ role }: { role: Role }) {
  const reduced = !!useReducedMotion()
  const [open, setOpen] = useState(false)
  const px = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const py = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })

  return (
    <div>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        onMouseMove={(e) => {
          if (reduced) return
          const r = e.currentTarget.getBoundingClientRect()
          px.set(((e.clientX - (r.left + 56)) / r.width) * 10)
          py.set(((e.clientY - (r.top + r.height / 2)) / r.height) * 7)
        }}
        onMouseLeave={() => {
          px.set(0)
          py.set(0)
        }}
        aria-expanded={open}
        whileTap={reduced ? undefined : { scale: 0.97 }}
        className={`w-full text-left bg-ink-2/90 border rounded-lg transition-colors p-4 sm:p-5 flex items-center gap-4 sm:gap-5 ${
          open ? 'border-pass-dim' : 'border-line hover:border-pass-dim'
        }`}
      >
        <Eye open={open} px={px} py={py} />
        <div className="min-w-0">
          <p className="font-mono text-xs text-pass truncate">
            $ reveal --work {role.company.toLowerCase().replace('.', '-')}
          </p>
          <p className="mt-1 text-sm text-mist">
            {open ? 'click to hide the work' : 'click to see the work'}
            <span className="text-dim"> · {role.log.length} entries</span>
          </p>
        </div>
        <motion.span
          className="ml-auto font-mono text-pass text-lg select-none"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          +
        </motion.span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="log"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <MeteorDeck role={role} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Experience() {
  return (
    <section id="experience" className="relative mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
      <Bug id="experience" className="absolute left-2 sm:left-0 top-[52%]" />
      <SectionHeader index="02" title="Experience" ghost="EXECUTION" note="// execution log, newest first" />
      <div className="mt-14 space-y-20">
        {experience.map((role) => (
          <article key={role.company} className="grid lg:grid-cols-[1fr_1.8fr] gap-8 lg:gap-14 items-start [&>*]:min-w-0">
            {/* left: sticky role metadata */}
            <Reveal from="left">
              <div className="lg:sticky lg:top-24">
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-fog">
                    {role.company}
                  </h3>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded-sm tracking-widest ${
                      role.status === 'RUNNING'
                        ? 'bg-flaky/15 text-flaky'
                        : 'bg-pass/15 text-pass'
                    }`}
                  >
                    {role.status}
                  </span>
                </div>
                <p className="mt-2 text-mist">{role.title}</p>
                <p className="mt-1 font-mono text-xs text-dim">
                  {role.period} · {role.location}
                </p>
                <p className="mt-5 text-sm text-mist leading-relaxed border-l-2 border-pass-dim pl-4">
                  {role.summary}
                </p>
              </div>
            </Reveal>

            {/* right: eye trigger + hatched work log */}
            <Reveal from="right">
              <WorkLog role={role} />
            </Reveal>
          </article>
        ))}
      </div>
      <Reveal delay={0.1}>
        <div className="mt-14 flex flex-wrap gap-2">
          <Tag>2.5+ years</Tag>
          <Tag>UI + API automation</Tag>
          <Tag>CI/CD reliability</Tag>
          <Tag>framework ownership</Tag>
        </div>
      </Reveal>
    </section>
  )
}
