import { Suspense, lazy, useEffect, useState } from 'react'
import { AnimatePresence, useReducedMotion } from 'framer-motion'
import Lenis from 'lenis'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import About from './components/About'
import Experience from './components/Experience'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Insights from './components/Insights'
import Contact from './components/Contact'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import { setLenis } from './lib/scroll'

const SceneBackground = lazy(() => import('./components/SceneBackground'))

export default function App() {
  const reduced = useReducedMotion()
  const [booting, setBooting] = useState(true)

  // Lenis smooth scrolling (skipped under reduced motion)
  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true })
    setLenis(lenis)
    let raf = 0
    const loop = (t: number) => {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      setLenis(null)
    }
  }, [reduced])

  // hold scroll while the boot screen is up
  useEffect(() => {
    document.body.style.overflow = booting ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [booting])

  return (
    <>
      <AnimatePresence>
        {booting && <Preloader skip={!!reduced} onDone={() => setBooting(false)} />}
      </AnimatePresence>
      <Cursor />
      {/* persistent 3D space behind every section; the camera travels on scroll */}
      <div aria-hidden className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <Suspense fallback={null}>
          <SceneBackground animate={!reduced} />
        </Suspense>
      </div>
      <div className="relative z-10">
        <Nav />
        <main>
          <Hero />
          <Marquee />
          <About />
          <Experience />
          <Skills />
          <Projects />
          <Insights />
          <Contact />
        </main>
      </div>
    </>
  )
}
