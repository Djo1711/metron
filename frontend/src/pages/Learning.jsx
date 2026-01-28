import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveQuizScore } from '../services/api'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export default function Learning() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  
  // Récupérer l'utilisateur Supabase
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])
  
  // ⭐ Modules lus (persistants)
  const [completedModules, setCompletedModules] = useState(() => {
    const saved = localStorage.getItem('completedModules')
    return saved ? JSON.parse(saved) : {}
  })

  useEffect(() => {
    localStorage.setItem(
      'completedModules',
      JSON.stringify(completedModules)
    )
  }, [completedModules])

  const toggleModuleCompletion = (level, moduleIdx) => {
    setCompletedModules(prev => {
      const current = prev[level] || []
      return {
        ...prev,
        [level]: current.includes(moduleIdx)
          ? current.filter(i => i !== moduleIdx)
          : [...current, moduleIdx]
      }
    })
  }

 const isModuleCompleted = (level, moduleIdx) =>
    completedModules[level]?.includes(moduleIdx)

  // 🔵 TOUS LES USESTATE (bien structurés)
  const [activeTab, setActiveTab] = useState('cours')
  const [selectedProduct, setSelectedProduct] = useState('reverse_convertible')
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchRef = useRef(null)
  const [selectedLevel, setSelectedLevel] = useState('debutant')
  
  // États pour les QCM des modules
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState({})
  const [quizScores, setQuizScores] = useState({})
  const [openQuizzes, setOpenQuizzes] = useState({})
  const [openModules, setOpenModules] = useState({})
  
  // 🆕 États pour le quiz d'auto-évaluation
  const [showLevelQuiz, setShowLevelQuiz] = useState(false)
  const [quizStep, setQuizStep] = useState(0)
  const [levelQuizAnswers, setLevelQuizAnswers] = useState([])
  const [quizResult, setQuizResult] = useState(null)

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setShowSuggestions(false)
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  return () =>
    document.removeEventListener('mousedown', handleClickOutside)
}, [])

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)

    if (value.length >= 1) {
      setSearchLoading(true)

      const results = []

      glossary.forEach(section => {
        section.terms.forEach(term => {
          if (
            term.term.toLowerCase().includes(value.toLowerCase()) ||
            term.definition.toLowerCase().includes(value.toLowerCase())
          ) {
            results.push({
              term: term.term,
              section: section.section,
              definition: term.definition
            })
          }
        })
      })

      setSuggestions(results.slice(0, 8))
      setShowSuggestions(true)
      setSearchLoading(false)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }


  const handleSelectSuggestion = (suggestion) => {
    setSearchTerm(suggestion.term)
    setShowSuggestions(false)
  }
  // Fonction pour ouvrir/fermer un quiz
  const toggleQuiz = (level, moduleIdx) => {
    const key = `${level}-${moduleIdx}`;
    setOpenQuizzes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Fonction pour ouvrir/fermer un module
  const toggleModule = (level, moduleIdx) => {
    const key = `${level}-${moduleIdx}`;
    setOpenModules(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Vérifier si un module est complètement réussi (quiz validé)
  const isModuleFullyCompleted = (level, moduleIdx) => {
    const key = `${level}-${moduleIdx}`;
    const score = quizScores[key];
    return score && score.score >= 13; // 13/16 ou plus pour valider
  };
// 🆕 Quiz d'auto-évaluation basé sur l'expérience personnelle
const levelQuiz = [
  {
    question: "Avez-vous déjà investi dans des produits financiers (actions, obligations, fonds) ?",
    options: [
      "Oui, régulièrement depuis plusieurs années",
      "Oui, j'ai déjà fait quelques investissements",
      "Non, mais je connais les concepts de base",
      "Non, je débute complètement"
    ],
    correct: null, // Pas de "bonne" réponse, c'est subjectif
    points: { 0: 3, 1: 2, 2: 1, 3: 0 }
  },
  {
    question: "Quelle est votre compréhension des options financières (call, put) ?",
    options: [
      "Je comprends le pricing et les Greeks (delta, gamma, vega...)",
      "Je sais ce qu'est un call et un put, et comment ça fonctionne",
      "J'ai entendu parler mais je ne sais pas vraiment comment ça marche",
      "Je ne sais pas ce que c'est"
    ],
    correct: null,
    points: { 0: 3, 1: 2, 2: 1, 3: 0 }
  },
  {
    question: "Connaissez-vous la différence entre un produit à capital garanti et un Reverse Convertible ?",
    options: [
      "Oui, je comprends les mécanismes et les risques de chacun",
      "J'ai une idée générale mais pas tous les détails",
      "J'ai entendu ces termes mais je ne connais pas la différence",
      "Non, je ne connais ni l'un ni l'autre"
    ],
    correct: null,
    points: { 0: 3, 1: 2, 2: 1, 3: 0 }
  },
  {
    question: "Que représente la volatilité pour vous ?",
    options: [
      "Je sais calculer la volatilité historique et implicite, et l'utiliser dans le pricing",
      "Je sais que c'est une mesure du risque et des fluctuations de prix",
      "J'ai entendu le terme mais je ne sais pas vraiment ce que c'est",
      "Je ne sais pas"
    ],
    correct: null,
    points: { 0: 3, 1: 2, 2: 1, 3: 0 }
  },
  {
    question: "Quel est votre niveau en mathématiques financières ?",
    options: [
      "À l'aise avec Black-Scholes, actualisation, probabilités, intégrales",
      "Je comprends les formules de base (actualisation, rendement, taux)",
      "J'ai des bases en maths mais pas en finance",
      "Les mathématiques ne sont pas mon fort"
    ],
    correct: null,
    points: { 0: 3, 1: 2, 2: 1, 3: 0 }
  }
]

// 🆕 Gestion du quiz d'auto-évaluation
const handleLevelQuizAnswer = (answerIndex) => {
  const newAnswers = [...levelQuizAnswers, answerIndex]
  setLevelQuizAnswers(newAnswers)
  
  if (quizStep < levelQuiz.length - 1) {
    setQuizStep(quizStep + 1)
  } else {
    calculateQuizResult(newAnswers)
  }
}

const calculateQuizResult = (answers) => {
  let totalScore = 0
  
  answers.forEach((answer, index) => {
    totalScore += levelQuiz[index].points[answer]
  })
  
  let recommendedLevel = 'debutant'
  let message = ''
  
  if (totalScore >= 12) {
    recommendedLevel = 'avance'
    message = "Excellent ! Vous avez de solides connaissances en produits structurés. Commencez par le niveau avancé pour approfondir."
  } else if (totalScore >= 7) {
    recommendedLevel = 'intermediaire'
    message = "Bien ! Vous avez des bases solides. Le niveau intermédiaire est parfait pour vous."
  } else {
    recommendedLevel = 'debutant'
    message = "Pas de soucis ! Commençons par les bases. Le niveau débutant vous aidera à construire des fondations solides."
  }
  
  setQuizResult({ score: totalScore, level: recommendedLevel, message })
}

const resetLevelQuiz = () => {
  setShowLevelQuiz(false)
  setQuizStep(0)
  setLevelQuizAnswers([])
  setQuizResult(null)
}

const startAtRecommendedLevel = () => {
  if (quizResult) {
    setSelectedLevel(quizResult.level)
    resetLevelQuiz()
    window.scrollTo({ top: 600, behavior: 'smooth' })
  }
}

  const cours = {
    debutant: {
      title: "Niveau Débutant",
      subtitle: "Introduction à la finance et aux marchés",
      icon: "🌱",
      modules: [
        {
          titre: "Module 1 : Qu'est-ce que la finance ?",
          contenu: [
            {
              section: "La finance, c'est quoi ?",
              texte: "La finance est l'ensemble des activités et mécanismes qui permettent de gérer l'argent dans le temps. Elle répond à trois questions fondamentales : Comment investir ? Comment financer ? Comment gérer les risques ?",
              points: [
                "**Investir** : Placer son argent pour le faire fructifier (actions, obligations, immobilier)",
                "**Financer** : Obtenir de l'argent pour réaliser un projet (emprunt, levée de fonds)",
                "**Gérer les risques** : Se protéger contre les pertes potentielles (assurance, diversification)"
              ]
            },
            {
              section: "Les trois piliers de la finance",
              texte: "La finance moderne repose sur trois piliers fondamentaux qui structurent toutes les décisions financières.",
              details: [
                {
                  type: "1. L'investissement",
                  definition: "Processus d'allocation de capital dans des actifs pour générer des rendements futurs",
                  utilisation: "Choisir où placer son argent pour le faire croître",
                  exemple: "Acheter des actions Tesla en espérant que leur valeur augmente dans 5 ans"
                },
                {
                  type: "2. Le financement",
                  definition: "Obtention de ressources financières pour réaliser des projets",
                  utilisation: "Lever des fonds via emprunt bancaire, émission d'actions ou d'obligations",
                  exemple: "Une startup lève 1M€ auprès d'investisseurs pour développer son application"
                },
                {
                  type: "3. La gestion des risques",
                  definition: "Identification, évaluation et atténuation des risques financiers",
                  utilisation: "Se protéger contre les pertes via diversification, assurance, hedging",
                  exemple: "Un agriculteur utilise des contrats à terme pour se protéger contre la baisse des prix du blé"
                }
              ]
            },
            {
              section: "Pourquoi la finance existe-t-elle ?",
              texte: "La finance permet de transférer de l'argent de ceux qui en ont (épargnants) vers ceux qui en ont besoin (entreprises, États). Ce transfert se fait via les marchés financiers.",
              exemple: "Vous déposez 10 000€ à la banque → La banque prête cet argent à une entreprise pour construire une usine → L'entreprise rembourse avec intérêt → Vous récupérez 10 500€. Tout le monde y gagne !"
            },
            {
              section: "Le rôle de la finance dans l'économie",
              texte: "La finance joue un rôle crucial dans le développement économique en permettant l'allocation efficace des ressources.",
              points: [
                "**Facilite l'innovation** : Les entreprises tech peuvent lever des milliards pour développer de nouvelles technologies",
                "**Crée de l'emploi** : Les investissements permettent aux entreprises de recruter et de se développer",
                "**Améliore le niveau de vie** : L'épargne investie génère des rendements qui augmentent la richesse",
                "**Finance les infrastructures** : Les États empruntent pour construire routes, hôpitaux, écoles"
              ]
            },
            {
              section: "Les acteurs de la finance",
              texte: "Plusieurs acteurs interagissent sur les marchés financiers, chacun avec un rôle spécifique.",
              details: [
                {
                  type: "Investisseurs particuliers",
                  definition: "Individus qui investissent leur épargne personnelle",
                  utilisation: "Via courtiers en ligne, PEA, assurance-vie",
                  exemple: "Marie investit 500€/mois dans un ETF S&P 500 pour préparer sa retraite"
                },
                {
                  type: "Investisseurs institutionnels",
                  definition: "Entités gérant de très gros volumes (banques, assurances, fonds de pension)",
                  utilisation: "Gestion de milliards d'euros pour le compte de millions de clients",
                  exemple: "BlackRock gère plus de 10 000 milliards de dollars d'actifs"
                },
                {
                  type: "Entreprises",
                  definition: "Sociétés cherchant à financer leur croissance",
                  utilisation: "Émission d'actions (IPO) ou d'obligations corporate",
                  exemple: "Apple émet des obligations pour 5 milliards pour financer son rachat d'actions"
                },
                {
                  type: "États et institutions publiques",
                  definition: "Gouvernements empruntant pour financer les dépenses publiques",
                  utilisation: "Émission d'obligations souveraines (OAT, Treasury bonds)",
                  exemple: "La France émet des OAT 10 ans à 3% pour financer le budget de l'État"
                },
                {
                  type: "Intermédiaires financiers",
                  definition: "Banques, courtiers, plateformes facilitant les transactions",
                  utilisation: "Mise en relation acheteurs/vendeurs, conseil, exécution d'ordres",
                  exemple: "Interactive Brokers permet d'acheter des actions Apple en quelques clics"
                }
              ]
            },
            {
              section: "La valeur temps de l'argent",
              texte: "Concept fondamental : 100€ aujourd'hui valent PLUS que 100€ dans un an. Pourquoi ? Car vous pouvez investir ces 100€ aujourd'hui et obtenir 105€ dans un an.",
              exemple: "Préférez-vous recevoir 1000€ aujourd'hui ou 1000€ dans 5 ans ? Évidemment aujourd'hui ! Si vous investissez 1000€ à 5% par an, vous aurez 1276€ dans 5 ans.",
              formule: "Valeur Future = Valeur Présente × (1 + taux)^années"
            },
            {
              section: "Finance personnelle vs Finance d'entreprise",
              texte: "Bien que les principes soient similaires, les échelles et objectifs diffèrent.",
              comparaison: {
                actions: {
                  avantages: ["Gestion de patrimoine personnel", "Épargne pour retraite, projets", "Décisions individuelles"],
                  inconvenients: ["Montants limités (milliers/millions)", "Moins de sophistication", "Fiscalité personnelle"],
                  profil: "Investisseur particulier : PEA, assurance-vie, immobilier"
                },
                obligations: {
                  avantages: ["Gestion de trésorerie d'entreprise", "Financement de croissance", "Conseil d'administration"],
                  inconvenients: ["Montants élevés (millions/milliards)", "Instruments complexes", "Optimisation fiscale corporate"],
                  profil: "CFO d'entreprise : émissions obligataires, M&A, hedging"
                }
              }
            }
          ],
          quiz: [
            {
              question: "Quelle est la principale fonction de la finance ?",
              options: [
                "Gérer l'argent dans le temps",
                "Créer de la monnaie",
                "Contrôler les prix",
                "Éviter les impôts"
              ],
              correct: 0,
              explication: "La finance permet de gérer l'argent dans le temps en investissant, finançant et gérant les risques."
            },
            {
              question: "Qu'est-ce qu'un investisseur institutionnel ?",
              options: [
                "Une personne qui investit son épargne personnelle",
                "Une banque, assurance ou fonds qui gère des milliards",
                "Un trader indépendant",
                "Un conseiller financier"
              ],
              correct: 1,
              explication: "Les investisseurs institutionnels sont des entités comme les banques et assurances qui gèrent de très gros capitaux."
            },
            {
              question: "Pourquoi la finance existe-t-elle ?",
              options: [
                "Pour enrichir les banques",
                "Pour transférer l'argent des épargnants vers ceux qui en ont besoin",
                "Pour compliquer les transactions",
                "Pour créer des emplois"
              ],
              correct: 1,
              explication: "La finance permet de faire circuler l'argent entre ceux qui épargnent et ceux qui ont besoin de financement."
            },
            {
              question: "Parmi ces activités, laquelle N'est PAS une fonction principale de la finance ?",
              options: [
                "Investir",
                "Financer",
                "Produire des biens",
                "Gérer les risques"
              ],
              correct: 2,
              explication: "La production de biens relève de l'activité opérationnelle de l'entreprise, pas de la finance. Les trois fonctions financières sont investir, financer et gérer les risques."
            },
            {
              question: "Qu'est-ce que la 'valeur temps de l'argent' ?",
              options: [
                "Le temps nécessaire pour gagner de l'argent",
                "100€ aujourd'hui valent plus que 100€ demain",
                "L'argent perd de la valeur avec le temps à cause de l'inflation uniquement",
                "Le coût horaire du travail"
              ],
              correct: 1,
              explication: "La valeur temps de l'argent signifie qu'un euro aujourd'hui vaut plus qu'un euro futur car vous pouvez l'investir et obtenir un rendement."
            },
            {
              question: "Quel est le rôle principal d'une banque dans le système financier ?",
              options: [
                "Créer de l'argent à partir de rien",
                "Servir d'intermédiaire entre épargnants et emprunteurs",
                "Garantir que les investissements ne perdent jamais de valeur",
                "Fixer les prix des actions"
              ],
              correct: 1,
              explication: "Les banques collectent l'épargne et la prêtent à ceux qui en ont besoin, jouant un rôle d'intermédiaire crucial dans l'économie."
            },
            {
              question: "Si vous investissez 1000€ à 5% par an, combien aurez-vous après 1 an ?",
              options: [
                "1000€",
                "1050€",
                "1500€",
                "950€"
              ],
              correct: 1,
              explication: "1000€ × (1 + 0.05) = 1050€. Vous gagnez 5% de 1000€ = 50€ d'intérêts."
            },
            {
              question: "Quelle est la différence entre finance personnelle et finance d'entreprise ?",
              options: [
                "Il n'y a aucune différence",
                "La finance d'entreprise concerne uniquement les grandes sociétés cotées",
                "Les montants, objectifs et instruments diffèrent mais les principes sont similaires",
                "La finance personnelle ne concerne pas l'investissement"
              ],
              correct: 2,
              explication: "Les principes fondamentaux sont les mêmes (investir, financer, gérer les risques) mais les échelles, objectifs et instruments utilisés diffèrent."
            },
            {
              question: "Comment un État finance-t-il ses dépenses publiques ?",
              options: [
                "Uniquement par les impôts",
                "En imprimant de l'argent sans limite",
                "Par les impôts et l'émission d'obligations souveraines",
                "En empruntant uniquement aux banques"
              ],
              correct: 2,
              explication: "Les États financent leurs dépenses via les impôts et en empruntant sur les marchés en émettant des obligations (OAT en France, Treasury bonds aux USA)."
            },
            {
              question: "Qu'est-ce qu'une IPO (Introduction en Bourse) ?",
              options: [
                "Un nouveau type d'obligation",
                "Quand une entreprise vend ses actions au public pour la première fois",
                "Un indice boursier",
                "Un produit d'épargne garanti"
              ],
              correct: 1,
              explication: "IPO (Initial Public Offering) est le processus par lequel une entreprise privée devient publique en vendant ses actions au grand public."
            },
            {
              question: "Pourquoi un agriculteur utiliserait-il des contrats à terme ?",
              options: [
                "Pour spéculer sur le prix du blé",
                "Pour se protéger contre la baisse des prix de ses récoltes",
                "Pour obtenir un prêt bancaire",
                "Pour payer moins d'impôts"
              ],
              correct: 1,
              explication: "Les contrats à terme permettent de fixer un prix de vente à l'avance, protégeant l'agriculteur contre une chute des prix."
            },
            {
              question: "Quel est l'objectif principal d'un fonds de pension ?",
              options: [
                "Maximiser les profits à court terme",
                "Gérer l'épargne retraite pour verser des pensions futures",
                "Spéculer sur les crypto-monnaies",
                "Prêter de l'argent aux particuliers"
              ],
              correct: 1,
              explication: "Les fonds de pension collectent et investissent l'épargne retraite pour garantir le paiement des pensions aux retraités."
            },
            {
              question: "Qu'est-ce que la diversification ?",
              options: [
                "Investir tout son argent dans une seule action",
                "Répartir ses investissements sur différents actifs pour réduire le risque",
                "Acheter uniquement des obligations d'État",
                "Garder son argent en cash"
              ],
              correct: 1,
              explication: "La diversification consiste à ne pas mettre tous ses œufs dans le même panier, réduisant ainsi le risque global du portefeuille."
            },
            {
              question: "Si une startup lève 1 million d'euros auprès d'investisseurs, quelle fonction de la finance utilise-t-elle ?",
              options: [
                "Investissement",
                "Financement",
                "Gestion des risques",
                "Spéculation"
              ],
              correct: 1,
              explication: "La levée de fonds correspond à la fonction de financement : obtenir des ressources pour réaliser un projet."
            },
            {
              question: "Qu'est-ce qu'un PEA (Plan d'Épargne en Actions) ?",
              options: [
                "Un type d'obligation d'État",
                "Un compte d'investissement en actions avec avantages fiscaux en France",
                "Une assurance-vie",
                "Un prêt immobilier"
              ],
              correct: 1,
              explication: "Le PEA est une enveloppe fiscale permettant d'investir en actions européennes avec une fiscalité avantageuse après 5 ans."
            },
            {
              question: "Quel montant total aurez-vous si vous investissez 1000€ à 10% par an pendant 2 ans (intérêts composés) ?",
              options: [
                "1200€",
                "1210€",
                "1100€",
                "1000€"
              ],
              correct: 1,
              explication: "Année 1: 1000 × 1.10 = 1100€. Année 2: 1100 × 1.10 = 1210€. Les intérêts de la première année génèrent eux-mêmes des intérêts."
            }
          ]
        },
        {
          titre: "Module 2 : Les marchés financiers",
          contenu: [
            {
              section: "Qu'est-ce qu'un marché financier ?",
              texte: "Un marché financier est un lieu (physique ou virtuel) où s'échangent des actifs financiers. C'est comme un grand supermarché, mais au lieu d'acheter des tomates, vous achetez des actions, des obligations, des devises...",
              points: [
                "**Marché actions** : Achat/vente de parts d'entreprises (ex: Apple, Microsoft)",
                "**Marché obligataire** : Achat/vente de dettes (obligations d'État ou d'entreprises)",
                "**Marché des changes (Forex)** : Échange de devises (EUR/USD, etc.)",
                "**Marché des matières premières** : Or, pétrole, blé..."
              ]
            },
            {
              section: "Les différents types de marchés",
              texte: "Les marchés financiers se divisent en plusieurs catégories selon le type d'actif échangé.",
              details: [
                {
                  type: "Marché actions (Equity)",
                  definition: "Échange de parts de propriété d'entreprises",
                  utilisation: "Bourses comme NYSE, NASDAQ, Euronext",
                  exemple: "Vous achetez 10 actions Apple sur le NASDAQ à 150$ l'action = 1500$ investi"
                },
                {
                  type: "Marché obligataire (Fixed Income)",
                  definition: "Échange de titres de dette émis par États et entreprises",
                  utilisation: "Marché de gré à gré (OTC) principalement",
                  exemple: "La France émet une obligation à 10 ans qui paie 3% par an"
                },
                {
                  type: "Marché des changes (Forex)",
                  definition: "Échange de devises entre pays",
                  utilisation: "Trading 24h/24, le plus grand marché au monde (6000 Mds$/jour)",
                  exemple: "Vous échangez 1000€ contre 1080$ au taux EUR/USD = 1.08"
                },
                {
                  type: "Marché des matières premières (Commodities)",
                  definition: "Échange de ressources physiques (or, pétrole, blé)",
                  utilisation: "Contrats à terme, marchés spécialisés (CME, LME)",
                  exemple: "Acheter un contrat à terme sur le pétrole pour livraison dans 3 mois"
                },
                {
                  type: "Marché des dérivés",
                  definition: "Instruments dont la valeur dépend d'un sous-jacent",
                  utilisation: "Options, futures, swaps pour hedging ou spéculation",
                  exemple: "Acheter une option call sur Tesla pour parier sur la hausse"
                }
              ]
            },
            {
              section: "Comment fonctionne la Bourse ?",
              texte: "La Bourse est le marché des actions. Quand une entreprise veut lever des fonds, elle vend des actions au public (Introduction en Bourse ou IPO). Ces actions s'échangent ensuite librement.",
              exemple: "Apple a un prix de 150$ par action aujourd'hui. Si vous pensez qu'Apple va bien se porter, vous achetez à 150$. Si le prix monte à 180$, vous gagnez 30$ par action (20% de plus-value) !"
            },
            {
              section: "Le mécanisme de formation des prix",
              texte: "Les prix sur les marchés sont déterminés par la rencontre entre l'offre (vendeurs) et la demande (acheteurs).",
              points: [
                "**Carnet d'ordres** : Liste de tous les ordres d'achat et de vente en attente",
                "**Bid (Demande)** : Prix auquel quelqu'un est prêt à acheter",
                "**Ask (Offre)** : Prix auquel quelqu'un est prêt à vendre",
                "**Spread** : Différence entre bid et ask (coût de transaction)",
                "**Last (Dernier)** : Prix de la dernière transaction exécutée"
              ],
              exemple: "Apple - Bid: 149.95$ (acheteurs), Ask: 150.05$ (vendeurs), Spread: 0.10$. Si vous achetez, vous payez 150.05$."
            },
            {
              section: "Offre et Demande",
              texte: "Le prix d'une action est déterminé par l'offre et la demande. Si beaucoup de gens veulent acheter Apple (forte demande), le prix monte. Si beaucoup veulent vendre (forte offre), le prix baisse.",
              points: [
                "**Prix monte** → Plus d'acheteurs que de vendeurs",
                "**Prix baisse** → Plus de vendeurs que d'acheteurs",
                "**Prix stable** → Équilibre entre offre et demande"
              ]
            },
            {
              section: "Les indices boursiers",
              texte: "Un indice boursier mesure la performance d'un panier d'actions représentatif d'un marché ou d'un secteur.",
              details: [
                {
                  type: "S&P 500",
                  definition: "Les 500 plus grandes entreprises américaines",
                  utilisation: "Référence du marché américain",
                  exemple: "Apple, Microsoft, Amazon, Tesla... représentent environ 30% de l'indice"
                },
                {
                  type: "CAC 40",
                  definition: "Les 40 plus grandes entreprises françaises",
                  utilisation: "Baromètre de l'économie française",
                  exemple: "LVMH, Total, Sanofi, BNP Paribas..."
                },
                {
                  type: "NASDAQ",
                  definition: "Indice technologique américain",
                  utilisation: "Performance du secteur tech",
                  exemple: "Apple, Google, Meta, Tesla, Nvidia..."
                },
                {
                  type: "MSCI World",
                  definition: "1600 entreprises de 23 pays développés",
                  utilisation: "Exposition diversifiée mondiale",
                  exemple: "Permet d'investir dans le monde entier en un seul ETF"
                }
              ]
            },
            {
              section: "Marché primaire vs marché secondaire",
              texte: "Distinction fondamentale entre création de nouveaux titres et échange de titres existants.",
              comparaison: {
                actions: {
                  avantages: ["Émission de nouveaux titres", "L'argent va à l'entreprise/État", "IPO, nouvelles émissions d'obligations"],
                  inconvenients: ["Moins liquide", "Réservé aux institutionnels souvent", "Commissions élevées"],
                  profil: "Exemple : Apple émet 1 milliard de nouvelles actions et reçoit les fonds"
                },
                obligations: {
                  avantages: ["Échange de titres existants entre investisseurs", "L'argent circule entre investisseurs", "Bourse, trading quotidien"],
                  inconvenients: ["Très liquide", "Accessible à tous", "Spreads faibles"],
                  profil: "Exemple : Vous achetez des actions Apple à un autre investisseur sur le NASDAQ"
                }
              }
            },
            {
              section: "La liquidité des marchés",
              texte: "La liquidité mesure la facilité avec laquelle on peut acheter ou vendre un actif sans impacter son prix.",
              points: [
                "**Marché liquide** : Beaucoup d'acheteurs et vendeurs, spread faible (ex: Apple, Microsoft)",
                "**Marché illiquide** : Peu de transactions, spread large (ex: petites capitalisations, marchés exotiques)",
                "**Impact sur le prix** : Sur un marché liquide, acheter 1000 actions ne fait pas bouger le prix",
                "**Coût de transaction** : Plus le marché est liquide, moins les coûts sont élevés"
              ],
              exemple: "Apple trade 50 millions d'actions par jour (très liquide). Une petite biotech peut n'en trader que 10 000 (illiquide)."
            },
            {
              section: "Les horaires de marché",
              texte: "Chaque bourse a des horaires d'ouverture spécifiques. Certains marchés comme le Forex sont ouverts 24h/24.",
              points: [
                "**NYSE/NASDAQ** : 9h30-16h00 EST (15h30-22h00 Paris)",
                "**Euronext Paris** : 9h00-17h30 CET",
                "**Tokyo Stock Exchange** : 9h00-15h00 JST",
                "**Forex** : 24h/24 du dimanche soir au vendredi soir"
              ]
            },
            {
              section: "Les bulles spéculatives et krachs",
              texte: "L'histoire des marchés est marquée par des bulles (hausses irrationnelles) suivies de krachs (effondrements brutaux).",
              exemple: "Bulle Internet 2000 : Le NASDAQ atteint 5000 points puis s'effondre à 1100 (-78%). Krach 2008 : Crise des subprimes, le S&P 500 perd 57%."
            }
          ],
          quiz: [
            {
              question: "Qu'est-ce qu'un marché financier ?",
              options: [
                "Un supermarché qui vend des produits financiers",
                "Un lieu où s'échangent des actifs financiers",
                "Une banque centrale",
                "Un magasin de devises"
              ],
              correct: 1,
              explication: "Un marché financier est un lieu (physique ou virtuel) où acheteurs et vendeurs échangent des actifs financiers comme des actions ou obligations."
            },
            {
              question: "Quelle est la différence entre le marché primaire et le marché secondaire ?",
              options: [
                "Il n'y a aucune différence",
                "Le primaire est pour les nouveaux titres, le secondaire pour l'échange entre investisseurs",
                "Le primaire est plus important que le secondaire",
                "Le secondaire n'existe plus aujourd'hui"
              ],
              correct: 1,
              explication: "Sur le marché primaire, l'entreprise émet de nouveaux titres et reçoit les fonds. Sur le marché secondaire, les investisseurs s'échangent des titres existants."
            },
            {
              question: "Qu'est-ce que le spread bid-ask ?",
              options: [
                "La différence entre le prix d'achat et le prix de vente",
                "Le rendement d'une obligation",
                "La commission du courtier",
                "La volatilité du marché"
              ],
              correct: 0,
              explication: "Le spread est la différence entre le meilleur prix d'achat (bid) et le meilleur prix de vente (ask). C'est un coût de transaction."
            },
            {
              question: "Quel est le plus grand marché financier au monde en termes de volume quotidien ?",
              options: [
                "Marché actions (NYSE)",
                "Marché obligataire",
                "Marché des changes (Forex)",
                "Marché des matières premières"
              ],
              correct: 2,
              explication: "Le Forex échange plus de 6 000 milliards de dollars par jour, bien plus que tous les autres marchés. Il est ouvert 24h/24."
            },
            {
              question: "Que représente le S&P 500 ?",
              options: [
                "Les 500 plus petites entreprises américaines",
                "Les 500 plus grandes entreprises américaines",
                "500 actions européennes",
                "Un indice de matières premières"
              ],
              correct: 1,
              explication: "Le S&P 500 est un indice regroupant les 500 plus grandes entreprises cotées aux États-Unis, représentant environ 80% de la capitalisation boursière américaine."
            },
            {
              question: "Sur quel marché s'échange principalement le pétrole ?",
              options: [
              "Marché actions",
              "Marché obligataire",
              "Marché des matières premières",
              "Marché des changes"
              ],
              correct: 2,
              explication: "Le pétrole est une matière première (commodity) qui s'échange sur des marchés spécialisés comme le CME ou l'ICE via des contrats à terme."
            },
            {
              question: "Qu'est-ce que la liquidité d'un marché ?",
              options: [
              "La quantité d'eau dans le marché",
              "La facilité d'acheter/vendre sans impacter le prix",
              "Le nombre d'entreprises cotées",
              "Les horaires d'ouverture"
              ],
              correct: 1,
              explication: "Un marché liquide permet d'acheter ou vendre rapidement de gros volumes sans faire bouger significativement les prix grâce à la présence de nombreux participants."
            },
            {
              question: "Qu'est-ce que le CAC 40 ?",
              options: [
              "Les 40 plus grandes entreprises françaises",
              "Un indice de 40 pays",
              "40 entreprises technologiques",
              "Les 40 meilleures actions mondiales"
              ],
              correct: 0,
              explication: "Le CAC 40 est l'indice boursier de référence de la bourse de Paris, composé des 40 plus grandes entreprises françaises cotées sur Euronext Paris."
            },
            {
              question: "Comment appelle-t-on un effondrement brutal des marchés ?",
              options: [
              "Une bulle",
              "Un krach",
              "Une récession",
              "Une inflation"
              ],
              correct: 1,
              explication: "Un krach boursier est une chute brutale et rapide des cours, comme en 1929, 2000 (bulle internet) ou 2008 (crise des subprimes)."
            },
            {
              question: "Le marché Forex est ouvert :",
              options: [
              "9h-17h uniquement",
              "24h/24 en semaine",
              "Seulement le week-end",
              "Uniquement pendant les heures de bureau"
              ],
              correct: 1,
              explication: "Le Forex fonctionne 24h/24 du dimanche soir au vendredi soir car les devises s'échangent successivement sur les places de Tokyo, Londres, New York."
            },
            {
              question: "Qu'est-ce qu'un ETF (Exchange Traded Fund) ?",
              options: [
              "Une action d'une entreprise technologique",
              "Un fonds indiciel coté en bourse qui réplique un indice",
              "Une obligation d'État",
              "Un type de crypto-monnaie"
              ],
              correct: 1,
              explication: "Un ETF est un panier d'actions qui réplique un indice (comme le S&P 500) et se trade comme une action. C'est une façon simple et peu coûteuse de se diversifier."
            },
            {
              question: "Qu'est-ce qui cause une bulle spéculative ?",
              options: [
              "Les taux d'intérêt élevés",
              "Une hausse irrationnelle des prix déconnectée de la réalité économique",
              "La diversification des actifs financiers dans un portefeuille",
              "Les dividendes élevés"
              ],
              correct: 1,
              explication: "Une bulle se forme quand les prix montent de façon excessive portés par l'euphorie et la spéculation, dépassant largement la valeur fondamentale des actifs."
            },
            {
              question: "Quel indice suivre pour investir dans la tech américaine ?",
              options: [
              "CAC 40",
              "FTSE 100",
              "NASDAQ",
              "DAX"
              ],
              correct: 2,
              explication: "Le NASDAQ Composite est l'indice de référence pour les valeurs technologiques américaines (Apple, Microsoft, Google, Meta, Tesla...)."
            },
            {
              question: "Combien vaut 1 point de S&P 500 si vous détenez un contrat future ?",
              options: [
              "1$",
              "10$",
              "50$",
              "100$"
              ],
              correct: 2,
              explication: "Un contrat future sur le S&P 500 vaut 50$ par point. Si l'indice monte de 10 points, le contrat gagne 500$."
            },
            {
              question: "Quelle est la capitalisation boursière approximative du marché actions mondial ?",
              options: [
              "10 milliards $",
              "100 milliards $",
              "10 000 milliards $",
              "100 000 milliards (100 trillions) $"
              ],
              correct: 3,
              explication: "La capitalisation boursière mondiale dépasse les 100 000 milliards de dollars (100 trillions), avec les USA représentant environ 40-45% du total."
            },
            {
              question: "Quel événement a causé le krach boursier de 2008 ?",
              options: [
              "La bulle internet",
              "La crise des subprimes (crédits immobiliers risqués)",
              "La guerre commerciale",
              "Le Brexit"
              ],
              correct: 1,
              explication: "La crise de 2008 a été déclenchée par l'effondrement du marché immobilier américain et la faillite de banques ayant prêté massivement à des emprunteurs peu solvables."
            }
          ]
        },
        {
          titre: "Module 3 : Les produits financiers de base",
          contenu: [
            {
              section: "Les Actions",
              texte: "Une action représente une part de propriété dans une entreprise. En achetant une action Apple, vous devenez copropriétaire d'Apple (même si c'est une toute petite part) !",
              points: [
                "Gain potentiel : Plus-value si le prix de l'action monte + dividendes (partage des bénéfices)",
                "Risque : Le prix peut baisser et vous pouvez perdre votre investissement",
                `Exemple :
              Vous achetez 10 actions Apple à 150$ = 1 500$.
              Apple monte à 180$ → vous avez 1 800$.
              Gain de 300$ (20%)`
              ]
            },
            {
              section: "Anatomie d'une action",
              texte: "Posséder une action vous confère plusieurs droits et opportunités de gains.",
              details: [
                {
                  type: "Droit de vote",
                  definition: "Chaque action donne généralement 1 voix aux assemblées générales",
                  utilisation: "Voter sur les décisions stratégiques, élection du conseil d'administration",
                  exemple: "Si vous détenez 100 actions Tesla, vous avez 100 voix pour voter les résolutions"
                },
                {
                  type: "Dividendes",
                  definition: "Part des bénéfices redistribuée aux actionnaires",
                  utilisation: "Revenu passif régulier (trimestriel ou annuel)",
                  exemple: "Apple verse 0.24$ par action par trimestre. Si vous avez 100 actions, vous recevez 96$/an"
                },
                {
                  type: "Plus-value (Capital Gain)",
                  definition: "Gain réalisé quand vous vendez l'action plus cher que vous l'avez achetée",
                  utilisation: "Stratégie de croissance à long terme",
                  exemple: "Achat à 100,vente à 150, vente à 150 → Plus-value de 50$ par action (+50%)"
                },
                {
                  type: "Droit préférentiel de souscription",
                  definition: "Priorité pour acheter de nouvelles actions lors d'augmentations de capital",
                  utilisation: "Maintenir votre pourcentage de propriété",
                  exemple: "L'entreprise émet 10% d'actions nouvelles, vous pouvez en acheter 10% pour ne pas être dilué"
                }
              ]
            },
            {
              section: "Les différents types d'actions",
              texte: "Toutes les actions ne se valent pas. Il existe différentes catégories selon la taille de l'entreprise et son stade de développement.",
              points: [
                `Large caps :
              Grandes entreprises (>10 Mds$)
              Apple, Microsoft, LVMH
              Moins risqué, croissance modérée`,
                "Mid caps : Entreprises moyennes (2–10 Mds$) – Équilibre risque/rendement",
                "Small caps : Petites entreprises (<2 Mds$) – Fort potentiel de croissance mais plus volatiles",
                "Growth stocks : Actions de croissance, peu/pas de dividendes, bénéfices réinvestis (Amazon, Tesla)",
                "Value stocks : Actions sous-évaluées, dividendes réguliers (banques, utilities)",
                "Blue chips : Grandes entreprises établies, valeurs sûres (Coca-Cola, Johnson & Johnson)"
              ]
            },
            {
              section: "Les Obligations",
              texte: "Une obligation, c'est comme un prêt que vous faites à un État ou une entreprise. En échange, ils vous paient des intérêts réguliers (coupons) et vous remboursent à la fin.",
              points: [
              "Plus sûr que les actions (surtout les obligations d'État)",
              "Rendement fixe : Vous savez combien vous allez gagner",
              "Exemple : Obligation à 10 000€, coupon 3%, durée 5 ans → Vous recevez 300€/an pendant 5 ans + 10 000€ à la fin"
              ]
            },
            {
              section: "Comprendre les obligations en détail",
              texte: "Les obligations sont des instruments de dette qui fonctionnent selon des mécanismes précis.",
              details: [
              {
              type: "Valeur nominale (Principal)",
              definition: "Montant que l'émetteur doit rembourser à l'échéance",
              utilisation: "Généralement 1000€ ou 1000$ par obligation",
              exemple: "Vous achetez une obligation nominale 1000€, vous recevrez 1000€ à maturité"
              },
              {
              type: "Coupon",
              definition: "Taux d'intérêt fixe payé annuellement",
              utilisation: "Revenu régulier pour l'investisseur",
              exemple: "Obligation 1000€ à coupon 5% → vous recevez 50€ par an"
              },
              {
              type: "Maturité",
              definition: "Date à laquelle l'obligation arrive à échéance et le principal est remboursé",
              utilisation: "Court terme (<3 ans), moyen terme (3-10 ans), long terme (>10 ans)",
              exemple: "Obligation à 10 ans émise en 2024 arrive à maturité en 2034"
              },
              {
              type: "Rendement (Yield)",
              definition: "Rendement effectif en tenant compte du prix d'achat",
              utilisation: "Indicateur clé pour comparer les obligations",
              exemple: "Si vous achetez une obligation 5% à 950€ (sous le pair), votre rendement réel est > 5%"
              }
              ]
            },
            {
              section: "Types d'obligations",
              texte: "Les obligations se différencient par leur émetteur, leur niveau de risque et leurs caractéristiques.",
              points: [
              "Obligations d'État (Sovereign Bonds) : Émises par les gouvernements - USA (Treasury), France (OAT), Allemagne (Bund) - Très sûres",
              "Obligations corporate (Corporate Bonds) : Émises par entreprises - Rendement plus élevé, risque de défaut plus élevé",
              "High Yield (Junk Bonds) : Obligations à haut rendement d'entreprises peu notées - 6-10%+ mais risque de défaut significatif",
              "Obligations convertibles : Peuvent être converties en actions - Hybride entre obligation et action",
              "Obligations indexées sur l'inflation : Coupon ajusté selon l'inflation - Protection contre la hausse des prix"
              ]
            },
            {
              section: "Rating et risque de crédit",
              texte: "Les agences de notation (S&P, Moody's, Fitch) évaluent la capacité de l'émetteur à rembourser sa dette.",
              points: [
              "AAA : Qualité maximale, risque minimal (Allemagne, USA)",
              "AA, A, BBB : Investment grade, qualité correcte",
              "BB, B, CCC : Speculative grade (junk), risque élevé",
              "D : Défaut de paiement",
              "Plus le rating est faible, plus le rendement exigé est élevé pour compenser le risque"
              ],
              exemple: "Une obligation AAA allemande paie 2.5%, une obligation BB d'une entreprise en difficulté paie 8%."
            },
            {
              section: "Prix des obligations et taux d'intérêt",
              texte: "Le prix des obligations bouge inversement aux taux d'intérêt. C'est crucial à comprendre !",
              exemple: "Vous achetez une obligation à 1000€ payant 3%. Si les taux montent à 5%, votre obligation devient moins attractive et son prix baisse à ~850€. Si les taux baissent à 2%, votre obligation vaut plus, environ 1100€.",
              formule: "Prix ↑ quand Taux ↓ | Prix ↓ quand Taux ↑"
            },
            {
              section: "Actions vs Obligations",
              texte: "Comment choisir entre actions et obligations ?",
              comparaison: {
              actions: {
              avantages: ["Potentiel de gain élevé", "Participation à la croissance des entreprises", "Dividendes possibles", "Liquidité élevée"],
              inconvenients: ["Risque élevé de perte", "Volatilité importante", "Pas de garantie de rendement", "Sensible aux cycles économiques"],
              profil: "Pour investisseurs prêts à prendre des risques avec horizon >5 ans"
              },
              obligations: {
              avantages: ["Revenus réguliers garantis", "Moins de risque", "Priorité en cas de faillite", "Prévisibilité"],
              inconvenients: ["Rendement limité", "Sensible aux taux d'intérêt", "Pas de participation aux bénéfices", "Risque de défaut"],
              profil: "Pour investisseurs prudents cherchant des revenus stables"
              }
              }
            },
            {
              section: "Les fonds d'investissement (OPCVM)",
              texte: "Un fonds permet d'investir dans un panier d'actions ou d'obligations géré par des professionnels.",
              points: [
              "Fonds mutuels : Gestion active, frais ~1-2%, objectif battre le marché",
              "ETF : Gestion passive, réplique un indice, frais <0.5%, très populaire",
              "Fonds obligataires : Panier d'obligations pour diversifier le risque",
              "Fonds équilibrés : Mix actions/obligations (ex: 60/40)"
              ],
              exemple: "ETF S&P 500 : Un seul achat vous donne accès aux 500 plus grandes entreprises US pour <10€."
            },
            {
              section: "Rendement total et effet des dividendes réinvestis",
              texte: "Le rendement total inclut plus-values ET dividendes. Réinvestir les dividendes crée un effet boule de neige.",
              exemple: "Investir 10 000€ dans le S&P 500 pendant 30 ans à 10% par an (dividendes réinvestis) donne environ 175 000€. Sans réinvestir les dividendes, seulement 120 000€."
            }
          ],
          quiz: [
            {
              question: "Que représente une action ?",
              options: [
                "Un prêt à une entreprise",
                "Une part de propriété dans une entreprise",
                "Une obligation d'État",
                "Un produit dérivé"
              ],
              correct: 1,
              explication: "Une action est une part du capital d'une entreprise. En détenir vous rend copropriétaire (actionnaire) de cette entreprise."
            },
            {
              question: "Qu'est-ce qu'un dividende ?",
              options: [
                "Le prix d'achat d'une action",
                "Une part des bénéfices distribuée aux actionnaires",
                "Le taux d'intérêt d'une obligation",
                "La commission du courtier"
              ],
              correct: 1,
              explication: "Le dividende est une partie des bénéfices de l'entreprise redistribuée aux actionnaires, généralement trimestriellement ou annuellement."
            },
            {
              question: "Si vous achetez 10 actions Apple à 150$ et les vendez à 180$, quel est votre gain ?",
              options: [
                "30$",
                "300$",
                "180$",
                "1500$"
              ],
              correct: 1,
              explication: "Gain par action = 180$ - 150$ = 30.Pour10actions:30. Pour 10 actions : 30. Pour10actions:30 × 10 = 300$ de plus-value."
            },
            {
              question: "Qu'est-ce qu'une obligation ?",
              options: [
                "Une action d'une entreprise",
                "Un prêt que vous faites à un État ou une entreprise",
                "Un compte d'épargne",
                "Une assurance"
              ],
              correct: 1,
              explication: "Une obligation est un titre de créance : vous prêtez de l'argent à l'émetteur (État ou entreprise) qui vous paie des intérêts et rembourse le capital à l'échéance."
            },
            {
              question: "Quel est le rendement annuel d'une obligation de 1000€ avec un coupon de 4% ?",
              options: [
                "4€",
                "40€",
                "400€",
                "1040€"
              ],
              correct: 1,
              explication: "Coupon 4% sur 1000€ = 0.04 × 1000€ = 40€ par an d'intérêts."
            },
            {
              question: "Quelle est la relation entre prix des obligations et taux d'intérêt ?",
              options: [
                "Ils évoluent dans le même sens",
                "Ils évoluent en sens inverse",
                "Ils ne sont pas liés",
                "Le prix des obligations ne change jamais"
              ],
              correct: 1,
              explication: "Quand les taux montent, les obligations existantes (à taux fixe plus bas) perdent de la valeur. Inversement, quand les taux baissent, elles prennent de la valeur."
            },
            {
              question: "Quelle catégorie d'actions est généralement la plus risquée mais avec le plus fort potentiel ?",
              options: [
                "Large caps",
                "Blue chips",
                "Small caps",
                "Obligations"
              ],
              correct: 2,
              explication: "Les small caps (petites capitalisations) sont plus volatiles mais offrent un potentiel de croissance plus élevé que les grandes entreprises établies."
            },
            {
              question: "Qu'est-ce qu'une action 'Growth' ?",
              options: [
                "Une action qui verse de gros dividendes",
                "Une action de croissance qui réinvestit ses bénéfices",
                "Une action bon marché",
                "Une obligation convertible"
              ],
              correct: 1,
              explication: "Les growth stocks privilégient la croissance en réinvestissant les bénéfices plutôt que de verser des dividendes (ex: Amazon, Tesla pendant longtemps)."
            },
            {
              question: "Que signifie le rating AAA pour une obligation ?",
              options: [
                "Risque très élevé",
                "Qualité maximale, risque minimal",
                "Rendement très élevé",
                "Durée très courte"
              ],
              correct: 1,
              explication: "AAA est la meilleure note attribuée par les agences (S&P, Moody's), indiquant un risque de défaut quasi-nul. Seuls quelques pays comme l'Allemagne ont ce rating."
            },
            {
              question: "Qu'appelle-t-on 'Junk Bonds' ?",
              options: [
                "Obligations pourries sans valeur",
                "Obligations à haut rendement mais risque élevé (BB et moins)",
                "Obligations d'État",
                "Obligations indexées sur l'inflation"
              ],
              correct: 1,
              explication: "Les 'junk bonds' (obligations pourries) sont des obligations corporate notées BB ou moins, offrant des rendements élevés pour compenser le risque de défaut important."
            },
            {
              question: "Si les taux d'intérêt passent de 3% à 5%, que se passe-t-il pour votre obligation à 3% ?",
              options: [
                "Son prix monte",
                "Son prix baisse",
                "Son prix ne change pas",
                "Elle paie maintenant 5%"
              ],
              correct: 1,
              explication: "Votre obligation à 3% devient moins attractive face aux nouvelles obligations à 5%, donc son prix de marché baisse pour ajuster son rendement effectif."
            },
            {
              question: "Qu'est-ce qu'une obligation convertible ?",
              options: [
                "Une obligation qui peut être échangée contre de l'or",
                "Une obligation qui peut être convertie en actions de l'entreprise",
                "Une obligation dont le coupon varie",
                "Une obligation remboursable avant échéance"
              ],
              correct: 1,
              explication: "Une obligation convertible peut être transformée en actions de l'entreprise selon des conditions prédéfinies, combinant sécurité de l'obligation et potentiel de l'action."
            },
            {
              question: "Si Apple verse 0.24$ de dividende par trimestre et vous détenez 100 actions, combien recevez-vous par an ?",
              options: [
                "24$",
                "96$",
                "240$",
                "2.40$"
              ],
              correct: 1,
              explication: "0.24$ × 4 trimestres = 0.96$ par action par an. Pour 100 actions : 0.96$ × 100 = 96$ par an."
            },
            {
              question: "Qu'est-ce qu'un fonds mutuel ?",
              options: [
                "Une action individuelle",
                "Un panier d'actifs géré professionnellement",
                "Une obligation d'État",
                "Un compte bancaire"
              ],
              correct: 1,
              explication: "Un fonds mutuel (OPCVM) est un portefeuille d'actions et/ou obligations géré par des professionnels, permettant la diversification même avec un petit capital."
            },
            {
              question: "Qu'est-ce qu'une 'Blue Chip' ?",
              options: [
                "Une petite entreprise prometteuse",
                "Une grande entreprise établie et fiable",
                "Une action technologique",
                "Une obligation"
              ],
              correct: 1,
              explication: "Les 'Blue Chips' sont de grandes entreprises solides et reconnues (ex: Coca-Cola, Johnson & Johnson, LVMH) considérées comme des valeurs sûres."
            },
            {
              question: "Si vous achetez une obligation à 950€ (sous le pair) avec valeur nominale 1000€ et coupon 5%, quel est votre rendement réel ?",
              options: [
                "Exactement 5%",
                "Plus de 5%",
                "Moins de 5%",
                "0%"
              ],
              correct: 1,
              explication: "Vous recevez 50€ de coupon (5% de 1000€) mais n'avez payé que 950€. Rendement = 50/950 = 5.26%. En plus, à l'échéance vous recevrez 1000€ au lieu de 950€ (gain supplémentaire de 50€)."
            }
          ]
        },
        {
          titre: "Module 4 : Introduction aux produits structurés",
          contenu: [
            {
              section: "C'est quoi un produit structuré ?",
              texte: "Un produit structuré combine plusieurs instruments financiers (obligations + options) pour créer un profil risque/rendement personnalisé. C'est comme un menu au restaurant : vous combinez différents éléments pour avoir exactement ce que vous voulez !",
              analogie: "Imaginez que vous voulez investir dans Apple mais : (1) vous ne voulez pas perdre votre capital, (2) vous voulez quand même profiter si Apple monte. Un produit structuré peut faire exactement ça en combinant une obligation (protection) + une option (exposition à la hausse)."
            },
            {
              section: "Les composants d'un produit structuré",
              texte: "Un produit structuré est construit comme un sandwich : une base solide (obligation) et une garniture (options) pour créer la saveur désirée.",
              details: [
                {
                  type: "Composante obligataire",
                  definition: "Partie du capital investie en obligations pour garantir la sécurité",
                  utilisation: "Protection du capital ou génération de revenus fixes",
                  exemple: "Sur 10 000€ investis, 9 000€ sont placés en obligation zero-coupon qui vaudra 10 000€ dans 5 ans"
                },
                {
                  type: "Composante optionnelle",
                  definition: "Options (calls, puts, barrières) pour créer le profil de performance",
                  utilisation: "Exposition à la hausse, génération de revenus, protection contre la baisse",
                  exemple: "Les 1 000€ restants achètent des options call sur Apple pour participer à la hausse"
                },
                {
                  type: "Sous-jacent",
                  definition: "L'actif de référence (action, indice, panier) sur lequel repose le produit",
                  utilisation: "Détermine la performance du produit",
                  exemple: "Apple, S&P 500, un panier de 3 actions tech, etc."
                }
              ]
            },
            {
              section: "Pourquoi utiliser des produits structurés ?",
              points: [
              "Protection du capital : Certains produits garantissent 100% de votre capital",
              "Rendement attractif : Coupons réguliers plus élevés que les obligations classiques",
              "Personnalisation : Adapté à votre vue de marché et votre appétit au risque",
              "Accès simplifié : Stratégies complexes dans un seul produit"
              ]
            },
            {
              section: "Pour qui sont les produits structurés ?",
              texte: "Les produits structurés s'adressent à différents profils d'investisseurs selon leur complexité et leur niveau de risque.",
              points: [
              "Investisseurs prudents : Capital garanti pour s'exposer aux actions sans risque",
              "Recherche de rendement : Autocalls et Reverse Convertibles pour des coupons élevés",
              "Sophistiqués : Warrants et produits à levier pour maximiser les gains",
              "Institutionnels : Hedging complexe et gestion de portefeuille"
              ]
            },
            {
              section: "Les 4 grands types de produits structurés",
              texte: "Il existe 4 grandes familles de produits structurés que nous proposons sur notre plateforme :",
              details: [
              {
              type: "Capital Garanti 🛡️",
              definition: "Votre capital est protégé à 100% + participation à la hausse",
              utilisation: "Pour investisseurs très prudents",
              exemple: "10 000€ investis, garantie de récupérer au minimum 10 000€ + 80% de la hausse d'Apple sur 5 ans"
              },
              {
              type: "Autocall 📈",
              definition: "Remboursement anticipé possible + coupons réguliers",
              utilisation: "Vue neutre à légèrement haussière",
              exemple: "Coupon 8% par an tant qu'Apple reste au-dessus de 60% du prix initial. Remboursement automatique si Apple dépasse 100%"
              },
              {
              type: "Reverse Convertible 📉",
              definition: "Coupon élevé en échange d'un risque sur le capital",
              utilisation: "Recherche de rendement élevé",
              exemple: "Coupon 10% garanti mais risque de recevoir des actions Apple si le prix chute de plus de 40%"
              },
              {
              type: "Warrant 🚀",
              definition: "Effet de levier pour amplifier les gains (et pertes)",
              utilisation: "Traders expérimentés",
              exemple: "Levier 5x : si Apple monte de 10%, le warrant gagne 50% (mais si baisse de 10%, perte de 50%)"
              }
              ]
            },
            {
              section: "Comparaison des 4 produits",
              texte: "Chaque type de produit structuré répond à un objectif et un profil de risque différent.",
              comparaison: {
              actions: {
              avantages: ["Capital Garanti: Aucun risque de perte", "Autocall: Coupons réguliers + sortie anticipée", "Reverse: Coupon très élevé", "Warrant: Gains amplifiés"],
              inconvenients: ["Capital Garanti: Participation limitée", "Autocall: Gain plafonné", "Reverse: Risque de perte significatif", "Warrant: Perte totale possible"],
              profil: "Risque croissant : Capital Garanti < Autocall < Reverse < Warrant"
              },
              obligations: {
              avantages: ["Capital Garanti: 5+ ans", "Autocall: 1-3 ans", "Reverse: 6 mois-2 ans", "Warrant: 3 mois-2 ans"],
              inconvenients: ["Capital Garanti: 2-5%/an + participation", "Autocall: 6-10%/an", "Reverse: 8-15%/an", "Warrant: -100% à +500%+"],
              profil: "Rendement espéré croissant avec le risque"
              }
              }
            },
            {
              section: "Comment sont construits les produits structurés ?",
              texte: "La construction d'un produit structuré suit une logique d'ingénierie financière précise.",
              exemple: "Capital Garanti sur Apple, 10 000€, 5 ans, participation 80% : (1) Acheter une obligation zero-coupon à 7 800€ qui vaudra 10 000€ dans 5 ans → Capital garanti. (2) Utiliser les 2 200€ restants pour acheter des options call sur Apple → Participation à la hausse de 80%."
            },
            {
              section: "Les barrières : concept clé",
              texte: "Beaucoup de produits structurés utilisent des barrières pour définir les conditions de paiement.",
              points: [
              "Barrière de protection : Niveau sous lequel vous perdez la protection (ex: 60% du prix initial)",
              "Barrière autocall : Niveau qui déclenche le remboursement anticipé (ex: 100% du prix initial)",
              "Barrière de coupon : Niveau pour recevoir le coupon (ex: 70% du prix initial)",
              "Knock-in/Knock-out : Barrières qui activent ou désactivent certaines options"
              ],
              exemple: "Autocall avec barrière à 60% : tant qu'Apple reste au-dessus de 60% du prix initial, vous recevez 8%/an. Si Apple touche les 60%, vous perdez la protection."
            },
            {
              section: "Avantages et risques des produits structurés",
              texte: "Comme tout investissement, les produits structurés présentent des avantages mais aussi des risques à bien comprendre.",
              comparaison: {
                actions: {
                  avantages: ["Personnalisation du profil risque/rendement", "Accès à des stratégies sophistiquées", "Protection possible du capital", "Rendements attractifs"],
                  inconvenients: [],
                  profil: "Avantages"
                },
                obligations: {
                  avantages: [],
                  inconvenients: ["Complexité nécessitant une bonne compréhension", "Risque de l'émetteur (défaut possible)", "Liquidité limitée avant échéance", "Coûts implicites dans la structure"],
                  profil: "Risques"
                }
              }
            },
            {
              section: "Comprendre les payoffs (profils de gain/perte)",
              texte: "Le payoff est le diagramme montrant ce que vous gagnez ou perdez selon le scénario final.",
              exemple: "Reverse Convertible sur Apple à 150$ avec barrière 60% (90)etcoupon10) et coupon 10% : (1) Apple finit > 90) et coupon 10 → Vous récupérez 10 000€ + 1 000€ de coupon = 11 000€. (2) Apple finit à 75$ (< 90$) → Vous recevez des actions Apple ayant perdu 50% de valeur + 1 000€ de coupon = perte nette de ~4 000€."
            },
            {
              section: "Fiscalité des produits structurés (France)",
              texte: "Les gains sur produits structurés sont soumis à la fiscalité française.",
              points: [
                `Flat Tax (PFU) :
              30% (12.8% IR + 17.2% prélèvements sociaux)
              Appliquée sur les plus-values`,
                "Alternative : Barème progressif de l'IR si plus avantageux",
                "Coupons : Imposés comme des intérêts (même régime que les obligations)",
                "Enveloppes fiscales : Certains produits peuvent être logés en assurance-vie pour optimiser la fiscalité"
              ]
            },
            {
              section: "Prochaines étapes",
              texte: "Maintenant que vous comprenez les bases, vous pouvez :",
              actions: [
              "Passer au niveau intermédiaire pour approfondir vos connaissances",
              "Explorer l'onglet Tutoriels pour voir comment chaque produit fonctionne en détail",
              "Utiliser le Simulateur pour tester le pricing de différents produits",
              "Consulter le Glossaire pour maîtriser le vocabulaire technique"
              ]
            }
          ],
          quiz: [
            {
              question: "Qu'est-ce qu'un produit structuré ?",
              options: [
              "Une action ordinaire",
              "Un produit combinant obligations et options pour un profil risque/rendement personnalisé",
              "Un compte d'épargne",
              "Une crypto-monnaie"
              ],
              correct: 1,
              explication: "Un produit structuré combine généralement une obligation (sécurité) et des options (performance) pour créer un profil d'investissement sur mesure."
            },
            {
              question: "Quelle est la principale caractéristique d'un produit à Capital Garanti ?",
              options: [
              "Rendement très élevé garanti",
              "Protection du capital à 100% + participation à la hausse",
              "Effet de levier important",
              "Coupon variable"
              ],
              correct: 1,
              explication: "Un Capital Garanti protège votre investissement initial à 100% tout en vous permettant de participer (partiellement) à la hausse du sous-jacent."
            },
            {
              question: "Qu'est-ce qu'un Autocall ?",
              options: [
              "Un appel téléphonique automatique",
              "Un produit qui peut se rembourser automatiquement avant l'échéance",
              "Une obligation classique",
              "Une action à dividende"
              ],
              correct: 1,
              explication: "Un Autocall peut se rembourser automatiquement si certaines conditions sont remplies (généralement si le sous-jacent atteint un certain niveau), vous versant capital + coupons cumulés."
            },
            {
              question: "Quel produit offre généralement le coupon le plus élevé ?",
              options: [
              "Capital Garanti",
              "Autocall",
              "Reverse Convertible",
              "Warrant"
              ],
              correct: 2,
              explication: "Le Reverse Convertible offre les coupons les plus élevés (8-15%/an) mais en contrepartie d'un risque significatif de perte en capital si le sous-jacent chute fortement."
            },
            {
              question: "Qu'est-ce qu'une barrière dans un produit structuré ?",
              options: [
              "Un mur physique",
              "Un niveau de prix qui déclenche ou annule certains paiements",
              "Le prix d'achat du produit",
              "La commission du vendeur"
              ],
              correct: 1,
              explication: "Une barrière est un seuil de prix prédéfini. Si le sous-jacent touche ou franchit cette barrière, cela modifie les caractéristiques du produit (déclenchement autocall, perte de protection, etc.)."
            },
            {
              question: "Qu'est-ce qu'un Warrant ?",
              options: [
              "Un produit à capital garanti",
              "Un produit à effet de levier amplifiant gains et pertes",
              "Une obligation d'État",
              "Un fonds monétaire"
              ],
              correct: 1,
              explication: "Un Warrant est un produit dérivé avec effet de levier qui amplifie les mouvements du sous-jacent. Levier 5x signifie : si le sous-jacent monte de 10%, le warrant gagne 50% (mais perd aussi 50% si baisse de 10%)."
            },
            {
              question: "Quel est le principal risque d'un Reverse Convertible ?",
              options: [
              "Perdre totalement son capital",
              "Recevoir des actions ayant fortement chuté au lieu du capital",
              "Ne pas recevoir de coupon",
              "Inflation"
              ],
              correct: 1,
              explication: "Si le sous-jacent chute sous la barrière, vous recevez des actions au lieu de votre capital. Si l'action a perdu 50%, vous subissez cette perte malgré le coupon reçu."
            },
            {
              question: "Pour quel profil d'investisseur un Capital Garanti est-il le plus adapté ?",
              options: [
              "Investisseur agressif cherchant le maximum de rendement",
              "Investisseur prudent voulant s'exposer aux actions sans risque",
              "Trader day-trading",
              "Spéculateur sur crypto"
              ],
              correct: 1,
              explication: "Le Capital Garanti convient parfaitement aux investisseurs prudents qui veulent profiter de la hausse potentielle des marchés actions tout en étant certains de récupérer au minimum leur capital initial."
            },
            {
              question: "Qu'est-ce que la 'participation' dans un Capital Garanti ?",
              options: [
              "Le nombre d'actionnaires",
              "Le % de la hausse du sous-jacent que vous captez",
              "Le coupon annuel",
              "Les frais de gestion"
              ],
              correct: 1,
              explication: "La participation détermine quelle proportion de la performance positive vous obtenez. Participation 80% signifie : si le sous-jacent monte de 50%, vous gagnez 40% (80% de 50%)."
            },
            {
              question: "Combien de temps dure généralement un produit à Capital Garanti ?",
              options: [
              "1 mois",
              "3-6 mois",
              "3-7 ans",
              "20 ans"
              ],
              correct: 2,
              explication: "Les produits à Capital Garanti ont typiquement une maturité de 3 à 7 ans, le temps nécessaire pour que la composante obligataire arrive à maturité et garantisse le capital."
            },
            {
              question: "Qu'arrive-t-il si vous vendez un produit structuré avant son échéance ?",
              options: [
              "Vous récupérez exactement votre capital",
              "Vous vendez au prix de marché qui peut être inférieur au capital",
              "C'est impossible, c'est bloqué",
              "Vous gagnez automatiquement 10%"
              ],
              correct: 1,
              explication: "Les produits structurés ont souvent une liquidité limitée. Si vous vendez avant l'échéance, vous pouvez subir une décote importante car les garanties ne sont valables qu'à maturité."
            },
            {
              question: "Dans un Autocall, que se passe-t-il si la barrière autocall est touchée à une date d'observation ?",
              options: [
              "Vous perdez tout",
              "Le produit se rembourse automatiquement avec capital + coupons",
              "Rien ne change",
              "Vous devez racheter des actions"
              ],
              correct: 1,
              explication: "Si le sous-jacent est au-dessus de la barrière autocall à une date d'observation, le produit se termine automatiquement et vous recevez votre capital + tous les coupons (payés et non payés) immédiatement."
            },
            {
              question: "Qu'est-ce qu'un 'sous-jacent' ?",
              options: [
              "La partie obligataire du produit",
              "L'actif de référence sur lequel repose le produit (action, indice...)",
              "Le rendement minimum",
              "La barrière"
              ],
              correct: 1,
              explication: "Le sous-jacent est l'actif financier dont dépend la performance du produit structuré : une action (Apple), un indice (S&P 500), un panier d'actions, une devise, une matière première, etc."
            },
            {
              question: "Quelle est la fiscalité des gains sur produits structurés en France (2024) ?",
              options: [
              "0% (exonérés)",
              "Flat Tax 30% (ou barème IR)",
              "50%",
              "Variable selon le jour"
              ],
              correct: 1,
              explication: "Les plus-values sont soumises au PFU (Prélèvement Forfaitaire Unique) de 30%, ou au barème progressif de l'IR sur option si plus avantageux."
            },
            {
              question: "Dans un Reverse Convertible, le coupon élevé compense :",
              options: [
              "L'inflation",
              "Les frais bancaires",
              "La fiscalité",
              "Le risque de recevoir des actions ayant fortement baissé"
              ],
              correct: 3,
              explication: "Le coupon élevé (8-15%) rémunère le risque que vous prenez : si le sous-jacent chute fortement sous la barrière, vous recevrez des actions dépréciées au lieu de votre capital."
            },
            {
              question: "Si un Autocall offre un coupon de 8% par an sur 3 ans et se déclenche après 1 an, combien recevez-vous de coupons ?",
              options: [
              "8% seulement (1 an)",
              "24% (3 ans de coupons)",
              "16% (2 ans)",
              "0%"
              ],
              correct: 0,
              explication: "Vous recevez le coupon uniquement pour la période écoulée, soit 1 an = 8%. Si le produit avait été un 'Autocall à mémoire', vous auriez pu recevoir les coupons futurs également, mais ce n'est pas le cas standard."
            }
          ]
        }
      ]
    },

    intermediaire: {
      title: "Niveau Intermédiaire",
      subtitle: "Comprendre les mécanismes et la valorisation",
      icon: "📊",
      modules: [
        {
          titre: "Module 1 : La valorisation des actifs",
          contenu: [
            {
              section: "Qu'est-ce que la valeur ?",
              texte: "La valeur d'un actif financier est le prix qu'on est prêt à payer pour les flux de trésorerie futurs qu'il va générer. En finance, on dit que 'la valeur aujourd'hui = les flux futurs actualisés'.",
              formule: "Valeur = Flux Futur / (1 + Taux d'actualisation)ⁿ",
              exemple: "Une obligation qui paie 1 000€ dans 1 an vaut combien aujourd'hui ? Si le taux est 5%, elle vaut 1000 / 1.05 = 952€"
            },
            {
              section: "Le concept d'actualisation",
              texte: "L'actualisation traduit le fait que 100€ aujourd'hui valent plus que 100€ dans 1 an (car vous pouvez investir ces 100€ et obtenir plus). C'est la valeur temps de l'argent.",
              points: [
                "**Taux d'actualisation élevé** → Les flux futurs valent moins aujourd'hui",
                "**Taux d'actualisation faible** → Les flux futurs valent plus aujourd'hui",
                "Le taux d'actualisation reflète le risque : plus c'est risqué, plus le taux est élevé"
              ]
            },
            {
              section: "Mathématiques de l'actualisation",
              texte: "L'actualisation repose sur une formule mathématique simple mais puissante qui transforme les flux futurs en valeur présente.",
              formule: "VP = VF / (1 + r)ⁿ",
              details: [
                {
                  type: "Exemple sur 5 ans",
                  definition: "Calculer la valeur présente de 10 000€ reçus dans 5 ans",
                  utilisation: "Avec un taux de 6% par an",
                  exemple: "VP = 10 000 / (1.06)⁵ = 10 000 / 1.338 = 7 473€. Donc 7 473€ aujourd'hui = 10 000€ dans 5 ans à 6%"
                },
                {
                  type: "Flux multiples",
                  definition: "Pour actualiser plusieurs flux à différentes dates",
                  utilisation: "Sommer la VP de chaque flux",
                  exemple: "1000€/an pendant 3 ans à 5% : VP = 1000/1.05 + 1000/1.05² + 1000/1.05³ = 952 + 907 + 864 = 2 723€"
                }
              ]
            },
            {
              section: "Valorisation d'une action",
              texte: "Deux approches principales pour valoriser une action :",
              methodes: [
                {
                  nom: "Méthode des flux de trésorerie actualisés (DCF)",
                  description: "On estime tous les flux futurs de l'entreprise (bénéfices, dividendes) et on les actualise à aujourd'hui",
                  formule: "Valeur = Σ (Flux futurs / (1+r)ⁿ)",
                  exemple: "Apple génère 100 Mds$ de free cash-flow/an avec croissance 5%/an. En actualisant à 8%, valeur = 100/(0.08-0.05) = 3 333 Mds$"
                },
                {
                  nom: "Multiples de valorisation",
                  description: "On compare avec des entreprises similaires (PER, Price/Book, EV/EBITDA)",
                  exemple: "Si le secteur tech a un PER de 25 et Apple génère 6$ de bénéfice par action → Prix théorique = 25 × 6 = 150$"
                }
              ]
            },
            {
              section: "Les principaux multiples de valorisation",
              texte: "Les multiples permettent de comparer rapidement des entreprises entre elles.",
              details: [
                {
                  type: "PER (Price/Earnings Ratio)",
                  definition: "Prix de l'action / Bénéfice par action",
                  utilisation: "Mesure combien on paie pour 1$ de bénéfice",
                  exemple: "Apple à 150$ avec BPA de 6$ → PER = 150/6 = 25. On paie 25x les bénéfices annuels"
                },
                {
                  type: "Price/Book",
                  definition: "Capitalisation / Capitaux propres",
                  utilisation: "Compare le prix de marché à la valeur comptable",
                  exemple: "P/B = 5 signifie que le marché valorise l'entreprise 5x sa valeur comptable"
                },
                {
                  type: "EV/EBITDA",
                  definition: "Enterprise Value / Résultat opérationnel",
                  utilisation: "Valorisation indépendante de la structure financière",
                  exemple: "EV/EBITDA de 12 est typique pour une entreprise mature. Tech peut être à 20-30"
                },
                {
                  type: "Dividend Yield",
                  definition: "Dividende annuel / Prix de l'action",
                  utilisation: "Rendement du dividende en %",
                  exemple: "Action à 100$ payant 4$/an de dividende → Yield = 4%"
                }
              ]
            },
            {
              section: "Le modèle de Gordon (Dividend Discount Model)",
              texte: "Modèle simple pour valoriser une action basé sur les dividendes futurs avec croissance constante.",
              formule: "P = D₁ / (r - g)",
              exemple: "Apple paie 1$ de dividende qui croît de 5%/an. Taux d'actualisation 10%. Valeur = 1 / (0.10 - 0.05) = 20$ par action.",
              points: [
                "D₁ = Dividende de l'année prochaine",
                "r = Taux d'actualisation (rendement exigé)",
                "g = Taux de croissance perpétuel des dividendes",
                "Fonctionne bien pour entreprises matures avec dividendes stables"
              ]
            },
            {
              section: "Valorisation des obligations",
              texte: "Une obligation vaut la somme actualisée de tous ses flux futurs (coupons + principal).",
              formule: "P = Σ(C/(1+r)ᵗ) + N/(1+r)ⁿ",
              exemple: "Obligation 1000€, coupon 5% (50€/an), maturité 3 ans, taux marché 6%. Prix = 50/1.06 + 50/1.06² + 50/1.06³ + 1000/1.06³ = 47.17 + 44.50 + 41.98 + 839.62 = 973€. L'obligation vaut moins que le nominal car le coupon (5%) est inférieur au taux de marché (6%)."
            },
            {
              section: "Yield to Maturity (YTM)",
              texte: "Le YTM est le taux de rendement total si vous détenez l'obligation jusqu'à l'échéance. C'est le taux qui égalise le prix de marché et la valeur actualisée des flux.",
              points: [
                "Si Prix < Nominal → YTM > Coupon (vous achetez avec une décote)",
                "Si Prix > Nominal → YTM < Coupon (vous achetez avec une prime)",
                "Si Prix = Nominal → YTM = Coupon",
                "Le YTM intègre coupons + gain/perte en capital à maturité"
              ]
            },
            {
              section: "Comparaison DCF vs Multiples",
              texte: "Chaque méthode a ses avantages et inconvénients.",
              comparaison: {
                actions: {
                  avantages: ["Basée sur les fondamentaux réels", "Flexible, adapté à chaque entreprise", "Capture la valeur intrinsèque"],
                  inconvenients: ["Très sensible aux hypothèses", "Complexe à calculer", "Nécessite de projeter loin dans le futur"],
                  profil: "DCF (Discounted Cash Flow)"
                },
                obligations: {
                  avantages: ["Rapide et simple", "Basée sur le marché actuel", "Utile pour comparer des pairs"],
                  inconvenients: ["Ne capture pas les spécificités", "Sensible aux bulles de marché", "Peut être trompeur si secteur surévalué"],
                  profil: "Multiples de valorisation"
                }
              }
            }
          ],
          quiz: [
            {
              question: "Que signifie 'actualiser' un flux futur ?",
              options: [
                "L'ajuster à l'inflation",
                "Calculer sa valeur équivalente aujourd'hui",
                "Le multiplier par le taux d'intérêt",
                "Attendre qu'il soit reçu"
              ],
              correct: 1,
              explication: "Actualiser signifie ramener un flux futur à sa valeur présente en tenant compte du taux d'intérêt. 100€ dans 1 an actualisés à 5% valent 95.24€ aujourd'hui."
            },
            {
              question: "Qu'est-ce que le PER (Price/Earnings Ratio) ?",
              options: [
                "Prix de l'action / Bénéfice par action",
                "Bénéfice / Prix",
                "Prix / Dividende",
                "Capitalisation / Chiffre d'affaires"
              ],
              correct: 0,
              explication: "Le PER mesure combien d'années de bénéfices il faut pour 'rembourser' le prix de l'action. Un PER de 20 signifie qu'on paie 20 fois les bénéfices annuels."
            },
            {
              question: "Si une action vaut 100$ avec un bénéfice par action de 5$, quel est son PER ?",
              options: [
                "5",
                "20",
                "100",
                "500"
              ],
              correct: 1,
              explication: "PER = Prix / BPA = 100 / 5 = 20. L'action se trade à 20 fois les bénéfices."
            },
            {
              question: "Pourquoi un taux d'actualisation élevé diminue-t-il la valeur présente ?",
              options: [
                "Parce que l'inflation est forte",
                "Parce que les flux futurs valent moins comparé à ce qu'on pourrait gagner ailleurs",
                "Parce que c'est une erreur de calcul",
                "Ça n'a aucun effet"
              ],
              correct: 1,
              explication: "Un taux d'actualisation élevé signifie que vous pourriez obtenir un bon rendement ailleurs, donc les flux futurs sont moins attractifs en comparaison, diminuant leur valeur présente."
            },
            {
              question: "Qu'est-ce que la méthode DCF (Discounted Cash Flow) ?",
              options: [
                "Une méthode basée sur les multiples de marché",
                "Une méthode valorisant une entreprise en actualisant ses flux futurs",
                "Un ratio de liquidité",
                "Un indice boursier"
              ],
              correct: 1,
              explication: "La DCF valorise une entreprise en estimant tous ses flux de trésorerie futurs et en les actualisant au taux de rendement exigé pour obtenir la valeur présente."
            },
            {
              question: "Si le taux d'actualisation augmente, que se passe-t-il pour la valeur d'une action selon le DCF ?",
              options: [
                "La valeur augmente",
                "La valeur diminue",
                "Aucun effet",
                "La valeur double"
              ],
              correct: 1,
              explication: "Un taux plus élevé au dénominateur diminue la valeur actualisée des flux futurs, donc la valeur de l'action baisse selon le DCF."
            },
            {
              question: "Qu'est-ce que le Dividend Yield ?",
              options: [
                "Le nombre d'actions émises",
                "Dividende annuel / Prix de l'action en %",
                "Le PER",
                "La croissance des bénéfices"
              ],
              correct: 1,
              explication: "Le Dividend Yield mesure le rendement du dividende : si une action à 100$ verse 4$/an, le yield est 4%."
            },
            {
              question: "Une obligation avec un coupon de 4% se trade à 950€ (nominal 1000€). Pourquoi ?",
              options: [
                "Parce que l'émetteur est en faillite",
                "Parce que les taux de marché sont supérieurs à 4%",
                "C'est une erreur de prix",
                "Parce que la maturité est très courte"
              ],
              correct: 1,
              explication: "Si les taux de marché sont à 5-6%, une obligation payant seulement 4% vaut moins que le nominal pour offrir un rendement compétitif."
            },
            {
              question: "Que signifie 'zero-coupon' pour une obligation ?",
              options: [
                "Elle ne paie aucun coupon mais se rembourse au-dessus du prix d'achat",
                "Elle paie un coupon de 0%",
                "Elle n'a aucune valeur",
                "C'est une obligation gratuite"
              ],
              correct: 0,
              explication: "Une obligation zero-coupon ne verse pas d'intérêts périodiques. Elle s'achète avec une décote et se rembourse au nominal à l'échéance. Exemple : acheter à 750€, recevoir 1000€ dans 5 ans."
            },
            {
              question: "Qu'est-ce que l'EV/EBITDA ?",
              options: [
                "Un ratio de liquidité",
                "Enterprise Value / Résultat opérationnel (multiple de valorisation)",
                "Un type d'obligation",
                "Un indice boursier"
              ],
              correct: 1,
              explication: "EV/EBITDA compare la valeur totale de l'entreprise (incluant dette) à son résultat opérationnel. C'est utile pour comparer des entreprises avec différentes structures de capital."
            },
            {
              question: "Quel multiple est le plus approprié pour comparer des banques ?",
              options: [
                "PER",
                "Price/Book",
                "EV/EBITDA",
                "Price/Sales"
              ],
              correct: 1,
              explication: "Les banques sont souvent valorisées sur le Price/Book car leurs actifs (prêts, investissements) sont au bilan et leur 'production' est difficile à mesurer avec les métriques traditionnelles."
            },
            {
              question: "Qu'est-ce que le WACC (Weighted Average Cost of Capital) ?",
              options: [
                "Le coût moyen pondéré du capital (taux d'actualisation)",
                "Le prix d'une action",
                "Un type d'obligation",
                "Le rendement d'un dividende"
              ],
              correct: 0,
              explication: "Le WACC est le coût moyen du capital de l'entreprise (dette + actions) pondéré par leur proportion. C'est le taux utilisé pour actualiser les flux dans la méthode DCF."
            },
            {
              question: "Si une entreprise a un PER de 30 vs son secteur à PER 20, qu'est-ce que cela peut indiquer ?",
              options: [
                "Elle est nécessairement surévaluée",
                "Le marché anticipe une croissance supérieure à la moyenne du secteur",
                "Elle va faire faillite",
                "Son dividende est très élevé"
              ],
              correct: 1,
              explication: "Un PER élevé peut indiquer que le marché anticipe une forte croissance future. Les entreprises tech ont souvent des PER élevés car elles réinvestissent pour croître rapidement."
            },
            {
              question: "Quelle est la valeur présente de 5 000€ reçus dans 3 ans à un taux de 10% ?",
              options: [
                "3 756€",
                "4 545€",
                "5 000€",
                "6 655€"
              ],
              correct: 0,
              explication: "VP = 5000 / (1.10)³ = 5000 / 1.331 = 3 756€"
            },
            {
              question: "Qu'est-ce que la 'valeur intrinsèque' d'une entreprise ?",
              options: [
                "Son prix actuel en bourse",
                "Sa vraie valeur économique basée sur ses flux futurs actualisés",
                "Sa valeur comptable",
                "Son chiffre d'affaires"
              ],
              correct: 1,
              explication: "La valeur intrinsèque est la 'vraie valeur' théorique calculée par DCF ou autre modèle fondamental, indépendamment du prix de marché qui peut être sur/sous-évalué."
            },
            {
              question: "Pourquoi le taux d'actualisation d'une startup tech est-il plus élevé que celui d'une utility company ?",
              options: [
                "Parce que les startups gagnent plus d'argent",
                "Parce que le risque est plus élevé pour une startup",
                "Parce que c'est obligatoire par la loi",
                "Il n'y a pas de différence"
              ],
              correct: 1,
              explication: "Le taux d'actualisation reflète le risque. Une startup tech a plus de chances d'échouer qu'une entreprise de services publics stable, donc exige un taux plus élevé (10-15% vs 6-8%)."
            }
          ]
        },
        {
          titre: "Module 2 : Le risque et la volatilité",
          contenu: [
            {
              section: "Qu'est-ce que le risque ?",
              texte: "En finance, le risque c'est l'incertitude sur les rendements futurs. Plus le risque est élevé, plus les rendements peuvent varier (dans les deux sens).",
              citation: "« Le risque vient de ne pas savoir ce que l'on fait » - Warren Buffett"
            },
            {
              section: "Les différents types de risque",
              texte: "Il existe plusieurs catégories de risques en finance, chacune nécessitant une approche de gestion différente.",
              details: [
                {
                  type: "Risque de marché",
                  definition: "Risque lié aux fluctuations générales des marchés",
                  utilisation: "Mesuré par la volatilité, le bêta",
                  exemple: "En 2008, presque toutes les actions ont chuté (risque systématique)"
                },
                {
                  type: "Risque spécifique",
                  definition: "Risque propre à une entreprise ou un secteur",
                  utilisation: "Peut être éliminé par la diversification",
                  exemple: "Scandale Volkswagen 2015 : action VW -40% mais marché stable"
                },
                {
                  type: "Risque de crédit",
                  definition: "Risque qu'un émetteur ne rembourse pas sa dette",
                  utilisation: "Mesuré par le rating (AAA à D)",
                  exemple: "Défaut de Lehman Brothers en 2008"
                },
                {
                  type: "Risque de liquidité",
                  definition: "Risque de ne pas pouvoir vendre rapidement sans perte",
                  utilisation: "Important pour actifs illiquides",
                  exemple: "Vendre un immeuble prend des mois vs vendre Apple en 1 seconde"
                },
                {
                  type: "Risque de taux",
                  definition: "Risque lié aux variations des taux d'intérêt",
                  utilisation: "Affecte surtout les obligations",
                  exemple: "Si les taux montent de 2%, une obligation 10 ans peut perdre 15-20%"
                }
              ]
            },
            {
              section: "La volatilité : mesurer le risque",
              texte: "La volatilité mesure l'ampleur des variations de prix. C'est l'écart-type des rendements. Une volatilité de 20% signifie que le prix peut varier d'environ ±20% sur un an.",
              formule: "σ = √(Σ(rendement - moyenne)² / n) × √252",
              exemple: "Apple a une volatilité de 25% et un prix de 150$. Sur un an, on s'attend à ce qu'Apple soit entre 112$ et 188$ (±25%) avec 68% de probabilité."
            },
            {
              section: "Calcul pratique de la volatilité",
              texte: "Calculer la volatilité historique pas à pas.",
              etapes: [
                {
                  etape: "1. Collecter les prix",
                  texte: "Prix de clôture quotidiens sur 30, 60 ou 252 jours (1 an de trading)"
                },
                {
                  etape: "2. Calculer les rendements",
                  formule: "r = ln(Prix_jour / Prix_jour-1)",
                  texte: "Rendement logarithmique quotidien"
                },
                {
                  etape: "3. Calculer l'écart-type",
                  formule: "σ_daily = √(Σ(r - r̄)² / (n-1))",
                  texte: "Écart-type des rendements quotidiens"
                },
                {
                  etape: "4. Annualiser",
                  formule: "σ_annual = σ_daily × √252",
                  texte: "Multiplier par racine carrée de 252 (jours de trading/an)"
                }
              ]
            },
            {
              section: "Volatilité historique vs implicite",
              texte: "Deux mesures complémentaires de la volatilité : ce qui s'est passé vs ce que le marché anticipe.",
              comparaison: {
                actions: {
                  avantages: ["Basée sur les données passées réelles", "Observable et mesurable", "Gratuite à calculer"],
                  inconvenients: ["Ne prédit pas nécessairement le futur", "Peut être trompeuse en période de changement de régime"],
                  profil: "Volatilité Historique (réalisée)"
                },
                obligations: {
                  avantages: ["Reflète les attentes du marché", "Forward-looking", "Utilisée pour pricer les options"],
                  inconvenients: ["Fluctue avec l'offre/demande", "Peut être biaisée par la panique ou l'euphorie"],
                  profil: "Volatilité Implicite (anticipée)"
                }
              }
            },
            {
              section: "Relation Risque-Rendement",
              texte: "C'est le principe fondamental de la finance : plus vous prenez de risques, plus le rendement espéré doit être élevé.",
              points: [
                "**Obligations d'État** : Risque faible → Rendement 3-5%/an",
                "**Actions grandes capitalisations** : Risque moyen → Rendement 8-10%/an",
                "**Actions small cap** : Risque élevé → Rendement potentiel 12-15%/an",
                "**Crypto/Startups** : Risque très élevé → Rendement potentiel 20-50%/an (mais pertes totales possibles)"
              ]
            },
            {
              section: "Le ratio de Sharpe",
              texte: "Le ratio de Sharpe mesure le rendement excédentaire obtenu par unité de risque pris. C'est la métrique clé pour comparer des investissements.",
              formule: "Sharpe = (Rendement - Taux sans risque) / Volatilité",
              exemple: "Portefeuille A : 12% de rendement, 20% de volatilité, taux sans risque 3%. Sharpe = (12-3)/20 = 0.45. Portefeuille B : 10% rendement, 12% volatilité. Sharpe = (10-3)/12 = 0.58. B est meilleur (plus de rendement par unité de risque).",
              points: [
                "Sharpe > 1 : Excellent",
                "Sharpe 0.5-1 : Bon",
                "Sharpe < 0.5 : Moyen",
                "Sharpe négatif : Vous gagnez moins que le taux sans risque !"
              ]
            },
            {
              section: "La diversification",
              texte: "« Ne mettez pas tous vos œufs dans le même panier ». En diversifiant vos investissements, vous réduisez le risque global sans nécessairement réduire le rendement.",
              exemple: "Si vous investissez 100% dans une seule action et qu'elle s'effondre (-50%), vous perdez 50%. Si vous investissez dans 10 actions différentes et qu'une seule s'effondre, vous ne perdez que 5%."
            },
            {
              section: "Corrélation et diversification",
              texte: "La diversification fonctionne grâce à la corrélation imparfaite entre actifs.",
              points: [
                "**Corrélation +1** : Actifs bougent exactement ensemble → Diversification inutile",
                "**Corrélation 0** : Actifs indépendants → Bonne diversification",
                "**Corrélation -1** : Actifs bougent en sens opposé → Diversification parfaite (rare)",
                "**Typique** : Actions du même secteur : corrélation 0.6-0.8 | Actions de secteurs différents : 0.3-0.5"
              ],
              exemple: "Actions tech et or ont souvent une corrélation négative : quand la tech baisse (crise), l'or monte (valeur refuge)."
            },
            {
              section: "Le bêta (β) : risque systématique",
              texte: "Le bêta mesure la sensibilité d'une action aux mouvements du marché global.",
              formule: "β = Cov(Action, Marché) / Var(Marché)",
              points: [
                "**β = 1** : L'action bouge comme le marché (ex: ETF S&P 500)",
                "**β > 1** : L'action amplifie les mouvements du marché (ex: Tesla β = 2)",
                "**β < 1** : L'action est moins volatile que le marché (ex: utilities β = 0.6)",
                "**β négatif** : L'action bouge en sens inverse (rare, ex: or β = -0.2)"
              ],
              exemple: "Tesla a un β de 2. Si le S&P 500 monte de 10%, Tesla monte en moyenne de 20%. Si le marché baisse de 10%, Tesla baisse de 20%."
            },
            {
              section: "VaR (Value-at-Risk) - Introduction",
              texte: "La VaR mesure la perte maximale potentielle sur un horizon donné avec un niveau de confiance donné.",
              formule: "VaR(95%, 1 jour) = μ - 1.65σ",
              exemple: "Portefeuille de 100 000€, rendement moyen 0.05%/jour, volatilité 1.5%/jour. VaR(95%, 1 jour) = 100 000 × (0.05% - 1.65 × 1.5%) = -2 425€. Il y a 5% de chances de perdre plus de 2 425€ demain.",
              points: [
                "VaR 95% → 5% de chances de dépasser cette perte",
                "VaR 99% → 1% de chances (plus conservateur)",
                "Horizon typique : 1 jour, 10 jours, 1 mois"
              ]
            },
            {
              section: "Construire un portefeuille efficient",
              texte: "Harry Markowitz (Prix Nobel 1990) a montré qu'on peut construire des portefeuilles optimisant le couple rendement/risque.",
              points: [
                "**Frontière efficiente** : Ensemble des portefeuilles offrant le meilleur rendement pour un niveau de risque donné",
                "**Portefeuille optimal** : Selon votre aversion au risque",
                "**Tangency portfolio** : Portefeuille avec le meilleur ratio de Sharpe",
                "**Diversification optimale** : Typiquement 15-30 actions suffisent pour éliminer 90% du risque spécifique"
              ]
            },
            {
              section: "Duration et sensibilité des obligations",
              texte: "La duration mesure la sensibilité du prix d'une obligation aux variations de taux. Plus la duration est élevée, plus l'obligation est sensible aux taux.",
              formule: "ΔP/P ≈ -Duration × Δr",
              exemple: "Obligation avec duration de 7 ans. Si les taux montent de 1% (0.01), le prix baisse d'environ 7% : ΔP/P = -7 × 0.01 = -0.07 = -7%."
            }
          ],
          quiz: [
            {
              question: "Qu'est-ce que la volatilité en finance ?",
              options: [
                "Le rendement moyen d'un actif",
                "La mesure de l'ampleur des variations de prix (écart-type)",
                "Le prix d'une action",
                "Le dividende versé"
              ],
              correct: 1,
              explication: "La volatilité est l'écart-type des rendements, mesurant l'ampleur et la fréquence des variations de prix. Une volatilité de 20% signifie que le prix peut varier d'environ ±20% sur un an."
            },
            {
              question: "Si une action a une volatilité annuelle de 30%, dans quelle fourchette le prix devrait-il se situer dans 1 an avec 68% de probabilité ?",
              options: [
                "±10% du prix actuel",
                "±30% du prix actuel",
                "±60% du prix actuel",
                "Impossible à dire"
              ],
              correct: 1,
              explication: "En statistique, 68% des observations sont à ±1 écart-type de la moyenne. Donc avec une volatilité de 30%, il y a 68% de chances que le prix soit dans la fourchette ±30% dans 1 an."
            },
            {
              question: "Qu'est-ce que le ratio de Sharpe ?",
              options: [
                "Prix / Bénéfice",
                "(Rendement - Taux sans risque) / Volatilité",
                "Dividende / Prix",
                "Volatilité / Rendement"
              ],
              correct: 1,
              explication: "Le ratio de Sharpe mesure le rendement excédentaire (au-dessus du taux sans risque) obtenu par unité de risque (volatilité). Plus il est élevé, meilleur est le rapport rendement/risque."
            },
            {
              question: "Qu'est-ce que le bêta (β) d'une action ?",
              options: [
                "Son prix de marché",
                "Sa sensibilité aux mouvements du marché global",
                "Son dividende",
                "Sa volatilité absolue"
              ],
              correct: 1,
              explication: "Le bêta mesure comment une action réagit aux mouvements du marché. β=1 signifie qu'elle bouge comme le marché, β=2 qu'elle amplifie×2 les mouvements, β=0.5 qu'elle est deux fois moins volatile."
            },
            {
              question: "Si Tesla a un bêta de 2 et que le S&P 500 monte de 5%, de combien Tesla devrait-elle monter en moyenne ?",
              options: [
                "2.5%",
                "5%",
                "10%",
                "20%"
              ],
              correct: 2,
              explication: "Mouvement Tesla ≈ β × Mouvement Marché = 2 × 5% = 10%. Tesla amplifie les mouvements du marché par un facteur 2."
            },
            {
              question: "Quelle est la différence entre volatilité historique et volatilité implicite ?",
              options: [
                "Il n'y a aucune différence",
                "Historique = passé réalisé, Implicite = anticipée par le marché (extraite des prix d'options)",
                "Historique est toujours plus élevée",
                "Implicite concerne uniquement les obligations"
              ],
              correct: 1,
              explication: "La volatilité historique se calcule à partir des prix passés. La volatilité implicite est extraite des prix d'options actuels et reflète les attentes du marché pour le futur."
            },
            {
              question: "Pourquoi la diversification réduit-elle le risque ?",
              options: [
                "Parce qu'elle élimine complètement le risque",
                "Parce que les actifs ne bougent pas tous exactement ensemble (corrélation < 1)",
                "Parce qu'elle augmente le rendement",
                "Elle ne réduit pas le risque"
              ],
              correct: 1,
              explication: "La diversification réduit le risque spécifique car les actifs ont des corrélations imparfaites : quand l'un baisse, l'autre peut monter ou rester stable, lissant ainsi les variations globales."
            },
            {
              question: "Qu'est-ce que le risque systématique ?",
              options: [
                "Le risque propre à une entreprise",
                "Le risque de marché affectant tous les actifs (non diversifiable)",
                "Le risque de crédit",
                "Le risque de change"
              ],
              correct: 1,
              explication: "Le risque systématique (ou de marché) affecte l'ensemble du marché (récession, guerre, hausse de taux). Il ne peut pas être éliminé par la diversification, contrairement au risque spécifique."
            },
            {
              question: "Qu'est-ce que la VaR (Value-at-Risk) ?",
              options: [
                "Le rendement espéré",
                "La perte maximale potentielle sur un horizon donné avec un niveau de confiance donné",
                "Le prix d'une option",
                "La volatilité"
              ],
              correct: 1,
              explication: "VaR(95%, 1 jour) = 10 000€ signifie : il y a 5% de chances de perdre plus de 10 000€ demain. C'est une mesure de risque très utilisée en gestion de portefeuille."
            },
            {
              question: "Si deux actifs ont une corrélation de +1, que se passe-t-il ?",
              options: [
                "Ils bougent en sens opposé",
                "Ils bougent exactement ensemble (diversification inutile)",
                "Ils sont indépendants",
                "L'un est sans risque"
              ],
              correct: 1,
              explication: "Corrélation +1 signifie qu'ils montent et baissent parfaitement ensemble. Détenir les deux n'apporte aucune diversification. Ex: deux ETF S&P 500 ont une corrélation proche de +1."
            },
            {
              question: "Quelle corrélation offre la meilleure diversification ?",
              options: [
                "+1 (parfaitement corrélés)",
                "0 (non corrélés)",
                "-1 (parfaitement inversement corrélés)",
                "Aucune importance"
              ],
              correct: 2,
              explication: "Corrélation -1 est idéale : quand l'un baisse, l'autre monte exactement du même montant, créant une diversification parfaite. C'est rare en pratique (ex: être long et short le même actif)."
            },
            {
              question: "Qu'est-ce que la duration d'une obligation ?",
              options: [
                "Sa maturité en années",
                "Sa sensibilité aux variations de taux d'intérêt",
                "Son coupon",
                "Son prix"
              ],
              correct: 1,
              explication: "La duration mesure la sensibilité du prix de l'obligation aux taux. Duration 7 signifie : si les taux montent de 1%, le prix baisse d'environ 7%."
            },
            {
              question: "Quel est le meilleur ratio de Sharpe ?",
              options: [
                "0.2",
                "0.6",
                "1.5",
                "-0.5"
              ],
              correct: 2,
              explication: "Plus le Sharpe est élevé, mieux c'est. Sharpe 1.5 est excellent (beaucoup de rendement par unité de risque). Sharpe négatif signifie que vous gagnez moins que le taux sans risque !"
            },
            {
              question: "Qu'est-ce que le risque de liquidité ?",
              options: [
                "Le risque de manquer d'eau",
                "Le risque de ne pas pouvoir vendre rapidement sans perte importante",
                "Le risque de défaut de l'émetteur",
                "Le risque de change"
              ],
              correct: 1,
              explication: "Le risque de liquidité est le risque de devoir vendre à perte faute d'acheteurs. Une petite action illiquide peut nécessiter une décote de 10-20% pour trouver un acheteur rapidement."
            },
            {
              question: "Pourquoi les actions small cap ont-elles généralement un rendement espéré plus élevé ?",
              options: [
                "Parce qu'elles sont meilleures",
                "Pour compenser le risque plus élevé (volatilité, liquidité)",
                "Par chance",
                "Elles n'ont pas de rendement plus élevé"
              ],
              correct: 1,
              explication: "Les small caps sont plus risquées (volatilité élevée, liquidité faible, risque de faillite). Selon le principe risque-rendement, elles doivent offrir un rendement espéré plus élevé pour attirer les investisseurs."
            },
            {
              question: "Qu'indique le VIX (indice de volatilité du S&P 500) ?",
              options: [
                "Le prix du S&P 500",
                "La volatilité implicite anticipée par le marché (surnommé 'indice de la peur')",
                "Le rendement du S&P 500",
                "Le nombre d'actions du S&P 500"
              ],
              correct: 1,
              explication: "Le VIX mesure la volatilité implicite extraite des options sur le S&P 500. VIX élevé (>30) indique de la peur/incertitude. VIX bas (<15) indique de la confiance/complaisance."
            }
          ]
        },
        {
          titre: "Module 3 : Introduction aux produits dérivés",
          contenu: [
            {
              section: "Qu'est-ce qu'un produit dérivé ?",
              texte: "Un produit dérivé est un instrument financier dont la valeur 'dérive' d'un actif sous-jacent (action, obligation, indice, matière première). C'est un contrat entre deux parties basé sur l'évolution future du sous-jacent.",
              analogie: "C'est comme parier sur un match de foot sans être joueur : vous ne possédez pas l'équipe, mais vous gagnez ou perdez selon le résultat."
            },
            {
              section: "Les catégories de produits dérivés",
              texte: "Il existe trois grandes catégories de dérivés selon leur mode de négociation et leur standardisation.",
              details: [
                {
                  type: "Dérivés listés (Exchange-traded)",
                  definition: "Négociés sur des bourses organisées avec des caractéristiques standardisées",
                  utilisation: "Options et futures sur indices, actions, matières premières",
                  exemple: "Options sur Apple négociées sur le CBOE, Futures S&P 500 sur le CME"
                },
                {
                  type: "Dérivés OTC (Over-The-Counter)",
                  definition: "Négociés de gré à gré entre deux parties, sur mesure",
                  utilisation: "Swaps, forwards, options exotiques",
                  exemple: "Un swap de taux d'intérêt entre une banque et une entreprise"
                },
                {
                  type: "Produits structurés",
                  definition: "Combinaison d'obligations et de dérivés packagés pour investisseurs retail",
                  utilisation: "Autocalls, capital garantis, reverse convertibles",
                  exemple: "Capital garanti 100% + participation 80% à Apple sur 5 ans"
                }
              ]
            },
            {
              section: "Les Options : Call et Put",
              texte: "Une option donne le DROIT (pas l'obligation) d'acheter (call) ou vendre (put) un actif à un prix fixé (strike) jusqu'à une date donnée.",
              details: [
                {
                  type: "Call (option d'achat)",
                  definition: "Droit d'acheter au prix strike",
                  utilisation: "Vous pensez que le prix va monter",
                  exemple: "Call Apple strike 150.Si Apple monte à 180. Si Apple monte à 180, vous pouvez acheter à 150$ et revendre à 180$ → Gain de 30$ par action"
                },
                {
                  type: "Put (option de vente)",
                  definition: "Droit de vendre au prix strike",
                  utilisation: "Vous pensez que le prix va baisser OU vous voulez vous protéger",
                  exemple: "Put Apple strike 150.SiAppletombe à 120. Si Apple tombe à 120. Si Apple tombe à 120, vous vendez à 150$ → Vous évitez la perte de 30$"
                }
              ]
            },
            {
              section: "Options européennes vs américaines",
              texte: "Deux styles d'exercice avec des implications différentes sur le pricing et la stratégie.",
              comparaison: {
                actions: {
                  avantages: ["Exercice uniquement à l'échéance", "Prix inférieur (moins de flexibilité)", "Pricing plus simple"],
                  inconvenients: ["Moins de flexibilité", "Pas d'exercice anticipé possible"],
                  profil: "Options Européennes"
                },
                obligations: {
                  avantages: ["Exercice possible à tout moment jusqu'à l'échéance", "Plus de flexibilité stratégique", "Utile pour capter les dividendes"],
                  inconvenients: ["Prix supérieur (prime de flexibilité)", "Pricing plus complexe"],
                  profil: "Options Américaines"
                }
              }
            },
            {
              section: "Pourquoi les options sont puissantes",
              points: [
                "Effet de levier : Petite mise pour grande exposition (une option coûte 5$ mais contrôle une action à 150$)",
                "Risque limité (acheteur) : Vous ne pouvez perdre que la prime payée (même si l'action s'effondre)",
                "Flexibilité : Vous pouvez parier à la hausse, à la baisse, ou sur la stabilité",
                "Protection (hedging) : Assurance pour protéger votre portefeuille",
                "Asymétrie : Gains potentiellement illimités, pertes limitées à la prime"
              ]
            },
            {
              section: "Valeur intrinsèque vs valeur temps",
              texte: "Le prix d'une option se décompose en deux éléments : la valeur intrinsèque (gain si exercée maintenant) et la valeur temps (potentiel de gain futur).",
              formule: "Prix Option = Valeur Intrinsèque + Valeur Temps",
              exemple: "Call Apple strike 150, prix spot 170, option vaut 25. Valeur intrinsèque = Max(0, 170-150) = 20. Valeur temps = 25-20 = 5$ (probabilité que Apple monte encore plus).",
              points: [
                `À l'échéance :
              Valeur temps = 0
              Reste seulement la valeur intrinsèque`,
                "Loin de l'échéance : Valeur temps élevée (beaucoup de temps pour bouger)",
                "ATM (At-The-Money) : Valeur temps maximale (plus d'incertitude)",
                "Deep ITM/OTM : Valeur temps faible"
              ]
            },
            {
              section: "Moneyness des options",
              texte: "Le terme 'moneyness' décrit la position du prix spot par rapport au strike.",
              details: [
                {
                  type: "ITM (In-The-Money)",
                  definition: "Option avec valeur intrinsèque positive",
                  utilisation: "Call : Spot > Strike | Put : Spot < Strike",
                  exemple: "Call strike 150$ avec Apple à 170$ → ITM de 20$"
                },
                {
                  type: "ATM (At-The-Money)",
                  definition: "Strike proche du prix spot",
                  utilisation: "Maximum d'incertitude, gamma et valeur temps maximaux",
                  exemple: "Apple à 150, option strike 150 → ATM"
                },
                {
                  type: "OTM (Out-of-The-Money)",
                  definition: "Option sans valeur intrinsèque",
                  utilisation: "Call : Spot < Strike | Put : Spot > Strike",
                  exemple: "Call strike 180$ avec Apple à 150$ → OTM de 30$"
                }
              ]
            },
            {
              section: "Le modèle de Black-Scholes",
              texte: "C'est LE modèle mathématique qui permet de calculer le prix théorique d'une option. Développé en 1973, il a révolutionné la finance (Prix Nobel 1997).",
              parametres: [
                `Prix spot (S) :
              Prix actuel de l'actif`,
                "Strike (K) : Prix d'exercice de l'option",
                "Volatilité (σ) : Mesure du risque",
                "Temps (T) : Durée jusqu'à l'échéance",
                "Taux sans risque (r) : Taux d'intérêt"
              ],
              formule: "C = S×N(d₁) - K×e⁻ʳᵀ×N(d₂)"
            },
            {
              section: "Hypothèses de Black-Scholes",
              texte: "Le modèle repose sur des hypothèses simplificatrices qui ne sont pas toujours vérifiées en pratique.",
              points: [
              "Volatilité constante : En réalité, elle varie (volatility smile)",
              "Pas de dividendes : Extension possible pour en tenir compte",
              "Marchés efficients : Pas de frictions, transactions continues",
              "Distribution log-normale : Exclut les sauts et crashs brutaux",
              "Taux sans risque constant : En réalité, la courbe des taux bouge"
                        ]
            },
            {
              section: "Stratégies de base avec options",
              texte: "Les options permettent de construire une infinité de stratégies pour différentes vues de marché.",
              strategies: [
                {
                  nom: "Long Call",
                  composition: "Acheter un call",
                  pari: "Forte hausse du sous-jacent",
                  Greeks: "Delta positif, Vega positif, Theta négatif"
                },
                {
                  nom: "Long Put",
                  composition: "Acheter un put",
                  pari: "Forte baisse du sous-jacent",
                  Greeks: "Delta négatif, Vega positif, Theta négatif"
                },
                {
                  nom: "Covered Call",
                  composition: "Détenir l'action + vendre un call OTM",
                  pari: "Hausse modérée, générer du revenu",
                  Greeks: "Gain plafonné au strike, theta positif"
                },
                {
                  nom: "Protective Put",
                  composition: "Détenir l'action + acheter un put",
                  pari: "Protection contre la baisse",
                  Greeks: "Assurance, coûte la prime du put"
                },
                {
                  nom: "Bull Spread",
                  composition: "Acheter call strike bas, vendre call strike haut",
                  pari: "Hausse modérée",
                  Greeks: "Risque et gain limités, coût réduit vs long call simple"
                }
              ]
            },
            {
              section: "Forwards et Futures",
              texte: "Contrats dérivés obligeant (contrairement aux options) à acheter ou vendre à un prix fixé à une date future.",
              comparaison: {
                actions: {
                  avantages: ["Contrat sur mesure entre deux parties", "OTC, non standardisé", "Pas de dépôt de garantie"],
                  inconvenients: ["Risque de contrepartie élevé", "Peu liquide"],
                  profil: "Forward"
                },
                obligations: {
                  avantages: ["Standardisé, négocié en bourse", "Chambre de compensation (pas de risque contrepartie)", "Très liquide"],
                  inconvenients: ["Appels de marge quotidiens", "Tailles de contrat fixes"],
                  profil: "Future"
                }
              }
            },
            {
              section: "Les Swaps",
              texte: "Contrats OTC d'échange de flux financiers entre deux parties selon des modalités prédéfinies.",
              details: [
                {
                  type: "Interest Rate Swap",
                  definition: "Échange de taux fixe contre taux variable",
                  utilisation: "Gestion du risque de taux",
                  exemple: "Entreprise paie 5% fixe, reçoit Euribor + 1%. Si Euribor > 4%, elle gagne"
                },
                {
                  type: "Currency Swap",
                  definition: "Échange de flux dans deux devises différentes",
                  utilisation: "Couverture du risque de change",
                  exemple: "Entreprise française emprunte en $ mais génère des revenus en €. Swap pour éliminer le risque de change"
                },
                {
                  type: "Commodity Swap",
                  definition: "Échange de prix fixe contre prix variable d'une matière première",
                  utilisation: "Stabiliser les coûts/revenus",
                  exemple: "Compagnie aérienne fixe le prix du kérosène pour se protéger contre la hausse"
                }
              ]
            }
          ],
          quiz: [
            {
              question: "Qu'est-ce qu'un produit dérivé ?",
              options: [
                "Une action ordinaire",
                "Un instrument dont la valeur dérive d'un actif sous-jacent",
                "Une obligation",
                "Un compte bancaire"
              ],
              correct: 1,
              explication: "Un dérivé est un contrat dont la valeur dépend d'un actif sous-jacent (action, indice, matière première). Ex: une option sur Apple dérive du prix de l'action Apple."
            },
            {
              question: "Quelle est la différence fondamentale entre une option et un forward/future ?",
              options: [
                "Il n'y a pas de différence",
                "L'option donne un droit, le forward/future une obligation",
                "L'option est plus chère",
                "Le forward est standardisé"
              ],
              correct: 1,
              explication: "Une option donne le DROIT (pas l'obligation) d'acheter/vendre. Un forward/future OBLIGE les deux parties à exécuter le contrat à l'échéance."
            },
            {
              question: "Qu'est-ce qu'un call ?",
              options: [
                "Option de vente",
                "Option d'achat",
                "Un appel téléphonique",
                "Une obligation"
              ],
              correct: 1,
              explication: "Un call est une option d'achat : elle donne le droit d'acheter le sous-jacent au prix strike. On achète un call si on anticipe une hausse."
            },
            {
              question: "Vous achetez un call Apple strike 150$ pour 10$. Apple finit à 175$. Apple finit à 175$ à l'échéance. Quel est votre profit ?",
              options: [
                "10$",
                "15$",
                "25$",
                "175$"
              ],
              correct: 1,
              explication: "Valeur intrinsèque = 175 - 150 = 25. Profit = 25 - 10 (prime payée) = 15. Profit = 25 - 10 (prime payée) = 15 par contrat."
            },
            {
              question: "Qu'est-ce que le strike (prix d'exercice) ?",
              options: [
                "Le prix actuel de l'action",
                "Le prix auquel vous pouvez acheter/vendre via l'option",
                "La prime de l'option",
                "Le rendement"
              ],
              correct: 1,
              explication: "Le strike est le prix prédéterminé auquel vous pouvez exercer l'option : acheter (call) ou vendre (put) le sous-jacent."
            },
            {
              question: "Que signifie 'ITM' (In-The-Money) pour un call ?",
              options: [
                "Prix spot < Strike",
                "Prix spot > Strike (l'option a une valeur intrinsèque)",
                "Prix spot = Strike",
                "L'option a expiré"
              ],
              correct: 1,
              explication: "Un call est ITM quand le prix spot dépasse le strike. Ex: call strike 150$ avec Apple à 170$ → ITM de 20$ (valeur intrinsèque = 20$)."
            },
            {
              question: "Qu'est-ce que la valeur temps d'une option ?",
              options: [
                "Le temps restant jusqu'à l'échéance",
                "La partie du prix au-delà de la valeur intrinsèque (potentiel de gain futur)",
                "La valeur totale de l'option",
                "Le strike"
              ],
              correct: 1,
              explication: "Prix Option = Valeur Intrinsèque + Valeur Temps. La valeur temps reflète la probabilité que l'option gagne encore plus de valeur avant l'échéance. À l'échéance, valeur temps = 0."
            },
            {
              question: "Quel paramètre n'est PAS utilisé dans le modèle de Black-Scholes ?",
              options: [
                "Prix spot",
                "Volatilité",
                "Dividend yield (dans la version de base)",
                "Bénéfice de l'entreprise"
              ],
              correct: 3,
              explication: "Black-Scholes utilise: Spot, Strike, Volatilité, Temps, Taux sans risque (+ dividendes dans les extensions). Les bénéfices de l'entreprise n'entrent pas directement dans la formule."
            },
            {
              question: "Pourquoi achèterait-on un put ?",
              options: [
                "Pour parier sur la hausse",
                "Pour se protéger contre une baisse ou parier sur une baisse",
                "C'est obligatoire",
                "Pour recevoir un dividende"
              ],
              correct: 1,
              explication: "On achète un put soit pour spéculer sur une baisse (gagner si ça baisse), soit pour se protéger contre une baisse (assurance). Ex: vous détenez Apple et achetez un put pour limiter vos pertes."
            },
            {
              question: "Qu'est-ce qu'un 'Covered Call' ?",
              options: [
                "Acheter un call",
                "Détenir l'action et vendre un call",
                "Acheter un put",
                "Vendre l'action"
              ],
              correct: 1,
              explication: "Covered Call = vous détenez l'action ET vendez un call OTM. Vous générez un revenu (prime du call) mais plafonné vos gains au strike. Stratégie populaire pour générer du rendement."
            },
            {
              question: "Quelle est la différence entre un forward et un future ?",
              options: [
                "Aucune différence",
                "Forward = OTC sur mesure, Future = standardisé négocié en bourse",
                "Forward est toujours plus cher",
                "Future n'existe pas pour les matières premières"
              ],
              correct: 1,
              explication: "Les forwards sont OTC, personnalisés, avec risque de contrepartie. Les futures sont standardisés, négociés en bourse avec chambre de compensation et appels de marge."
            },
            {
              question: "Quel est le risque maximum pour l'acheteur d'une option ?",
              options: [
                "Illimité",
                "Limité à la prime payée",
                "Le prix spot",
                "Le strike"
              ],
              correct: 1,
              explication: "L'acheteur d'une option ne peut perdre au maximum que la prime qu'il a payée. Même si le sous-jacent s'effondre à 0, sa perte est limitée (contrairement à détenir l'action directement)."
            },
            {
              question: "Qu'est-ce qu'un Interest Rate Swap ?",
              options: [
                "Échange d'actions contre obligations",
                "Échange de flux de taux fixe contre taux variable",
                "Un type d'option",
                "Un ETF"
              ],
              correct: 1,
              explication: "Un Interest Rate Swap permet d'échanger des paiements à taux fixe contre des paiements à taux variable (ou inverse). Utile pour gérer le risque de taux d'intérêt."
            },
            {
              question: "Qu'est-ce qu'une option européenne ?",
              options: [
                "Option négociée uniquement en Europe",
                "Option exerçable uniquement à l'échéance",
                "Option sur l'euro",
                "Option sans valeur"
              ],
              correct: 1,
              explication: "Une option européenne ne peut être exercée qu'à la date d'échéance (pas avant). Une option américaine peut être exercée à tout moment. Le terme n'a rien à voir avec la géographie."
            },
            {
              question: "Si vous vendez (short) un call, quel est votre risque maximum ?",
              options: [
                "Limité à la prime reçue",
                "Illimité (si le sous-jacent monte à l'infini)",
                "Zéro",
                "Le strike"
              ],
              correct: 1,
              explication: "Vendre un call nu (sans détenir le sous-jacent) expose à un risque théoriquement illimité : si le sous-jacent monte à l'infini, vos pertes aussi. C'est pourquoi c'est très risqué !"
            },
            {
              question: "Quelle stratégie utilise-t-on pour générer du revenu sur des actions qu'on détient déjà ?",
              options: [
                "Long Call",
                "Covered Call (vendre des calls)",
                "Long Put",
                "Acheter plus d'actions"
              ],
              correct: 1,
              explication: "Le Covered Call permet de générer un revenu régulier en vendant des calls sur des actions qu'on détient. On encaisse la prime mais on plafonne le gain potentiel au strike."
            },
          ]
        },
        {
          titre: "Module 4 : Les Greeks - Gérer le risque",
          contenu: [
            {
              section: "Pourquoi les Greeks ?",
              texte: "Les Greeks mesurent comment le prix d'une option réagit aux changements de paramètres. C'est essentiel pour gérer le risque et comprendre votre exposition.",
              analogie: "Les Greeks sont comme le tableau de bord d'une voiture : ils vous indiquent votre vitesse (delta), accélération (gamma), consommation (theta), etc."
            },
            {
              section: "Introduction aux sensibilités",
              texte: "Le prix d'une option dépend de 5 paramètres principaux. Chaque Greek mesure la sensibilité à l'un de ces paramètres.",
              points: [
                "**Delta (Δ)** : Sensibilité au prix spot du sous-jacent",
                "**Gamma (Γ)** : Sensibilité du delta (dérivée seconde)",
                "**Vega (ν)** : Sensibilité à la volatilité implicite",
                "**Theta (Θ)** : Sensibilité au passage du temps (érosion)",
                "**Rho (ρ)** : Sensibilité aux taux d'intérêt"
              ]
            },
            {
              section: "Les 5 Greeks principaux",
              greeks: [
                {
                  nom: "Delta (Δ)",
                  definition: "Sensibilité au prix du sous-jacent",
                  interpretation: "Delta = 0.5 → Si l'action monte de 1$, l'option monte de 0.50$",
                  plage: "Call : 0 à 1 | Put : -1 à 0"
                },
                {
                  nom: "Gamma (Γ)",
                  definition: "Variation du delta quand le prix change",
                  interpretation: "Gamma élevé → Delta change rapidement → Plus de risque",
                  astuce: "Maximum pour les options ATM (at-the-money)"
                },
                {
                  nom: "Vega (ν)",
                  definition: "Sensibilité à la volatilité",
                  interpretation: "Vega = 15 → Si volatilité +1%, l'option vaut +15$",
                  astuce: "Toujours positif pour acheteurs d'options"
                },
                {
                  nom: "Theta (Θ)",
                  definition: "Érosion temporelle (perte de valeur chaque jour)",
                  interpretation: "Theta = -0.05 → L'option perd 0.05$ par jour",
                  astuce: "Accélère près de l'échéance"
                },
                {
                  nom: "Rho (ρ)",
                  definition: "Sensibilité aux taux d'intérêt",
                  interpretation: "Généralement peu important sauf options long terme",
                  astuce: "Calls : rho positif | Puts : rho négatif"
                }
              ]
            },
            {
              section: "Delta en détail",
              texte: "Le delta est probablement le Greek le plus important. Il représente la pente de la courbe prix de l'option vs prix spot.",
              points: [
                "**Call ATM** : Delta ≈ 0.50 (50% de chances de finir ITM)",
                "**Call deep ITM** : Delta → 1 (bouge presque comme l'action)",
                "**Call deep OTM** : Delta → 0 (presque aucune chance de finir ITM)",
                "**Put ATM** : Delta ≈ -0.50",
                "**Somme Call + Put même strike** : Delta ≈ -1 (put-call parity)"
              ],
              exemple: "Option call delta 0.7 signifie : probabilité ~70% de finir ITM ET si l'action monte de 1$, l'option monte de 0.70$."
            },
            {
              section: "Gamma : le risque de convexité",
              texte: "Le gamma mesure combien le delta change quand le prix bouge. C'est crucial pour les grandes variations de prix.",
              exemple: "Call ATM avec delta 0.5 et gamma 0.05. Si l'action monte de 10$, le delta devient 0.5 + (0.05×10) = 1.0. L'option est maintenant deep ITM et bouge comme l'action.",
              points: [
                "**Gamma positif (long options)** : Bon pour vous si gros mouvements",
                "**Gamma négatif (short options)** : Dangereux si gros mouvements",
                "**Maximum ATM** : Options at-the-money ont le gamma le plus élevé",
                "**Décroît** : Plus on s'éloigne de ATM, plus gamma diminue"
              ]
            },
            {
              section: "Vega et trading de volatilité",
              texte: "Le vega mesure combien l'option gagne ou perd quand la volatilité implicite change.",
              points: [
                "**Acheteur d'options** : Vega positif (gagne si volatilité monte)",
                "**Vendeur d'options** : Vega négatif (gagne si volatilité baisse)",
                "**Long-dated options** : Vega élevé (plus de temps = plus sensible à vol)",
                "**Options ATM** : Vega maximum"
              ],
              exemple: "Vous achetez un call avec vega 20. La volatilité implicite passe de 25% à 30% (+5 points). Votre option gagne 20 × 5 = 100$.",
              strategie: "Traders sophistiqués tradent la volatilité : acheter quand vol implicite < vol historique, vendre l'inverse"
            },
            {
              section: "Theta : l'ennemi du temps",
              texte: "Chaque jour qui passe, les options perdent de la valeur (valeur temps) car il reste moins de temps pour que le sous-jacent bouge favorablement.",
              points: [
                "**Theta négatif** : Pour acheteurs (vous perdez de l'argent chaque jour)",
                "**Theta positif** : Pour vendeurs (vous gagnez de l'argent chaque jour)",
                "**Accélération** : Theta s'accélère dans les dernières semaines",
                "**Maximum ATM** : Options at-the-money perdent le plus de valeur temps"
              ],
              exemple: "Option ATM à 30 jours : theta = -0.05$/jour. À 5 jours : theta = -0.30$/jour. L'érosion s'accélère dramatiquement.",
              strategie: "Vendre des options = capturer le theta (stratégie income). Acheter des options = parier sur un gros mouvement rapide avant que theta ne vous tue."
            },
            {
              section: "Utiliser les Greeks en pratique",
              strategie: "Delta Hedging",
              texte: "Les traders professionnels utilisent les Greeks pour neutraliser certains risques. Par exemple, si vous vendez des calls (delta négatif), vous achetez des actions (delta positif) pour être delta-neutre.",
              exemple: "Vous vendez 10 calls delta 0.6 → Delta total = -6. Vous achetez 6 actions → Delta net = 0. Vous êtes protégé contre les petits mouvements du marché."
            },
            {
              section: "Delta-Gamma Hedging",
              texte: "Le delta hedging simple ne protège que contre de petits mouvements. Pour les gros mouvements, il faut aussi neutraliser le gamma.",
              etapes: [
                {
                  etape: "Neutraliser le delta",
                  texte: "Acheter/vendre des actions pour avoir delta net = 0"
                },
                {
                  etape: "Neutraliser le gamma",
                  texte: "Acheter/vendre d'autres options pour avoir gamma net = 0",
                  role: "Protection contre les gros mouvements"
                },
                {
                  etape: "Rééquilibrer",
                  texte: "Ajuster quotidiennement (ou plus souvent) car delta et gamma changent"
                }
              ],
              exemple: "Market maker : vend 100 calls delta 0.5, gamma 0.03 → Achète 50 actions (delta neutre) + achète des puts pour neutraliser gamma."
            },
            {
              section: "Position Greeks : vue globale du portefeuille",
              texte: "Les Greeks se somment. Vous pouvez calculer les Greeks totaux de votre portefeuille pour voir votre exposition globale.",
              exemple: "Portefeuille : +10 calls delta 0.6 + 5 puts delta -0.4 - 2 actions delta 1. Delta total = (10×0.6) + (5×-0.4) + (-2×1) = 6 - 2 - 2 = +2. Vous êtes long de 2 deltas = exposition équivalente à détenir 2 actions.",
              points: [
                "**Delta portfolio** : Exposition directionnelle nette",
                "**Gamma portfolio** : Risque de convexité global",
                "**Vega portfolio** : Exposition nette à la volatilité",
                "**Theta portfolio** : Érosion temporelle nette quotidienne"
              ]
            },
            {
              section: "Greeks et stratégies d'options",
              texte: "Chaque stratégie a un profil de Greeks spécifique.",
              strategies: [
                {
                  nom: "Long Straddle (long call + long put même strike)",
                  composition: "Acheter Call ATM + Put ATM",
                  pari: "Gros mouvement (dans un sens ou l'autre)",
                  Greeks: "Delta ≈ 0, Gamma positif élevé, Vega positif, Theta négatif fort"
                },
                {
                  nom: "Short Straddle (short call + short put)",
                  composition: "Vendre Call ATM + Put ATM",
                  pari: "Stabilité, pas de gros mouvement",
                  Greeks: "Delta ≈ 0, Gamma négatif (danger!), Vega négatif, Theta positif (on encaisse)"
                },
                {
                  nom: "Iron Condor",
                  composition: "Vendre call/put proches, acheter call/put éloignés",
                  pari: "Prix reste dans une fourchette",
                  Greeks: "Delta ≈ 0, Gamma négatif (limité), Vega négatif, Theta positif"
                }
              ]
            }
          ],
          quiz: [
            {
              question: "Que mesure le Delta ?",
              options: [
                "La volatilité",
                "La sensibilité du prix de l'option au prix du sous-jacent",
                "Le temps restant",
                "Le taux d'intérêt"
              ],
              correct: 1,
              explication: "Le delta mesure de combien le prix de l'option change quand le prix du sous-jacent change de 1$. Delta 0.5 signifie : spot +1$ → option +0.50$."
            },
            {
              question: "Quelle est la plage de valeurs du delta pour un call ?",
              options: [
                "-1 à 0",
                "0 à 1",
                "0 à 100",
                "Illimité"
              ],
              correct: 1,
              explication: "Le delta d'un call varie de 0 (deep OTM, aucune sensibilité) à 1 (deep ITM, bouge exactement comme le sous-jacent). Un call ATM a généralement un delta autour de 0.50."
            },
            {
              question: "Vous vendez 20 calls avec un delta de 0.4. Combien d'actions devez-vous acheter pour être delta-neutre ?",
              options: [
                "4 actions",
                "8 actions",
                "20 actions",
                "40 actions"
              ],
              correct: 1,
              explication: "Delta des calls vendus = -20 × 0.4 = -8. Pour neutraliser, acheter 8 actions (delta +8). Delta net = -8 + 8 = 0."
            },
            {
              question: "Qu'est-ce que le Gamma ?",
              options: [
                "Le prix de l'option",
                "La variation du delta quand le prix change (dérivée seconde)",
                "La volatilité",
                "Le rendement"
              ],
              correct: 1,
              explication: "Le gamma mesure combien le delta change quand le sous-jacent bouge. Gamma élevé signifie que votre delta (donc votre exposition) change rapidement."
            },
            {
              question: "Pourquoi un gamma élevé est-il risqué pour un vendeur d'options ?",
              options: [
                "Parce qu'il gagne moins",
                "Parce que son delta change rapidement, nécessitant un rehedging constant",
                "Ce n'est pas risqué",
                "Parce que la volatilité baisse"
              ],
              correct: 1,
              explication: "Gamma élevé signifie que le delta change vite. Un vendeur d'option avec gamma négatif doit constamment ajuster sa couverture (acheter/vendre des actions), créant des coûts de transaction et du risque."
            },
            {
              question: "Que mesure le Vega ?",
              options: [
                "Sensibilité au temps",
                "Sensibilité à la volatilité implicite",
                "Sensibilité au prix spot",
                "Sensibilité aux dividendes"
              ],
              correct: 1,
              explication: "Le vega mesure de combien le prix de l'option change si la volatilité implicite change de 1 point de pourcentage. Vega 15 signifie : vol +1% → option +15$."
            },
            {
              question: "Si vous achetez une option, votre vega est :",
              options: [
                "Toujours négatif",
                "Toujours positif (vous gagnez si la volatilité monte)",
                "Peut être positif ou négatif",
                "Toujours zéro"
              ],
              correct: 1,
              explication: "Les acheteurs d'options ont toujours un vega positif : ils bénéficient d'une hausse de la volatilité car l'option vaut plus cher. Les vendeurs ont vega négatif."
            },
            {
              question: "Qu'est-ce que le Theta ?",
              options: [
                "La valeur intrinsèque",
                "L'érosion temporelle (perte de valeur chaque jour)",
                "Le strike",
                "Le delta"
              ],
              correct: 1,
              explication: "Le theta mesure combien l'option perd de valeur chaque jour qui passe (toutes choses égales). Theta = -0.10$ signifie : l'option perd 0.10$ par jour."
            },
            {
              question: "Pour quelle type d'option le theta est-il le plus élevé (en valeur absolue) ?",
              options: [
                "Deep ITM",
                "ATM (at-the-money)",
                "Deep OTM",
                "Toutes ont le même theta"
              ],
              correct: 1,
              explication: "Les options ATM ont le theta le plus élevé car elles ont le plus de valeur temps à perdre. Une option deep ITM n'a presque que de la valeur intrinsèque (peu de valeur temps)."
            },
            {
              question: "Si vous vendez des options, que voulez-vous concernant le theta ?",
              options: [
                "Theta négatif",
                "Theta positif (vous gagnez chaque jour qui passe)",
                "Theta nul",
                "Le theta n'importe pas"
              ],
              correct: 1,
              explication: "Les vendeurs d'options ont theta positif : chaque jour qui passe, les options qu'ils ont vendues perdent de la valeur (ce qui est bon pour eux). C'est la stratégie 'collecter le theta'."
            },
            {
              question: "Quel Greek est généralement le moins important en pratique ?",
              options: [
                "Delta",
                "Gamma",
                "Vega",
                "Rho"
              ],
              correct: 3,
              explication: "Le rho (sensibilité aux taux) est souvent négligeable car les taux d'intérêt changent lentement et l'impact est faible sauf pour les options très long terme (>2 ans)."
            },
            {
              question: "Qu'est-ce que le delta hedging ?",
              options: [
                "Vendre toutes ses options",
                "Ajuster sa position en actions pour neutraliser le delta",
                "Acheter uniquement des calls",
                "Ignorer le delta"
              ],
              correct: 1,
              explication: "Delta hedging consiste à prendre une position opposée dans le sous-jacent pour avoir un delta net de zéro. Position delta-neutre = insensible aux petits mouvements du marché."
            },
            {
              question: "Pourquoi le gamma est-il maximum pour les options ATM ?",
              options: [
                "Par hasard",
                "Parce que c'est là où l'incertitude est maximale (50% de chances ITM/OTM)",
                "Parce que le prix est le plus élevé",
                "Parce que le theta est minimum"
              ],
              correct: 1,
              explication: "ATM = maximum d'incertitude. Un petit mouvement du spot peut faire basculer l'option de OTM à ITM (delta passe de 0.4 à 0.6), d'où un gamma élevé."
            },
            {
              question: "Une option proche de l'échéance a généralement :",
              options: [
                "Theta élevé, gamma élevé (surtout si ATM)",
                "Theta faible, gamma faible",
                "Theta positif",
                "Vega très élevé"
              ],
              correct: 0,
              explication: "Près de l'échéance, theta s'accélère (valeur temps fond rapidement) et gamma explose pour les options ATM (le delta passe de 0 à 1 ou de 1 à 0 très vite)."
            },
            {
              question: "Quel Greek bénéficie le plus de la volatilité implicite élevée ?",
              options: [
                "Delta",
                "Theta",
                "Vega (acheteurs d'options profitent)",
                "Rho"
              ],
              correct: 2,
              explication: "Le vega mesure l'exposition à la volatilité. Les acheteurs d'options (vega positif) profitent quand la volatilité implicite monte car leurs options valent plus cher."
            },
            {
              question: "Si vous êtes delta-neutre, êtes-vous totalement protégé contre tous les mouvements de prix ?",
              options: [
                "Oui, complètement protégé",
                "Non, seulement contre les petits mouvements (gamma et autres Greeks restent)",
                "Oui mais seulement à court terme",
                "La neutralité delta n'existe pas"
              ],
              correct: 1,
              explication: "Delta-neutre protège seulement contre les petits mouvements linéaires. Les gros mouvements vous exposent via le gamma. Vous restez aussi exposé à la volatilité (vega) et au temps (theta)."
            },
          ]
        },
        {
          titre: "Module 5 : Construction des produits structurés",
          contenu: [
            {
              section: "Comment sont construits les produits structurés ?",
              texte: "Un produit structuré combine typiquement deux éléments : une composante obligataire (sécurité) + une composante optionnelle (performance). C'est comme un sandwich : le pain (obligation) + la garniture (options).",
              schema: {
                obligation: {
                  role: "Protéger le capital ou générer un rendement fixe",
                  proportion: "70-90% du capital selon le produit"
                },
                options: {
                  role: "Créer le profil de payoff désiré",
                  proportion: "10-30% du capital"
                }
              }
            },
            {
              section: "Ingénierie financière : les blocs de construction",
              texte: "Les produits structurés utilisent des 'building blocks' standardisés qu'on combine de différentes façons.",
              points: [
                "**Zero-coupon bond** : Protection du capital (acheter à 950€, recevoir 1000€ dans X ans)",
                "**Call options** : Participation à la hausse",
                "**Put options** : Protection contre la baisse ou génération de prime",
                "**Digital options** : Paiements conditionnels (si condition X → payer Y)",
                "**Barrier options** : Activation/désactivation selon niveaux de prix"
              ]
            },
            {
              section: "Exemple : Construction d'un Capital Garanti",
              etapes: [
                {
                  etape: "1. Capital initial",
                  montant: "10 000€",
                  texte: "Montant investi par le client"
                },
                {
                  etape: "2. Obligation zero-coupon",
                  montant: "9 524€ (pour récupérer 10 000€ dans 1 an à 5%)",
                  role: "Garantit le capital",
                  texte: "10 000 / (1.05)¹ = 9 524€"
                },
                {
                  etape: "3. Call options",
                  montant: "476€ (le reste)",
                  role: "Participation à la hausse",
                  texte: "Budget pour acheter des calls sur Apple"
                },
                {
                  etape: "4. Calcul de la participation",
                  texte: "Avec 476€, combien de calls peut-on acheter ?",
                  montant: "Si 1 call ATM coûte 12€ → 476/12 ≈ 40 calls → Participation ≈ 40%"
                },
                {
                  etape: "5. Résultat final",
                  texte: "Capital protégé à 100% + participation de 40% à la hausse d'Apple"
                }
              ],
              exemple: "Si Apple monte de 50%, vous gagnez 40% × 50% = 20%. Si Apple baisse de 30%, vous récupérez vos 10 000€ (0% de perte)."
            },
            {
              section: "Exemple : Construction d'un Reverse Convertible",
              etapes: [
                {
                  etape: "1. Capital initial",
                  montant: "10 000€"
                },
                {
                  etape: "2. Obligation classique",
                  montant: "10 000€ investis en obligation",
                  role: "Base du produit"
                },
                {
                  etape: "3. Vente de put barrière 60%",
                  montant: "Prime encaissée ≈ 500€",
                  role: "Finance le coupon élevé mais crée le risque",
                  texte: "En vendant un put strike 60%, on encaisse une prime qui permet de payer un coupon > marché"
                },
                {
                  etape: "4. Calcul du coupon",
                  texte: "Rendement obligation 4% + Prime put 5% = Coupon total 9%",
                  montant: "Le client reçoit 900€/an au lieu de 400€"
                },
                {
                  etape: "5. Risque",
                  texte: "Si l'action chute sous 60%, le client reçoit des actions dépréciées au lieu du capital",
                  role: "Coupon élevé mais risque de perte en capital si baisse > 40%"
                }
              ]
            },
            {
              section: "Construction d'un Autocall",
              texte: "L'autocall est plus complexe car il utilise des observations périodiques et des digitales.",
              etapes: [
                {
                  etape: "1. Obligation zero-coupon",
                  montant: "≈ 9 200€ (selon maturité et taux)",
                  role: "Protège une partie du capital"
                },
                {
                  etape: "2. Digital options (coupons)",
                  montant: "≈ 400€",
                  role: "Paiement de 8% si spot > 70% à chaque observation",
                  texte: "Options digitales : si condition remplie → payer coupon, sinon 0"
                },
                {
                  etape: "3. Barrier call (autocall)",
                  montant: "≈ 300€",
                  role: "Remboursement automatique si spot > 100%",
                  texte: "Option knock-out : si barrière touchée → payer 100% + coupons et terminer"
                },
                {
                  etape: "4. Put down-and-in",
                  montant: "≈ 100€",
                  role: "Risque de perte si touche barrière basse",
                  texte: "Put qui s'active seulement si le spot touche 60%"
                }
              ]
            },
            {
              section: "Les paramètres clés à comprendre",
              parametres: [
                {
                  nom: "Barrière",
                  definition: "Niveau de prix qui déclenche ou annule certains paiements",
                  impact: "Plus la barrière est basse, plus vous êtes protégé"
                },
                {
                  nom: "Participation",
                  definition: "% de la performance que vous captez",
                  impact: "Participation 80% → Vous gagnez 80% de la hausse"
                },
                {
                  nom: "Coupon",
                  definition: "Paiement périodique fixe",
                  impact: "Coupon élevé souvent = risque plus élevé"
                },
                {
                  nom: "Maturité",
                  definition: "Durée de vie du produit",
                  impact: "Plus long = plus d'incertitude mais plus de potentiel"
                }
              ]
            },
            {
              section: "Trade-offs dans la construction",
              texte: "Lors de la structuration, il y a toujours des arbitrages à faire entre protection, participation et rendement.",
              points: [
                "**Plus de protection → Moins de participation** : Capital garanti 100% limite le budget pour les options",
                "**Coupon élevé → Plus de risque** : Il faut vendre des puts pour financer les coupons",
                "**Barrière basse → Coupon plus faible** : Moins de risque = moins de rendement",
                "**Maturité longue → Meilleure participation** : Plus de temps pour que l'obligation arrive à maturité = plus de budget options"
              ],
              exemple: "Capital garanti 5 ans vs 3 ans sur Apple : maturité 5 ans permet participation 80%, maturité 3 ans seulement 50% (car l'obligation doit croître plus vite → moins de budget pour options)."
            },
            {
              section: "Pricing et Fair Value",
              texte: "Comment savoir si un produit structuré est à un prix juste ?",
              etapes: [
                {
                  etape: "1. Décomposer le produit",
                  texte: "Identifier chaque composante (obligation + options)"
                },
                {
                  etape: "2. Pricer chaque élément",
                  texte: "Obligation : actualisation. Options : Black-Scholes ou Monte Carlo"
                },
                {
                  etape: "3. Sommer les valeurs",
                  texte: "Fair Value = Σ (valeurs des composantes)"
                },
                {
                  etape: "4. Comparer au prix proposé",
                  texte: "Spread = Prix vendu - Fair Value. Typique : 1-3% de spread"
                }
              ],
              exemple: "Capital Garanti 10 000€ : ZC bond vaut 9 500€, calls valent 300€. Fair value = 9 800€. Vendu à 10 000€ → Spread de 200€ (2%)."
            },
            {
              section: "Risques spécifiques aux produits structurés",
              texte: "Au-delà des risques de marché classiques, les produits structurés ont des risques additionnels.",
              details: [
                {
                  type: "Risque de contrepartie",
                  definition: "Risque que l'émetteur fasse défaut",
                  utilisation: "Vérifier le rating de l'émetteur",
                  exemple: "Si la banque émettrice fait faillite, vous pouvez perdre votre capital même sur un produit 'garanti'"
                },
                {
                  type: "Risque de liquidité",
                  definition: "Difficulté de revendre avant l'échéance",
                  utilisation: "Marché secondaire peu liquide, décotes importantes",
                  exemple: "Produit à 10 000€, si vous voulez sortir après 6 mois, rachat possible à 8 500€ seulement"
                },
                {
                  type: "Risque de complexité",
                  definition: "Ne pas comprendre exactement ce qu'on achète",
                  utilisation: "Lire attentivement le termsheet, simuler différents scénarios",
                  exemple: "Autocall avec barrière descendante + coupon conditionnel + protection partielle → très complexe"
                },
                {
                  type: "Risque de modèle",
                  definition: "Le modèle de pricing peut être incorrect",
                  utilisation: "Black-Scholes a des hypothèses simplificatrices",
                  exemple: "Si un krach survient (saut brutal), Black-Scholes sous-estime le risque"
                }
              ]
            },
            {
              section: "Optimisation de produits",
              texte: "Comment créer le meilleur produit pour un profil donné ?",
              points: [
              "Définir les objectifs : Rendement cible (ex: 8%/an), risque maximum acceptable (ex: max 20% de perte)",
              "Contraintes : Budget, horizon (3 ans), fiscalité",
              "Optimisation mathématique : Maximiser rendement sous contrainte de risque",
              "Backtesting : Simuler la performance sur données historiques",
              "Stress testing : Tester sur scénarios extrêmes (krach 2008, covid 2020)"
              ]
            },
            {
              section: "Le rôle de la volatilité dans le pricing",
              texte: "La volatilité est LE paramètre clé influençant le prix des options et donc la structure des produits.",
              exemple: "Même produit sur Apple : Volatilité 20% → Participation 90%. Volatilité 40% → Participation 60%. Plus la volatilité est élevée, plus les options coûtent cher, réduisant le budget disponible.",
              points: [
              "Vol basse : Options cheap → Meilleure participation",
              "Vol haute : Options chères → Participation réduite OU coupons plus faibles",
              "Vol implicite vs réalisée : Si vol implicite trop haute par rapport à la vol réalisée future, le produit est cher"
                        ]
            }
          ],
          quiz: [
            {
              question: "Quels sont les deux composantes principales d'un produit structuré ?",
              options: [
                "Actions et devises",
                "Obligation (sécurité) et Options (performance)",
                "Cash et immobilier",
                "Uniquement des obligations"
              ],
              correct: 1,
              explication: "Un produit structuré typique combine une obligation (pour protéger/générer du rendement fixe) et des options (pour créer le profil de performance désiré)."
            },
            {
              question: "Dans un Capital Garanti sur 5 ans, pourquoi utilise-t-on une obligation zero-coupon ?",
              options: [
                "Parce que c'est obligatoire par la loi",
                "Pour garantir le remboursement du capital à l'échéance",
                "Pour payer des coupons",
                "Pour augmenter le risque"
              ],
              correct: 1,
              explication: "On achète une obligation zero-coupon à prix décoté qui vaudra exactement le nominal à l'échéance, garantissant ainsi le capital. Le reste du budget sert à acheter des options."
            },
            {
              question: "Si vous avez 10 000€ et que vous devez garantir 100% dans 5 ans avec un taux de 6%, combien investissez-vous en obligation ?",
              options: [
                "10 000€",
                "7 473€",
                "5 000€",
                "9 000€"
              ],
              correct: 1,
              explication: "10 000 / (1.06)⁵ = 10 000 / 1.338 = 7 473€. Il vous reste donc 2 527€ pour acheter des options et créer la participation."
            },
            {
              question: "Pourquoi un Reverse Convertible paie-t-il un coupon élevé (8-12%) ?",
              options: [
                "Par générosité de la banque",
                "Pour compenser le risque de recevoir des actions dépréciées",
                "Parce que c'est sans risque",
                "Pour attirer les clients naïfs"
              ],
              correct: 1,
              explication: "Le coupon élevé compense le risque : si le sous-jacent chute fortement sous la barrière, vous recevez des actions ayant perdu de la valeur au lieu de votre capital."
            },
            {
              question: "Comment finance-t-on le coupon élevé d'un Reverse Convertible ?",
              options: [
                "Par magie",
                "En vendant un put (encaisser la prime)",
                "En achetant des calls",
                "Avec les frais bancaires"
              ],
              correct: 1,
              explication: "En vendant un put down-and-in (barrière basse), on encaisse une prime importante qui finance le coupon élevé. Mais on prend le risque de devoir acheter l'action si elle chute."
            },
            {
              question: "Qu'est-ce qu'une barrière autocall ?",
              options: [
                "Le prix d'achat",
                "Le niveau qui déclenche le remboursement anticipé automatique",
                "Le coupon minimum",
                "La volatilité"
              ],
              correct: 1,
              explication: "Si le sous-jacent atteint ou dépasse la barrière autocall à une date d'observation, le produit se rembourse automatiquement : capital + tous les coupons (payés et à venir)."
            },
            {
              question: "Pourquoi une volatilité implicite élevée réduit-elle la participation dans un Capital Garanti ?",
              options: [
                "Ce n'est pas vrai",
                "Parce que les options coûtent plus cher (moins de budget pour en acheter)",
                "Parce que le taux sans risque monte",
                "Parce que l'obligation vaut moins"
              ],
              correct: 1,
              explication: "Volatilité élevée → Options chères. Avec le même budget options (ex: 2 000€), on peut acheter moins de calls, donc participation plus faible. Vol 20% → 90% participation. Vol 40% → 50% participation."
            },
            {
              question: "Qu'est-ce qu'une option digitale (binary) ?",
              options: [
                "Une option sur la crypto",
                "Une option payant un montant fixe si condition remplie, 0 sinon",
                "Une option sur ordinateur",
                "Une option call normale"
              ],
              correct: 1,
              explication: "Option digitale = paiement tout-ou-rien. Ex: 'si Apple > 160$ à l'échéance → 1000, sinon 0, sinon0'. Utilisée dans les autocalls pour les coupons conditionnels."
            },
            {
              question: "Dans un Autocall, qu'est-ce qu'un 'coupon mémoire' ?",
              options: [
                "Un coupon qui se souvient du passé",
                "Si le coupon n'est pas payé, il s'accumule pour être payé plus tard si conditions remplies",
                "Un coupon garanti",
                "Un coupon variable"
              ],
              correct: 1,
              explication: "Avec effet mémoire : si le coupon n'est pas payé au trimestre 1 (condition non remplie), il s'accumule. Si au trimestre 3 la condition est remplie, vous recevez les 3 coupons."
            },
            {
              question: "Quel est le spread typique (marge de la banque) sur un produit structuré ?",
              options: [
                "0.1-0.5%",
                "1-3%",
                "10-15%",
                "50%"
              ],
              correct: 1,
              explication: "Les banques prélèvent généralement 1-3% de spread (différence entre fair value et prix de vente). Sur 10 000€, cela représente 100-300€ de marge."
            },
            {
              question: "Qu'est-ce qu'une obligation zero-coupon ?",
              options: [
                "Une obligation qui ne paie rien",
                "Une obligation sans coupons périodiques, achetée à prix décoté et remboursée au pair",
                "Une obligation gratuite",
                "Une obligation à 0% de rendement"
              ],
              correct: 1,
              explication: "Une ZC bond ne verse pas d'intérêts périodiques. Vous l'achetez avec une décote (ex: 750€) et recevez le nominal (1000€) à l'échéance. Le rendement vient de la différence."
            },
            {
              question: "Dans un Capital Garanti, si la maturité passe de 3 à 5 ans (taux 5%), que se passe-t-il ?",
              options: [
                "La participation diminue",
                "La participation augmente (plus de budget pour les options)",
                "Aucun changement",
                "Le produit devient risqué"
              ],
              correct: 1,
              explication: "Maturité 3 ans : ZC bond = 10 000/(1.05)³ = 8 638€ → Budget options 1 362€. Maturité 5 ans : ZC = 7 835€ → Budget 2 165€. Plus de budget = meilleure participation !"
            },
            {
              question: "Qu'est-ce qu'un put down-and-in ?",
              options: [
                "Un call classique",
                "Un put qui s'active seulement si le sous-jacent touche une barrière basse",
                "Un put normal",
                "Une obligation"
              ],
              correct: 1,
              explication: "Le put down-and-in ne s'active que si le sous-jacent touche la barrière basse pendant la vie du produit. Moins cher qu'un put vanilla car il peut ne jamais s'activer."
            },
            {
              question: "Dans un Autocall, pourquoi la barrière autocall peut-elle être descendante (100%, 95%, 90%...) ?",
              options: [
                "C'est une erreur",
                "Pour augmenter les chances de remboursement anticipé au fil du temps",
                "Pour diminuer le coupon",
                "Par obligation légale"
              ],
              correct: 1,
              explication: "Une barrière descendante rend le remboursement de plus en plus facile à déclencher : si l'action stagne ou baisse légèrement, elle finira par toucher une barrière et rembourser le produit."
            },
            {
              question: "Quel est l'avantage principal des options barrier vs options vanilla ?",
              options: [
                "Elles sont plus complexes",
                "Elles coûtent moins cher (knock-out peut disparaître)",
                "Elles rapportent toujours plus",
                "Elles n'ont aucun avantage"
              ],
              correct: 1,
              explication: "Les options à barrière sont moins chères car elles comportent une condition supplémentaire (peuvent disparaître ou ne jamais s'activer). On les utilise pour réduire les coûts dans les produits structurés."
            },
            {
              question: "Qu'est-ce que le 'funding level' dans un warrant à levier ?",
              options: [
                "Le prix d'achat",
                "Le niveau de financement (emprunt) intégré créant le levier",
                "Le strike",
                "Le coupon"
              ],
              correct: 1,
              explication: "Le funding level représente la dette intégrée dans le warrant. La différence entre spot et funding level crée l'effet de levier. Plus le funding est proche du spot, plus le levier est élevé."
            }
          ]
        }
      ]
    },
    avance: {
      title: "Niveau Avancé",
      subtitle: "Modélisation, pricing et stratégies avancées",
      icon: "🎓",
      modules: [
        {
          titre: "Module 1 : Modèles de pricing avancés",
          contenu: [
            {
              section: "Au-delà de Black-Scholes",
              texte: "Le modèle de Black-Scholes pose des hypothèses simplificatrices : volatilité constante, pas de sauts, distribution log-normale. Dans la réalité, ces hypothèses sont violées. D'où le besoin de modèles plus sophistiqués.",
              limites: [
                "**Volatilité smile** : La volatilité implicite varie selon le strike",
                "**Queues épaisses** : Les crashs sont plus fréquents que prédit par la loi normale",
                "**Volatilité stochastique** : La volatilité elle-même varie de façon aléatoire"
              ]
            },
            {
              section: "Modèle de Heston (volatilité stochastique)",
              texte: "Le modèle de Heston assume que la volatilité suit elle-même un processus stochastique. C'est plus réaliste car la volatilité n'est pas constante.",
              formules: [
                "dS = μS dt + √(v) S dW₁",
                "dv = κ(θ - v) dt + σ √(v) dW₂"
              ],
              parametres: [
                "v : variance instantanée",
                "κ : vitesse de retour à la moyenne",
                "θ : variance long terme",
                "σ : volatilité de la volatilité",
                "ρ : corrélation entre S et v"
              ]
            },
            {
              section: "Simulations Monte Carlo",
              texte: "Méthode numérique qui simule des milliers de scénarios possibles pour estimer la valeur d'un produit complexe. Particulièrement utile pour les produits path-dependent.",
              algorithme: [
                "1. Générer N trajectoires aléatoires du sous-jacent",
                "2. Pour chaque trajectoire, calculer le payoff final",
                "3. Faire la moyenne des payoffs",
                "4. Actualiser au taux sans risque",
                "5. C'est votre prix !"
              ],
              exemple: "Pour un autocall, on simule 100 000 trajectoires. Pour chaque trajectoire, on vérifie si l'autocall se déclenche, sinon on calcule le payoff à maturité. Prix = moyenne actualisée."
            },
            {
              section: "Arbres binomiaux",
              texte: "Méthode discrète qui modélise l'évolution du prix comme une succession de mouvements up/down. Utile pour les options américaines (exercice anticipé possible).",
              avantages: [
                "Simple à comprendre et implémenter",
                "Gère naturellement l'exercice anticipé",
                "Converge vers Black-Scholes quand on augmente le nombre de pas"
              ]
            }
          ]
        },
        {
          titre: "Module 2 : Gestion du risque avancée",
          contenu: [
            {
              section: "Value-at-Risk (VaR)",
              texte: "La VaR mesure la perte maximale potentielle sur un horizon donné avec un niveau de confiance donné. C'est LA métrique de risque en finance.",
              definition: "VaR(95%, 1 jour) = 100 000€ signifie : Il y a 5% de chances de perdre plus de 100 000€ demain",
              methodes: [
                "**Méthode paramétrique** : Assume normalité, utilise moyenne et écart-type",
                "**Simulation historique** : Utilise les rendements passés",
                "**Monte Carlo** : Simule l'avenir avec des modèles stochastiques"
              ]
            },
            {
              section: "Expected Shortfall (ES / CVaR)",
              texte: "L'ES va plus loin que la VaR : elle mesure la perte moyenne SI vous dépassez la VaR. C'est important car la VaR ne dit rien sur l'ampleur des pertes extrêmes.",
              exemple: "VaR = -100k, mais si ça arrive, vous perdez en moyenne 150k (ES = -150k)"
            },
            {
              section: "Hedging dynamique",
              texte: "Le hedging dynamique consiste à ajuster continuellement votre portefeuille pour maintenir une exposition neutre. C'est ce que font les market makers.",
              strategie: {
                nom: "Delta-Gamma Hedging",
                principe: "Neutraliser à la fois le delta (risque directionnel) et le gamma (risque de convexité)",
                instruments: "Actions (pour le delta) + Options (pour le gamma)",
                frequence: "Rééquilibrage quotidien ou intraday selon la volatilité"
              }
            },
            {
              section: "Stress Testing",
              texte: "Le stress testing consiste à évaluer comment votre portefeuille réagirait à des scénarios extrêmes (krach, crise de liquidité, hausse violente des taux).",
              scenarios: [
                "**Krach 2008** : Baisse de 50% des marchés actions",
                "**Hausse des taux** : +300 points de base",
                "**Volatilité extrême** : Doublement de la volatilité implicite",
                "**Crise de liquidité** : Spreads bid-ask × 10"
              ]
            }
          ]
        },
        {
          titre: "Module 3 : Volatilité implicite et smile",
          contenu: [
            {
              section: "Le Volatility Smile",
              texte: "En théorie Black-Scholes, la volatilité devrait être constante pour tous les strikes. En pratique, on observe un 'smile' ou 'skew' : la volatilité implicite varie avec le strike.",
              formes: [
                "**Smile** : Volatilité plus élevée pour les options ITM et OTM (forme de U)",
                "**Skew** : Volatilité décroissante avec le strike (marchés actions)",
                "**Smirk** : Mix des deux"
              ]
            },
            {
              section: "Pourquoi le smile existe ?",
              raisons: [
                "**Peur des crashs** : Les investisseurs paient plus cher pour se protéger contre les baisses",
                "**Queues épaisses** : Les événements extrêmes sont plus fréquents que la loi normale ne le prédit",
                "**Offre et demande** : Forte demande pour les puts OTM (protection)",
                "**Sauts de prix** : Les marchés ne bougent pas de façon continue"
              ]
            },
            {
              section: "Trading la volatilité",
              texte: "Les traders sophistiqués ne tradent pas seulement la direction (hausse/baisse) mais aussi la volatilité elle-même.",
              strategies: [
                {
                  nom: "Long Straddle",
                  composition: "Acheter Call + Put au même strike ATM",
                  pari: "Grosse variation de prix (dans un sens ou l'autre)",
                  Greeks: "Delta neutre, Vega positif, Gamma positif, Theta négatif"
                },
                {
                  nom: "Iron Condor",
                  composition: "Vendre Call + Put proches, acheter Call + Put éloignés",
                  pari: "Prix reste dans une fourchette",
                  Greeks: "Delta neutre, Vega négatif, Theta positif"
                },
                {
                  nom: "Volatility Arbitrage",
                  composition: "Acheter volatilité implicite sous-évaluée, vendre sur-évaluée",
                  pari: "Retour à la moyenne de la volatilité",
                  risque: "Nécessite hedging dynamique constant"
                }
              ]
            },
            {
              section: "La surface de volatilité",
              texte: "La surface de volatilité représente la volatilité implicite en fonction du strike ET de la maturité. C'est un objet 3D que les traders observent constamment.",
              dimensions: [
                "**Axe X** : Strike (moneyness)",
                "**Axe Y** : Maturité",
                "**Axe Z** : Volatilité implicite"
              ],
              utilisation: "Identifier les arbitrages, pricer les exotiques, gérer le risque de volatilité"
            }
          ]
        },
        {
          titre: "Module 4 : Produits exotiques",
          contenu: [
            {
              section: "Options à barrière",
              texte: "Les options à barrière s'activent ou se désactivent si le sous-jacent touche un certain niveau. Elles sont moins chères que les vanilles.",
              types: [
                {
                  nom: "Knock-Out",
                  description: "Option qui disparaît si la barrière est touchée",
                  exemple: "Call knock-out barrière 200$ sur Apple à 150$. Si Apple touche 200$, l'option meurt immédiatement (même si c'est rentable)"
                },
                {
                  nom: "Knock-In",
                  description: "Option qui s'active seulement si la barrière est touchée",
                  exemple: "Put knock-in barrière 100$. L'option n'existe que si Apple tombe sous 100$"
                },
                {
                  nom: "Down-and-Out Put",
                  description: "Put qui disparaît si on touche une barrière basse",
                  utilisation: "Protection partielle moins chère"
                }
              ]
            },
            {
              section: "Options digitales (Binary)",
              texte: "Payoff tout-ou-rien. Si la condition est remplie → paiement fixe, sinon → 0.",
              exemple: "Digitale 'Apple > 160$ à maturité' qui paie 1000$. Si Apple = 161$, vous gagnez 1000$. Si Apple = 159$, vous gagnez 0$.",
              risque: "Gamma explosif près de la barrière à l'échéance"
            },
            {
              section: "Options asiatiques",
              texte: "Le payoff dépend du prix MOYEN sur la période, pas seulement du prix final. Moins volatiles donc moins chères.",
              formule: "Payoff = Max(0, Prix_Moyen - Strike)",
              avantage: "Moins sensible aux manipulations de prix à l'échéance"
            },
            {
              section: "Options lookback",
              texte: "Le payoff dépend du prix maximum ou minimum atteint pendant la vie de l'option.",
              exemple: "Lookback Call : Payoff = Prix_Max - Strike. Vous êtes sûr d'avoir le meilleur prix !",
              cout: "Très chères car elles offrent le timing parfait"
            },
            {
              section: "Rainbow Options",
              texte: "Options sur plusieurs sous-jacents. Le payoff dépend du meilleur (best-of) ou du pire (worst-of).",
              utilisation: "Diversification, corrélation entre actifs"
            }
          ]
        },
        {
          titre: "Module 5 : Structuration avancée de produits",
          contenu: [
            {
              section: "Ingénierie financière",
              texte: "L'ingénierie financière consiste à décomposer et recombiner des produits financiers pour créer de nouveaux payoffs. C'est comme des LEGOs financiers.",
              principes: [
                "**Put-Call Parity** : Call - Put = Spot - PV(Strike)",
                "**Réplication statique** : Reproduire un payoff avec un portefeuille fixe",
                "**Réplication dynamique** : Ajuster continuellement pour reproduire un payoff"
              ]
            },
            {
              section: "Structuration d'un Phoenix/Autocall complexe",
              caracteristiques: [
                "**Observation trimestrielle** : Vérification tous les 3 mois",
                "**Barrière autocall descendante** : 100%, 95%, 90%, 85%... (plus facile à déclencher avec le temps)",
                "**Coupon mémoire** : Si le coupon n'est pas payé, il s'accumule",
                "**Barrière de protection conditionnelle** : Protection uniquement à certaines dates"
              ],
              construction: [
                "1. Obligation zero-coupon pour garantir une partie du capital",
                "2. Digitales pour les coupons conditionnels",
                "3. Options barrière pour l'autocall",
                "4. Put down-and-in pour le risque de perte"
              ]
            },
            {
              section: "Optimisation de produits",
              texte: "Comment créer le meilleur produit pour un profil client donné ?",
              etapes: [
                "**1. Définir les objectifs** : Rendement cible, risque maximum acceptable",
                "**2. Contraintes** : Budget, horizon, fiscalité",
                "**3. Optimisation** : Utiliser des modèles pour maximiser rendement/risque",
                "**4. Backtesting** : Tester sur données historiques",
                "**5. Stress testing** : Vérifier la robustesse"
              ]
            },
            {
              section: "Pricing et couverture en pratique",
              texte: "Dans le monde réel, pricer et couvrir un produit structuré est complexe.",
              defis: [
                "**Spreads bid-ask** : Coûts de transaction importants",
                "**Illiquidité** : Certains strikes/maturités peu liquides",
                "**Risque de modèle** : Votre modèle est-il correct ?",
                "**Risque de contrepartie** : Et si l'émetteur fait faillite ?",
                "**Coûts de financement** : Le coût d'emprunter pour hedger"
              ]
            },
            {
              section: "Réglementation et compliance",
              texte: "Les produits structurés sont fortement régulés pour protéger les investisseurs.",
              regulations: [
                "**MiFID II** (Europe) : Transparence, appropriateness, best execution",
                "**PRIIPs** : Document d'information clé obligatoire",
                "**Dodd-Frank** (USA) : Réglementation des dérivés OTC",
                "**EMIR** : Reporting des transactions"
              ],
              obligations: [
                "Tester l'adéquation du produit au profil client",
                "Fournir des informations claires sur les risques",
                "Calculer et afficher les coûts",
                "Monitorer les risques en continu"
              ]
            }
          ]
        },
        {
          titre: "Module 6 : Stratégies de trading avancées",
          contenu: [
            {
              section: "Market Making",
              texte: "Les market makers fournissent de la liquidité en cotant en permanence des prix bid et ask. Ils gagnent sur le spread mais prennent un risque d'inventaire.",
              principes: [
                "Rester delta-neutre via hedging dynamique",
                "Gérer l'inventaire pour éviter une exposition directionnelle",
                "Ajuster les spreads selon la volatilité et le risque",
                "Utiliser des algorithmes pour automatiser"
              ]
            },
            {
              section: "Arbitrage statistique",
              texte: "Exploiter les déviations temporaires de relations statistiques entre actifs.",
              exemples: [
                {
                  nom: "Pairs Trading",
                  principe: "Acheter l'actif sous-évalué, vendre le sur-évalué dans une paire corrélée",
                  exemple: "Coca vs Pepsi, Air France vs Lufthansa"
                },
                {
                  nom: "Volatility Arbitrage",
                  principe: "Acheter volatilité implicite cheap, vendre volatilité réalisée",
                  execution: "Delta-hedge daily pour isoler la volatilité"
                },
                {
                  nom: "Convertible Arbitrage",
                  principe: "Acheter obligation convertible sous-évaluée, shorter l'action",
                  profit: "Sur la convexité et la volatilité"
                }
              ]
            },
            {
              section: "Utilisation de Machine Learning",
              texte: "Le ML est de plus en plus utilisé en finance quantitative pour prédire les prix, optimiser les stratégies, détecter des patterns.",
              applications: [
                "**Prédiction de volatilité** : LSTM, GRU pour séries temporelles",
                "**Pricing d'options** : Neural networks pour approximer Black-Scholes",
                "**Détection d'arbitrage** : Reinforcement learning",
                "**Risk management** : Classification des scénarios de crise"
              ],
              attention: "Overfitting, regime change, non-stationnarité des marchés"
            }
          ]
        }
      ]
    }
  }

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

    // Fonction pour sélectionner une réponse
  const handleQuizAnswer = (level, moduleIdx, questionIdx, optionIdx) => {
    const key = `${level}-${moduleIdx}`;
    setQuizAnswers(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [questionIdx]: optionIdx
      }
    }));
  };

  // Fonction pour soumettre le quiz (MODIFIÉE avec Supabase)
  const submitQuiz = async (level, moduleIdx) => {
    const key = `${level}-${moduleIdx}`;
    const module = cours[level].modules[moduleIdx];
    const userAnswers = quizAnswers[key] || {};
    
    // Calculer le score
    let correct = 0;
    module.quiz.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct) {
        correct++;
      }
    });
    
    const score = Math.min(correct, module.quiz.length);
    
    // Sauvegarder le score localement
    setQuizScores(prev => ({
      ...prev,
      [key]: { score, correct, total: module.quiz.length }
    }));
    
    setQuizSubmitted(prev => ({
      ...prev,
      [key]: true
    }));

    // 🆕 SAUVEGARDER DANS SUPABASE
    if (user?.id) {
      try {
        await saveQuizScore(user.id, level, moduleIdx, score, module.quiz.length);
        console.log('✅ Score sauvegardé dans Supabase');
      } catch (error) {
        console.error('❌ Erreur sauvegarde quiz:', error);
        // Ne pas bloquer l'UX même si la sauvegarde échoue
      }
    }

    // Valider le module si score >= 13/16
    if (score >= 13) {
      toggleModuleCompletion(level, moduleIdx);
      
      // ✅ FERMER LE MODULE AUTOMATIQUEMENT après 10 secondes
      setTimeout(() => {
        setOpenModules(prev => ({
          ...prev,
          [key]: false
        }));
      }, 10000);
    }
  };

  // Fonction pour recommencer le quiz
  const resetQuiz = (level, moduleIdx) => {
    const key = `${level}-${moduleIdx}`;
    setQuizAnswers(prev => ({ ...prev, [key]: {} }));
    setQuizSubmitted(prev => ({ ...prev, [key]: false }));
  };

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
            onClick={() => setActiveTab('cours')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'cours'
                ? 'bg-gradient-metron shadow-neon-purple text-white'
                : 'glass-card text-gray-400 hover:text-white border border-white/10'
            }`}
            aria-label="Onglet Cours"
          >
            📖 Cours
          </button>
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
            📋 Glossaire
          </button>
        </div>

        {/* Cours */}
        {activeTab === 'cours' && (
          <div>
            {/* 🆕 Bouton Quiz d'auto-évaluation */}
    <div className="text-center mb-8">
      <button
        onClick={() => setShowLevelQuiz(true)}
        className="btn-neon px-8 py-4"
      >
        🎯 Quel niveau j'ai ?
      </button>
      <p className="text-gray-500 text-sm mt-2">
        Quiz rapide de 5 questions pour évaluer votre niveau
      </p>
    </div>
            {/* Sélection du niveau */}
            <div className="glass-card p-6 mb-8 border border-metron-purple/30">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                Choisissez votre niveau
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(cours).map(([key, level]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedLevel(key)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      selectedLevel === key
                        ? 'border-metron-purple bg-metron-purple/20 shadow-neon-purple'
                        : 'border-white/10 hover:border-metron-purple/50'
                    }`}
                  >
                    <div className="text-5xl mb-3">{level.icon}</div>
                    <h3 className="font-bold text-white mb-2 text-lg">{level.title}</h3>
                    <p className="text-xs text-gray-400">{level.subtitle}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Contenu du cours */}
            {cours[selectedLevel] && (
              <div className="space-y-6">
                {cours[selectedLevel].modules.map((module, moduleIdx) => {
                  const moduleKey = `${selectedLevel}-${moduleIdx}`;
                  const isOpen = openModules[moduleKey] === true; // Fermé par défaut
                  const isFullyCompleted = isModuleFullyCompleted(selectedLevel, moduleIdx);
                  
                  return (
                    <div key={moduleIdx} className="glass-card border border-metron-blue/30 overflow-hidden">
                      {/* En-tête du module (toujours visible) */}
                      <div 
                        className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-all"
                        onClick={() => toggleModule(selectedLevel, moduleIdx)}
                      >
                        <div className="flex items-center gap-4">
                          <button
                            className="text-2xl transition-transform"
                            style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                          >
                            ▶
                          </button>
                          <h2 className="text-3xl font-bold text-white">
                            {module.titre}
                          </h2>
                          {isFullyCompleted && (
                            <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-sm font-semibold">
                              ✓ Validé
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Empêche de fermer le module quand on clique sur l'étoile
                            toggleModuleCompletion(selectedLevel, moduleIdx);
                          }}
                          className="text-3xl transition-transform hover:scale-110"
                          title="Marquer le module comme terminé"
                        >
                          {isModuleCompleted(selectedLevel, moduleIdx) ? "⭐" : "☆"}
                        </button>
                      </div>
                      
                      {/* Contenu du module (collapsible) */}
                      {isOpen && (
                        <div className="p-8 pt-0">
                          {module.contenu.map((section, sectionIdx) => (
                            <div key={sectionIdx} className="mb-8">
                              <h3 className="text-2xl font-bold text-metron-purple mb-4">
                                {section.section}
                              </h3>
                              
                              {section.texte && (
                                <p className="text-gray-300 mb-4 leading-relaxed">{section.texte}</p>
                              )}
                              
                              {section.points && (
                                <ul className="space-y-2 mb-4">
                                  {section.points.map((point, idx) => (
                                    <li key={idx} className="flex gap-3 text-gray-300">
                                      <span className="text-metron-purple mt-1">•</span>
                                      <span dangerouslySetInnerHTML={{ __html: point }} />
                                    </li>
                                  ))}
                                </ul>
                              )}
                              
                              {section.exemple && (
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                                  <p className="text-sm font-semibold text-blue-400 mb-2">💡 Exemple</p>
                                  <p className="text-gray-300 text-sm">{section.exemple}</p>
                                </div>
                              )}
                              
                              {section.formule && (
                                <div className="bg-metron-purple/10 border border-metron-purple/30 rounded-lg p-4 mb-4">
                                  <p className="font-mono text-metron-purple">{section.formule}</p>
                                </div>
                              )}
                              
                              {section.analogie && (
                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                                  <p className="text-sm font-semibold text-green-400 mb-2">🔍 Analogie</p>
                                  <p className="text-gray-300 text-sm">{section.analogie}</p>
                                </div>
                              )}
                              
                              {section.citation && (
                                <div className="border-l-4 border-metron-purple pl-4 italic text-gray-400 mb-4">
                                  {section.citation}
                                </div>
                              )}
                              
                              {section.comparaison && (
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                    <h4 className="font-bold text-green-400 mb-2">Actions</h4>
                                    <p className="text-xs text-gray-400 mb-2">Avantages :</p>
                                    <ul className="space-y-1 mb-3">
                                      {section.comparaison.actions.avantages.map((a, i) => (
                                        <li key={i} className="text-sm text-gray-300">✓ {a}</li>
                                      ))}
                                    </ul>
                                    <p className="text-xs text-gray-400 mb-2">Inconvénients :</p>
                                    <ul className="space-y-1 mb-3">
                                      {section.comparaison.actions.inconvenients.map((a, i) => (
                                        <li key={i} className="text-sm text-gray-300">✗ {a}</li>
                                      ))}
                                    </ul>
                                    <p className="text-xs text-blue-300 italic">{section.comparaison.actions.profil}</p>
                                  </div>
                                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                    <h4 className="font-bold text-blue-400 mb-2">Obligations</h4>
                                    <p className="text-xs text-gray-400 mb-2">Avantages :</p>
                                    <ul className="space-y-1 mb-3">
                                      {section.comparaison.obligations.avantages.map((a, i) => (
                                        <li key={i} className="text-sm text-gray-300">✓ {a}</li>
                                      ))}
                                    </ul>
                                    <p className="text-xs text-gray-400 mb-2">Inconvénients :</p>
                                    <ul className="space-y-1 mb-3">
                                      {section.comparaison.obligations.inconvenients.map((a, i) => (
                                        <li key={i} className="text-sm text-gray-300">✗ {a}</li>
                                      ))}
                                    </ul>
                                    <p className="text-xs text-blue-300 italic">{section.comparaison.obligations.profil}</p>
                                  </div>
                                </div>
                              )}
                              
                              {section.types && (
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                  {section.types.map((type, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                      <h4 className="font-bold text-white mb-2">{type.nom}</h4>
                                      <p className="text-sm text-gray-300 mb-2">{type.description}</p>
                                      <p className="text-xs text-metron-purple italic">Pour : {type.pour}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {section.actions && (
                                <ul className="space-y-2">
                                  {section.actions.map((action, idx) => (
                                    <li key={idx} className="flex gap-3 text-gray-300">
                                      <span className="text-green-400 mt-1">→</span>
                                      <span dangerouslySetInnerHTML={{ __html: action }} />
                                    </li>
                                  ))}
                                </ul>
                              )}
                              
                              {section.methodes && (
                                <div className="space-y-4 mb-4">
                                  {section.methodes.map((methode, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                      <h4 className="font-bold text-white mb-2">{methode.nom}</h4>
                                      <p className="text-sm text-gray-300 mb-2">{methode.description}</p>
                                      {methode.formule && (
                                        <p className="font-mono text-sm text-metron-purple">{methode.formule}</p>
                                      )}
                                      {methode.exemple && (
                                        <p className="text-xs text-gray-400 mt-2">Ex: {methode.exemple}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {section.details && (
                                <div className="space-y-3 mb-4">
                                  {section.details.map((detail, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                      <h4 className="font-bold text-metron-purple mb-2">{detail.type}</h4>
                                      <p className="text-sm text-gray-300 mb-1"><span className="font-semibold">Définition :</span> {detail.definition}</p>
                                      <p className="text-sm text-gray-300 mb-1"><span className="font-semibold">Utilisation :</span> {detail.utilisation}</p>
                                      <p className="text-xs text-gray-400 italic">{detail.exemple}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {section.parametres && (
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                                  <p className="text-sm font-semibold text-white mb-3">Paramètres :</p>
                                  <ul className="space-y-3">
                                    {section.parametres.map((param, idx) => (
                                      <li key={idx} className="text-sm text-gray-300">
                                        {typeof param === 'string' && (
                                          <span className="font-mono text-metron-purple">{param}</span>
                                        )}
                                        {typeof param === 'object' && (
                                          <div>
                                            <p className="font-bold text-metron-purple">{param.nom}</p>
                                            <p className="text-gray-300 text-sm">{param.definition}</p>
                                            {param.impact && (
                                              <p className="text-xs text-gray-400 italic">
                                                Impact : {param.impact}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {section.formules && section.formules.length > 0 && (
                                <div className="space-y-2 mb-4">
                                  {section.formules.map((f, idx) => (
                                    <div key={idx} className="bg-metron-purple/10 border border-metron-purple/30 rounded-lg p-3">
                                      <p className="font-mono text-sm text-metron-purple">{f}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {section.greeks && (
                                <div className="space-y-4 mb-4">
                                  {section.greeks.map((greek, idx) => (
                                    <div key={idx} className="bg-gradient-to-r from-metron-purple/10 to-metron-blue/10 border border-metron-purple/30 rounded-lg p-4">
                                      <h4 className="font-bold text-white mb-2">{greek.nom}</h4>
                                      <p className="text-sm text-gray-300 mb-1">{greek.definition}</p>
                                      <p className="text-sm text-blue-300 mb-1">💡 {greek.interpretation}</p>
                                      <p className="text-xs text-gray-400 italic">{greek.plage || greek.astuce}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {section.etapes && (
                                <div className="space-y-3 mb-4">
                                  {section.etapes.map((etape, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-metron-purple/30 flex items-center justify-center text-white font-bold text-sm">
                                          {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                          <h4 className="font-bold text-white mb-1">{etape.etape}</h4>
                                          {etape.montant && <p className="text-sm text-metron-purple mb-1">{etape.montant}</p>}
                                          {etape.role && <p className="text-xs text-gray-400">{etape.role}</p>}
                                          {etape.texte && <p className="text-sm text-gray-300">{etape.texte}</p>}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {section.strategies && (
                                <div className="space-y-4 mb-4">
                                  {section.strategies.map((strat, idx) => (
                                    <div key={idx} className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
                                      <h4 className="font-bold text-white mb-2">{strat.nom}</h4>
                                      <p className="text-sm text-gray-300 mb-1"><span className="font-semibold">Composition :</span> {strat.composition}</p>
                                      <p className="text-sm text-gray-300 mb-1"><span className="font-semibold">Pari :</span> {strat.pari}</p>
                                      <p className="text-xs text-gray-400"><span className="font-semibold">Greeks :</span> {strat.Greeks || strat.risque}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}

                          {/* SECTION QUIZ (collapsible) */}
                          {module.quiz && module.quiz.length > 0 && (
                            <div className="mt-8 pt-8 border-t-2 border-metron-purple/30">
                              {/* En-tête du Quiz (cliquable) */}
                              <button
                                onClick={() => toggleQuiz(selectedLevel, moduleIdx)}
                                className="w-full flex items-center justify-between p-4 bg-metron-purple/10 hover:bg-metron-purple/20 rounded-lg border border-metron-purple/30 transition-all mb-4"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">
                                    {openQuizzes[moduleKey] ? '📖' : '📝'}
                                  </span>
                                  <h3 className="text-2xl font-bold text-white">
                                    Quiz de validation
                                  </h3>
                                  <span className="text-sm font-normal text-gray-400">
                                    (Score requis : 13/16)
                                  </span>
                                </div>
                                <span className="text-xl transition-transform" style={{ transform: openQuizzes[moduleKey] ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                  ▶
                                </span>
                              </button>
                              
                              {/* Contenu du Quiz (s'affiche seulement si ouvert) */}
                              {openQuizzes[moduleKey] && (() => {
                                const key = `${selectedLevel}-${moduleIdx}`;
                                const submitted = quizSubmitted[key];
                                const score = quizScores[key];
                                const userAnswers = quizAnswers[key] || {};
                                
                                return (
                                  <div className="space-y-6">
                                    {module.quiz.map((q, qIdx) => (
                                      <div key={qIdx} className="bg-white/5 border border-white/10 rounded-lg p-5">
                                        <p className="text-white font-semibold mb-4">
                                          {qIdx + 1}. {q.question}
                                        </p>
                                        
                                        <div className="space-y-2">
                                          {q.options.map((option, oIdx) => {
                                            const isSelected = userAnswers[qIdx] === oIdx;
                                            const isCorrect = q.correct === oIdx;
                                            
                                            let buttonClass = "w-full text-left p-3 rounded-lg border transition-all ";
                                            
                                            if (!submitted) {
                                              buttonClass += isSelected
                                                ? "border-metron-purple bg-metron-purple/20"
                                                : "border-white/20 hover:border-metron-purple/50";
                                            } else {
                                              if (isCorrect) {
                                                buttonClass += "border-green-500 bg-green-500/20";
                                              } else if (isSelected && !isCorrect) {
                                                buttonClass += "border-red-500 bg-red-500/20";
                                              } else {
                                                buttonClass += "border-white/10";
                                              }
                                            }
                                            
                                            return (
                                              <button
                                                key={oIdx}
                                                onClick={() => !submitted && handleQuizAnswer(selectedLevel, moduleIdx, qIdx, oIdx)}
                                                disabled={submitted}
                                                className={buttonClass}
                                              >
                                                <span className="text-gray-300">
                                                  {submitted && isCorrect && "✅ "}
                                                  {submitted && isSelected && !isCorrect && "❌ "}
                                                  {option}
                                                </span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                        
                                        {submitted && (
                                          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                                            <p className="text-sm text-blue-300">
                                              💡 {q.explication}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    
                                    {/* Boutons et résultats */}
                                    <div className="flex flex-col items-center gap-4">
                                      {!submitted ? (
                                        <button
                                          onClick={() => submitQuiz(selectedLevel, moduleIdx)}
                                          disabled={Object.keys(userAnswers).length !== module.quiz.length}
                                          className="btn-neon px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          Valider mes réponses
                                        </button>
                                      ) : (
                                        <>
                                          <div className={`text-center p-6 rounded-lg border-2 ${
                                            score.score >= 13
                                              ? 'border-green-500 bg-green-500/10'
                                              : 'border-orange-500 bg-orange-500/10'
                                          }`}>
                                            <p className="text-3xl font-bold text-white mb-2">
                                              {score.score}/16
                                            </p>
                                            <p className="text-gray-300 mb-2">
                                              bonnes réponses
                                            </p>
                                            <p className={`font-bold ${
                                              score.score >= 13 ? 'text-green-400' : 'text-orange-400'
                                            }`}>
                                              {score.score >= 13
                                                ? '🎉 Module validé ! Excellent travail !'
                                                : '📚 Révisez et réessayez pour valider le module'}
                                            </p>
                                          </div>
                                          
                                          <button
                                            onClick={() => resetQuiz(selectedLevel, moduleIdx)}
                                            className="btn-neon-secondary px-6"
                                          >
                                            Recommencer le quiz
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

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
            <div className="relative mb-8" ref={searchRef}>
              <div className="glass-card p-8 border border-metron-purple/30">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Rechercher un terme..."
                      className="input-futuristic w-full text-lg"
                      value={searchTerm}
                      onChange={handleInputChange}
                      onFocus={() =>
                        suggestions.length > 0 && setShowSuggestions(true)
                      }
                      autoComplete="off"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  💡 Tapez pour rechercher dans le glossaire
                </p>
              </div>

              {/* Dropdown HORS du glass-card */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-[9999] left-8 right-8 mt-[-3rem] bg-metron-darker border border-metron-purple/50 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-4 text-center text-gray-400">
                      Recherche...
                    </div>
                  ) : (
                    suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-metron-purple/20 transition-colors border-b border-white/5 last:border-b-0"
                      >
                        <p className="font-bold text-white">
                          {suggestion.term}
                        </p>
                        <p className="text-xs text-metron-purple">
                          {suggestion.section}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
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
                <p className="text-gray-400 text-lg">Auculan terme trouvé pour "{searchTerm}"</p>
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
        {/* 🆕 Modal Quiz d'auto-évaluation */}
        {showLevelQuiz && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card max-w-2xl w-full p-8 border border-metron-purple/50 relative">
              <button
                onClick={resetLevelQuiz}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {!quizResult ? (
                <>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-white">Quiz d'auto-évaluation</h2>
                      <span className="text-metron-purple font-semibold">
                        {quizStep + 1} / {levelQuiz.length}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
                      <div
                        className="bg-gradient-metron h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((quizStep + 1) / levelQuiz.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-6">
                      {levelQuiz[quizStep].question}
                    </h3>
                    
                    <div className="space-y-3">
                      {levelQuiz[quizStep].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleLevelQuizAnswer(index)}
                          className="w-full p-4 text-left rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-metron-purple/50 transition-all text-white"
                        >
                          <span className="font-semibold text-metron-purple mr-3">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-6xl mb-4">
                      {quizResult.level === 'avance' ? '🏆' : quizResult.level === 'intermediaire' ? '⭐' : '🌱'}
                    </div>
                    
                    <h2 className="text-3xl font-bold text-white mb-3">
                      Résultat : {quizResult.score} / 15 points
                    </h2>
                    
                    <div className="inline-block px-6 py-2 rounded-full bg-metron-purple/20 border border-metron-purple/50 mb-6">
                      <span className="text-metron-purple font-semibold text-lg capitalize">
                        Niveau {quizResult.level}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                      {quizResult.message}
                    </p>
                    
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={startAtRecommendedLevel}
                        className="btn-neon px-8 py-3"
                      >
                        🚀 Commencer au niveau {quizResult.level}
                      </button>
                      <button
                        onClick={resetLevelQuiz}
                        className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
                      >
                        Refaire le quiz
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}