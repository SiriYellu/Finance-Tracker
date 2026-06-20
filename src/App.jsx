import { useState, useEffect } from 'react'
import StockWatchlist from './components/StockWatchlist'
import SpinoffTracker from './components/SpinoffTracker'
import PortfolioTracker from './components/PortfolioTracker'
import WealthChart from './components/WealthChart'
import ExpenseTracker from './components/ExpenseTracker'
import MarketHeader from './components/MarketHeader'
import { Sun, Moon, TrendingUp, Eye, Zap, PieChart, BarChart2, CreditCard } from 'lucide-react'

const TABS = [
  { id: 'watchlist', label: 'Watchlist', Icon: Eye },
  { id: 'spinoff', label: 'Breakouts', Icon: Zap },
  { id: 'portfolio', label: 'Portfolio', Icon: PieChart },
  { id: 'wealth', label: 'Wealth', Icon: BarChart2 },
  { id: 'expenses', label: 'Expenses', Icon: CreditCard },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('watchlist')
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              <span className="text-lg font-bold tracking-tight">Finance Tracker</span>
            </div>
            <button
              onClick={() => setDark(d => !d)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          <MarketHeader />
          <nav className="flex gap-1 overflow-x-auto pb-px">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'watchlist' && <StockWatchlist />}
        {activeTab === 'spinoff' && <SpinoffTracker />}
        {activeTab === 'portfolio' && <PortfolioTracker />}
        {activeTab === 'wealth' && <WealthChart />}
        {activeTab === 'expenses' && <ExpenseTracker />}
      </main>
    </div>
  )
}
