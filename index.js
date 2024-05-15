import { dates } from './utils/dates.js'
import config from './config.js'; // Import the configuration file

const tickersArr = []
const generateReportBtn = document.querySelector('.btn#generate-report')
// TODO: Use the OpenAI API instead of the npm package!
// const openAI = new OpenAI(config.OPENAI_API_KEY);

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
        // MUST HIDE API KEY FROM PRODUCTION VERSION!
        const stockData = await Promise.all(tickersArr.map(async (ticker) => {
            const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${config.POLYGONIO_API_KEY}`
            const response = await fetch(url)
            const data = await response.text()
            const status = await response.status
            if (status === 200) {
                apiMessage.innerText = 'Creating report...'
                return data
            } else {
                loadingArea.innerText = 'There was an error fetching stock data.'
            }
        }))
        fetchReport(stockData.join(''))
    } catch(err) {
        loadingArea.innerText = 'There was an error fetching stock data.'
        console.error('error: ', err)
    }
}

async function fetchReport(data) {

    // 4. You might have to experiment with the instructions you give the model to get a report you are happy with. For now, don't worry too much about the quality of the report as we will do some tweaking later. 

    // 5. Call renderReport with the text you get back from the OpenAI API.

    // 6. For bonus points, use a try catch to handle errors.

    const messages = [
        {"role": "system", "content": "You are a financial advisor hired to help clients diversify their investment portfolio with US stock market investments. \
         Your clients will bring up to 3 tickers which they are considering. You must provide a yes or no decision regarding an investment in each ticker. \
         and a short reasoning for that decision based on recent movements of the stock price and any public news available at the time."},
        {"role": "user", "content": tickersArr.join(', ')},
    ]

    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": messages,
            "temperature": 0.7
        })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
        console.log(data);
        renderReport(data.choices[0].message.content)
    }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

}

function renderReport(output) {
    loadingArea.style.display = 'none'
    const outputArea = document.querySelector('.output-panel')
    const report = document.createElement('p')
    outputArea.appendChild(report)
    report.textContent = output
    outputArea.style.display = 'flex'
}