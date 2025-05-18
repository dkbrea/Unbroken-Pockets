'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function Box() {
  return (
    <mesh>
      <boxGeometry />
      <meshNormalMaterial />
    </mesh>
  )
}

export default function ThreeScene() {
  return (
    <Canvas dpr={[1, 2]}>
      <color attach="background" args={['#f0f0f0']} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Box />
      <OrbitControls makeDefault />
    </Canvas>
  )
} 