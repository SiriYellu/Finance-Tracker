import { useState, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ZAxis,
} from 'recharts'
import {
  Brain, TrendingUp, TrendingDown, ShieldCheck, Target, AlertTriangle,
  CheckCircle, Info, Star, DollarSign, Globe, Clock, Zap,
  ChevronDown, ChevronUp, Printer, RefreshCw,
} from 'lucide-react'
import {
  calculateHealthScore, getRecommendedAllocation, getAllocationTable,
  getRankedOpportunities, getRecommendationCards, generateInsights,
  calcGoalProjection, getGrowthProjection, getNetWorthForecast, getRiskReturnData,
} from '../utils/engine'

const GOALS = ['Wealth Growth', 'Retirement', 'House Down Payment', 'Emergency Fund', 'Financial Independence']
const ALLOC_COLORS = { usStocks: '#10b981', international: '#3b82f6', bonds: '#8b5cf6', reits: '#f59e0b', cash: '#6b7280' }
const ALLOC_LABELS = { usStocks: 'US Stocks', international: 'International', bonds: 'Bonds', reits: 'REITs', cash: 'Cash' }

const DEFAULT_PROFILE = {
  income: 5000, expenses: 3200, age: 30, horizon: 20,
  riskTolerance: 6, emergencyMonths: 3,
  goals: ['Wealth Growth'],
  currentAllocation: { usStocks: 40, international: 5, bonds: 30, reits: 5, cash: 20 },
}

