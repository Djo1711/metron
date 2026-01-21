/**
 * Dictionnaire de définitions financières pour les tooltips
 */

export const definitions = {
  // ==================== PARAMÈTRES DE MARCHÉ ====================
  ticker: "Symbole boursier unique identifiant une action (ex: AAPL pour Apple, MSFT pour Microsoft)",
  
  spot_price: "Prix actuel de l'action sur le marché. C'est le prix auquel vous pouvez acheter ou vendre l'action maintenant.",
  
  volatility: "Mesure de l'amplitude des fluctuations du prix de l'action.\n• σ = 0.20 (20%) = faible volatilité\n• σ = 0.40 (40%) = haute volatilité\nPlus la volatilité est élevée, plus le produit structuré coûte cher.",
  
  risk_free_rate: "Taux d'intérêt sans risque (généralement obligations d'État).\nUtilisé comme référence pour actualiser les flux futurs.\nEx: 4% signifie qu'un placement sans risque rapporte 4% par an.",
  
  maturity: "Durée de vie du produit structuré jusqu'à son échéance.\nÀ maturité, le produit est remboursé selon ses conditions.",
  
  principal: "Montant investi au départ dans le produit structuré.\nC'est votre capital de départ.",

  // ==================== AUTOCALL ====================
  autocall_barrier: "Barrière de rappel automatique.\nSi le prix de l'action dépasse cette barrière lors d'une observation, le produit est remboursé automatiquement avec le coupon.\n\nEx: Barrière à 100% = si l'action reste au-dessus de son prix initial, remboursement anticipé.",
  
  coupon_rate: "Taux de coupon annuel versé.\nC'est le rendement que vous recevez si les conditions sont remplies.\n\nEx: 8% sur 10,000$ = 800$ de coupon par an.",
  
  barrier_level: "Barrière de protection du capital.\nSi le prix final est en-dessous de cette barrière, vous perdez une partie du capital.\n\nEx: Barrière à 60% = si l'action chute de plus de 40%, perte proportionnelle.",
  
  autocall_frequency: "Fréquence des observations pour le rappel automatique.\n• 0.25 = trimestriel (4 fois par an)\n• 0.5 = semestriel (2 fois par an)\n• 1.0 = annuel",

  // ==================== REVERSE CONVERTIBLE ====================
  reverse_convertible_barrier: "Barrière de conversion.\nSi le prix final est en-dessous, vous recevez des actions au lieu du capital.\n\nRisque: Si l'action a chuté de 50%, vous recevez des actions valant 50% de votre investissement.",

  // ==================== CAPITAL PROTÉGÉ ====================
  protection_level: "Niveau de protection du capital à maturité.\n• 100% = capital entièrement garanti\n• 90% = 90% du capital garanti\n\nVous ne pouvez pas perdre plus que (100% - protection%).",
  
  participation_rate: "Taux de participation à la hausse de l'action.\n\nEx: Taux à 80% et action +20%\n→ Vous gagnez 80% × 20% = 16%\n\nPlus le taux est élevé, plus vous profitez de la hausse.",

  // ==================== WARRANT ====================
  strike_price: "Prix d'exercice du warrant.\nC'est le prix auquel vous pouvez acheter (call) ou vendre (put) l'action.\n\nEx: Strike à 160$ sur AAPL\n→ Call rentable si AAPL > 160$\n→ Put rentable si AAPL < 160$",
  
  warrant_type: "Type de warrant :\n• CALL = pari à la hausse (gagner si prix monte)\n• PUT = pari à la baisse (gagner si prix descend)",
  
  leverage: "Effet de levier multipliant les gains ET les pertes.\n\nEx: Levier ×5 et action +10%\n→ Warrant +50% (5 × 10%)\n\n⚠️ Mais si action -10%\n→ Warrant -50% (perte amplifiée)",

  // ==================== RÉSULTATS ====================
  fair_value: "Valeur théorique du produit structuré calculée par Black-Scholes ou Monte Carlo.\n\nSi Fair Value < Prix de vente réel\n→ Le produit est cher (mauvaise affaire)\n\nSi Fair Value > Prix de vente réel\n→ Le produit est bon marché (bonne affaire)",
  
  max_gain: "Gain maximum possible à maturité.\nScénario idéal où toutes les conditions sont favorables.",
  
  max_loss: "Perte maximum possible à maturité.\nScénario catastrophe où l'action s'effondre.",
  
  risk_level: "Niveau de risque du produit (0-100).\n• 0-20 = Risque faible (Capital protégé)\n• 20-50 = Risque modéré (Autocall, RC)\n• 50-100 = Risque élevé (Warrants)\n\nPlus le risque est élevé, plus le rendement potentiel est important.",
  
  probability_profit: "Probabilité estimée de réaliser un profit à maturité.\nBasée sur le modèle Black-Scholes.\n\nEx: 70% = 7 chances sur 10 de gagner de l'argent.",

  // ==================== GREEKS ====================
  delta: "Sensibilité du prix du produit aux variations de l'action.\n\nΔ = 0.5 → Si action +1$, produit +0.50$\nΔ = -0.3 → Si action +1$, produit -0.30$\n\nLe Delta mesure l'exposition directionnelle.",
  
  gamma: "Sensibilité du Delta aux variations de l'action.\nMesure la courbure du prix.\n\nGamma élevé = Delta change rapidement\nGamma faible = Delta stable",
  
  vega: "Sensibilité du prix aux variations de volatilité.\n\nVega = 50 → Si volatilité +1%, produit +50$\n\nProduits longs en options ont Vega positif\n(bénéficient de hausse de volatilité)",
  
  theta: "Érosion temporelle quotidienne du prix.\n\nΘ = -5 → Le produit perd 5$ par jour qui passe\n\nLe temps qui passe détruit la valeur des options.",

  // ==================== GRAPHIQUES ====================
  payoff_diagram: "Graphique montrant le gain/perte à maturité en fonction du prix final de l'action.\n\n• Axe X = Prix spot final\n• Axe Y = Valeur du produit\n\nLa courbe bleue (Payoff) montre combien vous récupérez.\nLa courbe verte (Profit) montre votre gain net.",
  
  scenario_simulation: "Simulation de l'évolution du prix de l'action jusqu'à maturité.\n\n• Courbe bleue = Prix simulé\n• Ligne rouge pointillée = Barrière de protection\n• Ligne verte pointillée = Barrière autocall\n\nPermet de visualiser les trajectoires possibles.",
  
  barrier_protection: "Ligne rouge sur le graphique.\nSi le prix final est en-dessous, le capital n'est pas protégé.\n\nZone dangereuse = en-dessous de la barrière rouge.",
  
  barrier_autocall: "Ligne verte sur le graphique.\nSi le prix touche cette ligne lors d'une observation, remboursement anticipé automatique.\n\nZone favorable = au-dessus de la barrière verte.",

  // ==================== SCÉNARIOS ====================
  scenario_bullish: "Scénario haussier optimiste.\nSimule une hausse de 30% de l'action.\nUtile pour voir le gain maximum potentiel.",
  
  scenario_base: "Scénario neutre de référence.\nPrix évolue selon la dérive du taux sans risque.\nScénario le plus probable selon le modèle.",
  
  scenario_bearish: "Scénario baissier pessimiste.\nSimule une baisse de 30% de l'action.\nUtile pour voir la perte maximum potentielle.",
  
  scenario_volatile: "Scénario de haute volatilité.\nSimule des fluctuations importantes (+50% de volatilité).\nPrix très erratique, risque élevé de toucher les barrières.",

  // ==================== PRODUITS ====================
  product_autocall: "Produit structuré avec remboursement anticipé possible.\n\nAvantages:\n• Coupon attractif\n• Remboursement anticipé si marché favorable\n\nInconvénients:\n• Perte si action chute fort\n• Gain plafonné au coupon",
  
  product_reverse_convertible: "Obligation à haut rendement avec risque de conversion en actions.\n\nAvantages:\n• Coupon élevé garanti\n• Récupération capital si barrière non cassée\n\nInconvénients:\n• Conversion en actions si baisse importante\n• Gain plafonné au coupon",
  
  product_capital_protected: "Produit garantissant le capital à maturité.\n\nAvantages:\n• Aucune perte possible (100% protégé)\n• Participation à la hausse\n\nInconvénients:\n• Faible participation (souvent 50-80%)\n• Pas de dividendes",
  
  product_warrant: "Produit à effet de levier amplifiant gains et pertes.\n\nAvantages:\n• Gains amplifiés si bonne direction\n• Investissement initial faible\n\nInconvénients:\n• Pertes amplifiées\n• Peut perdre 100% si mauvaise direction"
}

/**
 * Fonction helper pour récupérer une définition
 */
export function getDefinition(key) {
  return definitions[key] || "Définition non disponible"
}