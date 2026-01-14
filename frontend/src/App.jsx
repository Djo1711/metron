import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './services/supabase'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Home from './pages/Home'
import MarketData from './pages/MarketData'
import Simulation from './pages/Simulation'
import Learning from './pages/Learning'
import MyAccount from './pages/MyAccount'

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

  if (loading) {
    return (
      <div className="min-h-screen bg-metron-darker flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    )
  }

  const isAuthenticated = user !== null

  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar user={user} isGuest={isGuest} />}
      
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
        />
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
      </Routes>
    </BrowserRouter>
  )
}

export default App