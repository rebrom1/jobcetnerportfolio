import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';

export const CentralSphere = ({ performanceLevel }) => {
  const sphereRef = useRef();

  useFrame((state) => {
    if (sphereRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      sphereRef.current.scale.set(scale, scale, scale);
    }
  });

  const segments = performanceLevel === 'LOW' ? 16 : performanceLevel === 'MEDIUM' ? 24 : 32;

  // Use simple material on low performance
  if (performanceLevel === 'LOW') {
    return (
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.8, segments, segments]} />
        <meshStandardMaterial
          color="#05BFDB"
          metalness={0.9}
          roughness={0.1}
          emissive="#05BFDB"
          emissiveIntensity={0.3}
        />
      </mesh>
    );
  }

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[0.8, segments, segments]} />
      <MeshDistortMaterial
        color="#05BFDB"
        metalness={0.9}
        roughness={0.1}
        distort={0.3}
        speed={2}
      />
    </mesh>
  );
};
