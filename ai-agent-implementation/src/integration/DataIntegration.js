const ceoData = require('../../ceo.json');

class DataIntegration {
  constructor(logger) {
    this.logger = logger;
    this.integrations = [];
    this.externalApplications = new Map(); // For external application connections
    this.initializeIntegrations();
    this.initializeExternalApplications();
  }

  // Initialize data integrations from the ceo.json data
  initializeIntegrations() {
    const integrationData = ceoData.data_flow_integration.integrations;
    
    this.integrations = integrationData.map(integration => ({
      from: integration.from,
      to: integration.to,
      dataType: integration.data_type,
      purpose: integration.purpose,
      active: true,
      lastSync: null
    }));
    
    if (this.logger) {
      this.logger.info('Data integrations initialized', { count: this.integrations.length });
    }
  }

  // Initialize external applications from the ceo.json data
  initializeExternalApplications() {
    // Extract applications from executive layer tools
    const execLayers = ceoData.organizational_architecture.executive_layer;
    if (execLayers && execLayers.agents) {
      execLayers.agents.forEach(agent => {
        if (agent.tools) {
          agent.tools.forEach(tool => {
            this.registerExternalApplication(tool, agent.name, 'executive');
          });
        }
        // Register sub-agent tools as well
        if (agent.sub_agents) {
          agent.sub_agents.forEach(subAgent => {
            if (subAgent.tools) {
              subAgent.tools.forEach(tool => {
                this.registerExternalApplication(tool, subAgent.name, 'executive');
              });
            }
          });
        }
      });
    }

    // Extract applications from director layer tools
    const directorLayers = ceoData.organizational_architecture.director_layer;
    if (directorLayers && directorLayers.agents) {
      directorLayers.agents.forEach(agent => {
        if (agent.tools) {
          agent.tools.forEach(tool => {
            this.registerExternalApplication(tool, agent.name, 'director');
          });
        }
      });
    }

    // Extract applications from manager layer tools
    const managerLayers = ceoData.organizational_architecture.manager_layer;
    if (managerLayers && managerLayers.agents) {
      managerLayers.agents.forEach(agent => {
        if (agent.tools) {
          agent.tools.forEach(tool => {
            this.registerExternalApplication(tool, agent.name, 'manager');
          });
        }
      });
    }

    // Extract applications from core technology stack
    const techStack = ceoData.core_technology_stack;
    if (techStack) {
      Object.entries(techStack).forEach(([category, tools]) => {
        // Convert to array if it's a string
        const toolList = Array.isArray(tools) ? tools : tools.split(',').map(t => t.trim());
        toolList.forEach(tool => {
          this.registerExternalApplication(tool, `Technology Stack - ${category}`, 'technology');
        });
      });
    }

    // Extract applications from cross-functional pods
    const pods = ceoData.cross_functional_pods;
    if (pods && pods.pods) {
      pods.pods.forEach(pod => {
        if (pod.tools) {
          pod.tools.forEach(tool => {
            this.registerExternalApplication(tool, pod.name, 'pod');
          });
        }
      });
    }

    if (this.logger) {
      this.logger.info('External applications initialized', { 
        count: this.externalApplications.size
      });
    }
  }

  // Register an external application
  registerExternalApplication(appName, owner, category) {
    // Parse the application name and description if in format "Name (Description)"
    const match = appName.match(/^(.+?)\s*\((.+?)\)$/);
    let name, description;
    
    if (match) {
      name = match[1].trim();
      description = match[2].trim();
    } else {
      name = appName;
      description = 'No description available';
    }

    // Create a unique key for the application
    const appKey = this.generateAppKey(name);
    
    this.externalApplications.set(appKey, {
      id: appKey,
      name: name,
      fullName: appName,
      description: description,
      owner: owner,
      category: category,
      registeredAt: new Date(),
      connectionStatus: 'disconnected',
      lastConnectionAttempt: null
    });
  }

