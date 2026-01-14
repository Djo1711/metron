import { useState } from 'react'

export default function Learning() {
  const [activeTab, setActiveTab] = useState('tutorials')

  const tutorials = [
    {
      title: "Reverse Convertible",
      icon: "📉",
      description: "Understand how reverse convertibles work",
      content: [
        "A reverse convertible pays a high coupon but exposes you to downside risk",
        "If stock falls below barrier, you receive shares instead of principal",
        "Example: $10,000 investment, 8% coupon, 60% barrier on AAPL at $150"
      ]
    },
    {
      title: "Black-Scholes Model",
      icon: "📊",
      description: "Learn the mathematical framework behind option pricing",
      content: [
        "The Black-Scholes model prices European options based on 5 inputs",
        "Spot Price, Strike Price, Time to Maturity, Volatility, Risk-Free Rate",
        "Formula: C = S·N(d₁) - K·e^(-rT)·N(d₂)"
      ]
    },
    {
      title: "Greeks",
      icon: "🔤",
      description: "Master the sensitivity measures of options",
      content: [
        "Delta: Sensitivity to underlying price changes",
        "Gamma: Rate of change of Delta",
        "Vega: Sensitivity to volatility changes",
        "Theta: Time decay"
      ]
    }
  ]

  const glossary = [
    { term: "Strike Price", definition: "The price at which an option can be exercised" },
    { term: "Barrier Level", definition: "The threshold below which the product structure changes" },
    { term: "Coupon", definition: "The periodic interest payment to investors" },
    { term: "Volatility", definition: "Measure of price fluctuations" },
    { term: "Principal", definition: "The initial investment amount" },
  ]

  return (
    <div className="min-h-screen bg-gradient-dark py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3">
            <span className="gradient-text">Learning Center</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Master structured products and quantitative finance
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('tutorials')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'tutorials'
                ? 'bg-gradient-metron shadow-neon-purple text-white'
                : 'glass-card text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            📚 Tutorials
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'glossary'
                ? 'bg-gradient-metron shadow-neon-purple text-white'
                : 'glass-card text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            📖 Glossary
          </button>
        </div>

        {activeTab === 'tutorials' && (
          <div className="space-y-6">
            {tutorials.map((tutorial, index) => (
              <div key={index} className="glass-card p-8 border border-metron-purple/20 card-hover">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">{tutorial.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2">{tutorial.title}</h2>
                    <p className="text-gray-400 text-lg">{tutorial.description}</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <ul className="space-y-3 text-gray-300">
                    {tutorial.content.map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="text-metron-purple mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            <div className="glass-card p-8 text-center border border-metron-blue/30">
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Practice?</h3>
              <p className="text-gray-400 mb-6">Try pricing your first reverse convertible</p>
              <a href="/simulation" className="inline-block btn-neon">Go to Simulation →</a>
            </div>
          </div>
        )}

        {activeTab === 'glossary' && (
          <div className="glass-card p-8 border border-metron-purple/20">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Financial Terms Dictionary</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {glossary.map((item, index) => (
                <div key={index} className="bg-white/5 p-5 rounded-xl border border-white/10 hover:border-metron-purple/50 transition-all">
                  <h3 className="text-lg font-bold text-metron-purple mb-2">{item.term}</h3>
                  <p className="text-gray-300 text-sm">{item.definition}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}