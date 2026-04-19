import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Button from '../components/ui/Button'
import Logo from '../components/ui/Logo'

export default function NotFound() {
  const { isAuthenticated, role } = useAuthStore((s) => s)
  const dashboardPath = isAuthenticated ? (role === 'brand' ? '/brand/dashboard' : '/influencer/dashboard') : '/'

  return (
    <div className="bg-[#F5F5F0] min-h-screen flex flex-col items-center justify-center text-center">
      <p className="text-[120px] font-extrabold text-[#E0E0DB] leading-none mb-[-20px] select-none">404</p>
      <div className="relative z-[1]">
        <h1 className="text-[28px] font-bold text-[#1C1C1C] mb-[8px]">Page not found</h1>
        <p className="text-[14px] text-[#888888] max-w-[360px] mx-auto mb-[28px]">
          The page you're looking for has moved or doesn't exist.
        </p>
        <div className="flex gap-[12px] justify-center">
          <Link to={dashboardPath}>
            <Button size="lg">← Go to Dashboard</Button>
          </Link>
          <a href="mailto:support@influencehub.in">
            <Button variant="ghost-dark" size="lg">Contact Support</Button>
          </a>
        </div>
      </div>
      <Logo className="mt-[48px] opacity-40" />
    </div>
  )
}
