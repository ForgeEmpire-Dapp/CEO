const MPCServer = require('./MPCServer');
const winston = require('winston');

// Create a simple logger for testing
const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

describe('MPCServer', () => {
  let mpcServer;
  let testParties;

  beforeEach(() => {
    testParties = [
      { id: 'party1', name: 'Party 1', authenticated: true },
      { id: 'party2', name: 'Party 2', authenticated: true },
      { id: 'party3', name: 'Party 3', authenticated: true }
    ];
    
    mpcServer = new MPCServer('Test MPC Server', 'Test MPC Server for unit tests', logger, testParties);
  });

  describe('Constructor', () => {
    test('should create an MPC server with correct properties', () => {
      expect(mpcServer.name).toBe('Test MPC Server');
      expect(mpcServer.description).toBe('Test MPC Server for unit tests');
      expect(mpcServer.parties).toEqual(testParties);
      expect(mpcServer.tools).toContain('Secure Computation');
      expect(mpcServer.tools).toContain('Distributed Processing');
      expect(mpcServer.tools).toContain('Autonomous Execution');
    });
  });

  describe('Party Management', () => {
    test('should add a party to the computation', () => {
      const newParty = { id: 'party4', name: 'Party 4', authenticated: true };
      mpcServer.addParty(newParty);
      
      expect(mpcServer.parties).toContainEqual(newParty);
      expect(mpcServer.parties).toHaveLength(4);
    });

    test('should remove a party from the computation', () => {
      mpcServer.removeParty('party2');
      
      expect(mpcServer.parties).toHaveLength(2);
      expect(mpcServer.parties.find(p => p.id === 'party2')).toBeUndefined();
    });
  });

  describe('Autonomous Task Execution', () => {
    test('should enable and disable autonomous mode', () => {
      expect(mpcServer.autonomousMode).toBe(false);
      
      mpcServer.enableAutonomousMode();
      expect(mpcServer.autonomousMode).toBe(true);
      
      mpcServer.disableAutonomousMode();
      expect(mpcServer.autonomousMode).toBe(false);
    });

    test('should add tasks to the queue', () => {
      const taskId = mpcServer.addTaskToQueue('test-task', { data: 'test' }, 1);
      
      expect(mpcServer.taskQueue).toHaveLength(1);
      expect(mpcServer.taskQueue[0].id).toBe(taskId);
      expect(mpcServer.taskQueue[0].task).toBe('test-task');
      expect(mpcServer.taskQueue[0].priority).toBe(1);
    });

    test('should prioritize tasks in the queue', () => {
      mpcServer.addTaskToQueue('low-priority-task', { data: 'test1' }, 1);
      mpcServer.addTaskToQueue('high-priority-task', { data: 'test2' }, 5);
      mpcServer.addTaskToQueue('medium-priority-task', { data: 'test3' }, 3);
      
      // Queue should be ordered by priority (highest first)
      expect(mpcServer.taskQueue[0].task).toBe('high-priority-task');
      expect(mpcServer.taskQueue[1].task).toBe('medium-priority-task');
      expect(mpcServer.taskQueue[2].task).toBe('low-priority-task');
    });

    test('should cancel queued tasks', () => {
      const taskId = mpcServer.addTaskToQueue('test-task', { data: 'test' });
      expect(mpcServer.taskQueue).toHaveLength(1);
      
      const cancelledTask = mpcServer.cancelQueuedTask(taskId);
      expect(cancelledTask).not.toBeNull();
      expect(mpcServer.taskQueue).toHaveLength(0);
    });
  });

  describe('Secure Computation', () => {
    test('should initialize computation with a unique ID', () => {
      const computationId = mpcServer.initializeComputation('test-task');
      
      expect(computationId).toBeDefined();
      expect(typeof computationId).toBe('string');
      expect(mpcServer.computationId).toBe(computationId);
    });

    test('should generate shares for parties', () => {
      const inputData = { value: 42 };
      const share = mpcServer.generateShare(inputData, 'party1');
      
      expect(share).toBeDefined();
      expect(share.value).toEqual(inputData);
      expect(share.partyId).toBe('party1');
      expect(share.timestamp).toBeDefined();
    });

    test('should execute secure computation successfully', async () => {
      const result = await mpcServer.executeSecureComputation('addition', { operation: 'add', values: [10, 20] });
      
      expect(result).toBeDefined();
      expect(result.status).toBe('success');
      expect(result.computationId).toBeDefined();
      expect(result.task).toBe('addition');
      expect(result.result).toBeDefined();
    });

    test('should handle computation errors gracefully', async () => {
      // Mock a failure scenario by removing all parties
      mpcServer.parties = [];
      
      const result = await mpcServer.executeSecureComputation('addition', { operation: 'add', values: [10, 20] });
      
      expect(result).toBeDefined();
      expect(result.status).toBe('error');
      expect(result.error).toBeDefined();
    });
  });

  describe('Information Retrieval', () => {
    test('should provide MPC server information', () => {
      const info = mpcServer.getMPCInfo();
      
      expect(info).toBeDefined();
      expect(info.name).toBe('Test MPC Server');
      expect(info.description).toBe('Test MPC Server for unit tests');
      expect(info.parties).toHaveLength(3);
      expect(info.protocol).toBe('shamir-secret-sharing');
      expect(info.autonomousMode).toBe(false);
      expect(info.queueLength).toBe(0);
    });
  });
});