# App: ticker-checker
Web app to check recent history of stock prices. A user can query any ticker from a US stock exchange marketplaces (NYSE, NASDAQ, etc) and the app will provide an opinion on whether to invest or not, based on the stock prices of the past 3 days.
This is not financial advice. You shoulldn't trust what this app says. Access the application at: https://ticker-checker.pages.dev/

# Tech Stack
This application is deployed to a Cloudflare Page. The page gets updated everytime there is an update to the main branch on the github repository.
The app implements a Retrieval-Augmented Generation (RAG), retrieving stock exchange data from polygon.ai and generating the recommendation and text with a GPT from OpenAI.
The app uses Fetch API to make requests to Cloudflare workers, which handle the external requests. The "index.js" file for both workers are stored here for reference only. Each worker is maintained and deployed from different folders. Finally, the OpenAI worker is configured as an AI Gateway on Cloudflare, to allow for caching and tracking of requests.

# Deploy
This application is a Cloudflare Page. It gets updated automaticatelly when I deploy to the "main" branch of the github repository.

# Cloudflare Workers
- create worker:  $npm create cloudflare@latest
- deploy changes: $npx wrangler deploy
- create env var: $npx wrangler secret put OPENAI_API_KEY 

# References
- https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- https://www.geeksforgeeks.org/javascript-fetch-method/