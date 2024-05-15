# App: ticker-checker
Web app to check recent history of stock prices

# Notes / Dev Log
* Chrome throws a CORS error because I have an http request from a local machine with the url begining with "file://". To fix that, we use a local node server with "http-server".
** $npm install -g http-server
