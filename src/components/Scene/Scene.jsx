import { OrbitControls, Environment } from '@react-three/drei';
import { FloatingModule } from './FloatingModule';
import { Particles } from './Particles';
import { CentralRing } from './CentralRing';
import { CentralSphere } from './CentralSphere';
import { PERFORMANCE_CONFIG } from '../../config';

const MODULES = [
  { id: 'jobs', position: [3, 2, 0], color: '#088395', label: 'Jobs' },
  { id: 'beratung', position: [-3, 2, 0], color: '#05BFDB', label: 'Beratung' },
  { id: 'weiterbildung', position: [3, -2, 0], color: '#0A4D68', label: 'Weiterbildung' },
  { id: 'service', position: [-3, -2, 0], color: '#00FFCA', label: 'Service' },
  { id: 'about', position: [0, 3, -2], color: '#088395', label: 'Über uns' },
  { id: 'kontakt', position: [0, -3, -2], color: '#05BFDB', label: 'Kontakt' },
];

export const Scene = ({ activeSection, onModuleClick, performanceLevel = 'MEDIUM' }) => {
  const config = PERFORMANCE_CONFIG[performanceLevel];

  return (
    <>
      <color attach="background" args={['#001524']} />
      {config.enableFog && <fog attach="fog" args={['#001524', 10, 30]} />}
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00FFCA" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#05BFDB" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        color="#088395"
        castShadow={config.enableEnvironment}
        shadow-mapSize-width={config.shadowMapSize}
        shadow-mapSize-height={config.shadowMapSize}
      />

      {/* Camera Controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={8}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
        enableDamping={true}
        dampingFactor={0.05}
      />

      {/* 3D Elements */}
      <Particles count={config.particles} performanceLevel={performanceLevel} />
      <CentralRing performanceLevel={performanceLevel} />
      <CentralSphere performanceLevel={performanceLevel} />

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
        />
      ))}

      {/* Environment for reflections */}
      {config.enableEnvironment && <Environment preset="city" />}
    </>
  );
};
