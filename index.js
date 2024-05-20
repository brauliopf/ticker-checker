import { dates } from './utils/dates.js'
const tickersArr = []
const generateReportBtn = document.querySelector('.btn#generate-report')

// Map UI elements
const loadingArea = document.querySelector('.loading-panel')
const apiMessage = document.getElementById('api-message')

// Create js triggers
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

// Auxiliary functions
function renderTickers() {
    /*  Reset the ticker display and render the tickers in tickerArr
    */
    const tickersDiv = document.querySelector('.ticker-choice-display')
    tickersDiv.innerHTML = ''
    tickersArr.forEach((ticker) => {
        const newTickerSpan = document.createElement('span')
        newTickerSpan.textContent = ticker
        newTickerSpan.classList.add('ticker')
        tickersDiv.appendChild(newTickerSpan)
    })
}

async function fetchStockData() {
    /*  Fetch stock data from Polygon.io for each ticker in tickersArr.
        Input:
            . tickersArr: array of strings with the tickers to fetch data for.
            . dates: object with start and end dates for the data.
        Output:
            . stockData: array of strings with the stock data for each ticker.
            (check polygon.io api for more)
    */

    const POLYGONIO_WORKER_URL = 'https://polygon-api-worker.brauliopf.workers.dev/'
    document.querySelector('.action-panel').style.display = 'none'
    loadingArea.style.display = 'flex'

    try {
        const stockData = await Promise.all(tickersArr.map(async (ticker) => {
            // Make Request
            const url = `${POLYGONIO_WORKER_URL}?ticker=${ticker}&startDate=${dates.startDate}&endDate=${dates.endDate}`
            const response = await fetch(url)

            // Handle Response
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

    try {
        // Make Request
        const OPENAI_WORKER_URL = 'https://openai-api-worker.brauliopf.workers.dev/'
        const response = await fetch(OPENAI_WORKER_URL, {
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messages) // as defined in the header above, the body must be of type JSON
        })

        // Handle Response
        const response_json = await response.json()
        loadingArea.style.display = 'none'
        if(!response.ok) {
            throw new Error(`Worker error: ${response_json.error}`)
        }
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
