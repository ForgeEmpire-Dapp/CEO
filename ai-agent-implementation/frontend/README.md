# AI Agent Organization Dashboard

This is the frontend dashboard for the AI Agent Organization system, built with React.

## Features

- Real-time visualization of AI agent organizational structure
- Monitoring of agent activities and status
- Analytics and insights dashboard
- AI Assistant powered by LLM for natural language interaction

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

To start the development server:

```bash
npm start
```

The dashboard will be available at http://localhost:3000

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/                    # Source code
│   ├── components/         # React components
│   ├── App.js              # Main App component
│   ├── App.css             # Main App styles
│   ├── index.js            # Entry point
│   └── index.css           # Global styles
├── package.json            # Project dependencies and scripts
└── README.md               # This file
```

## Components

### Dashboard
Main dashboard component with navigation between different views:
- Organization Overview
- Real-time Monitor
- Analytics
- AI Assistant

### AgentVisualization
Visual representation of the AI agent organizational hierarchy.

### RealTimeMonitor
Live feed of agent activities and actions.

### LLMInterface
Natural language interface for interacting with the AI system.

## API Integration

The frontend communicates with the backend API running on port 3000 by default. Make sure the backend server is running for full functionality.

## Environment Variables

Create a `.env` file in the frontend directory to configure environment-specific settings:

```bash
# Example .env file
REACT_APP_API_URL=http://localhost:3000
```

## Testing

To run tests:

```bash
npm test
```

## License

This project is licensed under the MIT License.