const ceoData = require('../../../ceo.json');

/**
 * ExternalApplicationConnector - Service for connecting to external applications
 * listed in the ceo.json file
 */
class ExternalApplicationConnector {
  constructor(logger) {
    this.logger = logger;
    this.applications = new Map();
    this.connections = new Map();
    this.initializeApplications();
  }

  /**
   * Initialize applications from the ceo.json data
   */
  initializeApplications() {
    // Extract applications from executive layer tools
    const execLayers = ceoData.organizational_architecture.executive_layer;
    if (execLayers && execLayers.agents) {
      execLayers.agents.forEach(agent => {
        if (agent.tools) {
          agent.tools.forEach(tool => {
            this.registerApplication(tool, agent.name, 'executive');
          });
        }
        // Register sub-agent tools as well
        if (agent.sub_agents) {
          agent.sub_agents.forEach(subAgent => {
            if (subAgent.tools) {
              subAgent.tools.forEach(tool => {
                this.registerApplication(tool, subAgent.name, 'executive');
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
            this.registerApplication(tool, agent.name, 'director');
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
            this.registerApplication(tool, agent.name, 'manager');
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
          this.registerApplication(tool, `Technology Stack - ${category}`, 'technology');
        });
      });
    }

    // Extract applications from cross-functional pods
    const pods = ceoData.cross_functional_pods;
    if (pods && pods.pods) {
      pods.pods.forEach(pod => {
        if (pod.tools) {
          pod.tools.forEach(tool => {
            this.registerApplication(tool, pod.name, 'pod');
          });
        }
      });
    }

    if (this.logger) {
      this.logger.info('External applications initialized', { 
        count: this.applications.size,
        applications: Array.from(this.applications.keys())
      });
    }
  }

  /**
   * Register an application in the system
   * @param {string} appName - Name of the application
   * @param {string} owner - Owner/department of the application
   * @param {string} category - Category of the application
   */
  registerApplication(appName, owner, category) {
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
    
    this.applications.set(appKey, {
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

  /**
   * Generate a unique key for an application
   * @param {string} appName - Name of the application
   * @returns {string} - Unique key for the application
   */
  generateAppKey(appName) {
    return appName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  /**
   * Get all registered applications
   * @returns {Array} - List of all applications
   */
  getAllApplications() {
    return Array.from(this.applications.values());
  }

  /**
   * Get application by ID
   * @param {string} appId - ID of the application
   * @returns {Object|null} - Application object or null if not found
   */
  getApplicationById(appId) {
    return this.applications.get(appId) || null;
  }

  /**
   * Search applications by name or description
   * @param {string} searchTerm - Term to search for
   * @returns {Array} - List of matching applications
   */
  searchApplications(searchTerm) {
    const term = searchTerm.toLowerCase();
    return Array.from(this.applications.values()).filter(app => 
      app.name.toLowerCase().includes(term) || 
      app.description.toLowerCase().includes(term) ||
      app.owner.toLowerCase().includes(term) ||
      app.category.toLowerCase().includes(term)
    );
  }

  /**
   * Get applications by category
   * @param {string} category - Category to filter by
   * @returns {Array} - List of applications in the category
   */
  getApplicationsByCategory(category) {
    return Array.from(this.applications.values()).filter(app => 
      app.category === category
    );
  }

  /**
   * Get applications by owner
   * @param {string} owner - Owner to filter by
   * @returns {Array} - List of applications owned by the specified owner
   */
  getApplicationsByOwner(owner) {
    return Array.from(this.applications.values()).filter(app => 
      app.owner.includes(owner)
    );
  }

  /**
   * Simulate connecting to an external application
   * In a real implementation, this would contain actual connection logic
   * @param {string} appId - ID of the application to connect to
   * @param {Object} credentials - Connection credentials
   * @returns {Object} - Connection result
   */
  async connectToApplication(appId, credentials = {}) {
    const app = this.getApplicationById(appId);
    if (!app) {
      const error = `Application with ID ${appId} not found`;
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
      const connection = {
        id: `conn_${Date.now()}`,
        appId: appId,
        connectedAt: new Date(),
        status: 'connected',
        // In a real implementation, this would contain actual connection details
        details: {
          protocol: this.determineProtocol(app.name),
          endpoint: this.determineEndpoint(app.name),
          authenticated: Object.keys(credentials).length > 0
        }
      };
      
      // Store connection
      this.connections.set(appId, connection);
      
      // Update application status
      app.connectionStatus = 'connected';
      
      if (this.logger) {
        this.logger.info('Successfully connected to external application', { 
          appId, 
          appName: app.name,
          connectionId: connection.id
        });
      }
      
      return connection;
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

  /**
   * Determine the protocol for an application based on its name
   * @param {string} appName - Name of the application
   * @returns {string} - Protocol to use
   */
  determineProtocol(appName) {
    const name = appName.toLowerCase();
    
    if (name.includes('api') || name.includes('rest')) {
      return 'REST';
    } else if (name.includes('soap')) {
      return 'SOAP';
    } else if (name.includes('graphql')) {
      return 'GraphQL';
    } else if (name.includes('database') || name.includes('db')) {
      return 'Database';
    } else if (name.includes('message') || name.includes('queue')) {
      return 'MessageQueue';
    } else {
      return 'HTTP';
    }
  }

  /**
   * Determine the endpoint for an application based on its name
   * @param {string} appName - Name of the application
   * @returns {string} - Endpoint URL
   */
  determineEndpoint(appName) {
    const name = appName.toLowerCase();
    
    // This would be replaced with actual endpoint discovery logic
    if (name.includes('salesforce')) {
      return 'https://your-instance.salesforce.com/services/data/vXX.X';
    } else if (name.includes('jira')) {
      return 'https://your-domain.atlassian.net/rest/api/3';
    } else if (name.includes('github')) {
      return 'https://api.github.com';
    } else if (name.includes('slack')) {
      return 'https://slack.com/api';
    } else if (name.includes('google')) {
      return 'https://www.googleapis.com';
    } else {
      return `https://${name.replace(/\s+/g, '-')}.com/api`;
    }
  }

  /**
   * Disconnect from an external application
   * @param {string} appId - ID of the application to disconnect from
   * @returns {boolean} - Whether disconnection was successful
   */
  disconnectFromApplication(appId) {
    const app = this.getApplicationById(appId);
    if (!app) {
      if (this.logger) {
        this.logger.warn(`Attempted to disconnect from non-existent application ${appId}`);
      }
      return false;
    }

    // Remove connection
    const connection = this.connections.get(appId);
    if (connection) {
      this.connections.delete(appId);
      
      // Update application status
      app.connectionStatus = 'disconnected';
      app.lastConnectionAttempt = new Date();
      
      if (this.logger) {
        this.logger.info('Disconnected from external application', { 
          appId, 
          appName: app.name,
          connectionId: connection.id
        });
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Get connection status for an application
   * @param {string} appId - ID of the application
   * @returns {Object|null} - Connection object or null if not connected
   */
  getConnectionStatus(appId) {
    return this.connections.get(appId) || null;
  }

  /**
   * Get all active connections
   * @returns {Array} - List of active connections
   */
  getActiveConnections() {
    return Array.from(this.connections.values()).filter(conn => 
      conn.status === 'connected'
    );
  }

  /**
   * Simulate data exchange with an external application
   * @param {string} appId - ID of the application
   * @param {string} operation - Operation to perform
   * @param {Object} data - Data to exchange
   * @returns {Object} - Result of the operation
   */
  async exchangeDataWithApplication(appId, operation, data = {}) {
    const app = this.getApplicationById(appId);
    if (!app) {
      const error = `Application with ID ${appId} not found`;
      if (this.logger) {
        this.logger.error(error);
      }
      throw new Error(error);
    }

    const connection = this.connections.get(appId);
    if (!connection || connection.status !== 'connected') {
      const error = `Not connected to application ${appId}`;
      if (this.logger) {
        this.logger.error(error);
      }
      throw new Error(error);
    }

    // In a real implementation, this would:
    // 1. Format data according to the application's API
    // 2. Send request to the external service
    // 3. Process response
    // 4. Return results
    
    // For simulation, we'll just log the operation
    if (this.logger) {
      this.logger.info('Exchanging data with external application', { 
        appId, 
        appName: app.name,
        operation,
        dataSize: Object.keys(data).length
      });
    }
    
    // Simulate response
    return {
      success: true,
      appId: appId,
      operation: operation,
      timestamp: new Date(),
      data: {
        message: `Successfully performed ${operation} on ${app.name}`,
        requestData: data,
        responseData: this.generateMockResponse(operation, app)
      }
    };
  }

  /**
   * Generate mock response for simulation
   * @param {string} operation - Operation performed
   * @param {Object} app - Application object
   * @returns {Object} - Mock response data
   */
  generateMockResponse(operation, app) {
    switch (operation.toLowerCase()) {
      case 'get':
        return {
          id: Math.floor(Math.random() * 10000),
          name: app.name,
          description: app.description,
          timestamp: new Date().toISOString()
        };
      case 'create':
        return {
          id: Math.floor(Math.random() * 10000),
          status: 'created',
          timestamp: new Date().toISOString()
        };
      case 'update':
        return {
          id: Math.floor(Math.random() * 10000),
          status: 'updated',
          timestamp: new Date().toISOString()
        };
      case 'delete':
        return {
          id: Math.floor(Math.random() * 10000),
          status: 'deleted',
          timestamp: new Date().toISOString()
        };
      default:
        return {
          status: 'success',
          timestamp: new Date().toISOString()
        };
    }
  }
}

module.exports = ExternalApplicationConnector;