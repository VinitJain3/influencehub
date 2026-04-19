import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import ToastContainer from './components/ui/Toast'
import { useEffect } from 'react'

// Public pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import RoleSelection from './pages/RoleSelection'
import BrandRegistration from './pages/BrandRegistration'
import CreatorRegistration from './pages/CreatorRegistration'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import NotFound from './pages/NotFound'

// Brand pages
import BrandDashboard from './pages/brand/Dashboard'
import DiscoverCreators from './pages/brand/DiscoverCreators'
import CreatorProfile from './pages/brand/CreatorProfile'
import MyCampaigns from './pages/brand/MyCampaigns'
import NewCampaign from './pages/brand/NewCampaign'
import BrandRequests from './pages/brand/Requests'
import BrandAnalytics from './pages/brand/Analytics'
import BrandProfile from './pages/brand/Profile'

// Influencer pages
import InfluencerDashboard from './pages/influencer/Dashboard'
import BrowseCampaigns from './pages/influencer/BrowseCampaigns'
import CampaignDetail from './pages/influencer/CampaignDetail'
import MyRequests from './pages/influencer/MyRequests'
import InfluencerAnalytics from './pages/influencer/Analytics'
import InfluencerProfile from './pages/influencer/Profile'

// Shared pages
import Messages from './pages/shared/Messages'
import Notifications from './pages/shared/Notifications'
import Settings from './pages/shared/Settings'

function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, role } = useAuthStore((s) => s)
  
  if (!isAuthenticated) return <Navigate to="/login" replace />
  
  // If allowedRole is specified but user has a different role
  if (allowedRole && role !== allowedRole) {
    // If role is completely invalid/missing, flush it
    if (role !== 'brand' && role !== 'influencer') {
      useAuthStore.getState().logout()
      return <Navigate to="/login" replace />
    }
    return <Navigate to={role === 'brand' ? '/brand/dashboard' : '/influencer/dashboard'} replace />
  }
  
  return children
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, role } = useAuthStore((s) => s)
  if (isAuthenticated) {
    if (role !== 'brand' && role !== 'influencer') {
      useAuthStore.getState().logout()
      return <Navigate to="/login" replace />
    }
    return <Navigate to={role === 'brand' ? '/brand/dashboard' : '/influencer/dashboard'} replace />
  }
  return children
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate)
  useEffect(() => { hydrate() }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RoleSelection /></PublicOnlyRoute>} />
        <Route path="/register/brand" element={<PublicOnlyRoute><BrandRegistration /></PublicOnlyRoute>} />
        <Route path="/register/influencer" element={<PublicOnlyRoute><CreatorRegistration /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Brand Portal */}
        <Route path="/brand/dashboard" element={<ProtectedRoute allowedRole="brand"><BrandDashboard /></ProtectedRoute>} />
        <Route path="/brand/discover" element={<ProtectedRoute allowedRole="brand"><DiscoverCreators /></ProtectedRoute>} />
        <Route path="/brand/creator/:id" element={<ProtectedRoute allowedRole="brand"><CreatorProfile /></ProtectedRoute>} />
        <Route path="/brand/campaigns" element={<ProtectedRoute allowedRole="brand"><MyCampaigns /></ProtectedRoute>} />
        <Route path="/brand/campaigns/new" element={<ProtectedRoute allowedRole="brand"><NewCampaign /></ProtectedRoute>} />
        <Route path="/brand/campaigns/:id/edit" element={<ProtectedRoute allowedRole="brand"><NewCampaign /></ProtectedRoute>} />
        <Route path="/brand/requests" element={<ProtectedRoute allowedRole="brand"><BrandRequests /></ProtectedRoute>} />
        <Route path="/brand/analytics" element={<ProtectedRoute allowedRole="brand"><BrandAnalytics /></ProtectedRoute>} />
        <Route path="/brand/profile" element={<ProtectedRoute allowedRole="brand"><BrandProfile /></ProtectedRoute>} />

        {/* Influencer Portal */}
        <Route path="/influencer/dashboard" element={<ProtectedRoute allowedRole="influencer"><InfluencerDashboard /></ProtectedRoute>} />
        <Route path="/influencer/campaigns" element={<ProtectedRoute allowedRole="influencer"><BrowseCampaigns /></ProtectedRoute>} />
        <Route path="/influencer/campaigns/:id" element={<ProtectedRoute allowedRole="influencer"><CampaignDetail /></ProtectedRoute>} />
        <Route path="/influencer/requests" element={<ProtectedRoute allowedRole="influencer"><MyRequests /></ProtectedRoute>} />
        <Route path="/influencer/analytics" element={<ProtectedRoute allowedRole="influencer"><InfluencerAnalytics /></ProtectedRoute>} />
        <Route path="/influencer/profile" element={<ProtectedRoute allowedRole="influencer"><InfluencerProfile /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}
