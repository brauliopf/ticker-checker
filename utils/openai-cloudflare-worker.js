// 
// VIEW ONLY
// 

import OpenAI from 'openai';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*', // Consider allowing only requests from specific origins
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
}

export default {
	async fetch(request, env, ctx) {
		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		// restrict worker to handle only POST requests
		// Use error code 405 for "method not allowed"
		if (request.method !== 'POST') {
			return new Response(JSON.stringify({ error: `${request.method} method not allowed.`}), { status: 405, headers: corsHeaders })
		  }

		// Connect to openai API
		const openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY,
			baseURL: "https://gateway.ai.cloudflare.com/v1/1e1320f6cccf62fa78229a99558ce6fd/tc-openai/openai" // use Cloudflare's API Gateway
		})
		// Get user input from request to use as parameter for completion request
		const request_json = await request.json()
		const messages = request_json.messages
		const model = request_json.model
		
		// execute completion request
		try {
			const chatCompletion = await openai.chat.completions.create({
                model: model,
                messages: messages,
                temperature: 1, // control randomness [0:2]. 2 -> more random
                // presence_penalty: 0, // [-2:2]. 2 -> less repetition of contents/topics (there is a penalty for having already been used) [default 0]
                // frequency_penalty: 0, // [-2:2]. 2 -> less repetition of exact phrases (there is a penalty for having already been used) [default 0]
				// stop: ['6.'] // tell the model to stop when it generates a certain work output
            })
            const response = chatCompletion.choices[0].message
            
            return new Response(JSON.stringify(response), { headers: corsHeaders })
		} catch (e) {
			return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders })
		}
	},
};
