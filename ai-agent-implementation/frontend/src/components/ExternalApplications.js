import React, { useState, useEffect } from 'react';
import './ExternalApplications.css';

const ExternalApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [connectionStatus, setConnectionStatus] = useState({});

  // Use the API URL from environment variables or default to localhost:30001
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:30001';

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, selectedCategory]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/integration/external-applications`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch external applications');
      }
      
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      console.error('Error fetching external applications:', err);
      setError('Failed to load external applications');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;
    
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }
    
    setFilteredApplications(filtered);
  };

  const handleConnect = async (appId) => {
    try {
      // In a real implementation, you would collect credentials from the user
      const credentials = {}; // Placeholder for credentials
      
      const response = await fetch(`${API_BASE_URL}/api/integration/external-applications/${appId}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credentials }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect to application');
      }
      
      const result = await response.json();
      
      // Update connection status
      setConnectionStatus(prev => ({
        ...prev,
        [appId]: { status: 'connected', message: result.message }
      }));
      
      // Refresh the applications list
      fetchApplications();
    } catch (err) {
      console.error('Error connecting to application:', err);
      setConnectionStatus(prev => ({
        ...prev,
        [appId]: { status: 'error', message: err.message }
      }));
    }
  };

  const handleDisconnect = async (appId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/integration/external-applications/${appId}/disconnect`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect from application');
      }
      
      // Update connection status
      setConnectionStatus(prev => ({
        ...prev,
        [appId]: { status: 'disconnected', message: 'Disconnected successfully' }
      }));
      
      // Refresh the applications list
      fetchApplications();
    } catch (err) {
      console.error('Error disconnecting from application:', err);
      setConnectionStatus(prev => ({
        ...prev,
        [appId]: { status: 'error', message: err.message }
      }));
    }
  };

  const getConnectionStatus = (app) => {
    if (connectionStatus[app.id]) {
      return connectionStatus[app.id];
    }
    return { status: app.connectionStatus, message: '' };
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'connected':
        return 'status-connected';
      case 'disconnected':
        return 'status-disconnected';
      case 'error':
        return 'status-error';
      default:
        return 'status-unknown';
    }
  };

  const getCategories = () => {
    const categories = [...new Set(applications.map(app => app.category))];
    return categories;
  };

  if (loading) {
    return <div className="external-applications-loading">Loading external applications...</div>;
  }

  if (error) {
    return (
      <div className="external-applications-error">
        <p>{error}</p>
        <button onClick={fetchApplications}>Retry</button>
      </div>
    );
  }

  return (
    <div className="external-applications">
      <div className="external-applications-header">
        <h2>External Applications</h2>
        <div className="external-applications-controls">
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            <option value="all">All Categories</option>
            {getCategories().map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <button onClick={fetchApplications} className="refresh-button">
            Refresh
          </button>
        </div>
      </div>

      <div className="external-applications-list">
        {filteredApplications.length === 0 ? (
          <p className="no-applications">No external applications found</p>
        ) : (
          filteredApplications.map(app => {
            const status = getConnectionStatus(app);
            return (
              <div key={app.id} className="application-card">
                <div className="application-header">
                  <h3>{app.name}</h3>
                  <span className={`status-indicator ${getStatusClass(status.status)}`}>
                    {status.status}
                  </span>
                </div>
                <div className="application-details">
                  <p className="application-description">{app.description}</p>
                  <p className="application-owner">Owner: {app.owner}</p>
                  <p className="application-category">Category: {app.category}</p>
                  {status.message && (
                    <p className={`status-message ${getStatusClass(status.status)}`}>
                      {status.message}
                    </p>
                  )}
                </div>
                <div className="application-actions">
                  {status.status === 'connected' ? (
                    <button 
                      onClick={() => handleDisconnect(app.id)}
                      className="disconnect-button"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleConnect(app.id)}
                      className="connect-button"
                    >
                      Connect
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      // In a real implementation, you might show more details
                      alert(`Application details:
Name: ${app.name}
Description: ${app.description}
Owner: ${app.owner}
Category: ${app.category}`);
                    }}
                    className="details-button"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExternalApplications;