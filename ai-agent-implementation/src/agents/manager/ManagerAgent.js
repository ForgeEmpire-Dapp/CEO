const Agent = require('../Agent');
const ceoData = require('../../../ceo.json');

class ManagerAgent {
  constructor(logger) {
    this.logger = logger;
    this.agents = [];
    this.initializeAgents();
  }

  // Initialize all manager agents from the ceo.json data
  initializeAgents() {
    const managerData = ceoData.organizational_architecture.manager_layer;
    
    managerData.agents.forEach(agentData => {
      const agent = new Agent(
        agentData.name,
        agentData.description,
        agentData.tools,
        agentData.key_metrics,
        this.logger
      );
      
      // Add team information if available
      if (agentData.team) {
        agent.team = agentData.team;
      }
      
      this.agents.push(agent);
    });
    
    if (this.logger) {
      this.logger.info('Manager agents initialized', { count: this.agents.length });
    }
  }

  // Get all manager agents
  getAllAgents() {
    return this.agents.map(agent => agent.getInfo());
  }

  // Get a specific agent by name
  getAgentByName(name) {
    const agent = this.agents.find(a => a.name === name);
    return agent ? agent.getInfo() : null;
  }

  // Execute a task across all manager agents
  async executeTask(task) {
    const results = [];
    
    for (const agent of this.agents) {
      try {
        // In a real implementation, this would call the specific agent's executeTask method
        agent.logAction('managerTask', { task });
        results.push({
          agent: agent.name,
          status: 'success',
          result: `Task "${task}" processed by ${agent.name}`
        });
      } catch (error) {
        results.push({
          agent: agent.name,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return results;
  }
}

module.exports = ManagerAgent;