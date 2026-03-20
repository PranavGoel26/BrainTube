import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function BrainParticles() {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const { positions, colors } = useMemo(() => {
    const count = 4000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Sphere distribution for brain shape
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.2 + (Math.random() - 0.5) * 0.8;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.85;
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Purple to cyan gradient
      const t = Math.random();
      col[i * 3] = 0.5 + t * 0.3;     // R
      col[i * 3 + 1] = 0.2 + t * 0.5;  // G
      col[i * 3 + 2] = 0.8 + t * 0.2;  // B
    }

    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={colors.length / 3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function FloatingRing({ radius, speed, color }: { radius: number; speed: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * speed;
    ref.current.rotation.z = state.clock.elapsedTime * speed * 0.5;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.008, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
}

export default function BrainScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
        <ambientLight intensity={0.2} />
        <BrainParticles />
        <FloatingRing radius={3} speed={0.2} color="#8b5cf6" />
        <FloatingRing radius={3.5} speed={-0.15} color="#06b6d4" />
        <FloatingRing radius={2.5} speed={0.1} color="#7c3aed" />
      </Canvas>
    </div>
  );
}
