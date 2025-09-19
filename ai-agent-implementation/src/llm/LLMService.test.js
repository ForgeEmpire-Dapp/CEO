const LLMService = require('./LLMService');
const winston = require('winston');

// Create a simple logger for testing
const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

describe('LLMService', () => {
  let llmService;

  beforeEach(() => {
    // Initialize without API key for testing
    llmService = new LLMService(null, logger);
  });

  test('should create LLM service successfully', () => {
    expect(llmService).toBeDefined();
    expect(llmService.logger).toBeDefined();
  });

  test('should throw error when generating text without API keys', async () => {
    await expect(llmService.generateText('Test prompt'))
      .rejects
      .toThrow('OPENAI API key not configured');
  });

  test('should set API keys successfully', () => {
    const apiKeys = {
      openai: 'test-openai-key',
      anthropic: 'test-anthropic-key',
      groq: 'test-groq-key',
      mistral: 'test-mistral-key'
    };
    
    llmService.setApiKeys(apiKeys);
    expect(llmService.apiKeys).toEqual(apiKeys);
  });

  test('should analyze agent task', async () => {
    // This will throw an error without API key, but we can test the method structure
    const taskDescription = 'Analyze customer feedback and generate insights';
    const agentCapabilities = ['data_analysis', 'natural_language_processing', 'report_generation'];
    
    await expect(llmService.analyzeAgentTask(taskDescription, agentCapabilities))
      .rejects
      .toThrow('OPENAI API key not configured');
  });

  test('should summarize agent activities', async () => {
    const activities = [
      {
        agent: 'CEO',
        type: 'executive',
        action: 'reviewed quarterly reports',
        timestamp: new Date().toISOString()
      },
      {
        agent: 'CTO',
        type: 'executive',
        action: 'approved new technology stack',
        timestamp: new Date().toISOString()
      }
    ];
    
    await expect(llmService.summarizeAgentActivities(activities))
      .rejects
      .toThrow('OPENAI API key not configured');
  });

  test('should generate response to user query', async () => {
    const query = 'What is the current status of our AI agents?';
    const context = {
      agentData: {
        executive: [{ name: 'CEO', status: 'active' }],
        director: [{ name: 'VP of Engineering', status: 'active' }]
      }
    };
    
    await expect(llmService.generateResponse(query, context))
      .rejects
      .toThrow('OPENAI API key not configured');
  });
});