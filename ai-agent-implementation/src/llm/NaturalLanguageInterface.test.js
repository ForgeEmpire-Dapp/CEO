const NaturalLanguageInterface = require('./NaturalLanguageInterface');
const LLMService = require('./LLMService');
const winston = require('winston');

// Create a simple logger for testing
const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

describe('NaturalLanguageInterface', () => {
  let naturalLanguageInterface;
  let mockLLMService;
  let mockAgentManager;

  beforeEach(() => {
    // Create a mock LLM service
    mockLLMService = {
      generateText: jest.fn().mockImplementation(async (prompt, options) => {
        if (prompt.includes('Classify the following user query')) {
          return 'status';
        }
        return 'Mock LLM response';
      })
    };
    
    // Create a mock agent manager
    mockAgentManager = {
      // Mock agent manager methods would go here
    };
    
    naturalLanguageInterface = new NaturalLanguageInterface(mockLLMService, mockAgentManager, logger);
  });

  test('should create natural language interface successfully', () => {
    expect(naturalLanguageInterface).toBeDefined();
    expect(naturalLanguageInterface.llmService).toBeDefined();
    expect(naturalLanguageInterface.agentManager).toBeDefined();
  });

  test('should determine query intent', async () => {
    const query = 'What is the status of our AI agents?';
    
    const intent = await naturalLanguageInterface.determineIntent(query);
    
    expect(intent).toBe('status');
    expect(mockLLMService.generateText).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        temperature: 0.1,
        max_tokens: 10
      })
    );
  });

  test('should gather context information', async () => {
    const context = {
      recentActivities: [{ agent: 'CEO', type: 'executive', action: 'reviewed reports' }]
    };
    
    const gatheredContext = await naturalLanguageInterface.gatherContext(context);
    
    expect(gatheredContext).toBeDefined();
    expect(gatheredContext.agentData).toBeDefined();
    expect(gatheredContext.recentActivities).toBeDefined();
    expect(gatheredContext.systemMetrics).toBeDefined();
    expect(gatheredContext.userPreferences).toBeDefined();
  });

  test('should process query and generate response', async () => {
    const query = 'What is the status of our AI agents?';
    
    const result = await naturalLanguageInterface.processQuery(query);
    
    expect(result).toBeDefined();
    expect(result.query).toBe(query);
    expect(result.intent).toBe('status');
    expect(result.response).toBe('Mock LLM response');
    expect(result.timestamp).toBeDefined();
  });

  test('should handle different query intents', async () => {
    const intents = ['status', 'task', 'information', 'performance', 'help', 'other'];
    
    for (const intent of intents) {
      mockLLMService.generateText.mockImplementationOnce(async (prompt, options) => {
        if (prompt.includes('Classify the following user query')) {
          return intent;
        }
        return 'Mock LLM response'; // Fixed: Always return the same mock response
      });
      
      const query = `Sample query for ${intent}`;
      const result = await naturalLanguageInterface.processQuery(query);
      
      expect(result.intent).toBe(intent);
      expect(result.response).toBe('Mock LLM response'); // Fixed: Expect the correct response
    }
  });

  test('should parse natural language task request', async () => {
    const taskRequest = 'Please analyze the customer feedback and generate a report by Friday';
    
    mockLLMService.generateText.mockResolvedValueOnce(JSON.stringify({
      title: "Customer Feedback Analysis",
      description: "Analyze customer feedback and generate a report",
      assignedTo: "Data Science Team",
      priority: "high",
      deadline: "2025-09-26",
      requiredResources: ["customer data", "analytics tools"]
    }));
    
    const task = await naturalLanguageInterface.parseTaskRequest(taskRequest);
    
    expect(task).toBeDefined();
    expect(task.title).toBe("Customer Feedback Analysis");
    expect(task.description).toBe("Analyze customer feedback and generate a report");
    expect(task.priority).toBe("high");
  });

  test('should handle LLM errors gracefully by returning fallback responses', async () => {
    // Test that when LLM service throws an error, we get a fallback response
    mockLLMService.generateText.mockImplementation(async (prompt, options) => {
      throw new Error('LLM service unavailable');
    });
    
    const query = 'What is the status of our AI agents?';
    const result = await naturalLanguageInterface.processQuery(query);
    
    // Should still return a result with 'other' intent and fallback response
    expect(result.intent).toBe('other');
    expect(result.response).toBe("I apologize, but I'm having trouble processing your request right now. Please try again later.");
  });
});