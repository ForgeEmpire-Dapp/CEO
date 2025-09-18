const MCPManager = require('./MCPManager');
const AgentMCPService = require('./AgentMCPService');
const winston = require('winston');

// Create a simple logger for testing
const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

describe('MCP Integration', () => {
  let mcpManager;
  let executiveMCP;

  beforeAll(async () => {
    mcpManager = new MCPManager(logger);
    mcpManager.setEncryptionKey('test-encryption-key');
  });

  afterAll(async () => {
    await mcpManager.stopAllServers();
  });

  test('should create MCP manager successfully', () => {
    expect(mcpManager).toBeDefined();
    expect(mcpManager.getInfo().serverCount).toBe(0);
    expect(mcpManager.getInfo().clientCount).toBe(0);
  });

  test('should create MCP server successfully', async () => {
    const server = await mcpManager.createServer('test-mcp', 'test', 3010);
    expect(server).toBeDefined();
    expect(mcpManager.getInfo().serverCount).toBe(1);
    
    const servers = mcpManager.getAllServers();
    expect(servers).toHaveLength(1);
    expect(servers[0].agentType).toBe('test');
    expect(servers[0].port).toBe(3010);
  });

  test('should get server information', () => {
    const server = mcpManager.getServer('test-mcp');
    expect(server).toBeDefined();
    
    const info = server.getInfo();
    expect(info.name).toBe('AgentMCPService');
    expect(info.version).toBe('1.0.0');
    expect(info.registeredTools).toContain('send_message');
    expect(info.registeredTools).toContain('request_task');
    expect(info.registeredTools).toContain('get_org_data');
    expect(info.registeredTools).toContain('secure_compute');
  });

  test('should enable encryption', () => {
    const server = mcpManager.getServer('test-mcp');
    const info = server.getInfo();
    expect(info.encryptionEnabled).toBe(true);
  });

  test('should register and validate auth tokens', () => {
    const server = mcpManager.getServer('test-mcp');
    const token = server.generateAuthToken('test-client');
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    
    const isValid = server.validateAuthToken(token);
    expect(isValid).toBe(true);
  });

  test('should encrypt and decrypt messages', () => {
    const server = mcpManager.getServer('test-mcp');
    const originalMessage = 'This is a secret message';
    
    const encrypted = server.encryptMessage(originalMessage);
    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(originalMessage);
    
    const decrypted = server.decryptMessage(encrypted);
    expect(decrypted).toBe(originalMessage);
  });

  test('should create and manage MCP clients', async () => {
    // Mock agent for testing
    const mockAgent = { name: 'TestAgent' };
    
    const clientId = await mcpManager.createClientForAgent(mockAgent, 'test-mcp');
    expect(clientId).toBeDefined();
    expect(typeof clientId).toBe('string');
    
    const clientInfo = mcpManager.getClientInfo(clientId);
    expect(clientInfo).toBeDefined();
    expect(clientInfo.agent.name).toBe('TestAgent');
    expect(clientInfo.serverName).toBe('test-mcp');
    
    const allClients = mcpManager.getAllClients();
    expect(allClients).toHaveLength(1);
    expect(allClients[0].agentName).toBe('TestAgent');
    expect(allClients[0].serverName).toBe('test-mcp');
    
    mcpManager.removeClient(clientId);
    const removedClient = mcpManager.getClientInfo(clientId);
    expect(removedClient).toBeNull();
  });
});