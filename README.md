# Cloudflare LLM Reverse Proxy

## Overview
Cloudflare Worker-based **Reverse Proxy** for **Multiple AI LLM APIs** (OpenAI, Anthropic, Cohere, Mistral, DeepSeek, etc.).

This proxy routes requests dynamically based on the service name in the URL, making it easier to manage multiple AI API integrations via a single endpoint.

## Features
✅ Supports Multiple AI APIs
✅ Lightweight & Fast Cloudflare Worker Deployment
✅ Dynamic Routing to Various LLM APIs
✅ Secure & Flexible Proxying
✅ No Server Maintenance Required

## Supported LLM Providers
- **OpenAI** (`/openai`)
- **Anthropic** (`/anthropic`)
- **Azure OpenAI** (`/azure_openai`)
- **Google Vertex AI** (`/google_vertexai`)
- **Google Generative AI** (`/google_genai`)
- **AWS Bedrock** (`/bedrock`)
- **Cohere** (`/cohere`)
- **Fireworks** (`/fireworks`)
- **Together AI** (`/together`)
- **Mistral AI** (`/mistralai`)
- **Hugging Face** (`/huggingface`)
- **Groq** (`/groq`)
- **DeepSeek** (`/deepseek`)
- **IBM Watson AI** (`/ibm`)
- **NVIDIA AI** (`/nvidia`)
- **XAI** (`/xai`)

## How It Works
The proxy expects requests in this format:
```plaintext
https://your-worker-domain/{service}/{rest-of-path}?{query}
```
For example:
```plaintext
https://your-worker-domain/openai/v1/chat/completions
```
This will forward the request to `https://api.openai.com/v1/chat/completions` while preserving headers and the request body.

## Deployment Instructions
### 1️⃣ Install Cloudflare Wrangler
First, install **Wrangler CLI**:
```sh
npm install -g wrangler
```
Then, authenticate with Cloudflare:
```sh
wrangler login
```

### 2️⃣ Clone the Repository
```sh
git clone https://github.com/shamspias/cloudflare-llm-proxy.git
cd cloudflare-llm-proxy
```

### 3️⃣ Configure Cloudflare Worker
Edit **`wrangler.toml`** to add your Cloudflare **Account ID**:
```toml
name = "cloudflare-llm-proxy"
type = "javascript"

account_id = "your-cloudflare-account-id"
workers_dev = true
route = ""
zone_id = ""

[build]
upload.format = "modules"
```

### 4️⃣ Deploy to Cloudflare Workers
Run:
```sh
wrangler publish
```
After deployment, your proxy will be available at:
```plaintext
https://your-worker-subdomain.workers.dev
```

## Example API Calls
### OpenAI Request:
```sh
curl -X POST "https://your-worker-domain/openai/v1/chat/completions" \
     -H "Authorization: Bearer YOUR_OPENAI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model": "gpt-4", "messages": [{"role": "user", "content": "Hello!"}]}'
```

### Cohere Request:
```sh
curl -X POST "https://your-worker-domain/cohere/v1/generate" \
     -H "Authorization: Bearer YOUR_COHERE_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model": "command", "prompt": "Tell me a joke"}'
```

## Configuration
To update the **base API URLs**, modify `src/config.js`:
```js
export const SERVICE_API_BASE = {
    openai: "https://api.openai.com/v1",
    anthropic: "https://api.anthropic.com",
    azure_openai: "https://{your-resource-name}.openai.azure.com",
    google_vertexai: "https://vertexai.googleapis.com",
    cohere: "https://api.cohere.ai",
    huggingface: "https://api-inference.huggingface.co",
};
```

## Security Considerations
- **Avoid exposing API keys in client-side requests.** Use a backend system to handle requests securely.
- **Rate-limiting and logging** should be considered for production use.
- **Cloudflare API Gateway rules** can help filter out unauthorized requests.


🌟 **Built for developers looking to streamline AI API calls via Cloudflare Workers.** 🚀

