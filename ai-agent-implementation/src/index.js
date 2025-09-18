const express = require('express');
const dotenv = require('dotenv');
const winston = require('winston');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const DEFAULT_PORT = 3000;
const PORT = process.env.PORT || DEFAULT_PORT;

// Middleware
app.use(express.json());

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-agent-organization' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Import organizational agents
const ExecutiveAgent = require('./agents/executive/ExecutiveAgent');
const DirectorAgent = require('./agents/director/DirectorAgent');
const ManagerAgent = require('./agents/manager/ManagerAgent');
const IndividualContributorAgent = require('./agents/individual-contributor/IndividualContributorAgent');

// Import other modules
const { PodManager } = require('./pods/Pod');
const AIGovernanceCouncil = require('./governance/AIGovernance');
const DataIntegration = require('./integration/DataIntegration');
const TechnologyStack = require('./utils/TechnologyStack');

// Import MPC components
const MPCManager = require('./mpc/MPCManager');

// Import MCP components
const MCPManager = require('./mcp-servers/MCPManager');

// Initialize agents and modules
const executiveAgent = new ExecutiveAgent(logger);
const directorAgent = new DirectorAgent(logger);
const managerAgent = new ManagerAgent(logger);
const individualContributorAgent = new IndividualContributorAgent(logger);
const podManager = new PodManager(logger);
const aiGovernanceCouncil = new AIGovernanceCouncil(logger);
const dataIntegration = new DataIntegration(logger);
const technologyStack = new TechnologyStack(logger);

// Initialize MPC Manager
const mpcManager = new MPCManager(logger);

// Initialize MCP Manager with required services
const mcpManager = new MCPManager(logger, dataIntegration, podManager);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Agent Organization System',
    version: '1.0.0',
    status: 'running'
  });
});

// Agent routes
app.get('/api/agents/executive', (req, res) => {
  const agents = executiveAgent.getAllAgents();
  res.json(agents);
});

app.get('/api/agents/director', (req, res) => {
  const agents = directorAgent.getAllAgents();
  res.json(agents);
});

app.get('/api/agents/manager', (req, res) => {
  const agents = managerAgent.getAllAgents();
  res.json(agents);
});

app.get('/api/agents/individual-contributor', (req, res) => {
  const agents = individualContributorAgent.getAllAgents();
  res.json(agents);
});

// Pod routes
app.get('/api/pods', (req, res) => {
  const pods = podManager.getAllPods();
  res.json(pods);
});

// Governance routes
app.get('/api/governance/ai-council', (req, res) => {
  const council = aiGovernanceCouncil.getInfo();
  res.json(council);
});

// Integration routes
app.get('/api/integration/data-flows', (req, res) => {
  const integrations = dataIntegration.getAllIntegrations();
  res.json(integrations);
});

// Technology stack routes
app.get('/api/technology/stack', (req, res) => {
  const stack = technologyStack.getStack();
  res.json(stack);
});

// MPC routes
app.get('/api/mpc/servers', (req, res) => {
  const servers = mpcManager.getAllServers();
  res.json(servers);
});

app.get('/api/mpc/servers/:name', (req, res) => {
  const server = mpcManager.getServerByName(req.params.name);
  if (server) {
    res.json(server);
  } else {
    res.status(404).json({ error: 'MPC Server not found' });
  }
});

app.post('/api/mpc/servers', express.json(), (req, res) => {
  try {
    const { name, description, parties } = req.body;
    const server = mpcManager.createServer(name, description, parties);
    res.status(201).json(server.getMPCInfo());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/mpc/servers/:name', (req, res) => {
  const server = mpcManager.removeServer(req.params.name);
  if (server) {
    res.json({ message: 'MPC Server removed successfully' });
  } else {
    res.status(404).json({ error: 'MPC Server not found' });
  }
});

app.post('/api/mpc/compute', express.json(), async (req, res) => {
  try {
    const { serverName, task, inputData, dataSensitivity } = req.body;
    if (serverName) {
      const result = await mpcManager.executeTaskOnServer(serverName, task, inputData, dataSensitivity);
      res.json(result);
    } else {
      const results = await mpcManager.executeTask(task, inputData, dataSensitivity);
      res.json(results);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// MPC Security and Governance routes
app.get('/api/mpc/security/policies', (req, res) => {
  const policies = mpcManager.getSecurityGovernance().getPolicies();
  res.json(policies);
});

app.post('/api/mpc/security/policies', express.json(), (req, res) => {
  try {
    const { policyId, policy } = req.body;
    mpcManager.getSecurityGovernance().defineSecurityPolicy(policyId, policy);
    res.status(201).json({ message: 'Policy created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/mpc/security/audit-logs', (req, res) => {
  const filter = req.query;
  const logs = mpcManager.getAuditLogs(filter);
  res.json(logs);
});

app.get('/api/mpc/security/report', (req, res) => {
  const report = mpcManager.getSecurityReport();
  res.json(report);
});

// MCP routes
app.get('/api/mcp/servers', (req, res) => {
  const servers = mcpManager.getAllServers();
  res.json(servers);
});

app.get('/api/mcp/clients', (req, res) => {
  const clients = mcpManager.getAllClients();
  res.json(clients);
});

app.get('/api/mcp/info', (req, res) => {
  const info = mcpManager.getInfo();
  res.json(info);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Handle port in use error
app.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Trying ${PORT + 1}...`);
    setTimeout(() => {
      app.listen(PORT + 1, () => {
        logger.info(`AI Agent Organization System running on port ${PORT + 1}`);
        console.log(`AI Agent Organization System running on port ${PORT + 1}`);
      });
    }, 1000);
  } else {
    logger.error('Server error:', err);
  }
});

// Start server with error handling
const server = app.listen(PORT, () => {
  logger.info(`AI Agent Organization System running on port ${PORT}`);
  console.log(`AI Agent Organization System running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Trying ${PORT + 1}...`);
    setTimeout(() => {
      app.listen(PORT + 1, () => {
        logger.info(`AI Agent Organization System running on port ${PORT + 1}`);
        console.log(`AI Agent Organization System running on port ${PORT + 1}`);
      });
    }, 1000);
  } else {
    logger.error('Server error:', err);
  }
});

// Start MCP servers
async function startMCPServers() {
  try {
    // Set encryption key for secure communications
    mcpManager.setEncryptionKey('mcp-encryption-key-2025');
    
    // Create MCP servers for different agent types
    await mcpManager.createServer('executive-mcp', 'executive', 3002);
    await mcpManager.createServer('director-mcp', 'director', 3003);
    await mcpManager.createServer('manager-mcp', 'manager', 3004);
    await mcpManager.createServer('contributor-mcp', 'contributor', 3005);
    
    logger.info('MCP servers started successfully');
  } catch (error) {
    logger.error('Failed to start MCP servers', { error: error.message });
  }
}

// Start MCP servers
startMCPServers();

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down server...');
  
  // Stop MCP servers
  mcpManager.stopAllServers().then(() => {
    logger.info('MCP servers stopped');
    
    // Close main server
    server.close(() => {
      logger.info('Server closed.');
      process.exit(0);
    });
  }).catch(error => {
    logger.error('Error stopping MCP servers', { error: error.message });
    process.exit(1);
  });
});

module.exports = app;