const ExecutiveAgent = require('./ExecutiveAgent');

// Mock logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

describe('ExecutiveAgent', () => {
  let executiveAgent;

  beforeEach(() => {
    executiveAgent = new ExecutiveAgent(mockLogger);
  });

  test('should initialize with correct number of agents', () => {
    const agents = executiveAgent.getAllAgents();
    // Based on the ceo.json file, there should be 11 executive agents
    expect(agents.length).toBe(11);
  });

  test('should find CEO agent', () => {
    const ceo = executiveAgent.getAgentByName('Chief Executive Officer (CEO)');
    expect(ceo).not.toBeNull();
    expect(ceo.name).toBe('Chief Executive Officer (CEO)');
  });

  test('should return null for non-existent agent', () => {
    const agent = executiveAgent.getAgentByName('Non-existent Agent');
    expect(agent).toBeNull();
  });

  test('should have correct tools for CEO', () => {
    const ceo = executiveAgent.getAgentByName('Chief Executive Officer (CEO)');
    expect(ceo.tools).toContain('Cascade (Strategic Planning)');
    expect(ceo.tools).toContain('Tableau (Executive Dashboards)');
    expect(ceo.tools).toContain('BoardVantage (Board Management)');
  });

  test('should have correct key metrics for CEO', () => {
    const ceo = executiveAgent.getAgentByName('Chief Executive Officer (CEO)');
    expect(ceo.keyMetrics).toContain('Market Cap');
    expect(ceo.keyMetrics).toContain('ROI');
    expect(ceo.keyMetrics).toContain('ESG Score');
    expect(ceo.keyMetrics).toContain('Employee NPS');
  });
});