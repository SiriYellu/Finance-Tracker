import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const MILESTONES = [1, 3, 5, 10, 20, 30]

function fmt(n) {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}k`
  return `$${n.toFixed(0)}`
}

export default function WealthChart() {
  const [monthly, setMonthly] = useState(100)
  const [rate, setRate] = useState(8)
  const [years, setYears] = useState(30)
  const [initial, setInitial] = useState(0)

  const data = useMemo(() => {
    const pts = []
    let balance = initial
    const mr = rate / 100 / 12
    for (let y = 0; y <= years; y++) {
      pts.push({
        year: y,
        value: Math.round(balance),
        contributed: Math.round(initial + monthly * 12 * y),
        gains: Math.round(balance - initial - monthly * 12 * y),
      })
      for (let m = 0; m < 12; m++) balance = (balance + monthly) * (1 + mr)
    }
    return pts
  }, [monthly, rate, years, initial])

  const final = data[data.length - 1]
  const milestoneData = MILESTONES.filter(y => y <= years).map(y => data[y] || data[data.length - 1])

  const SLIDERS = [
    { label: 'Monthly ($)', value: monthly, set: setMonthly, min: 10, max: 5000, step: 10 },
    { label: 'Annual Return (%)', value: rate, set: setRate, min: 1, max: 20, step: 0.5 },
    { label: 'Years', value: years, set: setYears, min: 1, max: 50, step: 1 },
    { label: 'Initial ($)', value: initial, set: setInitial, min: 0, max: 100000, step: 1000 },
  ]

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Wealth Builder</h2>

      {/* Sliders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {SLIDERS.map(({ label, value, set, min, max, step }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <label className="text-xs text-gray-500 block mb-1">{label}</label>
            <div className="text-xl font-bold text-emerald-500 mb-2">
              {label.includes('$') ? `$${value.toLocaleString()}` : `${value}${label.includes('%') ? '%' : 'yr'}`}
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
              onChange={e => set(Number(e.target.value))}
              className="w-full accent-emerald-500" />
          </div>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Final Value', val: fmt(final.value), color: 'text-emerald-500' },
          { label: 'Total Invested', val: fmt(final.contributed), color: 'text-blue-500' },
          { label: 'Total Gains', val: fmt(Math.max(0, final.gains)), color: 'text-purple-500' },
        ].map(c => (
          <div key={c.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.color}`}>{c.val}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="conGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-10" />
            <XAxis dataKey="year" tickFormatter={v => `${v}yr`} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} width={55} />
            <Tooltip
              formatter={(v, name) => [fmt(v), name === 'value' ? 'Portfolio Value' : 'Amount Invested']}
              labelFormatter={v => `Year ${v}`}
            />
            <Area type="monotone" dataKey="contributed" stroke="#3b82f6" strokeWidth={2} fill="url(#conGrad)" name="contributed" />
            <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fill="url(#valGrad)" name="value" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-emerald-500 inline-block rounded" /> Portfolio Value</span>
          <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-blue-500 inline-block rounded" /> Amount Invested</span>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <h3 className="text-sm font-semibold mb-3">Milestones</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {milestoneData.map((d, i) => (
            <div key={i} className="text-center">
              <div className="text-xs text-gray-500 mb-0.5">Year {MILESTONES[i]}</div>
              <div className="text-sm font-bold text-emerald-500">{fmt(d.value)}</div>
              <div className="text-xs text-gray-400">{fmt(d.contributed)} in</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
