import React, { useState, useEffect } from 'react';
import AgentVisualization from './AgentVisualization';
import RealTimeMonitor from './RealTimeMonitor';
import LLMInterface from './LLMInterface';
import AnalyticsDashboard from './AnalyticsDashboard';
import TaskManager from './TaskManager';
import ExternalApplications from './ExternalApplications';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use the API URL from environment variables or default to localhost:30001
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:30001';

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data from all agent layers
        const [executiveRes, directorRes, managerRes, contributorRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/agents/executive`),
          fetch(`${API_BASE_URL}/api/agents/director`),
          fetch(`${API_BASE_URL}/api/agents/manager`),
          fetch(`${API_BASE_URL}/api/agents/individual-contributor`)
        ]);

        // Check if all requests were successful
        if (!executiveRes.ok || !directorRes.ok || !managerRes.ok || !contributorRes.ok) {
          throw new Error('Failed to fetch agent data');
        }

        // Parse the responses
        const [executiveData, directorData, managerData, contributorData] = await Promise.all([
          executiveRes.json(),
          directorRes.json(),
          managerRes.json(),
          contributorRes.json()
        ]);

        // Structure the data as expected by the components
        const structuredData = {
          executive: executiveData.map(agent => ({
            name: agent.name,
            description: agent.description,
            status: 'active',
            lastActive: agent.lastActive || new Date().toISOString()
          })),
          director: directorData.map(agent => ({
            name: agent.name,
            description: agent.description,
            status: 'active',
            lastActive: agent.lastActive || new Date().toISOString()
          })),
          manager: managerData.map(agent => ({
            name: agent.name,
            description: agent.description,
            status: 'active',
            lastActive: agent.lastActive || new Date().toISOString()
          })),
          contributor: contributorData.map(agent => ({
            name: agent.name || 'Individual Contributor',
            description: agent.description || 'Specialist & Associate',
            status: 'active',
            lastActive: agent.lastActive || new Date().toISOString()
          }))
        };

        setAgentData(structuredData);
      } catch (err) {
        console.error('Error fetching agent data:', err);
        setError('Failed to load agent data from the backend API.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [API_BASE_URL]);

  const renderTabContent = () => {
    if (error) {
      return (
        <div className="dashboard-error">
          <p>{error}</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <h2>Organization Overview</h2>
            <AgentVisualization agentData={agentData} />
          </div>
        );
      case 'monitor':
        return (
          <div>
            <h2>Real-time Monitoring</h2>
            <RealTimeMonitor agentData={agentData} />
          </div>
        );
      case 'analytics':
        return (
          <div>
            <AnalyticsDashboard />
          </div>
        );
      case 'tasks':
        return (
          <div>
            <TaskManager />
          </div>
        );
      case 'assistant':
        return (
          <div>
            <h2>AI Assistant</h2>
            <LLMInterface />
          </div>
        );
      case 'external-apps':
        return (
          <div>
            <h2>External Applications</h2>
            <ExternalApplications />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Organization Overview
        </button>
        <button 
          className={activeTab === 'monitor' ? 'active' : ''}
          onClick={() => setActiveTab('monitor')}
        >
          Real-time Monitor
        </button>
        <button 
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button 
          className={activeTab === 'tasks' ? 'active' : ''}
          onClick={() => setActiveTab('tasks')}
        >
          Task Manager
        </button>
        <button 
          className={activeTab === 'assistant' ? 'active' : ''}
          onClick={() => setActiveTab('assistant')}
        >
          AI Assistant
        </button>
        <button 
          className={activeTab === 'external-apps' ? 'active' : ''}
          onClick={() => setActiveTab('external-apps')}
        >
          External Apps
        </button>
      </nav>
      <div className="dashboard-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Dashboard;