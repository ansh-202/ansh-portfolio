import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { guide } from '../lib/guide'
import { GATES, locks } from '../lib/locks'

gsap.registerPlugin(ScrollTrigger)

/* Every section has its own palette. One page-long ScrollTrigger watches which
 * section sits under the middle of the viewport and tweens the theme tokens on
 * <html>; Tailwind's colours read those tokens, so the whole page re-tints.
 * The same watcher releases chain gates and tells Probe where it is. A single
 * onUpdate (rather than per-section onToggle) still works when a nav click
 * jumps past several sections in one frame. */

type Theme = { ink: string; ink2: string; ink3: string; line: string; line2: string; pass: string; passDim: string }

const base: Theme = {
  ink: '#0b0d0b',
  ink2: '#111411',
  ink3: '#171b17',
  line: '#232823',
  line2: '#2f362f',
  pass: '#51e07e',
  passDim: '#2c7a48',
}

export const THEMES: Record<string, Theme> = {
  top: base,
  about: { ink: '#0d0b12', ink2: '#14111b', ink3: '#1b1724', line: '#28233a', line2: '#352e4b', pass: '#b69cff', passDim: '#5e4a9c' },
  story: { ink: '#071010', ink2: '#0c1818', ink3: '#112020', line: '#1d3231', line2: '#28423f', pass: '#3fe0c5', passDim: '#1f7c6d' },
  experience: { ink: '#080b16', ink2: '#0d1120', ink3: '#131a2c', line: '#1f2842', line2: '#2b3757', pass: '#7cc4ff', passDim: '#2f5f8f' },
  impact: { ink: '#110d07', ink2: '#19130b', ink3: '#211a10', line: '#3a2e1c', line2: '#4b3c25', pass: '#f6b94a', passDim: '#8c6420' },
  skills: { ink: '#120a09', ink2: '#1a100e', ink3: '#231614', line: '#3c2420', line2: '#4e302a', pass: '#ff7d5e', passDim: '#93402f' },
  projects: base,
  writing: { ink: '#120a10', ink2: '#1a1018', ink3: '#231620', line: '#3c2335', line2: '#4e2e45', pass: '#f479c0', passDim: '#8d3a6b' },
  contact: base,
}

const SECTION_IDS = Object.keys(THEMES)

const toVars = (t: Theme) => ({
  '--color-ink': t.ink,
  '--color-ink-2': t.ink2,
  '--color-ink-3': t.ink3,
  '--color-line': t.line,
  '--color-line-2': t.line2,
  '--color-pass': t.pass,
  '--color-pass-dim': t.passDim,
})

export default function Atmosphere({ reduced }: { reduced: boolean }) {
  useEffect(() => {
    const root = document.documentElement
    let current = ''
    let sections: { id: string; top: number }[] = []
    let gates: { id: string; top: number }[] = []

    const measure = () => {
      const y = window.scrollY
      sections = SECTION_IDS.map((id) => {
        const el = document.getElementById(id)
        return { id, top: el ? el.getBoundingClientRect().top + y : Infinity }
      }).sort((a, b) => a.top - b.top)
      gates = GATES.map(({ id }) => {
        const el = document.getElementById(`gate-${id}`)
        return { id, top: el ? el.getBoundingClientRect().top + y : Infinity }
      })
    }

    const apply = (scrollY: number) => {
      const mid = scrollY + window.innerHeight * 0.5
      let id = sections[0]?.id ?? 'top'
      for (const s of sections) if (s.top <= mid) id = s.id
      if (id !== current) {
        current = id
        guide.setSection(id)
        gsap.to(root, {
          ...toVars(THEMES[id] ?? base),
          duration: reduced ? 0 : 0.9,
          ease: 'power2.out',
          overwrite: true,
        })
      }
      const line = scrollY + window.innerHeight * 0.72
      for (const g of gates) if (g.top <= line) locks.release(g.id)
    }

    measure()
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => apply(self.scroll()),
      onRefresh: () => {
        measure()
        apply(window.scrollY)
      },
    })

    // sections grow (work logs open, drawers slide out): re-measure
    let t = 0
    const ro = new ResizeObserver(() => {
      window.clearTimeout(t)
      t = window.setTimeout(() => ScrollTrigger.refresh(), 150)
    })
    ro.observe(document.body)
    apply(window.scrollY)

    return () => {
      st.kill()
      ro.disconnect()
      window.clearTimeout(t)
    }
  }, [reduced])

  // a soft accent glow behind everything; it follows the theme tokens
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background:
          'radial-gradient(1100px 620px at 85% -10%, color-mix(in oklab, var(--color-pass) 13%, transparent), transparent 70%), radial-gradient(900px 600px at -10% 110%, color-mix(in oklab, var(--color-pass) 8%, transparent), transparent 70%)',
      }}
    />
  )
}
