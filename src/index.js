Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1
  var dd = this.getDate()

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
          ].join('-')
}

import { useEffect, useState } from 'react'
import { render } from 'react-dom'
import { AreaChart, Button } from "@tremor/react"

const App = () => {
  const [store, setStore] = useState([])
  const [active, setActive] = useState('be')

  useEffect(() => {
    //chrome.storage.sync.clear()
    chrome.storage.sync.get('data', async (data) => {
      let st = []
      if (!chrome.runtime.error && data.data) {
        st = data.data
      }

      const day = new Date()
      day.setDate(day.getDate() - 60)

      st = st.filter(obj => obj.date >= day.yyyymmdd())

      const fetchCoinData = async (coin, day) => {
        const res = await fetch('https://api.coinbase.com/v2/prices/' + coin + '-USD/spot?date=' + day.yyyymmdd())
        const { data } = await res.json()
        return parseFloat(data.amount).toFixed(2)
      }

      let i = 0
      while(i < 60) {
        if (st.findIndex(obj => obj.date === day.yyyymmdd()) === -1) {
          const btc = await fetchCoinData('BTC', day)
          const eth =  await fetchCoinData('ETH', day)
          const be = parseFloat((btc/eth).toFixed(2))
          st.push({ btc, eth, be, date: day.yyyymmdd() })
        }

        day.setDate(day.getDate() + 1)
        i++
      }

      chrome.storage.sync.set({ 'data': st })
      setStore(st)
    })
  }, [])

  const dataFormatter = (number) => {
    return "$ " + Intl.NumberFormat("us").format(number).toString();
  }

  const beFormatter = (number) => number

  return (
    <>
      {store.length < 60 ? '...' :
        <AreaChart
          data={store}
          index='date'
          categories={[active]}
          showLegend={false}
          curveType='natural'
          valueFormatter={active === 'be' ? beFormatter : dataFormatter}
        />
      }
      <div className='buttons'>
        <Button variant={active === 'btc' ? 'primary' : 'secondary'} onClick={() => setActive('btc')}>BTC</Button>
        <Button variant={active === 'eth' ? 'primary' : 'secondary'} onClick={() => setActive('eth')}>ETH</Button>
        <Button variant={active === 'be' ? 'primary' : 'secondary'} onClick={() => setActive('be')}>BTC/ETH</Button>
      </div>
    </>
  )
}

render(<App />, document.getElementById('graph'))