const Agent = require('../Agent');
const ceoData = require('../../../ceo.json');

class DirectorAgent {
  constructor(logger) {
    this.logger = logger;
    this.agents = [];
    this.initializeAgents();
  }

  // Initialize all director agents from the ceo.json data
  initializeAgents() {
    const directorData = ceoData.organizational_architecture.director_layer;
    
    directorData.agents.forEach(agentData => {
      const agent = new Agent(
        agentData.name,
        agentData.description,
        agentData.tools,
        agentData.key_metrics,
        this.logger
      );
      
      // Add AI augmentation if available
      if (agentData.ai_augmentation) {
        agent.aiAugmentation = agentData.ai_augmentation;
      }
      
      // Add core teams if available
      if (agentData.core_teams) {
        agent.coreTeams = agentData.core_teams;
      }
      
      this.agents.push(agent);
    });
    
    if (this.logger) {
      this.logger.info('Director agents initialized', { count: this.agents.length });
    }
  }

  // Get all director agents
  getAllAgents() {
    return this.agents.map(agent => agent.getInfo());
  }

  // Get a specific agent by name
  getAgentByName(name) {
    const agent = this.agents.find(a => a.name === name);
    return agent ? agent.getInfo() : null;
  }

  // Execute a task across all director agents
  async executeTask(task) {
    const results = [];
    
    for (const agent of this.agents) {
      try {
        // In a real implementation, this would call the specific agent's executeTask method
        agent.logAction('directorTask', { task });
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

module.exports = DirectorAgent;