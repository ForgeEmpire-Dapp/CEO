const AgentDecisionMaker = require('./AgentDecisionMaker');
const LLMService = require('./LLMService');
const winston = require('winston');

// Create a simple logger for testing
const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

describe('AgentDecisionMaker', () => {
  let agentDecisionMaker;
  let mockLLMService;

  beforeEach(() => {
    // Create a mock LLM service
    mockLLMService = {
      analyzeAgentTask: jest.fn().mockResolvedValue({
        complexity: 'medium',
        approach: 'Collaborate with relevant departments',
        challenges: 'Data availability',
        estimatedTime: '2 days',
        resourcesNeeded: 'Market research data'
      }),
      generateText: jest.fn().mockResolvedValue('Mock LLM response')
    };
    
    agentDecisionMaker = new AgentDecisionMaker(mockLLMService, logger);
  });

  test('should create agent decision maker successfully', () => {
    expect(agentDecisionMaker).toBeDefined();
    expect(agentDecisionMaker.llmService).toBeDefined();
  });

  test('should analyze task with LLM support', async () => {
    const agent = {
      name: 'TestAgent',
      description: 'A test agent',
      tools: ['data_analysis', 'reporting']
    };
    
    const task = 'Analyze customer feedback and generate insights';
    
    const result = await agentDecisionMaker.analyzeTask(agent, task);
    
    expect(result).toBeDefined();
    expect(result.agent).toBe('TestAgent');
    expect(result.task).toBe(task);
    expect(result.analysis).toBeDefined();
    expect(mockLLMService.analyzeAgentTask).toHaveBeenCalledWith(
      task, 
      agent.tools
    );
  });

  test('should generate recommendations for agent', async () => {
    const agent = {
      name: 'TestAgent',
      description: 'A test agent'
    };
    
    const metrics = [
      { name: 'Response Time', value: '2.5s' },
      { name: 'Accuracy', value: '95%' }
    ];
    
    const orgContext = {
      department: 'Engineering',
      goals: ['Improve performance', 'Reduce costs']
    };
    
    const result = await agentDecisionMaker.generateRecommendations(agent, metrics, orgContext);
    
    expect(result).toBeDefined();
    expect(result.agent).toBe('TestAgent');
    expect(result.recommendations).toBe('Mock LLM response');
    expect(mockLLMService.generateText).toHaveBeenCalled();
  });

  test('should resolve conflicts between agents', async () => {
    const agents = [
      { name: 'Agent1', description: 'First agent' },
      { name: 'Agent2', description: 'Second agent' }
    ];
    
    const conflictDescription = 'Disagreement on project approach';
    
    const context = {
      project: 'New Product Launch',
      priority: 'High',
      deadline: '2025-12-31'
    };
    
    const result = await agentDecisionMaker.resolveConflict(agents, conflictDescription, context);
    
    expect(result).toBeDefined();
    expect(result.agents).toEqual(['Agent1', 'Agent2']);
    expect(result.conflict).toBe(conflictDescription);
    expect(result.resolution).toBe('Mock LLM response');
    expect(mockLLMService.generateText).toHaveBeenCalled();
  });

  test('should optimize resource allocation', async () => {
    const resources = [
      { name: 'Developer Hours', type: 'human', availability: '40 hours/week' },
      { name: 'Cloud Credits', type: 'technical', availability: '$1000/month' }
    ];
    
    const requests = [
      { agent: 'Engineering Team', resource: 'Developer Hours', priority: 'high' },
      { agent: 'Data Science Team', resource: 'Cloud Credits', priority: 'medium' }
    ];
    
    const constraints = {
      budget: '$5000',
      timeline: '3 months',
      dependencies: ['Infrastructure setup']
    };
    
    const result = await agentDecisionMaker.optimizeResourceAllocation(resources, requests, constraints);
    
    expect(result).toBeDefined();
    expect(result.resources).toBe(2);
    expect(result.requests).toBe(2);
    expect(result.allocationPlan).toBe('Mock LLM response');
    expect(mockLLMService.generateText).toHaveBeenCalled();
  });
});