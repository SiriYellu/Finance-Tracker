import { useState } from 'react'
import { CheckCircle, ChevronDown, ChevronUp, ExternalLink, Shield, Smartphone, Globe, DollarSign, TrendingUp, Star, AlertTriangle, BookOpen, ArrowRight } from 'lucide-react'

const BROKERS = [
  {
    name: 'Fidelity', logo: '🏦', tagline: 'Best for Beginners', color: 'from-green-500 to-emerald-600',
    minDeposit: '$0', fees: '$0 trades', pros: ['No account minimum', 'No trading fees', 'Fractional shares from $1', 'Excellent research tools', 'Great mobile app'],
    cons: ['Interface can feel complex at first'],
    bestFor: 'Overall best — especially if you want fractional shares of VOO or NVDA for as little as $1',
    url: 'https://www.fidelity.com',
    recommended: true, difficulty: 'Beginner', rating: 5,
  },
  {
    name: 'Charles Schwab', logo: '🏛️', tagline: 'Best for Long-Term', color: 'from-blue-500 to-blue-700',
    minDeposit: '$0', fees: '$0 trades', pros: ['No minimum', 'No trading fees', 'Fractional shares', 'Great ETF selection', 'Solid customer service'],
    cons: ['Mobile app less polished'],
    bestFor: 'Long-term ETF investors — owns Vanguard competitor funds like SCHB, SCHD',
    url: 'https://www.schwab.com',
    recommended: true, difficulty: 'Beginner', rating: 5,
  },
  {
    name: 'Robinhood', logo: '📱', tagline: 'Easiest to Use', color: 'from-emerald-400 to-teal-500',
    minDeposit: '$0', fees: '$0 trades', pros: ['Simplest interface', 'Easy for first-timers', 'Fractional shares', 'Instant deposits'],
    cons: ['Limited research tools', 'No mutual funds', 'Customer support issues'],
    bestFor: 'Complete beginners who just want to buy their first stock quickly',
    url: 'https://robinhood.com',
    recommended: false, difficulty: 'Very Easy', rating: 3,
  },
  {
    name: 'Vanguard', logo: '⚓', tagline: 'Best for ETFs', color: 'from-red-500 to-red-700',
    minDeposit: '$0', fees: '$0 trades', pros: ['Creator of VOO & VTI', 'Lowest expense ratios', 'Investor-owned structure', 'Best for buy & hold'],
    cons: ['Outdated interface', 'No fractional shares'],
    bestFor: 'Pure ETF investors — buying VOO directly from its creator',
    url: 'https://investor.vanguard.com',
    recommended: false, difficulty: 'Intermediate', rating: 4,
  },
]

const STEPS = [
  {
    num: 1, title: 'Choose a Broker', icon: Globe, color: 'bg-blue-500',
    desc: 'A broker is an app/website that lets you buy stocks & ETFs. Think of it like an Amazon for investments.',
    detail: 'We recommend Fidelity or Schwab — both are free, trusted, and regulated by the SEC. Takes 5 minutes to sign up.',
    tip: '✅ All brokers listed here are FDIC/SIPC insured — your money is protected up to $500,000.',
  },
  {
    num: 2, title: 'Open Your Account', icon: CheckCircle, color: 'bg-emerald-500',
    desc: 'Sign up with your name, email, Social Security Number, and address. It\'s like opening a bank account.',
    detail: 'Choose a "Brokerage Account" (not IRA for now). Approval is usually instant or within 1 business day.',
    tip: '✅ This is 100% legal and safe. The SEC and FINRA regulate all these platforms.',
  },
  {
    num: 3, title: 'Add Money', icon: DollarSign, color: 'bg-purple-500',
    desc: 'Link your bank account and transfer money in. Even $10 is enough to start.',
    detail: 'Use ACH transfer (free, 1–3 days) or instant deposit with a debit card. There is no minimum on Fidelity or Schwab.',
    tip: '✅ You can start with any amount — $10, $50, $100. You can always add more later.',
  },
  {
    num: 4, title: 'Search for Your Investment', icon: TrendingUp, color: 'bg-orange-500',
    desc: 'In the search bar, type the ticker symbol (e.g. "VOO") and click on the result.',
    detail: 'You\'ll see the current price, a chart of historical performance, and a "Buy" button. Read the description to confirm it\'s what you want.',
    tip: '✅ Start with VOO (S&P 500 ETF) — it\'s the most beginner-friendly, safest, and historically rewarding choice.',
  },
  {
    num: 5, title: 'Place Your Order', icon: Star, color: 'bg-emerald-500',
    desc: 'Click "Buy", enter the dollar amount (not shares), and confirm.',
    detail: 'Select "Market Order" — this buys at the current price. Enter your dollar amount. Review and click "Submit". Done!',
    tip: '✅ You now own part of the S&P 500. Set a reminder to check in once a month — not every day.',
  },
]

