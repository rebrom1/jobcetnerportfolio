import { create } from 'zustand';
import { jobsAPI, statsAPI } from '../api';

// Main app store
export const useStore = create((set, get) => ({
  // UI State
  activeSection: null,
  mobileMenuOpen: false,
  loading: true,
  
  setActiveSection: (section) => set({ activeSection: section }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setLoading: (loading) => set({ loading }),

  // Stats
  stats: {
    openPositions: 0,
    successfulPlacements: 0,
    consultationsPerMonth: 0,
    courses: 0,
  },
  
  fetchStats: async () => {
    try {
      const data = await statsAPI.getCurrent();
      set({ stats: data });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  updateStats: (newStats) => set({ stats: newStats }),

  // Jobs
  jobs: [],
  selectedJob: null,
  jobsLoading: false,
  searchQuery: '',

  fetchJobs: async (params) => {
    set({ jobsLoading: true });
    try {
      const data = await jobsAPI.getAll(params);
      set({ jobs: data, jobsLoading: false });
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      set({ jobsLoading: false });
    }
  },

  searchJobs: async (query) => {
    set({ searchQuery: query, jobsLoading: true });
    try {
      const data = await jobsAPI.search(query);
      set({ jobs: data, jobsLoading: false });
    } catch (error) {
      console.error('Failed to search jobs:', error);
      set({ jobsLoading: false });
    }
  },

  setSelectedJob: (job) => set({ selectedJob: job }),

  // 3D Scene State
  hoveredModule: null,
  pulsingModules: [],

  setHoveredModule: (moduleId) => set({ hoveredModule: moduleId }),
  
  addPulsingModule: (moduleId) => {
    const { pulsingModules } = get();
    if (!pulsingModules.includes(moduleId)) {
      set({ pulsingModules: [...pulsingModules, moduleId] });
      
      // Remove after animation
      setTimeout(() => {
        const current = get().pulsingModules;
        set({ pulsingModules: current.filter(id => id !== moduleId) });
      }, 3000);
    }
  },

  // Notifications
  notifications: [],
  
  addNotification: (notification) => {
    const id = Date.now();
    set({ 
      notifications: [...get().notifications, { ...notification, id }] 
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      set({ 
        notifications: get().notifications.filter(n => n.id !== id) 
      });
    }, 5000);
  },

  removeNotification: (id) => {
    set({ 
      notifications: get().notifications.filter(n => n.id !== id) 
    });
  },
}));

// Performance settings store
export const usePerformanceStore = create((set) => ({
  performanceLevel: 'MEDIUM',
  fps: 60,
  
  setPerformanceLevel: (level) => set({ performanceLevel: level }),
  setFps: (fps) => set({ fps }),
}));
