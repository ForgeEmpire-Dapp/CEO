const OpenAI = require('openai');
const winston = require('winston');

/**
 * LLM Service for integrating with OpenAI API
 */
class LLMService {
  /**
   * Create a new LLM Service
   * @param {string} apiKey - OpenAI API key
   * @param {object} logger - Logger instance
   */
  constructor(apiKey, logger = null) {
    this.apiKey = apiKey;
    this.logger = logger || this.createDefaultLogger();
    
    if (this.apiKey) {
      this.openai = new OpenAI({ apiKey: this.apiKey });
      this.logger.info('LLM Service initialized with OpenAI API');
    } else {
      this.logger.warn('LLM Service initialized without API key - functionality will be limited');
    }
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
      defaultMeta: { service: 'llm-service' },
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
   * Generate text using OpenAI GPT model
   * @param {string} prompt - The prompt to send to the model
   * @param {object} options - Additional options for the request
   * @returns {string} Generated text
   */
  async generateText(prompt, options = {}) {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const defaultOptions = {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 500,
        ...options
      };

      const chatCompletion = await this.openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        ...defaultOptions
      });

      const result = chatCompletion.choices[0].message.content;
      this.logger.info('Text generated successfully', { promptLength: prompt.length, responseLength: result.length });
      return result;
    } catch (error) {
      this.logger.error('Failed to generate text', { 
        error: error.message,
        promptLength: prompt.length
      });
      throw error;
    }
  }

  /**
   * Analyze agent task and provide recommendations
   * @param {string} taskDescription - Description of the task
   * @param {array} agentCapabilities - List of agent capabilities
   * @returns {object} Analysis and recommendations
   */
  async analyzeAgentTask(taskDescription, agentCapabilities) {
    const prompt = `
      Analyze the following task for an AI agent in a corporate organization:
      
      Task: ${taskDescription}
      
      Agent Capabilities: ${agentCapabilities.join(', ')}
      
      Please provide:
      1. Task complexity assessment (low/medium/high)
      2. Recommended approach to complete the task
      3. Potential challenges or risks
      4. Estimated time to complete
      5. Any additional resources needed
      
      Format your response as JSON.
    `;

    try {
      const result = await this.generateText(prompt, { 
        model: 'gpt-3.5-turbo',
        temperature: 0.3,
        max_tokens: 800
      });
      
      // Try to parse as JSON, fallback to text if parsing fails
      try {
        return JSON.parse(result);
      } catch (parseError) {
        // If JSON parsing fails, return as text analysis
        return {
          analysis: result,
          complexity: 'unknown',
          approach: 'unknown',
          challenges: 'unknown',
          estimatedTime: 'unknown',
          resourcesNeeded: 'unknown'
        };
      }
    } catch (error) {
      this.logger.error('Failed to analyze agent task', { 
        error: error.message,
        taskLength: taskDescription.length
      });
      throw error;
    }
  }

  /**
   * Generate a summary of agent activities
   * @param {array} activities - List of agent activities
   * @returns {string} Summary of activities
   */
  async summarizeAgentActivities(activities) {
    const prompt = `
      Summarize the following agent activities in a corporate organization:
      
      Activities:
      ${activities.map((activity, index) => 
        `${index + 1}. ${activity.agent} (${activity.type}): ${activity.action} at ${activity.timestamp}`
      ).join('\n')}
      
      Please provide:
      1. Overall activity summary
      2. Most active agent types
      3. Common activities
      4. Any unusual patterns
      5. Recommendations for optimization
    `;

    try {
      const result = await this.generateText(prompt, { 
        model: 'gpt-3.5-turbo',
        temperature: 0.5,
        max_tokens: 600
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to summarize agent activities', { 
        error: error.message,
        activityCount: activities.length
      });
      throw error;
    }
  }

  /**
   * Generate natural language response to user query
   * @param {string} query - User query
   * @param {object} context - Context information
   * @returns {string} Natural language response
   */
  async generateResponse(query, context = {}) {
    const prompt = `
      You are an AI assistant for a corporate AI agent organization. 
      Answer the following query from a user:
      
      Query: ${query}
      
      Context:
      ${context.agentData ? `Organization Structure: ${JSON.stringify(context.agentData)}` : ''}
      ${context.recentActivities ? `Recent Activities: ${JSON.stringify(context.recentActivities.slice(0, 5))}` : ''}
      
      Please provide a helpful and professional response.
    `;

    try {
      const result = await this.generateText(prompt, { 
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 400
      });
      
      return result;
    } catch (error) {
      this.logger.error('Failed to generate response', { 
        error: error.message,
        queryLength: query.length
      });
      throw error;
    }
  }
}

module.exports = LLMService;