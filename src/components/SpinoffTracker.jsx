import { useState, useCallback, useEffect } from 'react'
import { Plus, Trash2, RefreshCw, Target, TrendingUp, TrendingDown, Edit2, Check } from 'lucide-react'

const PROXY = 'https://corsproxy.io/?'
const YF = 'https://query1.finance.yahoo.com/v7/finance/quote?symbols='

async function fetchQuotes(symbols) {
  const url = `${PROXY}${encodeURIComponent(YF + symbols.join(','))}`
  const res = await fetch(url)
  const data = await res.json()
  return data?.quoteResponse?.result || []
}

const DEFAULT_POSITIONS = [
  { symbol: 'SNDK', entryPrice: 48.50, analystTarget: 75.00, note: 'AI Storage', sector: 'Tech' },
  { symbol: 'NVDA', entryPrice: 495.00, analystTarget: 1200.00, note: 'AI Chips', sector: 'Semi' },
  { symbol: 'VOO', entryPrice: 410.00, analystTarget: 520.00, note: 'S&P 500 ETF', sector: 'ETF' },
  { symbol: 'TSM', entryPrice: 120.00, analystTarget: 200.00, note: 'Chip Mfg', sector: 'Semi' },
  { symbol: 'ANET', entryPrice: 260.00, analystTarget: 400.00, note: 'AI Networking', sector: 'Tech' },
]

const SECTOR_COLORS = {
  Tech: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Semi: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  ETF: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Finance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

export default function SpinoffTracker() {
  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem('spinoff')
    return saved ? JSON.parse(saved) : DEFAULT_POSITIONS
  })
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ symbol: '', entryPrice: '', analystTarget: '', note: '', sector: 'Tech' })
  const [showForm, setShowForm] = useState(false)
  const [editIdx, setEditIdx] = useState(null)
  const [editEntry, setEditEntry] = useState('')

  useEffect(() => {
    localStorage.setItem('spinoff', JSON.stringify(positions))
  }, [positions])

  const refresh = useCallback(async () => {
    if (!positions.length) return
    setLoading(true)
    try {
      const results = await fetchQuotes(positions.map(p => p.symbol))
      const map = {}
      results.forEach(q => { map[q.symbol] = q.regularMarketPrice })
      setPrices(map)
    } catch {}
    finally { setLoading(false) }
  }, [positions])

  useEffect(() => { refresh() }, [])

  const addPosition = () => {
    if (!form.symbol || !form.entryPrice) return
    setPositions(prev => [...prev, {
      symbol: form.symbol.toUpperCase(),
      entryPrice: parseFloat(form.entryPrice),
      analystTarget: parseFloat(form.analystTarget) || null,
      note: form.note,
      sector: form.sector,
    }])
    setForm({ symbol: '', entryPrice: '', analystTarget: '', note: '', sector: 'Tech' })
    setShowForm(false)
  }

  const saveEdit = (i) => {
    setPositions(p => p.map((pos, j) => j === i ? { ...pos, entryPrice: parseFloat(editEntry) || pos.entryPrice } : pos))
    setEditIdx(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Spin-off & Breakout Tracker</h2>
        <div className="flex gap-2">
          <button onClick={refresh} disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input placeholder="Symbol" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <input placeholder="Entry Price" type="number" value={form.entryPrice} onChange={e => setForm({ ...form, entryPrice: e.target.value })}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <input placeholder="Analyst Target" type="number" value={form.analystTarget} onChange={e => setForm({ ...form, analystTarget: e.target.value })}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <input placeholder="Note" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <select value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {Object.keys(SECTOR_COLORS).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={addPosition} className="w-full mt-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium">
            Add Position
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {positions.map((pos, i) => {
          const current = prices[pos.symbol]
          const gainPct = current ? ((current - pos.entryPrice) / pos.entryPrice) * 100 : null
          const upside = current && pos.analystTarget ? ((pos.analystTarget - current) / current) * 100 : null
          const isUp = gainPct !== null && gainPct >= 0
          const progressPct = pos.analystTarget && gainPct !== null
            ? Math.min(100, Math.max(0, gainPct / ((pos.analystTarget - pos.entryPrice) / pos.entryPrice * 100) * 100))
            : 0

          return (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-lg font-bold">{pos.symbol}</span>
                  {pos.sector && (
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${SECTOR_COLORS[pos.sector] || SECTOR_COLORS.Other}`}>
                      {pos.sector}
                    </span>
                  )}
                  {pos.note && <div className="text-xs text-gray-500 mt-0.5">{pos.note}</div>}
                </div>
                <button onClick={() => setPositions(p => p.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Entry</span>
                  <div className="flex items-center gap-1">
                    {editIdx === i ? (
                      <>
                        <input type="number" value={editEntry} onChange={e => setEditEntry(e.target.value)}
                          className="w-20 px-2 py-0.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono focus:outline-none" />
                        <button onClick={() => saveEdit(i)} className="text-emerald-500"><Check className="w-3 h-3" /></button>
                      </>
                    ) : (
                      <>
                        <span className="font-mono">${pos.entryPrice.toFixed(2)}</span>
                        <button onClick={() => { setEditIdx(i); setEditEntry(pos.entryPrice) }}
                          className="text-gray-400 hover:text-blue-500 ml-1"><Edit2 className="w-3 h-3" /></button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Current</span>
                  <span className="font-mono">{current ? `$${current.toFixed(2)}` : <span className="text-gray-400">—</span>}</span>
                </div>
                {gainPct !== null && (
                  <div className={`flex justify-between font-semibold ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                    <span className="flex items-center gap-1">
                      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      Gain/Loss
                    </span>
                    <span>{isUp ? '+' : ''}{gainPct.toFixed(2)}%</span>
                  </div>
                )}
                {pos.analystTarget && (
                  <div className="flex justify-between text-blue-500">
                    <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Target</span>
                    <span className="font-mono">${pos.analystTarget.toFixed(2)}</span>
                  </div>
                )}
                {upside !== null && (
                  <div className="flex justify-between text-purple-500 text-xs">
                    <span>Upside to target</span>
                    <span>{upside > 0 ? '+' : ''}{upside.toFixed(1)}%</span>
                  </div>
                )}
              </div>

              {pos.analystTarget && (
                <div className="mt-3">
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{progressPct.toFixed(0)}% to analyst target</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
