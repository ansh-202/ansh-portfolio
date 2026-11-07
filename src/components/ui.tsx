import { useRef } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import type { ReactNode } from 'react'

type RevealFrom = 'up' | 'left' | 'right'

const offsets: Record<RevealFrom, { x: number; y: number; rotateX: number; rotateY: number }> = {
  up: { x: 0, y: 32, rotateX: 10, rotateY: 0 },
  left: { x: -48, y: 0, rotateX: 0, rotateY: 14 },
  right: { x: 48, y: 0, rotateX: 0, rotateY: -14 },
}

export function Reveal({
  children,
  delay = 0,
  className,
  from = 'up',
}: {
  children: ReactNode
  delay?: number
  className?: string
  from?: RevealFrom
}) {
  const reduced = useReducedMotion()
  const o = offsets[from]
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, ...o }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, x: 0, y: 0, rotateX: 0, rotateY: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      style={reduced ? undefined : { transformPerspective: 900 }}
    >
      {children}
    </motion.div>
  )
}

/** Awwwards-style masked line reveal: content rises out of a clipped box. */
export function MaskReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  return (
    <span className={`inline-block overflow-hidden align-bottom ${className ?? ''}`}>
      <motion.span
        className="inline-block will-change-transform"
        initial={reduced ? { opacity: 0 } : { y: '115%', rotate: 4 }}
        whileInView={reduced ? { opacity: 1 } : { y: 0, rotate: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/** 3D perspective tilt that follows the cursor. Inert on touch / reduced motion. */
export function Tilt({
  children,
  max = 8,
  className,
}: {
  children: ReactNode
  max?: number
  className?: string
}) {
  const reduced = useReducedMotion()
  const rx = useSpring(useMotionValue(0), { stiffness: 140, damping: 18 })
  const ry = useSpring(useMotionValue(0), { stiffness: 140, damping: 18 })

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 1.25)
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * max)
      }}
      onMouseLeave={() => {
        rx.set(0)
        ry.set(0)
      }}
      className={`will-change-transform ${className ?? ''}`}
    >
      {children}
    </motion.div>
  )
}

/** Magnetic element: drifts toward the cursor while hovered, springs back. */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const reduced = useReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 180, damping: 14 })
  const y = useSpring(useMotionValue(0), { stiffness: 180, damping: 14 })

  if (reduced) return <>{children}</>

  return (
    <motion.div
      className="inline-block"
      style={{ x, y }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeader({
  index,
  title,
  note,
  ghost,
}: {
  index: string
  title: string
  note?: string
  ghost?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const ghostX = useTransform(scrollYProgress, [0, 1], ['6%', '-14%'])

  return (
    <div ref={ref} className="relative">
      {ghost && (
        <motion.span
          aria-hidden
          style={reduced ? undefined : { x: ghostX }}
          className="text-ghost pointer-events-none absolute -top-10 sm:-top-20 left-0 font-display font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap text-[clamp(5rem,16vw,12rem)] opacity-60"
        >
          {ghost}
        </motion.span>
      )}
      <div className="relative flex items-baseline gap-4 sm:gap-6 pt-8 sm:pt-14">
        <span className="font-mono text-xs sm:text-sm text-pass tracking-widest">{index}</span>
        <h2 className="font-display font-bold tracking-tight text-fog text-3xl sm:text-5xl">
          <MaskReveal>{title}</MaskReveal>
        </h2>
        {note && (
          <span className="hidden md:inline font-mono text-xs text-dim ml-auto">{note}</span>
        )}
      </div>
      <Reveal>
        <div className="rule-dotted mt-6 w-full" />
      </Reveal>
    </div>
  )
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-wider text-mist border border-line rounded-full px-2.5 py-0.5">
      {children}
    </span>
  )
}
