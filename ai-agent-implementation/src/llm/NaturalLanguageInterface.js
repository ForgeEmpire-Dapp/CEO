const LLMService = require('./LLMService');

/**
 * Natural Language Interface for interacting with AI agents
 */
class NaturalLanguageInterface {
  /**
   * Create a new Natural Language Interface
   * @param {LLMService} llmService - LLM service instance
   * @param {object} agentManager - Agent manager instance
   * @param {object} logger - Logger instance
   */
  constructor(llmService, agentManager, logger = null) {
    this.llmService = llmService;
    this.agentManager = agentManager;
    this.logger = logger;
    
    if (this.logger) {
      this.logger.info('Natural Language Interface initialized');
    }
  }

  /**
   * Process a natural language query and generate appropriate response
   * @param {string} query - User query in natural language
   * @param {object} context - Additional context information
   * @param {object} options - LLM options (provider, model, etc.)
   * @returns {object} Response with answer and any actions to take
   */
  async processQuery(query, context = {}, options = {}) {
    try {
      // First, determine the intent of the query
      const intent = await this.determineIntent(query, options);
      
      // Gather relevant context
      const agentContext = await this.gatherContext(context);
      
      // Generate response based on intent
      const response = await this.generateResponse(query, intent, agentContext, options);
      
      if (this.logger) {
        this.logger.info('Query processed successfully', { 
          queryLength: query.length,
          intent
        });
      }
      
      return {
        query,
        intent,
        response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (this.logger) {
        this.logger.error('Failed to process query', { 
          error: error.message,
          queryLength: query.length
        });
      }
      throw error;
    }
  }

  /**
   * Determine the intent of a user query
   * @param {string} query - User query
   * @param {object} options - LLM options
   * @returns {string} Intent classification
   */
  async determineIntent(query, options = {}) {
    const prompt = `
      Classify the following user query into one of these intents:
      
      1. "status" - Query about agent status or activities
      2. "task" - Request to assign or execute a task
      3. "information" - Request for organizational information
      4. "performance" - Query about agent or system performance
      5. "help" - Request for assistance or guidance
      6. "other" - Other types of queries
      
      Query: "${query}"
      
      Respond with only the intent classification.
    `;

    try {
      const intent = await this.llmService.generateText(prompt, {
        ...options,
        model: options.model || 'gpt-3.5-turbo',
        temperature: 0.1,
        max_tokens: 10
      });
      
      // Clean up the response
      const cleanIntent = intent.trim().toLowerCase().replace(/[^a-z]/g, '');
      
      // Validate against known intents
      const validIntents = ['status', 'task', 'information', 'performance', 'help', 'other'];
      return validIntents.includes(cleanIntent) ? cleanIntent : 'other';
    } catch (error) {
      if (this.logger) {
        this.logger.error('Failed to determine intent', { 
          error: error.message,
          queryLength: query.length
        });
      }
      return 'other';
    }
  }

  /**
   * Gather context information for query processing
   * @param {object} context - Provided context
   * @returns {object} Enhanced context
   */
  async gatherContext(context = {}) {
    // In a real implementation, this would gather actual context from the system
    // For now, we'll return a mock context structure
    return {
      agentData: context.agentData || {
        executive: [{ name: 'CEO', status: 'active' }],
        director: [{ name: 'VP of Engineering', status: 'active' }],
        manager: [{ name: 'Engineering Manager', status: 'active' }],
        contributor: [{ name: 'Software Engineer', status: 'active' }]
      },
      recentActivities: context.recentActivities || [],
      systemMetrics: context.systemMetrics || {},
      userPreferences: context.userPreferences || {}
    };
  }

  /**
   * Generate response based on query, intent, and context
   * @param {string} query - Original query
   * @param {string} intent - Determined intent
   * @param {object} context - Context information
   * @param {object} options - LLM options
   * @returns {string} Generated response
   */
  async generateResponse(query, intent, context, options = {}) {
    let prompt;
    
    switch (intent) {
      case 'status':
        prompt = `
          User wants to know about agent status. Provide a helpful response based on this context:
          
          Query: "${query}"
          
          Agent Data:
          ${JSON.stringify(context.agentData, null, 2)}
          
          Recent Activities:
          ${context.recentActivities.slice(0, 5).map(activity => 
            `- ${activity.agent} (${activity.type}): ${activity.action}`
          ).join('\n') || 'No recent activities'}
          
          Please provide a clear, concise status update.
        `;
        break;
        
      case 'task':
        prompt = `
          User wants to assign or execute a task. Provide guidance on how to proceed:
          
          Query: "${query}"
          
          Available Agent Types:
          - Executive (CEO, CTO, etc.)
          - Director (VPs)
          - Manager (Department managers)
          - Contributor (Individual contributors)
          
          Please provide helpful guidance on how to structure the task request.
        `;
        break;
        
      case 'information':
        prompt = `
          User is requesting organizational information. Provide relevant details:
          
          Query: "${query}"
          
          Organizational Structure:
          Executives: CEO, CTO, CFO
          Directors: VP of Engineering, VP of Marketing, VP of Sales
          Managers: Engineering Manager, Marketing Manager, Sales Manager
          Contributors: Software Engineers, Data Scientists, Marketers, Sales Reps
          
          Please provide helpful information based on the query.
        `;
        break;
        
      case 'performance':
        prompt = `
          User is asking about performance metrics. Provide relevant information:
          
          Query: "${query}"
          
          System Metrics:
          ${Object.keys(context.systemMetrics).length > 0 
            ? JSON.stringify(context.systemMetrics, null, 2)
            : 'No specific metrics provided'}
            
          Please provide helpful performance information.
        `;
        break;
        
      case 'help':
        prompt = `
          User is requesting help or guidance. Provide assistance:
          
          Query: "${query}"
          
          Available Capabilities:
          - Check agent status and activities
          - Assign tasks to agents
          - Retrieve organizational information
          - Analyze performance metrics
          - Resolve conflicts between agents
          
          Please provide helpful guidance.
        `;
        break;
        
      default:
        prompt = `
          User has asked a general question. Provide a helpful response:
          
          Query: "${query}"
          
          Context:
          ${JSON.stringify(context, null, 2)}
          
          Please provide a helpful and professional response.
        `;
    }

    try {
      const response = await this.llmService.generateText(prompt, {
        ...options,
        model: options.model || 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 500
      });
      
      return response;
    } catch (error) {
      if (this.logger) {
        this.logger.error('Failed to generate response', { 
          error: error.message,
          intent,
          queryLength: query.length
        });
      }
      
      // Fallback response
      return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
    }
  }

  /**
   * Convert natural language task request to structured task
   * @param {string} taskRequest - Natural language task request
   * @param {object} options - LLM options
   * @returns {object} Structured task object
   */
  async parseTaskRequest(taskRequest, options = {}) {
    const prompt = `
      Convert the following natural language task request into a structured task object:
      
      Task Request: "${taskRequest}"
      
      Please provide a JSON object with the following structure:
      {
        "title": "Brief task title",
        "description": "Detailed task description",
        "assignedTo": "Agent type or specific agent (if known)",
        "priority": "low|normal|high|critical",
        "deadline": "ISO date string or relative time (if mentioned)",
        "requiredResources": ["resource1", "resource2"] (if mentioned)
      }
      
      If certain information is not mentioned, omit those fields or use sensible defaults.
    `;

    try {
      const result = await this.llmService.generateText(prompt, {
        ...options,
        model: options.model || 'gpt-3.5-turbo',
        temperature: 0.3,
        max_tokens: 300
      });
      
      // Try to parse as JSON
      try {
        return JSON.parse(result);
      } catch (parseError) {
        // If JSON parsing fails, create a basic structure
        return {
          title: "Parsed Task",
          description: taskRequest,
          priority: "normal"
        };
      }
    } catch (error) {
      if (this.logger) {
        this.logger.error('Failed to parse task request', { 
          error: error.message,
          requestLength: taskRequest.length
        });
      }
      
      // Fallback structure
      return {
        title: "User Requested Task",
        description: taskRequest,
        priority: "normal"
      };
    }
  }
}

module.exports = NaturalLanguageInterface;