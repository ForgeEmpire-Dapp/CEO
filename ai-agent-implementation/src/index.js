const express = require('express');
const dotenv = require('dotenv');
const winston = require('winston');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

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

// Initialize agents and modules
const executiveAgent = new ExecutiveAgent(logger);
const directorAgent = new DirectorAgent(logger);
const managerAgent = new ManagerAgent(logger);
const individualContributorAgent = new IndividualContributorAgent(logger);
const podManager = new PodManager(logger);
const aiGovernanceCouncil = new AIGovernanceCouncil(logger);
const dataIntegration = new DataIntegration(logger);
const technologyStack = new TechnologyStack(logger);

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`AI Agent Organization System running on port ${PORT}`);
  console.log(`AI Agent Organization System running on port ${PORT}`);
});

module.exports = app;