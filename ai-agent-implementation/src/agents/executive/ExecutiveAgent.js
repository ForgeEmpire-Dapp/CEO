const Agent = require('../Agent');
const ceoData = require('../../../ceo.json');

class ExecutiveAgent {
  constructor(logger) {
    this.logger = logger;
    this.agents = [];
    this.initializeAgents();
  }

  // Initialize all executive agents from the ceo.json data
  initializeAgents() {
    const executiveData = ceoData.organizational_architecture.executive_layer;
    
    executiveData.agents.forEach(agentData => {
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
      
      // Add sub-agents if available
      if (agentData.sub_agents) {
        agent.subAgents = agentData.sub_agents;
      }
      
      this.agents.push(agent);
    });
    
    if (this.logger) {
      this.logger.info('Executive agents initialized', { count: this.agents.length });
    }
  }

  // Get all executive agents
  getAllAgents() {
    return this.agents.map(agent => agent.getInfo());
  }

  // Get a specific agent by name
  getAgentByName(name) {
    const agent = this.agents.find(a => a.name === name);
    return agent ? agent.getInfo() : null;
  }

  // Execute a task across all executive agents
  async executeTask(task) {
    const results = [];
    
    for (const agent of this.agents) {
      try {
        // In a real implementation, this would call the specific agent's executeTask method
        agent.logAction('executiveTask', { task });
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

module.exports = ExecutiveAgent;