export const ETF_UNIVERSE = [
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', category: 'US Stocks', risk: 6, returnRange: [8, 10], diversification: 9, expenseRatio: 0.03, description: 'Broad US large-cap exposure via S&P 500 index' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', category: 'US Stocks', risk: 6, returnRange: [8, 10], diversification: 10, expenseRatio: 0.03, description: 'Entire US stock market — small, mid & large cap' },
  { symbol: 'QQQ', name: 'Invesco NASDAQ-100 ETF', category: 'Growth', risk: 8, returnRange: [10, 14], diversification: 7, expenseRatio: 0.20, description: 'Top 100 NASDAQ companies, AI & tech heavy' },
  { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', category: 'Dividend', risk: 5, returnRange: [7, 9], diversification: 8, expenseRatio: 0.06, description: 'High-quality dividend-paying US stocks' },
  { symbol: 'VXUS', name: 'Vanguard Total International ETF', category: 'International', risk: 7, returnRange: [6, 9], diversification: 10, expenseRatio: 0.07, description: 'Broad international market diversification' },
  { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', category: 'Bonds', risk: 3, returnRange: [3, 5], diversification: 8, expenseRatio: 0.03, description: 'US investment-grade bonds for stability' },
  { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', category: 'REITs', risk: 6, returnRange: [7, 10], diversification: 7, expenseRatio: 0.12, description: 'Real estate exposure via US REITs' },
  { symbol: 'AGG', name: 'iShares Core US Aggregate Bond', category: 'Bonds', risk: 3, returnRange: [3, 5], diversification: 9, expenseRatio: 0.03, description: 'Broad US bond market stability' },
  { symbol: 'GLD', name: 'SPDR Gold Shares', category: 'Commodities', risk: 5, returnRange: [4, 8], diversification: 6, expenseRatio: 0.40, description: 'Gold as inflation hedge and portfolio anchor' },
  { symbol: 'VOOG', name: 'Vanguard S&P 500 Growth ETF', category: 'Growth', risk: 7, returnRange: [9, 12], diversification: 7, expenseRatio: 0.10, description: 'S&P 500 growth stocks with strong fundamentals' },
]

const CAT_LABELS = { usStocks: 'US Stocks', international: 'International', bonds: 'Bonds', reits: 'REITs', cash: 'Cash' }

export function calculateHealthScore(profile) {
  const { income, expenses, age, horizon, riskTolerance, emergencyMonths, currentAllocation } = profile
  const savingsRate = income > 0 ? Math.max(0, (income - expenses) / income * 100) : 0

  const savingsScore = Math.min(100, savingsRate * 5)

  const nonZero = Object.values(currentAllocation).filter(v => v > 5).length
  const maxConc = Math.max(...Object.values(currentAllocation))
  const divScore = Math.min(100, Math.max(0, nonZero * 20 - Math.max(0, maxConc - 60)))

  const idealRisk = Math.round(Math.max(1, Math.min(10, (100 - age) / 8)))
  const riskScore = Math.max(0, 100 - Math.abs(riskTolerance - idealRisk) * 12)

  const emergencyScore = Math.min(100, (emergencyMonths / 6) * 100)
  const goalScore = horizon >= 20 ? 100 : horizon >= 10 ? 80 : horizon >= 5 ? 60 : 30

  const total = Math.round(
    savingsScore * 0.30 + divScore * 0.25 + riskScore * 0.20 + emergencyScore * 0.15 + goalScore * 0.10
  )

  return {
    total: Math.min(100, Math.max(0, total)),
    breakdown: {
      'Savings Health': { score: Math.round(savingsScore), weight: 30 },
      'Diversification': { score: Math.round(divScore), weight: 25 },
      'Risk Management': { score: Math.round(riskScore), weight: 20 },
      'Emergency Fund': { score: Math.round(emergencyScore), weight: 15 },
      'Goal Alignment': { score: Math.round(goalScore), weight: 10 },
    },
    savingsRate: Math.round(savingsRate),
  }
}

export function getRecommendedAllocation(profile) {
  const { age, riskTolerance, horizon } = profile

  let base
  if (age < 30) base = { usStocks: 60, international: 20, bonds: 10, reits: 5, cash: 5 }
  else if (age < 40) base = { usStocks: 55, international: 15, bonds: 15, reits: 10, cash: 5 }
  else if (age < 50) base = { usStocks: 45, international: 15, bonds: 25, reits: 10, cash: 5 }
  else if (age < 60) base = { usStocks: 35, international: 10, bonds: 35, reits: 10, cash: 10 }
  else base = { usStocks: 25, international: 5, bonds: 50, reits: 10, cash: 10 }

  const riskAdj = (riskTolerance - 5) * 3
  base.usStocks = Math.max(10, Math.min(80, base.usStocks + riskAdj))
  base.bonds = Math.max(0, Math.min(60, base.bonds - riskAdj))
  if (horizon > 20) { base.usStocks += 5; base.bonds = Math.max(0, base.bonds - 5) }
  else if (horizon < 5) { base.bonds += 10; base.usStocks = Math.max(10, base.usStocks - 10) }

  const sum = Object.values(base).reduce((s, v) => s + v, 0)
  let remaining = 100
  const keys = Object.keys(base)
  const out = {}
  keys.forEach((k, i) => {
    if (i === keys.length - 1) out[k] = Math.max(0, remaining)
    else { out[k] = Math.round(base[k] / sum * 100); remaining -= out[k] }
  })
  return out
}

export function getAllocationTable(current, recommended) {
  const reasons = {
    usStocks: 'Core long-term growth engine',
    international: 'Geographic diversification',
    bonds: 'Stability and income',
    reits: 'Real estate income',
    cash: 'Liquidity buffer',
  }
  const riskLevels = { usStocks: 'Medium', international: 'Medium-High', bonds: 'Low', reits: 'Medium', cash: 'None' }
  const returnRanges = { usStocks: '8–10%', international: '6–9%', bonds: '3–5%', reits: '7–10%', cash: '4–5%' }

  return Object.keys(recommended).map(key => {
    const cur = current[key] || 0
    const rec = recommended[key]
    const change = rec - cur
    const strength = Math.abs(change) >= 15 ? 'Strong' : Math.abs(change) >= 8 ? 'Moderate' : 'Mild'
    const confidence = Math.min(96, 70 + Math.round(Math.abs(change) * 1.5))
    return { key, label: CAT_LABELS[key], current: cur, recommended: rec, change, reason: reasons[key], strength, confidence, risk: riskLevels[key], returns: returnRanges[key] }
  })
}

export function getRankedOpportunities(profile) {
  const { riskTolerance, age, horizon } = profile

  return ETF_UNIVERSE.map(etf => {
    let score = 0
    score += (10 - Math.abs(etf.risk - riskTolerance)) * 8
    score += etf.diversification * 5
    score += Math.max(0, (1 - etf.expenseRatio) * 10)
    if (horizon > 15 && etf.risk >= 6) score += 15
    if (horizon < 5 && etf.risk <= 4) score += 15
    if (age < 35 && etf.category !== 'Bonds') score += 10
    if (age > 55 && etf.category === 'Bonds') score += 10
    const confidence = Math.min(97, Math.round(58 + score / 5))
    return { ...etf, score, confidence }
  }).sort((a, b) => b.score - a.score).slice(0, 5)
}

export function getRecommendationCards(profile, recommended) {
  const { currentAllocation, riskTolerance, age } = profile
  const catToETF = {
    usStocks: { symbol: 'VOO', name: 'Vanguard S&P 500 ETF' },
    international: { symbol: 'VXUS', name: 'Vanguard Total International ETF' },
    bonds: { symbol: 'BND', name: 'Vanguard Total Bond Market ETF' },
    reits: { symbol: 'VNQ', name: 'Vanguard Real Estate ETF' },
    cash: { symbol: 'HYSA', name: 'High Yield Savings Account' },
  }

  const gaps = Object.entries(recommended).map(([k, v]) => ({ key: k, gap: v - (currentAllocation[k] || 0) }))
  const bigIncrease = [...gaps].sort((a, b) => b.gap - a.gap)[0]
  const bigDecrease = [...gaps].sort((a, b) => a.gap - b.gap)[0]

  const sector = riskTolerance >= 7 ? 'Technology' : riskTolerance >= 5 ? 'Healthcare' : 'Consumer Staples'
  const sectorETF = riskTolerance >= 7 ? 'QQQ' : 'VHT'
  const riskScore = parseFloat(((riskTolerance + (10 - Math.min(10, Math.round(age / 10)))) / 2).toFixed(1))
  const riskLabel = riskScore >= 7 ? 'Aggressive' : riskScore >= 5 ? 'Moderate' : 'Conservative'

  return [
    {
      title: 'Best Place To Invest More', type: 'buy',
      name: catToETF[bigIncrease.key]?.name || 'Vanguard S&P 500 ETF',
      symbol: catToETF[bigIncrease.key]?.symbol || 'VOO',
      reason: `${CAT_LABELS[bigIncrease.key]} allocation is ${bigIncrease.gap > 0 ? bigIncrease.gap + '% below' : 'at'} recommended target. Increasing exposure improves long-term growth potential.`,
      confidence: Math.min(95, 72 + Math.round(Math.abs(bigIncrease.gap) / 2)),
      returns: '8–10%', action: 'Strong Buy', color: 'emerald',
    },
    {
      title: 'Sector With Highest Potential', type: 'sector',
      name: sector, symbol: sectorETF,
      reason: `Strong fundamentals with ${riskTolerance >= 6 ? 'AI-driven tailwinds supporting above-average' : 'defensive characteristics and steady'} outperformance. ${riskTolerance >= 6 ? 'Tech sector remains the primary driver of index returns.' : 'Suitable allocation for your risk profile.'}`,
      confidence: Math.min(95, 70 + riskTolerance * 2),
      returns: riskTolerance >= 7 ? '10–14%' : '7–10%', action: 'Overweight', color: 'blue',
    },
    {
      title: 'Asset To Reduce', type: 'reduce',
      name: CAT_LABELS[bigDecrease.key], symbol: catToETF[bigDecrease.key]?.symbol || 'CASH',
      reason: `${CAT_LABELS[bigDecrease.key]} is ${Math.abs(bigDecrease.gap)}% above your recommended target. Excess ${bigDecrease.key === 'cash' ? 'idle cash creates significant return drag' : 'allocation creates concentration risk'}.`,
      confidence: Math.min(93, 68 + Math.round(Math.abs(bigDecrease.gap) / 2)),
      returns: 'Redeploy capital', action: 'Reduce', color: 'red',
    },
    {
      title: 'Portfolio Risk Level', type: 'risk',
      name: riskLabel, symbol: `${riskScore}/10`,
      reason: riskScore >= 7 ? 'Suitable for 20+ year aggressive growth strategy. Maximize equity exposure while young.' : riskScore >= 5 ? 'Balanced approach suitable for 10+ year moderate growth strategy.' : 'Conservative profile — focus on capital preservation and income generation.',
      confidence: 91, returns: riskScore >= 7 ? '9–12%' : riskScore >= 5 ? '7–10%' : '4–6%',
      action: 'Monitor', color: riskScore >= 7 ? 'orange' : riskScore >= 5 ? 'blue' : 'purple',
    },
  ]
}

export function generateInsights(profile, health, recommended) {
  const { income, expenses, age, emergencyMonths, currentAllocation, riskTolerance } = profile
  const savingsRate = health.savingsRate
  const monthlySavings = Math.max(0, income - expenses)
  const insights = []

  if (currentAllocation.cash > recommended.cash + 5) {
    const excess = currentAllocation.cash - recommended.cash
    insights.push({ type: 'opportunity', title: 'Excess Cash Drag', text: `Your cash allocation (${currentAllocation.cash}%) exceeds the recommended ${recommended.cash}%. Moving ${excess}% into diversified index funds like VOO could meaningfully improve your long-term compound returns. Idle cash loses purchasing power to inflation each year.` })
  }
  if (currentAllocation.international < recommended.international - 5) {
    insights.push({ type: 'warning', title: 'Low International Exposure', text: `Your international allocation (${currentAllocation.international}%) is well below the recommended ${recommended.international}%. Global diversification reduces concentration risk and opens exposure to faster-growing emerging markets. Consider VXUS or VEA to bridge this gap.` })
  }
  if (savingsRate < 15) {
    insights.push({ type: 'warning', title: 'Savings Rate Below Target', text: `Your current savings rate of ${savingsRate}% is below the recommended 15–20%. Increasing monthly savings by just $${Math.round(income * 0.05)} could add $${Math.round(income * 0.05 * 12 * 20 * 1.5).toLocaleString()} over 20 years (8% return). Small increases compound dramatically.` })
  } else if (savingsRate >= 20) {
    insights.push({ type: 'success', title: 'Excellent Savings Discipline', text: `Your ${savingsRate}% savings rate is outstanding — placing you in the top 15% of savers. Investing $${monthlySavings.toLocaleString()}/month consistently at 8% annual returns could grow to $${Math.round(monthlySavings * 12 * 20 * 2.2).toLocaleString()} over 20 years through compound growth.` })
  }
  if (emergencyMonths < 3) {
    insights.push({ type: 'danger', title: 'Emergency Fund is Critical', text: `Your emergency fund covers only ${emergencyMonths} months of expenses. Build this to 6 months ($${(expenses * 6).toLocaleString()}) before investing aggressively. Without a buffer, market downturns could force you to sell investments at a loss to cover emergencies.` })
  } else if (emergencyMonths >= 6) {
    insights.push({ type: 'success', title: 'Emergency Buffer is Solid', text: `With ${emergencyMonths} months of emergency savings, you have a strong financial foundation. You can invest additional capital confidently without risking liquidation of investments in a crisis.` })
  }
  if (age < 35 && currentAllocation.bonds > 20) {
    insights.push({ type: 'opportunity', title: 'Time Advantage Underutilized', text: `At age ${age}, time is your most powerful financial asset. Your bond allocation (${currentAllocation.bonds}%) is high for your age. Shifting toward equities allows compound growth to work for 30+ more years — a 5% reallocation from bonds to VOO could add $${Math.round(monthlySavings * 30 * 0.8).toLocaleString()} over your career.` })
  }
  if (riskTolerance >= 8 && age > 50) {
    insights.push({ type: 'warning', title: 'High Risk Near Retirement', text: `Your risk tolerance (${riskTolerance}/10) is high for age ${age}. As you approach retirement, consider gradually shifting 1–2% annually from equities to bonds to protect accumulated wealth from a major market correction.` })
  }
  if (health.total >= 80) {
    insights.push({ type: 'success', title: 'Strong Financial Foundation', text: `Your Investment Health Score of ${health.total}/100 places you in the top tier of financial preparedness. Continue your current trajectory — fine-tune your allocation toward the recommended targets and maintain consistent monthly investing to maximize compound growth.` })
  }

  return insights
}

export function calcGoalProjection(goal, profile) {
  const { income, expenses, age, riskTolerance } = profile
  const monthly = Math.max(0, income - expenses)
  const rate = (3 + riskTolerance * 0.8) / 100 / 12

  const targets = {
    'Wealth Growth': { target: income * 12 * 25, label: 'Financial Independence (25× income)' },
    'Retirement': { target: expenses * 12 * 25, label: 'Retirement Corpus (25× annual expenses)' },
    'House Down Payment': { target: 60000, label: 'House Down Payment ($60k)' },
    'Emergency Fund': { target: expenses * 6, label: '6-Month Emergency Fund' },
    'Financial Independence': { target: income * 12 * 30, label: 'Full Financial Independence (30× income)' },
  }

  const { target, label } = targets[goal] || targets['Wealth Growth']
  let balance = 0, months = 0
  while (balance < target && months < 600) { balance = (balance + monthly) * (1 + rate); months++ }

  const years = Math.round(months / 12)
  const suggested = [
    { symbol: 'VOO', pct: 60 }, { symbol: 'VXUS', pct: 20 },
    { symbol: 'BND', pct: 10 }, { symbol: 'VNQ', pct: 10 },
  ]

  return { goal, label, target, monthly, years, achievableAge: age + years, suggested }
}

export function getGrowthProjection(profile, years = 20) {
  const { income, expenses, riskTolerance } = profile
  const monthly = Math.max(0, income - expenses)
  const rates = {
    conservative: (2 + riskTolerance * 0.4) / 100 / 12,
    moderate: (3 + riskTolerance * 0.7) / 100 / 12,
    aggressive: (4 + riskTolerance * 1.0) / 100 / 12,
  }
  const b = { conservative: 0, moderate: 0, aggressive: 0 }
  const data = []
  for (let y = 0; y <= years; y++) {
    data.push({ year: y, conservative: Math.round(b.conservative), moderate: Math.round(b.moderate), aggressive: Math.round(b.aggressive), contributed: Math.round(monthly * 12 * y) })
    for (let m = 0; m < 12; m++) Object.keys(b).forEach(k => { b[k] = (b[k] + monthly) * (1 + rates[k]) })
  }
  return data
}

export function getNetWorthForecast(profile) {
  const { income, expenses, riskTolerance } = profile
  const monthly = Math.max(0, income - expenses)
  const rate = (3 + riskTolerance * 0.7) / 100 / 12
  const horizons = [5, 10, 20, 30]
  let balance = 0
  const data = []
  let year = 0
  for (const h of horizons) {
    while (year < h) {
      for (let m = 0; m < 12; m++) balance = (balance + monthly) * (1 + rate)
      year++
    }
    data.push({ years: `${h}yr`, value: Math.round(balance), contributed: Math.round(monthly * 12 * h) })
  }
  return data
}

export function getRiskReturnData() {
  return [
    { name: 'Cash', risk: 0.5, return: 4.5, size: 60 },
    { name: 'Bonds', risk: 2.5, return: 4.5, size: 80 },
    { name: 'REITs', risk: 5.5, return: 8.5, size: 90 },
    { name: 'Intl ETFs', risk: 6.5, return: 7.5, size: 90 },
    { name: 'S&P 500', risk: 6.0, return: 9.5, size: 100 },
    { name: 'Growth ETF', risk: 7.5, return: 11.5, size: 85 },
    { name: 'Tech/QQQ', risk: 8.5, return: 12.5, size: 80 },
    { name: 'Crypto', risk: 10, return: 15, size: 60 },
  ]
}
