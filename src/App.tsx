import { useEffect, useState } from 'react'
import { AnimatePresence, useReducedMotion } from 'framer-motion'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import About from './components/About'
import Experience from './components/Experience'
import Impact from './components/Impact'
import Toolbox from './components/Toolbox'
import TestStory from './components/TestStory'
import Projects from './components/Projects'
import Insights from './components/Insights'
import Contact from './components/Contact'
import Preloader from './components/Preloader'
import TargetCursor from './components/bits/TargetCursor'
import { setLenis } from './lib/scroll'
import Atmosphere from './components/Atmosphere'
import Buddy from './components/Buddy'
import { ChainFrame, ChainGate } from './components/Chains'


export default function App() {
  const reduced = useReducedMotion()
  const [booting, setBooting] = useState(true)

  // Lenis smooth scrolling on GSAP's ticker, so ScrollTrigger and Lenis read the
  // same scroll position each frame (skipped under reduced motion)
  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true })
    setLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
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
      <TargetCursor
        targetSelector="a, button, [role='button']"
        cursorColor="var(--color-pass)"
        size={30}
        cornerSize={9}
        thickness={2}
        padding={6}
        showLabel
        hideDefaultCursor
        blendMode="normal"
      />
      <Atmosphere reduced={!!reduced} />
      <ChainFrame />
      <Buddy ready={!booting} />
      <div className="relative z-10">
        <Nav />
        <main>
          <Hero ready={!booting} />
          <Marquee />
          <About />
          <ChainGate id="story" />
          <TestStory />
          <ChainGate id="experience" />
          <Experience />
          <ChainGate id="impact" />
          <Impact />
          <ChainGate id="skills" />
          <Toolbox />
          <ChainGate id="projects" />
          <Projects />
          <ChainGate id="writing" />
          <Insights />
          <ChainGate id="contact" />
          <Contact />
        </main>
      </div>
    </>
  )
}
