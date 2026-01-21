export default function Team() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4">
            <span className="gradient-text">Notre Équipe</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Nous sommes 6 étudiants passionnés réunis autour d'un projet ambitieux : 
            démocratiser la finance quantitative et rendre les produits structurés accessibles à tous.
          </p>
        </div>

        {/* Team Description */}
        <div className="glass-card p-8 mb-12 border border-metron-purple/20">
          <h2 className="text-3xl font-bold text-white mb-4">
            <span className="gradient-text">À propos de Metron</span>
          </h2>
          <div className="text-gray-300 space-y-4 text-lg">
            <p>
              Metron est né de notre volonté commune de créer une plateforme éducative innovante 
              dans le domaine de la finance quantitative. Notre équipe pluridisciplinaire combine 
              des expertises en finance, développement web, data science et ingénierie pour offrir 
              une expérience d'apprentissage unique.
            </p>
            <p>
              Composée de 4 étudiants en Master 2 Finance, 1 spécialiste Data/IA et 1 expert en 
              systèmes embarqués, notre équipe met à profit ses compétences variées pour développer 
              des outils de simulation performants et du contenu pédagogique de qualité.
            </p>
            <p>
              Notre mission : rendre la finance quantitative et les produits structurés compréhensibles 
              et accessibles, que vous soyez étudiant, professionnel ou simplement curieux.
            </p>
          </div>
        </div>

        {/* Team Members */}
        <div className="glass-card p-12 border border-metron-purple/30">
          <h2 className="text-4xl font-bold text-center mb-3">
            <span className="gradient-text">Les Membres de l'Équipe</span>
          </h2>
          <p className="text-center text-gray-400 mb-12 text-lg">
            Chacun apporte son expertise pour faire de Metron une plateforme d'excellence
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Geoffroy */}
            <div className="glass-card p-6 text-center card-hover border border-metron-purple/20">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-metron-purple shadow-neon-purple">
                <img 
                  src="/team/geoffroy.jpg" 
                  alt="Geoffroy Boccon-Liaudet"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Geoffroy Boccon-Liaudet</h3>
              <p className="text-sm text-metron-purple mb-3 font-medium">Tech Lead & Développeur Fullstack</p>
              <p className="text-sm text-gray-400">
                Architecte fullstack du projet. Responsable du développement backend (FastAPI), 
                frontend (React) et du design UI/UX. Implémentation des modèles de pricing Black-Scholes.
              </p>
            </div>

            {/* Danaé */}
            <div className="glass-card p-6 text-center card-hover border border-metron-blue/20">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-green-500">
                <img 
                  src="/team/danae.jpg" 
                  alt="Danaé Collard"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Danaé Collard</h3>
              <p className="text-sm text-green-400 mb-3 font-medium">Responsable Contenu & Pédagogie</p>
              <p className="text-sm text-gray-400">
                Responsable du Centre d'Apprentissage. Création de contenu pédagogique et tutoriels 
                interactifs pour rendre la finance quantitative accessible.
              </p>
            </div>

            {/* Mael */}
            <div className="glass-card p-6 text-center card-hover border border-metron-pink/20">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-orange-500">
                <img 
                  src="/team/mael.jpg" 
                  alt="Mael Coredo"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Mael Coredo</h3>
              <p className="text-sm text-orange-400 mb-3 font-medium">Ingénieur Financier</p>
              <p className="text-sm text-gray-400">
                Ingénieur financier. Développement et validation des modèles de pricing pour les 
                produits structurés (Reverse Convertible, Autocall).
              </p>
            </div>

            {/* Ethan */}
            <div className="glass-card p-6 text-center card-hover border border-metron-purple/20">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-pink-500">
                <img 
                  src="/team/ethan.jpg" 
                  alt="Ethan Chetboun"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Ethan Chetboun</h3>
              <p className="text-sm text-pink-400 mb-3 font-medium">Analyste de Marché</p>
              <p className="text-sm text-gray-400">
                Analyste stratégique. Réalisation de l'étude de marché et analyse du public cible. 
                Contribution à l'état de l'art des produits structurés.
              </p>
            </div>

            {/* Mathias */}
            <div className="glass-card p-6 text-center card-hover border border-metron-blue/20">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-indigo-500">
                <img 
                  src="/team/mathias.jpg" 
                  alt="Mathias Rechsteiner"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Mathias Rechsteiner</h3>
              <p className="text-sm text-indigo-400 mb-3 font-medium">Ingénieur DevOps</p>
              <p className="text-sm text-gray-400">
                Expert en déploiement et qualité. Assure la fiabilité de la plateforme.
              </p>
            </div>

            {/* Amine */}
            <div className="glass-card p-6 text-center card-hover border border-metron-pink/20">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-yellow-500">
                <img 
                  src="/team/amine.jpg" 
                  alt="Amine Gaghighi"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Amine Gaghighi</h3>
              <p className="text-sm text-yellow-400 mb-3 font-medium">Chef de Projet</p>
              <p className="text-sm text-gray-400">
                Étude de faisabilité TELOS et coordination de l'équipe via ClickUp. 
                Gestion des tâches et du planning.
              </p>
            </div>
          </div>

          <div className="text-center mt-10 pt-8 border-t border-white/10">
            <p className="text-gray-300 font-medium text-lg">
              🎓 Projet réalisé dans le cadre du PFE de l'ECE
            </p>
            <p className="text-gray-500 mt-2">
              2025 - 2026
            </p>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="glass-card p-8 mt-12 border border-metron-blue/20">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            <span className="gradient-text">Stack Technique</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">⚛️</div>
              <h4 className="text-white font-bold mb-1">Frontend</h4>
              <p className="text-gray-400 text-sm">React.js + Tailwind CSS</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">⚡</div>
              <h4 className="text-white font-bold mb-1">Backend</h4>
              <p className="text-gray-400 text-sm">FastAPI + Python</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🗄️</div>
              <h4 className="text-white font-bold mb-1">Database</h4>
              <p className="text-gray-400 text-sm">Supabase (PostgreSQL)</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🚀</div>
              <h4 className="text-white font-bold mb-1">Déploiement</h4>
              <p className="text-gray-400 text-sm">Vercel + Render</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
