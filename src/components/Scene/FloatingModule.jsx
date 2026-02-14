import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html, useGLTF, Trail, Sparkles } from '@react-three/drei';
import { useStore } from '../../hooks/useStore';
import * as THREE from 'three';

export const FloatingModule = ({ 
  position, 
  color, 
  label, 
  moduleId,
  onClick, 
  active,
  performanceLevel,
  modelPath,
  modelScale = 1,
  modelRotation = [0, 0, 0]
}) => {
  const groupRef = useRef();
  const modelRef = useRef();
  const glowRef = useRef();
  const ringRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Загружаем модель
  const { scene } = useGLTF(modelPath);
  
  // Клонируем сцену для каждого экземпляра
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Вычисляем bounding box для нормализации размера
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Нормализуем размер модели к единице
    const normalizeScale = 2 / maxDim;
    clone.scale.multiplyScalar(normalizeScale);
    
    // Центрируем модель
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center.multiplyScalar(normalizeScale));
    
    // Применяем премиум материалы
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color = new THREE.Color(color);
        child.material.emissive = new THREE.Color(color);
        child.material.emissiveIntensity = 0.3;
        child.material.metalness = 0.95;
        child.material.roughness = 0.1;
        child.material.envMapIntensity = 1.5;
        
        // Добавляем тени для реализма
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    return clone;
  }, [scene, color]);

  // Применяем базовые трансформации модели
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.rotation.set(...modelRotation);
    }
  }, [modelRotation]);

  const pulsingModules = useStore((state) => state.pulsingModules);
  const isPulsing = pulsingModules.includes(moduleId);

  useFrame((state) => {
    if (!groupRef.current || !modelRef.current) return;

    const time = state.clock.elapsedTime;

    // Продвинутая анимация вращения с синусоидой
    if (performanceLevel !== 'LOW') {
      groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.15;
      modelRef.current.rotation.y += 0.008;
      
      // Легкое покачивание
      groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.1;
    }
    
    // Плавное масштабирование всей группы
    let targetScale = modelScale;
    
    if (isPulsing) {
      const pulse = 1 + Math.sin(time * 8) * 0.15;
      targetScale = modelScale * pulse;
    } else if (hovered) {
      targetScale = modelScale * 1.25;
    } else if (active) {
      targetScale = modelScale * 1.15;
    }
    
    const currentScale = groupRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.12);
    groupRef.current.scale.setScalar(newScale);

    // Анимация голографического кольца
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.01;
      const ringScale = 1 + Math.sin(time * 2) * 0.1;
      ringRef.current.scale.setScalar(ringScale);
      
      // Меняем прозрачность кольца
      if (ringRef.current.material) {
        ringRef.current.material.opacity = 0.3 + Math.sin(time * 3) * 0.2;
      }
    }

    // Анимация внешнего свечения
    if (glowRef.current) {
      const glowScale = 1.2 + Math.sin(time * 1.5) * 0.15;
      glowRef.current.scale.setScalar(glowScale);
      glowRef.current.material.opacity = hovered ? 0.4 : active ? 0.3 : 0.15;
    }

    // Динамическое свечение материалов
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.material.emissive) {
          const targetIntensity = isPulsing ? 0.8 : hovered ? 0.6 : active ? 0.4 : 0.3;
          child.material.emissiveIntensity = THREE.MathUtils.lerp(
            child.material.emissiveIntensity,
            targetIntensity,
            0.15
          );
        }
      });
    }
  });

  return (
    <Float 
      speed={performanceLevel === 'LOW' ? 1 : 2} 
      rotationIntensity={performanceLevel === 'LOW' ? 0.2 : 0.4} 
      floatIntensity={performanceLevel === 'LOW' ? 0.3 : 0.6}
    >
      <group 
        ref={groupRef}
        position={position}
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
        {/* Внешнее голографическое свечение */}
        {performanceLevel !== 'LOW' && (
          <mesh ref={glowRef} scale={1.2}>
            <sphereGeometry args={[2.5, 32, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.15}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {/* Вращающееся голографическое кольцо */}
        {(hovered || active || isPulsing) && performanceLevel !== 'LOW' && (
          <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.8, 0.08, 16, 64]} />
            <meshBasicMaterial
              color={isPulsing ? '#FFD700' : color}
              transparent
              opacity={0.4}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {/* Искры вокруг модели */}
        {(active || isPulsing) && performanceLevel === 'HIGH' && (
          <Sparkles
            count={isPulsing ? 80 : 40}
            scale={4}
            size={2}
            speed={isPulsing ? 1.5 : 0.8}
            color={isPulsing ? '#FFD700' : color}
            opacity={0.6}
          />
        )}

        {/* Trail эффект при движении */}
        {performanceLevel === 'HIGH' && (hovered || active) && (
          <Trail
            width={3}
            length={8}
            color={new THREE.Color(color)}
            attenuation={(t) => t * t}
          >
            <mesh>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color={color} transparent opacity={0} />
            </mesh>
          </Trail>
        )}

        {/* 3D модель */}
        <primitive 
          ref={modelRef}
          object={clonedScene}
        />
        
        {/* Динамический точечный свет */}
        {(active || isPulsing || hovered) && performanceLevel !== 'LOW' && (
          <pointLight 
            color={isPulsing ? '#FFD700' : color} 
            intensity={isPulsing ? 3 : hovered ? 2 : 1.5}
            distance={8}
            decay={2}
          />
        )}

        {/* Дополнительный rim light для объема */}
        {performanceLevel !== 'LOW' && (
          <>
            <pointLight 
              position={[3, 0, 0]}
              color={color} 
              intensity={0.5}
              distance={4}
            />
            <pointLight 
              position={[-3, 0, 0]}
              color={color} 
              intensity={0.5}
              distance={4}
            />
          </>
        )}
        
        {/* Премиум HTML Label с анимациями */}
        <Html
          position={[0, -2.5, 0]}
          center
          distanceFactor={10}
          style={{
            background: isPulsing 
              ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(255, 140, 0, 0.25))'
              : `linear-gradient(135deg, ${color}20, ${color}10)`,
            padding: '0.7rem 1.4rem',
            borderRadius: '30px',
            border: isPulsing 
              ? '2px solid #FFD700' 
              : `2px solid ${hovered || active ? color : 'rgba(0, 255, 202, 0.3)'}`,
            color: isPulsing ? '#FFD700' : (hovered || active ? '#00FFCA' : '#E8F6F3'),
            fontFamily: 'Syne, sans-serif',
            fontWeight: '800',
            fontSize: hovered ? '0.95rem' : '0.85rem',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: isPulsing 
              ? '0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.3)' 
              : (hovered || active ? `0 0 20px ${color}60, 0 0 40px ${color}30` : `0 0 10px ${color}20`),
            backdropFilter: 'blur(12px)',
            textShadow: isPulsing 
              ? '0 0 10px #FFD700, 0 0 20px #FFD700'
              : (hovered || active ? `0 0 10px ${color}` : 'none'),
            transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {isPulsing && '✨ '}
          {label}
          {isPulsing && ' 🔥'}
        </Html>

        {/* Индикатор активности снизу */}
        {active && (
          <Html
            position={[0, -3.2, 0]}
            center
            distanceFactor={10}
            style={{
              width: '80px',
              height: '4px',
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              borderRadius: '2px',
              boxShadow: `0 0 10px ${color}`,
              pointerEvents: 'none',
            }}
          />
        )}
      </group>
    </Float>
  );
};

// Предзагрузка моделей
useGLTF.preload('/models/building.glb');
useGLTF.preload('/models/pc.glb');
useGLTF.preload('/models/case.glb');
useGLTF.preload('/models/med.glb');