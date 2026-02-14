import { Suspense, useEffect, useCallback, useState } from 'react';
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

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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

    // Mouse tracking for parallax effects
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [fetchStats, setLoading]);

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

  // Parallax effect for hero
  const heroParallax = {
    transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`,
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
          ⚡ Leistungsmodus aktiv
        </div>
      )}

      {isConnected && (
        <div className="ws-indicator">
          <span className="pulse-dot"></span>
          Live
        </div>
      )}

      <Canvas
        frameloop="demand"
        camera={{ position: [0, 0, 12], fov: 50 }}
        style={{ opacity: loading ? 0 : 1, transition: 'opacity 1s' }}
        gl={{ 
          antialias: performanceLevel !== 'LOW', 
          powerPreference: 'high-performance',
          alpha: true,
        }}
        dpr={performanceLevel === 'HIGH' ? [1, 2] : 1}
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
            JobCenter Kronach
          </div>
          
          <div
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
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
              <span className="nav-link-text">Jobs</span>
              <span className="nav-link-count">{stats.openPositions}</span>
            </a>
            <a
              onClick={() => handleNavClick('beratung')}
              className={`nav-link ${activeSection === 'beratung' ? 'active' : ''}`}
            >
              <span className="nav-link-text">Beratung</span>
            </a>
            <a
              onClick={() => handleNavClick('weiterbildung')}
              className={`nav-link ${activeSection === 'weiterbildung' ? 'active' : ''}`}
            >
              <span className="nav-link-text">Weiterbildung</span>
            </a>
            <a
              onClick={() => handleNavClick('kontakt')}
              className={`nav-link ${activeSection === 'kontakt' ? 'active' : ''}`}
            >
              <span className="nav-link-text">Kontakt</span>
            </a>
          </nav>
        </header>

        <div className={`hero ${activeSection ? 'hidden' : ''}`} style={heroParallax}>
          <h1>Ihre Karriere<br />In 3D Erleben</h1>
          <p className="hero-subtitle">
            Interaktive Jobsuche und Beratung für Kronach
          </p>
          <div className="cta-button" onClick={() => handleNavClick('jobs')}>
            <span className="cta-text">Jetzt Entdecken</span>
            <span className="cta-icon">→</span>
          </div>
        </div>

        <div className={`info-panel ${activeSection ? 'hidden' : ''}`}>
          <div className="info-panel-header">
            <h3>Aktuelle Zahlen</h3>
            <div className="info-panel-badge">Live</div>
          </div>
          
          <div className="stats-grid">
            <div className="stat">
              <span className="stat-icon">💼</span>
              <div className="stat-content">
                <span className="stat-value">{stats.openPositions}</span>
                <span className="stat-label">Offene Stellen</span>
              </div>
            </div>
            
            <div className="stat">
              <span className="stat-icon">✅</span>
              <div className="stat-content">
                <span className="stat-value">{stats.successfulPlacements}</span>
                <span className="stat-label">Erfolgreiche Vermittlungen</span>
              </div>
            </div>
            
            <div className="stat">
              <span className="stat-icon">📅</span>
              <div className="stat-content">
                <span className="stat-value">{stats.consultationsPerMonth}</span>
                <span className="stat-label">Beratungstermine/Monat</span>
              </div>
            </div>
            
            <div className="stat">
              <span className="stat-icon">🎓</span>
              <div className="stat-content">
                <span className="stat-value">{stats.courses}</span>
                <span className="stat-label">Weiterbildungen</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`instructions ${activeSection ? 'hidden' : ''}`}>
          <div className="instruction-item">
            <span className="instruction-icon">🖱️</span>
            <span>Maus zum Drehen</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">🔍</span>
            <span>Scrollen zum Zoomen</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">👆</span>
            <span>Module anklicken</span>
          </div>
        </div>

        <div className={`instructions mobile ${activeSection ? 'hidden' : ''}`}>
          <div className="instruction-item">
            <span className="instruction-icon">👆</span>
            <span>Wischen zum Drehen</span>
          </div>
          <div className="instruction-item">
            <span className="instruction-icon">🤏</span>
            <span>Zwei Finger zum Zoomen</span>
          </div>
        </div>

        {activeSection && (
          <div className="content-panel active">
            <div className="close-btn" onClick={handleCloseContent}>
              <span className="close-icon">✕</span>
            </div>
            <div className="content-wrapper">
              {renderContentPanel()}
            </div>
          </div>
        )}
      </div>

      <Notifications />
    </>
  );
}

// Premium Panel Components
const ConsultationPanel = () => (
  <div className="panel-content">
    <h2>Beratung</h2>
    <div className="panel-grid">
      <div className="panel-card">
        <div className="panel-card-icon">💼</div>
        <h3>Karriereberatung</h3>
        <p>Professionelle Unterstützung für Ihren beruflichen Werdegang</p>
      </div>
      <div className="panel-card">
        <div className="panel-card-icon">📊</div>
        <h3>Bewerbungstraining</h3>
        <p>Optimieren Sie Ihre Bewerbungsunterlagen und Ihr Auftreten</p>
      </div>
      <div className="panel-card">
        <div className="panel-card-icon">🎯</div>
        <h3>Orientierung</h3>
        <p>Finden Sie den passenden beruflichen Weg für sich</p>
      </div>
    </div>
  </div>
);

const CoursesPanel = () => (
  <div className="panel-content">
    <h2>Weiterbildung</h2>
    <div className="panel-grid">
      <div className="panel-card">
        <div className="panel-card-icon">💻</div>
        <h3>IT & Digitales</h3>
        <p>Moderne Technologien und digitale Kompetenzen</p>
      </div>
      <div className="panel-card">
        <div className="panel-card-icon">🌐</div>
        <h3>Sprachen</h3>
        <p>Erweitern Sie Ihre sprachlichen Fähigkeiten</p>
      </div>
      <div className="panel-card">
        <div className="panel-card-icon">📈</div>
        <h3>Management</h3>
        <p>Führungskompetenzen und betriebswirtschaftliches Wissen</p>
      </div>
    </div>
  </div>
);

const ServicesPanel = () => (
  <div className="panel-content">
    <h2>Service</h2>
    <div className="panel-grid">
      <div className="panel-card">
        <div className="panel-card-icon">📞</div>
        <h3>Telefonische Beratung</h3>
        <p>Schnelle Hilfe zu Ihren Fragen</p>
      </div>
      <div className="panel-card">
        <div className="panel-card-icon">📧</div>
        <h3>E-Mail Support</h3>
        <p>Schriftliche Anfragen werden zeitnah bearbeitet</p>
      </div>
      <div className="panel-card">
        <div className="panel-card-icon">🏢</div>
        <h3>Vor-Ort Service</h3>
        <p>Persönliche Beratung in unseren Räumlichkeiten</p>
      </div>
    </div>
  </div>
);

const AboutPanel = () => (
  <div className="panel-content">
    <h2>Über uns</h2>
    <div className="about-content">
      <div className="about-section">
        <h3>Unsere Mission</h3>
        <p>
          Das JobCenter Kronach ist Ihr kompetenter Partner für berufliche 
          Orientierung, Weiterbildung und Jobvermittlung in der Region.
        </p>
      </div>
      <div className="about-section">
        <h3>Unsere Werte</h3>
        <ul className="about-list">
          <li>✨ Kompetenz und Professionalität</li>
          <li>🤝 Persönliche Betreuung</li>
          <li>🎯 Zielorientierte Lösungen</li>
          <li>💡 Innovation und Modernität</li>
        </ul>
      </div>
    </div>
  </div>
);

const ContactPanel = () => (
  <div className="panel-content">
    <h2>Kontakt</h2>
    <div className="contact-grid">
      <div className="contact-card">
        <div className="contact-icon">📍</div>
        <h3>Adresse</h3>
        <p>JobCenter Kronach<br />Musterstraße 123<br />96317 Kronach</p>
      </div>
      <div className="contact-card">
        <div className="contact-icon">📞</div>
        <h3>Telefon</h3>
        <p>+49 (0) 9261 / 12345<br />Mo-Fr: 8:00 - 16:00 Uhr</p>
      </div>
      <div className="contact-card">
        <div className="contact-icon">📧</div>
        <h3>E-Mail</h3>
        <p>info@jobcenter-kronach.de<br />Antwort binnen 24h</p>
      </div>
    </div>
  </div>
);

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
          <div className="notification-icon">
            {notification.type === 'success' && '✅'}
            {notification.type === 'error' && '❌'}
            {notification.type === 'warning' && '⚠️'}
          </div>
          <div className="notification-content">
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
          </div>
          <div className="notification-close">✕</div>
        </div>
      ))}
    </div>
  );
};

export default App;