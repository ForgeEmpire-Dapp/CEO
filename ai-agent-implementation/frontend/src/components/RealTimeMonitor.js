import React, { useState, useEffect } from 'react';
import './RealTimeMonitor.css';

const RealTimeMonitor = ({ agentData }) => {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');

  // Simulate real-time activity stream
  useEffect(() => {
    const interval = setInterval(() => {
      const agentTypes = ['executive', 'director', 'manager', 'contributor'];
      const actions = [
        'executed task', 
        'sent message', 
        'requested data', 
        'completed analysis',
        'updated metrics',
        'collaborated with pod'
      ];
      
      const randomAgentType = agentTypes[Math.floor(Math.random() * agentTypes.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      if (agentData && agentData[randomAgentType] && agentData[randomAgentType].length > 0) {
        const randomAgent = agentData[randomAgentType][Math.floor(Math.random() * agentData[randomAgentType].length)];
        
        const newActivity = {
          id: Date.now(),
          agent: randomAgent.name,
          type: randomAgentType,
          action: randomAction,
          timestamp: new Date().toISOString()
        };
        
        setActivities(prev => [newActivity, ...prev.slice(0, 19)]); // Keep only last 20 activities
      }
    }, 3000); // New activity every 3 seconds

    return () => clearInterval(interval);
  }, [agentData]);

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getTypeClass = (type) => {
    return `agent-type ${type}`;
  };

  return (
    <div className="real-time-monitor">
      <div className="monitor-controls">
        <label htmlFor="filter">Filter by agent type:</label>
        <select 
          id="filter" 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Agents</option>
          <option value="executive">Executive</option>
          <option value="director">Director</option>
          <option value="manager">Manager</option>
          <option value="contributor">Contributor</option>
        </select>
      </div>
      
      <div className="activity-stream">
        <h3>Recent Activities</h3>
        {filteredActivities.length === 0 ? (
          <p className="no-activities">No activities to display</p>
        ) : (
          <ul className="activities-list">
            {filteredActivities.map(activity => (
              <li key={activity.id} className="activity-item">
                <div className="activity-header">
                  <span className={getTypeClass(activity.type)}>{activity.agent}</span>
                  <span className="activity-time">{formatTime(activity.timestamp)}</span>
                </div>
                <div className="activity-content">
                  {activity.action}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RealTimeMonitor;