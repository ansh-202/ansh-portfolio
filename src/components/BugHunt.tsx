import { useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { guide } from '../lib/guide'

/* Easter egg: five bugs hide around the page. Squash them all to be certified.
 * Progress is per-visitor and kept only for this tab session. */

export const BUG_IDS = ['hero', 'about', 'experience', 'toolbox', 'contact'] as const

let found = new Set<string>()
const listeners = new Set<() => void>()
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const snapshot = () => found

function squash(id: string) {
  if (found.has(id)) return
  found = new Set(found).add(id)
  listeners.forEach((l) => l())
  const n = found.size
  if (n === BUG_IDS.length) guide.react('celebrate', 'All 5 bugs squashed. Certified bug hunter!')
  else guide.react('celebrate', `Bug squashed. ${n} of ${BUG_IDS.length} found.`)
}

export const useBugs = () => useSyncExternalStore(subscribe, snapshot, snapshot)

export function Bug({ id, className = '' }: { id: (typeof BUG_IDS)[number]; className?: string }) {
  const bugs = useBugs()
  const reduced = useReducedMotion()
  const [splat, setSplat] = useState(false)
  const gone = bugs.has(id)

  return (
    <AnimatePresence>
      {!gone && (
        <motion.button
          key="bug"
          onClick={() => {
            setSplat(true)
            squash(id)
          }}
          aria-label="Squash this bug"
          exit={reduced ? { opacity: 0 } : { scale: [1, 1.5, 0], opacity: [1, 1, 0], rotate: 40 }}
          transition={{ duration: 0.35 }}
          className={`z-10 grid place-items-center h-7 w-7 rounded-full opacity-40 hover:opacity-100 focus-visible:opacity-100 transition-opacity ${className}`}
        >
          <motion.svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            aria-hidden
            animate={reduced || splat ? undefined : { rotate: [0, 0, 14, -14, 0, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.7, 0.78, 0.86, 0.94, 1] }}
            className="text-fail"
          >
            <ellipse cx="12" cy="13.5" rx="5" ry="6.5" fill="currentColor" />
            <circle cx="12" cy="6" r="2.6" fill="currentColor" />
            <path
              d="M7 10 3.5 8M7 14H3M7 17.5l-3 2.5M17 10l3.5-2M17 14h4M17 17.5l3 2.5M10.5 4 9 1.5M13.5 4 15 1.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M12 8v12" stroke="var(--color-ink)" strokeWidth="1" />
          </motion.svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

/** Nav counter — appears once the first bug is found. */
export function BugCounter() {
  const bugs = useBugs()
  if (bugs.size === 0) return null
  const all = bugs.size === BUG_IDS.length
  return (
    <motion.span
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`hidden sm:inline font-mono text-[11px] rounded-full border px-2.5 py-1 ${
        all ? 'border-pass text-pass' : 'border-line-2 text-mist'
      }`}
      aria-live="polite"
    >
      {all ? '✓ certified' : `bugs ${bugs.size}/${BUG_IDS.length}`}
    </motion.span>
  )
}
