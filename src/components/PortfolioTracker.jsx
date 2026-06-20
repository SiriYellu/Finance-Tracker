import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const PROXY = 'https://corsproxy.io/?'
const YF = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols='

async function fetchQuotes(symbols) {
  const url = `${PROXY}${encodeURIComponent(YF + symbols.join(','))}`
  const res = await fetch(url)
  const data = await res.json()
  return data?.quoteResponse?.result || []
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#84cc16']

const DEFAULT_HOLDINGS = [
  { symbol: 'AAPL', shares: 10, avgCost: 170.00 },
  { symbol: 'NVDA', shares: 5, avgCost: 495.00 },
  { symbol: 'VOO', shares: 8, avgCost: 410.00 },
]

export default function PortfolioTracker() {
  const [holdings, setHoldings] = useState(() => {
    const saved = localStorage.getItem('portfolio')
    return saved ? JSON.parse(saved) : DEFAULT_HOLDINGS
  })
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ symbol: '', shares: '', avgCost: '' })

  useEffect(() => {
    localStorage.setItem('portfolio', JSON.stringify(holdings))
  }, [holdings])

  const refresh = useCallback(async () => {
    if (!holdings.length) return
    setLoading(true)
    try {
      const results = await fetchQuotes(holdings.map(h => h.symbol))
      const map = {}
      results.forEach(q => { map[q.symbol] = q.regularMarketPrice })
      setPrices(map)
    } catch {}
    finally { setLoading(false) }
  }, [holdings])

  useEffect(() => { refresh() }, [])

  const addHolding = () => {
    if (!form.symbol || !form.shares || !form.avgCost) return
    setHoldings(prev => [...prev, {
      symbol: form.symbol.toUpperCase(),
      shares: parseFloat(form.shares),
      avgCost: parseFloat(form.avgCost),
    }])
    setForm({ symbol: '', shares: '', avgCost: '' })
  }

  const totalCost = holdings.reduce((s, h) => s + h.shares * h.avgCost, 0)
  const totalValue = holdings.reduce((s, h) => s + h.shares * (prices[h.symbol] || h.avgCost), 0)
  const totalPnL = totalValue - totalCost
  const totalPct = totalCost ? (totalPnL / totalCost) * 100 : 0

  const pieData = holdings.map((h, i) => ({
    name: h.symbol,
    value: parseFloat((h.shares * (prices[h.symbol] || h.avgCost)).toFixed(2)),
    color: COLORS[i % COLORS.length],
  }))

  const fmtDollar = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Portfolio Tracker</h2>
        <button onClick={refresh} disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-50 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Value', value: `$${fmtDollar(totalValue)}`, color: 'text-gray-900 dark:text-white' },
          { label: 'Total P&L', value: `${totalPnL >= 0 ? '+' : ''}$${fmtDollar(totalPnL)}`, color: totalPnL >= 0 ? 'text-emerald-500' : 'text-red-500' },
          { label: 'Return', value: `${totalPct >= 0 ? '+' : ''}${totalPct.toFixed(2)}%`, color: totalPct >= 0 ? 'text-emerald-500' : 'text-red-500' },
        ].map(c => (
          <div key={c.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Holdings */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-3 gap-2 mb-2">
              <input placeholder="Symbol" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input placeholder="Shares" type="number" value={form.shares} onChange={e => setForm({ ...form, shares: e.target.value })}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input placeholder="Avg Cost" type="number" value={form.avgCost} onChange={e => setForm({ ...form, avgCost: e.target.value })}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <button onClick={addHolding}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1">
              <Plus className="w-4 h-4" /> Add Holding
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-4 py-2">Symbol</th>
                <th className="text-right px-4 py-2">Shares</th>
                <th className="text-right px-4 py-2">Avg</th>
                <th className="text-right px-4 py-2">P&L</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => {
                const cur = prices[h.symbol]
                const pnl = cur ? (cur - h.avgCost) * h.shares : null
                const pnlPct = cur ? ((cur - h.avgCost) / h.avgCost) * 100 : null
                const isUp = pnl !== null && pnl >= 0
                return (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="font-semibold">{h.symbol}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right font-mono">{h.shares}</td>
                    <td className="px-4 py-2 text-right font-mono">${h.avgCost.toFixed(2)}</td>
                    <td className={`px-4 py-2 text-right font-mono text-xs ${pnl !== null ? (isUp ? 'text-emerald-500' : 'text-red-500') : 'text-gray-400'}`}>
                      {pnl !== null ? (
                        <div>
                          <div>{isUp ? '+' : ''}${Math.abs(pnl).toFixed(0)}</div>
                          <div>{isUp ? '+' : ''}{pnlPct?.toFixed(1)}%</div>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-2 py-2">
                      <button onClick={() => setHoldings(p => p.filter((_, j) => j !== i))}
                        className="text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pie chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-sm font-semibold mb-3">Portfolio Allocation</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Value']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
