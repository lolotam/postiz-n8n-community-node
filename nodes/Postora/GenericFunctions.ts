import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IWebhookFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export async function postoraApiRequest(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,

	body: any = {},
	query: IDataObject = {},
	option: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('postoraApi');

	let options: IHttpRequestOptions = {
		baseURL: credentials.host + '/public/v1' as string,
		method,
		body,
		qs: query,
		url: resource,
	};

	if (!Object.keys(query).length) {
		delete options.qs;
	}
	
	options = Object.assign({}, options, option);
	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'postoraApi', options);
	} catch (error: any) {
		if (error.response && error.response.body) {
			const body = error.response.body;
			if (body.message) {
				const details = Array.isArray(body.message) ? body.message.join(', ') : String(body.message);
				error.message = `${error.message} - ${details}`;
			}
		}
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
