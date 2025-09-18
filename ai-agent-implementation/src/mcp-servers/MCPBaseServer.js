const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
// Remove the HTTP transport import as it's not available in this version
const crypto = require('crypto');
const winston = require('winston');

/**
 * Base MCP Server class that implements the Model Context Protocol
 * This server provides a foundation for agent interactions with tools and resources
 */
class MCPBaseServer {
  /**
   * Create a new MCP server
   * @param {string} name - Server name
   * @param {string} version - Server version
   * @param {object} logger - Logger instance
   */
  constructor(name, version, logger = null) {
    this.name = name;
    this.version = version;
    this.logger = logger || this.createDefaultLogger();
    this.mcpServer = new McpServer({
      name: this.name,
      version: this.version
    });
    
    // Security configuration
    this.encryptionEnabled = false;
    this.encryptionKey = null;
    this.authTokens = new Map();
    
    // Registered tools and resources
    this.registeredTools = new Map();
    this.registeredResources = new Map();
    
    this.logger.info(`MCP Server ${this.name} initialized`, { 
      version: this.version 
    });
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
      defaultMeta: { service: 'mcp-server' },
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
   * Enable encryption for secure communications
   * @param {string} key - Encryption key
   */
  enableEncryption(key) {
    this.encryptionEnabled = true;
    this.encryptionKey = key;
    this.logger.info('Encryption enabled for MCP server');
  }

  /**
   * Generate an authentication token for a client
   * @param {string} clientId - Client identifier
   * @returns {string} Authentication token
   */
  generateAuthToken(clientId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    this.authTokens.set(token, {
      clientId,
      expiresAt
    });
    
    this.logger.info('Authentication token generated', { clientId });
    return token;
  }

  /**
   * Validate an authentication token
   * @param {string} token - Token to validate
   * @returns {boolean} Whether token is valid
   */
  validateAuthToken(token) {
    const authData = this.authTokens.get(token);
    
    if (!authData) {
      return false;
    }
    
    if (Date.now() > authData.expiresAt) {
      this.authTokens.delete(token);
      return false;
    }
    
    return true;
  }

  /**
   * Register a tool with the MCP server
   * @param {string} name - Tool name
   * @param {object} config - Tool configuration
   * @param {Function} handler - Tool handler function
   */
  registerTool(name, config, handler) {
    try {
      this.mcpServer.registerTool(name, config, handler);
      this.registeredTools.set(name, { config, handler });
      this.logger.info('Tool registered', { toolName: name });
    } catch (error) {
      this.logger.error('Failed to register tool', { 
        toolName: name, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Register a resource with the MCP server
   * @param {string} name - Resource name
   * @param {string|object} template - Resource template
   * @param {object} config - Resource configuration
   * @param {Function} handler - Resource handler function
   */
  registerResource(name, template, config, handler) {
    try {
      this.mcpServer.registerResource(name, template, config, handler);
      this.registeredResources.set(name, { template, config, handler });
      this.logger.info('Resource registered', { resourceName: name });
    } catch (error) {
      this.logger.error('Failed to register resource', { 
        resourceName: name, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Register a prompt with the MCP server
   * @param {string} name - Prompt name
   * @param {object} config - Prompt configuration
   * @param {Function} handler - Prompt handler function
   */
  registerPrompt(name, config, handler) {
    try {
      this.mcpServer.registerPrompt(name, config, handler);
      this.logger.info('Prompt registered', { promptName: name });
    } catch (error) {
      this.logger.error('Failed to register prompt', { 
        promptName: name, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Start the MCP server with stdio transport
   */
  async startStdio() {
    try {
      const transport = new StdioServerTransport();
      await this.mcpServer.connect(transport);
      this.logger.info('MCP server started with stdio transport');
    } catch (error) {
      this.logger.error('Failed to start MCP server with stdio', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Start the MCP server with HTTP transport
   * @param {number} port - Port to listen on
   * @param {string} host - Host to bind to
   */
  async startHttp(port = 3001, host = 'localhost') {
    try {
      // For now, we'll implement a simple HTTP server manually
      // In a full implementation, we would use the proper HTTP transport
      this.logger.info('HTTP transport not available in this SDK version, using stdio instead');
      await this.startStdio();
    } catch (error) {
      this.logger.error('Failed to start MCP server with HTTP', { 
        error: error.message,
        port,
        host
      });
      throw error;
    }
  }

  /**
   * Stop the MCP server
   */
  async stop() {
    try {
      // The MCP SDK doesn't expose a direct stop method
      // In a real implementation, we would need to handle transport cleanup
      this.logger.info('MCP server stopped');
    } catch (error) {
      this.logger.error('Error stopping MCP server', { 
        error: error.message 
      });
    }
  }

  /**
   * Get server information
   * @returns {object} Server information
   */
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      encryptionEnabled: this.encryptionEnabled,
      registeredTools: Array.from(this.registeredTools.keys()),
      registeredResources: Array.from(this.registeredResources.keys()),
      authTokenCount: this.authTokens.size
    };
  }

  /**
   * Encrypt a message
   * @param {string} message - Message to encrypt
   * @returns {string} Encrypted message
   */
  encryptMessage(message) {
    if (!this.encryptionEnabled || !this.encryptionKey) {
      return message;
    }
    
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', 
        crypto.createHash('sha256').update(this.encryptionKey).digest(), iv);
      let encrypted = cipher.update(message, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      this.logger.error('Failed to encrypt message', { 
        error: error.message 
      });
      return message; // Return original message if encryption fails
    }
  }

  /**
   * Decrypt a message
   * @param {string} encryptedMessage - Message to decrypt
   * @returns {string} Decrypted message
   */
  decryptMessage(encryptedMessage) {
    if (!this.encryptionEnabled || !this.encryptionKey) {
      return encryptedMessage;
    }
    
    try {
      const parts = encryptedMessage.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted message format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = crypto.createDecipheriv('aes-256-cbc',
        crypto.createHash('sha256').update(this.encryptionKey).digest(), iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      this.logger.error('Failed to decrypt message', { 
        error: error.message 
      });
      return encryptedMessage; // Return original message if decryption fails
    }
  }
}

module.exports = MCPBaseServer;