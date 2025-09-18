class Agent {
  constructor(name, description, tools = [], keyMetrics = [], logger = null) {
    this.name = name;
    this.description = description;
    this.tools = tools;
    this.keyMetrics = keyMetrics;
    this.logger = logger;
    this.createdAt = new Date();
    this.lastActive = new Date();
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
}

module.exports = Agent;