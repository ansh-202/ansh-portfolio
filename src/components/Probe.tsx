import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { ThreeElements } from '@react-three/fiber'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import * as THREE from 'three'
import { guide, script, useGuide } from '../lib/guide'
import type { Mood } from '../lib/guide'

/* Probe — the site's guide: a cel-shaded inspector bot built from primitives.
 * Flat 3-tone toon shading plus inverted-hull ink outlines give a 2D cartoon
 * read inside a real 3D scene. It lives in a small fixed canvas (cheap to
 * render), follows the cursor with its lens eye, and changes pose per section. */

const INK = '#0b0d0b'
const SHELL = '#e9ede7'
const PASS = '#51e07e'
const GLASS = '#0f1d14'

const SECTIONS = ['top', 'about', 'story', 'experience', 'impact', 'skills', 'projects', 'writing', 'contact']

function useToonRamp() {
  return useMemo(() => {
    const tex = new THREE.DataTexture(new Uint8Array([95, 175, 255]), 3, 1, THREE.RedFormat)
    tex.minFilter = THREE.NearestFilter
    tex.magFilter = THREE.NearestFilter
    tex.needsUpdate = true
    return tex
  }, [])
}

/** A mesh plus its ink outline (back faces of a slightly larger copy). */
function Inked({
  children,
  color,
  ramp,
  outline = 1.06,
  ...props
}: {
  children: ReactNode
  color: string
  ramp: THREE.Texture
  outline?: number
} & ThreeElements['group']) {
  return (
    <group {...props}>
      <mesh>
        {children}
        <meshToonMaterial color={color} gradientMap={ramp} />
      </mesh>
      <mesh scale={outline}>
        {children}
        <meshBasicMaterial color={INK} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

function Bot({
  mood,
  pointer,
  animate,
}: {
  mood: Mood
  pointer: React.MutableRefObject<{ x: number; y: number }>
  animate: boolean
}) {
  const ramp = useToonRamp()
  const root = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const pupil = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const tip = useRef<THREE.MeshBasicMaterial>(null)
  const flame = useRef<THREE.Mesh>(null)
  const magnifier = useRef<THREE.Group>(null)
  const wrench = useRef<THREE.Group>(null)
  const entered = useRef(animate ? 0 : 1)
  const spin = useRef(0)
  const lastMood = useRef<Mood>(mood)
  const { invalidate } = useThree()

  useEffect(() => {
    if (mood === 'celebrate' && lastMood.current !== 'celebrate') spin.current = 0
    lastMood.current = mood
    invalidate()
  }, [mood, invalidate])

  useFrame((state, dt) => {
    const t = animate ? state.clock.elapsedTime : 0
    const k = animate ? Math.min(1, dt * 8) : 1
    const lerp = THREE.MathUtils.lerp
    if (!root.current || !head.current || !armL.current || !armR.current) return

    // entrance: drop in from above once
    if (animate && entered.current < 1) entered.current = Math.min(1, entered.current + dt * 1.1)
    const e = 1 - Math.pow(1 - entered.current, 3)

    const bob = animate ? Math.sin(t * 2.2) * 0.08 : 0
    let jump = 0
    if (mood === 'celebrate' && animate) {
      jump = Math.abs(Math.sin(t * 5)) * 0.35
      spin.current = Math.min(Math.PI * 2, spin.current + dt * 7)
    }
    root.current.position.y = (1 - e) * 5 + bob + jump
    root.current.rotation.y = mood === 'celebrate' ? spin.current : lerp(root.current.rotation.y, 0, k)

    // eye and head follow the cursor
    const px = THREE.MathUtils.clamp(pointer.current.x, -1, 1)
    const py = THREE.MathUtils.clamp(pointer.current.y, -1, 1)
    const scan = mood === 'inspect' && animate ? Math.sin(t * 1.6) * 0.35 : 0
    head.current.rotation.y = lerp(head.current.rotation.y, px * 0.55 + scan, k)
    head.current.rotation.x = lerp(head.current.rotation.x, -py * 0.3, k)
    if (pupil.current) {
      pupil.current.position.x = lerp(pupil.current.position.x, px * 0.14, k)
      pupil.current.position.y = lerp(pupil.current.position.y, py * 0.12, k)
    }

    // arms per mood (rotation.z swings the arm out from the shoulder)
    const sway = animate ? Math.sin(t * 2.2) * 0.08 : 0
    let l = -0.3 - sway
    let r = 0.3 + sway
    let rx = 0
    if (mood === 'wave') r = 2.5 + (animate ? Math.sin(t * 9) * 0.35 : 0)
    if (mood === 'celebrate') {
      l = -2.6
      r = 2.6
    }
    if (mood === 'inspect' || mood === 'tool') {
      r = 0.7
      rx = -1.35
    }
    armL.current.rotation.z = lerp(armL.current.rotation.z, l, k)
    armR.current.rotation.z = lerp(armR.current.rotation.z, r, k)
    armR.current.rotation.x = lerp(armR.current.rotation.x, rx, k)
    if (magnifier.current) magnifier.current.visible = mood === 'inspect'
    if (wrench.current) wrench.current.visible = mood === 'tool'

    if (tip.current) tip.current.color.set(animate && Math.sin(t * 3) > 0.6 ? '#b8ffd0' : PASS)
    if (flame.current) {
      const f = animate ? 0.85 + Math.sin(t * 18) * 0.15 : 1
      flame.current.scale.set(1, f, 1)
    }
  })

  return (
    <group ref={root} position={[0, 5, 0]}>
      {/* body */}
      <Inked ramp={ramp} color={SHELL} position={[0, -0.55, 0]}>
        <capsuleGeometry args={[0.62, 0.5, 8, 24]} />
      </Inked>
      {/* chest badge with a check mark */}
      <group position={[0, -0.45, 0.6]}>
        <mesh>
          <circleGeometry args={[0.24, 32]} />
          <meshBasicMaterial color={PASS} />
        </mesh>
        <mesh position={[-0.055, -0.03, 0.01]} rotation={[0, 0, 0.8]}>
          <boxGeometry args={[0.04, 0.13, 0.01]} />
          <meshBasicMaterial color={INK} />
        </mesh>
        <mesh position={[0.04, 0.02, 0.01]} rotation={[0, 0, -0.6]}>
          <boxGeometry args={[0.04, 0.24, 0.01]} />
          <meshBasicMaterial color={INK} />
        </mesh>
      </group>

      {/* head */}
      <group ref={head} position={[0, 0.72, 0]}>
        <Inked ramp={ramp} color={SHELL} scale={[1.08, 0.9, 1]}>
          <sphereGeometry args={[0.7, 32, 24]} />
        </Inked>
        {/* lens eye */}
        <group position={[0, 0.02, 0.6]}>
          <mesh>
            <torusGeometry args={[0.32, 0.075, 12, 40]} />
            <meshToonMaterial color="#1c231d" gradientMap={ramp} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[0.31, 40]} />
            <meshBasicMaterial color={GLASS} />
          </mesh>
          <group ref={pupil} position={[0, 0, 0.05]}>
            <mesh>
              <sphereGeometry args={[0.12, 20, 16]} />
              <meshBasicMaterial color={PASS} />
            </mesh>
          </group>
          <mesh position={[0.13, 0.13, 0.08]}>
            <circleGeometry args={[0.045, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
        {/* ear bolts */}
        {[-1, 1].map((s) => (
          <Inked key={s} ramp={ramp} color={PASS} position={[s * 0.76, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.12, 20]} />
          </Inked>
        ))}
        {/* antenna */}
        <mesh position={[0, 0.78, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.32, 8]} />
          <meshBasicMaterial color={INK} />
        </mesh>
        <mesh position={[0, 0.98, 0]}>
          <sphereGeometry args={[0.09, 16, 12]} />
          <meshBasicMaterial ref={tip} color={PASS} />
        </mesh>
      </group>

      {/* arms: pivot at the shoulder, arm hangs down along -y */}
      <group ref={armL} position={[-0.74, -0.2, 0]}>
        <Inked ramp={ramp} color={SHELL} position={[0, -0.32, 0]}>
          <capsuleGeometry args={[0.11, 0.38, 6, 12]} />
        </Inked>
        <Inked ramp={ramp} color={PASS} position={[0, -0.62, 0]}>
          <sphereGeometry args={[0.14, 16, 12]} />
        </Inked>
      </group>
      <group ref={armR} position={[0.74, -0.2, 0]}>
        <Inked ramp={ramp} color={SHELL} position={[0, -0.32, 0]}>
          <capsuleGeometry args={[0.11, 0.38, 6, 12]} />
        </Inked>
        <Inked ramp={ramp} color={PASS} position={[0, -0.62, 0]}>
          <sphereGeometry args={[0.14, 16, 12]} />
        </Inked>
        {/* magnifier, shown while inspecting */}
        <group ref={magnifier} position={[0, -0.95, 0.05]} visible={false}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.3, 8]} />
            <meshBasicMaterial color={INK} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.04, 10, 28]} />
            <meshBasicMaterial color={INK} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.18, 28]} />
            <meshBasicMaterial color="#9fe8bb" transparent opacity={0.35} side={THREE.DoubleSide} />
          </mesh>
        </group>
        {/* wrench, shown at the toolbox */}
        <group ref={wrench} position={[0, -0.95, 0.05]} visible={false}>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.07, 0.42, 0.04]} />
            <meshBasicMaterial color={INK} />
          </mesh>
          <mesh position={[0, -0.08, 0]} rotation={[0, 0, Math.PI * 0.75]}>
            <torusGeometry args={[0.11, 0.045, 8, 20, Math.PI * 1.5]} />
            <meshBasicMaterial color={INK} />
          </mesh>
        </group>
      </group>

      {/* hover thruster */}
      <mesh ref={flame} position={[0, -1.6, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.16, 0.36, 16]} />
        <meshBasicMaterial color={PASS} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, -2.15, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.5, 1]}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial color={PASS} transparent opacity={0.12} />
      </mesh>
    </group>
  )
}

