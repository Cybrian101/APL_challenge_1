"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import type { Ball } from '@/types/match';

function BallPredictor({ lastBall }: { lastBall: Ball | null }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const tRef = useRef(0);

  useFrame((state, delta) => {
    tRef.current += delta;
    if (mesh.current) {
      // simple oscillating predictor that moves along an arc
      const t = (Math.sin(tRef.current * 1.2) + 1) / 2;
      const angle = -Math.PI / 2 + t * Math.PI;
      const r = 6 + (lastBall?.runs ?? 0) * 0.4;
      mesh.current.position.set(Math.cos(angle) * r, Math.sin(angle) * 1.6 + 1.5, Math.sin(angle) * r * 0.3);
      mesh.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.35, 16, 12]} />
      <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.4} />
    </mesh>
  );
}

export default function BoundaryViewer({ lastBall }: { lastBall: Ball | null }) {
  const ring = useMemo(() => {
    const geom = new THREE.RingGeometry(6, 6.6, 64);
    return geom;
  }, []);

  return (
    <div className="h-48 w-full">
      <Canvas camera={{ position: [0, 8, 18], fov: 35 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#061018" />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}> 
          <ringGeometry args={[6, 6.6, 64]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>

        <BallPredictor lastBall={lastBall} />

        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}
