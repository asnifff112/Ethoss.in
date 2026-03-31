"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles() {
  const count = 1500;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 10;
      const factor = Math.random() * 0.5 + 0.5;
      const speed = Math.random() * 0.01 + 0.005;
      temp.push({ t: Math.random() * 100, x, y, z, factor, speed });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    particles.forEach((particle, i) => {
      let { t, x, y, z, factor, speed } = particle;
      t += speed;
      particle.t = t;
      
      dummy.position.set(
        x + Math.sin(t) * factor,
        y + Math.cos(t) * factor,
        z + Math.sin(t*0.5) * factor
      );
      
      const s = Math.max(0.1, 1 - z * 0.1);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) {
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshBasicMaterial color="#1a2f67" transparent opacity={0.3} />
    </instancedMesh>
  );
}

export function ThreeBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <Particles />
      </Canvas>
    </div>
  );
}
