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
  {
    section: "Fondamentaux des marchés financiers",
    objective: "Comprendre sur quoi on investit",
    intro: "Les produits financiers reposent toujours sur un actif sous-jacent. Voici les bases pour comprendre ces actifs.",
    terms: [
      { term: "Actif", definition: "Instrument financier ou réel ayant une valeur économique et pouvant être détenu ou échangé (action, obligation, devise, matière première)." },
      { term: "Sous-jacent", definition: "Actif financier sur lequel repose un produit dérivé ou un produit structuré. Sa performance détermine le paiement final." },
      { term: "Action", definition: "Titre de propriété représentant une part du capital d’une entreprise. Son détenteur peut percevoir des dividendes et réaliser une plus-value ou une perte." },
      { term: "Obligation", definition: "Titre de créance par lequel l’investisseur prête de l’argent à un émetteur en échange d’intérêts et du remboursement du capital à l’échéance." },
      { term: "Taux", definition: "Pourcentage représentant le coût de l’argent ou le rendement d’un placement sur une période donnée." },
      { term: "Taux sans risque", definition: "Taux de rendement théorique d’un investissement sans risque de défaut, souvent approximé par les obligations d’État de haute qualité." }
    ]
  },

  {
    section: "Mécanique de marché & notions de prix",
    objective: "Comprendre comment les prix sont définis",
    intro: "La valeur d’un produit financier dépend de paramètres de marché observables et de conditions futures.",
    terms: [
      { term: "Spot", definition: "Prix actuel de marché d’un actif, observable à un instant donné." },
      { term: "Fair Value", definition: "Valeur théorique d’un instrument financier calculée à partir de modèles et des conditions de marché." },
      { term: "Rendement", definition: "Gain ou perte généré par un investissement sur une période donnée, exprimé en pourcentage du capital investi." },
      { term: "Nominal", definition: "Montant de référence servant au calcul des paiements (coupons, remboursements) d’un produit financier." },
      { term: "Strike", definition: "Prix auquel le détenteur d’une option peut acheter ou vendre le sous-jacent." },
      { term: "Échéance", definition: "Date à laquelle un produit financier arrive à maturité et où le paiement final est effectué." },
      { term: "Duration", definition: "Mesure de la sensibilité du prix d’une obligation ou d’un produit aux variations des taux d’intérêt." }
    ]
  },

  {
    section: "Introduction aux produits dérivés",
    objective: "Comprendre les briques de base des produits structurés",
    intro: "Les produits dérivés sont des instruments dont la valeur dépend de celle d’un sous-jacent.",
    terms: [
      { term: "Option", definition: "Contrat financier donnant le droit, mais non l’obligation, d’acheter ou de vendre un actif à un prix fixé à l’avance." },
      { term: "Call", definition: "Option donnant le droit d’acheter le sous-jacent à un prix déterminé (strike) jusqu’à ou à une date donnée." },
      { term: "Put", definition: "Option donnant le droit de vendre le sous-jacent à un prix déterminé (strike) jusqu’à ou à une date donnée." },
      { term: "Barrière", definition: "Niveau de prix du sous-jacent qui, s’il est atteint ou franchi, modifie les caractéristiques ou le remboursement du produit." },
      { term: "Digit (Option digitale)", definition: "Option qui verse un montant fixe si une condition prédéfinie est remplie à une date donnée, sinon rien." }
    ]
  },

  {
    section: "Volatilité & risque",
    objective: "Comprendre l’incertitude et son impact sur les prix",
    intro: "La volatilité mesure l’ampleur des variations de prix et joue un rôle clé dans la valorisation des options.",
    terms: [
      { term: "Volatilité historique", definition: "Mesure statistique des variations passées du prix d’un actif sur une période donnée." },
      { term: "Volatilité implicite", definition: "Volatilité anticipée par le marché, déduite du prix des options et reflétant les attentes futures." }
    ]
  },

  {
    section: "Sensibilités & gestion du risque (Greeks)",
    objective: "Comprendre comment un produit réagit aux marchés",
    intro: "Les Greeks mesurent la sensibilité du prix d’un produit dérivé aux variations des paramètres de marché.",
    terms: [
      { term: "Greeks", definition: "Indicateurs mesurant la sensibilité du prix d’un produit dérivé aux variations des paramètres de marché." },
      { term: "Delta", definition: "Sensibilité du prix du produit à une variation du prix du sous-jacent." },
      { term: "Gamma", definition: "Variation du delta lorsque le prix du sous-jacent évolue." },
      { term: "Vega", definition: "Sensibilité du prix du produit à une variation de la volatilité." },
      { term: "Volga", definition: "Sensibilité du vega à une variation de la volatilité, mesurant la convexité par rapport à la volatilité." },
      { term: "Theta", definition: "Impact de l’écoulement du temps sur la valeur du produit, aussi appelé érosion temporelle." },
      { term: "Rho", definition: "Sensibilité du prix du produit à une variation des taux d’intérêt." }
    ]
  },

  {
    section: "Produits structurés",
    objective: "Comprendre ce qu’est un produit structuré",
    intro: "Les produits structurés combinent plusieurs instruments financiers pour offrir un profil rendement/risque spécifique.",
    terms: [
      { term: "Produit structuré", definition: "Instrument financier combinant généralement une obligation et un ou plusieurs produits dérivés afin d’offrir un rendement et un profil de risque spécifiques." }
    ]
  }
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

      {/* Onglets */}
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
            <div
              key={index}
              className="glass-card p-8 border border-metron-purple/20 card-hover"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">{tutorial.icon}</div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {tutorial.title}
                  </h2>
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
        </div>
      )}

      {activeTab === 'glossary' && (
        <div className="space-y-12">
          {glossary.map((section, sIndex) => (
            <section key={sIndex}>
              {/* Titre de la section */}
              <h2 className="text-3xl font-bold text-white mb-3 text-center">
                {section.section}
              </h2>
              <p className="text-gray-400 mb-6 text-center">{section.intro}</p>

              {/* Liste des termes */}
              <div className="grid md:grid-cols-2 gap-6">
                {section.terms.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white/5 p-5 rounded-xl border border-white/10 hover:border-metron-purple/50 transition-all"
                  >
                    <h3 className="text-lg font-bold text-metron-purple mb-2">
                      {item.term}
                    </h3>
                    <p className="text-gray-300 text-sm">{item.definition}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* CTA global */}
      <div className="glass-card p-8 mt-12 text-center border border-metron-blue/30">
        <h3 className="text-2xl font-bold text-white mb-3">Ready to Practice?</h3>
        <p className="text-gray-400 mb-6">
          Apply these concepts in a real pricing simulation
        </p>
        <a href="/simulation" className="inline-block btn-neon">
          Go to Simulation →
        </a>
      </div>
    </div>
  </div>
)
}