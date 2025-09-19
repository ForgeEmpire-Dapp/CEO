const winston = require('winston');

/**
 * Agent Decision Maker using LLM capabilities
 */
class AgentDecisionMaker {
  /**
   * Create a new Agent Decision Maker
   * @param {object} llmService - LLM service instance
   * @param {object} logger - Logger instance
   */
  constructor(llmService, logger = null) {
    this.llmService = llmService;
    this.logger = logger;
    
    if (this.logger) {
      this.logger.info('Agent Decision Maker initialized');
    }
  }

  /**
   * Analyze a task using LLM capabilities
   * @param {object} agent - Agent object
   * @param {string} task - Task description
   * @param {object} options - LLM options
   * @returns {object} Task analysis
   */
  async analyzeTask(agent, task, options = {}) {
    try {
      const analysis = await this.llmService.analyzeAgentTask(
        task, 
        agent.tools || [],
        options
      );
      
      if (this.logger) {
        this.logger.info('Task analyzed successfully', { 
          agent: agent.name,
          taskLength: task.length
        });
      }
      
      return {
        agent: agent.name,
        task,
        analysis
      };
    } catch (error) {
      if (this.logger) {
        this.logger.error('Failed to analyze task', { 
          error: error.message,
          agent: agent.name,
          taskLength: task.length
        });
      }
      
      // Return a default analysis if LLM fails
      return {
        agent: agent.name,
        task,
        analysis: {
          complexity: 'unknown',
          approach: 'Unable to analyze task due to LLM error',
          challenges: 'unknown',
          estimatedTime: 'unknown',
          resourcesNeeded: 'unknown'
        }
      };
    }
  }

  /**
   * Generate recommendations for an agent
   * @param {object} agent - Agent object
   * @param {object[]} metrics - Performance metrics
   * @param {object} orgContext - Organizational context
   * @param {object} options - LLM options
   * @returns {object} Recommendations
   */
  async generateRecommendations(agent, metrics = [], orgContext = {}, options = {}) {
    const prompt = `
      Generate recommendations for the following agent:
      
      Agent: ${agent.name}
      Description: ${agent.description || 'No description provided'}
      
      Performance Metrics:
      ${metrics.map(metric => `- ${metric.name}: ${metric.value}`).join('\n') || 'No metrics provided'}
      
      Organizational Context:
      ${JSON.stringify(orgContext, null, 2)}
      
      Please provide 3-5 actionable recommendations for improvement.
    `;

    try {
      const recommendations = await this.llmService.generateText(prompt, {
        ...options,
        max_tokens: 300
      });
      
      if (this.logger) {
        this.logger.info('Recommendations generated successfully', { 
          agent: agent.name
        });
      }
      
      return {
        agent: agent.name,
        recommendations
      };
    } catch (error) {
      if (this.logger) {
        this.logger.error('Failed to generate recommendations', { 
          error: error.message,
          agent: agent.name
        });
      }
      
      return {
        agent: agent.name,
        recommendations: 'Unable to generate recommendations due to LLM error'
      };
    }
  }

  /**
   * Resolve conflicts between agents
   * @param {object[]} agents - List of agents involved in conflict
   * @param {string} conflictDescription - Description of the conflict
   * @param {object} context - Context information
   * @param {object} options - LLM options
   * @returns {object} Conflict resolution
   */
  async resolveConflict(agents, conflictDescription, context = {}, options = {}) {
    const prompt = `
      Resolve the following conflict between agents:
      
      Conflict: ${conflictDescription}
      
      Involved Agents:
      ${agents.map(agent => `- ${agent.name}: ${agent.description || 'No description'}`).join('\n')}
      
      Context:
      ${JSON.stringify(context, null, 2)}
      
      Please provide a resolution strategy that addresses the conflict
      and promotes collaboration between the agents.
    `;

    try {
      const resolution = await this.llmService.generateText(prompt, {
        ...options,
        max_tokens: 400
      });
      
      if (this.logger) {
        this.logger.info('Conflict resolved successfully', { 
          agentCount: agents.length
        });
      }
      
      return {
        agents: agents.map(agent => agent.name),
        conflict: conflictDescription,
        resolution
      };
    } catch (error) {
      if (this.logger) {
        this.logger.error('Failed to resolve conflict', { 
          error: error.message,
          agentCount: agents.length
        });
      }
      
      return {
        agents: agents.map(agent => agent.name),
        conflict: conflictDescription,
        resolution: 'Unable to resolve conflict due to LLM error'
      };
    }
  }

  /**
   * Optimize resource allocation
   * @param {object[]} resources - Available resources
   * @param {object[]} requests - Resource requests
   * @param {object} constraints - Allocation constraints
   * @param {object} options - LLM options
   * @returns {object} Resource allocation plan
   */
  async optimizeResourceAllocation(resources = [], requests = [], constraints = {}, options = {}) {
    const prompt = `
      Optimize the allocation of resources based on the following information:
      
      Available Resources:
      ${resources.map(resource => `- ${resource.name} (${resource.type}): ${resource.availability}`).join('\n') || 'No resources listed'}
      
      Resource Requests:
      ${requests.map(request => `- ${request.agent}: ${request.resource} (Priority: ${request.priority})`).join('\n') || 'No requests listed'}
      
      Constraints:
      ${JSON.stringify(constraints, null, 2) || 'No constraints specified'}
      
      Please provide an allocation plan that optimizes resource usage
      while satisfying the most critical requests.
    `;

    try {
      const allocationPlan = await this.llmService.generateText(prompt, {
        ...options,
        max_tokens: 500
      });
      
      if (this.logger) {
        this.logger.info('Resource allocation optimized successfully', { 
          resourceCount: resources.length,
          requestCount: requests.length
        });
      }
      
      return {
        resources: resources.length,
        requests: requests.length,
        allocationPlan
      };
    } catch (error) {
      if (this.logger) {
        this.logger.error('Failed to optimize resource allocation', { 
          error: error.message,
          resourceCount: resources.length,
          requestCount: requests.length
        });
      }
      
      return {
        resources: resources.length,
        requests: requests.length,
        allocationPlan: 'Unable to generate allocation plan due to LLM error'
      };
    }
  }
}

module.exports = AgentDecisionMaker;