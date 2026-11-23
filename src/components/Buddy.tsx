import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'
import type { MotionValue, TargetAndTransition } from 'framer-motion'
import { X } from 'lucide-react'
import { guide, script, useGuide } from '../lib/guide'
import type { Mood } from '../lib/guide'

/* Probe, drawn in 2D. On a mouse or trackpad it trails the cursor on a lazy
 * spring, leans into the motion, turns to face where it is going, and wanders
 * when the cursor rests. Each section hands it a different job (reading the
 * spec, holding a magnifier, catching stars, fixing, carrying, typing, popping
 * a party popper). On touch, or with reduced motion, it docks in the corner. */

type Action = 'wave' | 'read' | 'inspect' | 'stars' | 'cheer' | 'fix' | 'carry' | 'type' | 'pop'

const SECTION_ACTION: Record<string, Action> = {
  top: 'wave',
  about: 'read',
  story: 'inspect',
  experience: 'stars',
  impact: 'cheer',
  skills: 'fix',
  projects: 'carry',
  writing: 'type',
  contact: 'pop',
}
const REACTION_ACTION: Record<Mood, Action> = {
  wave: 'wave',
  idle: 'read',
  inspect: 'inspect',
  celebrate: 'cheer',
  tool: 'fix',
}

const INK = '#0b0d0b'
const BODY = '#e9ede7'
const SHADE = '#c9d0c6'
const ACCENT = 'var(--color-pass)'
const HIDE_KEY = 'probe-hidden'
const SIZE = { w: 92, h: 110 }

const QUIPS = [
  'I follow you around. Professionally.',
  'Every section has a lock. Keep scrolling.',
  'Assertions first, opinions later.',
  'Five bugs are hiding on this page.',
]

const readHidden = () => {
  try {
    return localStorage.getItem(HIDE_KEY) === '1'
  } catch {
    return false
  }
}
const writeHidden = (v: boolean) => {
  try {
    localStorage.setItem(HIDE_KEY, v ? '1' : '0')
  } catch {
    /* storage blocked: the choice lasts for this visit only */
  }
}

const loop = (frames: TargetAndTransition, duration = 1.2): TargetAndTransition => ({
  ...frames,
  transition: { duration, repeat: Infinity, ease: 'easeInOut' },
})

/* arm angles (degrees, 0 = hanging down; negative = raised outward) */
function arms(action: Action, still: boolean) {
  const L = (a: number | number[]) => ({ rotate: a })
  const pose: Record<Action, [TargetAndTransition, TargetAndTransition]> = {
    wave: [L(10), still ? L(-140) : loop({ rotate: [-150, -110, -150] }, 0.7)],
    read: [L(-55), L(55)],
    inspect: [L(15), still ? L(-95) : loop({ rotate: [-100, -80, -100] }, 1.6)],
    stars: [still ? L(-150) : loop({ rotate: [-150, -135, -150] }, 1.1), still ? L(150) : loop({ rotate: [150, 135, 150] }, 1.1)],
    cheer: [still ? L(-160) : loop({ rotate: [-165, -130, -165] }, 0.45), still ? L(160) : loop({ rotate: [165, 130, 165] }, 0.45)],
    fix: [L(15), still ? L(-70) : loop({ rotate: [-85, -40, -85] }, 0.5)],
    carry: [L(-170), L(170)],
    type: [still ? L(-50) : loop({ rotate: [-55, -45, -55] }, 0.25), still ? L(50) : loop({ rotate: [45, 55, 45] }, 0.25)],
    pop: [L(15), L(-120)],
  }
  return pose[action]
}

