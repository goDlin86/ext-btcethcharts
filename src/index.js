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
import Chart from 'react-apexcharts'

const lineChartOptionsTotalSpent = {
  chart: {
    toolbar: {
      show: false,
    },
  },
  colors: ["#4318FF", "#39B8FF"],
  markers: {
    size: 0,
    colors: "white",
    strokeColors: "#7551FF",
    strokeWidth: 3,
    strokeOpacity: 0.9,
    strokeDashArray: 0,
    fillOpacity: 1,
    discrete: [],
    shape: "circle",
    radius: 2,
    offsetX: 0,
    offsetY: 0,
    showNullDataPoints: true,
  },
  tooltip: {
    theme: "dark",
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    type: "line",
  },
  xaxis: {
    type: "datetime",
    tickAmount: 6,
    // axisBorder: {
    //   show: false,
    // },
    // axisTicks: {
    //   show: false,
    // },
  },
  yaxis: {
    min: 0,
  },
  legend: {
    show: false,
  },
  grid: {
    show: false,
    column: {
      color: ["#7551FF", "#39B8FF"],
      opacity: 0.5,
    },
  },
  color: ["#7551FF", "#39B8FF"],
  fill: {
    type: 'gradient',
    gradient: {
      shade: "dark",
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 100]
    }
  },
}

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
          //setStore(st)
        }

        day.setDate(day.getDate() + 1)
        i++
      }

      chrome.storage.sync.set({ 'data': st })
      setStore(st)
    })
  }, [])

  return (
    <>
      <Chart 
        options={lineChartOptionsTotalSpent} 
        series={store.length > 0 ? 
          [{ name: active, data: store.map(i => [new Date(i.date).getTime(), i[active]]) }] 
          : [{ data: [] }]} 
        type='area' 
      />
      <div className='buttons'>
        <div className={'btcbutton' + (active === 'btc' ? ' active' : '')} onClick={() => setActive('btc')}>BTC</div>
        <div className={'ethbutton' + (active === 'eth' ? ' active' : '')} onClick={() => setActive('eth')}>ETH</div>
        <div className={'bebutton' + (active === 'be' ? ' active' : '')} onClick={() => setActive('be')}>BTC/ETH</div>
      </div>
    </>
  )
}

render(<App />, document.getElementById('graph'))