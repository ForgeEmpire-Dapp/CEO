import React, { useState, useEffect } from 'react';
import AgentVisualization from './AgentVisualization';
import RealTimeMonitor from './RealTimeMonitor';
import LLMInterface from './LLMInterface';
import AnalyticsDashboard from './AnalyticsDashboard';
import TaskManager from './TaskManager';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch data from your backend API
    const mockData = {
      executive: [
        { name: "CEO", status: "active", lastActive: new Date().toISOString() },
        { name: "CTO", status: "active", lastActive: new Date().toISOString() },
        { name: "CFO", status: "idle", lastActive: new Date(Date.now() - 3600000).toISOString() }
      ],
      director: [
        { name: "VP of Engineering", status: "active", lastActive: new Date().toISOString() },
        { name: "VP of Marketing", status: "active", lastActive: new Date().toISOString() }
      ],
      manager: [
        { name: "Engineering Manager", status: "active", lastActive: new Date().toISOString() },
        { name: "Marketing Manager", status: "idle", lastActive: new Date(Date.now() - 1800000).toISOString() }
      ],
      contributor: [
        { name: "Software Engineer", status: "active", lastActive: new Date().toISOString() },
        { name: "Data Scientist", status: "active", lastActive: new Date().toISOString() }
      ]
    };
    
    setAgentData(mockData);
    setLoading(false);
  }, []);

  const renderTabContent = () => {
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
      </nav>
      <div className="dashboard-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Dashboard;