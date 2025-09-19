const OpenAI = require('openai');
const axios = require('axios');
const winston = require('winston');

/**
 * LLM Service for interacting with various language models
 */
class LLMService {
  /**
   * Create a new LLM Service
   * @param {string} openaiApiKey - OpenAI API key
   * @param {object} logger - Logger instance
   */
  constructor(openaiApiKey, logger = null) {
    this.openaiApiKey = openaiApiKey;
    this.logger = logger;
    
    // Initialize OpenAI client if API key is provided
    if (this.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: this.openaiApiKey,
      });
    }
    
    if (this.logger) {
      this.logger.warn('LLM Service initialized without API key - functionality will be limited');
    }
  }

  /**
   * Set API keys for different providers
   * @param {object} apiKeys - Object containing API keys for different providers
   */
  setApiKeys(apiKeys) {
    this.apiKeys = apiKeys;
    
    // Reinitialize clients if keys are provided
    if (apiKeys.openai) {
      this.openai = new OpenAI({
        apiKey: apiKeys.openai,
      });
    }
  }

  /**
   * Generate text using the specified LLM provider
   * @param {string} prompt - Prompt for the LLM
   * @param {object} options - Options for the LLM request
   * @returns {string} Generated text
   */
  async generateText(prompt, options = {}) {
    const {
      provider = 'openai',
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      max_tokens = 500
    } = options;

    // Check if we have the required API key for the provider
    if (!this.apiKeys || !this.apiKeys[provider]) {
      throw new Error(`${provider.toUpperCase()} API key not configured`);
    }

    try {
      switch (provider) {
        case 'openai':
          return await this._generateWithOpenAI(prompt, model, temperature, max_tokens);
        case 'anthropic':
          return await this._generateWithAnthropic(prompt, model, temperature, max_tokens);
        case 'groq':
          return await this._generateWithGroq(prompt, model, temperature, max_tokens);
        case 'mistral':
          return await this._generateWithMistral(prompt, model, temperature, max_tokens);
        default:
          throw new Error(`Unsupported LLM provider: ${provider}`);
      }
    } catch (error) {
      if (this.logger) {
        this.logger.error('Failed to generate text', { 
          error: error.message,
          provider,
          promptLength: prompt.length
        });
      }
      throw error;
    }
  }

  /**
   * Generate text using OpenAI
   */
  async _generateWithOpenAI(prompt, model, temperature, max_tokens) {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await this.openai.chat.completions.create({
      model: model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens,
    });

    return response.choices[0].message.content;
  }

  /**
   * Generate text using Anthropic
   */
  async _generateWithAnthropic(prompt, model, temperature, max_tokens) {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: model || 'claude-3-haiku-20240307',
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: max_tokens || 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKeys.anthropic,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    return response.data.content[0].text;
  }

  /**
   * Generate text using Groq
   */
  async _generateWithGroq(prompt, model, temperature, max_tokens) {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: model || 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: max_tokens || 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.groq}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  }

  /**
   * Generate text using Mistral
   */
  async _generateWithMistral(prompt, model, temperature, max_tokens) {
    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: model || 'mistral-tiny',
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: max_tokens || 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.mistral}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  }

  /**
   * Analyze an agent task using the specified LLM provider
   * @param {string} taskDescription - Description of the task
   * @param {string[]} agentCapabilities - List of agent capabilities
   * @param {object} options - Options for the LLM request
   * @returns {object} Task analysis
   */
  async analyzeAgentTask(taskDescription, agentCapabilities = [], options = {}) {
    const prompt = `
      Analyze the following task for an AI agent:
      
      Task: "${taskDescription}"
      
      Agent Capabilities:
      ${agentCapabilities.map(cap => `- ${cap}`).join('\n')}
      
      Please provide:
      1. Complexity assessment (low/medium/high)
      2. Recommended approach
      3. Potential challenges
      4. Estimated time to complete
      5. Resources needed
      
      Format your response as a JSON object.
    `;

    const response = await this.generateText(prompt, {
      ...options,
      max_tokens: 300
    });

    try {
      return JSON.parse(response);
    } catch (error) {
      // If JSON parsing fails, return a structured object
      return {
        complexity: 'unknown',
        approach: response,
        challenges: 'unknown',
        estimatedTime: 'unknown',
        resourcesNeeded: 'unknown'
      };
    }
  }

  /**
   * Summarize agent activities using the specified LLM provider
   * @param {object[]} activities - List of agent activities
   * @param {object} options - Options for the LLM request
   * @returns {string} Summary of activities
   */
  async summarizeAgentActivities(activities, options = {}) {
    const prompt = `
      Summarize the following agent activities:
      
      ${activities.map(activity => 
        `- ${activity.agent} (${activity.type}): ${activity.action} at ${activity.timestamp}`
      ).join('\n')}
      
      Please provide a concise summary of the activities and any notable patterns.
    `;

    return await this.generateText(prompt, {
      ...options,
      max_tokens: 200
    });
  }

  /**
   * Generate a response to a user query using the specified LLM provider
   * @param {string} query - User query
   * @param {object} context - Context information
   * @param {object} options - Options for the LLM request
   * @returns {string} Generated response
   */
  async generateResponse(query, context = {}, options = {}) {
    const prompt = `
      User has asked: "${query}"
      
      Context:
      ${JSON.stringify(context, null, 2)}
      
      Please provide a helpful and professional response.
    `;

    return await this.generateText(prompt, options);
  }
}

module.exports = LLMService;