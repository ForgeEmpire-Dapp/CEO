import React, { useState, useEffect } from 'react';
import './TaskManager.css';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'normal',
    deadline: ''
  });
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    // Simulate fetching tasks and agents
    const fetchData = async () => {
      // In a real implementation, this would fetch from your backend API
      setTimeout(() => {
        setTasks([
          {
            id: 1,
            title: 'Analyze customer feedback',
            description: 'Review and analyze recent customer feedback to identify trends',
            assignedTo: 'Data Scientist',
            priority: 'high',
            status: 'in-progress',
            deadline: '2025-09-25',
            createdAt: '2025-09-18'
          },
          {
            id: 2,
            title: 'Update documentation',
            description: 'Update API documentation with new endpoints',
            assignedTo: 'Technical Writer',
            priority: 'normal',
            status: 'pending',
            deadline: '2025-09-30',
            createdAt: '2025-09-18'
          },
          {
            id: 3,
            title: 'Security audit',
            description: 'Perform quarterly security audit of all systems',
            assignedTo: 'Security Officer',
            priority: 'critical',
            status: 'completed',
            deadline: '2025-09-15',
            createdAt: '2025-09-10'
          }
        ]);
        
        setAgents([
          'CEO',
          'CTO',
          'CFO',
          'VP of Engineering',
          'VP of Marketing',
          'Engineering Manager',
          'Marketing Manager',
          'Software Engineer',
          'Data Scientist',
          'Security Officer',
          'Technical Writer'
        ]);
        
        setLoading(false);
      }, 1000);
    };
    
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) return;
    
    const task = {
      id: tasks.length + 1,
      ...newTask,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setTasks(prev => [task, ...prev]);
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'normal',
      deadline: ''
    });
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const getStatusClass = (status) => {
    return `status-badge ${status}`;
  };

  const getPriorityClass = (priority) => {
    return `priority-badge ${priority}`;
  };

  if (loading) {
    return <div className="task-manager-loading">Loading tasks...</div>;
  }

  return (
    <div className="task-manager">
      <h2>Task Management</h2>
      
      <div className="task-form-section">
        <h3>Create New Task</h3>
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Task Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="assignedTo">Assign To</label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={newTask.assignedTo}
                onChange={handleInputChange}
                required
              >
                <option value="">Select an agent</option>
                {agents.map((agent, index) => (
                  <option key={index} value={agent}>{agent}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={newTask.priority}
                onChange={handleInputChange}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="deadline">Deadline</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={newTask.deadline}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <button type="submit" className="submit-btn">Create Task</button>
        </form>
      </div>
      
      <div className="tasks-list-section">
        <h3>Active Tasks</h3>
        {tasks.length === 0 ? (
          <p className="no-tasks">No tasks found</p>
        ) : (
          <div className="tasks-list">
            {tasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <h4>{task.title}</h4>
                  <div className="task-badges">
                    <span className={getStatusClass(task.status)}>{task.status}</span>
                    <span className={getPriorityClass(task.priority)}>{task.priority}</span>
                  </div>
                </div>
                
                <p className="task-description">{task.description}</p>
                
                <div className="task-details">
                  <div className="task-detail">
                    <span className="detail-label">Assigned To:</span>
                    <span className="detail-value">{task.assignedTo}</span>
                  </div>
                  <div className="task-detail">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">{task.createdAt}</span>
                  </div>
                  {task.deadline && (
                    <div className="task-detail">
                      <span className="detail-label">Deadline:</span>
                      <span className="detail-value">{task.deadline}</span>
                    </div>
                  )}
                </div>
                
                <div className="task-actions">
                  {task.status !== 'completed' && (
                    <>
                      <button 
                        className="action-btn complete-btn"
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                      >
                        Mark Complete
                      </button>
                      <button 
                        className="action-btn progress-btn"
                        onClick={() => updateTaskStatus(task.id, 'in-progress')}
                      >
                        In Progress
                      </button>
                    </>
                  )}
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;