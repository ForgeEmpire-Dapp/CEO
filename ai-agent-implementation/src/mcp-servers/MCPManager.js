const AgentMCPService = require('./AgentMCPService');
const winston = require('winston');

/**
 * MCP Manager that handles multiple MCP servers and integration with agents
 */
class MCPManager {
  /**
   * Create a new MCP Manager
   * @param {object} logger - Logger instance
   * @param {object} dataIntegration - Data integration service
   * @param {object} podManager - Pod management service
   */
  constructor(logger = null, dataIntegration = null, podManager = null) {
    this.logger = logger || this.createDefaultLogger();
    this.dataIntegration = dataIntegration;
    this.podManager = podManager;
    this.servers = new Map();
    this.clients = new Map();
    this.encryptionKey = null;
    
    this.logger.info('MCP Manager initialized');
  }

  /**
   * Create a default logger if none provided
   * @returns {object} Winston logger instance
   */
  createDefaultLogger() {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: { service: 'mcp-manager' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  /**
   * Set encryption key for secure communications
   * @param {string} key - Encryption key
   */
  setEncryptionKey(key) {
    this.encryptionKey = key;
    this.logger.info('Encryption key set for MCP manager');
  }

  /**
   * Create a new MCP server for a specific agent type
   * @param {string} serverName - Name for the server
   * @param {string} agentType - Type of agent this server serves
   * @param {number} port - Port to listen on
   * @returns {object} MCP server instance
   */
  async createServer(serverName, agentType, port = 3001) {
    try {
      const server = new AgentMCPService(this.logger, this.dataIntegration, this.podManager);
      
      // Enable encryption if key is set
      if (this.encryptionKey) {
        server.enableEncryption(this.encryptionKey);
      }
      
      // Start the server
      await server.start(port);
      
      // Store server reference
      this.servers.set(serverName, {
        server,
        agentType,
        port,
        createdAt: new Date()
      });
      
      this.logger.info('MCP server created', { 
        serverName, 
        agentType, 
        port 
      });
      
      return server;
    } catch (error) {
      this.logger.error('Failed to create MCP server', { 
        error: error.message,
        serverName,
        agentType,
        port
      });
      throw error;
    }
  }

  /**
   * Get a specific MCP server
   * @param {string} serverName - Name of the server
   * @returns {object} MCP server instance
   */
  getServer(serverName) {
    const serverInfo = this.servers.get(serverName);
    return serverInfo ? serverInfo.server : null;
  }

  /**
   * Get all MCP servers
   * @returns {array} List of all MCP servers
   */
  getAllServers() {
    return Array.from(this.servers.entries()).map(([name, info]) => ({
      name,
      agentType: info.agentType,
      port: info.port,
      createdAt: info.createdAt,
      info: info.server.getInfo()
    }));
  }

  /**
   * Stop a specific MCP server
   * @param {string} serverName - Name of the server to stop
   */
  async stopServer(serverName) {
    const serverInfo = this.servers.get(serverName);
    
    if (serverInfo) {
      try {
        await serverInfo.server.stop();
        this.servers.delete(serverName);
        this.logger.info('MCP server stopped', { serverName });
      } catch (error) {
        this.logger.error('Failed to stop MCP server', { 
          error: error.message,
          serverName
        });
        throw error;
      }
    }
  }

  /**
   * Stop all MCP servers
   */
  async stopAllServers() {
    const serverNames = Array.from(this.servers.keys());
    
    for (const serverName of serverNames) {
      await this.stopServer(serverName);
    }
    
    this.logger.info('All MCP servers stopped');
  }

  /**
   * Create an MCP client for an agent
   * @param {object} agent - Agent instance
   * @param {string} serverName - Name of the server to connect to
   * @returns {string} Client identifier
   */
  async createClientForAgent(agent, serverName) {
    try {
      // In a real implementation, this would create a client that connects to the specified server
      // For now, we'll just store the client reference
      const clientId = `${agent.name}-${serverName}`;
      
      this.clients.set(clientId, {
        agent,
        serverName,
        createdAt: new Date()
      });
      
      this.logger.info('MCP client created for agent', { 
        agentName: agent.name, 
        serverName,
        clientId
      });
      
      return clientId;
    } catch (error) {
      this.logger.error('Failed to create MCP client for agent', { 
        error: error.message,
        agentName: agent.name,
        serverName
      });
      throw error;
    }
  }

  /**
   * Get client information
   * @param {string} clientId - Client identifier
   * @returns {object} Client information
   */
  getClientInfo(clientId) {
    const clientInfo = this.clients.get(clientId);
    return clientInfo || null;
  }

  /**
   * Get all clients with detailed information
   * @returns {array} List of all clients
   */
  getAllClients() {
    return Array.from(this.clients.entries()).map(([id, info]) => ({
      id,
      agentName: info.agent.name,
      serverName: info.serverName,
      createdAt: info.createdAt
    }));
  }

  /**
   * Remove a client
   * @param {string} clientId - Client identifier
   */
  removeClient(clientId) {
    const clientInfo = this.clients.get(clientId);
    
    if (clientInfo) {
      this.clients.delete(clientId);
      this.logger.info('MCP client removed', { clientId });
    }
  }

  /**
   * Get manager information
   * @returns {object} Manager information
   */
  getInfo() {
    return {
      serverCount: this.servers.size,
      clientCount: this.clients.size,
      encryptionEnabled: !!this.encryptionKey,
      servers: this.getAllServers(),
      clients: this.getAllClients()
    };
  }
}

module.exports = MCPManager;