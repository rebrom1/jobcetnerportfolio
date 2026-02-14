import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export const CentralSphere = ({ performanceLevel }) => {
  const sphereGroupRef = useRef();
  const innerSphereRef = useRef();
  const outerGlowRef = useRef();
  const energyRingRef = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (sphereGroupRef.current) {
      // Медленное вращение всей группы
      sphereGroupRef.current.rotation.y += 0.003;
      sphereGroupRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
    }

    if (innerSphereRef.current) {
      // Пульсация внутренней сферы
      const scale = 1 + Math.sin(time * 2.5) * 0.12;
      innerSphereRef.current.scale.set(scale, scale, scale);
    }

    if (outerGlowRef.current) {
      // Дыхание внешнего свечения
      const glowScale = 1 + Math.sin(time * 1.5) * 0.2;
      outerGlowRef.current.scale.set(glowScale, glowScale, glowScale);
      
      // Меняющаяся прозрачность
      if (outerGlowRef.current.material) {
        outerGlowRef.current.material.opacity = 0.15 + Math.sin(time * 2) * 0.1;
      }
    }

    if (energyRingRef.current && performanceLevel !== 'LOW') {
      // Быстрое вращение энергетического кольца
      energyRingRef.current.rotation.z += 0.02;
      energyRingRef.current.rotation.x = Math.sin(time * 0.5) * 0.3;
    }
  });

  const segments = performanceLevel === 'LOW' ? 16 : performanceLevel === 'MEDIUM' ? 24 : 32;

  // Простая версия для LOW performance
  if (performanceLevel === 'LOW') {
    return (
      <mesh ref={innerSphereRef}>
        <sphereGeometry args={[0.9, segments, segments]} />
        <meshStandardMaterial
          color="#05BFDB"
          metalness={0.9}
          roughness={0.1}
          emissive="#05BFDB"
          emissiveIntensity={0.4}
        />
      </mesh>
    );
  }

  return (
    <group ref={sphereGroupRef}>
      {/* Внутреннее энергетическое ядро */}
      <mesh ref={innerSphereRef}>
        <sphereGeometry args={[0.9, segments, segments]} />
        <MeshDistortMaterial
          color="#05BFDB"
          metalness={0.95}
          roughness={0.05}
          emissive="#00FFCA"
          emissiveIntensity={0.6}
          distort={0.4}
          speed={3}
        />
      </mesh>

      {/* Внешнее голографическое свечение */}
      <mesh ref={outerGlowRef} scale={1.3}>
        <sphereGeometry args={[1.2, segments, segments]} />
        <meshBasicMaterial
          color="#00FFCA"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Энергетическое кольцо вокруг сферы */}
      {performanceLevel !== 'LOW' && (
        <mesh ref={energyRingRef} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[1.4, 0.06, 12, 48]} />
          <meshBasicMaterial
            color="#FFD700"
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Дополнительное кольцо для HIGH */}
      {performanceLevel === 'HIGH' && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.04, 10, 48]} />
          <meshBasicMaterial
            color="#088395"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Внутренний точечный свет */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={2.5} 
        color="#00FFCA" 
        distance={12}
        decay={2}
      />

      {/* Дополнительные акцентные огни */}
      {performanceLevel === 'HIGH' && (
        <>
          <pointLight position={[2, 0, 0]} intensity={1} color="#05BFDB" distance={6} />
          <pointLight position={[-2, 0, 0]} intensity={1} color="#088395" distance={6} />
          <pointLight position={[0, 2, 0]} intensity={1} color="#00FFCA" distance={6} />
          <pointLight position={[0, -2, 0]} intensity={1} color="#05BFDB" distance={6} />
        </>
      )}

      {/* Энергетические частицы */}
      {performanceLevel === 'HIGH' && (
        <points>
          <sphereGeometry args={[1.6, 32, 32]} />
          <pointsMaterial
            size={0.05}
            color="#00FFCA"
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
            sizeAttenuation={true}
          />
        </points>
      )}
    </group>
  );
};