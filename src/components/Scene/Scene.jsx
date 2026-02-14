import { OrbitControls, Environment} from '@react-three/drei';
import { FloatingModule } from './FloatingModule';
import { Particles } from './Particles';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { CentralRing } from './CentralRing';
import { CentralSphere } from './CentralSphere';
import { PERFORMANCE_CONFIG } from '../../config';
import * as THREE from 'three';

// Премиум конфигурация модулей
const MODULES = [
  { 
    id: 'jobs', 
    position: [5.5, 2.5, 0], 
    color: '#088395', 
    label: 'Jobs', 
    modelPath: '/models/pc.glb',
    modelScale: 0.35,
    modelRotation: [0.2, -Math.PI / 6, 0]
  },
  { 
    id: 'beratung', 
    position: [-5.5, 2.5, 0], 
    color: '#05BFDB', 
    label: 'Beratung', 
    modelPath: '/models/med.glb',
    modelScale: 0.3,
    modelRotation: [0, Math.PI / 3, 0]
  },
  { 
    id: 'weiterbildung', 
    position: [5.5, -2.5, 0], 
    color: '#0A4D68', 
    label: 'Weiterbildung', 
    modelPath: '/models/case.glb',
    modelScale: 0.5,
    modelRotation: [0, -Math.PI / 4, 0] 
  },
  { 
    id: 'service', 
    position: [-5.5, -2.5, 0], 
    color: '#00FFCA', 
    label: 'Service', 
    modelPath: '/models/case.glb',
    modelScale: 0.5,
    modelRotation: [0, Math.PI / 4, 0]
  },
  { 
    id: 'about', 
    position: [0, 5.5, -2.5], 
    color: '#088395', 
    label: 'Über uns', 
    modelPath: '/models/building.glb',
    modelScale: 0.8,
    modelRotation: [0, 0, 0]
  },
  { 
    id: 'kontakt', 
    position: [0, -5.5, -2.5], 
    color: '#05BFDB', 
    label: 'Kontakt', 
    modelPath: '/models/pc.glb',
    modelScale: 0.35,
    modelRotation: [0.2, Math.PI, 0]
  },
];

export const Scene = ({ 
  activeSection, 
  onModuleClick, 
  performanceLevel = 'MEDIUM' 
}) => {
  const config = PERFORMANCE_CONFIG[performanceLevel];

  return (
    <>
      {/* Глубокий космический фон с градиентом */}
      <color attach="background" args={['#000a14']} />
      
      {/* Volumetric fog для глубины */}
      {config.enableFog && (
        <fog attach="fog" args={['#001524', 12, 40]} />
      )}
      
      {/* ========== КИНЕМАТОГРАФИЧЕСКОЕ ОСВЕЩЕНИЕ ========== */}
      
      {/* Мягкий ambient для общей освещенности */}
      <ambientLight intensity={0.35} color="#E8F6F3" />
      
      {/* Key Light - основной источник */}
      <directionalLight
        position={[15, 12, 8]}
        intensity={1.2}
        color="#00FFCA"
        castShadow={config.enableEnvironment}
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Fill Light - заполняющий свет слева */}
      <directionalLight
        position={[-12, 8, 5]}
        intensity={0.6}
        color="#088395"
      />
      
      {/* Back Light - контровой свет для объема */}
      <directionalLight
        position={[0, -8, -10]}
        intensity={0.8}
        color="#05BFDB"
      />
      
      {/* Акцентные точечные источники */}
      <pointLight 
        position={[-15, 8, -8]} 
        intensity={1.2} 
        color="#088395" 
        distance={25}
        decay={2}
      />
      <pointLight 
        position={[15, -8, -8]} 
        intensity={1.2} 
        color="#05BFDB" 
        distance={25}
        decay={2}
      />
      
      {/* Центральный spotlight с драматическим эффектом */}
      <spotLight
        position={[0, 18, 0]}
        angle={0.5}
        penumbra={1}
        intensity={2}
        color="#00FFCA"
        castShadow={config.enableEnvironment}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Дополнительные акценты по углам */}
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#00FFCA" distance={20} />
      <pointLight position={[-10, 10, 10]} intensity={0.8} color="#088395" distance={20} />
      <pointLight position={[10, -10, 10]} intensity={0.8} color="#05BFDB" distance={20} />
      <pointLight position={[-10, -10, 10]} intensity={0.8} color="#0A4D68" distance={20} />

      {/* Rim lights для создания силуэтов */}
      {performanceLevel !== 'LOW' && (
        <>
          <pointLight position={[0, 0, -15]} intensity={1.5} color="#00FFCA" distance={30} />
          <spotLight
            position={[0, -15, 5]}
            angle={0.6}
            penumbra={1}
            intensity={1.5}
            color="#05BFDB"
          />
        </>
      )}

      {/* ========== ПРОДВИНУТЫЕ КОНТРОЛЛЕРЫ КАМЕРЫ ========== */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        minDistance={12}
        maxDistance={35}
        maxPolarAngle={Math.PI / 1.7}
        minPolarAngle={Math.PI / 5}
        enableDamping={true}
        dampingFactor={0.04}
        rotateSpeed={0.6}
        panSpeed={0.6}
        zoomSpeed={0.9}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />

      {/* ========== ЭФФЕКТЫ ЧАСТИЦ ========== */}
      <Particles 
        count={config.particles} 
        performanceLevel={performanceLevel} 
      />
      
      {/* ========== ЦЕНТРАЛЬНЫЕ ЭЛЕМЕНТЫ ========== */}
      <CentralRing performanceLevel={performanceLevel} />
      <CentralSphere performanceLevel={performanceLevel} />

      {/* ========== FLOATING МОДУЛИ ========== */}
      {MODULES.map((module) => (
        <FloatingModule
          key={module.id}
          position={module.position}
          color={module.color}
          label={module.label}
          moduleId={module.id}
          active={activeSection === module.id}
          performanceLevel={performanceLevel}
          onClick={() => onModuleClick(module.id)}
          modelPath={module.modelPath}
          modelScale={module.modelScale}
          modelRotation={module.modelRotation}
        />
      ))}

      {/* ========== HDR ENVIRONMENT ========== */}
      {config.enableEnvironment && (
        <Environment 
          preset="city" 
          background={false}
          blur={0.7}
          intensity={0.8}
        />
      )}

      {/* ========== POST-PROCESSING ЭФФЕКТЫ ========== */}
      {performanceLevel === 'HIGH' && (
        <EffectComposer>
          {/* Bloom для свечения */}
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            radius={0.8}
          />
          {/* Хроматическая аберрация для кинематографичности */}
          <ChromaticAberration
            offset={new THREE.Vector2(0.0005, 0.0005)}
          />
          {/* Виньетка для фокуса на центре */}
          <Vignette
            offset={0.3}
            darkness={0.5}
            eskil={false}
          />
        </EffectComposer>
      )}
    </>
  );
};