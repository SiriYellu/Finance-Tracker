import { useState, useCallback, useEffect } from 'react'
import { Search, Plus, Trash2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'

const PROXY = 'https://corsproxy.io/?'
const YF = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols='

async function fetchQuotes(symbols) {
  const url = `${PROXY}${encodeURIComponent(YF + symbols.join(','))}`
  const res = await fetch(url)
  const data = await res.json()
  return data?.quoteResponse?.result || []
}

function fmt(n) {
  if (!n) return 'N/A'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  return `$${n.toLocaleString()}`
}

const DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA']

export default function StockWatchlist() {
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('watchlist')
    return saved ? JSON.parse(saved) : DEFAULT_WATCHLIST
  })
  const [quotes, setQuotes] = useState({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  const refresh = useCallback(async () => {
    if (!watchlist.length) return
    setLoading(true)
    setError('')
    try {
      const results = await fetchQuotes(watchlist)
      const map = {}
      results.forEach(q => { map[q.symbol] = q })
      setQuotes(map)
    } catch {
      setError('Failed to fetch prices. Check your connection.')
    } finally {
      setLoading(false)
    }
  }, [watchlist])

  useEffect(() => { refresh() }, [])

  const addTicker = async () => {
    const ticker = search.trim().toUpperCase()
    if (!ticker || watchlist.includes(ticker)) { setSearch(''); return }
    setLoading(true); setError('')
    try {
      const results = await fetchQuotes([ticker])
      if (!results.length) throw new Error()
      const map = { ...quotes }
      results.forEach(q => { map[q.symbol] = q })
      setQuotes(map)
      setWatchlist(prev => [...prev, ticker])
      setSearch('')
    } catch {
      setError(`Could not find "${ticker}". Check the symbol.`)
    } finally { setLoading(false) }
  }

  const remove = (ticker) => {
    setWatchlist(p => p.filter(t => t !== ticker))
    setQuotes(p => { const n = { ...p }; delete n[ticker]; return n })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Stock Watchlist</h2>
        <button onClick={refresh} disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-50 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTicker()}
            placeholder="Search ticker (e.g. TSLA)…"
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <button onClick={addTicker}
          className="flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 text-xs text-gray-500 uppercase">
              <th className="text-left px-4 py-3">Symbol</th>
              <th className="text-right px-4 py-3">Price</th>
              <th className="text-right px-4 py-3">Change</th>
              <th className="text-right px-4 py-3 hidden md:table-cell">52W High</th>
              <th className="text-right px-4 py-3 hidden md:table-cell">52W Low</th>
              <th className="text-right px-4 py-3 hidden lg:table-cell">Volume</th>
              <th className="text-right px-4 py-3 hidden lg:table-cell">Mkt Cap</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {watchlist.map(ticker => {
              const q = quotes[ticker]
              const change = q?.regularMarketChange
              const pct = q?.regularMarketChangePercent
              const isUp = change >= 0
              return (
                <tr key={ticker} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold">{ticker}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[140px]">{q?.shortName || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">
                    {q ? `$${q.regularMarketPrice?.toFixed(2)}` : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {q ? (
                      <div className={`flex flex-col items-end ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                        <span className="flex items-center gap-1 font-mono text-sm">
                          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {isUp ? '+' : ''}{change?.toFixed(2)}
                        </span>
                        <span className="text-xs">{isUp ? '+' : ''}{pct?.toFixed(2)}%</span>
                      </div>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500 hidden md:table-cell font-mono">
                    {q?.fiftyTwoWeekHigh ? `$${q.fiftyTwoWeekHigh.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500 hidden md:table-cell font-mono">
                    {q?.fiftyTwoWeekLow ? `$${q.fiftyTwoWeekLow.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500 hidden lg:table-cell">
                    {q?.regularMarketVolume ? (q.regularMarketVolume / 1e6).toFixed(1) + 'M' : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500 hidden lg:table-cell">
                    {fmt(q?.marketCap)}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove(ticker)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
            {!watchlist.length && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-500">No stocks in watchlist.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-2">Data via Yahoo Finance · Click Refresh to update</p>
    </div>
  )
}
