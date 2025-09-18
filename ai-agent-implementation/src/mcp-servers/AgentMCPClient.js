const { McpClient } = require('@modelcontextprotocol/sdk/client/mcp.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
// Remove the HTTP client transport import as it's not available in this version
const winston = require('winston');

/**
 * Agent MCP Client that allows agents to interact with MCP servers
 */
class AgentMCPClient {
  /**
   * Create a new Agent MCP Client
   * @param {object} agent - The agent using this client
   * @param {object} logger - Logger instance
   */
  constructor(agent, logger = null) {
    this.agent = agent;
    this.logger = logger || this.createDefaultLogger();
    this.mcpClient = null;
    this.transport = null;
    this.isConnected = false;
    
    this.logger.info('Agent MCP Client initialized', { 
      agentName: agent.name 
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
      defaultMeta: { service: 'mcp-client' },
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
   * Connect to an MCP server via stdio
   * @param {string} command - Command to start the MCP server
   * @param {array} args - Arguments for the command
   */
  async connectStdio(command, args = []) {
    try {
      this.transport = new StdioClientTransport({
        command,
        args
      });
      
      this.mcpClient = new McpClient();
      await this.mcpClient.connect(this.transport);
      this.isConnected = true;
      
      this.logger.info('Connected to MCP server via stdio', { 
        command, 
        args 
      });
    } catch (error) {
      this.logger.error('Failed to connect to MCP server via stdio', { 
        error: error.message,
        command,
        args
      });
      throw error;
    }
  }

  /**
   * Connect to an MCP server via HTTP
   * @param {string} url - URL of the MCP server
   */
  async connectHttp(url) {
    try {
      // For now, we'll implement a simple HTTP connection manually
      // In a full implementation, we would use the proper HTTP transport
      this.logger.info('HTTP transport not available in this SDK version, using stdio instead');
      // This is a placeholder - in a real implementation we would connect via HTTP
      throw new Error('HTTP transport not implemented in this version');
    } catch (error) {
      this.logger.error('Failed to connect to MCP server via HTTP', { 
        error: error.message,
        url
      });
      throw error;
    }
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect() {
    if (this.isConnected && this.mcpClient) {
      try {
        await this.mcpClient.close();
        this.isConnected = false;
        this.logger.info('Disconnected from MCP server');
      } catch (error) {
        this.logger.error('Error disconnecting from MCP server', { 
          error: error.message 
        });
      }
    }
  }

  /**
   * List available tools
   * @returns {array} List of available tools
   */
  async listTools() {
    if (!this.isConnected) {
      throw new Error('Not connected to MCP server');
    }
    
    try {
      const tools = await this.mcpClient.listTools();
      this.logger.info('Retrieved tool list', { 
        toolCount: tools.length 
      });
      return tools;
    } catch (error) {
      this.logger.error('Failed to list tools', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Call a tool on the MCP server
   * @param {string} toolName - Name of the tool to call
   * @param {object} arguments - Arguments for the tool
   * @returns {object} Tool result
   */
  async callTool(toolName, args = {}) {
    if (!this.isConnected) {
      throw new Error('Not connected to MCP server');
    }
    
    try {
      const result = await this.mcpClient.callTool(toolName, args);
      this.logger.info('Tool called successfully', { 
        toolName, 
        args 
      });
      return result;
    } catch (error) {
      this.logger.error('Failed to call tool', { 
        error: error.message,
        toolName,
        args
      });
      throw error;
    }
  }

  /**
   * List available resources
   * @returns {array} List of available resources
   */
  async listResources() {
    if (!this.isConnected) {
      throw new Error('Not connected to MCP server');
    }
    
    try {
      const resources = await this.mcpClient.listResources();
      this.logger.info('Retrieved resource list', { 
        resourceCount: resources.length 
      });
      return resources;
    } catch (error) {
      this.logger.error('Failed to list resources', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Read a resource from the MCP server
   * @param {string} uri - URI of the resource to read
   * @returns {object} Resource content
   */
  async readResource(uri) {
    if (!this.isConnected) {
      throw new Error('Not connected to MCP server');
    }
    
    try {
      const content = await this.mcpClient.readResource(uri);
      this.logger.info('Resource read successfully', { uri });
      return content;
    } catch (error) {
      this.logger.error('Failed to read resource', { 
        error: error.message,
        uri
      });
      throw error;
    }
  }

  /**
   * List available prompts
   * @returns {array} List of available prompts
   */
  async listPrompts() {
    if (!this.isConnected) {
      throw new Error('Not connected to MCP server');
    }
    
    try {
      const prompts = await this.mcpClient.listPrompts();
      this.logger.info('Retrieved prompt list', { 
        promptCount: prompts.length 
      });
      return prompts;
    } catch (error) {
      this.logger.error('Failed to list prompts', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get a prompt from the MCP server
   * @param {string} promptName - Name of the prompt to get
   * @param {object} arguments - Arguments for the prompt
   * @returns {object} Prompt content
   */
  async getPrompt(promptName, args = {}) {
    if (!this.isConnected) {
      throw new Error('Not connected to MCP server');
    }
    
    try {
      const prompt = await this.mcpClient.getPrompt(promptName, args);
      this.logger.info('Prompt retrieved successfully', { 
        promptName, 
        args 
      });
      return prompt;
    } catch (error) {
      this.logger.error('Failed to get prompt', { 
        error: error.message,
        promptName,
        args
      });
      throw error;
    }
  }
}

module.exports = AgentMCPClient;