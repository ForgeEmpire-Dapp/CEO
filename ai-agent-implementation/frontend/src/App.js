import React from 'react';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Agent Organization Dashboard</h1>
        <p>Monitor and manage your AI-powered organizational structure</p>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;