class Agent {
  constructor(name, description, tools = [], keyMetrics = [], logger = null) {
    this.name = name;
    this.description = description;
    this.tools = tools;
    this.keyMetrics = keyMetrics;
    this.logger = logger;
    this.createdAt = new Date();
    this.lastActive = new Date();
    
    // MCP client for communication with MCP servers
    this.mcpClient = null;
  }

  // Set MCP client for this agent
  setMcpClient(mcpClient) {
    this.mcpClient = mcpClient;
    this.logAction('setMcpClient');
  }

  // Log an action performed by the agent
  logAction(action, details = {}) {
    if (this.logger) {
      this.logger.info(`Agent ${this.name} performed action: ${action}`, {
        agent: this.name,
        action,
        details,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Update the last active timestamp
  updateLastActive() {
    this.lastActive = new Date();
  }

  // Get agent information
  getInfo() {
    return {
      name: this.name,
      description: this.description,
      tools: this.tools,
      keyMetrics: this.keyMetrics,
      createdAt: this.createdAt,
      lastActive: this.lastActive
    };
  }

  // Execute a task (to be implemented by subclasses)
  async executeTask(task) {
    this.updateLastActive();
    this.logAction('executeTask', { task });
    // This should be implemented by specific agent types
    throw new Error('executeTask method must be implemented by subclass');
  }

  // Report on key metrics
  reportMetrics() {
    this.updateLastActive();
    this.logAction('reportMetrics');
    return this.keyMetrics;
  }
  
  // Send a message to another agent via MCP
  async sendMessage(to, message, priority = 'normal') {
    if (this.mcpClient) {
      try {
        const result = await this.mcpClient.callTool('send_message', {
          to,
          message,
          priority
        });
        this.logAction('sendMessage', { to, message, priority });
        return result;
      } catch (error) {
        this.logAction('sendMessageError', { error: error.message });
        throw error;
      }
    } else {
      throw new Error('MCP client not configured for this agent');
    }
  }
  
  // Request a task via MCP
  async requestTask(task, assignedTo = null, deadline = null, priority = 'normal') {
    if (this.mcpClient) {
      try {
        const result = await this.mcpClient.callTool('request_task', {
          task,
          assignedTo,
          deadline,
          priority
        });
        this.logAction('requestTask', { task, assignedTo, deadline, priority });
        return result;
      } catch (error) {
        this.logAction('requestTaskError', { error: error.message });
        throw error;
      }
    } else {
      throw new Error('MCP client not configured for this agent');
    }
  }
  
  // Get organizational data via MCP
  async getOrgData(dataType, filter = null) {
    if (this.mcpClient) {
      try {
        const result = await this.mcpClient.callTool('get_org_data', {
          dataType,
          filter
        });
        this.logAction('getOrgData', { dataType, filter });
        return result;
      } catch (error) {
        this.logAction('getOrgDataError', { error: error.message });
        throw error;
      }
    } else {
      throw new Error('MCP client not configured for this agent');
    }
  }
}

module.exports = Agent;