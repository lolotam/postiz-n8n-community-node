import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import { postoraApiRequest } from './GenericFunctions';

const platformNames: Record<string, string> = {
	x: 'X (Twitter)',
	linkedin: 'LinkedIn (Personal)',
	'linkedin-page': 'LinkedIn (Page)',
	reddit: 'Reddit',
	instagram: 'Instagram',
	'instagram-standalone': 'Instagram (Standalone)',
	facebook: 'Facebook',
	threads: 'Threads',
	youtube: 'YouTube',
	gmb: 'Google My Business',
	tiktok: 'TikTok',
	pinterest: 'Pinterest',
	dribbble: 'Dribbble',
	discord: 'Discord',
	slack: 'Slack',
	kick: 'Kick',
	twitch: 'Twitch',
	mastodon: 'Mastodon',
	bluesky: 'Bluesky',
	lemmy: 'Lemmy',
	farcaster: 'Farcaster',
	telegram: 'Telegram',
	nostr: 'Nostr',
	vk: 'VK',
	medium: 'Medium',
	'dev.to': 'Dev.to',
	hashnode: 'Hashnode',
	wordpress: 'WordPress',
	listmonk: 'Listmonk',
	moltbook: 'Moltbook',
	whop: 'Whop',
	skool: 'Skool',
	mewe: 'MeWe',
};

