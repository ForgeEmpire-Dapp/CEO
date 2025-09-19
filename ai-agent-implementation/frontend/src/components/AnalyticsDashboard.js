import React, { useState, useEffect } from 'react';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalAgents: 0,
    activeAgents: 0,
    tasksCompleted: 0,
    avgResponseTime: 0,
    systemUptime: 0
  });
  
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching analytics data
    const fetchData = async () => {
      // In a real implementation, this would fetch from your backend API
      setTimeout(() => {
        setMetrics({
          totalAgents: 24,
          activeAgents: 21,
          tasksCompleted: 1247,
          avgResponseTime: 1.2,
          systemUptime: 99.8
        });
        
        setAgentPerformance([
          { agent: 'CEO', performance: 95, tasks: 42 },
          { agent: 'CTO', performance: 92, tasks: 38 },
          { agent: 'VP of Engineering', performance: 88, tasks: 127 },
          { agent: 'Engineering Manager', performance: 91, tasks: 89 },
          { agent: 'Software Engineer', performance: 94, tasks: 203 }
        ]);
        
        setLoading(false);
      }, 1000);
    };
    
    fetchData();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        tasksCompleted: prev.tasksCompleted + Math.floor(Math.random() * 3),
        avgResponseTime: parseFloat((prev.avgResponseTime + (Math.random() * 0.1 - 0.05)).toFixed(2))
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const renderMetricCard = (title, value, unit = '', description = '') => (
    <div className="metric-card">
      <h3>{title}</h3>
      <div className="metric-value">
        {value} {unit}
      </div>
      {description && <p className="metric-description">{description}</p>}
    </div>
  );

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <h2>System Analytics</h2>
      
      <div className="metrics-grid">
        {renderMetricCard('Total Agents', metrics.totalAgents, '', 'Number of AI agents in the system')}
        {renderMetricCard('Active Agents', metrics.activeAgents, '', 'Agents currently processing tasks')}
        {renderMetricCard('Tasks Completed', metrics.tasksCompleted, '', 'Total tasks processed by all agents')}
        {renderMetricCard('Avg Response Time', metrics.avgResponseTime, 's', 'Average agent response time')}
        {renderMetricCard('System Uptime', metrics.systemUptime, '%', 'Overall system availability')}
      </div>
      
      <div className="performance-section">
        <h3>Agent Performance</h3>
        <div className="performance-chart">
          {agentPerformance.map((agent, index) => (
            <div key={index} className="performance-bar">
              <div className="agent-info">
                <span className="agent-name">{agent.agent}</span>
                <span className="performance-value">{agent.performance}%</span>
              </div>
              <div className="bar-container">
                <div 
                  className="performance-bar-fill"
                  style={{ width: `${agent.performance}%` }}
                ></div>
              </div>
              <div className="tasks-count">{agent.tasks} tasks</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="insights-section">
        <h3>AI Insights</h3>
        <div className="insights-content">
          <div className="insight-card">
            <h4>Performance Trend</h4>
            <p>Overall system performance is stable with a slight improvement trend over the last 24 hours.</p>
          </div>
          <div className="insight-card">
            <h4>Resource Utilization</h4>
            <p>CPU and memory usage are within optimal ranges. No bottlenecks detected.</p>
          </div>
          <div className="insight-card">
            <h4>Recommendations</h4>
            <p>Consider scaling the contributor layer to handle increased task volume.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;