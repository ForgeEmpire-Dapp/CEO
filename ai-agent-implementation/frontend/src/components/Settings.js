import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 30,
    language: 'en',
    timezone: 'UTC'
  });
  
  const [llmSettings, setLlmSettings] = useState({
    apiKey: '',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 500
  });
  
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('dashboardSettings');
    const savedLlmSettings = localStorage.getItem('llmSettings');
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    if (savedLlmSettings) {
      setLlmSettings(JSON.parse(savedLlmSettings));
    }
  }, []);

  const handleSettingChange = (section, field, value) => {
    if (section === 'general') {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }));
    } else if (section === 'llm') {
      setLlmSettings(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = () => {
    setSaving(true);
    setSaveStatus('');
    
    // Save to localStorage
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    localStorage.setItem('llmSettings', JSON.stringify(llmSettings));
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSaveStatus('Settings saved successfully!');
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    }, 1000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        theme: 'light',
        notifications: true,
        autoRefresh: true,
        refreshInterval: 30,
        language: 'en',
        timezone: 'UTC'
      });
      
      setLlmSettings({
        apiKey: '',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 500
      });
      
      setSaveStatus('Settings reset to default');
      
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    }
  };

  return (
    <div className="settings">
      <h2>System Settings</h2>
      
      {saveStatus && (
        <div className={`save-status ${saveStatus.includes('success') ? 'success' : ''}`}>
          {saveStatus}
        </div>
      )}
      
      <div className="settings-section">
        <h3>General Settings</h3>
        <div className="settings-group">
          <div className="setting-row">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              value={settings.theme}
              onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          
          <div className="setting-row">
            <label htmlFor="notifications">Notifications</label>
            <div className="toggle-switch">
              <input
                type="checkbox"
                id="notifications"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('general', 'notifications', e.target.checked)}
              />
              <label htmlFor="notifications" className="switch-label"></label>
            </div>
          </div>
          
          <div className="setting-row">
            <label htmlFor="autoRefresh">Auto Refresh</label>
            <div className="toggle-switch">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={settings.autoRefresh}
                onChange={(e) => handleSettingChange('general', 'autoRefresh', e.target.checked)}
              />
              <label htmlFor="autoRefresh" className="switch-label"></label>
            </div>
          </div>
          
          <div className="setting-row">
            <label htmlFor="refreshInterval">Refresh Interval (seconds)</label>
            <input
              type="number"
              id="refreshInterval"
              min="10"
              max="300"
              value={settings.refreshInterval}
              onChange={(e) => handleSettingChange('general', 'refreshInterval', parseInt(e.target.value))}
            />
          </div>
          
          <div className="setting-row">
            <label htmlFor="language">Language</label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          
          <div className="setting-row">
            <label htmlFor="timezone">Timezone</label>
            <select
              id="timezone"
              value={settings.timezone}
              onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>LLM Settings</h3>
        <div className="settings-group">
          <div className="setting-row">
            <label htmlFor="apiKey">API Key</label>
            <input
              type="password"
              id="apiKey"
              value={llmSettings.apiKey}
              onChange={(e) => handleSettingChange('llm', 'apiKey', e.target.value)}
              placeholder="Enter your OpenAI API key"
            />
          </div>
          
          <div className="setting-row">
            <label htmlFor="model">Model</label>
            <select
              id="model"
              value={llmSettings.model}
              onChange={(e) => handleSettingChange('llm', 'model', e.target.value)}
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
            </select>
          </div>
          
          <div className="setting-row">
            <label htmlFor="temperature">Temperature</label>
            <input
              type="range"
              id="temperature"
              min="0"
              max="1"
              step="0.1"
              value={llmSettings.temperature}
              onChange={(e) => handleSettingChange('llm', 'temperature', parseFloat(e.target.value))}
            />
            <span className="range-value">{llmSettings.temperature}</span>
          </div>
          
          <div className="setting-row">
            <label htmlFor="maxTokens">Max Tokens</label>
            <input
              type="number"
              id="maxTokens"
              min="100"
              max="2000"
              value={llmSettings.maxTokens}
              onChange={(e) => handleSettingChange('llm', 'maxTokens', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
      
      <div className="settings-actions">
        <button 
          className="save-btn" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        <button className="reset-btn" onClick={handleReset}>
          Reset to Default
        </button>
      </div>
    </div>
  );
};

export default Settings;