import React from 'react';
import './AgentVisualization.css';

const AgentVisualization = ({ agentData }) => {
  if (!agentData) return null;

  const getStatusClass = (status) => {
    return `status-indicator ${status}`;
  };

  const formatLastActive = (lastActive) => {
    const date = new Date(lastActive);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <div className="agent-visualization">
      <div className="agent-hierarchy">
        <h3>Executive Layer</h3>
        <div className="agent-level executive">
          {agentData.executive && agentData.executive.map((agent, index) => (
            <div key={index} className="agent-node">
              <div className={getStatusClass(agent.status)}></div>
              <div className="agent-info">
                <h4>{agent.name}</h4>
                <p>Last active: {formatLastActive(agent.lastActive)}</p>
              </div>
            </div>
          ))}
        </div>

        <h3>Director Layer</h3>
        <div className="agent-level director">
          {agentData.director && agentData.director.map((agent, index) => (
            <div key={index} className="agent-node">
              <div className={getStatusClass(agent.status)}></div>
              <div className="agent-info">
                <h4>{agent.name}</h4>
                <p>Last active: {formatLastActive(agent.lastActive)}</p>
              </div>
            </div>
          ))}
        </div>

        <h3>Manager Layer</h3>
        <div className="agent-level manager">
          {agentData.manager && agentData.manager.map((agent, index) => (
            <div key={index} className="agent-node">
              <div className={getStatusClass(agent.status)}></div>
              <div className="agent-info">
                <h4>{agent.name}</h4>
                <p>Last active: {formatLastActive(agent.lastActive)}</p>
              </div>
            </div>
          ))}
        </div>

        <h3>Contributor Layer</h3>
        <div className="agent-level contributor">
          {agentData.contributor && agentData.contributor.map((agent, index) => (
            <div key={index} className="agent-node">
              <div className={getStatusClass(agent.status)}></div>
              <div className="agent-info">
                <h4>{agent.name}</h4>
                <p>Last active: {formatLastActive(agent.lastActive)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentVisualization;