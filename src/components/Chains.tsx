import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { Lock, LockOpen } from 'lucide-react'
import { GATES, locks, useLocks } from '../lib/locks'
import { guide } from '../lib/guide'

gsap.registerPlugin(useGSAP)

/* The page is chained shut. A gate sits before each section: a chain across the
 * page with a padlock labelled with an assertion. Scrolling past it passes the
 * assertion: the shackle pops, the chain snaps and falls away. Two chains hang
 * down the page edges and shorten with every lock; when the last one opens they
 * drop, party poppers fire, and the contact section offers the next adventure. */

// one chain link: an oval plus the edge-on link that joins the next one
const LINK_H =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='34' height='16'%3E%3Crect x='1.5' y='3' width='20' height='10' rx='5' fill='none' stroke='black' stroke-width='2.6'/%3E%3Crect x='17' y='6.6' width='17' height='2.8' rx='1.4'/%3E%3C/svg%3E\")"
const LINK_V =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='34'%3E%3Crect x='3' y='1.5' width='10' height='20' rx='5' fill='none' stroke='black' stroke-width='2.6'/%3E%3Crect x='6.6' y='17' width='2.8' height='17' rx='1.4'/%3E%3C/svg%3E\")"

const chainStyle = (vertical = false) => ({
  WebkitMaskImage: vertical ? LINK_V : LINK_H,
  maskImage: vertical ? LINK_V : LINK_H,
  WebkitMaskRepeat: vertical ? 'repeat-y' : 'repeat-x',
  maskRepeat: vertical ? 'repeat-y' : 'repeat-x',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
})

function Padlock({ shackleRef }: { shackleRef?: React.Ref<SVGPathElement> }) {
  return (
    <svg viewBox="0 0 40 48" className="h-12 w-10" aria-hidden>
      <path
        ref={shackleRef}
        d="M12 23 V15 a8 8 0 0 1 16 0 V23"
        fill="none"
        stroke="var(--color-mist)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="5" y="21" width="30" height="24" rx="5" fill="var(--color-ink-3)" stroke="var(--color-line-2)" strokeWidth="2" />
      <circle cx="20" cy="31" r="3.2" fill="var(--color-dim)" />
      <rect x="18.6" y="32" width="2.8" height="7" rx="1.2" fill="var(--color-dim)" />
    </svg>
  )
}

export function ChainGate({ id }: { id: (typeof GATES)[number]['id'] }) {
  const reduced = !!useReducedMotion()
  const open = useLocks().has(id)
  const assertion = GATES.find((g) => g.id === id)!.assertion
  const index = GATES.findIndex((g) => g.id === id) + 1
  const scope = useRef<HTMLDivElement>(null)
  const shackle = useRef<SVGPathElement>(null)
  const played = useRef(false)

  useGSAP(
    () => {
      if (!open || played.current) return
      played.current = true
      const q = gsap.utils.selector(scope)
      const tl = gsap.timeline()
      tl.to(q('.gate-lock'), { x: 4, duration: 0.05, repeat: 5, yoyo: true, ease: 'none' })
        .to(shackle.current, { y: -7, rotate: -38, svgOrigin: '28 23', duration: 0.35, ease: 'back.out(3)' })
        .to(q('.gate-left'), { rotate: 16, y: 70, opacity: 0, transformOrigin: '0% 50%', duration: 0.9, ease: 'power2.in' }, '+=0.05')
        .to(q('.gate-right'), { rotate: -16, y: 70, opacity: 0, transformOrigin: '100% 50%', duration: 0.9, ease: 'power2.in' }, '<')
        .to(q('.gate-lock'), { y: 110, rotate: 28, opacity: 0, duration: 0.8, ease: 'power2.in' }, '<+0.12')
        .fromTo(q('.gate-pass'), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.4)' }, '-=0.45')
      if (reduced) tl.progress(1)
      guide.react('celebrate', `${assertion} passed. ${locks.total - index} lock${locks.total - index === 1 ? '' : 's'} to go.`)
    },
    { dependencies: [open], scope },
  )

  return (
    <div id={`gate-${id}`} ref={scope} aria-hidden className="relative h-28 sm:h-32 overflow-x-clip">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center">
        <div className="gate-left h-4 flex-1 bg-line-2" style={chainStyle()} />
        <div className="gate-lock relative mx-1 shrink-0 flex flex-col items-center">
          <Padlock shackleRef={shackle} />
          <span className="absolute top-full mt-1 whitespace-nowrap font-mono text-[10px] sm:text-[11px] text-dim">
            {assertion}
          </span>
        </div>
        <div className="gate-right h-4 flex-1 bg-line-2" style={chainStyle()} />
      </div>
      <div className="gate-pass absolute inset-0 grid place-items-center opacity-0">
        <span className="rounded-full border border-pass-dim bg-ink-2/90 px-3 py-1 font-mono text-[10px] sm:text-[11px] text-pass">
          ✓ {assertion} · lock {index}/{locks.total} released
        </span>
      </div>
    </div>
  )
}

