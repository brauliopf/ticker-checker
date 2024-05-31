# App: ticker-checker
Web app to check recent history of stock prices. This application is configured to be deployed to a Cloudflare Page. Just push changes to the main branch on github and access it at: https://ticker-checker.pages.dev/

# Cloudflare Workers
- create worker:  $npm create cloudflare@latest
- deploy changes: $npx wrangler deploy
- create env var: $npx wrangler secret put OPENAI_API_KEY 