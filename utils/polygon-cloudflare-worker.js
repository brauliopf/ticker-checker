// 
// VIEW ONLY
// 


/**
 * . Input: tickers (array of strings), dates (dictionary with startDate and endDate)
 * . Output: stock data for each ticker in the array (array of dictionaries)
 * . Worker URL: https://polygon-api-worker.brauliopf.workers.dev/
 * . Other reqs:
 * . Comply with CORs policy
 * . Fetch stock data from Polygon.io API (GET only)
 */

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
}

export default {
	async fetch(request, env, ctx) {
		// Handle CORS preflight requests
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		// Parse the URL from the incoming request
		const url = new URL(request.url);

		// Extract the ticker and dates from the request URL
		const ticker = url.searchParams.get("ticker");
		const startDate = url.searchParams.get("startDate");
		const endDate = url.searchParams.get("endDate");

		// Ensure necessary parameters are present
		if (!ticker || !startDate || !endDate) {
			return new Response("Missing required parameters", {
			  status: 400,
			  headers: corsHeaders,
			});
		}

		// Connect to polygon endpoint to fetch stock data
		// Polygon.io API DocS: https://polygon.io/docs/stocks/get_v2_aggs_ticker__stocksticker__range__multiplier___timespan___from___to
		const polygonURL = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${startDate}/${endDate}?apiKey=${env.POLYGONIO_API_KEY}`

		try{
			const response = await fetch(polygonURL)
			if(!response.ok){
				throw new Error('Failed to fetch data from Polygon API.');
			}

			// remove request_id from response dict
			const data = await response.json()
			delete data.request_id

			return new Response(JSON.stringify(data), { headers: corsHeaders })
		} catch(e) {
			return new Response(e.message, { status: 500, headers: corsHeaders })
		}
	},
};