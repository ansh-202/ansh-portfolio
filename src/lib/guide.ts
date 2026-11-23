import { useSyncExternalStore } from 'react'

/** Shared state for Probe, the guide character: which section is on screen,
 *  plus one-off reactions (a bug squashed, the bot clicked). */

export type Mood = 'wave' | 'idle' | 'inspect' | 'celebrate' | 'tool'

export type GuideState = {
  section: string
  /** bumps on every one-off reaction so the scene can replay it */
  pulse: number
  reaction: Mood | null
  line: string | null
}

let state: GuideState = { section: 'top', pulse: 0, reaction: null, line: null }
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

export const guide = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  setSection(section: string) {
    if (section === state.section) return
    state = { ...state, section, reaction: null, line: null }
    emit()
  },
  react(reaction: Mood, line: string) {
    state = { ...state, reaction, line, pulse: state.pulse + 1 }
    emit()
  },
}

export const useGuide = () => useSyncExternalStore(guide.subscribe, guide.get, guide.get)

/** What Probe does and says in each section. Section ids match the page. */
export const script: Record<string, { mood: Mood; line: string }> = {
  top: { mood: 'wave', line: 'Hi, I’m Probe. This page is chained shut. Scroll to pass each assertion.' },
  about: { mood: 'idle', line: 'Reading the spec before testing anything.' },
  story: { mood: 'inspect', line: 'Watch one test run, step by step.' },
  experience: { mood: 'inspect', line: 'Click an eye and catch the shooting stars.' },
  impact: { mood: 'celebrate', line: '2026 results are in. All green.' },
  skills: { mood: 'tool', line: 'Open a drawer and borrow a tool.' },
  projects: { mood: 'idle', line: 'Hauling case studies. Mind the box.' },
  writing: { mood: 'idle', line: 'Typing up notes. One lock left.' },
  contact: { mood: 'wave', line: 'Exit code 0. Every lock is open.' },
}
