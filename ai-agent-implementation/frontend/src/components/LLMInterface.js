import React, { useState } from 'react';
import './LLMInterface.css';

const LLMInterface = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [taskRequest, setTaskRequest] = useState('');
  const [parsedTask, setParsedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/llm/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data.response);
      } else {
        setError(data.error || 'Failed to process query');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskParseSubmit = async (e) => {
    e.preventDefault();
    if (!taskRequest.trim()) return;

    setLoading(true);
    setError('');
    setParsedTask(null);

    try {
      const res = await fetch('/api/llm/parse-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskRequest }),
      });

      const data = await res.json();

      if (res.ok) {
        setParsedTask(data);
      } else {
        setError(data.error || 'Failed to parse task');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="llm-interface">
      <h2>AI Assistant</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="llm-section">
        <h3>Ask Questions</h3>
        <form onSubmit={handleQuerySubmit}>
          <div className="form-group">
            <label htmlFor="query">What would you like to know?</label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What is the status of our AI agents?"
              rows="3"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Ask'}
          </button>
        </form>
        
        {response && (
          <div className="response">
            <h4>Response:</h4>
            <div className="response-content">{response}</div>
          </div>
        )}
      </div>
      
      <div className="llm-section">
        <h3>Task Parser</h3>
        <form onSubmit={handleTaskParseSubmit}>
          <div className="form-group">
            <label htmlFor="taskRequest">Describe a task you want to assign:</label>
            <textarea
              id="taskRequest"
              value={taskRequest}
              onChange={(e) => setTaskRequest(e.target.value)}
              placeholder="e.g., Please analyze customer feedback and generate a report by Friday"
              rows="3"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Parsing...' : 'Parse Task'}
          </button>
        </form>
        
        {parsedTask && (
          <div className="parsed-task">
            <h4>Parsed Task:</h4>
            <div className="task-details">
              <p><strong>Title:</strong> {parsedTask.title}</p>
              <p><strong>Description:</strong> {parsedTask.description}</p>
              {parsedTask.assignedTo && <p><strong>Assigned To:</strong> {parsedTask.assignedTo}</p>}
              <p><strong>Priority:</strong> {parsedTask.priority}</p>
              {parsedTask.deadline && <p><strong>Deadline:</strong> {parsedTask.deadline}</p>}
              {parsedTask.requiredResources && (
                <p><strong>Required Resources:</strong> {parsedTask.requiredResources.join(', ')}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LLMInterface;