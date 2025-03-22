import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class ClickUpMcpApi implements ICredentialType {
  name = 'clickUpMcpApi';
  displayName = 'ClickUp MCP API';
  documentationUrl = 'https://clickup.com/api';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      default: '',
      description: 'Your ClickUp API key',
      required: true,
    },
    {
      displayName: 'Team ID',
      name: 'teamId',
      type: 'string',
      default: '',
      description: 'Your ClickUp Team ID',
      required: true,
    },
    {
      displayName: 'Environment Variables',
      name: 'environmentVariables',
      type: 'string',
      default: '',
      description: 'Add environment variables in NAME=VALUE format (separated by comma, space or new line)',
      required: false,
      typeOptions: {
        rows: 4,
      },
    },
  ];
}