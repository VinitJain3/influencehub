import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCircle, Megaphone, MessageSquare, Send, User, Settings as SettingsIcon, Inbox } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import client from '../../api/client'

const tabs = ['all', 'campaigns', 'requests', 'messages', 'system']

const typeIcons = {
  campaign: Megaphone,
  request: Send,
  message: MessageSquare,
  system: Bell,
  accepted: CheckCircle,
  profile: User,
}

export default function Notifications() {
  const role = useAuthStore((s) => s.role)
  const [activeTab, setActiveTab] = useState('all')
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { markAllRead } = useNotificationStore()
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    client.get('/api/notifications', { params: { type: activeTab === 'all' ? undefined : activeTab } })
      .then(res => setNotifications(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeTab])

  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    markAllRead()
    try { await client.put('/api/notifications/read-all') } catch {}
  }

  return (
    <AppLayout role={role}>
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[24px] font-bold text-[#1C1C1C]">Notifications</h1>
        <div className="flex gap-[10px]">
          <Button variant="ghost-dark" size="sm" onClick={markAllAsRead}>Mark all read</Button>
          <Button variant="ghost-dark" size="sm" leftIcon={SettingsIcon} onClick={() => navigate('/settings#notifications')}>Preferences</Button>
        </div>
      </div>

      <div className="flex gap-[4px] mb-[20px]">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-[16px] py-[8px] rounded-full text-[13px] font-medium capitalize cursor-pointer transition-colors ${
              activeTab === tab ? 'bg-[#E8F5E6] text-[#108A00] border border-[#108A00]' : 'bg-white border border-[#E0E0DB] text-[#888888] hover:border-[#108A00]'
            }`}>
            {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <Card className="!p-0">
        {loading ? (
          <div className="p-[20px] space-y-[6px]">{[1,2,3,4,5].map(i => <Skeleton key={i} height={64} />)}</div>
        ) : !notifications.length ? (
          <EmptyState icon={Inbox} title="No notifications" description="You're all caught up!" />
        ) : (
          <div>
            {notifications.map((n, i) => {
              const Icon = typeIcons[n.type] || Bell
              return (
                <button
                  key={n.id || i}
                  onClick={() => n.link && navigate(n.link)}
                  className={`w-full flex items-start gap-[12px] px-[20px] py-[14px] border-b border-[#F0F0EB] text-left cursor-pointer transition-colors hover:bg-[#FAFAF8] ${
                    !n.read ? 'bg-[#F5FCF4]' : ''
                  }`}
                >
                  <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center flex-shrink-0 mt-[2px] ${!n.read ? 'bg-[#E8F5E6]' : 'bg-[#F0F0EB]'}`}>
                    <Icon size={16} className={!n.read ? 'text-[#108A00]' : 'text-[#888888]'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] leading-[1.5] ${!n.read ? 'font-semibold text-[#1C1C1C]' : 'text-[#444444]'}`}>
                      {n.text}
                    </p>
                    <p className="text-[11px] text-[#888888] mt-[2px]">{n.time}</p>
                  </div>
                  {!n.read && <span className="w-[8px] h-[8px] rounded-full bg-[#108A00] flex-shrink-0 mt-[8px]" />}
                </button>
              )
            })}
          </div>
        )}
      </Card>
    </AppLayout>
  )
}
