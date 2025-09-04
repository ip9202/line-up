import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Teams from './pages/Teams'
import Venues from './pages/Venues'
import Players from './pages/Players'
import Games from './pages/Games'
import LineupEditor from './pages/LineupEditor'
import LineupView from './pages/LineupView'

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/players" element={<Players />} />
          <Route path="/games" element={<Games />} />
          <Route path="/lineup/editor" element={<LineupEditor />} />
          <Route path="/lineup/view" element={<LineupView />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
