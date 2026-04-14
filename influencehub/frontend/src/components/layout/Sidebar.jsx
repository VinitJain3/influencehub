import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Megaphone, Inbox, MessageSquare,
  BarChart2, Settings, Send, User
} from 'lucide-react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'

const brandNav = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/brand/dashboard' },
  { icon: Users, label: 'Discover Creators', to: '/brand/discover' },
  { icon: Megaphone, label: 'My Campaigns', to: '/brand/campaigns' },
  { icon: Inbox, label: 'Requests', to: '/brand/requests', badgeKey: 'pending' },
  { icon: MessageSquare, label: 'Messages', to: '/messages', badgeKey: 'unread' },
  { icon: BarChart2, label: 'Analytics', to: '/brand/analytics' },
  'separator',
  { icon: Settings, label: 'Settings', to: '/settings' },
]

const influencerNav = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/influencer/dashboard' },
  { icon: Megaphone, label: 'Browse Campaigns', to: '/influencer/campaigns' },
  { icon: Send, label: 'My Requests', to: '/influencer/requests', badgeKey: 'pending' },
  { icon: MessageSquare, label: 'Messages', to: '/messages', badgeKey: 'unread' },
  { icon: User, label: 'My Profile', to: '/influencer/profile' },
  { icon: BarChart2, label: 'Analytics', to: '/influencer/analytics' },
  'separator',
  { icon: Settings, label: 'Settings', to: '/settings' },
]

export default function Sidebar({ role }) {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const items = role === 'brand' ? brandNav : influencerNav

  return (
    <aside className="fixed top-[56px] left-0 bottom-0 w-[232px] bg-white border-r border-[#E0E0DB] flex flex-col overflow-y-auto z-[90]">
      {/* Top section */}
      <div className="p-[16px] border-b border-[#E0E0DB] flex items-center gap-[10px]">
        <Avatar name={user?.name || 'User'} src={user?.avatar} size={44} />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#1C1C1C] truncate">
            {role === 'brand' ? user?.companyName || user?.name || '--' : `@${user?.handle || user?.name || '--'}`}
          </p>
          <p className="text-[12px] text-[#888888]">
            {role === 'brand' ? 'Brand Account' : 'Influencer'}
          </p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-[8px]">
        {items.map((item, i) =>
          item === 'separator' ? (
            <div key={i} className="h-[1px] bg-[#F0F0EB] my-[6px]" />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-[9px] px-[12px] py-[9px] rounded-[6px] mb-[2px] relative transition-colors duration-100 text-[13px] font-medium ${
                  isActive
                    ? 'bg-[#E8F5E6] text-[#108A00] font-semibold'
                    : 'text-[#444444] hover:bg-[#F5F5F0]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-[6px] bottom-[6px] w-[3px] bg-[#108A00] rounded-r-[2px]" />
                  )}
                  <item.icon size={18} className={isActive ? 'text-[#108A00]' : 'text-[#888888]'} />
                  <span className="flex-1">{item.label}</span>
                </>
              )}
            </NavLink>
          )
        )}
      </nav>

      {/* Bottom section */}
      <div className="p-[12px] border-t border-[#E0E0DB] flex-shrink-0">
        {role === 'brand' ? (
          <div className="bg-[#E8F5E6] border border-[#C5E0C3] rounded-[8px] p-[14px]">
            <p className="text-[13px] font-semibold text-[#1C1C1C] mb-[2px]">Upgrade to Pro</p>
            <p className="text-[12px] text-[#666666] mb-[10px]">Unlock unlimited requests &amp; analytics</p>
            <Button size="sm" fullWidth onClick={() => navigate('/settings#billing')}>Upgrade</Button>
          </div>
        ) : (
          <div className="bg-white border border-[#108A00] rounded-[8px] p-[14px]">
            <p className="text-[13px] font-semibold text-[#108A00] mb-[2px]">Get Verified ✓</p>
            <p className="text-[12px] text-[#666666] mb-[10px]">Boosts your profile 3× in search</p>
            <Button variant="ghost-green" size="sm" fullWidth onClick={() => navigate('/settings#verification')}>
              Get Verified
            </Button>
          </div>
        )}
      </div>
    </aside>
  )
}
