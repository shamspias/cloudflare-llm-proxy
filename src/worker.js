import {SERVICE_API_BASE} from './config.js';

const buildTargetUrl = (service, originalUrl) => {
    const baseUrl = SERVICE_API_BASE[service];
    const segments = originalUrl.pathname.split('/').filter(Boolean);
    const remainingPath = '/' + segments.slice(1).join('/');
    const targetUrl = new URL(baseUrl + remainingPath + originalUrl.search);
    console.log('Constructed target URL:', targetUrl.toString());
    return targetUrl;
};

const handleRequest = async (request) => {
    try {
        console.log('Incoming request:', request.method, request.url);

        const originalUrl = new URL(request.url);
        console.log('Parsed URL:', originalUrl);

        const segments = originalUrl.pathname.split('/').filter(Boolean);
        console.log('Path segments:', segments);

        // Debug endpoint: /debug returns the Cloudflare request properties.
        if (segments[0] === 'debug') {
            console.log('Debug endpoint hit');
            return new Response(JSON.stringify(request.cf, null, 2), {
                headers: {'Content-Type': 'application/json'},
            });
        }

        // Debug endpoint: /debug-ip returns outgoing IP info.
        if (segments[0] === 'debug-ip') {
            console.log('Debug IP endpoint hit');
            const ipinfoResponse = await fetch('https://ipinfo.io/json');
            const ipinfoData = await ipinfoResponse.json();
            return new Response(JSON.stringify(ipinfoData, null, 2), {
                headers: {'Content-Type': 'application/json'},
            });
        }

        // Ensure the URL is in the expected /{service}/{path} format.
        if (segments.length < 2) {
            console.error('Invalid URL format. Expected /{service}/{path}');
            return new Response('Invalid URL format. Expected /{service}/{path}', {status: 400});
        }

        // Normalize the service name and check if it's supported.
        const service = segments[0].toLowerCase();
        if (!SERVICE_API_BASE.hasOwnProperty(service)) {
            console.error('Service not supported:', service);
            return new Response('Service not supported', {status: 400});
        }

        // Construct the target URL using the service's base URL.
        const targetUrl = buildTargetUrl(service, originalUrl);

        // Clone and clean the headers to remove IP and connection related fields.
        const headers = new Headers(request.headers);
        // console.log('Original Headers:', Array.from(headers.entries()));

        headers.delete('x-forwarded-for');
        headers.delete('cf-connecting-ip');
        headers.delete('x-real-ip');
        headers.delete('cf-visitor');
        headers.delete('cf-ipcountry');
        headers.delete('cf-ray');
        headers.delete('forwarded');

        // console.log('Modified Headers:', Array.from(headers.entries()));

        const init = {
            method: request.method,
            headers,
            body: (request.method !== 'GET' && request.method !== 'HEAD') ? request.body : null,
            redirect: 'follow'
        };

        // Forward the request to the target API.
        const proxyRequest = new Request(targetUrl.toString(), init);
        // console.log('Forwarding request to:', targetUrl.toString());
        const response = await fetch(proxyRequest);

        // Clone and log the response body without consuming the original stream.
        const clonedResponse = response.clone();
        const responseBodyText = await clonedResponse.text();

        try {
            const responseLines = responseBodyText.split('\n');
            responseLines.forEach(line => {
                if (line.startsWith('data:')) {
                    const jsonPart = line.substring(6).trim();
                    const parsed = JSON.parse(jsonPart);
                    if (parsed.choices && parsed.choices[0].delta) {
                        console.log('Extracted Content:', parsed.choices[0].delta.content || '');
                    }
                }
            });
        } catch (parseError) {
            console.error('Error parsing response body:', parseError);
        }

        return response;
    } catch (error) {
        console.error('Internal Error:', error);
        return new Response(`Internal Error: ${error.message}`, {status: 500});
    }
};

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
