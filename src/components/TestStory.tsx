import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { SectionHeader } from './ui'

/* "Anatomy of a test": an Apple-style pinned scroll story. The section sticks
 * while scroll progress scrubs one Playwright test against a mock sign-up page.
 * Only transform and opacity animate, so every frame stays on the compositor. */

const STEPS = [
  { title: 'Navigate', code: "await page.goto('/signup')", note: 'Open the page under test and wait for it to settle.' },
  {
    title: 'Locate',
    code: "page.getByLabel('Email')",
    note: 'Find elements the way a user does — by role and label, not brittle XPath.',
  },
  { title: 'Act', code: "await email.fill('qa@probe.dev')", note: 'Fill the form and click, exactly like a person would.' },
  {
    title: 'Intercept',
    code: "page.waitForResponse('**/contacts')",
    note: 'Watch the API call behind the click, so a UI pass can’t hide a backend failure.',
  },
  { title: 'Assert', code: 'await expect(toast).toBeVisible()', note: 'Check the outcome the user cares about. Green.' },
]

const seg = (i: number) => [i / STEPS.length, (i + 1) / STEPS.length] as const

function useStep(p: MotionValue<number>, i: number) {
  const [a, b] = seg(i)
  const pad = 0.035
  // scroll-linked values run on the native animation API: offsets must stay in [0, 1]
  const range = [Math.max(0, a - pad), a + pad, b - pad, Math.min(1, b + pad)]
  const first = i === 0
  const last = i === STEPS.length - 1
  return useTransform(p, range, [first ? 1 : 0, 1, 1, last ? 1 : 0])
}

function Caption({ p, i }: { p: MotionValue<number>; i: number }) {
  const opacity = useStep(p, i)
  const y = useTransform(opacity, [0, 1], [16, 0])
  const s = STEPS[i]
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 top-0">
      <p className="font-mono text-xs text-pass tracking-widest">STEP {i + 1} / {STEPS.length}</p>
      <h3 className="mt-3 font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-fog">{s.title}</h3>
      <p className="mt-4 text-mist leading-relaxed max-w-sm">{s.note}</p>
      <code className="mt-5 inline-block font-mono text-[13px] text-pass bg-ink-2 border border-line rounded px-3 py-2">
        {s.code}
      </code>
    </motion.div>
  )
}

function Rail({ p }: { p: MotionValue<number> }) {
  return (
    <ol className="flex gap-1.5" aria-hidden>
      {STEPS.map((s, i) => (
        <RailTick key={s.title} p={p} i={i} />
      ))}
    </ol>
  )
}

function RailTick({ p, i }: { p: MotionValue<number>; i: number }) {
  const [a, b] = seg(i)
  const fill = useTransform(p, [a, b], [0, 1])
  return (
    <li className="h-1 w-10 sm:w-14 rounded-full bg-line overflow-hidden">
      <motion.span className="block h-full bg-pass origin-left" style={{ scaleX: fill }} />
    </li>
  )
}

function Bracket({
  p,
  from,
  label,
  side = false,
}: {
  p: MotionValue<number>
  from: number
  label: string
  /** label beside the element instead of on its top edge */
  side?: boolean
}) {
  const opacity = useTransform(p, [from, from + 0.04], [0, 1])
  const scale = useTransform(p, [from, from + 0.04], [1.15, 1])
  return (
    <motion.div style={{ opacity, scale }} className="pointer-events-none absolute -inset-1.5">
      <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 border-pass" />
      <span className="absolute right-0 top-0 h-2.5 w-2.5 border-r-2 border-t-2 border-pass" />
      <span className="absolute left-0 bottom-0 h-2.5 w-2.5 border-l-2 border-b-2 border-pass" />
      <span className="absolute right-0 bottom-0 h-2.5 w-2.5 border-r-2 border-b-2 border-pass" />
      <span
        className={`absolute font-mono text-[10px] text-pass whitespace-nowrap bg-ink-2 px-1 ${
          side ? 'left-full ml-3 top-1/2 -translate-y-1/2' : 'right-3 top-0 -translate-y-1/2'
        }`}
      >
        {label}
      </span>
    </motion.div>
  )
}

