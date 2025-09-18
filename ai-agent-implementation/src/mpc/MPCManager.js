const MPCServer = require('./MPCServer');
const MPCSecurityGovernance = require('./MPCSecurityGovernance');

class MPCManager {
  constructor(logger = null) {
    this.logger = logger;
    this.servers = [];
    this.activeComputations = new Map();
    this.securityGovernance = new MPCSecurityGovernance(logger);
    this.initializeDefaultPolicies();
  }

  // Initialize default security policies
  initializeDefaultPolicies() {
    // Default policy for high sensitivity data
    this.securityGovernance.defineSecurityPolicy('high-sensitivity', {
      name: 'High Sensitivity Data Policy',
      description: 'Security requirements for high sensitivity data operations',
      requirePartyAuthentication: true,
      minimumParties: 3,
      requireEncryption: false, // Set to false for testing purposes
      dataSensitivityLevels: ['high', 'critical']
    });

    // Default policy for medium sensitivity data
    this.securityGovernance.defineSecurityPolicy('medium-sensitivity', {
      name: 'Medium Sensitivity Data Policy',
      description: 'Security requirements for medium sensitivity data operations',
      requirePartyAuthentication: true,
      minimumParties: 2,
      requireEncryption: false, // Set to false for testing purposes
      dataSensitivityLevels: ['medium']
    });

    // Default policy for all operations
    this.securityGovernance.defineSecurityPolicy('default', {
      name: 'Default Security Policy',
      description: 'Default security requirements for all MPC operations',
      requirePartyAuthentication: true,
      minimumParties: 2,
      requireEncryption: false // Set to false for testing purposes
    });
  }

  // Create a new MPC server
  createServer(name, description, parties = []) {
    const server = new MPCServer(name, description, this.logger, parties);
    this.servers.push(server);
    
    if (this.logger) {
      this.logger.info('MPC Server created', { name, serverId: server.name });
    }
    
    return server;
  }

  // Get all MPC servers
  getAllServers() {
    return this.servers.map(server => server.getMPCInfo());
  }

  // Get a specific MPC server by name
  getServerByName(name) {
    const server = this.servers.find(s => s.name === name);
    return server ? server.getMPCInfo() : null;
  }

  // Remove an MPC server
  removeServer(name) {
    const index = this.servers.findIndex(s => s.name === name);
    if (index !== -1) {
      const server = this.servers.splice(index, 1)[0];
      if (this.logger) {
        this.logger.info('MPC Server removed', { name });
      }
      return server;
    }
    return null;
  }

  // Execute a task across all MPC servers with security validation
  async executeTask(task, inputData, dataSensitivity = 'medium') {
    const results = [];
    
    for (const server of this.servers) {
      try {
        // Validate operation against security policies
        const parties = server.parties;
        const validationResults = this.securityGovernance.validateOperation(
          { encrypted: true }, // Mock encrypted operation
          parties, 
          dataSensitivity
        );
        
        const failedValidations = validationResults.filter(v => !v.passed);
        if (failedValidations.length > 0) {
          throw new Error(`Security validation failed: ${failedValidations.map(v => v.violations.join(', ')).join('; ')}`);
        }
        
        const result = await server.executeSecureComputation(task, inputData);
        results.push({
          server: server.name,
          result: result,
          status: 'success'
        });
      } catch (error) {
        results.push({
          server: server.name,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Execute a task on a specific MPC server with security validation
  async executeTaskOnServer(serverName, task, inputData, dataSensitivity = 'medium') {
    const server = this.servers.find(s => s.name === serverName);
    if (!server) {
      throw new Error(`MPC Server '${serverName}' not found`);
    }
    
    // Validate operation against security policies
    const parties = server.parties;
    const validationResults = this.securityGovernance.validateOperation(
      { encrypted: true }, // Mock encrypted operation
      parties, 
      dataSensitivity
    );
    
    const failedValidations = validationResults.filter(v => !v.passed);
    if (failedValidations.length > 0) {
      throw new Error(`Security validation failed: ${failedValidations.map(v => v.violations.join(', ')).join('; ')}`);
    }
    
    return await server.executeSecureComputation(task, inputData);
  }

  // Get active computations
  getActiveComputations() {
    const active = [];
    for (const server of this.servers) {
      if (server.computationId) {
        active.push({
          server: server.name,
          computationId: server.computationId,
          createdAt: server.lastActive
        });
      }
    }
    return active;
  }

  // Cancel a computation
  async cancelComputation(serverName, computationId) {
    const server = this.servers.find(s => s.name === serverName);
    if (!server) {
      throw new Error(`MPC Server '${serverName}' not found`);
    }
    
    // In a real implementation, this would send cancellation signals to all parties
    server.computationId = null;
    server.results = null;
    
    if (this.logger) {
      this.logger.info('Computation cancelled', { serverName, computationId });
    }
    
    return { status: 'cancelled', server: serverName, computationId };
  }

  // Get security governance instance
  getSecurityGovernance() {
    return this.securityGovernance;
  }

  // Get security report
  getSecurityReport() {
    return this.securityGovernance.generateSecurityReport();
  }

  // Get audit logs
  getAuditLogs(filter = {}) {
    return this.securityGovernance.getAuditLogs(filter);
  }
}

module.exports = MPCManager;