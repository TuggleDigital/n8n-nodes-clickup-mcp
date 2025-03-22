# n8n-nodes-clickup-mcp

This is an n8n community node that provides ClickUp integration using the Model Context Protocol (MCP). It allows you to interact with ClickUp's API within your n8n workflows.

## Features

- List available ClickUp tools
- Create tasks in ClickUp
- Get tasks from a specific list
- Get spaces in a team
- Get lists in a space

## Installation

Follow these steps to install this custom node:

### Option 1: Install via npm
```bash
npm install n8n-nodes-clickup-mcp
```

### Option 2: Install via n8n UI
1. Go to **Settings > Community Nodes**
2. Click on **Install**
3. Enter `n8n-nodes-clickup-mcp` and click **Install**

## Environment Variables Setup

### DigitalOcean Setup

If you're running n8n on DigitalOcean with Docker, you can set the necessary environment variables in your `docker-compose.yml` file:

```yaml
version: '3'
services:
  n8n:
    image: n8nio/n8n
    environment:
      - MCP_CLICKUP_API_KEY=your-clickup-api-key
      - MCP_CLICKUP_TEAM_ID=your-clickup-team-id
      # Enable community nodes as tools
      - N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
    ports:
      - "5678:5678"
    volumes:
      - ~/.n8n:/home/node/.n8n
```

## Configuration

1. Add a new ClickUp MCP node to your workflow
2. Set up credentials:
   - **API Key**: Your ClickUp API key
   - **Team ID**: Your ClickUp team ID
   - **Environment Variables**: Optional environment variables in NAME=VALUE format

## Operations

### List Tools
Lists all available ClickUp tools that can be used in your workflow.

### Execute Tool
Executes a specific ClickUp tool with the provided parameters.

Available tools:
- **Create Task**: Create a new task in ClickUp
- **Get Tasks**: Get tasks from a specific list
- **Get Spaces**: Get spaces in a team
- **Get Lists**: Get lists in a space

## Using with AI Agents

To use this node as a tool in n8n AI Agents, set the following environment variable:

```
N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
```

## License

MIT
