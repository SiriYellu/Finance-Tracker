import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, DollarSign, Clock, Star, ChevronRight, Zap } from 'lucide-react'

const INVESTMENTS = [
  {
    symbol: 'VOO', name: 'Vanguard S&P 500 ETF', category: 'US Stocks',
    annualReturn: 0.10, risk: 'Medium', riskScore: 6,
    color: '#10b981', gradient: 'from-emerald-400 to-emerald-600',
    why: 'Tracks the S&P 500 — the most reliable long-term wealth builder in history.',
    badge: '⭐ Best Overall',
  },
  {
    symbol: 'QQQ', name: 'NASDAQ-100 ETF', category: 'Tech Growth',
    annualReturn: 0.13, risk: 'Medium-High', riskScore: 8,
    color: '#3b82f6', gradient: 'from-blue-400 to-blue-600',
    why: 'Top 100 tech companies including Apple, Nvidia, Microsoft. Highest growth potential.',
    badge: '🚀 Highest Growth',
  },
  {
    symbol: 'SCHD', name: 'Schwab Dividend ETF', category: 'Dividend',
    annualReturn: 0.085, risk: 'Medium-Low', riskScore: 5,
    color: '#8b5cf6', gradient: 'from-purple-400 to-purple-600',
    why: 'Pays dividends every quarter + stock growth. Great for compounding income.',
    badge: '💰 Best Income',
  },
  {
    symbol: 'VXUS', name: 'Total International ETF', category: 'International',
    annualReturn: 0.075, risk: 'Medium', riskScore: 6,
    color: '#f59e0b', gradient: 'from-amber-400 to-amber-600',
    why: 'Invest in 7,000+ companies worldwide. Diversifies beyond just the US market.',
    badge: '🌍 Best Diversifier',
  },
  {
    symbol: 'BND', name: 'Total Bond Market ETF', category: 'Bonds',
    annualReturn: 0.045, risk: 'Low', riskScore: 3,
    color: '#6b7280', gradient: 'from-gray-400 to-gray-600',
    why: 'Stable, low-risk returns. Perfect for preserving capital with modest growth.',
    badge: '🛡️ Safest Option',
  },
]

function calcReturns(amount, rate, years) {
  return Math.round(amount * Math.pow(1 + rate, years))
}

