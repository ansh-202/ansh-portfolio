import { useEffect, useState } from 'react'
import { motion, useScroll } from 'framer-motion'
import { Download, Menu, X } from 'lucide-react'
import { identity } from '../data/resume'
import { getLenis } from '../lib/scroll'
import { BugCounter } from './BugHunt'
import { LockCounter } from './Chains'

/** Route anchor clicks through Lenis so smooth scroll stays buttery. */
function goTo(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith('#')) return
  const lenis = getLenis()
  if (lenis) {
    e.preventDefault()
    lenis.scrollTo(href === '#top' ? 0 : href, { offset: -56 })
  }
}

const links = [
  { href: '#about', label: 'about' },
  { href: '#story', label: 'run' },
  { href: '#experience', label: 'experience' },
  { href: '#impact', label: 'impact' },
  { href: '#skills', label: 'skills' },
  { href: '#projects', label: 'projects' },
  { href: '#writing', label: 'writing' },
  { href: '#contact', label: 'contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollYProgress } = useScroll()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled || open ? 'bg-ink/90 backdrop-blur border-b border-line' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <a href="#top" onClick={(e) => goTo(e, '#top')} className="flex items-center gap-2.5 font-mono text-sm text-fog">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pass opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pass" />
          </span>
          ansh.kumar
        </a>
        <div className="hidden lg:flex items-center gap-5">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => goTo(e, l.href)}
              className="font-mono text-xs text-mist hover:text-pass transition-colors"
            >
              ./{l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <LockCounter />
          <BugCounter />
          <a
            href={identity.resumeFile}
            download="Ansh_Kumar_Resume.pdf"
            className="flex items-center gap-2 font-mono text-xs border border-line-2 rounded px-3 py-1.5 text-fog hover:border-pass hover:text-pass transition-colors"
          >
            <Download size={13} />
            résumé
          </a>
          <button
            className="lg:hidden text-mist hover:text-pass transition-colors"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="lg:hidden border-t border-line bg-ink/95 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => {
                  setOpen(false)
                  goTo(e, l.href)
                }}
                className="font-mono text-sm text-mist hover:text-pass transition-colors py-2.5 border-b border-line last:border-0"
              >
                ./{l.label}
              </a>
            ))}
          </div>
        </div>
      )}
      <motion.div
        aria-hidden
        style={{ scaleX: scrollYProgress }}
        className="absolute bottom-0 inset-x-0 h-[2px] bg-pass origin-left"
      />
    </header>
  )
}