function fmt(n) {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}k`
  return `$${n.toFixed(0)}`
}

function ScoreGauge({ score }) {
  const r = 54, cx = 70, cy = 70
  const circ = 2 * Math.PI * r
  const arc = circ * 0.75
  const fill = (score / 100) * arc
  const color = score >= 86 ? '#10b981' : score >= 71 ? '#3b82f6' : score >= 41 ? '#f59e0b' : '#ef4444'
  const label = score >= 86 ? 'Excellent' : score >= 71 ? 'Good' : score >= 41 ? 'Moderate' : 'Poor'
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="160" height="160" viewBox="0 0 140 140" style={{ transform: 'rotate(-135deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="12"
          strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round" className="dark:stroke-gray-700" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s ease' }} />
      </svg>
      <div className="absolute text-center pointer-events-none">
        <div className="text-4xl font-black" style={{ color }}>{score}</div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  )
}

function ConfidenceBar({ value, color = 'emerald' }) {
  const colors = { emerald: 'bg-emerald-500', blue: 'bg-blue-500', red: 'bg-red-500', orange: 'bg-orange-500', purple: 'bg-purple-500' }
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color] || 'bg-emerald-500'} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-500 w-8">{value}%</span>
    </div>
  )
}

function InsightIcon({ type }) {
  const map = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    danger: <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />,
    opportunity: <Zap className="w-5 h-5 text-blue-500 flex-shrink-0" />,
  }
  return map[type] || <Info className="w-5 h-5 text-gray-400 flex-shrink-0" />
}

function Section({ title, children, icon: Icon }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-5 h-5 text-emerald-500" />}
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function AIAdvisor() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [analyzed, setAnalyzed] = useState(false)
  const [formOpen, setFormOpen] = useState(true)
  const [activeGoal, setActiveGoal] = useState('Wealth Growth')
  const [projYears, setProjYears] = useState(20)

  const set = (key, val) => setProfile(p => ({ ...p, [key]: val }))
  const setAlloc = (key, val) => setProfile(p => ({ ...p, currentAllocation: { ...p.currentAllocation, [key]: Number(val) } }))

  const results = useMemo(() => {
    if (!analyzed) return null
    const health = calculateHealthScore(profile)
    const recommended = getRecommendedAllocation(profile)
    const allocTable = getAllocationTable(profile.currentAllocation, recommended)
    const opportunities = getRankedOpportunities(profile)
    const cards = getRecommendationCards(profile, recommended)
    const insights = generateInsights(profile, health, recommended)
    const goalProj = calcGoalProjection(activeGoal, profile)
    const growthData = getGrowthProjection(profile, projYears)
    const netWorth = getNetWorthForecast(profile)
    const riskReturn = getRiskReturnData()
    const currentPie = Object.entries(profile.currentAllocation).map(([k, v]) => ({ name: ALLOC_LABELS[k], value: v, color: ALLOC_COLORS[k] }))
    const recommendedPie = Object.entries(recommended).map(([k, v]) => ({ name: ALLOC_LABELS[k], value: v, color: ALLOC_COLORS[k] }))
    return { health, recommended, allocTable, opportunities, cards, insights, goalProj, growthData, netWorth, riskReturn, currentPie, recommendedPie }
  }, [analyzed, profile, activeGoal, projYears])

  const cardColors = {
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', badge: 'bg-emerald-500', action: 'text-emerald-600 dark:text-emerald-400' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-500', action: 'text-blue-600 dark:text-blue-400' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', badge: 'bg-red-500', action: 'text-red-600 dark:text-red-400' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', badge: 'bg-orange-500', action: 'text-orange-600 dark:text-orange-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', badge: 'bg-purple-500', action: 'text-purple-600 dark:text-purple-400' },
  }

  const allocTotal = Object.values(profile.currentAllocation).reduce((s, v) => s + Number(v), 0)

  return (
    <div className="print:bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black">AI Investment Advisor</h2>
            <p className="text-xs text-gray-500">Personalized analysis based on your financial profile</p>
          </div>
        </div>
        {analyzed && (
          <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors print:hidden">
            <Printer className="w-4 h-4" /> Export PDF
          </button>
        )}
      </div>

      {/* Profile Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6 overflow-hidden print:hidden">
        <button onClick={() => setFormOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold">Your Financial Profile</span>
            {analyzed && <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full ml-1">Analyzed</span>}
          </div>
          {formOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {formOpen && (
          <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {/* Income */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Monthly Income ($)</label>
                <input type="number" value={profile.income} onChange={e => set('income', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Monthly Expenses ($)</label>
                <input type="number" value={profile.expenses} onChange={e => set('expenses', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Age</label>
                <input type="number" value={profile.age} onChange={e => set('age', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Investment Horizon (years)</label>
                <input type="number" value={profile.horizon} onChange={e => set('horizon', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Emergency Fund (months)</label>
                <input type="number" value={profile.emergencyMonths} onChange={e => set('emergencyMonths', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Risk Tolerance: {profile.riskTolerance}/10</label>
                <input type="range" min={1} max={10} value={profile.riskTolerance} onChange={e => set('riskTolerance', Number(e.target.value))}
                  className="w-full accent-emerald-500 mt-1" />
                <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>Conservative</span><span>Aggressive</span></div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Primary Goal</label>
                <select value={profile.goals[0]} onChange={e => set('goals', [e.target.value])}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {GOALS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* Current Allocation */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Current Portfolio Allocation</label>
                <span className={`text-xs font-semibold ${Math.abs(allocTotal - 100) > 1 ? 'text-red-500' : 'text-emerald-500'}`}>
                  Total: {allocTotal}% {Math.abs(allocTotal - 100) > 1 ? '⚠ must equal 100' : '✓'}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(profile.currentAllocation).map(([key, val]) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 block mb-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: ALLOC_COLORS[key] }} />
                      {ALLOC_LABELS[key]}
                    </label>
                    <div className="relative">
                      <input type="number" min={0} max={100} value={val} onChange={e => setAlloc(key, e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-6" />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => { setAnalyzed(true); setFormOpen(false) }}
              className="mt-5 w-full py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
              <Brain className="w-5 h-5" /> Generate AI Analysis
            </button>
          </div>
        )}
      </div>

      {!analyzed && (
        <div className="text-center py-20 text-gray-500">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
          <p className="text-lg font-semibold mb-1">Fill in your profile above</p>
          <p className="text-sm">Click "Generate AI Analysis" to get personalized investment recommendations</p>
        </div>
      )}

      {analyzed && results && (
        <div>
          {/* Health Score */}
          <Section title="Investment Health Score" icon={Star}>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col items-center">
                  <ScoreGauge score={results.health.total} />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Investment Readiness Score: <span className="font-bold text-gray-900 dark:text-white">{results.health.total}/100</span>
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-4 text-xs text-gray-500">
                    <span>0–40 = <span className="text-red-500 font-medium">Poor</span></span>
                    <span>41–70 = <span className="text-amber-500 font-medium">Moderate</span></span>
                    <span>71–85 = <span className="text-blue-500 font-medium">Good</span></span>
                    <span>86–100 = <span className="text-emerald-500 font-medium">Excellent</span></span>
                  </div>
                </div>
                <div className="space-y-4">
                  {Object.entries(results.health.breakdown).map(([label, { score, weight }]) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{label}</span>
                        <span className="text-gray-500 text-xs">{score}/100 · {weight}% weight · <span className="font-semibold text-gray-700 dark:text-gray-300">{Math.round(score * weight / 100)} pts</span></span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Recommendation Cards */}
          <Section title="Smart Recommendations" icon={Zap}>
            <div className="grid md:grid-cols-2 gap-4">
              {results.cards.map((card, i) => {
                const c = cardColors[card.color] || cardColors.emerald
                return (
                  <div key={i} className={`rounded-xl border p-5 ${c.bg} ${c.border}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{card.title}</p>
                        <p className="text-xl font-black">{card.name}</p>
                        <p className={`text-sm font-bold ${c.action}`}>{card.symbol}</p>
                      </div>
                      <span className={`${c.badge} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>{card.action}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">{card.reason}</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Confidence</span>
                        <div className="w-32"><ConfidenceBar value={card.confidence} color={card.color} /></div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Expected Return</span>
                        <span className="font-semibold">{card.returns}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          {/* AI Insights */}
          <Section title="AI Portfolio Insights" icon={Brain}>
            <div className="space-y-3">
              {results.insights.map((ins, i) => {
                const bgMap = { success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', opportunity: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' }
                return (
                  <div key={i} className={`flex gap-3 p-4 rounded-xl border ${bgMap[ins.type]}`}>
                    <InsightIcon type={ins.type} />
                    <div>
                      <p className="font-semibold text-sm mb-0.5">{ins.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{ins.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          {/* Allocation Table */}
          <Section title="Recommended Allocation" icon={Target}>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-3">Asset Class</th>
                    <th className="text-right px-4 py-3">Current</th>
                    <th className="text-right px-4 py-3">Recommended</th>
                    <th className="text-right px-4 py-3">Change</th>
                    <th className="text-right px-4 py-3 hidden md:table-cell">Confidence</th>
                    <th className="text-right px-4 py-3 hidden md:table-cell">Expected Return</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {results.allocTable.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: ALLOC_COLORS[row.key] }} />
                          <span className="font-semibold">{row.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{row.current}%</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">{row.recommended}%</td>
                      <td className="px-4 py-3 text-right">
                        {row.change === 0 ? (
                          <span className="text-gray-400 font-mono">0%</span>
                        ) : (
                          <span className={`font-mono font-semibold flex items-center justify-end gap-1 ${row.change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {row.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {row.change > 0 ? '+' : ''}{row.change}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${row.confidence}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-8 text-right">{row.confidence}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-500 hidden md:table-cell">{row.returns}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{row.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Allocation Charts */}
          <Section title="Portfolio Allocation — Current vs Recommended" icon={TrendingUp}>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Current Allocation', data: results.currentPie },
                { title: 'Recommended Allocation', data: results.recommendedPie },
              ].map(({ title, data }) => (
                <div key={title} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <h4 className="text-sm font-semibold mb-3">{title}</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                        {data.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={v => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    {data.map(d => (
                      <div key={d.name} className="flex items-center gap-1 text-xs">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        {d.name}: {d.value}%
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Opportunity Rankings */}
          <Section title="Top Investment Opportunities" icon={Star}>
            <div className="space-y-3">
              {results.opportunities.map((etf, i) => (
                <div key={etf.symbol} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-black">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <span className="font-black text-lg">{etf.symbol}</span>
                        <span className="ml-2 text-sm text-gray-500">{etf.name}</span>
                        <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">{etf.category}</span>
                      </div>
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                        {etf.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 mb-2">{etf.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div><span className="text-gray-400">Risk</span><div className="font-semibold mt-0.5">{etf.risk}/10</div></div>
                      <div><span className="text-gray-400">Diversification</span><div className="font-semibold mt-0.5">{etf.diversification}/10</div></div>
                      <div><span className="text-gray-400">Expected Return</span><div className="font-semibold text-emerald-500 mt-0.5">{etf.returnRange[0]}–{etf.returnRange[1]}%</div></div>
                      <div><span className="text-gray-400">Expense Ratio</span><div className="font-semibold mt-0.5">{etf.expenseRatio}%</div></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Growth Projection Chart */}
          <Section title="Investment Growth Projection" icon={TrendingUp}>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-gray-500">Projection horizon:</span>
                {[10, 20, 30].map(y => (
                  <button key={y} onClick={() => { setProjYears(y); setAnalyzed(true) }}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${projYears === y ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    {y}yr
                  </button>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={results.growthData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    {[['aggGrad', '#10b981'], ['modGrad', '#3b82f6'], ['conGrad', '#8b5cf6'], ['contGrad', '#e5e7eb']].map(([id, color]) => (
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-10" />
                  <XAxis dataKey="year" tickFormatter={v => `${v}yr`} tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} width={60} />
                  <Tooltip formatter={(v, name) => [fmt(v), name === 'contributed' ? 'Contributed' : name.charAt(0).toUpperCase() + name.slice(1)]} labelFormatter={v => `Year ${v}`} />
                  <Area type="monotone" dataKey="contributed" stroke="#9ca3af" strokeWidth={1.5} fill="url(#contGrad)" strokeDasharray="4 4" name="contributed" />
                  <Area type="monotone" dataKey="conservative" stroke="#8b5cf6" strokeWidth={2} fill="url(#conGrad)" name="conservative" />
                  <Area type="monotone" dataKey="moderate" stroke="#3b82f6" strokeWidth={2.5} fill="url(#modGrad)" name="moderate" />
                  <Area type="monotone" dataKey="aggressive" stroke="#10b981" strokeWidth={2.5} fill="url(#aggGrad)" name="aggressive" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                {[['#10b981', 'Aggressive'], ['#3b82f6', 'Moderate'], ['#8b5cf6', 'Conservative'], ['#9ca3af', 'Contributed']].map(([c, l]) => (
                  <span key={l} className="flex items-center gap-1"><span className="w-4 h-0.5 rounded inline-block" style={{ background: c }} />{l}</span>
                ))}
              </div>
            </div>
          </Section>

          {/* Risk vs Return */}
          <Section title="Risk vs Return Landscape" icon={ShieldCheck}>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-10" />
                  <XAxis dataKey="risk" type="number" name="Risk" domain={[0, 11]} tickFormatter={v => `${v}`} label={{ value: 'Risk Score', position: 'insideBottom', offset: -10, fontSize: 11 }} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="return" type="number" name="Return" domain={[0, 18]} tickFormatter={v => `${v}%`} label={{ value: 'Expected Return', angle: -90, position: 'insideLeft', fontSize: 11 }} tick={{ fontSize: 11 }} />
                  <ZAxis dataKey="size" range={[60, 200]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                    if (!payload?.length) return null
                    const d = payload[0].payload
                    return <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs shadow-lg"><p className="font-bold">{d.name}</p><p>Risk: {d.risk}/10</p><p>Return: ~{d.return}%</p></div>
                  }} />
                  <Scatter data={results.riskReturn} fill="#10b981">
                    {results.riskReturn.map((entry, index) => (
                      <Cell key={index} fill={entry.risk <= 3 ? '#8b5cf6' : entry.risk <= 5 ? '#3b82f6' : entry.risk <= 7 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Section>

          {/* Net Worth Forecast */}
          <Section title="Net Worth Forecast" icon={DollarSign}>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={results.netWorth} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-10" />
                  <XAxis dataKey="years" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} width={60} />
                  <Tooltip formatter={(v, name) => [fmt(v), name === 'value' ? 'Portfolio Value' : 'Contributed']} />
                  <Bar dataKey="contributed" fill="#3b82f6" radius={[4, 4, 0, 0]} name="contributed" />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} name="value" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-4 gap-3 mt-4">
                {results.netWorth.map(d => (
                  <div key={d.years} className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">{d.years}</div>
                    <div className="text-base font-black text-emerald-500">{fmt(d.value)}</div>
                    <div className="text-xs text-gray-400">{fmt(d.contributed)} in</div>
                    <div className="text-xs text-blue-500 font-medium">+{fmt(d.value - d.contributed)} gains</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Goal Optimizer */}
          <Section title="Financial Goal Optimizer" icon={Target}>
            <div className="flex gap-2 flex-wrap mb-4">
              {GOALS.map(g => (
                <button key={g} onClick={() => { setActiveGoal(g); setAnalyzed(true) }}
                  className={`px-4 py-2 text-sm rounded-xl font-medium transition-colors ${activeGoal === g ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-emerald-300'}`}>
                  {g}
                </button>
              ))}
            </div>
            {results.goalProj && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Goal</p>
                    <p className="text-xl font-black mb-4">{results.goalProj.label}</p>
                    <div className="space-y-3">
                      {[
                        { label: 'Target Amount', value: fmt(results.goalProj.target), color: 'text-gray-900 dark:text-white' },
                        { label: 'Monthly Investment', value: `$${results.goalProj.monthly.toLocaleString()}`, color: 'text-blue-500' },
                        { label: 'Years to Goal', value: `${results.goalProj.years} years`, color: 'text-emerald-500' },
                        { label: 'Achievable by Age', value: `${results.goalProj.achievableAge}`, color: 'text-purple-500' },
                      ].map(r => (
                        <div key={r.label} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                          <span className="text-sm text-gray-500">{r.label}</span>
                          <span className={`text-lg font-black ${r.color}`}>{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Suggested Portfolio</p>
                    <div className="space-y-2">
                      {results.goalProj.suggested.map(s => (
                        <div key={s.symbol} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-black">{s.symbol}</span>
                          </div>
                          <div className="flex-1">
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.pct}%` }} />
                            </div>
                          </div>
                          <span className="text-sm font-bold w-10 text-right">{s.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* Re-analyze */}
          <div className="flex justify-center mt-4 print:hidden">
            <button onClick={() => { setFormOpen(true) }}
              className="flex items-center gap-2 px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium transition-colors">
              <RefreshCw className="w-4 h-4" /> Update Profile & Re-analyze
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
