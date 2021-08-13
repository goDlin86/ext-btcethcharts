Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1
    var dd = this.getDate()
  
    return [this.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('-')
}

import React, { useEffect, useState } from 'react'
import { render } from 'react-dom'
import { Line } from 'react-chartjs-2'
import './style.css'

const App = () => {
    const [store, setStore] = useState([])
    const [active, setActive] = useState('be')

    useEffect(() => {
        //chrome.storage.sync.clear()
        chrome.storage.sync.get('data', getData)
    }, [])

    const getData = async (data) => {
        let st = []
        if (!chrome.runtime.error && data.data) {
            st = data.data
        }

        const day = new Date()
        day.setDate(day.getDate() - 60)

        st = st.filter(obj => obj.date >= day.yyyymmdd())

        let i = 0
        while(i < 60) {
            if (st.findIndex(obj => obj.date === day.yyyymmdd()) === -1) {
                const btc = await fetchCoinData('BTC', day)
                const eth =  await fetchCoinData('ETH', day)
                const be = parseFloat((btc/eth).toFixed(2))
                st.push({ btc, eth, be, date: day.yyyymmdd() })
                setStore(st)
            }

            day.setDate(day.getDate() + 1)
            i++
        }

        chrome.storage.sync.set({ 'data': st })
        setStore(st)
    }

    const fetchCoinData = async(coin, day) => {
        const res = await fetch('https://api.coinbase.com/v2/prices/' + coin + '-USD/spot?date=' + day.yyyymmdd())
        const { data } = await res.json()
        return parseFloat(data.amount).toFixed(2)
    }

    const formatDate = date => {
        const options = { month: 'long', day: 'numeric' }
        return new Date(date).toLocaleDateString('ru-RU', options)
    }
     
    const options = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
        parsing: {
            yAxisKey: active,
            xAxisKey: 'date',
        },
    }

    return (
        <div>
            {store.length >= 30 &&
                <div>
                    <Line width={600} height={300} data={{
                            datasets: [
                                {
                                    label: active,
                                    data: store,
                                    fill: false,
                                    backgroundColor: 'rgb(50, 50, 50)',
                                    borderColor: 'rgba(50, 50, 50, 0.2)',
                                },
                            ],
                        }} options={options} 
                    />
                    <div className='buttons'>
                        <div className={'btcbutton' + (active === 'btc' ? ' active' : '')} onClick={() => setActive('btc')}>BTC</div>
                        <div className={'ethbutton' + (active === 'eth' ? ' active' : '')} onClick={() => setActive('eth')}>ETH</div>
                        <div className={'bebutton' + (active === 'be' ? ' active' : '')} onClick={() => setActive('be')}>BTC/ETH</div>
                    </div>
                </div>
            }
            {store.length < 30 && <div>{store.length}</div>}
        </div>
    )
}

render(<App />, document.getElementById('graph'))