import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Learning() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('tutorials')
  const [selectedProduct, setSelectedProduct] = useState('reverse_convertible')
  const [searchTerm, setSearchTerm] = useState("")

  const tutorials = [
    {
      id: 'reverse_convertible',
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
      id: 'autocall',
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
      id: 'capital_protected',
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
      id: 'warrant',
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
        { 
          term: "Actif", 
          definition: "Un actif est un instrument financier ou réel possédant une valeur économique et pouvant être détenu, échangé ou négocié sur les marchés. Les actifs financiers incluent les actions (parts de propriété dans une entreprise), les obligations (titres de créance), les devises (monnaies étrangères), et les matières premières (or, pétrole, blé, etc.).",
          details: "Les actifs sont classés en plusieurs catégories : actifs liquides (facilement convertibles en cash comme les actions cotées), actifs réels (immobilier, or physique), et actifs financiers (produits dérivés, obligations). Chaque classe d'actifs présente un profil risque/rendement différent."
        },
        { 
          term: "Sous-jacent", 
          definition: "Le sous-jacent est l'actif financier de référence sur lequel repose un produit dérivé ou structuré. La valeur et la performance du produit dérivé dépendent directement des variations de prix du sous-jacent.",
          details: "Par exemple, dans une option sur Apple (AAPL), l'action Apple est le sous-jacent. Si Apple monte de 10%, l'option peut gagner 50% grâce à l'effet de levier. Le choix du sous-jacent est crucial : volatilité, liquidité, et corrélations doivent être analysés.",
          formula: "Prix Dérivé = f(Prix Sous-jacent, Volatilité, Temps, Taux)"
        },
        { 
          term: "Action", 
          definition: "Une action est un titre de propriété représentant une fraction du capital social d'une entreprise. En détenant une action, l'investisseur devient actionnaire et peut percevoir des dividendes (partage des bénéfices) et réaliser des plus-values (ou moins-values) lors de la revente.",
          details: "Les actions offrent un potentiel de rendement élevé mais avec une volatilité importante. Historiquement, les actions surperforment les obligations sur le long terme (8-10% annualisé pour le S&P 500 depuis 1950). Les droits de vote permettent de participer aux assemblées générales."
        },
        { 
          term: "Obligation", 
          definition: "Une obligation est un titre de créance par lequel un investisseur prête de l'argent à un émetteur (État, entreprise) en échange du paiement d'intérêts périodiques (coupons) et du remboursement du capital (principal) à l'échéance.",
          details: "Les obligations sont considérées moins risquées que les actions. Leur prix varie inversement aux taux d'intérêt : si les taux montent, le prix des obligations existantes baisse. Les obligations d'État (Treasury bonds) sont considérées comme sans risque de défaut.",
          formula: "Prix Obligation = Σ (Coupon / (1+r)ᵗ) + Principal / (1+r)ⁿ"
        },
        { 
          term: "Taux d'intérêt", 
          definition: "Le taux d'intérêt représente le coût de l'argent ou le rendement d'un placement sur une période donnée, exprimé en pourcentage annuel. Il rémunère le prêteur et reflète le risque et la durée du prêt.",
          details: "Les taux d'intérêt influencent toute l'économie : ils affectent le coût des crédits immobiliers, les rendements obligataires, la valorisation des actions (via l'actualisation des flux futurs), et les taux de change. Les banques centrales (Fed, BCE) pilotent l'économie via leurs taux directeurs."
        },
        { 
          term: "Taux sans risque", 
          definition: "Le taux sans risque est le taux de rendement théorique d'un investissement sans risque de défaut. En pratique, on utilise le rendement des obligations d'État de haute qualité (US Treasury à 10 ans, Bund allemand) comme proxy.",
          details: "Le taux sans risque sert de référence pour évaluer tous les autres actifs. En finance quantitative, il est utilisé dans le modèle de Black-Scholes pour actualiser les flux futurs. Actuellement, les taux sans risque sont autour de 4-5% aux USA (2024-2025).",
          formula: "Rendement Actif = Taux sans risque + Prime de risque"
        }
      ]
    },
    {
      section: "Mécanique de marché & notions de prix",
      objective: "Comprendre comment les prix sont définis",
      intro: "La valeur d'un produit financier dépend de paramètres de marché observables et de conditions futures.",
      terms: [
        { 
          term: "Prix Spot (S₀)", 
          definition: "Le prix spot est le prix actuel de marché d'un actif, observable en temps réel à un instant donné. C'est le prix auquel vous pouvez acheter ou vendre immédiatement l'actif.",
          details: "Le spot est déterminé par l'offre et la demande sur le marché. Pour les actions, c'est le dernier prix de transaction. Pour les devises, c'est le taux de change instantané. Le spot sert de référence pour fixer le prix des produits dérivés."
        },
        { 
          term: "Fair Value (Valeur Théorique)", 
          definition: "La fair value est la valeur théorique d'un instrument financier, calculée à partir de modèles mathématiques (Black-Scholes, Monte Carlo) et des conditions actuelles de marché (spot, volatilité, taux, temps).",
          details: "La fair value permet de déterminer si un produit est surévalué ou sous-évalué par rapport au marché. Un écart entre le prix de marché et la fair value représente une opportunité d'arbitrage. Les traders institutionnels utilisent des modèles sophistiqués pour calculer la fair value en continu.",
          formula: "Fair Value = 𝔼[Payoff actualisé] = e⁻ʳᵀ × 𝔼[Payoff(Sᴛ)]"
        },
        { 
          term: "Rendement", 
          definition: "Le rendement mesure le gain ou la perte généré par un investissement sur une période, exprimé en pourcentage du capital investi initial. Il inclut les plus-values et les revenus (dividendes, coupons).",
          details: "Le rendement peut être simple (gain/capital initial) ou composé (réinvestissement des gains). Le rendement annualisé permet de comparer des investissements de durées différentes. Attention : un rendement élevé s'accompagne généralement d'un risque élevé.",
          formula: "Rendement = (Valeur Finale - Valeur Initiale + Revenus) / Valeur Initiale × 100%"
        },
        { 
          term: "Nominal (Principal)", 
          definition: "Le nominal, aussi appelé principal ou montant notionnel, est le montant de référence servant de base au calcul des paiements d'un produit financier (coupons d'obligations, payoff de dérivés).",
          details: "Dans une obligation de nominal 1000€ avec coupon 5%, vous recevez 50€ par an. Pour les produits structurés, le nominal est votre capital investi initial. À ne pas confondre avec la valeur de marché qui peut fluctuer."
        },
        { 
          term: "Strike (Prix d'exercice)", 
          definition: "Le strike est le prix prédéterminé auquel le détenteur d'une option peut acheter (call) ou vendre (put) l'actif sous-jacent, indépendamment du prix de marché actuel.",
          details: "Le strike détermine la rentabilité d'une option. Pour un call, si le prix spot > strike, l'option est 'in the money' (ITM) et a une valeur intrinsèque positive. Si spot < strike, elle est 'out of the money' (OTM). Le choix du strike est crucial : plus il est éloigné du spot, moins l'option coûte cher mais moins elle a de chances d'être rentable.",
          formula: "Valeur intrinsèque Call = Max(0, Spot - Strike)"
        },
        { 
          term: "Échéance (Maturité)", 
          definition: "L'échéance est la date future à laquelle un produit financier arrive à terme et où le paiement final est effectué. Après cette date, le produit cesse d'exister.",
          details: "Plus l'échéance est lointaine, plus l'incertitude est grande et plus la valeur temps des options est élevée. Les produits structurés ont généralement des maturités de 1 à 5 ans. À l'échéance, seule la valeur intrinsèque subsiste (valeur temps = 0)."
        },
        { 
          term: "Duration", 
          definition: "La duration mesure la sensibilité du prix d'une obligation aux variations des taux d'intérêt. Elle représente la durée de vie moyenne pondérée des flux de trésorerie actualisés.",
          details: "Une duration de 5 ans signifie qu'une hausse de 1% des taux entraîne une baisse d'environ 5% du prix de l'obligation. La duration modifiée ajuste ce concept pour une meilleure précision. C'est un indicateur clé pour gérer le risque de taux.",
          formula: "Duration = - (1/P) × (dP/dr)"
        }
      ]
    },
    {
      section: "Introduction aux produits dérivés",
      objective: "Comprendre les briques de base des produits structurés",
      intro: "Les produits dérivés sont des instruments dont la valeur dépend de celle d'un sous-jacent.",
      terms: [
        { 
          term: "Option", 
          definition: "Une option est un contrat financier donnant à son détenteur le droit, mais non l'obligation, d'acheter (call) ou de vendre (put) un actif sous-jacent à un prix fixé à l'avance (strike), jusqu'à ou à une date d'échéance déterminée.",
          details: "Les options sont les briques fondamentales des produits structurés. Le détenteur de l'option paie une prime pour acquérir ce droit. Les options sont valorisées avec le modèle de Black-Scholes qui intègre 5 paramètres : spot, strike, volatilité, taux, et temps jusqu'à échéance.",
          formula: "C = S₀N(d₁) - Ke⁻ʳᵀN(d₂) où d₁ = [ln(S₀/K) + (r + σ²/2)T] / (σ√T)"
        },
        { 
          term: "Call (Option d'achat)", 
          definition: "Un call est une option donnant le droit d'acheter l'actif sous-jacent au prix d'exercice (strike) jusqu'à l'échéance. On achète un call quand on anticipe une hausse du sous-jacent.",
          details: "Le call a une valeur si le prix spot dépasse le strike à l'échéance. Exemple : call Apple strike 150$, si Apple termine à 170$, la valeur intrinsèque est 20$ par action. Le risque maximum est limité à la prime payée. Les calls sont utilisés pour spéculer ou se couvrir contre une hausse.",
          formula: "Payoff Call = Max(0, Sᴛ - K) où Sᴛ = prix final et K = strike"
        },
        { 
          term: "Put (Option de vente)", 
          definition: "Un put est une option donnant le droit de vendre l'actif sous-jacent au prix d'exercice (strike) jusqu'à l'échéance. On achète un put quand on anticipe une baisse du sous-jacent ou pour se protéger.",
          details: "Le put a une valeur si le prix spot passe sous le strike. C'est une assurance contre la baisse : si vous détenez des actions Apple à 150$ et achetez un put strike 140$, vous êtes protégé contre une baisse en dessous de 140$. Les puts sont essentiels pour les stratégies de hedging.",
          formula: "Payoff Put = Max(0, K - Sᴛ)"
        },
        { 
          term: "Barrière", 
          definition: "Une barrière est un niveau de prix prédéfini du sous-jacent qui, s'il est atteint ou franchi pendant la vie du produit, déclenche ou annule certains paiements ou modifie les caractéristiques du produit structuré.",
          details: "Les options à barrière sont moins chères que les options vanilles car elles comportent une condition supplémentaire. Types courants : knock-in (s'active si la barrière est touchée), knock-out (s'annule si touchée), down-and-in (barrière en dessous du spot), up-and-out (barrière au-dessus). Très utilisées dans les produits structurés pour réduire les coûts."
        },
        { 
          term: "Option Digitale (Binary)", 
          definition: "Une option digitale verse un montant fixe prédéterminé si une condition est remplie à l'échéance, sinon elle ne verse rien. C'est un pari binaire tout-ou-rien sur la direction du marché.",
          details: "Exemple : option digitale 'Apple > 150 qui paie 100$ si vrai, 0$ sinon. Les digitales ont un payoff discontinu, ce qui crée un gamma très élevé près de la barrière. Elles sont utilisées dans les produits structurés pour créer des profils de paiement sur mesure.",
          formula: "Payoff = N × 𝟙(Sᴛ > K) où N = montant fixe, 𝟙 = fonction indicatrice"
        }
      ]
    },
    {
      section: "Volatilité & risque",
      objective: "Comprendre l'incertitude et son impact sur les prix",
      intro: "La volatilité mesure l'ampleur des variations de prix et joue un rôle clé dans la valorisation des options.",
      terms: [
        { 
          term: "Volatilité (σ)", 
          definition: "La volatilité mesure l'amplitude des fluctuations du prix d'un actif sur une période donnée. Elle quantifie le risque : plus la volatilité est élevée, plus les mouvements de prix sont imprévisibles et importants.",
          details: "La volatilité s'exprime en pourcentage annualisé. Une volatilité de 25% pour Apple signifie qu'on s'attend à ce que le prix varie d'environ ±25% sur un an (avec 68% de probabilité dans une distribution normale). C'est le paramètre le plus important pour pricer les options.",
          formula: "σ = √(Σ(rᵢ - r̄)² / (n-1)) × √252 où rᵢ = rendement journalier"
        },
        { 
          term: "Volatilité Historique", 
          definition: "La volatilité historique est calculée à partir des variations de prix passées observées sur une période donnée (généralement 30, 60, ou 90 jours). Elle mesure ce qui s'est réellement passé.",
          details: "Méthode de calcul : on prend l'écart-type des rendements journaliers et on l'annualise en multipliant par √252 (nombre de jours de trading par an). La volatilité historique sert de référence mais ne prédit pas nécessairement la volatilité future."
        },
        { 
          term: "Volatilité Implicite", 
          definition: "La volatilité implicite est la volatilité anticipée par le marché, extraite des prix actuels des options en inversant le modèle de Black-Scholes. Elle reflète les attentes futures des investisseurs.",
          details: "Si la volatilité implicite est à 30% mais la volatilité historique à 20%, le marché anticipe plus d'incertitude à venir. Le VIX (indice de volatilité du S&P 500) mesure la volatilité implicite et est surnommé 'l'indice de la peur'. Une volatilité implicite élevée rend les options plus chères."
        }
      ]
    },
    {
      section: "Sensibilités & gestion du risque (Greeks)",
      objective: "Comprendre comment un produit réagit aux marchés",
      intro: "Les Greeks mesurent la sensibilité du prix d'un produit dérivé aux variations des paramètres de marché.",
      terms: [
        { 
          term: "Greeks (Grecs)", 
          definition: "Les Greeks sont des indicateurs quantifiant la sensibilité du prix d'une option ou d'un produit structuré aux changements des paramètres de marché. Ils permettent de gérer et couvrir les risques.",
          details: "Les principaux Greeks sont : Delta (sensibilité au spot), Gamma (sensibilité du delta), Vega (sensibilité à la volatilité), Theta (érosion temporelle), Rho (sensibilité aux taux). Les traders professionnels surveillent constamment leurs Greeks pour neutraliser les risques indésirables via le delta-hedging."
        },
        { 
          term: "Delta (Δ)", 
          definition: "Le delta mesure la variation du prix de l'option pour une variation unitaire du prix du sous-jacent. C'est la dérivée première du prix de l'option par rapport au spot.",
          details: "Un delta de 0.5 signifie que si l'action monte de 1$, l'option gagne 0.50$. Le delta d'un call varie de 0 (très OTM) à 1 (très ITM). Le delta d'un put varie de -1 à 0. Un portefeuille delta-neutre n'est pas affecté par de petits mouvements du sous-jacent.",
          formula: "Δ = ∂V/∂S où V = prix option, S = prix spot"
        },
        { 
          term: "Gamma (Γ)", 
          definition: "Le gamma mesure la variation du delta lorsque le prix du sous-jacent change. C'est la dérivée seconde du prix de l'option par rapport au spot, ou la convexité.",
          details: "Un gamma élevé signifie que le delta change rapidement. Les options ATM (at-the-money) ont le gamma le plus élevé. Le gamma est positif pour les acheteurs d'options et négatif pour les vendeurs. Gérer le gamma est crucial pour éviter des pertes importantes lors de mouvements brusques.",
          formula: "Γ = ∂²V/∂S² = ∂Δ/∂S"
        },
        { 
          term: "Vega (ν)", 
          definition: "Le vega mesure la sensibilité du prix de l'option à une variation de 1% de la volatilité implicite. C'est un paramètre clé pour mesurer le risque de volatilité.",
          details: "Un vega de 15 signifie que si la volatilité passe de 25% à 26%, l'option gagne 15$. Le vega est toujours positif pour les acheteurs d'options (la hausse de volatilité augmente la valeur). Les options à long terme et ATM ont le vega le plus élevé. Les traders 'vendeurs de volatilité' ont un vega négatif.",
          formula: "ν = ∂V/∂σ"
        },
        { 
          term: "Volga (Vomma)", 
          definition: "Le volga est la sensibilité du vega aux changements de volatilité, ou la convexité par rapport à la volatilité. C'est la dérivée seconde du prix par rapport à la volatilité.",
          details: "Le volga mesure comment le vega change quand la volatilité change. Important pour gérer le risque de volatilité de second ordre, particulièrement dans les produits exotiques et les stratégies de volatilité complexes.",
          formula: "Volga = ∂²V/∂σ² = ∂ν/∂σ"
        },
        { 
          term: "Theta (Θ)", 
          definition: "Le theta mesure l'érosion temporelle de la valeur de l'option : combien l'option perd de valeur chaque jour qui passe, toutes choses égales par ailleurs. Le temps est l'ennemi de l'acheteur d'options.",
          details: "Le theta est généralement négatif pour les acheteurs d'options (perte de valeur avec le temps) et positif pour les vendeurs. Plus on se rapproche de l'échéance, plus le theta s'accélère. Les options ATM ont le theta le plus élevé. Stratégie courante : vendre des options pour capturer le theta.",
          formula: "Θ = -∂V/∂t"
        },
        { 
          term: "Rho (ρ)", 
          definition: "Le rho mesure la sensibilité du prix de l'option à une variation de 1% du taux d'intérêt sans risque. C'est généralement le Greek le moins important en pratique.",
          details: "Un rho de 10 signifie que si les taux passent de 4% à 5%, l'option gagne 10$. Le rho est plus important pour les options à long terme. Les calls ont un rho positif (hausse des taux = hausse de valeur), les puts un rho négatif.",
          formula: "ρ = ∂V/∂r"
        }
      ]
    },
    {
      section: "Produits structurés",
      objective: "Comprendre ce qu'est un produit structuré",
      intro: "Les produits structurés combinent plusieurs instruments financiers pour offrir un profil rendement/risque spécifique.",
      terms: [
        { 
          term: "Produit Structuré", 
          definition: "Un produit structuré est un instrument financier combinant généralement une composante obligataire (pour la protection ou le rendement fixe) avec un ou plusieurs produits dérivés (options, barrières) afin de créer un profil rendement/risque sur mesure.",
          details: "Les produits structurés permettent d'accéder à des stratégies sophistiquées normalement réservées aux institutionnels. Ils peuvent offrir une protection du capital, des coupons élevés, une participation à la hausse, ou des effets de levier. Exemples : autocalls, reverse convertibles, capital protégés, warrants. Le marché mondial représente plusieurs trillions de dollars."
        }
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

  const selectedTutorial = tutorials.find(t => t.id === selectedProduct)

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

        {/* Onglets principaux */}
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
          <div>
            {/* Sélection du produit */}
            <div className="glass-card p-6 mb-8 border border-metron-purple/30">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                Choisissez un produit structuré
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {tutorials.map((tutorial) => (
                  <button
                    key={tutorial.id}
                    onClick={() => setSelectedProduct(tutorial.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedProduct === tutorial.id
                        ? 'border-metron-purple bg-metron-purple/20 shadow-neon-purple'
                        : 'border-white/10 hover:border-metron-purple/50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{tutorial.icon}</div>
                    <h3 className="font-bold text-white mb-1 text-sm">{tutorial.title}</h3>
                    <p className="text-xs text-gray-400">{tutorial.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Contenu du tutoriel sélectionné */}
            {selectedTutorial && (
              <div className="glass-card p-8 border border-metron-purple/20">
                {/* En-tête */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-5xl">{selectedTutorial.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-4xl font-bold text-white mb-2">
                      {selectedTutorial.title}
                    </h2>
                    <p className="text-gray-400 text-lg">{selectedTutorial.description}</p>
                  </div>
                </div>

                {/* Qu'est-ce que c'est ? */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-metron-purple mb-3">
                    🎯 Qu'est-ce que c'est ?
                  </h3>
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <ul className="space-y-2 text-gray-300">
                      {selectedTutorial.whatIs.map((item, i) => (
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
                    {selectedTutorial.howItWorks.map((step, i) => (
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
                    {selectedTutorial.simulationSteps.map((stepSection, idx) => (
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
                    💡 {selectedTutorial.example.scenario}
                  </h3>
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10 mb-4">
                    <p className="text-gray-300 mb-4">
                      <span className="font-semibold text-white">Configuration : </span>
                      {selectedTutorial.example.setup}
                    </p>
                    <div className="space-y-3">
                      {selectedTutorial.example.outcomes.map((outcome, i) => (
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
                      {selectedTutorial.advantages.map((item, i) => (
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
                      {selectedTutorial.risks.map((item, i) => (
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
                  onClick={() => handleGoToSimulation(selectedTutorial.productType)}
                  className="mt-4 btn-neon w-full text-lg py-4"
                >
                  🚀 Essayer dans la Simulation →
                </button>
              </div>
            )}
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

                  <div className="grid md:grid-cols-1 gap-6">
                    {section.terms.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-metron-purple/50 transition-all"
                      >
                        <h3 className="text-2xl font-bold text-metron-purple mb-3">
                          {item.term}
                        </h3>
                        <p className="text-gray-300 mb-3 leading-relaxed">{item.definition}</p>
                        
                        {item.details && (
                          <div className="bg-white/5 p-4 rounded-lg border border-white/5 mb-3">
                            <p className="text-gray-400 text-sm leading-relaxed">{item.details}</p>
                          </div>
                        )}
                        
                        {item.formula && (
                          <div className="bg-metron-purple/10 p-4 rounded-lg border border-metron-purple/30">
                            <p className="font-mono text-metron-purple text-sm">{item.formula}</p>
                          </div>
                        )}
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