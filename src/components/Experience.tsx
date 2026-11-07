import { useEffect, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Reveal, SectionHeader, Tag } from './ui'
import { experience } from '../data/resume'
import type { Role } from '../data/resume'

/* Each company's work hides behind a living eye. It blinks idly, its pupil
 * follows your cursor, and on click it snaps wide open — the log entries then
 * hatch out of the container onto the pipeline track with spring physics. */

const EYE_OPEN = 'M3 20 C 16 4 48 4 61 20 C 48 36 16 36 3 20 Z'
const EYE_SHUT = 'M3 20 C 16 18 48 18 61 20 C 48 22 16 22 3 20 Z'

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}

/* li only lifts/fades; the clip wipe lives on the inner card so the
 * track dot (outside the card box) never gets clipped away. */
const entryVariants = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 18 },
  visible: reduced
    ? { opacity: 1 }
    : { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
})

/* motionlab "Reveal — clip wipe + blur-to-sharp": the card unmasks
 * left-to-right while focusing in. */
const cardVariants = (reduced: boolean): Variants => ({
  hidden: reduced
    ? {}
    : { clipPath: 'inset(0 100% 0 0)', filter: 'blur(10px)' },
  visible: reduced
    ? {}
    : {
        clipPath: 'inset(0 0% 0 0)',
        filter: 'blur(0px)',
        transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
      },
})

const dotVariants = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 0 } : { scale: 0, opacity: 0 },
  visible: reduced
    ? { opacity: 1 }
    : {
        scale: [0, 1.6, 1],
        opacity: 1,
        transition: { duration: 0.5, times: [0, 0.6, 1], ease: 'easeOut' },
      },
})

const checkVariants = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 0 } : { scale: 0, rotate: -120, opacity: 0 },
  visible: reduced
    ? { opacity: 1 }
    : {
        scale: 1,
        rotate: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 400, damping: 12, delay: 0.18 },
      },
})

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
          fill="#171b17"
          stroke="#51e07e"
          strokeWidth="1.5"
          animate={{ r: open ? 11.5 : 9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        />
        <motion.circle
          cx="32"
          cy="20"
          fill="#51e07e"
          animate={{ r: open ? 5 : 3.5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        />
        <circle cx="35" cy="17" r="1.3" fill="#e9ede7" opacity="0.8" />
      </motion.g>
      <motion.path
        fill="none"
        stroke="#51e07e"
        strokeWidth="1.8"
        strokeLinejoin="round"
        animate={{ d: shut ? EYE_SHUT : EYE_OPEN, opacity: open ? 1 : 0.75 }}
        transition={{ duration: 0.12 }}
      />
      {/* lashes flare out when wide open */}
      <motion.g
        stroke="#51e07e"
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
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <motion.ol
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="relative pl-9 sm:pl-11 pt-4 space-y-3"
            >
              {/* motionlab "SVG & Path — scroll-driven path drawing":
                  the pipeline track draws itself down as entries land */}
              <svg
                aria-hidden
                className="absolute left-[13px] sm:left-[17px] top-7 bottom-3 w-[2px] h-[calc(100%-2.5rem)]"
                viewBox="0 0 2 100"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M1 0 V100"
                  stroke="#51e07e"
                  strokeOpacity="0.55"
                  strokeWidth="2"
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.15 + role.log.length * 0.13, ease: 'linear' }}
                />
              </svg>
              {role.log.map((entry, i) => (
                <motion.li key={i} custom={i} variants={entryVariants(reduced)} className="relative">
                  <motion.span
                    variants={dotVariants(reduced)}
                    className="absolute -left-9 sm:-left-11 top-5 ml-[7px] sm:ml-[11px] h-3 w-3 rounded-full border-2 border-pass bg-ink shadow-[0_0_12px_rgba(81,224,126,0.6)]"
                  />
                  <motion.div
                    variants={cardVariants(reduced)}
                    className="group bg-ink-2/90 hover:bg-ink-3 border border-line hover:border-pass-dim rounded-lg transition-colors p-4 sm:p-5 flex gap-4"
                  >
                    <motion.span
                      variants={checkVariants(reduced)}
                      className="text-pass font-mono text-sm pt-0.5 select-none origin-center"
                    >
                      ✓
                    </motion.span>
                    <div>
                      {entry.tag && (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-dim group-hover:text-pass transition-colors">
                          {entry.tag}
                        </span>
                      )}
                      <p className="mt-1 text-sm text-mist leading-relaxed group-hover:text-fog transition-colors">
                        {entry.text}
                      </p>
                    </div>
                  </motion.div>
                </motion.li>
              ))}
            </motion.ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
      <SectionHeader index="02" title="Experience" ghost="EXECUTION" note="// execution log, newest first" />
      <div className="mt-14 space-y-20">
        {experience.map((role) => (
          <article key={role.company} className="grid lg:grid-cols-[1fr_1.8fr] gap-8 lg:gap-14 items-start">
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
