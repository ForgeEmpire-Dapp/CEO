const express = require('express');
const dotenv = require('dotenv');
const winston = require('winston');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const DEFAULT_PORT = 3000;
const PORT = process.env.PORT || DEFAULT_PORT;

// Middleware
app.use(express.json());

// Add CORS middleware to allow requests from the frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));

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

// Import LLM components
const LLMService = require('./llm/LLMService');
const AgentDecisionMaker = require('./llm/AgentDecisionMaker');
const NaturalLanguageInterface = require('./llm/NaturalLanguageInterface');

// Import TaskManager
const TaskManager = require('./tasks/TaskManager');

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

// Initialize LLM components (if any API key is available)
let llmService, agentDecisionMaker, naturalLanguageInterface;
const apiKeys = {
  openai: process.env.OPENAI_API_KEY,
  anthropic: process.env.ANTHROPIC_API_KEY,
  groq: process.env.GROQ_API_KEY,
  mistral: process.env.MISTRAL_API_KEY
};

// Check if any API key is provided
const hasAnyApiKey = Object.values(apiKeys).some(key => key && key !== 'your-openai-api-key-here' && key !== 'your-anthropic-api-key-here' && key !== 'your-groq-api-key-here' && key !== 'your-mistral-api-key-here');

if (hasAnyApiKey) {
  llmService = new LLMService(null, logger); // Pass null for openaiApiKey since we'll set all keys
  llmService.setApiKeys(apiKeys);
  agentDecisionMaker = new AgentDecisionMaker(llmService, logger);
  naturalLanguageInterface = new NaturalLanguageInterface(llmService, null, logger);
  logger.info('LLM components initialized with available API keys');
} else {
  logger.warn('No valid API keys found in environment variables - LLM features will be limited');
}

// Initialize TaskManager
const taskManager = new TaskManager(logger);

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

// New routes for external applications
app.get('/api/integration/external-applications', (req, res) => {
  const applications = dataIntegration.getAllExternalApplications();
  res.json(applications);
});

app.get('/api/integration/external-applications/:id', (req, res) => {
  const application = dataIntegration.getExternalApplicationById(req.params.id);
  if (application) {
    res.json(application);
  } else {
    res.status(404).json({ error: 'External application not found' });
  }
});

app.get('/api/integration/external-applications/search/:term', (req, res) => {
  const applications = dataIntegration.searchExternalApplications(req.params.term);
  res.json(applications);
});

app.get('/api/integration/external-applications/category/:category', (req, res) => {
  const applications = dataIntegration.getExternalApplicationsByCategory(req.params.category);
  res.json(applications);
});

