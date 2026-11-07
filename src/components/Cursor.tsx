import { useEffect, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

/** Custom cursor: a solid pass-green dot with a trailing ring that expands
 *  over interactive elements. Fine pointers only; never rendered on touch. */
export default function Cursor() {
  const reduced = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [active, setActive] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 400, damping: 35 })
  const ringY = useSpring(y, { stiffness: 400, damping: 35 })

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return
    setEnabled(true)
    document.body.classList.add('custom-cursor')
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null
      setActive(!!t?.closest('a, button, [role="button"]'))
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    return () => {
      document.body.classList.remove('custom-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
    }
  }, [reduced, x, y])

  if (!enabled) return null

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 z-[200] pointer-events-none h-1.5 w-1.5 rounded-full bg-pass"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
      />
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 z-[200] pointer-events-none rounded-full border border-pass/70"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: active ? 52 : 28,
          height: active ? 52 : 28,
          opacity: active ? 1 : 0.55,
          backgroundColor: active ? 'rgba(81,224,126,0.08)' : 'rgba(81,224,126,0)',
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  )
}
