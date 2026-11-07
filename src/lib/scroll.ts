import type Lenis from 'lenis'

// shared handle to the Lenis instance so Nav anchors can scroll through it
let instance: Lenis | null = null

export const setLenis = (l: Lenis | null) => {
  instance = l
}

export const getLenis = () => instance
