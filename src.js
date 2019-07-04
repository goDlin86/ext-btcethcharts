Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1
    var dd = this.getDate()
  
    return [this.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('-')
}

import React from 'react'
import ReactDOM from 'react-dom'
import { LineChart, XAxis, YAxis, Legend, Tooltip, Line, CartesianGrid } from 'recharts'

import 'babel-polyfill'

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            store: [],
            active: 0
        }
    }
    componentDidMount() {
        //chrome.storage.sync.clear()
        chrome.storage.sync.get('data', this.getData.bind(this))
    }
    async getData(data){
        let store = []
        if (!chrome.runtime.error && data.data) {
            store = data.data
        }

        const day = new Date()
        day.setDate(day.getDate() - 60)

        store = store.filter(obj => obj.date >= day.yyyymmdd())

        let i = 0
        while(i < 60) {
            if (store.findIndex(obj => obj.date === day.yyyymmdd()) === -1) {
                const btc = await this.fetchCoinData('BTC', day)
                const eth =  await this.fetchCoinData('ETH', day)
                const be = parseFloat((btc/eth).toFixed(2))
                store.push({ btc, eth, be, date: day.yyyymmdd() })
                this.setState({ store })
            }

            day.setDate(day.getDate() + 1)
            i++
        }

        this.setState({ store })
        chrome.storage.sync.set({ 'data': store })
    }
    async fetchCoinData(coin, day) {
        const res = await fetch('https://api.coinbase.com/v2/prices/' + coin + '-USD/spot?date=' + day.yyyymmdd())
        const { data } = await res.json()
        return parseFloat(data.amount).toFixed(2)
    }
    switchData(i) {
        this.setState({ active: i })
    }
    render() {
        const { store } = this.state
        let dataKey = 'be'
        switch (this.state.active) {
            case 1: 
                dataKey = 'btc'
                break
            case 2: 
                dataKey = 'eth'
                break
        }

        return (
            <div>
                {store.length >= 30 &&
                    <div>
                        <LineChart width={600} height={300} data={store.slice()}>
                            <XAxis dataKey="date"/>
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3"/>
                            <Tooltip formatter={v => this.state.active > 0 ? v + '$' : v} />
                            <Legend />
                            <Line type="monotone" dataKey={dataKey} stroke="#8884d8" />
                        </LineChart>
                        <div className="buttons">
                            <div className={"btcbutton" + (dataKey === 'btc' ? " active" : "")} onClick={this.switchData.bind(this, 1)}>BTC</div>
                            <div className={"ethbutton" + (dataKey === 'eth' ? " active" : "")} onClick={this.switchData.bind(this, 2)}>ETH</div>
                            <div className={"bebutton" + (dataKey === 'be' ? " active" : "")} onClick={this.switchData.bind(this, 0)}>BTC/ETH</div>
                        </div>
                    </div>
                }
                {store.length < 30 && <div>{store.length}</div>}
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById('graph'))