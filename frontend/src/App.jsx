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

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      {user && <Navbar user={user} />}
      
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={user ? <Home /> : <Navigate to="/login" />}
        />
        <Route
          path="/market"
          element={user ? <MarketData /> : <Navigate to="/login" />}
        />
        <Route
          path="/simulation"
          element={user ? <Simulation /> : <Navigate to="/login" />}
        />
        <Route
          path="/learning"
          element={user ? <Learning /> : <Navigate to="/login" />}
        />
        <Route
          path="/account"
          element={user ? <MyAccount /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
