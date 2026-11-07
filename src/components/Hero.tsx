import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDownToLine, Mail, RotateCcw } from 'lucide-react'
import { heroSpecs, identity } from '../data/resume'
import { Magnetic, Tilt } from './ui'

const CMD = 'npx career run --candidate ansh-kumar --ci'

/** Phases: 0 typing command · 1..n revealing spec lines · done = summary shown */
function useTerminalRun() {
  const reduced = useReducedMotion()
  const [typed, setTyped] = useState(reduced ? CMD : '')
  const [lines, setLines] = useState(reduced ? heroSpecs.length : 0)
  const [done, setDone] = useState(!!reduced)
  const timers = useRef<number[]>([])

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  const run = () => {
    clear()
    if (reduced) {
      setTyped(CMD)
      setLines(heroSpecs.length)
      setDone(true)
      return
    }
    setTyped('')
    setLines(0)
    setDone(false)
    let t = 400
    CMD.split('').forEach((_, i) => {
      t += 24
      timers.current.push(window.setTimeout(() => setTyped(CMD.slice(0, i + 1)), t))
    })
    t += 500
    heroSpecs.forEach((_, i) => {
      t += 380
      timers.current.push(window.setTimeout(() => setLines(i + 1), t))
    })
    t += 450
    timers.current.push(window.setTimeout(() => setDone(true), t))
  }

  useEffect(() => {
    run()
    return clear
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  return { typed, lines, done, run }
}

function Terminal() {
  const { typed, lines, done, run } = useTerminalRun()
  const totalMs = heroSpecs.reduce((a, s) => a + s.ms, 0)

  return (
    <div className="rounded-lg border border-line-2 bg-ink-2/95 backdrop-blur-sm shadow-[0_24px_80px_-24px_rgba(0,0,0,0.9)] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-ink-3">
        <span className="h-2.5 w-2.5 rounded-full bg-fail/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-flaky/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-pass/70" />
        <span className="ml-3 font-mono text-[11px] text-dim">career.spec.ts — ci</span>
        <button
          onClick={run}
          aria-label="Replay terminal animation"
          className="ml-auto text-dim hover:text-pass transition-colors"
        >
          <RotateCcw size={13} />
        </button>
      </div>
      <div className="p-4 sm:p-5 font-mono text-[12.5px] sm:text-[13px] leading-relaxed min-h-[290px]">
        <p className="text-mist">
          <span className="text-pass">❯</span> {typed}
          {!done && <span className="cursor-blink text-pass">▍</span>}
        </p>
        {lines > 0 && (
          <p className="mt-3 text-dim">
            <span className="bg-flaky/15 text-flaky px-1.5 py-0.5 rounded-sm text-[11px]">RUNS</span>{' '}
            career.spec.ts
          </p>
        )}
        <ul className="mt-2 space-y-1.5" aria-label="Career highlights">
          {heroSpecs.slice(0, lines).map((s) => (
            <li key={s.label} className="text-mist">
              <span className="text-pass">✓</span> {s.label}{' '}
              <span className="text-dim">({s.ms} ms)</span>
            </li>
          ))}
        </ul>
        {done && (
          <div className="mt-4 space-y-0.5">
            <p className="text-mist">
              Tests: <span className="text-pass">{heroSpecs.length} passed</span>,{' '}
              {heroSpecs.length} total
            </p>
            <p className="text-dim">Time: {(totalMs / 1000).toFixed(3)} s · 2.5+ yrs uptime</p>
            <p className="mt-2">
              <span className="bg-pass/15 text-pass px-1.5 py-0.5 rounded-sm text-[11px]">PASS</span>{' '}
              <span className="text-mist">all checks green — candidate ready to ship</span>
              <span className="cursor-blink text-pass"> ▍</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/** Kinetic name: each letter rises out of its own clip mask, staggered. */
function KineticName() {
  const reduced = useReducedMotion()
  const lines = ['Ansh', 'Kumar.']
  let letterIndex = 0
  return (
    <h1 className="mt-5 font-display font-extrabold tracking-[-0.03em] leading-[0.95] text-fog text-[clamp(3rem,9vw,6.5rem)]">
      {lines.map((line) => (
        <span key={line} className="block overflow-hidden pb-[0.06em] -mb-[0.06em]">
          {line.split('').map((ch, i) => {
            const d = 0.35 + letterIndex++ * 0.045
            return (
              <motion.span
                key={i}
                className={`inline-block will-change-transform ${ch === '.' ? 'text-pass' : ''}`}
                initial={reduced ? { opacity: 0 } : { y: '110%', rotate: 9 }}
                animate={reduced ? { opacity: 1 } : { y: 0, rotate: 0 }}
                transition={{ duration: 0.85, delay: d, ease: [0.22, 1, 0.36, 1] }}
              >
                {ch}
              </motion.span>
            )
          })}
        </span>
      ))}
    </h1>
  )
}

export default function Hero() {
  const reduced = useReducedMotion()
  const rise = (delay: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 34 },
    animate: reduced ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
  })

  return (
    <section id="top" className="relative hero-grid overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-32 pb-20 lg:pt-40 lg:pb-28 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-14 items-center">
        <div>
          <motion.p {...rise(0.05)} className="font-mono text-xs sm:text-sm text-pass tracking-widest">
            // {identity.location.toUpperCase()} · SDET · ALL CHECKS PASSING
          </motion.p>
          <KineticName />
          <motion.p {...rise(0.75)} className="mt-6 max-w-xl text-mist text-base sm:text-lg leading-relaxed">
            I don’t just write tests — I engineer the systems that decide which tests run, catch the
            ones that lie, and report the truth to 25,000+ cases’ worth of CI.
          </motion.p>
          <motion.div {...rise(0.9)} className="mt-9 flex flex-wrap items-center gap-4">
            <Magnetic>
              <a
                href={identity.resumeFile}
                download="Ansh_Kumar_Resume.pdf"
                className="inline-flex items-center gap-2.5 bg-pass text-ink font-mono text-sm font-semibold rounded px-5 py-3 hover:bg-fog transition-colors"
              >
                <ArrowDownToLine size={16} />
                download résumé
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#contact"
                className="inline-flex items-center gap-2.5 border border-line-2 text-fog font-mono text-sm rounded px-5 py-3 hover:border-pass hover:text-pass transition-colors"
              >
                <Mail size={16} />
                get in touch
              </a>
            </Magnetic>
          </motion.div>
        </div>
        <motion.div {...rise(1.05)}>
          <Tilt>
            <Terminal />
          </Tilt>
        </motion.div>
      </div>
    </section>
  )
}
