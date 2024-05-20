# App: ticker-checker
Web app to check recent history of stock prices

# Cloudflare Workers
- create worker:  $npm create cloudflare@latest
- deploy changes: $npx wrangler deploy
- create env var: $npx wrangler secret put OPENAI_API_KEY 

# Notes / Dev Log
* Chrome throws a CORS error because I have an http request from a local machine with the url begining with "file://". To fix that, we use a local node server with "http-server".
** $npm install -g http-server