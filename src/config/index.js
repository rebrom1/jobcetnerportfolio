// API Configuration for FastAPI backend
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
  ENDPOINTS: {
    JOBS: '/api/jobs',
    STATS: '/api/stats',
    CONSULTATIONS: '/api/consultations',
    COURSES: '/api/courses',
    LEADS: '/api/leads',
  },
};

// Performance settings based on device
export const PERFORMANCE_CONFIG = {
  LOW: {
    particles: 50,
    sphereSegments: 16,
    torusSegments: 50,
    enableFog: false,
    enableEnvironment: false,
    enablePostProcessing: false,
    shadowMapSize: 512,
  },
  MEDIUM: {
    particles: 75,
    sphereSegments: 24,
    torusSegments: 75,
    enableFog: true,
    enableEnvironment: false,
    enablePostProcessing: false,
    shadowMapSize: 1024,
  },
  HIGH: {
    particles: 100,
    sphereSegments: 32,
    torusSegments: 100,
    enableFog: true,
    enableEnvironment: true,
    enablePostProcessing: true,
    shadowMapSize: 2048,
  },
};

// Detect device performance level
export const getPerformanceLevel = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  if (isMobile) return 'LOW';
  
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  
  if (cores >= 8 && memory >= 8) return 'HIGH';
  if (cores >= 4 && memory >= 4) return 'MEDIUM';
  return 'LOW';
};
