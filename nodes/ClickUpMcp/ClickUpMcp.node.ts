import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

export class ClickUpMcp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ClickUp MCP',
		name: 'clickUpMcp',
		icon: 'file:clickup.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Use ClickUp with Model Context Protocol (MCP)',
		defaults: {
			name: 'ClickUp MCP',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'clickUpMcpApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'List Tools',
						value: 'listTools',
						description: 'List all available tools in ClickUp MCP',
						action: 'List all available tools',
					},
					{
						name: 'Execute Tool',
						value: 'executeTool',
						description: 'Execute a specific ClickUp tool',
						action: 'Execute a specific tool',
					},
				],
				default: 'listTools',
			},
			{
				displayName: 'Tool',
				name: 'tool',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['executeTool'],
					},
				},
				options: [
					{
						name: 'Create Task',
						value: 'createTask',
						description: 'Create a new task in ClickUp',
					},
					{
						name: 'Get Tasks',
						value: 'getTasks',
						description: 'Get tasks from ClickUp',
					},
					{
						name: 'Get Spaces',
						value: 'getSpaces',
						description: 'Get spaces in a ClickUp team',
					},
					{
						name: 'Get Lists',
						value: 'getLists',
						description: 'Get lists in a ClickUp space',
					},
				],
				default: 'createTask',
				required: true,
			},
			// Parameters for Create Task
			{
				displayName: 'List ID',
				name: 'listId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['executeTool'],
						tool: ['createTask'],
					},
				},
				description: 'The ID of the list to create the task in',
			},
			{
				displayName: 'Task Name',
				name: 'taskName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['executeTool'],
						tool: ['createTask'],
					},
				},
				description: 'The name of the task',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						operation: ['executeTool'],
						tool: ['createTask'],
					},
				},
				description: 'The description of the task',
			},
			// Parameters for Get Tasks
			{
				displayName: 'List ID',
				name: 'listId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['executeTool'],
						tool: ['getTasks'],
					},
				},
				description: 'The ID of the list to get tasks from',
			},
			// Parameters for Get Spaces
			{
				displayName: 'Team ID',
				name: 'teamId',
				type: 'string',
				default: '={{$credentials.clickUpMcpApi.teamId}}',
				required: true,
				displayOptions: {
					show: {
						operation: ['executeTool'],
						tool: ['getSpaces'],
					},
				},
				description: 'The ID of the team to get spaces from',
			},
			// Parameters for Get Lists
			{
				displayName: 'Space ID',
				name: 'spaceId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['executeTool'],
						tool: ['getLists'],
					},
				},
				description: 'The ID of the space to get lists from',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		
		const credentials = await this.getCredentials('clickUpMcpApi');
		const apiKey = credentials.apiKey as string;
		const teamId = credentials.teamId as string;
		
		// Parse environment variables if provided
		const envVariables = credentials.environmentVariables as string || '';
		const envVars: { [key: string]: string } = {};
		
		if (envVariables) {
			const vars = envVariables.split(/[\s,]+/);
			for (const v of vars) {
				const [key, value] = v.split('=');
				if (key && value) {
					envVars[key.trim()] = value.trim();
				}
			}
		}
		
		const operation = this.getNodeParameter('operation', 0) as string;
		
		try {
			if (operation === 'listTools') {
				// Return a list of available tools
				const tools = [
					{
						name: 'createTask',
						description: 'Create a new task in ClickUp',
						parameters: {
							type: 'object',
							properties: {
								listId: {
									type: 'string',
									description: 'The ID of the list to create the task in',
								},
								taskName: {
									type: 'string',
									description: 'The name of the task',
								},
								description: {
									type: 'string',
									description: 'The description of the task',
								},
							},
							required: ['listId', 'taskName'],
						},
					},
					{
						name: 'getTasks',
						description: 'Get tasks from a ClickUp list',
						parameters: {
							type: 'object',
							properties: {
								listId: {
									type: 'string',
									description: 'The ID of the list to get tasks from',
								},
							},
							required: ['listId'],
						},
					},
					{
						name: 'getSpaces',
						description: 'Get spaces in a ClickUp team',
						parameters: {
							type: 'object',
							properties: {
								teamId: {
									type: 'string',
									description: 'The ID of the team to get spaces from',
								},
							},
							required: ['teamId'],
						},
					},
					{
						name: 'getLists',
						description: 'Get lists in a ClickUp space',
						parameters: {
							type: 'object',
							properties: {
								spaceId: {
									type: 'string',
									description: 'The ID of the space to get lists from',
								},
							},
							required: ['spaceId'],
						},
					},
				];
				
				returnData.push({ json: { tools } });
				
			} else if (operation === 'executeTool') {
				const tool = this.getNodeParameter('tool', 0) as string;
				
				// Set up the API client with ClickUp API key
				const apiClient = axios.create({
					baseURL: 'https://api.clickup.com/api/v2',
					headers: {
						'Authorization': apiKey,
						'Content-Type': 'application/json',
					},
				});
				
				switch (tool) {
					case 'createTask': {
						const listId = this.getNodeParameter('listId', 0) as string;
						const taskName = this.getNodeParameter('taskName', 0) as string;
						const description = this.getNodeParameter('description', 0) as string;
						
						const response = await apiClient.post(`/list/${listId}/task`, {
							name: taskName,
							description: description || undefined,
						});
						
						returnData.push({
							json: response.data,
						});
						break;
					}
					
					case 'getTasks': {
						const listId = this.getNodeParameter('listId', 0) as string;
						
						const response = await apiClient.get(`/list/${listId}/task`);
						
						returnData.push({
							json: response.data,
						});
						break;
					}
					
					case 'getSpaces': {
						const teamIdToUse = this.getNodeParameter('teamId', 0) as string;
						
						const response = await apiClient.get(`/team/${teamIdToUse}/space`);
						
						returnData.push({
							json: response.data,
						});
						break;
					}
					
					case 'getLists': {
						const spaceId = this.getNodeParameter('spaceId', 0) as string;
						
						const response = await apiClient.get(`/space/${spaceId}/list`);
						
						returnData.push({
							json: response.data,
						});
						break;
					}
					
					default:
						throw new NodeOperationError(this.getNode(), `The tool "${tool}" is not implemented yet.`);
				}
			}
		} catch (error) {
			if (error.response) {
				throw new NodeOperationError(this.getNode(), `ClickUp API error: ${error.response.data.message || error.message}`);
			}
			throw error;
		}
		
		return [returnData];
	}
}