const HIDE_KEY = 'probe-hidden'
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
    /* storage unavailable: hiding just won't persist */
  }
}

const QUIPS = [
  'Still green. I checked twice.',
  'No flaky tests on my watch.',
  'Beep. Assertion passed.',
  'Try finding the 5 bugs hidden on this page.',
]

export default function Probe({ ready }: { ready: boolean }) {
  const reduced = !!useReducedMotion()
  const { section, reaction, line, pulse } = useGuide()
  const [hidden, setHidden] = useState(readHidden)
  const [bubble, setBubble] = useState<string | null>(null)
  const [held, setHeld] = useState<Mood | null>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const box = useRef<HTMLDivElement>(null)
  const quip = useRef(0)

  // which section is under the middle of the viewport
  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && guide.setSection(en.target.id)),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // cursor position relative to the bot, normalised to roughly -1..1
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const r = box.current?.getBoundingClientRect()
      if (!r) return
      pointer.current.x = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)
      pointer.current.y = -(e.clientY - (r.top + r.height * 0.35)) / (window.innerHeight / 2)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  // speech bubble: section line, then reactions override it briefly
  useEffect(() => {
    if (!ready) return
    setBubble(script[section]?.line ?? null)
    const t = window.setTimeout(() => setBubble(null), 4500)
    return () => window.clearTimeout(t)
  }, [section, ready])

  useEffect(() => {
    if (!reaction || !line) return
    setBubble(line)
    setHeld(reaction)
    const t1 = window.setTimeout(() => setHeld(null), 1800)
    const t2 = window.setTimeout(() => setBubble(null), 3500)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [pulse, reaction, line])

  const mood: Mood = held ?? script[section]?.mood ?? 'idle'

  const poke = () => {
    guide.react('wave', QUIPS[quip.current++ % QUIPS.length])
  }

  if (hidden) {
    return (
      <button
        onClick={() => {
          setHidden(false)
          writeHidden(false)
        }}
        className="fixed z-40 font-mono text-[11px] text-mist border border-line-2 bg-ink-2/90 rounded-full px-3 py-1.5 hover:text-pass hover:border-pass transition-colors"
        style={{
          right: 'max(12px, env(safe-area-inset-right, 0px))',
          bottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
        }}
      >
        show Probe
      </button>
    )
  }

  return (
    <div
      className="fixed z-40 flex flex-col items-end gap-2 pointer-events-none"
      style={{
        right: 'max(8px, env(safe-area-inset-right, 0px))',
        bottom: 'max(8px, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <AnimatePresence>
        {bubble && ready && (
          <motion.div
            key={bubble}
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-auto relative mr-2 sm:mr-6 max-w-[200px] sm:max-w-[230px] rounded-lg border border-pass-dim bg-ink-2/95 px-3 py-2 font-mono text-[11.5px] leading-snug text-fog shadow-[0_12px_30px_-12px_rgba(0,0,0,0.8)]"
            role="status"
            aria-live="polite"
          >
            {bubble}
            <button
              onClick={() => {
                setHidden(true)
                writeHidden(true)
              }}
              className="absolute -top-2 -left-2 h-5 w-5 grid place-items-center rounded-full bg-ink-3 border border-line-2 text-dim hover:text-pass"
              aria-label="Hide Probe"
            >
              <X size={11} />
            </button>
            <span className="absolute -bottom-1.5 right-8 h-3 w-3 rotate-45 border-b border-r border-pass-dim bg-ink-2" />
          </motion.div>
        )}
      </AnimatePresence>
      <div
        ref={box}
        role="button"
        tabIndex={0}
        aria-label="Probe, the guide bot. Click for a message."
        onClick={poke}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            poke()
          }
        }}
        className="pointer-events-auto cursor-pointer h-[100px] w-[80px] translate-x-[24%] sm:translate-x-0 sm:h-[180px] sm:w-[148px] lg:h-[230px] lg:w-[190px] rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-pass"
      >
        {ready && (
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, -0.15, 8.8], fov: 30 }}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
            frameloop={reduced ? 'demand' : 'always'}
          >
            <ambientLight intensity={1.4} />
            <directionalLight position={[3, 4, 5]} intensity={2.2} />
            <Bot mood={mood} pointer={pointer} animate={!reduced} />
          </Canvas>
        )}
      </div>
    </div>
  )
}
