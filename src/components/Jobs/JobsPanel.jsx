import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../hooks/useStore';
import './JobsPanel.css';

export const JobsPanel = () => {
  const { 
    jobs, 
    jobsLoading, 
    searchQuery, 
    fetchJobs, 
    searchJobs 
  } = useStore();

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    if (query) {
      searchJobs(query);
    } else {
      fetchJobs();
    }
  };

  return (
    <div className="jobs-panel">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Aktuelle Stellenangebote
      </motion.h2>

      <form onSubmit={handleSearch} className="search-box">
        <input
          type="text"
          name="search"
          placeholder="Suche nach Position, Unternehmen..."
          defaultValue={searchQuery}
        />
        <button type="submit">Suchen</button>
      </form>

      {jobsLoading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Lädt Stellenangebote...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <p>Keine Stellenangebote gefunden.</p>
          <button onClick={() => fetchJobs()}>Alle anzeigen</button>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              className="job-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <h3>{job.title}</h3>
              <div className="job-meta">
                <span>🏢 {job.company}</span>
                <span>📍 {job.location}</span>
                <span>⏰ {job.type}</span>
                <span>💰 {job.salary}</span>
              </div>
              <p>{job.description}</p>
              <button className="apply-btn">Jetzt Bewerben</button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
