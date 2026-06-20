import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Star, ChevronRight, Zap, Flame, Shield, Globe, BarChart2, Filter } from 'lucide-react'

const ALL_INVESTMENTS = [
  // --- ETFs (safer, diversified) ---
  {
    symbol: 'VOO', name: 'Vanguard S&P 500 ETF', category: 'ETF', type: 'etf',
    annualReturn: 0.105, risk: 'Medium', riskScore: 6,
    color: '#10b981', gradient: 'from-emerald-400 to-emerald-600',
    why: 'Tracks the S&P 500. Most reliable long-term wealth builder in history. Used by Warren Buffett.',
    badge: '⭐ Best Overall', aiPick: true, momentum: 92, trend: '+12.4% YTD',
  },
  {
    symbol: 'QQQ', name: 'NASDAQ-100 ETF', category: 'ETF', type: 'etf',
    annualReturn: 0.135, risk: 'Medium-High', riskScore: 7,
    color: '#3b82f6', gradient: 'from-blue-400 to-blue-600',
    why: 'Top 100 tech & AI companies: Apple, Nvidia, Microsoft. Highest ETF growth in the past decade.',
    badge: '🚀 Best Growth ETF', aiPick: true, momentum: 96, trend: '+18.2% YTD',
  },
  {
    symbol: 'SCHD', name: 'Schwab Dividend ETF', category: 'ETF', type: 'etf',
    annualReturn: 0.09, risk: 'Medium-Low', riskScore: 5,
    color: '#8b5cf6', gradient: 'from-purple-400 to-purple-600',
    why: 'Pays quarterly dividends + stock appreciation. Great compounding income with lower volatility.',
    badge: '💰 Best Income', aiPick: false, momentum: 78, trend: '+7.1% YTD',
  },
  {
    symbol: 'VTI', name: 'Total US Stock Market', category: 'ETF', type: 'etf',
    annualReturn: 0.105, risk: 'Medium', riskScore: 6,
    color: '#06b6d4', gradient: 'from-cyan-400 to-cyan-600',
    why: 'Entire US stock market in one fund — 4,000+ companies. Maximum diversification.',
    badge: '🌐 Most Diversified', aiPick: false, momentum: 88, trend: '+11.8% YTD',
  },
  {
    symbol: 'VXUS', name: 'Total International ETF', category: 'ETF', type: 'etf',
    annualReturn: 0.08, risk: 'Medium', riskScore: 6,
    color: '#f59e0b', gradient: 'from-amber-400 to-amber-600',
    why: '7,000+ companies worldwide. Protects against US-only concentration risk.',
    badge: '🌍 Global Exposure', aiPick: false, momentum: 72, trend: '+9.3% YTD',
  },

  // --- Rapidly Growing Stocks ---
  {
    symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'AI Chips', type: 'stock',
    annualReturn: 0.52, risk: 'High', riskScore: 9,
    color: '#76c442', gradient: 'from-green-400 to-green-600',
    why: 'Dominates AI chip market. Powers ChatGPT, data centers, robotics. Revenue up 200%+ YoY.',
    badge: '🔥 #1 AI Stock', aiPick: true, momentum: 99, trend: '+157% YTD',
    warning: 'Highly volatile — can drop 30–50% in corrections',
  },
  {
    symbol: 'MSFT', name: 'Microsoft Corporation', category: 'AI / Cloud', type: 'stock',
    annualReturn: 0.22, risk: 'Medium-High', riskScore: 7,
    color: '#0078d4', gradient: 'from-blue-500 to-blue-700',
    why: 'Azure cloud + OpenAI partnership (ChatGPT). Most profitable tech company. Steady growth.',
    badge: '💎 Most Reliable AI', aiPick: true, momentum: 94, trend: '+28.5% YTD',
  },
  {
    symbol: 'AAPL', name: 'Apple Inc.', category: 'Tech', type: 'stock',
    annualReturn: 0.195, risk: 'Medium', riskScore: 6,
    color: '#555555', gradient: 'from-gray-500 to-gray-700',
    why: 'World\'s most valuable company. Services revenue growing 15%/yr. iPhone 17 + Apple Intelligence AI.',
    badge: '📱 Most Stable Tech', aiPick: true, momentum: 88, trend: '+22.1% YTD',
  },
  {
    symbol: 'META', name: 'Meta Platforms', category: 'AI / Social', type: 'stock',
    annualReturn: 0.31, risk: 'High', riskScore: 8,
    color: '#0668E1', gradient: 'from-blue-500 to-indigo-600',
    why: 'Instagram, WhatsApp, Facebook + #1 open source AI (LLaMA). Ad revenue at all-time high.',
    badge: '📈 Fastest Rebound', aiPick: true, momentum: 97, trend: '+64% YTD',
  },
  {
    symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'Cloud / AI', type: 'stock',
    annualReturn: 0.24, risk: 'Medium-High', riskScore: 7,
    color: '#FF9900', gradient: 'from-orange-400 to-orange-600',
    why: 'AWS cloud dominates enterprise AI. E-commerce + logistics moat. Operating profit tripled.',
    badge: '☁️ Cloud Powerhouse', aiPick: true, momentum: 91, trend: '+32.4% YTD',
  },
  {
    symbol: 'GOOGL', name: 'Alphabet (Google)', category: 'AI / Search', type: 'stock',
    annualReturn: 0.21, risk: 'Medium-High', riskScore: 7,
    color: '#4285F4', gradient: 'from-blue-400 to-red-500',
    why: 'Gemini AI + YouTube + Cloud. Search monopoly. Trading at discount vs peers. Huge buybacks.',
    badge: '🔍 Best Value AI', aiPick: true, momentum: 89, trend: '+24.7% YTD',
  },
  {
    symbol: 'TSLA', name: 'Tesla Inc.', category: 'EV / AI / Robotics', type: 'stock',
    annualReturn: 0.28, risk: 'Very High', riskScore: 10,
    color: '#cc0000', gradient: 'from-red-500 to-red-700',
    why: 'EV leader + Full Self Driving AI + Optimus robot. Extremely volatile but massive upside potential.',
    badge: '⚡ Highest Upside', aiPick: false, momentum: 82, trend: '+43% YTD',
    warning: 'Very high risk — not for short-term investors',
  },
  {
    symbol: 'PLTR', name: 'Palantir Technologies', category: 'AI / Data', type: 'stock',
    annualReturn: 0.38, risk: 'Very High', riskScore: 9,
    color: '#9333ea', gradient: 'from-purple-500 to-purple-700',
    why: 'AI platform for government & enterprise. Fastest growing AI software company. Added to S&P 500.',
    badge: '🤖 AI Software Pick', aiPick: true, momentum: 98, trend: '+97% YTD',
    warning: 'Highly speculative — small position only',
  },
  {
    symbol: 'TSM', name: 'Taiwan Semiconductor', category: 'Chips', type: 'stock',
    annualReturn: 0.19, risk: 'Medium-High', riskScore: 7,
    color: '#0ea5e9', gradient: 'from-sky-400 to-sky-600',
    why: 'Makes chips for Apple, Nvidia, AMD. Irreplaceable in global tech supply chain. CHIPS Act winner.',
    badge: '🔩 Chip Backbone', aiPick: true, momentum: 87, trend: '+26.8% YTD',
  },
]

