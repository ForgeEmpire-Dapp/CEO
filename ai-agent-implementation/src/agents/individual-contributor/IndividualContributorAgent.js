const Agent = require('../Agent');
const ceoData = require('../../../ceo.json');

class IndividualContributorAgent {
  constructor(logger) {
    this.logger = logger;
    this.agentRoles = [];
    this.initializeAgentRoles();
  }

  // Initialize all individual contributor roles from the ceo.json data
  initializeAgentRoles() {
    const icData = ceoData.organizational_architecture.individual_contributor_layer;
    
    // For individual contributors, we're storing the role types rather than specific agents
    this.agentRoles = icData.agent_roles || [];
    
    if (this.logger) {
      this.logger.info('Individual contributor roles initialized', { count: this.agentRoles.length });
    }
  }

  // Get all individual contributor roles
  getAllAgents() {
    return this.agentRoles;
  }

  // Check if a specific role exists
  hasRole(role) {
    return this.agentRoles.includes(role);
  }

  // Execute a task for individual contributors
  async executeTask(task, role) {
    // Verify the role exists
    if (!this.hasRole(role)) {
      throw new Error(`Role "${role}" not found in individual contributor roles`);
    }
    
    try {
      // Log the task execution
      if (this.logger) {
        this.logger.info('Individual contributor task executed', { task, role });
      }
      
      return {
        role: role,
        status: 'success',
        result: `Task "${task}" processed by ${role}`
      };
    } catch (error) {
      return {
        role: role,
        status: 'error',
        error: error.message
      };
    }
  }
}

module.exports = IndividualContributorAgent;