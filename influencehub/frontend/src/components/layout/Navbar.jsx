import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, HelpCircle, LogOut, User, Settings, CreditCard } from 'lucide-react'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'
import DropdownMenu from '../ui/DropdownMenu'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'

function MarketingNavbar() {
  const navigate = useNavigate()
  return (
    <nav className="h-[64px] bg-white border-b border-[#E0E0DB] px-[80px] flex items-center justify-between fixed top-0 left-0 right-0 z-[100]">
      <Link to="/"><Logo size="md" /></Link>
      <div className="flex items-center gap-[32px]">
        <Link to="/brand/discover" className="text-[14px] font-medium text-[#444444] hover:text-[#1C1C1C] transition-colors">Find Talent</Link>
        <Link to="/influencer/campaigns" className="text-[14px] font-medium text-[#444444] hover:text-[#1C1C1C] transition-colors">Browse Projects</Link>
      </div>
      <div className="flex items-center gap-[12px]">
        <Link to="/login" className="text-[14px] font-medium text-[#444444] hover:text-[#1C1C1C] transition-colors">Sign In</Link>
        <Button size="sm" onClick={() => navigate('/register')}>Join Free</Button>
      </div>
    </nav>
  )
}

function AuthNavbar() {
  const navigate = useNavigate()
  return (
    <nav className="h-[60px] bg-white border-b border-[#E0E0DB] px-[40px] flex items-center justify-between fixed top-0 left-0 right-0 z-[100]">
      <Link to="/"><Logo size="md" /></Link>
      <div className="flex items-center gap-[12px]">
        <span className="text-[13px] text-[#888888]">Already have an account?</span>
        <Button variant="ghost-dark" size="sm" onClick={() => navigate('/login')}>Log In</Button>
      </div>
    </nav>
  )
}

function AppNavbar() {
  const { user, role, logout } = useAuthStore((s) => s)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const navigate = useNavigate()

  const menuItems = [
    { label: 'View Profile', icon: User, onClick: () => navigate(role === 'brand' ? '/brand/profile' : '/influencer/profile') },
    { label: 'Account Settings', icon: Settings, onClick: () => navigate('/settings') },
    { divider: true },
    { label: 'Sign Out', icon: LogOut, danger: true, onClick: () => { logout(); navigate('/login') } },
  ]

  return (
    <nav className="h-[56px] bg-white border-b border-[#E0E0DB] px-[24px] flex items-center fixed top-0 left-0 right-0 z-[100]">
      <Link to="/"><Logo size="sm" /></Link>
      <div className="flex-1 max-w-[440px] mx-auto relative">
        <Search size={15} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full h-[36px] bg-[#F5F5F0] border border-[#E0E0DB] rounded-[6px] pl-[34px] pr-[12px] text-[13px] outline-none focus:border-[#108A00] transition-colors"
        />
      </div>
      <div className="flex items-center gap-[8px] ml-auto">
        <button
          onClick={() => navigate('/notifications')}
          className="relative w-[32px] h-[32px] rounded-[4px] hover:bg-[#F5F5F0] flex items-center justify-center cursor-pointer transition-colors"
        >
          <Bell size={16} className="text-[#888888]" />
          {unreadCount > 0 && (
            <span className="absolute top-[4px] right-[4px] w-[8px] h-[8px] rounded-full bg-[#C0392B] border-2 border-white" />
          )}
        </button>
        <button className="w-[32px] h-[32px] rounded-[4px] hover:bg-[#F5F5F0] flex items-center justify-center cursor-pointer transition-colors">
          <HelpCircle size={16} className="text-[#888888]" />
        </button>
        <div className="w-[1px] h-[24px] bg-[#E0E0DB] mx-[8px]" />
        <DropdownMenu
          trigger={<Avatar name={user?.name || 'User'} src={user?.avatar} size={34} />}
          items={menuItems}
          align="right"
        />
      </div>
    </nav>
  )
}

export default function Navbar({ variant = 'marketing' }) {
  if (variant === 'auth') return <AuthNavbar />
  if (variant === 'app') return <AppNavbar />
  return <MarketingNavbar />
}
