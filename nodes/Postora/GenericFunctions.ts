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
	const credentials = await this.getCredentials('postora2Api');

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
		return await this.helpers.httpRequestWithAuthentication.call(this, 'postora2Api', options);
	} catch (error: any) {
		// Surface backend validation details (e.g. Instagram post_type requirement, 400 errors)
		const resp = error.response;
		if (resp) {
			const rawBody = resp.body;
			let detail = '';
			if (rawBody && typeof rawBody === 'object') {
				if (Array.isArray(rawBody.message)) {
					detail = rawBody.message.join(', ');
				} else if (rawBody.message) {
					detail = String(rawBody.message);
				} else if (rawBody.error) {
					detail = String(rawBody.error);
				}
			} else if (typeof rawBody === 'string' && rawBody) {
				detail = rawBody;
			}
			if (detail) {
				error.message = `${error.message}${detail ? ` - ${detail}` : ''}`;
			}
		}
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