app.post('/api/integration/external-applications/:id/connect', express.json(), async (req, res) => {
  try {
    const result = await dataIntegration.connectToExternalApplication(req.params.id, req.body.credentials);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/integration/external-applications/:id/disconnect', (req, res) => {
  const result = dataIntegration.disconnectFromExternalApplication(req.params.id);
  if (result) {
    res.json({ success: true, message: 'Disconnected successfully' });
  } else {
    res.status(404).json({ error: 'External application not found' });
  }
});

app.get('/api/integration/external-applications/:id/status', (req, res) => {
  const status = dataIntegration.getExternalApplicationConnectionStatus(req.params.id);
  if (status) {
    res.json(status);
  } else {
    res.status(404).json({ error: 'External application not found' });
  }
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

// LLM routes (if LLM components are available)
if (llmService && naturalLanguageInterface) {
  app.post('/api/llm/query', express.json(), async (req, res) => {
    try {
      const { query, context, options } = req.body;
      const result = await naturalLanguageInterface.processQuery(query, context, options);
      res.json(result);
    } catch (error) {
      logger.error('LLM query processing failed', { error: error.message });
      res.status(500).json({ error: 'Failed to process query' });
    }
  });

  app.post('/api/llm/parse-task', express.json(), async (req, res) => {
    try {
      const { taskRequest, options } = req.body;
      const task = await naturalLanguageInterface.parseTaskRequest(taskRequest, options);
      res.json(task);
    } catch (error) {
      logger.error('Task parsing failed', { error: error.message });
      res.status(500).json({ error: 'Failed to parse task' });
    }
  });
  
  // New route to get available LLM providers
  app.get('/api/llm/providers', (req, res) => {
    const availableProviders = [];
    
    if (apiKeys.openai && apiKeys.openai !== 'your-openai-api-key-here') {
      availableProviders.push({
        id: 'openai',
        name: 'OpenAI',
        models: [
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
          { id: 'gpt-4', name: 'GPT-4' },
          { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
        ]
      });
    }
    
    if (apiKeys.anthropic && apiKeys.anthropic !== 'your-anthropic-api-key-here') {
      availableProviders.push({
        id: 'anthropic',
        name: 'Anthropic',
        models: [
          { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
          { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
          { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' }
        ]
      });
    }
    
    if (apiKeys.groq && apiKeys.groq !== 'your-groq-api-key-here') {
      availableProviders.push({
        id: 'groq',
        name: 'Groq',
        models: [
          { id: 'llama3-8b-8192', name: 'Llama 3 8B' },
          { id: 'llama3-70b-8192', name: 'Llama 3 70B' },
          { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' }
        ]
      });
    }
    
    if (apiKeys.mistral && apiKeys.mistral !== 'your-mistral-api-key-here') {
      availableProviders.push({
        id: 'mistral',
        name: 'Mistral',
        models: [
          { id: 'mistral-tiny', name: 'Mistral Tiny' },
          { id: 'mistral-small', name: 'Mistral Small' },
          { id: 'mistral-medium', name: 'Mistral Medium' }
        ]
      });
    }
    
    res.json(availableProviders);
  });
} else {
  app.post('/api/llm/query', (req, res) => {
    res.status(501).json({ error: 'LLM functionality not available - API keys not configured' });
  });
  
  app.post('/api/llm/parse-task', (req, res) => {
    res.status(501).json({ error: 'LLM functionality not available - API keys not configured' });
  });
  
  app.get('/api/llm/providers', (req, res) => {
    res.status(501).json({ error: 'LLM functionality not available - API keys not configured' });
  });
}

// Task routes
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await taskManager.getAllTasks();
    res.json(tasks);
  } catch (error) {
    logger.error('Failed to fetch tasks', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await taskManager.getTaskById(req.params.id);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    logger.error('Failed to fetch task', { error: error.message, taskId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

app.post('/api/tasks', express.json(), async (req, res) => {
  try {
    const task = await taskManager.createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    logger.error('Failed to create task', { error: error.message });
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/api/tasks/:id', express.json(), async (req, res) => {
  try {
    const task = await taskManager.updateTask(req.params.id, req.body);
    res.json(task);
  } catch (error) {
    if (error.message === 'Task not found') {
      res.status(404).json({ error: 'Task not found' });
    } else {
      logger.error('Failed to update task', { error: error.message, taskId: req.params.id });
      res.status(500).json({ error: 'Failed to update task' });
    }
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await taskManager.deleteTask(req.params.id);
    res.json({ message: 'Task deleted successfully', task });
  } catch (error) {
    if (error.message === 'Task not found') {
      res.status(404).json({ error: 'Task not found' });
    } else {
      logger.error('Failed to delete task', { error: error.message, taskId: req.params.id });
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
});

app.get('/api/tasks/assignee/:assignee', async (req, res) => {
  try {
    const tasks = await taskManager.getTasksByAssignee(req.params.assignee);
    res.json(tasks);
  } catch (error) {
    logger.error('Failed to fetch tasks by assignee', { error: error.message, assignee: req.params.assignee });
    res.status(500).json({ error: 'Failed to fetch tasks by assignee' });
  }
});

app.get('/api/tasks/status/:status', async (req, res) => {
  try {
    const tasks = await taskManager.getTasksByStatus(req.params.status);
    res.json(tasks);
  } catch (error) {
    logger.error('Failed to fetch tasks by status', { error: error.message, status: req.params.status });
    res.status(500).json({ error: 'Failed to fetch tasks by status' });
  }
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