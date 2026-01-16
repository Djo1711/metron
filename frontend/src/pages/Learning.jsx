import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Learning() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('tutorials')
  const [searchTerm, setSearchTerm] = useState("")

  const tutorials = [
    {
      title: "Reverse Convertible",
      icon: "📉",
      description: "Obligation à haut rendement avec risque de conversion en actions",
      productType: "reverse_convertible",
      
      whatIs: [
        "Un Reverse Convertible est un produit structuré qui combine une obligation avec une option de vente",
        "Il offre un coupon élevé (généralement 6-12% par an) en échange d'un risque sur le capital",
        "Si l'action sous-jacente tombe sous la barrière, vous recevez des actions au lieu de votre capital"
      ],
      
      howItWorks: [
        {
          step: "Investissement initial",
          description: "Vous investissez un montant (ex: 10 000€) sur un sous-jacent (ex: Apple)"
        },
        {
          step: "Période de coupon",
          description: "Pendant la durée du produit, vous recevez un coupon régulier (ex: 8% par an)"
        },
        {
          step: "Observation à l'échéance",
          description: "À maturité, on compare le prix de l'action au prix initial"
        },
        {
          step: "Remboursement",
          description: "Si l'action est au-dessus de la barrière (ex: 60%) → vous récupérez 100% + coupon. Si en dessous → vous recevez des actions ayant perdu de la valeur"
        }
      ],
      
      simulationSteps: [
        {
          section: "Données de marché",
          fields: [
            { name: "Ticker", value: "AAPL", explanation: "Le symbole de l'action sous-jacente (ex: AAPL pour Apple)" },
            { name: "Prix Spot", value: "150", explanation: "Le prix actuel de l'action en dollars" },
            { name: "Volatilité", value: "0.25", explanation: "La volatilité annualisée (25% = 0.25). Plus c'est élevé, plus le coupon sera élevé" },
            { name: "Taux sans risque", value: "0.04", explanation: "Le taux d'intérêt sans risque (4% = 0.04)" },
            { name: "Maturité", value: "1", explanation: "La durée du produit en années (généralement 1 an)" },
            { name: "Principal", value: "10000", explanation: "Votre investissement initial en dollars" }
          ]
        },
        {
          section: "Paramètres Reverse Convertible",
          fields: [
            { name: "Coupon", value: "8.0", explanation: "Le rendement annuel que vous recevez (8% par an)" },
            { name: "Barrière", value: "60", explanation: "Le niveau en % du prix initial. Si l'action tombe sous 60% du prix initial, vous recevez des actions" }
          ]
        }
      ],
      
      example: {
        scenario: "Exemple concret",
        setup: "Vous investissez 10 000$ sur Apple (AAPL) à 150$ avec un coupon de 8% et une barrière à 60%",
        outcomes: [
          {
            case: "Scénario positif",
            condition: "Apple termine à 160$ (au-dessus de 90$ qui est 60% de 150$)",
            result: "Vous récupérez 10 000$ + 800$ de coupon = 10 800$",
            profit: "+800$ (8% de rendement)"
          },
          {
            case: "Scénario négatif",
            condition: "Apple termine à 80$ (en dessous de 90$ qui est 60% de 150$)",
            result: "Vous recevez 66.67 actions Apple à 80$ = 5 333$ + 800$ de coupon = 6 133$",
            profit: "-3 867$ (perte de 38.67%)"
          }
        ]
      },
      
      advantages: [
        "Coupon élevé (6-12% par an) même en marché stable",
        "Génération de revenus réguliers",
        "Convient si vous êtes légèrement haussier ou neutre sur l'action"
      ],
      
      risks: [
        "Risque de perte en capital si l'action baisse fortement",
        "Gain plafonné au coupon (vous ne profitez pas si l'action monte beaucoup)",
        "Complexité du produit"
      ]
    },
    
    {
      title: "Autocall / Phoenix",
      icon: "📈",
      description: "Produit avec remboursement anticipé automatique et coupons conditionnels",
      productType: "autocall",
      
      whatIs: [
        "Un Autocall est un produit structuré qui peut se rembourser automatiquement avant l'échéance",
        "Il offre des coupons réguliers si certaines conditions sont remplies",
        "Très populaire en Europe et en Asie pour générer du rendement"
      ],
      
      howItWorks: [
        {
          step: "Investissement initial",
          description: "Vous investissez un montant (ex: 10 000€) sur un sous-jacent"
        },
        {
          step: "Observations périodiques",
          description: "À chaque date d'observation (tous les 3 ou 6 mois), on vérifie si l'action est au-dessus de la barrière autocall"
        },
        {
          step: "Remboursement anticipé",
          description: "Si l'action est au-dessus de 100% du prix initial → le produit se rembourse automatiquement avec tous les coupons cumulés"
        },
        {
          step: "À l'échéance finale",
          description: "Si jamais déclenché, vous recevez votre capital + coupons si au-dessus de la barrière de protection, sinon perte proportionnelle"
        }
      ],
      
      simulationSteps: [
        {
          section: "Données de marché",
          fields: [
            { name: "Ticker", value: "AAPL", explanation: "Le symbole de l'action (ex: AAPL, MSFT, TSLA)" },
            { name: "Prix Spot", value: "150", explanation: "Le prix actuel de l'action" },
            { name: "Volatilité", value: "0.25", explanation: "La volatilité de l'action (25% typique pour les grandes capitalisations)" },
            { name: "Taux sans risque", value: "0.04", explanation: "Le taux d'intérêt actuel (4%)" },
            { name: "Maturité", value: "1", explanation: "Durée maximale du produit (souvent 1 à 3 ans)" },
            { name: "Principal", value: "10000", explanation: "Montant investi" }
          ]
        },
        {
          section: "Paramètres Autocall",
          fields: [
            { name: "Barrière Autocall", value: "100", explanation: "Niveau pour le remboursement anticipé (100% = au prix initial). Si atteint, le produit se rembourse automatiquement" },
            { name: "Coupon", value: "8.0", explanation: "Le coupon annuel versé (8% par an, souvent payé trimestriellement)" },
            { name: "Barrière de protection", value: "60", explanation: "Protection du capital (60% = vous êtes protégé tant que l'action ne perd pas plus de 40%)" }
          ]
        }
      ],
      
      example: {
        scenario: "Exemple avec observations trimestrielles",
        setup: "Investissement de 10 000$ sur Apple à 150$, autocall à 100%, coupon 8%/an (2% par trimestre), protection à 60%",
        outcomes: [
          {
            case: "Remboursement anticipé (trimestre 2)",
            condition: "À la 2ème observation (6 mois), Apple est à 155$ (au-dessus de 150$)",
            result: "Le produit se rembourse : 10 000$ + 400$ de coupons cumulés = 10 400$",
            profit: "+400$ en 6 mois (rendement annualisé de 8%)"
          },
          {
            case: "Arrivée à maturité (scenario positif)",
            condition: "Apple termine à 145$ après 1 an (au-dessus de 90$ = barrière de 60%)",
            result: "10 000$ + 800$ de coupons = 10 800$",
            profit: "+800$ (8%)"
          },
          {
            case: "Scenario négatif",
            condition: "Apple termine à 75$ (sous les 90$ de protection)",
            result: "Perte proportionnelle : 10 000$ × (75/150) = 5 000$ + 800$ coupons = 5 800$",
            profit: "-4 200$ (perte de 42%)"
          }
        ]
      },
      
      advantages: [
        "Remboursement anticipé possible → sortie rapide si marché favorable",
        "Coupons réguliers même si l'action est stable",
        "Protection partielle du capital (barrière à 60-70% généralement)"
      ],
      
      risks: [
        "Gain plafonné (vous ne profitez pas d'une forte hausse)",
        "Risque de perte si l'action chute sous la barrière de protection",
        "Complexité du mécanisme"
      ]
    },
    
    {
      title: "Capital Garanti",
      icon: "🛡️",
      description: "Protection totale du capital avec participation à la hausse",
      productType: "capital_protected",
      
      whatIs: [
        "Un produit à Capital Garanti protège votre investissement initial à 100%",
        "Vous participez à la hausse du sous-jacent via un taux de participation",
        "Idéal pour les investisseurs prudents qui veulent s'exposer aux actions sans risque"
      ],
      
      howItWorks: [
        {
          step: "Protection du capital",
          description: "À l'échéance, vous êtes garantis de récupérer au minimum 100% de votre capital initial"
        },
        {
          step: "Participation à la hausse",
          description: "Si l'action monte, vous participez à la performance via un taux (ex: 80% de la hausse)"
        },
        {
          step: "Mécanisme",
          description: "Le produit investit une partie en obligations pour garantir le capital, et le reste en options pour la participation"
        },
        {
          step: "À l'échéance",
          description: "Capital garanti + participation × performance positive du sous-jacent"
        }
      ],
      
      simulationSteps: [
        {
          section: "Données de marché",
          fields: [
            { name: "Ticker", value: "AAPL", explanation: "L'action sur laquelle vous voulez vous exposer" },
            { name: "Prix Spot", value: "150", explanation: "Prix actuel de l'action" },
            { name: "Volatilité", value: "0.25", explanation: "Plus la volatilité est élevée, plus le taux de participation peut être faible" },
            { name: "Taux sans risque", value: "0.04", explanation: "Plus le taux est élevé, plus le taux de participation peut être élevé" },
            { name: "Maturité", value: "1", explanation: "Durée de l'investissement (souvent 3 à 5 ans)" },
            { name: "Principal", value: "10000", explanation: "Montant investi (garanti à 100%)" }
          ]
        },
        {
          section: "Paramètres Capital Garanti",
          fields: [
            { name: "Protection du capital", value: "100", explanation: "100% = vous récupérez au minimum tout votre capital initial" },
            { name: "Taux de participation", value: "80", explanation: "Vous participez à 80% de la hausse. Si l'action monte de 20%, vous gagnez 16%" }
          ]
        }
      ],
      
      example: {
        scenario: "Exemple sur 3 ans",
        setup: "10 000$ investis sur Apple à 150$, protection 100%, participation 80%",
        outcomes: [
          {
            case: "Scenario haussier",
            condition: "Apple termine à 195$ après 3 ans (+30%)",
            result: "Capital : 10 000$ + Participation : 10 000$ × 30% × 80% = 2 400$",
            profit: "+2 400$ (rendement de 24% sur 3 ans, soit ~7.5%/an)"
          },
          {
            case: "Scenario stable",
            condition: "Apple termine à 150$ (inchangé)",
            result: "Vous récupérez votre capital : 10 000$",
            profit: "0$ (capital préservé)"
          },
          {
            case: "Scenario baissier",
            condition: "Apple termine à 100$ (-33%)",
            result: "Vous récupérez votre capital garanti : 10 000$",
            profit: "0$ (aucune perte grâce à la garantie)"
          }
        ]
      },
      
      advantages: [
        "Protection totale du capital à maturité",
        "Participation à la hausse des marchés",
        "Parfait pour les investisseurs prudents",
        "Diversification sans risque de perte"
      ],
      
      risks: [
        "Participation limitée (généralement 50-100% de la hausse)",
        "Pas de dividendes",
        "Inflation non compensée si l'action est stable",
        "Garantie valable uniquement à maturité (perte possible si vente avant)"
      ]
    },
    
    {
      title: "Warrant / Turbo",
      icon: "🚀",
      description: "Produit à effet de levier pour amplifier les gains (et pertes)",
      productType: "warrant",
      
      whatIs: [
        "Un Warrant est un produit dérivé qui amplifie les variations du sous-jacent",
        "Avec un effet de levier de 5x, si l'action monte de 2%, le warrant monte de 10%",
        "Peut être Call (pari à la hausse) ou Put (pari à la baisse)"
      ],
      
      howItWorks: [
        {
          step: "Effet de levier",
          description: "Vous investissez un petit montant pour contrôler une position beaucoup plus importante"
        },
        {
          step: "Strike (prix d'exercice)",
          description: "Le niveau de prix à partir duquel le warrant a une valeur intrinsèque"
        },
        {
          step: "Amplification",
          description: "Les gains et pertes sont multipliés par le levier (ex: levier 5x → ×5 les mouvements)"
        },
        {
          step: "Expiration",
          description: "À maturité, valeur = Max(0, (Prix action - Strike) × Levier) pour un Call"
        }
      ],
      
      simulationSteps: [
        {
          section: "Données de marché",
          fields: [
            { name: "Ticker", value: "AAPL", explanation: "L'action sous-jacente" },
            { name: "Prix Spot", value: "150", explanation: "Prix actuel de l'action" },
            { name: "Volatilité", value: "0.25", explanation: "Influence le prix du warrant (plus de volatilité = plus cher)" },
            { name: "Taux sans risque", value: "0.04", explanation: "Taux d'intérêt" },
            { name: "Maturité", value: "1", explanation: "Durée de vie du warrant (souvent 3 mois à 2 ans)" },
            { name: "Principal", value: "10000", explanation: "Montant que vous investissez dans le warrant" }
          ]
        },
        {
          section: "Paramètres Warrant",
          fields: [
            { name: "Strike", value: "160", explanation: "Prix d'exercice. Pour un Call, vous gagnez si le prix dépasse ce niveau" },
            { name: "Type", value: "call", explanation: "Call = pari à la hausse | Put = pari à la baisse" },
            { name: "Effet de levier", value: "5", explanation: "Multiplicateur des gains/pertes. Levier 5 = vous multipliez par 5 les variations" }
          ]
        }
      ],
      
      example: {
        scenario: "Call Warrant avec levier 5x",
        setup: "10 000$ investis dans un Call warrant sur Apple, strike 160$, levier 5x, prix spot 150$",
        outcomes: [
          {
            case: "Scenario très haussier",
            condition: "Apple monte à 170$ (+13.3%)",
            result: "Valeur intrinsèque : (170 - 160) × 5 × 100 contrats = 5 000$ de profit",
            profit: "+5 000$ (50% de gain sur votre investissement)"
          },
          {
            case: "Scenario légèrement haussier",
            condition: "Apple monte à 155$ (+3.3%)",
            result: "Prix encore sous le strike de 160$ → warrant sans valeur ou très faible",
            profit: "Perte importante (le warrant perd de sa valeur temps)"
          },
          {
            case: "Scenario baissier",
            condition: "Apple baisse à 140$ (-6.7%)",
            result: "Warrant Call sans valeur (prix < strike)",
            profit: "-10 000$ (perte totale)"
          }
        ]
      },
      
      advantages: [
        "Fort effet de levier → gains multipliés",
        "Mise de départ faible pour une exposition importante",
        "Liquidité élevée sur les warrants cotés"
      ],
      
      risks: [
        "Pertes amplifiées par le levier",
        "Risque de perte totale du capital investi",
        "Érosion temporelle (theta négatif)",
        "Très risqué, réservé aux traders expérimentés"
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
        { term: "Action", definition: "Titre de propriété représentant une part du capital d'une entreprise. Son détenteur peut percevoir des dividendes et réaliser une plus-value ou une perte." },
        { term: "Obligation", definition: "Titre de créance par lequel l'investisseur prête de l'argent à un émetteur en échange d'intérêts et du remboursement du capital à l'échéance." },
        { term: "Taux", definition: "Pourcentage représentant le coût de l'argent ou le rendement d'un placement sur une période donnée." },
        { term: "Taux sans risque", definition: "Taux de rendement théorique d'un investissement sans risque de défaut, souvent approximé par les obligations d'État de haute qualité." }
      ]
    },
    {
      section: "Mécanique de marché & notions de prix",
      objective: "Comprendre comment les prix sont définis",
      intro: "La valeur d'un produit financier dépend de paramètres de marché observables et de conditions futures.",
      terms: [
        { term: "Spot", definition: "Prix actuel de marché d'un actif, observable à un instant donné." },
        { term: "Fair Value", definition: "Valeur théorique d'un instrument financier calculée à partir de modèles et des conditions de marché." },
        { term: "Rendement", definition: "Gain ou perte généré par un investissement sur une période donnée, exprimé en pourcentage du capital investi." },
        { term: "Nominal", definition: "Montant de référence servant au calcul des paiements (coupons, remboursements) d'un produit financier." },
        { term: "Strike", definition: "Prix auquel le détenteur d'une option peut acheter ou vendre le sous-jacent." },
        { term: "Échéance", definition: "Date à laquelle un produit financier arrive à maturité et où le paiement final est effectué." },
        { term: "Duration", definition: "Mesure de la sensibilité du prix d'une obligation ou d'un produit aux variations des taux d'intérêt." }
      ]
    },
    {
      section: "Introduction aux produits dérivés",
      objective: "Comprendre les briques de base des produits structurés",
      intro: "Les produits dérivés sont des instruments dont la valeur dépend de celle d'un sous-jacent.",
      terms: [
        { term: "Option", definition: "Contrat financier donnant le droit, mais non l'obligation, d'acheter ou de vendre un actif à un prix fixé à l'avance." },
        { term: "Call", definition: "Option donnant le droit d'acheter le sous-jacent à un prix déterminé (strike) jusqu'à ou à une date donnée." },
        { term: "Put", definition: "Option donnant le droit de vendre le sous-jacent à un prix déterminé (strike) jusqu'à ou à une date donnée." },
        { term: "Barrière", definition: "Niveau de prix du sous-jacent qui, s'il est atteint ou franchi, modifie les caractéristiques ou le remboursement du produit." },
        { term: "Digit (Option digitale)", definition: "Option qui verse un montant fixe si une condition prédéfinie est remplie à une date donnée, sinon rien." }
      ]
    },
    {
      section: "Volatilité & risque",
      objective: "Comprendre l'incertitude et son impact sur les prix",
      intro: "La volatilité mesure l'ampleur des variations de prix et joue un rôle clé dans la valorisation des options.",
      terms: [
        { term: "Volatilité historique", definition: "Mesure statistique des variations passées du prix d'un actif sur une période donnée." },
        { term: "Volatilité implicite", definition: "Volatilité anticipée par le marché, déduite du prix des options et reflétant les attentes futures." }
      ]
    },
    {
      section: "Sensibilités & gestion du risque (Greeks)",
      objective: "Comprendre comment un produit réagit aux marchés",
      intro: "Les Greeks mesurent la sensibilité du prix d'un produit dérivé aux variations des paramètres de marché.",
      terms: [
        { term: "Greeks", definition: "Indicateurs mesurant la sensibilité du prix d'un produit dérivé aux variations des paramètres de marché." },
        { term: "Delta", definition: "Sensibilité du prix du produit à une variation du prix du sous-jacent." },
        { term: "Gamma", definition: "Variation du delta lorsque le prix du sous-jacent évolue." },
        { term: "Vega", definition: "Sensibilité du prix du produit à une variation de la volatilité." },
        { term: "Volga", definition: "Sensibilité du vega à une variation de la volatilité, mesurant la convexité par rapport à la volatilité." },
        { term: "Theta", definition: "Impact de l'écoulement du temps sur la valeur du produit, aussi appelé érosion temporelle." },
        { term: "Rho", definition: "Sensibilité du prix du produit à une variation des taux d'intérêt." }
      ]
    },
    {
      section: "Produits structurés",
      objective: "Comprendre ce qu'est un produit structuré",
      intro: "Les produits structurés combinent plusieurs instruments financiers pour offrir un profil rendement/risque spécifique.",
      terms: [
        { term: "Produit structuré", definition: "Instrument financier combinant généralement une obligation et un ou plusieurs produits dérivés afin d'offrir un rendement et un profil de risque spécifiques." }
      ]
    }
  ]

  const filteredGlossary = useMemo(() => {
    return glossary
      .map(section => ({
        ...section,
        terms: section.terms.filter(term =>
          term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
          term.definition.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }))
      .filter(section => section.terms.length > 0)
  }, [searchTerm])

  const handleGoToSimulation = (productType) => {
    navigate(`/simulation?product=${productType}`)
  }

  return (
    <div className="min-h-screen bg-gradient-dark py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3">
            <span className="gradient-text">Centre d'Apprentissage</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Maîtrisez les produits structurés et la finance quantitative
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
            aria-label="Onglet Tutoriels"
          >
            📚 Tutoriels
          </button>
          <button
            onClick={() => setActiveTab('glossary')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'glossary'
                ? 'bg-gradient-metron shadow-neon-purple text-white'
                : 'glass-card text-gray-400 hover:text-white border border-white/10'
            }`}
            aria-label="Onglet Glossaire"
          >
            📖 Glossaire
          </button>
        </div>

        {/* Tutoriels */}
        {activeTab === 'tutorials' && (
          <div className="space-y-8">
            {tutorials.map((tutorial, index) => (
              <div
                key={index}
                className="glass-card p-8 border border-metron-purple/20 card-hover"
              >
                {/* En-tête */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-5xl">{tutorial.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {tutorial.title}
                    </h2>
                    <p className="text-gray-400 text-lg">{tutorial.description}</p>
                  </div>
                </div>

                {/* Qu'est-ce que c'est ? */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-metron-purple mb-3">
                    🎯 Qu'est-ce que c'est ?
                  </h3>
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <ul className="space-y-2 text-gray-300">
                      {tutorial.whatIs.map((item, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-metron-purple mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Comment ça fonctionne */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-metron-purple mb-3">
                    ⚙️ Comment ça fonctionne ?
                  </h3>
                  <div className="space-y-3">
                    {tutorial.howItWorks.map((step, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-metron-purple/30 flex items-center justify-center text-white font-bold">
                            {i + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-white mb-1">{step.step}</h4>
                            <p className="text-gray-300 text-sm">{step.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guide de simulation pas à pas */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-metron-purple mb-3">
                    🎮 Guide de Simulation Pas à Pas
                  </h3>
                  <div className="space-y-4">
                    {tutorial.simulationSteps.map((stepSection, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-metron-purple/10 to-metron-blue/10 rounded-xl p-5 border border-metron-purple/30">
                        <h4 className="font-bold text-white mb-4 text-lg">{stepSection.section}</h4>
                        <div className="space-y-3">
                          {stepSection.fields.map((field, fieldIdx) => (
                            <div key={fieldIdx} className="bg-white/5 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-white">{field.name}</span>
                                <span className="px-3 py-1 bg-metron-purple/30 rounded-full text-metron-purple font-mono text-sm">
                                  {field.value}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm">{field.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exemple concret */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-metron-purple mb-3">
                    💡 {tutorial.example.scenario}
                  </h3>
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10 mb-4">
                    <p className="text-gray-300 mb-4">
                      <span className="font-semibold text-white">Configuration : </span>
                      {tutorial.example.setup}
                    </p>
                    <div className="space-y-3">
                      {tutorial.example.outcomes.map((outcome, i) => (
                        <div key={i} className={`p-4 rounded-lg border ${
                          outcome.profit.startsWith('+') 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : outcome.profit.startsWith('-')
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-blue-500/10 border-blue-500/30'
                        }`}>
                          <h5 className="font-bold text-white mb-2">{outcome.case}</h5>
                          <p className="text-sm text-gray-300 mb-2">
                            <span className="font-semibold">Condition :</span> {outcome.condition}
                          </p>
                          <p className="text-sm text-gray-300 mb-2">
                            <span className="font-semibold">Résultat :</span> {outcome.result}
                          </p>
                          <p className={`text-sm font-bold ${
                            outcome.profit.startsWith('+') 
                              ? 'text-green-400' 
                              : outcome.profit.startsWith('-')
                              ? 'text-red-400'
                              : 'text-blue-400'
                          }`}>
                            💰 {outcome.profit}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Avantages */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-green-400 mb-3">
                    ✅ Avantages
                  </h3>
                  <div className="bg-green-500/10 rounded-xl p-5 border border-green-500/30">
                    <ul className="space-y-2 text-gray-300">
                      {tutorial.advantages.map((item, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-green-400 mt-1">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Risques */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-red-400 mb-3">
                    ⚠️ Risques
                  </h3>
                  <div className="bg-red-500/10 rounded-xl p-5 border border-red-500/30">
                    <ul className="space-y-2 text-gray-300">
                      {tutorial.risks.map((item, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-red-400 mt-1">⚠</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bouton Simulation */}
                <button
                  onClick={() => handleGoToSimulation(tutorial.productType)}
                  className="mt-4 btn-neon w-full text-lg py-4"
                >
                  🚀 Essayer dans la Simulation →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Glossaire avec barre de recherche */}
        {activeTab === 'glossary' && (
          <div className="space-y-12">
            <div className="mb-8 flex justify-center">
              <input
                type="text"
                placeholder="Rechercher un terme..."
                className="w-full max-w-md p-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:border-metron-purple"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredGlossary.length > 0 ? (
              filteredGlossary.map((section, sIndex) => (
                <section key={sIndex}>
                  <h2 className="text-3xl font-bold text-white mb-3 text-center">
                    {section.section}
                  </h2>
                  <p className="text-gray-400 mb-6 text-center">{section.intro}</p>

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
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Aucun terme trouvé pour "{searchTerm}"</p>
              </div>
            )}
          </div>
        )}

        {/* CTA global */}
        <div className="glass-card p-8 mt-12 text-center border border-metron-blue/30">
          <h3 className="text-2xl font-bold text-white mb-3">Prêt à pratiquer ?</h3>
          <p className="text-gray-400 mb-6">
            Appliquez ces concepts dans une vraie simulation de pricing
          </p>
          <button onClick={() => navigate('/simulation')} className="inline-block btn-neon">
            Aller à la Simulation →
          </button>
        </div>
      </div>
    </div>
  )
}