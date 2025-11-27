export default {
	async fetch(request: Request): Promise<Response> {
		const remote = "https://ray-white-marine.pages.dev";
		
		// Get the URL from the request
		const url = new URL(request.url);
		
		// Construct the target URL by replacing the host
		const targetUrl = new URL(url.pathname + url.search, remote);
		
		try {
			// Create a new request with the target URL
			const modifiedRequest = new Request(targetUrl.toString(), {
				method: request.method,
				headers: request.headers,
				body: request.body,
			});
			
			// Fetch from the remote server
			const response = await fetch(modifiedRequest);
			
			// Clone the response so we can modify it
			const newResponse = new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
			});
			
			// Add CORS headers for Chrome compatibility
			newResponse.headers.set('Access-Control-Allow-Origin', '*');
			newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
			newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
			
			// Handle preflight requests
			if (request.method === 'OPTIONS') {
				return new Response(null, {
					status: 200,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
						'Access-Control-Allow-Headers': 'Content-Type, Authorization',
					},
				});
			}
			
			// For HTML content, we might need to modify relative URLs
			const contentType = response.headers.get('content-type') || '';
			if (contentType.includes('text/html')) {
				const html = await response.text();
				
				// Replace relative URLs with absolute URLs pointing to the remote server
				const modifiedHtml = html
					.replace(/href="\//g, `href="${remote}/`)
					.replace(/src="\//g, `src="${remote}/`)
					.replace(/action="\//g, `action="${remote}/`)
					.replace(/url\(\//g, `url(${remote}/`);
				
				return new Response(modifiedHtml, {
					status: response.status,
					statusText: response.statusText,
					headers: newResponse.headers,
				});
			}
			
			return newResponse;
			
		} catch (error) {
			return new Response('Error fetching content: ' + error.message, {
				status: 500,
				headers: {
					'Content-Type': 'text/plain',
					'Access-Control-Allow-Origin': '*',
				},
			});
		}
	},
};