const CATEGORIES = ['All', 'AI Picks', 'ETFs', 'Stocks', 'High Growth', 'Low Risk']

function filterInvestments(filter) {
  switch (filter) {
    case 'AI Picks': return ALL_INVESTMENTS.filter(i => i.aiPick)
    case 'ETFs': return ALL_INVESTMENTS.filter(i => i.type === 'etf')
    case 'Stocks': return ALL_INVESTMENTS.filter(i => i.type === 'stock')
    case 'High Growth': return ALL_INVESTMENTS.filter(i => i.annualReturn >= 0.20)
    case 'Low Risk': return ALL_INVESTMENTS.filter(i => i.riskScore <= 6)
    default: return ALL_INVESTMENTS
  }
}

function fmt(n) {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}k`
  return `$${n.toFixed(2)}`
}

function calcFinal(amount, rate, years, monthly) {
  if (monthly) {
    let b = amount
    const mr = rate / 12
    for (let y = 0; y < years; y++) for (let m = 0; m < 12; m++) b = (b + amount) * (1 + mr)
    return Math.round(b)
  }
  return Math.round(amount * Math.pow(1 + rate, years))
}

const QUICK_AMOUNTS = [10, 50, 100, 500, 1000, 5000]
const HORIZONS = [1, 5, 10, 20]

export default function QuickInvest() {
  const [amount, setAmount] = useState(100)
  const [monthly, setMonthly] = useState(false)
  const [selected, setSelected] = useState('VOO')
  const [horizon, setHorizon] = useState(10)
  const [filter, setFilter] = useState('AI Picks')

  const visibleList = useMemo(() => filterInvestments(filter), [filter])
  const selectedInv = ALL_INVESTMENTS.find(i => i.symbol === selected) || ALL_INVESTMENTS[0]

  const chartData = useMemo(() => {
    const data = []
    let balance = amount
    const mr = selectedInv.annualReturn / 12
    for (let y = 0; y <= horizon; y++) {
      data.push({
        year: y,
        value: Math.round(balance),
        invested: monthly ? Math.round(amount * 12 * y + amount) : amount,
      })
      if (monthly) for (let m = 0; m < 12; m++) balance = (balance + amount) * (1 + mr)
      else balance = amount * Math.pow(1 + selectedInv.annualReturn, y + 1)
    }
    return data
  }, [amount, selectedInv, horizon, monthly])

  const totalInvested = monthly ? amount * 12 * horizon + amount : amount
  const finalValue = chartData[chartData.length - 1]?.value || amount
  const totalGain = finalValue - totalInvested
  const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(0) : 0

  const riskColor = (score) => score <= 4 ? 'text-emerald-500' : score <= 6 ? 'text-amber-500' : score <= 8 ? 'text-orange-500' : 'text-red-500'
  const riskBg = (score) => score <= 4 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : score <= 6 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black">Quick Invest Calculator</h2>
          <p className="text-xs text-gray-500">Type any amount — instantly see your best options and exact returns</p>
        </div>
      </div>

      {/* Amount Input Panel */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 mb-5">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Dollar input */}
          <div className="flex-1">
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">I want to invest</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-emerald-500">$</span>
              <input type="number" min={1} value={amount}
                onChange={e => setAmount(Math.max(1, Number(e.target.value)))}
                className="w-full pl-10 pr-4 py-4 text-3xl font-black bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors" />
            </div>
          </div>
          {/* One-time vs Monthly */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">Frequency</label>
            <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 h-[58px]">
              {[['One-time', false], ['Monthly', true]].map(([label, val]) => (
                <button key={label} onClick={() => setMonthly(val)}
                  className={`px-5 text-sm font-bold transition-colors ${monthly === val ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* Horizon */}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">Time horizon</label>
            <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 h-[58px]">
              {[5, 10, 20, 30].map(y => (
                <button key={y} onClick={() => setHorizon(y)}
                  className={`px-3 text-sm font-bold transition-colors ${horizon === y ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  {y}yr
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Quick amounts */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs text-gray-400 font-medium">Quick select:</span>
          {QUICK_AMOUNTS.map(a => (
            <button key={a} onClick={() => setAmount(a)}
              className={`px-3 py-1.5 text-sm rounded-lg font-semibold transition-all ${amount === a ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600'}`}>
              ${a.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 text-sm rounded-full font-semibold transition-all ${filter === cat ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-emerald-300 hover:text-emerald-600'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Investment cards */}
      <div className="grid gap-3 mb-6">
        {visibleList.map(inv => {
          const final = calcFinal(amount, inv.annualReturn, horizon, monthly)
          const invested = monthly ? amount * 12 * horizon + amount : amount
          const gain = final - invested
          const pct = ((gain / invested) * 100).toFixed(0)
          const isSelected = selected === inv.symbol

          return (
            <button key={inv.symbol} onClick={() => setSelected(inv.symbol)}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/10' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-emerald-300 dark:hover:border-emerald-700'}`}>

              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${inv.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <span className="text-white text-xs font-black text-center leading-tight">{inv.symbol}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-base">{inv.symbol}</span>
                        {inv.aiPick && (
                          <span className="text-xs bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-2 py-0.5 rounded-full font-bold">AI Pick</span>
                        )}
                        <span className="text-xs text-gray-400 hidden sm:inline">{inv.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs font-medium text-gray-500">{inv.badge}</span>
                        <span className="text-xs text-emerald-500 font-semibold">{inv.trend}</span>
                      </div>
                    </div>
                    {/* Return result */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-black" style={{ color: inv.color }}>{fmt(final)}</div>
                      <div className="text-xs text-gray-400">after {horizon}yr</div>
                      <div className="text-sm font-bold text-emerald-500">+{fmt(gain)} ({pct}%)</div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{inv.why}</p>

                  {inv.warning && (
                    <p className="text-xs text-red-400 mt-1 font-medium">⚠ {inv.warning}</p>
                  )}

                  {/* Mini metrics */}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400">Risk: <span className={`font-bold ${riskColor(inv.riskScore)}`}>{inv.risk}</span></span>
                    <span className="text-xs text-gray-400">Avg return: <span className="font-bold text-emerald-500">{(inv.annualReturn * 100).toFixed(0)}%/yr</span></span>
                    <span className="text-xs text-gray-400">Momentum: <span className="font-bold text-blue-500">{inv.momentum}/100</span></span>
                    <span className="text-xs text-gray-400 hidden md:inline">Type: <span className="font-bold">{inv.category}</span></span>
                  </div>

                  {/* Momentum bar */}
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${inv.momentum}%`, background: inv.color }} />
                    </div>
                    <span className="text-xs text-gray-400">momentum</span>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 flex-shrink-0 self-center transition-colors ${isSelected ? 'text-emerald-500' : 'text-gray-300'}`} />
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected Detail Panel */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedInv.gradient} flex items-center justify-center shadow-md`}>
            <span className="text-white text-sm font-black">{selectedInv.symbol}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-black">{selectedInv.symbol}</span>
              {selectedInv.aiPick && <span className="text-xs bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-2 py-0.5 rounded-full font-bold">AI Pick</span>}
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${riskBg(selectedInv.riskScore)}`}>{selectedInv.risk} Risk</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{selectedInv.why}</p>
          </div>
        </div>

        {/* 4 milestone boxes */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {HORIZONS.map(y => {
            const val = calcFinal(amount, selectedInv.annualReturn, y, monthly)
            const inv2 = monthly ? amount * 12 * y + amount : amount
            const g = val - inv2
            const p = ((g / inv2) * 100).toFixed(0)
            return (
              <div key={y} className={`rounded-xl p-3 text-center transition-all ${y === horizon ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <div className="text-xs text-gray-400 font-medium mb-1">{y === 1 ? '1 Year' : `${y} Years`}</div>
                <div className="text-lg font-black" style={{ color: selectedInv.color }}>{fmt(val)}</div>
                <div className="text-xs text-emerald-500 font-bold">+{p}%</div>
                <div className="text-xs text-gray-400">+{fmt(g)}</div>
              </div>
            )
          })}
        </div>

        {/* Chart */}
        <p className="text-sm font-semibold mb-3">{fmt(amount)} {monthly ? '/month' : 'one-time'} → projected {horizon}-year growth in {selectedInv.symbol}</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="qiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={selectedInv.color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={selectedInv.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-10" />
            <XAxis dataKey="year" tickFormatter={v => `${v}yr`} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} width={55} />
            <Tooltip formatter={(v, name) => [fmt(v), name === 'value' ? 'Portfolio Value' : 'Invested']} labelFormatter={v => `Year ${v}`} />
            <Area type="monotone" dataKey="invested" stroke="#9ca3af" strokeWidth={1.5} fill="none" strokeDasharray="4 4" name="invested" />
            <Area type="monotone" dataKey="value" stroke={selectedInv.color} strokeWidth={3} fill="url(#qiGrad)" name="value" />
          </AreaChart>
        </ResponsiveContainer>

        {/* Summary 3 cards */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'You Invest', value: fmt(totalInvested), sub: monthly ? `$${amount}/month` : 'one-time', color: 'text-gray-800 dark:text-white' },
            { label: `After ${horizon} Years`, value: fmt(finalValue), sub: `${(selectedInv.annualReturn * 100).toFixed(0)}% avg/yr`, color: 'text-emerald-500' },
            { label: 'Total Profit', value: `+${fmt(Math.max(0, totalGain))}`, sub: `${gainPct}% gain`, color: 'text-blue-500' },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">{s.label}</div>
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Comparison Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50">
          <BarChart2 className="w-4 h-4 text-emerald-500" />
          <span className="font-bold text-sm">Full Comparison — {fmt(amount)} {monthly ? '/month' : 'invested once'}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-4 py-3">Investment</th>
                <th className="text-right px-4 py-3">Avg/yr</th>
                <th className="text-right px-4 py-3">1 Year</th>
                <th className="text-right px-4 py-3">5 Years</th>
                <th className="text-right px-4 py-3">10 Years</th>
                <th className="text-right px-4 py-3">20 Years</th>
                <th className="text-right px-4 py-3 hidden md:table-cell">Risk</th>
              </tr>
            </thead>
            <tbody>
              {ALL_INVESTMENTS.map(inv => {
                const vals = [1, 5, 10, 20].map(y => calcFinal(amount, inv.annualReturn, y, monthly))
                const isSelected = selected === inv.symbol
                return (
                  <tr key={inv.symbol} onClick={() => setSelected(inv.symbol)}
                    className={`border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: inv.color }} />
                        <span className="font-bold">{inv.symbol}</span>
                        {inv.aiPick && <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-semibold">AI</span>}
                        <span className="text-xs text-gray-400 hidden lg:inline">{inv.badge}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-500">{(inv.annualReturn * 100).toFixed(0)}%</td>
                    {vals.map((v, i) => (
                      <td key={i} className="px-4 py-3 text-right font-mono font-semibold" style={{ color: inv.color }}>{fmt(v)}</td>
                    ))}
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskBg(inv.riskScore)}`}>{inv.risk}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
          * Based on historical averages. Past performance doesn't guarantee future results. Not financial advice. Click any row to see detailed projections.
        </div>
      </div>
    </div>
  )
}