function fmt(n) {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}k`
  return `$${n.toFixed(2)}`
}

function fmtGain(invested, final) {
  const gain = final - invested
  const pct = ((gain / invested) * 100).toFixed(0)
  return { gain: fmt(gain), pct, isUp: gain >= 0 }
}

const HORIZONS = [
  { label: '1 Year', years: 1 },
  { label: '5 Years', years: 5 },
  { label: '10 Years', years: 10 },
  { label: '20 Years', years: 20 },
]

const QUICK_AMOUNTS = [10, 50, 100, 500, 1000, 5000]

export default function QuickInvest() {
  const [amount, setAmount] = useState(100)
  const [monthly, setMonthly] = useState(false)
  const [selected, setSelected] = useState('VOO')
  const [horizon, setHorizon] = useState(10)

  const selectedInv = INVESTMENTS.find(i => i.symbol === selected) || INVESTMENTS[0]

  const chartData = useMemo(() => {
    const inv = selectedInv
    const data = []
    let balance = amount
    const monthlyRate = inv.annualReturn / 12
    for (let y = 0; y <= horizon; y++) {
      data.push({
        year: y,
        value: Math.round(balance),
        invested: monthly ? Math.round(amount * 12 * y + amount) : amount,
      })
      if (monthly) {
        for (let m = 0; m < 12; m++) balance = (balance + amount) * (1 + monthlyRate)
      } else {
        balance = amount * Math.pow(1 + inv.annualReturn, y + 1)
      }
    }
    return data
  }, [amount, selectedInv, horizon, monthly])

  const finalValue = chartData[chartData.length - 1]?.value || amount
  const totalInvested = monthly ? amount * 12 * horizon + amount : amount
  const totalGain = finalValue - totalInvested
  const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(0) : 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black">Quick Invest Calculator</h2>
          <p className="text-xs text-gray-500">Enter any amount — instantly see your best options and returns</p>
        </div>
      </div>

      {/* Amount Input */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1.5 font-medium uppercase tracking-wider">I want to invest</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-400">$</span>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={e => setAmount(Math.max(1, Number(e.target.value)))}
                className="w-full pl-10 pr-4 py-4 text-3xl font-black bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Investment type</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <button onClick={() => setMonthly(false)}
                className={`px-4 py-2.5 text-sm font-semibold transition-colors ${!monthly ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                One-time
              </button>
              <button onClick={() => setMonthly(true)}
                className={`px-4 py-2.5 text-sm font-semibold transition-colors ${monthly ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                Monthly
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Time horizon</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {[5, 10, 20, 30].map(y => (
                <button key={y} onClick={() => setHorizon(y)}
                  className={`px-3 py-2.5 text-sm font-semibold transition-colors ${horizon === y ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  {y}yr
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick amount buttons */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-gray-400 self-center mr-1">Quick:</span>
          {QUICK_AMOUNTS.map(a => (
            <button key={a} onClick={() => setAmount(a)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${amount === a ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600'}`}>
              ${a.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Best Investment Cards */}
      <h3 className="text-base font-bold mb-3 flex items-center gap-2">
        <Star className="w-4 h-4 text-emerald-500" />
        Best places to invest {fmt(amount)} {monthly ? '/month' : ''}
      </h3>
      <div className="grid gap-3 mb-6">
        {INVESTMENTS.map(inv => {
          const oneTime = monthly
            ? (() => { let b = amount; for (let y = 0; y < horizon; y++) for (let m = 0; m < 12; m++) b = (b + amount) * (1 + inv.annualReturn / 12); return Math.round(b) })()
            : calcReturns(amount, inv.annualReturn, horizon)
          const invested = monthly ? amount * 12 * horizon + amount : amount
          const gain = oneTime - invested
          const gainPct = ((gain / invested) * 100).toFixed(0)
          const isSelected = selected === inv.symbol

          return (
            <button key={inv.symbol} onClick={() => setSelected(inv.symbol)}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/10' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'}`}>
              <div className="flex items-center gap-4">
                {/* Symbol badge */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${inv.gradient} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-xs font-black">{inv.symbol}</span>
                </div>

                {/* Name & why */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">{inv.symbol}</span>
                    <span className="text-xs text-gray-500">{inv.name}</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400">{inv.badge}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{inv.why}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>Risk: <span className={`font-semibold ${inv.riskScore <= 4 ? 'text-emerald-500' : inv.riskScore <= 6 ? 'text-amber-500' : 'text-red-500'}`}>{inv.risk}</span></span>
                    <span>Avg return: <span className="font-semibold text-emerald-500">{(inv.annualReturn * 100).toFixed(1)}%/yr</span></span>
                  </div>
                </div>

                {/* Returns */}
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-black" style={{ color: inv.color }}>{fmt(oneTime)}</div>
                  <div className="text-xs text-gray-500">after {horizon} years</div>
                  <div className={`text-sm font-bold mt-0.5 ${gain >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    +{fmt(gain)} ({gainPct}%)
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${isSelected ? 'text-emerald-500' : 'text-gray-400'}`} />
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected Investment Detail */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedInv.gradient} flex items-center justify-center`}>
            <span className="text-white text-sm font-black">{selectedInv.symbol}</span>
          </div>
          <div>
            <p className="font-bold">{selectedInv.symbol} — {selectedInv.name}</p>
            <p className="text-xs text-gray-500">{selectedInv.why}</p>
          </div>
        </div>

        {/* Return milestones */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {HORIZONS.map(({ label, years: y }) => {
            const val = monthly
              ? (() => { let b = amount; for (let yr = 0; yr < y; yr++) for (let m = 0; m < 12; m++) b = (b + amount) * (1 + selectedInv.annualReturn / 12); return Math.round(b) })()
              : calcReturns(amount, selectedInv.annualReturn, y)
            const inv = monthly ? amount * 12 * y + amount : amount
            const g = fmtGain(inv, val)
            return (
              <div key={label} className={`rounded-xl p-3 text-center ${y === horizon ? 'bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-500' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <div className="text-xs text-gray-500 mb-1 font-medium">{label}</div>
                <div className="text-lg font-black" style={{ color: selectedInv.color }}>{fmt(val)}</div>
                <div className="text-xs text-emerald-500 font-semibold">+{g.pct}%</div>
                <div className="text-xs text-gray-400">+{g.gain} gain</div>
              </div>
            )
          })}
        </div>

        {/* Growth chart */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold">{fmt(amount)} {monthly ? '/month ' : 'one-time '}→ Growth over {horizon} years</span>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded inline-block" style={{ background: selectedInv.color }} /> Value</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-gray-400 inline-block" style={{ borderTop: '2px dashed #9ca3af' }} /> Invested</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedInv.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={selectedInv.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-10" />
              <XAxis dataKey="year" tickFormatter={v => `${v}yr`} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} width={55} />
              <Tooltip
                formatter={(v, name) => [fmt(v), name === 'value' ? 'Portfolio Value' : 'Amount Invested']}
                labelFormatter={v => `Year ${v}`}
              />
              <Area type="monotone" dataKey="invested" stroke="#9ca3af" strokeWidth={1.5} fill="none" strokeDasharray="4 4" name="invested" />
              <Area type="monotone" dataKey="value" stroke={selectedInv.color} strokeWidth={2.5} fill="url(#invGrad)" name="value" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stat */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'You Invest', value: fmt(totalInvested), sub: monthly ? `$${amount}/month` : 'one-time', color: 'text-gray-700 dark:text-gray-200' },
            { label: `After ${horizon} Years`, value: fmt(finalValue), sub: `${(selectedInv.annualReturn * 100).toFixed(1)}% avg/yr`, color: 'text-emerald-500' },
            { label: 'Total Profit', value: `+${fmt(Math.max(0, totalGain))}`, sub: `${gainPct}% gain`, color: 'text-blue-500' },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">{s.label}</div>
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-side comparison table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold text-sm">Full Comparison — {fmt(amount)} {monthly ? '/month' : 'invested'}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-2.5">Investment</th>
                <th className="text-right px-4 py-2.5">Avg Return</th>
                <th className="text-right px-4 py-2.5">1 Year</th>
                <th className="text-right px-4 py-2.5">5 Years</th>
                <th className="text-right px-4 py-2.5">10 Years</th>
                <th className="text-right px-4 py-2.5">20 Years</th>
                <th className="text-right px-4 py-2.5">Risk</th>
              </tr>
            </thead>
            <tbody>
              {INVESTMENTS.map(inv => {
                const vals = [1, 5, 10, 20].map(y =>
                  monthly
                    ? (() => { let b = amount; for (let yr = 0; yr < y; yr++) for (let m = 0; m < 12; m++) b = (b + amount) * (1 + inv.annualReturn / 12); return Math.round(b) })()
                    : calcReturns(amount, inv.annualReturn, y)
                )
                return (
                  <tr key={inv.symbol}
                    onClick={() => setSelected(inv.symbol)}
                    className={`border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer transition-colors ${selected === inv.symbol ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: inv.color }} />
                        <span className="font-bold">{inv.symbol}</span>
                        <span className="text-xs text-gray-400 hidden md:inline">{inv.badge}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-500">{(inv.annualReturn * 100).toFixed(1)}%</td>
                    {vals.map((v, i) => (
                      <td key={i} className="px-4 py-3 text-right font-mono font-semibold" style={{ color: inv.color }}>
                        {fmt(v)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${inv.riskScore <= 4 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : inv.riskScore <= 6 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                        {inv.risk}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
          * Returns are based on historical averages. Past performance does not guarantee future results. Not financial advice.
        </div>
      </div>
    </div>
  )
}
