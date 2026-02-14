import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Html } from '@react-three/drei';
import { useStore } from '../../hooks/useStore';
import * as THREE from 'three';

export const FloatingModule = ({ 
  position, 
  color, 
  label, 
  moduleId,
  onClick, 
  active,
  performanceLevel 
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  const pulsingModules = useStore((state) => state.pulsingModules);
  const isPulsing = pulsingModules.includes(moduleId);

  useFrame((state) => {
    if (meshRef.current) {
      // Rotation animation (disabled on low performance)
      if (performanceLevel !== 'LOW') {
        meshRef.current.rotation.x += 0.001;
        meshRef.current.rotation.y += 0.002;
      }
      
      // Scale animation
      const targetScale = hovered ? 1.2 : active ? 1.15 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale), 
        0.1
      );

      // Pulsing effect for new leads
      if (isPulsing) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.15;
        meshRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });

  return (
    <Float 
      speed={performanceLevel === 'LOW' ? 1 : 2} 
      rotationIntensity={0.5} 
      floatIntensity={0.5}
    >
      <group position={position}>
        <RoundedBox
          ref={meshRef}
          args={[1.5, 1.5, 1.5]}
          radius={0.1}
          smoothness={4}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'default';
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <meshStandardMaterial
            color={isPulsing ? '#FFD700' : (hovered || active ? '#00FFCA' : color)}
            metalness={0.6}
            roughness={0.2}
            emissive={isPulsing ? '#FFD700' : color}
            emissiveIntensity={isPulsing ? 0.8 : (hovered || active ? 0.5 : 0.2)}
          />
        </RoundedBox>
        
        {/* 3D Text Label */}
        <Html
          position={[0, -1.2, 0]}
          center
          distanceFactor={8}
          style={{
            background: 'rgba(0, 21, 36, 0.9)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            border: `1px solid ${isPulsing ? '#FFD700' : 'rgba(0, 255, 202, 0.3)'}`,
            color: isPulsing ? '#FFD700' : (hovered || active ? '#00FFCA' : '#E8F6F3'),
            fontFamily: 'Syne, sans-serif',
            fontWeight: '700',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            transition: 'all 0.3s ease',
          }}
        >
          {label}
          {isPulsing && ' 🔥'}
        </Html>
      </group>
    </Float>
  );
};
