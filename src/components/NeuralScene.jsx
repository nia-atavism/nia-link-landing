import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars, Sparkles, Torus } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import NetworkVisualizer from './NetworkVisualizer'

const RAILWAY_WS = "wss://nia-link-production.up.railway.app/mcp/sse" // SSE 端點，實際開發中會根據 WebSocket 端點調整

// 滑鼠軌跡光束
const TrajectoryBeam = ({ start, end }) => {
  const mesh = useRef()
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.material.opacity *= 0.92 // 快速消逝感
    }
  })
  
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(start.x, start.y, 0),
    new THREE.Vector3((start.x + end.x) / 2, (start.y + end.y) / 2, 2),
    new THREE.Vector3(end.x, end.y, 0)
  ])

  return (
    <mesh ref={mesh}>
      <tubeGeometry args={[curve, 20, 0.05, 8, false]} />
      <meshBasicMaterial color="#ff0080" transparent opacity={0.8} />
    </mesh>
  )
}

const NebulaBackground = () => {
  const group = useRef()
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (group.current) {
      group.current.rotation.z = t * 0.05
      group.current.rotation.y = Math.sin(t * 0.1) * 0.1
    }
  })

  return (
    <group ref={group}>
      <Sparkles count={50} scale={20} size={40} speed={0.1} color="#00ffff" opacity={0.1} />
      <Sparkles count={50} scale={25} size={30} speed={0.15} color="#ff00ff" opacity={0.1} />
      <Sparkles count={50} scale={30} size={20} speed={0.2} color="#4a9eff" opacity={0.1} />
    </group>
  )
}

const MovingLight = () => {
  const light = useRef()
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    light.current.position.set(Math.sin(t * 0.5) * 12, Math.cos(t * 0.5) * 8, 5)
  })
  return <pointLight ref={light} intensity={20} color="#00ffff" distance={25} />
}

const NeuralBrain = () => {
  const brainRef = useRef()
  const ring1 = useRef()
  const ring2 = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (brainRef.current) {
      brainRef.current.rotation.y = t * 0.1
      brainRef.current.rotation.z = Math.sin(t * 0.2) * 0.1
    }
    if (ring1.current) ring1.current.rotation.x = t * 0.4
    if (ring2.current) ring2.current.rotation.y = t * 0.2
  })

  return (
    <group>
      <Float speed={4} rotationIntensity={0.5} floatIntensity={1}>
        <group ref={brainRef}>
          <Sphere args={[2, 64, 64]}>
            <MeshDistortMaterial
              color="#00ffff"
              speed={5}
              distort={0.4}
              radius={1}
              emissive="#00bfff"
              emissiveIntensity={2}
            />
          </Sphere>
          <Sphere args={[2.3, 32, 32]}>
            <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.1} />
          </Sphere>
        </group>
      </Float>

      <Torus ref={ring1} args={[4, 0.015, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#00ffff" transparent opacity={0.2} />
      </Torus>
      <Torus ref={ring2} args={[4.5, 0.01, 16, 100]} rotation={[0, Math.PI / 2, 0]}>
        <meshBasicMaterial color="#ff0080" transparent opacity={0.15} />
      </Torus>

      <Sparkles count={200} scale={15} size={3} speed={0.4} color="#00ffff" />
      <Sparkles count={200} scale={12} size={2} speed={0.6} color="#ff00ff" />
    </group>
  )
}

export default function NeuralScene() {
  const [beams, setBeams] = useState([])

  // WebSocket 實時橋接 (模擬)
  useEffect(() => {
    // 這裡我們模擬接收來自 Railway 的 trajectory_cloud
    // 實際開發中，當 /v1/interact 執行時，後端會廣播路徑數據
    const handleTrajectory = (data) => {
      const newBeam = {
        id: Date.now(),
        start: { x: (Math.random() - 0.5) * 20, y: (Math.random() - 0.5) * 10 },
        end: { x: (Math.random() - 0.5) * 20, y: (Math.random() - 0.5) * 10 }
      }
      setBeams(prev => [...prev.slice(-5), newBeam]) // 最多保留 5 個光束
    }

    const interval = setInterval(() => {
      // 隨機觸發「數據脈衝」視覺效果，模擬 AI 正在自主瀏覽
      if (Math.random() > 0.7) handleTrajectory()
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ width: '100%', height: '650px', background: '#000', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 18], fov: 40 }} gl={{ antialias: false }}>
        <color attach="background" args={['#000005']} />
        <fog attach="fog" args={['#000000', 15, 40]} />
        
        <ambientLight intensity={0.05} />
        <pointLight position={[15, 15, 10]} intensity={5} color="#00ffff" />
        <pointLight position={[-15, -15, -10]} intensity={3} color="#ff00ff" />

        <NebulaBackground />
        <NetworkVisualizer />
        <MovingLight />
        <NeuralBrain />

        {/* 實時光軌 */}
        {beams.map(beam => (
          <TrajectoryBeam key={beam.id} start={beam.start} end={beam.end} />
        ))}
        
        <Stars radius={100} depth={50} count={8000} factor={6} saturation={0} fade speed={1} />
        
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.15} 
            mipmapBlur 
            intensity={2} 
            radius={0.4} 
          />
          <ChromaticAberration offset={[0.001, 0.001]} />
          <Noise opacity={0.06} />
          <Vignette darkness={1.2} />
        </EffectComposer>

        <OrbitControls enableZoom={false} enablePan={false} makeDefault />
      </Canvas>
      
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#00ffff',
        fontFamily: 'monospace',
        fontSize: '12px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        opacity: 0.6,
        textShadow: '0 0 10px #00ffff'
      }}>
        Neural Link v0.9 // Cloud Sync Active // Node 10201
      </div>
    </div>
  )
}
