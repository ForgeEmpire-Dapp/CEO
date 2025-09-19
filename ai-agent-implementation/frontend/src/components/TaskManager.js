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
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch tasks from backend
      const tasksResponse = await fetch('/api/tasks');
      if (!tasksResponse.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const tasksData = await tasksResponse.json();
      
      // Fetch agents from backend
      const agentsResponse = await fetch('/api/agents/executive');
      if (!agentsResponse.ok) {
        throw new Error('Failed to fetch agents');
      }
      const agentsData = await agentsResponse.json();
      
      setTasks(tasksData);
      
      // Extract agent names from all layers
      const allAgents = [
        ...agentsData.map(agent => agent.name),
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
      ];
      
      setAgents(allAgents);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) return;
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTask,
          status: 'pending',
          createdAt: new Date().toISOString().split('T')[0]
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create task');
      }
      
      const createdTask = await response.json();
      setTasks(prev => [createdTask, ...prev]);
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'normal',
        deadline: ''
      });
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      const updatedTask = await response.json();
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
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
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchData}>Retry</button>
        </div>
      )}
      
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