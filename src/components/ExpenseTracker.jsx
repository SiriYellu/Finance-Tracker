import { useState, useMemo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const CATEGORIES = ['Housing', 'Food', 'Transport', 'Health', 'Entertainment', 'Shopping', 'Other']
const CAT_COLORS = {
  Housing: '#10b981', Food: '#3b82f6', Transport: '#8b5cf6',
  Entertainment: '#f59e0b', Health: '#ef4444', Shopping: '#06b6d4', Other: '#6b7280',
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const DEFAULT_EXPENSES = [
  { id: 1, date: '2026-06-01', desc: 'Rent', amount: 1200, category: 'Housing' },
  { id: 2, date: '2026-06-05', desc: 'Groceries', amount: 85, category: 'Food' },
  { id: 3, date: '2026-06-08', desc: 'Netflix', amount: 15.99, category: 'Entertainment' },
  { id: 4, date: '2026-06-10', desc: 'Gas', amount: 55, category: 'Transport' },
  { id: 5, date: '2026-06-12', desc: 'Doctor visit', amount: 40, category: 'Health' },
]

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses')
    return saved ? JSON.parse(saved) : DEFAULT_EXPENSES
  })
  const [budget, setBudget] = useState(() => Number(localStorage.getItem('budget')) || 2000)
  const [form, setForm] = useState({ date: '', desc: '', amount: '', category: 'Food' })

  const saveExpenses = (updated) => {
    setExpenses(updated)
    localStorage.setItem('expenses', JSON.stringify(updated))
  }

  const saveBudget = (val) => {
    setBudget(val)
    localStorage.setItem('budget', val)
  }

  const addExpense = () => {
    if (!form.date || !form.desc || !form.amount) return
    saveExpenses([...expenses, { id: Date.now(), ...form, amount: parseFloat(form.amount) }])
    setForm({ date: '', desc: '', amount: '', category: 'Food' })
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const remaining = budget - total
  const budgetPct = Math.min(100, (total / budget) * 100)

  const byCategory = useMemo(() => {
    const map = {}
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount })
    return Object.entries(map).map(([name, value]) => ({ name, value, color: CAT_COLORS[name] || '#6b7280' }))
  }, [expenses])

  const byMonth = useMemo(() => {
    const map = {}
    expenses.forEach(e => {
      const m = parseInt(e.date?.split('-')[1]) - 1
      if (!isNaN(m)) map[m] = (map[m] || 0) + e.amount
    })
    return MONTHS.map((name, i) => ({ name, amount: +(map[i] || 0).toFixed(2) }))
  }, [expenses])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Expense Tracker</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Monthly Budget:</span>
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <span className="px-2 text-gray-400 bg-gray-50 dark:bg-gray-800">$</span>
            <input type="number" value={budget} onChange={e => saveBudget(Number(e.target.value))}
              className="w-24 px-2 py-1.5 bg-white dark:bg-gray-900 text-sm font-semibold focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: 'Spent', value: `$${total.toFixed(2)}`, color: 'text-gray-900 dark:text-white' },
          { label: 'Budget', value: `$${budget.toFixed(2)}`, color: 'text-blue-500' },
          { label: 'Remaining', value: `$${remaining.toFixed(2)}`, color: remaining >= 0 ? 'text-emerald-500' : 'text-red-500' },
        ].map(c => (
          <div key={c.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Budget bar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Budget Used</span>
          <span>{budgetPct.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${budgetPct >= 100 ? 'bg-red-500' : budgetPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${budgetPct}%` }}
          />
        </div>
      </div>

      {/* Add form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <h3 className="text-sm font-semibold mb-3">Add Expense</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input placeholder="Description" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <input placeholder="Amount" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={addExpense}
          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-sm font-semibold mb-3">By Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {byCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={v => `$${v.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2">
            {byCategory.map(c => (
              <div key={c.name} className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                {c.name}: ${c.value.toFixed(0)}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-sm font-semibold mb-3">Monthly Spending</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byMonth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-10" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => `$${v.toFixed(2)}`} />
              <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 text-sm font-semibold">Transactions</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase border-b border-gray-100 dark:border-gray-800">
              <th className="text-left px-4 py-2">Date</th>
              <th className="text-left px-4 py-2">Description</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">Category</th>
              <th className="text-right px-4 py-2">Amount</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {[...expenses].reverse().map(e => (
              <tr key={e.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-2.5 text-gray-500 text-xs">{e.date}</td>
                <td className="px-4 py-2.5 font-medium">{e.desc}</td>
                <td className="px-4 py-2.5 hidden md:table-cell">
                  <span className="px-2 py-0.5 text-xs rounded-full font-medium"
                    style={{ background: (CAT_COLORS[e.category] || '#6b7280') + '22', color: CAT_COLORS[e.category] || '#6b7280' }}>
                    {e.category}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono font-semibold">${e.amount.toFixed(2)}</td>
                <td className="px-4 py-2.5">
                  <button onClick={() => saveExpenses(expenses.filter(x => x.id !== e.id))}
                    className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                </td>
              </tr>
            ))}
            {!expenses.length && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No expenses yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
