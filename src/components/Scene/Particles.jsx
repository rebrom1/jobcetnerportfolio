import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Particles = ({ count = 100, performanceLevel }) => {
  const particlesRef = useRef();
  const particles2Ref = useRef();
  const particles3Ref = useRef();
  
  // Основной слой частиц
  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    
    const colorPalette = [
      new THREE.Color('#00FFCA'),
      new THREE.Color('#088395'),
      new THREE.Color('#05BFDB'),
      new THREE.Color('#0A4D68'),
    ];
    
    for (let i = 0; i < count; i++) {
      // Позиции в сферическом облаке
      const radius = 15 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
      
      // Разные цвета
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
      
      // Разные размеры
      siz[i] = 0.03 + Math.random() * 0.08;
    }
    
    return { positions: pos, colors: col, sizes: siz };
  }, [count]);

  // Дополнительный слой для среднего и высокого качества
  const positions2 = useMemo(() => {
    if (performanceLevel === 'LOW') return null;
    
    const pos = new Float32Array(count * 0.5 * 3);
    for (let i = 0; i < count * 0.5; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return pos;
  }, [count, performanceLevel]);

  // Третий слой только для HIGH
  const positions3 = useMemo(() => {
    if (performanceLevel !== 'HIGH') return null;
    
    const pos = new Float32Array(count * 0.3 * 3);
    for (let i = 0; i < count * 0.3; i++) {
      // Линейное распределение для звездного эффекта
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return pos;
  }, [count, performanceLevel]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (particlesRef.current) {
      // Медленное вращение основного слоя
      particlesRef.current.rotation.y = time * 0.0003;
      particlesRef.current.rotation.x = Math.sin(time * 0.0001) * 0.5;
      
      // Анимация позиций для эффекта "дыхания"
      if (performanceLevel !== 'LOW') {
        const positions = particlesRef.current.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          const wave = Math.sin(time + i * 0.1) * 0.02;
          positions[i + 1] += wave;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }

    if (particles2Ref.current && performanceLevel !== 'LOW') {
      particles2Ref.current.rotation.y = -time * 0.0005;
      particles2Ref.current.rotation.z = time * 0.0002;
    }

    if (particles3Ref.current && performanceLevel === 'HIGH') {
      particles3Ref.current.rotation.y = time * 0.0001;
      particles3Ref.current.rotation.x = -time * 0.0002;
    }
  });

  return (
    <>
      {/* Основной слой частиц */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count}
            array={colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={count}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.7}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Второй слой - мерцающие частицы */}
      {positions2 && (
        <points ref={particles2Ref}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={count * 0.5}
              array={positions2}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.04}
            color="#00FFCA"
            transparent
            opacity={0.5}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* Третий слой - далекие звезды */}
      {positions3 && (
        <points ref={particles3Ref}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={count * 0.3}
              array={positions3}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.02}
            color="#E8F6F3"
            transparent
            opacity={0.4}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </>
  );
};