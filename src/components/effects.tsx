import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import type { MotionValue } from 'framer-motion'

/** Spotlight card: a radial glow follows the cursor across the surface and
 *  lights the border beneath it. Pure CSS gradients driven by motion values,
 *  so it never re-renders React on mouse move. */
export function SpotlightCard({
  children,
  className = '',
  radius = 320,
}: {
  children: ReactNode
  className?: string
  radius?: number
}) {
  const x = useMotionValue(-1000)
  const y = useMotionValue(-1000)
  const glow = useMotionTemplate`radial-gradient(${radius}px circle at ${x}px ${y}px, color-mix(in oklab, var(--color-pass) 13%, transparent), transparent 70%)`
  const rim = useMotionTemplate`radial-gradient(${radius * 0.7}px circle at ${x}px ${y}px, color-mix(in oklab, var(--color-pass) 55%, transparent), transparent 70%)`

  return (
    <div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        x.set(e.clientX - r.left)
        y.set(e.clientY - r.top)
      }}
      onMouseLeave={() => {
        x.set(-1000)
        y.set(-1000)
      }}
      className={`group/spot relative rounded-xl p-px bg-line ${className}`}
    >
      {/* lit rim: shows through the 1px padding as a border */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-xl opacity-0 group-hover/spot:opacity-100 transition-opacity duration-300"
        style={{ background: rim }}
      />
      <div className="relative h-full rounded-[11px] bg-ink-2/95 overflow-hidden">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover/spot:opacity-100 transition-opacity duration-300"
          style={{ background: glow }}
        />
        <div className="relative h-full">{children}</div>
      </div>
    </div>
  )
}

/** Number ticker: counts up from zero the first time it scrolls into view. */
export function NumberTicker({
  value,
  prefix = '',
  suffix = '',
  className = '',
}: {
  value: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduced = useReducedMotion()
  const [n, setN] = useState(reduced ? value : 0)

  useEffect(() => {
    if (!inView || reduced) return
    const controls = animate(0, value, {
      duration: value > 100 ? 2 : 1.3,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, reduced, value])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {n.toLocaleString('en-US')}
      {suffix}
    </span>
  )
}

function Word({
  children,
  progress,
  range,
}: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
}) {
  const opacity = useTransform(progress, range, [0.14, 1])
  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.28em]">
      {children}
    </motion.span>
  )
}

/** Text scroll reveal: each word brightens in turn as the paragraph scrolls
 *  through the viewport — reading pace is set by the scroll. */
export function TextScrollReveal({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.45'],
  })
  const words = text.split(' ')

  if (reduced) return <p className={className}>{text}</p>

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </p>
  )
}