  // Generate a unique key for an application
  generateAppKey(appName) {
    return appName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  // Get all integrations
  getAllIntegrations() {
    return this.integrations;
  }

  // Get integration by source and destination
  getIntegration(from, to) {
    return this.integrations.find(
      integration => integration.from === from && integration.to === to
    );
  }

  // Add a new data integration
  addIntegration(from, to, dataType, purpose) {
    const integration = {
      from,
      to,
      dataType,
      purpose,
      active: true,
      lastSync: null
    };
    
    this.integrations.push(integration);
    
    if (this.logger) {
      this.logger.info('New data integration added', { from, to, dataType });
    }
    
    return integration;
  }

  // Remove an integration
  removeIntegration(from, to) {
    const initialLength = this.integrations.length;
    this.integrations = this.integrations.filter(
      integration => !(integration.from === from && integration.to === to)
    );
    
    const removed = this.integrations.length < initialLength;
    
    if (this.logger) {
      if (removed) {
        this.logger.info('Data integration removed', { from, to });
      } else {
        this.logger.warn('Attempted to remove non-existent integration', { from, to });
      }
    }
    
    return removed;
  }

  // Update integration status
  updateIntegrationStatus(from, to, active) {
    const integration = this.getIntegration(from, to);
    if (integration) {
      integration.active = active;
      integration.lastSync = new Date();
      
      if (this.logger) {
        this.logger.info('Integration status updated', { from, to, active });
      }
      
      return true;
    }
    return false;
  }

  // Simulate data sync
  syncData(from, to) {
    const integration = this.getIntegration(from, to);
    if (integration && integration.active) {
      integration.lastSync = new Date();
      
      if (this.logger) {
        this.logger.info('Data synced', { from, to, timestamp: integration.lastSync });
      }
      
      return {
        success: true,
        from,
        to,
        timestamp: integration.lastSync
      };
    }
    
    return {
      success: false,
      from,
      to,
      error: 'Integration not found or inactive'
    };
  }

  // Get integrations by source
  getIntegrationsFrom(source) {
    return this.integrations.filter(integration => integration.from === source);
  }

  // Get integrations by destination
  getIntegrationsTo(destination) {
    return this.integrations.filter(integration => integration.to === destination);
  }

  // Get all external applications
  getAllExternalApplications() {
    return Array.from(this.externalApplications.values());
  }

  // Get external application by ID
  getExternalApplicationById(appId) {
    return this.externalApplications.get(appId) || null;
  }

  // Search external applications by name or description
  searchExternalApplications(searchTerm) {
    const term = searchTerm.toLowerCase();
    return Array.from(this.externalApplications.values()).filter(app => 
      app.name.toLowerCase().includes(term) || 
      app.description.toLowerCase().includes(term) ||
      app.owner.toLowerCase().includes(term) ||
      app.category.toLowerCase().includes(term)
    );
  }

  // Get external applications by category
  getExternalApplicationsByCategory(category) {
    return Array.from(this.externalApplications.values()).filter(app => 
      app.category === category
    );
  }

  // Get external applications by owner
  getExternalApplicationsByOwner(owner) {
    return Array.from(this.externalApplications.values()).filter(app => 
      app.owner.includes(owner)
    );
  }

  // Simulate connecting to an external application
  async connectToExternalApplication(appId, credentials = {}) {
    const app = this.getExternalApplicationById(appId);
    if (!app) {
      const error = `External application with ID ${appId} not found`;
      if (this.logger) {
        this.logger.error(error);
      }
      throw new Error(error);
    }

    try {
      // Update connection attempt timestamp
      app.lastConnectionAttempt = new Date();
      
      // In a real implementation, we would:
      // 1. Validate credentials
      // 2. Establish connection to the external service
      // 3. Test connectivity
      // 4. Store connection details
      
      // For now, we'll simulate a successful connection
      app.connectionStatus = 'connected';
      
      if (this.logger) {
        this.logger.info('Successfully connected to external application', { 
          appId, 
          appName: app.name
        });
      }
      
      return {
        success: true,
        appId: appId,
        appName: app.name,
        connectedAt: new Date(),
        message: `Successfully connected to ${app.name}`
      };
    } catch (error) {
      app.connectionStatus = 'error';
      if (this.logger) {
        this.logger.error('Failed to connect to external application', { 
          appId, 
          appName: app.name,
          error: error.message
        });
      }
      throw error;
    }
  }

  // Simulate disconnecting from an external application
  disconnectFromExternalApplication(appId) {
    const app = this.getExternalApplicationById(appId);
    if (!app) {
      if (this.logger) {
        this.logger.warn(`Attempted to disconnect from non-existent external application ${appId}`);
      }
      return false;
    }

    app.connectionStatus = 'disconnected';
    app.lastConnectionAttempt = new Date();
    
    if (this.logger) {
      this.logger.info('Disconnected from external application', { 
        appId, 
        appName: app.name
      });
    }
    
    return true;
  }

  // Get connection status for an external application
  getExternalApplicationConnectionStatus(appId) {
    const app = this.getExternalApplicationById(appId);
    if (!app) {
      return null;
    }
    return {
      appId: app.id,
      appName: app.name,
      status: app.connectionStatus,
      lastAttempt: app.lastConnectionAttempt
    };
  }
}

module.exports = DataIntegration;