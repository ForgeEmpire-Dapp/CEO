const TaskExecutionTools = require('./TaskExecutionTools');
const winston = require('winston');

// Create a simple logger for testing
const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

describe('TaskExecutionTools', () => {
  let taskExecutionTools;

  beforeEach(() => {
    taskExecutionTools = new TaskExecutionTools(logger);
  });

  test('should create task execution tools successfully', () => {
    expect(taskExecutionTools).toBeDefined();
  });

  test('should get all tools', () => {
    const tools = taskExecutionTools.getTools();
    expect(tools).toBeDefined();
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBe(6); // We have 6 tools defined
    
    // Check that all expected tools are present
    const toolNames = tools.map(tool => tool.name);
    expect(toolNames).toContain('query_data');
    expect(toolNames).toContain('update_data');
    expect(toolNames).toContain('collaborate_with_pod');
    expect(toolNames).toContain('allocate_resources');
    expect(toolNames).toContain('analyze_performance');
    expect(toolNames).toContain('check_compliance');
  });

  test('should create data query tool', () => {
    const tool = taskExecutionTools.createDataQueryTool();
    expect(tool).toBeDefined();
    expect(tool.name).toBe('query_data');
    expect(tool.config).toBeDefined();
    expect(tool.handler).toBeDefined();
    expect(typeof tool.handler).toBe('function');
  });

  test('should create data update tool', () => {
    const tool = taskExecutionTools.createDataUpdateTool();
    expect(tool).toBeDefined();
    expect(tool.name).toBe('update_data');
    expect(tool.config).toBeDefined();
    expect(tool.handler).toBeDefined();
    expect(typeof tool.handler).toBe('function');
  });

  test('should create pod collaboration tool', () => {
    const tool = taskExecutionTools.createPodCollaborationTool();
    expect(tool).toBeDefined();
    expect(tool.name).toBe('collaborate_with_pod');
    expect(tool.config).toBeDefined();
    expect(tool.handler).toBeDefined();
    expect(typeof tool.handler).toBe('function');
  });

  test('should create resource allocation tool', () => {
    const tool = taskExecutionTools.createResourceAllocationTool();
    expect(tool).toBeDefined();
    expect(tool.name).toBe('allocate_resources');
    expect(tool.config).toBeDefined();
    expect(tool.handler).toBeDefined();
    expect(typeof tool.handler).toBe('function');
  });

  test('should create performance analysis tool', () => {
    const tool = taskExecutionTools.createPerformanceAnalysisTool();
    expect(tool).toBeDefined();
    expect(tool.name).toBe('analyze_performance');
    expect(tool.config).toBeDefined();
    expect(tool.handler).toBeDefined();
    expect(typeof tool.handler).toBe('function');
  });

  test('should create compliance check tool', () => {
    const tool = taskExecutionTools.createComplianceCheckTool();
    expect(tool).toBeDefined();
    expect(tool.name).toBe('check_compliance');
    expect(tool.config).toBeDefined();
    expect(tool.handler).toBeDefined();
    expect(typeof tool.handler).toBe('function');
  });

  test('should handle data query tool execution', async () => {
    const tool = taskExecutionTools.createDataQueryTool();
    const args = {
      system: 'sales_db',
      query: 'SELECT * FROM customers',
      format: 'json'
    };
    
    const result = await tool.handler(args);
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0].type).toBe('text');
    expect(typeof result.content[0].text).toBe('string');
  });

  test('should handle data update tool execution', async () => {
    const tool = taskExecutionTools.createDataUpdateTool();
    const args = {
      system: 'inventory_db',
      operation: 'update',
      table: 'products',
      data: { price: 29.99 },
      conditions: { id: 123 }
    };
    
    const result = await tool.handler(args);
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0].type).toBe('text');
    expect(typeof result.content[0].text).toBe('string');
  });

  test('should handle pod collaboration tool execution', async () => {
    const tool = taskExecutionTools.createPodCollaborationTool();
    const args = {
      podName: 'Data Science Pod',
      requestType: 'information',
      description: 'Need customer analytics report',
      priority: 'high',
      deadline: '2025-12-31'
    };
    
    const result = await tool.handler(args);
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0].type).toBe('text');
    expect(typeof result.content[0].text).toBe('string');
  });

  test('should handle resource allocation tool execution', async () => {
    const tool = taskExecutionTools.createResourceAllocationTool();
    const args = {
      resourceType: 'human',
      resourceName: 'John Doe',
      allocationPercentage: 50,
      projectId: 'project-123',
      startDate: '2025-10-01',
      endDate: '2025-12-31'
    };
    
    const result = await tool.handler(args);
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0].type).toBe('text');
    expect(typeof result.content[0].text).toBe('string');
  });

  test('should handle performance analysis tool execution', async () => {
    const tool = taskExecutionTools.createPerformanceAnalysisTool();
    const args = {
      metricType: 'agent',
      metricName: 'response_time',
      timeRange: 'month',
      comparisonPeriod: 'previous'
    };
    
    const result = await tool.handler(args);
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0].type).toBe('text');
    expect(typeof result.content[0].text).toBe('string');
  });

  test('should handle compliance check tool execution', async () => {
    const tool = taskExecutionTools.createComplianceCheckTool();
    const args = {
      policyArea: 'data_privacy',
      checkType: 'automated',
      scope: 'system',
      resourceId: 'resource-123'
    };
    
    const result = await tool.handler(args);
    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0].type).toBe('text');
    expect(typeof result.content[0].text).toBe('string');
  });
});