import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Persistent 3D "test-node network" that lives behind the WHOLE page.
 * Scrolling drives the camera: the constellation completes a full revolution
 * and pitches forward as you travel from hero to footer, so every section
 * sits inside the same 3D space. The cursor adds parallax on top.
 */
function NodeNetwork({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null)
  const pulseMat = useRef<THREE.PointsMaterial>(null)
  const drift = useRef(0)

  const { positions, pulsePositions, linePositions } = useMemo(() => {
    const rng = (() => {
      // deterministic layout so the scene is identical every load
      let s = 42
      return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
    })()
    const N = 160
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < N; i++) {
      const theta = rng() * Math.PI * 2
      const phi = Math.acos(2 * rng() - 1)
      const r = 2.6 + rng() * 2.4
      pts.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta) * 1.25,
          r * Math.sin(phi) * Math.sin(theta) * 0.8,
          r * Math.cos(phi),
        ),
      )
    }
    const positions = new Float32Array(N * 3)
    pts.forEach((p, i) => p.toArray(positions, i * 3))

    const pulseIdx = Array.from({ length: 14 }, () => Math.floor(rng() * N))
    const pulsePositions = new Float32Array(pulseIdx.length * 3)
    pulseIdx.forEach((pi, i) => pts[pi].toArray(pulsePositions, i * 3))

    const lines: number[] = []
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        if (pts[i].distanceTo(pts[j]) < 1.1) {
          lines.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z)
        }
      }
    }
    return { positions, pulsePositions, linePositions: new Float32Array(lines) }
  }, [])

  useFrame((state, dt) => {
    if (!group.current) return
    const doc = document.documentElement
    const max = doc.scrollHeight - window.innerHeight
    const progress = max > 0 ? window.scrollY / max : 0

    if (animate) drift.current += dt * 0.05

    // scroll = camera journey: full revolution + pitch + descent across the page
    const g = group.current
    g.rotation.y = THREE.MathUtils.lerp(
      g.rotation.y,
      0.6 + drift.current + progress * Math.PI * 2 - state.pointer.x * 0.12,
      0.06,
    )
    g.rotation.x = THREE.MathUtils.lerp(
      g.rotation.x,
      0.22 + progress * 0.7 + state.pointer.y * 0.18,
      0.05,
    )
    g.position.y = THREE.MathUtils.lerp(g.position.y, 0.4 - progress * 1.6, 0.06)
    const scale = 1 + progress * 0.35
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, scale, 0.06))

    if (pulseMat.current && animate) {
      pulseMat.current.size = 0.095 + Math.sin(state.clock.elapsedTime * 2.2) * 0.035
      pulseMat.current.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 2.2) * 0.3
    }
  })

  return (
    <group ref={group} rotation={[0.25, 0.6, 0]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#51e07e" size={0.04} transparent opacity={0.5} sizeAttenuation />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pulsePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={pulseMat}
          color="#7dffab"
          size={0.095}
          transparent
          opacity={0.85}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#2c7a48" transparent opacity={0.24} />
      </lineSegments>
    </group>
  )
}

/**
 * The "automation core": three wireframe gyroscope rings spinning on
 * different axes around a pulsing wireframe heart — the machine that
 * runs the suite. Sits at the center of the node network.
 */
function AutomationCore({ animate }: { animate: boolean }) {
  const ring1 = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)
  const ring3 = useRef<THREE.Mesh>(null)
  const core = useRef<THREE.Mesh>(null)

  useFrame((state, dt) => {
    if (!animate) return
    const t = state.clock.elapsedTime
    if (ring1.current) {
      ring1.current.rotation.x += dt * 0.35
      ring1.current.rotation.y += dt * 0.12
    }
    if (ring2.current) {
      ring2.current.rotation.y -= dt * 0.28
      ring2.current.rotation.z += dt * 0.18
    }
    if (ring3.current) {
      ring3.current.rotation.z -= dt * 0.22
      ring3.current.rotation.x += dt * 0.15
    }
    if (core.current) {
      const s = 1 + Math.sin(t * 2.4) * 0.12
      core.current.scale.setScalar(s)
      core.current.rotation.y += dt * 0.4
      const mat = core.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.5 + Math.sin(t * 2.4) * 0.25
    }
  })

  return (
    <group>
      <mesh ref={ring1} rotation={[0.4, 0, 0.2]}>
        <torusGeometry args={[1.55, 0.008, 6, 90]} />
        <meshBasicMaterial color="#51e07e" transparent opacity={0.4} />
      </mesh>
      <mesh ref={ring2} rotation={[1.2, 0.5, 0]}>
        <torusGeometry args={[1.85, 0.006, 6, 90]} />
        <meshBasicMaterial color="#2c7a48" transparent opacity={0.45} />
      </mesh>
      <mesh ref={ring3} rotation={[0.1, 1.1, 0.6]}>
        <torusGeometry args={[2.2, 0.005, 6, 90]} />
        <meshBasicMaterial color="#51e07e" transparent opacity={0.25} />
      </mesh>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshBasicMaterial color="#51e07e" wireframe transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

export default function SceneBackground({ animate }: { animate: boolean }) {
  return (
    <Canvas
      className="pointer-events-none"
      camera={{ position: [0, 0, 8], fov: 48 }}
      dpr={[1, 1.35]}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      frameloop={animate ? 'always' : 'demand'}
      eventSource={document.body}
      eventPrefix="client"
    >
      <NodeNetwork animate={animate} />
      <AutomationCore animate={animate} />
    </Canvas>
  )
}
