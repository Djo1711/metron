import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold mb-4">
            <span className="gradient-text">404</span>
          </h1>
          <p className="text-3xl font-bold text-white mb-4">Page Not Found</p>
          <p className="text-gray-400 text-lg mb-8">
            Oops! The page you're looking for doesn't exist.
          </p>
        </div>

        <div className="glass-card p-8 inline-block border border-metron-purple/30">
          <p className="text-gray-300 mb-6">Here are some helpful links instead:</p>
          <div className="flex flex-col gap-3">
            <Link to="/" className="btn-neon">
              🏠 Go Home
            </Link>
            <Link to="/simulation" className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl border border-white/10 hover:border-metron-purple/50 transition-all">
              📊 Start Simulation
            </Link>
            <Link to="/learning" className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl border border-white/10 hover:border-metron-blue/50 transition-all">
              📚 Learning Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}