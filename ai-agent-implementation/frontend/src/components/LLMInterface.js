import React, { useState, useEffect } from 'react';
import './LLMInterface.css';

const LLMInterface = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [taskRequest, setTaskRequest] = useState('');
  const [parsedTask, setParsedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // LLM provider and model selection
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [models, setModels] = useState([]);
  
  // Temperature and max tokens settings
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(500);

  // Use the API URL from environment variables or default to localhost:3000
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  // Fetch available LLM providers and models
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/llm/providers`);
        const data = await res.json();
        
        if (res.ok) {
          setProviders(data);
          
          // Set default models based on the first provider
          if (data.length > 0) {
            setModels(data[0].models);
            setSelectedProvider(data[0].id);
            
            // Set default model
            if (data[0].models.length > 0) {
              setSelectedModel(data[0].models[0].id);
            }
          }
        } else {
          setError(data.error || 'Failed to fetch LLM providers');
        }
      } catch (err) {
        setError('Network error: ' + err.message);
      }
    };

    fetchProviders();
  }, [API_BASE_URL]);

  // Update models when provider changes
  useEffect(() => {
    const provider = providers.find(p => p.id === selectedProvider);
    if (provider) {
      setModels(provider.models);
      
      // Set default model for the selected provider
      if (provider.models.length > 0) {
        setSelectedModel(provider.models[0].id);
      }
    }
  }, [selectedProvider, providers]);

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/llm/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          options: {
            provider: selectedProvider,
            model: selectedModel,
            temperature: parseFloat(temperature),
            max_tokens: parseInt(maxTokens)
          }
        }),
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
      const res = await fetch(`${API_BASE_URL}/api/llm/parse-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          taskRequest,
          options: {
            provider: selectedProvider,
            model: selectedModel,
            temperature: parseFloat(temperature),
            max_tokens: parseInt(maxTokens)
          }
        }),
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
      
      <div className="llm-controls">
        <div className="control-group">
          <label htmlFor="provider">LLM Provider:</label>
          <select
            id="provider"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            disabled={loading || providers.length === 0}
          >
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="model">Model:</label>
          <select
            id="model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={loading || models.length === 0}
          >
            {models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="temperature">Temperature: {temperature}</label>
          <input
            type="range"
            id="temperature"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="control-group">
          <label htmlFor="maxTokens">Max Tokens: {maxTokens}</label>
          <input
            type="range"
            id="maxTokens"
            min="100"
            max="2000"
            step="100"
            value={maxTokens}
            onChange={(e) => setMaxTokens(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      
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
              disabled={loading}
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
              disabled={loading}
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