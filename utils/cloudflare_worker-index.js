// FILE PROVIDED FYI, NOT USED IN THIS PROJECT
// create worker:  $npm create cloudflare@latest
// deploy changes: $npx wrangler deploy
// create env var: $npx wrangler secret put OPENAI_API_KEY 

import OpenAI from 'openai';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
}

export default {
	async fetch(request, env, ctx) {
		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		const openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY
		})
		const messages = await request.json()
		
		try {
			const chatCompletion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: messages,
                temperature: 1.1,
                presence_penalty: 0,
                frequency_penalty: 0
            })
            const response = chatCompletion.choices[0].message
            
            return new Response(JSON.stringify(response), { headers: corsHeaders })
		} catch (error) {
			return new Response(error, { headers: corsHeaders })
		}
	},
};
