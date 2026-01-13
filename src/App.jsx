import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './components/auth/Login'
import Home from './pages/Home'
import Movies from './pages/Movies'
import TVShows from './pages/TVShows'
import MyList from './pages/MyList'
import Details from './pages/Details'
import SearchResults from './pages/SearchResults'
import Header from './components/common/Header'
import Sidebar from './components/common/Sidebar'
import Footer from './components/common/Footer'

const ProtectedLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
      <Sidebar />
      <Header />
      <main className="ml-15 pb-12">
        {children}
      </main>
      <Footer />
    </div>
  )
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <Router basename="/movieflix">
        <Routes>
          {/* Public Route */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Home />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/movies"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Movies />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/tv-shows"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <TVShows />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/my-list"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <MyList />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <SearchResults />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/:mediaType/:id"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Details />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
