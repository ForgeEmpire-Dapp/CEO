const MPCManager = require('./MPCManager');
const winston = require('winston');

// Create a simple logger for testing
const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

describe('MPCManager', () => {
  let mpcManager;
  let testParties;

  beforeEach(() => {
    mpcManager = new MPCManager(logger);
    testParties = [
      { id: 'party1', name: 'Party 1', authenticated: true },
      { id: 'party2', name: 'Party 2', authenticated: true },
      { id: 'party3', name: 'Party 3', authenticated: true }
    ];
  });

  describe('Server Management', () => {
    test('should create a new MPC server', () => {
      const server = mpcManager.createServer('Test Server', 'Test MPC Server', testParties);
      
      expect(server).toBeDefined();
      expect(server.name).toBe('Test Server');
      expect(mpcManager.servers).toHaveLength(1);
    });

    test('should get all MPC servers', () => {
      mpcManager.createServer('Server 1', 'First test server', testParties);
      mpcManager.createServer('Server 2', 'Second test server', testParties);
      
      const servers = mpcManager.getAllServers();
      expect(servers).toHaveLength(2);
      expect(servers[0].name).toBe('Server 1');
      expect(servers[1].name).toBe('Server 2');
    });

    test('should get a specific MPC server by name', () => {
      mpcManager.createServer('Test Server', 'Test MPC Server', testParties);
      
      const server = mpcManager.getServerByName('Test Server');
      expect(server).not.toBeNull();
      expect(server.name).toBe('Test Server');
      
      const nonExistentServer = mpcManager.getServerByName('Non-existent Server');
      expect(nonExistentServer).toBeNull();
    });

    test('should remove an MPC server', () => {
      mpcManager.createServer('Server to Remove', 'Server to be removed', testParties);
      expect(mpcManager.servers).toHaveLength(1);
      
      const removedServer = mpcManager.removeServer('Server to Remove');
      expect(removedServer).not.toBeNull();
      expect(mpcManager.servers).toHaveLength(0);
      
      const nonExistentRemoval = mpcManager.removeServer('Non-existent Server');
      expect(nonExistentRemoval).toBeNull();
    });
  });

  describe('Task Execution', () => {
    test('should execute a task on a specific server', async () => {
      const server = mpcManager.createServer('Test Server', 'Test MPC Server', testParties);
      
      const result = await mpcManager.executeTaskOnServer(
        'Test Server', 
        'addition', 
        { operation: 'add', values: [10, 20] }
      );
      
      expect(result).toBeDefined();
      expect(result.status).toBe('success');
      expect(result.task).toBe('addition');
    });

    test('should execute a task across all servers', async () => {
      mpcManager.createServer('Server 1', 'First test server', testParties);
      mpcManager.createServer('Server 2', 'Second test server', testParties);
      
      const results = await mpcManager.executeTask(
        'addition', 
        { operation: 'add', values: [10, 20] }
      );
      
      expect(results).toHaveLength(2);
      expect(results[0].status).toBe('success');
      expect(results[1].status).toBe('success');
    });

    test('should handle errors when executing tasks on non-existent servers', async () => {
      await expect(
        mpcManager.executeTaskOnServer(
          'Non-existent Server', 
          'addition', 
          { operation: 'add', values: [10, 20] }
        )
      ).rejects.toThrow("MPC Server 'Non-existent Server' not found");
    });
  });

  describe('Security and Governance', () => {
    test('should have default security policies', () => {
      const policies = mpcManager.getSecurityGovernance().getPolicies();
      expect(policies).toHaveLength(3); // default, high-sensitivity, medium-sensitivity
      expect(policies.some(p => p.id === 'default')).toBe(true);
      expect(policies.some(p => p.id === 'high-sensitivity')).toBe(true);
      expect(policies.some(p => p.id === 'medium-sensitivity')).toBe(true);
    });

    test('should validate operations against security policies', async () => {
      const server = mpcManager.createServer('Test Server', 'Test MPC Server', testParties);
      
      // This should pass validation
      const result = await mpcManager.executeTaskOnServer(
        'Test Server', 
        'addition', 
        { operation: 'add', values: [10, 20] },
        'medium'
      );
      
      expect(result).toBeDefined();
      expect(result.status).toBe('success');
    });

    test('should generate security reports', () => {
      const report = mpcManager.getSecurityReport();
      
      expect(report).toBeDefined();
      expect(report.generatedAt).toBeDefined();
      expect(report.totalPolicies).toBe(3);
      expect(report.complianceStatus).toBeDefined();
    });

    test('should retrieve audit logs', () => {
      // Execute a task to generate some audit logs
      mpcManager.createServer('Test Server', 'Test MPC Server', testParties);
      
      const logs = mpcManager.getAuditLogs();
      expect(logs).toBeDefined();
      expect(Array.isArray(logs)).toBe(true);
    });
  });
});