/** Chains hanging down both page edges; they shorten as locks open and drop
 *  when the suite is free. Also owns the finale (party poppers). */
export function ChainFrame() {
  const reduced = !!useReducedMotion()
  const opened = useLocks().size
  const free = opened === locks.total
  const left = useRef<HTMLDivElement>(null)
  const right = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const els = [left.current, right.current]
      if (free) {
        gsap.to(els, { y: '110vh', rotate: (i) => (i ? -12 : 12), duration: reduced ? 0 : 1.2, ease: 'power2.in' })
        return
      }
      // each released lock winds the chains up and out of the way
      gsap.to(els, { y: `${-(opened / locks.total) * 82}vh`, duration: reduced ? 0 : 0.9, ease: 'elastic.out(1, 0.45)' })
    },
    { dependencies: [opened, free] },
  )

  useEffect(() => {
    if (!free) return
    guide.react('celebrate', 'All assertions passed. The suite is free!')
    let cancelled = false
    import('canvas-confetti').then(({ default: confetti }) => {
      if (cancelled) return
      const colors = ['#51e07e', '#f6b94a', '#7cc4ff', '#f479c0', '#b69cff', '#e9ede7']
      const pop = (x: number, angle: number) =>
        confetti({ particleCount: 110, angle, spread: 60, startVelocity: 62, origin: { x, y: 1 }, colors, disableForReducedMotion: true })
      pop(0, 60)
      pop(1, 120)
      window.setTimeout(() => {
        pop(0.15, 70)
        pop(0.85, 110)
      }, 380)
    })
    return () => {
      cancelled = true
    }
  }, [free])

  const hang = 'fixed top-0 z-20 hidden lg:flex flex-col items-center pointer-events-none'
  return (
    <>
      <div ref={left} aria-hidden className={`${hang} left-2`} style={{ height: '100vh' }}>
        <div className="w-4 flex-1 bg-line-2" style={chainStyle(true)} />
        <div className="scale-75 -mt-1">
          <Padlock />
        </div>
      </div>
      <div ref={right} aria-hidden className={`${hang} right-2`} style={{ height: '100vh' }}>
        <div className="w-4 flex-1 bg-line-2" style={chainStyle(true)} />
        <div className="scale-75 -mt-1">
          <Padlock />
        </div>
      </div>
    </>
  )
}

/** Nav readout: locks left, then "suite free". */
export function LockCounter() {
  const opened = useLocks().size
  const free = opened === locks.total
  return (
    <motion.span
      key={free ? 'free' : 'locked'}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] rounded-full border px-2.5 py-1 ${
        free ? 'border-pass text-pass' : 'border-line-2 text-mist'
      }`}
      aria-live="polite"
      title="Scroll past each assertion to release its lock"
    >
      {free ? <LockOpen size={12} /> : <Lock size={12} />}
      {free ? 'suite free' : `${locks.total - opened} lock${locks.total - opened === 1 ? '' : 's'}`}
    </motion.span>
  )
}
