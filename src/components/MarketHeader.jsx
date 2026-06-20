import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

const PROXY = 'https://corsproxy.io/?'
const YF = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols='
const INDICES = [
  { symbol: '^GSPC', label: 'S&P 500' },
  { symbol: '^IXIC', label: 'NASDAQ' },
  { symbol: '^DJI', label: 'DOW' },
  { symbol: '^VIX', label: 'VIX' },
]

async function fetchIndices() {
  const syms = INDICES.map(i => i.symbol).join(',')
  const url = `${PROXY}${encodeURIComponent(YF + syms)}`
  const res = await fetch(url)
  const data = await res.json()
  return data?.quoteResponse?.result || []
}

export default function MarketHeader() {
  const [quotes, setQuotes] = useState({})
  const [lastUpdate, setLastUpdate] = useState(null)
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const results = await fetchIndices()
      const map = {}
      results.forEach(q => { map[q.symbol] = q })
      setQuotes(map)
      setLastUpdate(new Date().toLocaleTimeString())
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [])

  return (
    <div className="flex items-center gap-4 py-2 overflow-x-auto text-xs">
      {INDICES.map(({ symbol, label }) => {
        const q = quotes[symbol]
        const pct = q?.regularMarketChangePercent
        const isUp = pct >= 0
        return (
          <div key={symbol} className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-gray-500">{label}</span>
            <span className="font-mono font-semibold">
              {q ? q.regularMarketPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
            </span>
            {q && (
              <span className={`flex items-center gap-0.5 ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isUp ? '+' : ''}{pct?.toFixed(2)}%
              </span>
            )}
          </div>
        )
      })}
      <button onClick={refresh} className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1">
        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        {lastUpdate && <span>{lastUpdate}</span>}
      </button>
    </div>
  )
}
