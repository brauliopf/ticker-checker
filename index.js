import { dates } from './utils/dates.js'
import config from './config.js'; // Import the configuration file

const tickersArr = []
const generateReportBtn = document.querySelector('.btn#generate-report')

generateReportBtn.addEventListener('click', fetchStockData)

document.getElementById('ticker-input-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const tickerInput = document.getElementById('ticker-input')
    if (tickerInput.value.length > 2) {
        generateReportBtn.disabled = false
        const newTickerStr = tickerInput.value
        tickersArr.push(newTickerStr.toUpperCase())
        tickerInput.value = ''
        renderTickers()
    } else {
        const label = document.getElementsByTagName('label')[0]
        label.style.color = 'red'
        label.textContent = 'You must add at least one ticker. A ticker is a 3 letter or more code for a stock. E.g TSLA for Tesla.'
    }
})

function renderTickers() {
    const tickersDiv = document.querySelector('.ticker-choice-display')
    tickersDiv.innerHTML = ''
    tickersArr.forEach((ticker) => {
        const newTickerSpan = document.createElement('span')
        newTickerSpan.textContent = ticker
        newTickerSpan.classList.add('ticker')
        tickersDiv.appendChild(newTickerSpan)
    })
}

const loadingArea = document.querySelector('.loading-panel')
const apiMessage = document.getElementById('api-message')

async function fetchStockData() {
    document.querySelector('.action-panel').style.display = 'none'
    loadingArea.style.display = 'flex'
    try {
        const stockData = await Promise.all(tickersArr.map(async (ticker) => {
            // GET ticket info from Polygon.io
            const url = `${config.POLYGONIO_CLOUDFLARE_WORKER}?ticker=${ticker}&startDate=${dates.startDate}&endDate=${dates.endDate}`
            const response = await fetch(url)
            
            // Digest output and handle error
            if(!response.ok) {
                const errMsg = await response.text()
                throw new Error('Worker error: ' + errMsg)
            }
            apiMessage.innerText = 'Creating report...'
            return response.text()
        }))
        fetchReport(stockData.join(''))
    } catch(err){
        loadingArea.innerText = 'There was an error fetching stock data.'
        console.error(err.message)
    }
}

async function fetchReport(tickersReport_Polygon) {

    try {
        const messages = [
            {"role": "system", "content": "You are a financial advisor hired to help clients diversify their investment portfolio with US stock market investments. \
            Your clients will bring up to 3 tickers which they are considering. You will be provided complete data from each day of the past 3 trading days, including: \
                'v': trading volume, 'vw': volume weighted average price, 'o': open price, 'c': close price, \
                'h': highest price, 'l': lowest price, 't': start timestamp, 'n': number of transactions. \
            You must provide a yes or no decision regarding an investment in each ticker \
            and a short reasoning (with no more than 50 words for each) for that decision based on data shared on the stock and any public news available. Do mention \
            the maximum and minimum price of the stock in the past 3 days and, if is relevant, comment on the historical maxima as well."},
            {"role": "user", "content": tickersReport_Polygon},
        ]

        const worker_URL = config.OPENAI_CLOUDFLARE_WORKER
        const options = {
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messages) // as defined in the header above, the body must be of type JSON
        }

        const response = await fetch(worker_URL, options)
        const response_json = await response.json()

        // handle error
        if(!response.ok) {
            throw new Error(`Worker error: ${response_json.error}`)
        }
        loadingArea.style.display = 'none'
        renderReport(response_json.content)
    } catch(error) {
        console.error('There was a problem with the fetch operation –', error);
        loadingArea.innerText = 'Unable to access AI. Please refresh and try again'
    };

}

function renderReport(output) {
    loadingArea.style.display = 'none'
    const outputArea = document.querySelector('.output-panel')
    const report = document.createElement('p')
    outputArea.appendChild(report)
    report.textContent = output
    outputArea.style.display = 'flex'
}