function Browser({ p }: { p: MotionValue<number> }) {
  // 0 navigate
  const load = useTransform(p, [0.02, 0.17], [0, 1])
  const pageIn = useTransform(p, [0.06, 0.18], [0, 1])
  const pageY = useTransform(pageIn, [0, 1], [18, 0])
  // 1 locate: scanner sweep
  const scanY = useTransform(p, [0.2, 0.38], ['0%', '100%'])
  const scanO = useTransform(p, [0.2, 0.22, 0.37, 0.4], [0, 1, 1, 0])
  // 2 act: typing reveal (a cover slides away), cursor travels, button press
  const typed = useTransform(p, [0.42, 0.5], ['0%', '101%'])
  const typedPw = useTransform(p, [0.47, 0.53], ['0%', '101%'])
  const curX = useTransform(p, [0.4, 0.5, 0.56], ['10%', '40%', '62%'])
  const curY = useTransform(p, [0.4, 0.5, 0.56], ['40%', '48%', '78%'])
  const curO = useTransform(p, [0.4, 0.42, 0.6, 0.62], [0, 1, 1, 0])
  const press = useTransform(p, [0.555, 0.57, 0.585], [1, 0.93, 1])
  // 3 intercept: request card + beam
  const beam = useTransform(p, [0.6, 0.68], [0, 1])
  const reqO = useTransform(p, [0.64, 0.7], [0, 1])
  const reqX = useTransform(reqO, [0, 1], [24, 0])
  const status = useTransform(p, [0.72, 0.74], [0, 1])
  // 4 assert: toast + stamp
  const toastO = useTransform(p, [0.8, 0.85], [0, 1])
  const toastY = useTransform(toastO, [0, 1], [-14, 0])
  const stampO = useTransform(p, [0.88, 0.91], [0, 1])
  const stampS = useTransform(p, [0.88, 0.92], [1.8, 1])
  const result = useTransform(p, [0.92, 0.95], [0, 1])

  return (
    <div className="relative w-full max-w-[520px] rounded-xl border border-line-2 bg-ink-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] overflow-hidden">
      {/* chrome */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-line bg-ink-3">
        <span className="h-2.5 w-2.5 rounded-full bg-fail/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-flaky/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-pass/70" />
        <span className="ml-2 flex-1 truncate rounded bg-ink px-2.5 py-1 font-mono text-[11px] text-mist">
          app.example.test/signup
        </span>
      </div>
      <div className="h-0.5 bg-line">
        <motion.div className="h-full bg-pass origin-left" style={{ scaleX: load }} />
      </div>

      {/* page under test */}
      <div className="relative p-5 sm:p-7 min-h-[330px] overflow-hidden">
        <motion.div style={{ opacity: pageIn, y: pageY }} className="space-y-5">
          <div>
            <p className="font-display text-xl font-bold text-fog">Create your account</p>
            <p className="text-xs text-dim mt-1">Free forever. No card needed.</p>
          </div>
          <div className="relative">
            <p className="font-mono text-[10px] text-dim mb-1.5">Email</p>
            <div className="relative h-9 rounded border border-line-2 bg-ink px-3 flex items-center overflow-hidden">
              <span className="font-mono text-[12px] text-fog">qa@probe.dev</span>
              <motion.span className="absolute inset-y-0 right-0 left-3 bg-ink origin-right" style={{ x: typed }} />
            </div>
            <Bracket p={p} from={0.25} label="getByLabel('Email')" />
          </div>
          <div className="relative">
            <p className="font-mono text-[10px] text-dim mb-1.5">Password</p>
            <div className="relative h-9 rounded border border-line-2 bg-ink px-3 flex items-center overflow-hidden">
              <span className="font-mono text-[12px] text-fog tracking-[0.3em]">••••••••</span>
              <motion.span className="absolute inset-y-0 right-0 left-3 bg-ink" style={{ x: typedPw }} />
            </div>
            <Bracket p={p} from={0.29} label="getByLabel('Password')" />
          </div>
          <div className="relative w-fit">
            <motion.div
              style={{ scale: press }}
              className="rounded bg-pass px-5 py-2 font-mono text-[12px] font-semibold text-ink"
            >
              Sign up
            </motion.div>
            <Bracket p={p} from={0.33} label="getByRole('button')" side />
          </div>
        </motion.div>

        {/* scanner beam */}
        <motion.div style={{ y: scanY, opacity: scanO }} className="pointer-events-none absolute inset-0">
          <div className="h-px bg-pass shadow-[0_0_18px_4px_color-mix(in_oklab,var(--color-pass)_55%,transparent)]" />
        </motion.div>

        {/* cursor */}
        <motion.div style={{ x: curX, y: curY, opacity: curO }} className="pointer-events-none absolute inset-0">
          <span className="block h-3.5 w-3.5 rounded-full border-2 border-fog bg-pass/40" />
        </motion.div>

        {/* intercepted request */}
        <motion.div
          style={{ scaleX: beam }}
          className="pointer-events-none absolute left-[38%] bottom-[34px] h-px w-[26%] origin-left bg-gradient-to-r from-pass to-pass/20"
        />
        <motion.div
          style={{ opacity: reqO, x: reqX }}
          className="absolute right-4 bottom-5 sm:right-6 rounded-md border border-line-2 bg-ink px-3 py-2 font-mono text-[10.5px] leading-relaxed"
        >
          <p className="text-mist">POST /v3/contacts</p>
          <motion.p style={{ opacity: status }} className="text-pass">
            201 Created · 184 ms
          </motion.p>
        </motion.div>

        {/* success toast */}
        <motion.div
          style={{ opacity: toastO, y: toastY }}
          className="absolute top-4 right-4 rounded-md border border-pass-dim bg-ink px-3 py-2 font-mono text-[11px] text-pass"
        >
          ✓ Account created
        </motion.div>

        {/* verdict stamp */}
        <motion.div
          style={{ opacity: stampO, scale: stampS, rotate: -10 }}
          className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 rounded-md border-[3px] border-pass px-4 py-1 font-display text-3xl font-extrabold tracking-widest text-pass"
        >
          PASSED
        </motion.div>
      </div>

      <motion.div
        style={{ opacity: result }}
        className="border-t border-line bg-ink-3 px-4 py-2 font-mono text-[11px] text-mist"
      >
        <span className="text-pass">✓</span> signup.spec.ts › creates an account{' '}
        <span className="text-dim">(842 ms)</span> · <span className="text-pass">1 passed</span>
      </motion.div>
    </div>
  )
}

export default function TestStory() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  // reduced motion: no scrubbing, show the finished run
  const done = useTransform(scrollYProgress, () => 1)
  const p = reduced ? done : scrollYProgress

  return (
    <section id="story" aria-label="Anatomy of a test">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-24 sm:pt-32">
        <SectionHeader index="RUN" title="Anatomy of a Test" ghost="ASSERT" note="// scroll to scrub the run" />
      </div>
      <div ref={ref} className={reduced ? '' : 'relative h-[420vh]'}>
        <div
          className={`${reduced ? '' : 'sticky top-0 h-[100svh]'} flex items-center`}
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-14 items-center py-10">
            <div className="flex flex-col gap-6">
              <Rail p={p} />
              {reduced ? (
                <ol className="space-y-4">
                  {STEPS.map((s, i) => (
                    <li key={s.title}>
                      <p className="font-display text-xl font-bold text-fog">
                        {i + 1}. {s.title}
                      </p>
                      <code className="font-mono text-[12px] text-pass">{s.code}</code>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="relative h-[210px] sm:h-[230px]">
                  {STEPS.map((s, i) => (
                    <Caption key={s.title} p={p} i={i} />
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-center lg:justify-end">
              <Browser p={p} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
