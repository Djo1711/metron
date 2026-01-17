import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './services/supabase'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LoadingSpinner from './components/LoadingSpinner'

// Pages
import Login from './pages/Login'
import Home from './pages/Home'
import MarketData from './pages/MarketData'
import Simulation from './pages/Simulation'
import Learning from './pages/Learning'
import MyAccount from './pages/MyAccount'
import NotFound from './pages/NotFound'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    // Check guest mode
    const guestMode = localStorage.getItem('guestMode')
    if (guestMode === 'true') {
      setIsGuest(true)
      setUser({ email: 'Guest User', id: 'guest' })
      setLoading(false)
      return
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsGuest(false)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsGuest(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Use your custom LoadingSpinner
  if (loading) {
    return <LoadingSpinner text="Initializing Metron..." />
  }

  const isAuthenticated = user !== null

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-dark flex flex-col">
        {isAuthenticated && <Navbar user={user} isGuest={isGuest} />}
        
        <main className="flex-grow">
          <Routes>
            {/* Public route */}
            <Route
              path="/login"
              element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
            />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path="/market"
              element={isAuthenticated ? <MarketData /> : <Navigate to="/login" />}
            />
            <Route
              path="/simulation"
              element={isAuthenticated ? <Simulation isGuest={isGuest} /> : <Navigate to="/login" />}
            />
            <Route
              path="/learning"
              element={isAuthenticated ? <Learning /> : <Navigate to="/login" />}
            />
            <Route
              path="/account"
              element={isAuthenticated && !isGuest ? <MyAccount /> : <Navigate to="/" />}
            />
            
            {/* 404 - Must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Show footer only when authenticated */}
        {isAuthenticated && <Footer />}
      </div>
    </BrowserRouter>
  )
}

export default App