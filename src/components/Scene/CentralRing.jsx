import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const CentralRing = ({ performanceLevel }) => {
  const ringGroupRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  
  const segments = performanceLevel === 'LOW' ? 50 : performanceLevel === 'MEDIUM' ? 75 : 100;

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (ringGroupRef.current) {
      // Общее медленное вращение группы
      ringGroupRef.current.rotation.y += 0.002;
      
      if (performanceLevel !== 'LOW') {
        // Плавное покачивание
        ringGroupRef.current.rotation.x = Math.sin(time * 0.3) * 0.15;
        ringGroupRef.current.rotation.z = Math.cos(time * 0.2) * 0.1;
      }
    }

    // Анимация отдельных колец
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += 0.005;
    }
    
    if (ring2Ref.current && performanceLevel !== 'LOW') {
      ring2Ref.current.rotation.z -= 0.008;
      // Пульсация
      const scale = 1 + Math.sin(time * 1.5) * 0.05;
      ring2Ref.current.scale.setScalar(scale);
    }
    
    if (ring3Ref.current && performanceLevel === 'HIGH') {
      ring3Ref.current.rotation.z += 0.012;
      const scale = 1 + Math.cos(time * 2) * 0.03;
      ring3Ref.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={ringGroupRef}>
      {/* Основное кольцо */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4.2, 0.12, 20, segments]} />
        <meshStandardMaterial
          color="#088395"
          metalness={0.9}
          roughness={0.15}
          emissive="#05BFDB"
          emissiveIntensity={0.5}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Внутреннее голографическое кольцо */}
      {performanceLevel !== 'LOW' && (
        <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.5, 0.08, 16, segments]} />
          <meshBasicMaterial
            color="#00FFCA"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Внешнее декоративное кольцо */}
      {performanceLevel === 'HIGH' && (
        <mesh ref={ring3Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[5, 0.05, 12, segments]} />
          <meshBasicMaterial
            color="#05BFDB"
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Точечные огни на кольце */}
      {performanceLevel !== 'LOW' && (
        <>
          <pointLight position={[4, 0, 0]} intensity={0.8} color="#00FFCA" distance={8} />
          <pointLight position={[-4, 0, 0]} intensity={0.8} color="#088395" distance={8} />
          <pointLight position={[0, 4, 0]} intensity={0.8} color="#05BFDB" distance={8} />
          <pointLight position={[0, -4, 0]} intensity={0.8} color="#00FFCA" distance={8} />
        </>
      )}

      {/* Энергетические частицы вокруг кольца */}
      {performanceLevel === 'HIGH' && (
        <points>
          <ringGeometry args={[4, 4.3, 64]} />
          <pointsMaterial
            size={0.08}
            color="#00FFCA"
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            sizeAttenuation={true}
          />
        </points>
      )}
    </group>
  );
};