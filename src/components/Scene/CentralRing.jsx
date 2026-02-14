import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export const CentralRing = ({ performanceLevel }) => {
  const ringRef = useRef();
  const segments = performanceLevel === 'LOW' ? 50 : performanceLevel === 'MEDIUM' ? 75 : 100;

  useFrame((state) => {
    if (ringRef.current) {
      if (performanceLevel !== 'LOW') {
        ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      }
      ringRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group ref={ringRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4, 0.1, 16, segments]} />
        <meshStandardMaterial
          color="#088395"
          metalness={0.8}
          roughness={0.2}
          emissive="#05BFDB"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
};
