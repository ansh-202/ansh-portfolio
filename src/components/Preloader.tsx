import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const BOOT = [
  'init chromium + firefox',
  'load 25,000+ specs',
  'attach reporters',
  'warm up candidate',
]

/** CI boot sequence: counter runs 0→100 while boot lines check off, then the
 *  whole screen wipes upward to reveal the site. */
export default function Preloader({ onDone, skip }: { onDone: () => void; skip: boolean }) {
  const [pct, setPct] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (skip) {
      onDone()
      return
    }
    const t0 = performance.now()
    const DURATION = 1700
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / DURATION)
      // ease: fast start, hesitate near the end like a real pipeline
      setPct(Math.round(100 * (1 - Math.pow(1 - p, 2.4))))
      if (p < 1) raf = requestAnimationFrame(tick)
      else {
        setExiting(true)
        setTimeout(onDone, 750)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [skip, onDone])

  if (skip) return null

  const litLines = Math.floor((pct / 100) * BOOT.length)

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-ink flex flex-col justify-between p-6 sm:p-10"
      animate={exiting ? { y: '-100%' } : { y: 0 }}
      transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
      aria-hidden
    >
      <div className="font-mono text-xs text-dim flex justify-between">
        <span>ansh.kumar — test runner</span>
        <span className="text-pass">● booting</span>
      </div>
      <div className="flex items-end justify-between gap-6">
        <ul className="font-mono text-[12px] sm:text-sm space-y-1.5">
          {BOOT.map((line, i) => (
            <li key={line} className={i < litLines ? 'text-mist' : 'text-line-2'}>
              <span className={i < litLines ? 'text-pass' : 'text-line-2'}>
                {i < litLines ? '✓' : '○'}
              </span>{' '}
              {line}
            </li>
          ))}
        </ul>
        <p className="font-display font-extrabold tracking-[-0.04em] leading-none text-fog text-[clamp(5rem,18vw,13rem)] tabular-nums">
          {pct}
          <span className="text-pass">%</span>
        </p>
      </div>
      <div className="h-px bg-line relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-pass transition-[width] duration-100" style={{ width: `${pct}%` }} />
      </div>
    </motion.div>
  )
}