const STARTER_PICKS = [
  {
    symbol: 'VOO', name: 'S&P 500 ETF', amount: '$100', why: 'The single best starting investment. 500 top US companies in one click.',
    returns: '~10%/yr historically', risk: 'Medium', icon: '⭐', color: 'border-emerald-400',
  },
  {
    symbol: 'QQQ', name: 'NASDAQ-100 ETF', amount: '$50', why: 'Top tech & AI companies. Higher growth, slightly more volatile.',
    returns: '~13%/yr historically', risk: 'Medium-High', icon: '🚀', color: 'border-blue-400',
  },
  {
    symbol: 'MSFT', name: 'Microsoft', amount: '$25', why: 'Most stable big tech stock. AI + cloud growth with low volatility.',
    returns: '~22%/yr (5yr avg)', risk: 'Medium', icon: '💎', color: 'border-purple-400',
  },
]

const FAQS = [
  { q: 'Is investing safe? Can I lose all my money?', a: 'Broad ETFs like VOO have never gone to zero in 100+ years. Individual stocks can lose value. Start with ETFs like VOO to minimize risk. Your broker account itself is SIPC-insured up to $500,000.' },
  { q: 'How much money do I need to start?', a: 'Fidelity and Schwab have $0 minimum. You can buy fractional shares of VOO for as little as $1. Most people start with $50–$100.' },
  { q: 'When is the best time to buy?', a: 'Time in the market beats timing the market. The best time to start was 10 years ago. The second best time is today. Don\'t wait for the "perfect" moment.' },
  { q: 'How do I make money from stocks?', a: 'Two ways: (1) Price appreciation — stock goes up, you sell for profit. (2) Dividends — companies pay you cash quarterly just for holding. ETFs like SCHD do both.' },
  { q: 'How do I know when to sell?', a: 'For long-term investing (VOO, QQQ), most experts say never sell unless you need the money or your financial goals change. Selling early is the #1 mistake beginners make.' },
  { q: 'Do I pay taxes on investments?', a: 'Yes — profits from selling are taxed as capital gains. If you hold longer than 1 year, the rate is lower (0–20%). Dividends are also taxable. Keep records of your purchases.' },
  { q: 'What is a fractional share?', a: 'If a stock costs $200, you can buy $10 worth (1/20th of a share). Fidelity and Schwab both support this — great for expensive stocks like NVDA or GOOGL.' },
]

