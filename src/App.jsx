import { Suspense, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene/Scene';
import { JobsPanel } from './components/Jobs/JobsPanel';
import { useStore } from './hooks/useStore';
import { useRealtimeStats, useLeadNotifications } from './hooks/useWebSocket';
import { getPerformanceLevel, PERFORMANCE_CONFIG } from './config';
import './App.css';

function App() {
  const {
    activeSection,
    mobileMenuOpen,
    loading,
    stats,
    setActiveSection,
    setMobileMenuOpen,
    setLoading,
    fetchStats,
    updateStats,
    addPulsingModule,
    addNotification,
  } = useStore();

  const performanceLevel = getPerformanceLevel();
  
  // Real-time stats updates via WebSocket
  const { stats: realtimeStats, isConnected } = useRealtimeStats();
  
  // Handle new lead notifications
  useLeadNotifications(useCallback((leadData) => {
    // Pulse the relevant module
    if (leadData.source === 'jobs') {
      addPulsingModule('jobs');
    }
    
    // Show notification
    addNotification({
      type: 'success',
      title: 'Neuer Lead!',
      message: `${leadData.name} hat Interesse an ${leadData.position}`,
    });
  }, [addPulsingModule, addNotification]));

  useEffect(() => {
    // Initial data fetch
    fetchStats();
    
    // Simulate loading
    setTimeout(() => setLoading(false), 2000);
  }, []);

  // Update stats when WebSocket data arrives
  useEffect(() => {
    if (realtimeStats) {
      updateStats(realtimeStats);
    }
  }, [realtimeStats, updateStats]);

  const handleModuleClick = useCallback((sectionId) => {
    setActiveSection(sectionId);
  }, [setActiveSection]);

  const handleNavClick = useCallback((sectionId) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
  }, [setActiveSection, setMobileMenuOpen]);

  const handleCloseContent = useCallback(() => {
    setActiveSection(null);
  }, [setActiveSection]);

  const handleLogoClick = useCallback(() => {
    setActiveSection(null);
  }, [setActiveSection]);

  const renderContentPanel = () => {
    switch(activeSection) {
      case 'jobs':
        return <JobsPanel />;
      case 'beratung':
        return <ConsultationPanel />;
      case 'weiterbildung':
        return <CoursesPanel />;
      case 'service':
        return <ServicesPanel />;
      case 'about':
        return <AboutPanel />;
      case 'kontakt':
        return <ContactPanel />;
      default:
        return null;
    }
  };

  return (
    <>
      {loading && (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Lädt 3D-Erlebnis...</p>
        </div>
      )}

      {performanceLevel === 'LOW' && (
        <div className="perf-badge active">
          Leistungsmodus aktiv
        </div>
      )}

      {isConnected && (
        <div className="ws-indicator">
          🟢 Live
        </div>
      )}

      <Canvas
        frameloop="demand"
        camera={{ position: [0, 0, 12], fov: 50 }}
        style={{ opacity: loading ? 0 : 1, transition: 'opacity 1s' }}
        gl={{ 
          antialias: performanceLevel !== 'LOW', 
          powerPreference: 'high-performance' 
        }}
      >
        <Suspense fallback={null}>
          <Scene
            activeSection={activeSection}
            onModuleClick={handleModuleClick}
            performanceLevel={performanceLevel}
          />
        </Suspense>
      </Canvas>

      <div className="overlay">
        <header className="header">
          <div className="logo" onClick={handleLogoClick}>
            JobCenter<br />Kronach
          </div>
          <div
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
          <nav className={`nav ${mobileMenuOpen ? 'active' : ''}`}>
            <a
              onClick={() => handleNavClick('jobs')}
              className={`nav-link ${activeSection === 'jobs' ? 'active' : ''}`}
            >
              Jobs
            </a>
            <a
              onClick={() => handleNavClick('beratung')}
              className={`nav-link ${activeSection === 'beratung' ? 'active' : ''}`}
            >
              Beratung
            </a>
            <a
              onClick={() => handleNavClick('weiterbildung')}
              className={`nav-link ${activeSection === 'weiterbildung' ? 'active' : ''}`}
            >
              Weiterbildung
            </a>
            <a
              onClick={() => handleNavClick('kontakt')}
              className={`nav-link ${activeSection === 'kontakt' ? 'active' : ''}`}
            >
              Kontakt
            </a>
          </nav>
        </header>

        <div className={`hero ${activeSection ? 'hidden' : ''}`}>
          <h1>
            Ihre Karriere
            <br />
            In 3D Erleben
          </h1>
          <p>Interaktive Jobsuche und Beratung für Kronach</p>
          <div className="cta-button" onClick={() => handleNavClick('jobs')}>
            Jetzt Entdecken
          </div>
        </div>

        <div className={`info-panel ${activeSection ? 'hidden' : ''}`}>
          <h3>Aktuelle Zahlen</h3>
          <div className="stat">
            <span className="stat-label">Offene Stellen</span>
            <span className="stat-value">{stats.openPositions}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Erfolgreiche Vermittlungen</span>
            <span className="stat-value">{stats.successfulPlacements}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Beratungstermine/Monat</span>
            <span className="stat-value">{stats.consultationsPerMonth}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Weiterbildungen</span>
            <span className="stat-value">{stats.courses}</span>
          </div>
        </div>

        <div className={`instructions ${activeSection ? 'hidden' : ''}`}>
          🖱️ Bewegen Sie die Maus zum Drehen • 🔍 Scrollen zum Zoomen • 👆
          Klicken Sie auf die Module
        </div>

        <div className={`instructions mobile ${activeSection ? 'hidden' : ''}`}>
          👆 Wischen zum Drehen • 🤏 Zwei Finger zum Zoomen
        </div>

        {activeSection && (
          <div className="content-panel active">
            <div className="close-btn" onClick={handleCloseContent}>
              ✕
            </div>
            {renderContentPanel()}
          </div>
        )}
      </div>

      <Notifications />
    </>
  );
}

// Placeholder components (you'll need to create these)
const ConsultationPanel = () => <div>Beratung Panel - Coming Soon</div>;
const CoursesPanel = () => <div>Weiterbildung Panel - Coming Soon</div>;
const ServicesPanel = () => <div>Services Panel - Coming Soon</div>;
const AboutPanel = () => <div>Über uns Panel - Coming Soon</div>;
const ContactPanel = () => <div>Kontakt Panel - Coming Soon</div>;

const Notifications = () => {
  const notifications = useStore((state) => state.notifications);
  const removeNotification = useStore((state) => state.removeNotification);

  return (
    <div className="notifications-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification ${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          <strong>{notification.title}</strong>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
};

export default App;
