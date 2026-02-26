import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const count = 500; // 降低一點數量提升效能

const NetworkVisualizer = () => {
  const meshRef = useRef();
  const synapticPool = useRef([]); // 模擬數據池
  const pressure = useRef(0);

  // 預先配置粒子初始狀態
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        speed: 0.05 + Math.random() * 0.2,
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 40,
        z: (Math.random() - 0.5) * 15,
      });
    }
    return temp;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    // 模擬數據脈衝：隨機湧入數據
    if (Math.random() > 0.95) {
      for(let i=0; i<20; i++) synapticPool.current.push({});
    }

    const incomingCount = synapticPool.current.length;
    synapticPool.current = [];
    
    const targetPressure = Math.min(incomingCount / 10, 1.0);
    pressure.current = THREE.MathUtils.lerp(pressure.current, targetPressure, 0.05);

    particles.forEach((p, i) => {
      const currentSpeed = p.speed * (1 + pressure.current * 15);
      p.y -= currentSpeed;
      if (p.y < -20) p.y = 20;

      dummy.position.set(p.x, p.y, p.z);
      const scaleY = 0.5 + pressure.current * 20;
      const scaleX = 0.2 / (1 + pressure.current * 3);
      dummy.scale.set(scaleX, scaleY, 1);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      if (pressure.current > 0.4) {
        color.setHSL(0.8 - pressure.current * 0.3, 1, 0.5 + pressure.current * 0.5);
      } else {
        color.setHSL(0.6, 1, 0.3 + pressure.current);
      }
      meshRef.current.setColorAt(i, color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <planeGeometry args={[0.05, 0.1]} /> 
      <meshBasicMaterial 
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
};

export default NetworkVisualizer;
