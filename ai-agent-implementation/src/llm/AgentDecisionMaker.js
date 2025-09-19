const LLMService = require('./LLMService');

/**
 * Agent Decision Maker that uses LLM to enhance agent decision-making capabilities
 */
class AgentDecisionMaker {
  /**
   * Create a new Agent Decision Maker
   * @param {LLMService} llmService - LLM service instance
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
   * Analyze a task and provide decision support
   * @param {object} agent - The agent requesting decision support
   * @param {string} task - The task to analyze
   * @param {object} context - Additional context information
   * @returns {object} Decision support information
   */
  async analyzeTask(agent, task, context = {}) {
    try {
      // Gather agent capabilities
      const agentCapabilities = agent.tools || [];
      
      // Get LLM analysis
      const analysis = await this.llmService.analyzeAgentTask(task, agentCapabilities);
      
      if (this.logger) {
        this.logger.info('Task analysis completed', { 
          agent: agent.name, 
          taskLength: task.length 
        });
      }
      
      return {
        agent: agent.name,
        task,
        analysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (this.logger) {
        this.logger.error('Failed to analyze task', { 
          error: error.message,
          agent: agent.name,
          taskLength: task.length
        });
      }
      throw error;
    }
  }

  /**
   * Generate strategic recommendations for an agent
   * @param {object} agent - The agent requesting recommendations
   * @param {array} metrics - Current agent metrics
   * @param {object} orgContext - Organizational context
   * @returns {object} Strategic recommendations
   */
  async generateRecommendations(agent, metrics, orgContext = {}) {
    const prompt = `
      As an AI strategic advisor, provide recommendations for the following agent:
      
      Agent: ${agent.name}
      Role: ${agent.description}
      
      Current Metrics:
      ${metrics.map(metric => `- ${metric.name}: ${metric.value}`).join('\n')}
      
      Organizational Context:
      ${orgContext.department ? `Department: ${orgContext.department}` : ''}
      ${orgContext.goals ? `Goals: ${orgContext.goals.join(', ')}` : ''}
      
      Please provide:
      1. Performance assessment
      2. Strategic recommendations
      3. Areas for improvement
      4. Collaboration opportunities
    `;

    try {
      const recommendations = await this.llmService.generateText(prompt, {
        model: 'gpt-3.5-turbo',
        temperature: 0.5,
        max_tokens: 600
      });
      
      if (this.logger) {
        this.logger.info('Recommendations generated', { 
          agent: agent.name 
        });
      }
      
      return {
        agent: agent.name,
        recommendations,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (this.logger) {
        this.logger.error('Failed to generate recommendations', { 
          error: error.message,
          agent: agent.name
        });
      }
      throw error;
    }
  }

  /**
   * Resolve conflicts between agents
   * @param {array} agents - Agents involved in conflict
   * @param {string} conflictDescription - Description of the conflict
   * @param {object} context - Context information
   * @returns {object} Conflict resolution
   */
  async resolveConflict(agents, conflictDescription, context = {}) {
    const prompt = `
      As an AI conflict resolution specialist, help resolve the following conflict:
      
      Conflict: ${conflictDescription}
      
      Involved Agents:
      ${agents.map(agent => `- ${agent.name} (${agent.description})`).join('\n')}
      
      Context:
      ${context.project ? `Project: ${context.project}` : ''}
      ${context.priority ? `Priority: ${context.priority}` : ''}
      ${context.deadline ? `Deadline: ${context.deadline}` : ''}
      
      Please provide:
      1. Root cause analysis
      2. Proposed resolution
      3. Implementation steps
      4. Prevention strategies
    `;

    try {
      const resolution = await this.llmService.generateText(prompt, {
        model: 'gpt-3.5-turbo',
        temperature: 0.3,
        max_tokens: 700
      });
      
      if (this.logger) {
        this.logger.info('Conflict resolution generated', { 
          agentCount: agents.length,
          conflictLength: conflictDescription.length
        });
      }
      
      return {
        agents: agents.map(a => a.name),
        conflict: conflictDescription,
        resolution,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (this.logger) {
        this.logger.error('Failed to resolve conflict', { 
          error: error.message,
          agentCount: agents.length,
          conflictLength: conflictDescription.length
        });
      }
      throw error;
    }
  }

  /**
   * Optimize resource allocation
   * @param {array} resources - Available resources
   * @param {array} requests - Resource requests
   * @param {object} constraints - Allocation constraints
   * @returns {object} Resource allocation plan
   */
  async optimizeResourceAllocation(resources, requests, constraints = {}) {
    const prompt = `
      As an AI resource optimization specialist, create an optimal resource allocation plan:
      
      Available Resources:
      ${resources.map(resource => `- ${resource.name} (${resource.type}): ${resource.availability}`).join('\n')}
      
      Resource Requests:
      ${requests.map(request => `- ${request.agent}: ${request.resource} (${request.priority} priority)`).join('\n')}
      
      Constraints:
      ${constraints.budget ? `Budget: ${constraints.budget}` : ''}
      ${constraints.timeline ? `Timeline: ${constraints.timeline}` : ''}
      ${constraints.dependencies ? `Dependencies: ${constraints.dependencies.join(', ')}` : ''}
      
      Please provide:
      1. Allocation recommendations
      2. Priority justification
      3. Risk assessment
      4. Contingency plans
    `;

    try {
      const allocationPlan = await this.llmService.generateText(prompt, {
        model: 'gpt-3.5-turbo',
        temperature: 0.4,
        max_tokens: 800
      });
      
      if (this.logger) {
        this.logger.info('Resource allocation plan generated', { 
          resourceCount: resources.length,
          requestCount: requests.length
        });
      }
      
      return {
        resources: resources.length,
        requests: requests.length,
        allocationPlan,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (this.logger) {
        this.logger.error('Failed to optimize resource allocation', { 
          error: error.message,
          resourceCount: resources.length,
          requestCount: requests.length
        });
      }
      throw error;
    }
  }
}

module.exports = AgentDecisionMaker;