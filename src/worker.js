/**
 * Cloudflare Worker Reverse Proxy for Multiple Services
 *
 * Request format:
 *    https://your-worker-domain/{service}/{rest-of-path}?{query}
 *
 * Supported services (case-insensitive):
 *   - openai
 *   - anthropic
 *   - azure_openai
 *   - google_vertexai
 *   - google_genai
 *   - bedrock
 *   - bedrock_converse
 *   - cohere
 *   - fireworks
 *   - together
 *   - mistralai
 *   - huggingface
 *   - groq
 *   - google_anthropic_vertex
 *   - deepseek
 *   - ibm
 *   - nvidia
 *   - xai
 *
 * For each service, ensure you configure the proper API base URL.
 */

import {SERVICE_API_BASE} from './config.js';


async function handleRequest(request) {
    try {
        // Parse the incoming URL
        const url = new URL(request.url);
        // Split pathname into segments (ignore empty segments)
        const segments = url.pathname.split('/').filter(segment => segment);

        // Expect at least two segments: service and at least one path segment
        if (segments.length < 2) {
            return new Response("Invalid URL format. Expected /{service}/{path}", {status: 400});
        }

        // Extract service identifier (first segment, case-insensitive)
        const service = segments[0].toLowerCase();

        // Check if service is supported
        if (!(service in SERVICE_API_BASE)) {
            return new Response("Service not supported", {status: 400});
        }

        // Construct the target URL using the service base and remaining path & query
        const baseUrl = SERVICE_API_BASE[service];
        const remainingPath = "/" + segments.slice(1).join('/');
        const targetUrl = new URL(baseUrl + remainingPath + url.search);

        // Prepare request options, preserving method, headers, and body (if applicable)
        const init = {
            method: request.method,
            // Clone the headers. You may choose to filter out headers (e.g., cookies) if needed.
            headers: request.headers,
            // Only include a body for methods that allow it
            body: (request.method !== "GET" && request.method !== "HEAD") ? request.body : null,
            redirect: 'follow'
        };

        // Create a new request object for the proxy call
        const proxyRequest = new Request(targetUrl.toString(), init);

        // Forward the request to the selected API base and return its response
        return await fetch(proxyRequest);
    } catch (error) {
        return new Response("Internal Error: " + error.message, {status: 500});
    }
}

// Listen to fetch events and handle them with our proxy logic
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