export class Postora2 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Postora.W.M',
		name: 'postora2',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-icon-not-svg
		icon: 'file:postora.png',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Consume Postora API',
		defaults: {
			name: 'Postora.W.M',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'postora2Api',
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
						name: 'Create Post',
						value: 'createPost',
						description: 'Schedule a post to Postora',
						action: 'Schedule a post to postora',
					},
					{
						name: 'Delete Post',
						value: 'deletePost',
						description: 'Delete a post by ID',
						action: 'Delete a post by id',
					},
					{
						name: 'Generate Video',
						value: 'generateVideo',
						description: 'Generate videos with AI',
						action: 'Generate videos with AI',
					},
					{
						name: 'Get Channels',
						value: 'getIntegrations',
						description: 'Get a list of connected channels',
						action: 'Get a list of connected channels',
					},
					{
						name: 'Get Posts',
						value: 'getPosts',
						description: 'Get a list of posts',
						action: 'Get a list of posts',
					},
					{
						name: 'Upload File',
						value: 'uploadFile',
						description: 'Upload a file to Postora',
						action: 'Upload a file to postora',
					},
					{
						name: 'Video Function',
						value: 'videoFunction',
						description: 'Execute video-related functions like loading voices',
						action: 'Execute video related functions',
					},
				],
				default: 'createPost',
			},
			// Generate Video parameters
			{
				displayName: 'Video Type',
				name: 'videoType',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['generateVideo'],
					},
				},
				default: 'image-text-slides',
				required: true,
				description: 'Type of video to generate (e.g., image-text-slides, veo3)',
			},
			{
				displayName: 'Output Format',
				name: 'output',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['generateVideo'],
					},
				},
				options: [
					{
						name: 'Vertical',
						value: 'vertical',
					},
					{
						name: 'Horizontal',
						value: 'horizontal',
					},
				],
				default: 'vertical',
				required: true,
				description: 'Video output format',
			},
			{
				displayName: 'Custom Parameters',
				name: 'customParameters',
				placeholder: 'Add Custom Parameter',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						operation: ['generateVideo'],
					},
				},
				default: {},
				options: [
					{
						name: 'parameter',
						displayName: 'Parameter',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								required: true,
								description: 'Parameter key (e.g., voice, images)',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								required: true,
								description: 'Parameter value',
							},
						],
					},
				],
				description:
					'Custom parameters for video generation (e.g., prompt: "description", voice: voice-ID, images: [{"ID":"...","path":"..."}])',
			},
			// Video Function parameters
			{
				displayName: 'Function Name',
				name: 'functionName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['videoFunction'],
					},
				},
				default: '',
				required: true,
				description: 'Video function to execute (e.g., loadVoices)',
			},
			{
				displayName: 'Identifier',
				name: 'identifier',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['videoFunction'],
					},
				},
				default: '',
				required: true,
				description: 'Identifier for the video function (e.g., image-text-slides)',
			},
			{
				displayName: 'Additional Parameters',
				name: 'additionalParameters',
				placeholder: 'Add Parameter',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						operation: ['videoFunction'],
					},
				},
				default: {},
				options: [
					{
						name: 'parameter',
						displayName: 'Parameter',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								required: true,
								description: 'Parameter key',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								required: true,
								description: 'Parameter value',
							},
						],
					},
				],
				description: 'Additional parameters for the video function',
			},
			// CreatePost parameters
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['createPost'],
					},
				},
				options: [
					{
						name: 'Draft',
						value: 'draft',
					},
					{
						name: 'Schedule',
						value: 'schedule',
					},
					{
						name: 'Now',
						value: 'now',
					},
				],
				default: 'now',
				required: true,
				description: 'Type of post to create',
			},
			{
				displayName: 'Short Link',
				name: 'shortLink',
				type: 'boolean',
				displayOptions: {
					show: {
						operation: ['createPost'],
					},
				},
				default: false,
				required: true,
				description: 'Whether to use short links',
			},
			{
				displayName: 'Date',
				name: 'date',
				type: 'dateTime',
				displayOptions: {
					show: {
						operation: ['createPost'],
						type: ['schedule'],
					},
				},
				default: '',
				description: 'Date and time for the post',
			},
			{
				displayName: 'Platform Name or ID',
				name: 'platform',
				type: 'options',
				noDataExpression: true,
				typeOptions: {
					loadOptionsMethod: 'getPlatforms',
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['createPost'],
					},
				},
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Social Account Names or IDs',
				name: 'socialAccounts',
				type: 'multiOptions',
				noDataExpression: true,
				typeOptions: {
					loadOptionsMethod: 'getAccounts',
					loadOptionsDependsOn: ['platform'],
				},
				default: [],
				required: true,
				displayOptions: {
					show: {
						operation: ['createPost'],
					},
				},
				description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['createPost'],
					},
				},
				description: 'The post caption / text content',
			},
			{
				displayName: 'Media Source',
				name: 'mediaSource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'None', value: 'none' },
					{ name: 'URL', value: 'url' },
					{ name: 'Binary Data', value: 'binary' },
				],
				default: 'none',
				displayOptions: {
					show: {
						operation: ['createPost'],
					},
				},
				description: 'How to attach media to the post',
			},
			{
				displayName: 'Media URLs',
				name: 'mediaUrls',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['createPost'],
						mediaSource: ['url'],
					},
				},
				description: 'Comma-separated media URLs',
			},
			{
				displayName: 'Binary Property',
				name: 'mediaBinaryProperty',
				type: 'string',
				default: 'data',
				displayOptions: {
					show: {
						operation: ['createPost'],
						mediaSource: ['binary'],
					},
				},
				description: 'Name of the binary property containing the media files',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				placeholder: 'Add Tag',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						operation: ['createPost'],
					},
				},
				default: {},
				options: [
					{
						name: 'tag',
						displayName: 'Tag',
						values: [
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Tag value',
							},
							{
								displayName: 'Label',
								name: 'label',
								type: 'string',
								default: '',
								description: 'Tag label',
							},
						],
					},
				],
				description: 'Tags for the post',
			},
			// GetPosts parameters
			{
				displayName: 'Start Date (UTC)',
				name: 'startDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						operation: ['getPosts'],
					},
				},
				default: '',
				required: true,
				description: 'Start date for filtering posts (UTC)',
			},
			{
				displayName: 'End Date (UTC)',
				name: 'endDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						operation: ['getPosts'],
					},
				},
				default: '',
				required: true,
				description: 'End date for filtering posts (UTC)',
			},
			{
				displayName: 'Customer',
				name: 'customer',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getPosts'],
					},
				},
				default: '',
				description: 'Customer ID for filtering posts (optional)',
			},
			// UploadFile parameters
			{
				displayName: 'Binary Property',
				name: 'binaryProperty',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['uploadFile'],
					},
				},
				default: '',
				required: true,
				description: 'Name of the binary property that contains the file data',
			},
			// DeletePost parameters
			{
				displayName: 'Post ID',
				name: 'postId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['deletePost'],
					},
				},
				default: '',
				required: true,
				description: 'ID of the post to delete',
			},
		],
	};

	methods = {
		loadOptions: {
			async getPlatforms(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const integrations = await postoraApiRequest.call(this, 'GET', '/integrations');
				const counts: Record<string, number> = {};

				if (integrations && Array.isArray(integrations)) {
					for (const integration of integrations) {
						if (integration.disabled) continue;
						const platformId = integration.identifier;
						if (platformId) {
							counts[platformId] = (counts[platformId] || 0) + 1;
						}
					}
				}

				return Object.entries(platformNames).map(([key, name]) => {
					const count = counts[key] || 0;
					return {
						name: `${name} (${count} connected)`,
						value: key,
					};
				});
			},

			async getAccounts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const platform = this.getCurrentNodeParameter('platform') as string;
				const integrations = await postoraApiRequest.call(this, 'GET', '/integrations');

				if (!integrations || !Array.isArray(integrations)) {
					return [];
				}

				return integrations
					.filter((integration: any) => integration.identifier === platform && !integration.disabled)
					.map((integration: any) => ({
						name: integration.profile || integration.name || 'Unknown Channel',
						value: integration.id,
					}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const length = items.length;
		let responseData: any = undefined;

		for (let i = 0; i < length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i);

				if (operation === 'createPost') {
					const type = this.getNodeParameter('type', i) as string;
					const shortLink = this.getNodeParameter('shortLink', i) as boolean;
					const date = this.getNodeParameter('date', i, '') as string;

					if (type === 'schedule' && !date) {
						throw new NodeOperationError(this.getNode(), 'Please provide a publish date for scheduled posts.', {
							itemIndex: i,
						});
					}
					const socialAccounts = this.getNodeParameter('socialAccounts', i) as string[];
					const caption = this.getNodeParameter('caption', i) as string;
					const mediaSource = this.getNodeParameter('mediaSource', i, 'none') as string;

					// Process tags array (only include tags with both value and label defined)
					const tagsParam = this.getNodeParameter('tags', i, {}) as any;
					const tags = tagsParam.tag
						? tagsParam.tag
								.filter((tag: any) => tag.value && tag.label)
								.map((tag: any) => ({
									value: tag.value,
									label: tag.label,
								}))
						: [];

					// Handle media uploads and mapping
					const uploadedMedia: Array<{ id: string; path: string }> = [];

					if (mediaSource === 'url') {
						const mediaUrlsStr = this.getNodeParameter('mediaUrls', i, '') as string;
						const mediaUrls = mediaUrlsStr
							.split(',')
							.map((s) => s.trim())
							.filter((s) => {
								if (!s) return false;
								try {
									new URL(s);
									return true;
								} catch {
									return false;
								}
							});

						for (const mediaUrl of mediaUrls) {
							const uploadRes = await postoraApiRequest.call(this, 'POST', '/upload-from-url', {
								url: mediaUrl,
							});
							if (uploadRes && uploadRes.id && uploadRes.path) {
								uploadedMedia.push({
									id: uploadRes.id,
									path: uploadRes.path,
								});
							}
						}
					} else if (mediaSource === 'binary') {
						const binaryProp = this.getNodeParameter('mediaBinaryProperty', i, 'data') as string;
						const binaryProps = binaryProp
							.split(',')
							.map((p) => p.trim())
							.filter(Boolean);

						for (const prop of binaryProps) {
							const bd = this.helpers.assertBinaryData(i, prop);
							const buf = await this.helpers.getBinaryDataBuffer(i, prop);
							const mimeType = bd.mimeType || 'application/octet-stream';

							const blob = new Blob([buf], { type: mimeType });
							const formData = new FormData();
							formData.append('file', blob, bd.fileName || 'upload');

							const uploadRes = await postoraApiRequest.call(this, 'POST', '/upload', formData);
							if (uploadRes && uploadRes.id && uploadRes.path) {
								uploadedMedia.push({
									id: uploadRes.id,
									path: uploadRes.path,
								});
							}
						}
					}

					// Assemble the strict Postiz payload
					// Each chosen account in socialAccounts will get a post entry in the posts array
					const posts = socialAccounts.map((accountId) => {
						return {
							integration: {
								id: accountId,
							},
							value: [
								{
									content: caption,
									id: '',
									image: uploadedMedia,
								},
							],
							group: '',
							settings: {},
						};
					});

					const body = {
						type,
						shortLink,
						date: type === 'schedule' ? date : new Date().toISOString(),
						tags,
						posts,
					};

					responseData = await postoraApiRequest.call(this, 'POST', '/posts', body);
				}

				if (operation === 'getPosts') {
					const startDate = this.getNodeParameter('startDate', i) as string;
					const endDate = this.getNodeParameter('endDate', i) as string;
					const customer = this.getNodeParameter('customer', i) as string;

					const query = {
						startDate,
						endDate,
						...(customer && { customer }),
					};

					responseData = await postoraApiRequest.call(this, 'GET', '/posts', {}, query);
				}

				if (operation === 'uploadFile') {
					const binaryPropertyName = this.getNodeParameter('binaryProperty', i) as any;
					const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
					const dataBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
					const mimeType = binaryData.mimeType || 'application/octet-stream';

					if (!dataBuffer || !binaryData) {
						throw new NodeOperationError(
							this.getNode(),
							`Item is not of type "binary" or does not contain the expected properties: data, mimeType, fileName`,
							{ itemIndex: i },
						);
					}

					const blob = new Blob([dataBuffer], {
						type: mimeType,
					});

					const formData = new FormData();
					formData.append('file', blob, binaryData.fileName);
					responseData = await postoraApiRequest.call(this, 'POST', '/upload', formData);
				}

				if (operation === 'getIntegrations') {
					responseData = await postoraApiRequest.call(this, 'GET', '/integrations');
				}

				if (operation === 'deletePost') {
					const postId = this.getNodeParameter('postId', i) as string;
					responseData = await postoraApiRequest.call(this, 'DELETE', `/posts/${postId}`);
				}

				if (operation === 'generateVideo') {
					const videoType = this.getNodeParameter('videoType', i) as string;
					const output = this.getNodeParameter('output', i) as string;
					const customParametersParam = this.getNodeParameter('customParameters', i, {}) as any;

					const body: any = {
						type: videoType,
						output,
						customParams: {},
					};

					// Add custom parameters dynamically
					if (customParametersParam.parameter && customParametersParam.parameter.length > 0) {
						customParametersParam.parameter.forEach((param: any) => {
							// Try to parse JSON values, otherwise use as string
							try {
								body.customParams[param.key] = JSON.parse(param.value);
							} catch {
								body.customParams[param.key] = param.value;
							}
						});
					}

					responseData = await postoraApiRequest.call(this, 'POST', '/generate-video', body);
				}

				if (operation === 'videoFunction') {
					const functionName = this.getNodeParameter('functionName', i) as string;
					const identifier = this.getNodeParameter('identifier', i) as string;
					const additionalParametersParam = this.getNodeParameter(
						'additionalParameters',
						i,
						{},
					) as any;

					const body: any = {
						functionName,
						identifier,
					};

					// Add additional parameters dynamically
					if (
						additionalParametersParam.parameter &&
						additionalParametersParam.parameter.length > 0
					) {
						additionalParametersParam.parameter.forEach((param: any) => {
							body[param.key] = param.value;
						});
					}

					responseData = await postoraApiRequest.call(this, 'POST', '/video/function', body);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject[]),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					// Continue processing other items, add error info to results
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error?.description || error?.message || error }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				// If continueOnFail is false, throw the error to stop execution
				throw error;
			}
		}

		return [returnData];
	}
}