function Props({ action, still }: { action: Action; still: boolean }) {
  switch (action) {
    case 'read':
      return (
        <g>
          <path d="M30 76 L50 80 L70 76 L70 92 L50 96 L30 92 Z" fill={BODY} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M50 80 V96" stroke={INK} strokeWidth="2" />
          <path d="M35 83 h10 M35 87 h10 M55 83 h10 M55 87 h8" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )
    case 'stars':
      return (
        <motion.g
          style={{ originX: '50px', originY: '14px' }}
          animate={still ? undefined : { rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          {[0, 120, 240].map((a) => {
            const r = (a * Math.PI) / 180
            const x = 50 + Math.cos(r) * 26
            const y = 12 + Math.sin(r) * 8
            return (
              <path
                key={a}
                transform={`translate(${x} ${y})`}
                d="M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5 Z"
                fill={ACCENT}
                stroke={INK}
                strokeWidth="1"
              />
            )
          })}
        </motion.g>
      )
    case 'carry':
      return (
        <motion.g animate={still ? undefined : loop({ y: [0, -2, 0] }, 0.5)}>
          <rect x="30" y="-6" width="40" height="22" rx="3" fill="#d7b07a" stroke={INK} strokeWidth="2.5" />
          <path d="M30 2 h40 M50 -6 v8" stroke={INK} strokeWidth="2" />
          <text x="50" y="12" textAnchor="middle" fontSize="6" fontFamily="monospace" fill={INK}>PRJ</text>
        </motion.g>
      )
    case 'type':
      return (
        <g>
          <path d="M28 80 h44 l6 12 h-56 Z" fill={SHADE} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="31" y="64" width="38" height="16" rx="2" fill="#171b17" stroke={INK} strokeWidth="2.5" />
          <motion.path
            d="M35 70 h12 M35 74 h20"
            stroke={ACCENT}
            strokeWidth="1.8"
            strokeLinecap="round"
            animate={still ? undefined : loop({ opacity: [1, 0.3, 1] }, 0.6)}
          />
        </g>
      )
    case 'cheer':
      return still ? null : (
        <g>
          {[
            [16, 30],
            [84, 28],
            [22, 8],
            [78, 6],
          ].map(([x, y], i) => (
            <motion.path
              key={i}
              d={`M${x} ${y - 4} v8 M${x - 4} ${y} h8`}
              stroke={ACCENT}
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
              style={{ originX: `${x}px`, originY: `${y}px` }}
            />
          ))}
        </g>
      )
    default:
      return null
  }
}

/* something held in the right hand (drawn at the hand, rotates with the arm) */
function HandProp({ action }: { action: Action }) {
  if (action === 'inspect')
    return (
      <g transform="translate(0 22)">
        <line x1="0" y1="0" x2="0" y2="9" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <circle cx="0" cy="15" r="7" fill="rgba(233,237,231,0.25)" stroke={INK} strokeWidth="2.5" />
        <circle cx="0" cy="15" r="7" fill="none" stroke={ACCENT} strokeWidth="1" />
      </g>
    )
  if (action === 'fix')
    return (
      <g transform="translate(0 22)">
        <rect x="-2" y="0" width="4" height="14" rx="1.5" fill={SHADE} stroke={INK} strokeWidth="1.8" />
        <path d="M-6 14 a6 6 0 1 0 12 0 l-3 0 l0 4 l-6 0 l0 -4 Z" fill={SHADE} stroke={INK} strokeWidth="1.8" />
      </g>
    )
  if (action === 'pop')
    return (
      <g transform="translate(0 20)">
        <path d="M-4 0 L4 0 L9 16 L-9 16 Z" fill={ACCENT} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M-6 8 L6 8" stroke={INK} strokeWidth="1.4" />
      </g>
    )
  return null
}

function Arm({ side, pose, action }: { side: 'l' | 'r'; pose: TargetAndTransition; action: Action }) {
  const x = side === 'l' ? 33 : 67
  return (
    <motion.g
      style={{ originX: `${x}px`, originY: '68px' }}
      initial={false}
      animate={pose}
      transition={{ type: 'spring', stiffness: 260, damping: 16 }}
    >
      <line x1={x} y1="68" x2={x} y2="86" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      <line x1={x} y1="68" x2={x} y2="86" stroke={BODY} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={x} cy="88" r="4" fill={ACCENT} stroke={INK} strokeWidth="2" />
      {side === 'r' && <g transform={`translate(${x} 66)`}><HandProp action={action} /></g>}
    </motion.g>
  )
}

function Character({
  action,
  still,
  look,
}: {
  action: Action
  still: boolean
  look: { x: MotionValue<number>; y: MotionValue<number> }
}) {
  const [left, right] = arms(action, still)
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    if (still) return
    let t = 0
    const next = () => {
      t = window.setTimeout(() => {
        setBlink(true)
        window.setTimeout(() => setBlink(false), 130)
        next()
      }, 2000 + Math.random() * 2500)
    }
    next()
    return () => window.clearTimeout(t)
  }, [still])

  const hop =
    action === 'cheer' && !still
      ? loop({ y: [0, -10, 0] }, 0.45)
      : action === 'pop' && !still
        ? loop({ rotate: [-6, 6, -6] }, 0.6)
        : still
          ? { y: 0 }
          : loop({ y: [0, -3, 0] }, 2)

  return (
    <svg viewBox="-6 -14 112 134" width={SIZE.w} height={SIZE.h} className="overflow-visible">
      {/* ground shadow */}
      <ellipse cx="50" cy="116" rx="20" ry="3.5" fill="rgba(0,0,0,0.45)" />
      <motion.g animate={hop} style={{ originX: '50px', originY: '110px' }}>
        {/* thruster flame */}
        <motion.path
          d="M43 92 Q50 112 57 92 Z"
          fill={ACCENT}
          stroke={INK}
          strokeWidth="2"
          style={{ originX: '50px', originY: '92px' }}
          animate={still ? undefined : { scaleY: [1, 0.6, 1] }}
          transition={{ duration: 0.25, repeat: Infinity }}
        />
        <Arm side="l" pose={left} action={action} />
        {/* body */}
        <rect x="32" y="60" width="36" height="32" rx="12" fill={BODY} stroke={INK} strokeWidth="3" />
        <path d="M43 76 l5 5 l9 -10" fill="none" stroke={ACCENT} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <Arm side="r" pose={right} action={action} />
        {/* head */}
        <line x1="50" y1="21" x2="50" y2="8" stroke={INK} strokeWidth="3" />
        <motion.circle
          cx="50"
          cy="6"
          r="4"
          fill={ACCENT}
          stroke={INK}
          strokeWidth="2"
          animate={still ? undefined : { opacity: [1, 0.35, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
        <rect x="20" y="20" width="60" height="42" rx="19" fill={BODY} stroke={INK} strokeWidth="3" />
        <circle cx="21" cy="41" r="4.5" fill={SHADE} stroke={INK} strokeWidth="2.5" />
        <circle cx="79" cy="41" r="4.5" fill={SHADE} stroke={INK} strokeWidth="2.5" />
        {/* lens eye; the pupil looks toward the cursor */}
        <circle cx="50" cy="41" r="13" fill="#171b17" stroke={INK} strokeWidth="3" />
        <circle cx="50" cy="41" r="11" fill="none" stroke={ACCENT} strokeWidth="1.6" />
        <motion.g style={{ x: look.x, y: look.y }} animate={{ scaleY: blink ? 0.1 : 1 }} transition={{ duration: 0.08 }}>
          <circle cx="50" cy="41" r="5" fill={ACCENT} />
          <circle cx="52.5" cy="38.5" r="1.6" fill={BODY} />
        </motion.g>
        <Props action={action} still={still} />
      </motion.g>
    </svg>
  )
}

export default function Buddy({ ready }: { ready: boolean }) {
  const reduced = !!useReducedMotion()
  const { section, pulse, reaction, line } = useGuide()
  const [follow, setFollow] = useState(false)
  const [hidden, setHidden] = useState(readHidden)
  const [bubble, setBubble] = useState<string | null>(null)
  const [held, setHeld] = useState<Action | null>(null)
  const quip = useRef(0)

  // position: target follows the cursor; the drawn position springs after it
  const tx = useMotionValue(0)
  const ty = useMotionValue(0)
  const x = useSpring(tx, { stiffness: 70, damping: 16, mass: 1.1 })
  const y = useSpring(ty, { stiffness: 70, damping: 16, mass: 1.1 })
  const vx = useVelocity(x)
  const lean = useTransform(vx, [-1400, 0, 1400], [-16, 0, 16], { clamp: true })
  const [facingLeft, setFacingLeft] = useState(false)
  const lookX = useMotionValue(0)
  const lookY = useMotionValue(0)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setFollow(fine.matches && !reduced)
    update()
    fine.addEventListener('change', update)
    return () => fine.removeEventListener('change', update)
  }, [reduced])

  // follow the cursor; wander a little when it rests
  useEffect(() => {
    if (!follow) return
    const place = (cx: number, cy: number) => {
      const nx = Math.min(window.innerWidth - SIZE.w - 8, Math.max(8, cx + 28))
      const ny = Math.min(window.innerHeight - SIZE.h - 8, Math.max(64, cy + 22))
      tx.set(nx)
      ty.set(ny)
    }
    const start = { x: window.innerWidth * 0.7, y: window.innerHeight * 0.6 }
    x.jump(start.x)
    y.jump(start.y)
    place(start.x, start.y)
    let rest = 0
    let wander = 0
    const cursor = { x: start.x, y: start.y }
    const roam = () => {
      wander = window.setInterval(() => {
        place(cursor.x + (Math.random() - 0.5) * 220, cursor.y + (Math.random() - 0.5) * 140)
      }, 2400)
    }
    const move = (e: PointerEvent) => {
      cursor.x = e.clientX
      cursor.y = e.clientY
      place(e.clientX, e.clientY)
      window.clearTimeout(rest)
      window.clearInterval(wander)
      rest = window.setTimeout(roam, 2600)
      // pupil looks at the cursor
      const dx = e.clientX - (x.get() + SIZE.w / 2)
      const dy = e.clientY - (y.get() + SIZE.h * 0.38)
      const d = Math.hypot(dx, dy) || 1
      lookX.set((dx / d) * 3.5)
      lookY.set((dy / d) * 3.5)
    }
    window.addEventListener('pointermove', move, { passive: true })
    rest = window.setTimeout(roam, 2600)
    const unsub = vx.on('change', (v) => {
      if (Math.abs(v) > 60) setFacingLeft(v < 0)
    })
    return () => {
      window.removeEventListener('pointermove', move)
      window.clearTimeout(rest)
      window.clearInterval(wander)
      unsub()
    }
  }, [follow, tx, ty, x, y, vx, lookX, lookY])

  // section line, then reactions override it briefly
  useEffect(() => {
    if (!ready) return
    setBubble(script[section]?.line ?? null)
    const t = window.setTimeout(() => setBubble(null), 4200)
    return () => window.clearTimeout(t)
  }, [section, ready])

  useEffect(() => {
    if (!reaction || !line) return
    setBubble(line)
    setHeld(REACTION_ACTION[reaction])
    const t1 = window.setTimeout(() => setHeld(null), 1800)
    const t2 = window.setTimeout(() => setBubble(null), 3400)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [pulse, reaction, line])

  if (!ready) return null

  const action = held ?? SECTION_ACTION[section] ?? 'wave'
  const still = reduced
  const hide = (v: boolean) => {
    setHidden(v)
    writeHidden(v)
  }

  const toggle = (
    <button
      onClick={() => hide(!hidden)}
      className="fixed z-40 font-mono text-[11px] text-mist border border-line-2 bg-ink-2/90 rounded-full px-3 py-1.5 hover:text-pass hover:border-pass transition-colors"
      style={{
        right: 'max(12px, env(safe-area-inset-right, 0px))',
        bottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
      }}
    >
      {hidden ? 'show Probe' : 'hide Probe'}
    </button>
  )

  const speech = (
    <AnimatePresence>
      {bubble && (
        <motion.div
          key={bubble}
          initial={{ opacity: 0, y: 6, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-full right-0 mb-1 w-max max-w-[220px] rounded-lg border border-pass-dim bg-ink-2/95 px-3 py-2 font-mono text-[11.5px] leading-snug text-fog shadow-[0_12px_30px_-12px_rgba(0,0,0,0.8)]"
          role="status"
          aria-live="polite"
        >
          {bubble}
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (hidden) return toggle

  if (follow) {
    return (
      <>
        <motion.div
          aria-hidden
          className="fixed left-0 top-0 z-40 pointer-events-none"
          style={{ x, y, rotate: lean, width: SIZE.w, height: SIZE.h }}
        >
          {speech}
          <div style={{ transform: facingLeft ? 'scaleX(-1)' : undefined }}>
            <Character action={action} still={still} look={{ x: lookX, y: lookY }} />
          </div>
        </motion.div>
        {toggle}
      </>
    )
  }

  // docked: touch devices and reduced motion
  return (
    <div
      className="fixed z-40"
      style={{
        right: 'max(6px, env(safe-area-inset-right, 0px))',
        bottom: 'max(6px, env(safe-area-inset-bottom, 0px))',
      }}
    >
      {speech}
      <button
        onClick={() => guide.react('wave', QUIPS[quip.current++ % QUIPS.length])}
        aria-label="Probe, the guide bot. Tap for a message."
        className="block scale-[0.72] sm:scale-100 origin-bottom-right"
      >
        <Character action={action} still={still} look={{ x: lookX, y: lookY }} />
      </button>
      <button
        onClick={() => hide(true)}
        aria-label="Hide Probe"
        className="absolute -top-1 -left-1 h-6 w-6 grid place-items-center rounded-full bg-ink-3 border border-line-2 text-dim hover:text-pass"
      >
        <X size={12} />
      </button>
    </div>
  )
}