function StarRating({ n }) {
  return <span className="text-amber-400">{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
}

export default function HowToInvest() {
  const [openFaq, setOpenFaq] = useState(null)
  const [openStep, setOpenStep] = useState(0)

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-start gap-4">
          <BookOpen className="w-10 h-10 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-black mb-1">How to Start Investing</h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Never bought a stock or ETF before? This page walks you through everything — step by step, in plain English. No experience needed.
            </p>
            <div className="flex gap-3 mt-3 flex-wrap">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">✅ 100% Free to Start</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">⏱ Takes ~10 minutes</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">💰 Start with $10</span>
            </div>
          </div>
        </div>
      </div>

      {/* What to buy first */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
        <h3 className="text-base font-black mb-1 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          What should I buy first?
        </h3>
        <p className="text-sm text-gray-500 mb-4">If you're completely new, start here. These 3 picks cover 90% of what beginners need.</p>
        <div className="grid md:grid-cols-3 gap-3">
          {STARTER_PICKS.map(p => (
            <div key={p.symbol} className={`rounded-xl border-2 ${p.color} p-4 bg-gray-50 dark:bg-gray-800`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{p.icon}</span>
                <div>
                  <span className="font-black">{p.symbol}</span>
                  <span className="text-xs text-gray-500 ml-1">{p.name}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">{p.why}</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-gray-400">Suggested start</span><span className="font-bold text-emerald-500">{p.amount}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Historical return</span><span className="font-bold">{p.returns}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Risk level</span><span className="font-bold">{p.risk}</span></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-300">
          <strong>Our #1 recommendation for beginners:</strong> Open Fidelity → Buy $100 of VOO → Set up a $50/month automatic investment. That's it. You're now investing like Warren Buffett recommends.
        </div>
      </div>

      {/* Step-by-step */}
      <div className="mb-6">
        <h3 className="text-base font-black mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          5 Steps to Buy Your First Investment
        </h3>
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            const isOpen = openStep === i
            return (
              <div key={i} className={`bg-white dark:bg-gray-900 rounded-xl border-2 overflow-hidden transition-all ${isOpen ? 'border-emerald-500' : 'border-gray-200 dark:border-gray-800'}`}>
                <button onClick={() => setOpenStep(isOpen ? null : i)} className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-black text-lg">{step.num}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{step.title}</p>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3 ml-14">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">{step.detail}</p>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-sm text-emerald-700 dark:text-emerald-300">
                      {step.tip}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Broker Comparison */}
      <div className="mb-6">
        <h3 className="text-base font-black mb-1 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" />
          Which Broker Should I Use?
        </h3>
        <p className="text-sm text-gray-500 mb-4">All are free, regulated, and beginner-friendly. We recommend <strong>Fidelity</strong> as the best starting point.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {BROKERS.map(broker => (
            <div key={broker.name} className={`bg-white dark:bg-gray-900 rounded-2xl border-2 ${broker.recommended ? 'border-emerald-400' : 'border-gray-200 dark:border-gray-800'} p-5 relative overflow-hidden`}>
              {broker.recommended && (
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Recommended</div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{broker.logo}</span>
                <div>
                  <p className="font-black text-lg">{broker.name}</p>
                  <p className="text-xs text-gray-500">{broker.tagline}</p>
                  <StarRating n={broker.rating} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400">Min. Deposit</div>
                  <div className="font-black text-emerald-500">{broker.minDeposit}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400">Trading Fees</div>
                  <div className="font-black text-emerald-500">{broker.fees}</div>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 mb-1.5">Pros</p>
                <ul className="space-y-1">
                  {broker.pros.map((p, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />{p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2.5 mb-3 text-xs text-blue-700 dark:text-blue-300">
                <strong>Best for:</strong> {broker.bestFor}
              </div>
              <a href={broker.url} target="_blank" rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all bg-gradient-to-r ${broker.gradient} text-white hover:opacity-90 shadow-md`}>
                Open Free Account at {broker.name} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Important disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700 dark:text-amber-300">
          <p className="font-bold mb-1">Important Disclaimer</p>
          <p className="leading-relaxed">This is educational content, not financial advice. All investments carry risk — you can lose money. Past returns don't guarantee future results. Please read each broker's disclosures before opening an account. Consider consulting a certified financial advisor (CFP) for personalized advice.</p>
        </div>
      </div>

      {/* Quick reference: how to buy VOO */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
        <h3 className="font-black text-base mb-4 flex items-center gap-2">
          <ArrowRight className="w-5 h-5 text-emerald-500" />
          Quick Reference: How to Buy VOO on Fidelity
        </h3>
        <ol className="space-y-3">
          {[
            'Go to fidelity.com → click "Open an Account" → choose "Brokerage Account"',
            'Fill in your name, address, SSN, date of birth. Takes ~5 minutes.',
            'Link your bank account via routing + account number. Transfer $100 (or any amount).',
            'In the search bar at the top, type "VOO" → click "Vanguard S&P 500 ETF"',
            'Click the green "Buy" button → select "Dollars" → enter your amount → choose "Market Order"',
            'Review your order → click "Place Order". You\'re now a VOO investor! 🎉',
            'Optional: Set up automatic monthly investment → "Automatic Investments" in your account settings',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs">{i + 1}</span>
              <span className="text-gray-600 dark:text-gray-300 pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="text-base font-black mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-500" />
          Common Questions
        </h3>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <span className="font-semibold text-sm">{faq.q}</span>
                {openFaq === i ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
