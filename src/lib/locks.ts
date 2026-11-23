import { useSyncExternalStore } from 'react'

/** The page starts chained shut. Each gate between sections is an assertion;
 *  scrolling past it passes the assertion and releases that lock. When every
 *  lock is open the suite is green and the finale plays. */

export const GATES = [
  { id: 'story', assertion: "expect(about).toBeVisible()" },
  { id: 'experience', assertion: "expect(test.run).toPass()" },
  { id: 'impact', assertion: "expect(log).not.toBeEmpty()" },
  { id: 'skills', assertion: "expect(impact).toBeGreaterThan(0)" },
  { id: 'projects', assertion: "expect(toolbox).toBeEnabled()" },
  { id: 'writing', assertion: "expect(bugs).toHaveLength(0)" },
  { id: 'contact', assertion: "expect(suite).toPass()" },
] as const

export type GateId = (typeof GATES)[number]['id']

let open = new Set<string>()
const listeners = new Set<() => void>()
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const snapshot = () => open

export const locks = {
  release(id: string) {
    if (open.has(id)) return
    open = new Set(open).add(id)
    listeners.forEach((l) => l())
  },
  get total() {
    return GATES.length
  },
}

export const useLocks = () => useSyncExternalStore(subscribe, snapshot, snapshot)
