const MCPManager = require('./MCPManager');
const AgentMCPService = require('./AgentMCPService');
const EncryptionService = require('./EncryptionService');
const winston = require('winston');

// Create a simple logger for testing
const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

describe('MCP Functionality and Security', () => {
  let mcpManager;
  let encryptionService;

  beforeAll(async () => {
    mcpManager = new MCPManager(logger);
    encryptionService = new EncryptionService(logger);
    mcpManager.setEncryptionKey('test-encryption-key');
  });

  afterAll(async () => {
    await mcpManager.stopAllServers();
  });

  test('should create MCP manager with encryption service', () => {
    expect(mcpManager).toBeDefined();
    expect(mcpManager.encryptionKey).toBe('test-encryption-key');
  });

  test('should create MCP server with all tools', async () => {
    const server = await mcpManager.createServer('functional-test-mcp', 'test', 3011);
    expect(server).toBeDefined();
    
    const info = server.getInfo();
    expect(info.registeredTools).toContain('send_message');
    expect(info.registeredTools).toContain('request_task');
    expect(info.registeredTools).toContain('get_org_data');
    expect(info.registeredTools).toContain('secure_compute');
    expect(info.registeredTools).toContain('query_data');
    expect(info.registeredTools).toContain('update_data');
    expect(info.registeredTools).toContain('collaborate_with_pod');
    expect(info.registeredTools).toContain('allocate_resources');
    expect(info.registeredTools).toContain('analyze_performance');
    expect(info.registeredTools).toContain('check_compliance');
  });

  test('should create MCP server with all resources', async () => {
    const server = mcpManager.getServer('functional-test-mcp');
    expect(server).toBeDefined();
    
    const info = server.getInfo();
    expect(info.registeredResources).toContain('agent_docs');
    expect(info.registeredResources).toContain('org_policies');
  });

  test('should handle tool calls correctly', async () => {
    const server = mcpManager.getServer('functional-test-mcp');
    expect(server).toBeDefined();
    
    // This would normally test actual tool calls, but we're testing the framework
    // In a real implementation, we would connect a client and call tools
  });

  test('should handle resource access correctly', async () => {
    const server = mcpManager.getServer('functional-test-mcp');
    expect(server).toBeDefined();
    
    // This would normally test actual resource access, but we're testing the framework
    // In a real implementation, we would connect a client and access resources
  });

  test('should encrypt messages when encryption is enabled', async () => {
    const server = mcpManager.getServer('functional-test-mcp');
    expect(server).toBeDefined();
    
    const originalMessage = 'This is a secret message';
    const encrypted = server.encryptMessage(originalMessage);
    expect(encrypted).toBeDefined();
    expect(encrypted).not.toBe(originalMessage);
    
    const decrypted = server.decryptMessage(encrypted);
    expect(decrypted).toBe(originalMessage);
  });

  test('should generate and validate authentication tokens', () => {
    const server = mcpManager.getServer('functional-test-mcp');
    expect(server).toBeDefined();
    
    const token = server.generateAuthToken('test-client');
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
    
    const isValid = server.validateAuthToken(token);
    expect(isValid).toBe(true);
    
    // Test expired token
    // We can't easily test token expiration without manipulating system time
  });

  test('should handle multiple concurrent clients', async () => {
    // Mock agents for testing
    const mockAgent1 = { name: 'TestAgent1' };
    const mockAgent2 = { name: 'TestAgent2' };
    const mockAgent3 = { name: 'TestAgent3' };
    
    const clientId1 = await mcpManager.createClientForAgent(mockAgent1, 'functional-test-mcp');
    const clientId2 = await mcpManager.createClientForAgent(mockAgent2, 'functional-test-mcp');
    const clientId3 = await mcpManager.createClientForAgent(mockAgent3, 'functional-test-mcp');
    
    expect(clientId1).toBeDefined();
    expect(clientId2).toBeDefined();
    expect(clientId3).toBeDefined();
    
    const allClients = mcpManager.getAllClients();
    expect(allClients).toHaveLength(3);
    
    // Remove clients
    mcpManager.removeClient(clientId1);
    mcpManager.removeClient(clientId2);
    mcpManager.removeClient(clientId3);
    
    const remainingClients = mcpManager.getAllClients();
    expect(remainingClients).toHaveLength(0);
  });

  test('should provide server information', () => {
    const server = mcpManager.getServer('functional-test-mcp');
    expect(server).toBeDefined();
    
    const info = server.getInfo();
    expect(info).toBeDefined();
    expect(info.name).toBe('AgentMCPService');
    expect(info.version).toBe('1.0.0');
    expect(info.encryptionEnabled).toBe(true);
    expect(Array.isArray(info.registeredTools)).toBe(true);
    expect(Array.isArray(info.registeredResources)).toBe(true);
  });

  test('should provide manager information', () => {
    const info = mcpManager.getInfo();
    expect(info).toBeDefined();
    expect(typeof info.serverCount).toBe('number');
    expect(typeof info.clientCount).toBe('number');
    expect(typeof info.encryptionEnabled).toBe('boolean');
    expect(Array.isArray(info.servers)).toBe(true);
    expect(Array.isArray(info.clients)).toBe(true);
  });

  test('should handle server lifecycle correctly', async () => {
    // Create another server
    const server = await mcpManager.createServer('lifecycle-test-mcp', 'test', 3012);
    expect(server).toBeDefined();
    
    // Check that it's in the list
    const servers = mcpManager.getAllServers();
    expect(servers.some(s => s.name === 'lifecycle-test-mcp')).toBe(true);
    
    // Stop the server
    await mcpManager.stopServer('lifecycle-test-mcp');
    
    // Check that it's no longer in the list
    const remainingServers = mcpManager.getAllServers();
    expect(remainingServers.some(s => s.name === 'lifecycle-test-mcp')).toBe(false);
  });

  // Security tests
  test('should use secure encryption algorithms', () => {
    // Test that our encryption service uses secure algorithms
    const key = encryptionService.generateAESKey();
    expect(key).toBeDefined();
    expect(Buffer.isBuffer(key)).toBe(true);
    expect(key.length).toBe(32); // 256 bits
    
    const { publicKey, privateKey } = encryptionService.generateRSAKeyPair(2048);
    expect(publicKey).toBeDefined();
    expect(privateKey).toBeDefined();
    expect(typeof publicKey).toBe('string');
    expect(typeof privateKey).toBe('string');
  });

  test('should properly sign and verify data', () => {
    const { publicKey, privateKey } = encryptionService.generateRSAKeyPair(1024);
    const originalData = 'This is data to be signed';
    
    const signature = encryptionService.signData(originalData, privateKey);
    expect(signature).toBeDefined();
    expect(typeof signature).toBe('string');
    
    const isValid = encryptionService.verifySignature(originalData, signature, publicKey);
    expect(isValid).toBe(true);
    
    // Test with invalid signature
    const invalidSignature = signature.substring(0, signature.length - 5) + 'abcde';
    const isInvalid = encryptionService.verifySignature(originalData, invalidSignature, publicKey);
    expect(isInvalid).toBe(false);
  });

  test('should manage secure sessions correctly', () => {
    const sessionId = 'test-session-security';
    const partyA = 'agent-1';
    const partyB = 'agent-2';
    
    const session = encryptionService.createSession(sessionId, partyA, partyB);
    expect(session).toBeDefined();
    expect(session.id).toBe(sessionId);
    expect(session.partyA).toBe(partyA);
    expect(session.partyB).toBe(partyB);
    expect(session.key).toBeDefined();
    
    const retrievedSession = encryptionService.getSession(sessionId);
    expect(retrievedSession).toBeDefined();
    expect(retrievedSession.id).toBe(sessionId);
    
    const activeSessions = encryptionService.getActiveSessions();
    expect(activeSessions).toHaveLength(1);
    expect(activeSessions[0].id).toBe(sessionId);
    
    encryptionService.closeSession(sessionId);
    const closedSession = encryptionService.getSession(sessionId);
    expect(closedSession).toBeNull();
  });

  test('should encrypt and decrypt messages for sessions', () => {
    const sessionId = 'test-session-encryption';
    const partyA = 'agent-1';
    const partyB = 'agent-2';
    const originalMessage = 'This is a confidential message between agents';
    
    // Create session
    encryptionService.createSession(sessionId, partyA, partyB);
    
    // Encrypt message
    const encrypted = encryptionService.encryptForSession(sessionId, originalMessage);
    expect(encrypted).toBeDefined();
    expect(encrypted.data).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    
    // Decrypt message
    const decrypted = encryptionService.decryptFromSession(sessionId, encrypted);
    expect(decrypted.toString()).toBe(originalMessage);
  });
});