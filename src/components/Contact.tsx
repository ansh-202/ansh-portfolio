import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, LockOpen, Mail } from 'lucide-react'
import { locks, useLocks } from '../lib/locks'
import { Reveal, SectionHeader, Tilt } from './ui'
import { Bug } from './BugHunt'
import { identity } from '../data/resume'

/** Shown once every lock on the page is open: the suite is free and the next
 *  adventure starts here. */
function NextAdventure() {
  const reduced = useReducedMotion()
  const free = useLocks().size === locks.total
  return (
    <AnimatePresence>
      {free && (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 18, delay: 0.5 }}
          className="mt-12 relative overflow-hidden rounded-2xl border border-pass-dim bg-ink-2 p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-pass">
            <LockOpen size={15} />
            <span>
              {locks.total}/{locks.total} assertions passed · all chains released
            </span>
          </div>
          <p className="mt-4 font-display font-extrabold tracking-tight text-fog text-3xl sm:text-5xl leading-[1.05]">
            Suite free. <span className="text-pass">Next adventure:</span> yours.
          </p>
          <p className="mt-3 max-w-xl text-mist">
            That was the whole run. If you have a pipeline that needs the same treatment, the next
            test I write could be for it.
          </p>
          <a
            href={`mailto:${identity.email}?subject=Next%20adventure`}
            className="mt-6 inline-flex items-center gap-2 bg-pass text-ink font-mono text-sm font-semibold rounded px-5 py-3 hover:bg-fog transition-colors"
          >
            start the next adventure <ArrowUpRight size={15} />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Contact() {
  return (
    <section id="contact" className="relative mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-32">
      <Bug id="contact" className="absolute right-1/3 bottom-24" />
      <SectionHeader index="06" title="Contact" ghost="SHIP IT" note="// exit code 0" />
      <NextAdventure />
      <div className="mt-14 grid lg:grid-cols-[1.4fr_1fr] gap-12 items-start">
        <Reveal from="left">
          <h3 className="font-display font-extrabold tracking-[-0.03em] leading-[1.02] text-fog text-4xl sm:text-6xl">
            Your pipeline deserves
            <br />
            tests it can <span className="text-pass">trust</span>.
          </h3>
          <p className="mt-6 max-w-lg text-mist leading-relaxed">
            If you’re building something where quality is engineered rather than inspected in, I’d
            like to hear about it. I’m based in {identity.location} and reply fast.
          </p>
          <a
            href={`mailto:${identity.email}`}
            className="mt-9 inline-flex items-center gap-3 bg-pass text-ink font-mono text-sm font-semibold rounded px-6 py-3.5 hover:bg-fog transition-colors"
          >
            <Mail size={16} />
            {identity.email}
          </a>
        </Reveal>
        <Reveal delay={0.15} from="right">
          <Tilt max={6}>
          <ul className="border border-line rounded-lg overflow-hidden bg-line space-y-px font-mono text-sm">
            {[
              { label: 'linkedin', value: 'anshkumar-sdet', href: identity.linkedin },
              { label: 'github', value: 'codeansh20', href: identity.github },
              { label: 'email', value: identity.email, href: `mailto:${identity.email}` },
            ].map((row) => (
              <li key={row.label} className="bg-ink-2">
                <a
                  href={row.href}
                  target={row.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="group flex items-center justify-between p-4 sm:p-5 hover:bg-ink-3 transition-colors"
                >
                  <span className="text-dim">{row.label}:</span>
                  <span className="text-mist group-hover:text-pass transition-colors flex items-center gap-1.5 truncate ml-3">
                    {row.value}
                    <ArrowUpRight size={13} className="shrink-0" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
          </Tilt>
        </Reveal>
      </div>
      <footer className="mt-24">
        <div className="rule-dotted" />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-dim">
          <p>
            © {new Date().getFullYear()} {identity.name} · designed & built by hand
          </p>
          <p>
            <span className="text-pass">✓</span> 0 failures · 0 flaky · exit 0
          </p>
        </div>
      </footer>
    </section>
  )
}
