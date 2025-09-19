# AI Agent Organization System

An implementation of the organizational structure defined in the [ceo.json](ceo.json) file, representing a cognitive corporation with AI-augmented agents at all levels.

## Overview

This project implements an AI Agent organization system based on the structure defined in [ceo.json](ceo.json). The system includes a complete backend API with Express.js and a React frontend dashboard for visualization and management.

### Key Features

- Complete organizational hierarchy with Executive, Director, Manager, and Individual Contributor layers
- Cross-functional Pods for project-based collaboration
- AI Governance Council for ethical oversight
- Data Integration System for cross-departmental data flows
- Technology Stack Management
- Multi-Party Computation (MPC) for secure distributed computing
- Model Context Protocol (MCP) servers for agent communication
- Task Management system
- Natural Language Interface for human-AI interaction
- Real-time monitoring and analytics dashboard

## Architecture

The system is organized into the following modules:

```
src/
├── agents/
│   ├── executive/
│   ├── director/
│   ├── manager/
│   └── individual-contributor/
├── pods/
├── governance/
├── integration/
│   └── external/
├── mpc/
├── mcp-servers/
├── llm/
├── tasks/
└── utils/
```

## Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd ai-agent-implementation
   ```
3. Install backend dependencies:
   ```bash
   npm install
   ```
4. Install frontend dependencies:
   ```bash
   cd frontend && npm install
   ```

## Configuration

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update the `.env` file with your API keys for LLM providers (OpenAI, Anthropic, Groq, Mistral) if you want to enable AI features.

## Usage

### Backend Server

To start the backend server:
```bash
npm start
```

To start the backend server in development mode with auto-restart:
```bash
npm run dev
```

The backend server will start on port 3000 by default.

### Frontend Dashboard

To start the frontend dashboard:
```bash
npm run frontend
```

The frontend will start on port 3001 by default and proxy API requests to the backend on port 3000.

## API Endpoints

### Core Organization Endpoints
- `GET /` - Health check and system information
- `GET /api/agents/executive` - Get all executive agents
- `GET /api/agents/director` - Get all director agents
- `GET /api/agents/manager` - Get all manager agents
- `GET /api/agents/individual-contributor` - Get all individual contributor roles
- `GET /api/pods` - Get all cross-functional pods
- `GET /api/governance/ai-council` - Get AI governance council information
- `GET /api/integration/data-flows` - Get data integration flows
- `GET /api/technology/stack` - Get technology stack information

### MPC (Multi-Party Computation) Endpoints
- `GET /api/mpc/servers` - Get all MPC servers
- `GET /api/mpc/servers/:name` - Get specific MPC server
- `POST /api/mpc/servers` - Create new MPC server
- `DELETE /api/mpc/servers/:name` - Remove MPC server
- `POST /api/mpc/compute` - Execute secure computation
- `GET /api/mpc/security/policies` - Get security policies
- `POST /api/mpc/security/policies` - Define security policy
- `GET /api/mpc/security/audit-logs` - Get audit logs
- `GET /api/mpc/security/report` - Get security report

### MCP (Model Context Protocol) Endpoints
- `GET /api/mcp/servers` - Get all MCP servers
- `GET /api/mcp/clients` - Get all MCP clients
- `GET /api/mcp/info` - Get MCP system information

### LLM (Large Language Model) Endpoints
- `GET /api/llm/providers` - Get available LLM providers
- `POST /api/llm/query` - Process natural language query
- `POST /api/llm/parse-task` - Parse task request from natural language

### Task Management Endpoints
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/assignee/:assignee` - Get tasks by assignee
- `GET /api/tasks/status/:status` - Get tasks by status

### External Application Integration Endpoints
- `GET /api/integration/external-applications` - Get all external applications
- `GET /api/integration/external-applications/:id` - Get specific external application
- `GET /api/integration/external-applications/search/:term` - Search external applications
- `GET /api/integration/external-applications/category/:category` - Get applications by category
- `POST /api/integration/external-applications/:id/connect` - Connect to external application
- `POST /api/integration/external-applications/:id/disconnect` - Disconnect from external application
- `GET /api/integration/external-applications/:id/status` - Get connection status

## Project Structure

Based on the ceo.json file, the organization includes:

### Executive Layer (C-Suite)
- Chief Executive Officer (CEO)
- Chief Operating Officer (COO)
- Chief Marketing Officer (CMO)
- Chief Financial Officer (CFO)
- Chief Information Officer (CIO)
- Chief Technology Officer (CTO)
- Chief Communications Officer (CCO)
- Chief Digital Officer (CDO)
- Chief Security Officer (CSO)
- Chief Procurement Officer (CPO)
- Chief Green Officer (CGO/CECO)

Each executive has multiple sub-agents supporting their function.

### Director Layer (VPs)
- VP of Engineering

### Manager Layer
- Engineering Manager

### Individual Contributor Layer
- Software Engineer
- Data Analyst
- Growth Marketer
- UX Designer
- SOC Analyst

### Cross-functional Pods
- Pod 'Alpha' (Mobile App Development)

### AI Governance Council
Oversees ethical, secure, and effective implementation of AI across the organization.

## Technology Stack

The system implements the following technology categories:
- Communication
- Collaboration
- Project Management
- CRM
- Data Warehouse
- BI Analytics
- DevOps
- AI Platform

## Security Features

- Multi-Party Computation (MPC) for secure distributed computing
- Model Context Protocol (MCP) for secure agent communication
- End-to-end encryption for sensitive data
- Audit logging for all system activities
- Security policy enforcement
- Secure external application integration

## License

This project is licensed under the MIT License.