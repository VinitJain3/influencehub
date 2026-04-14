import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Megaphone, Send, CheckCircle, TrendingUp, ArrowRight, Inbox, BarChart2, User } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'
import Avatar from '../../components/ui/Avatar'
import TagPill from '../../components/ui/TagPill'
import StatusChip from '../../components/ui/StatusChip'
import EmptyState from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import AreaChartComponent from '../../components/charts/AreaChart'
import ChartCard from '../../components/charts/ChartCard'
import { useAuthStore } from '../../store/authStore'
import client from '../../api/client'

export default function InfluencerDashboard() {
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    client.get('/api/influencer/dashboard')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const hours = new Date().getHours()
  const greeting = hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening'

  return (
    <AppLayout role="influencer">
      <div className="flex gap-[24px] items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-[28px]">
          {/* Welcome */}
          <div className="bg-white border border-[#E0E0DB] border-l-4 border-l-[#108A00] rounded-[10px] p-[18px_20px] flex justify-between items-center">
            <div>
              <h2 className="text-[18px] font-semibold text-[#1C1C1C]">Good {greeting}, {user?.name || '--'} 👋</h2>
              <p className="text-[14px] text-[#888888] mt-[2px]">
                {data?.stats?.newCampaigns ?? '--'} new campaigns match your profile.
              </p>
            </div>
            <div className="flex gap-[8px]">
              <Button size="sm" onClick={() => navigate('/influencer/campaigns')}>Browse Campaigns</Button>
              <Button variant="ghost-dark" size="sm" onClick={() => navigate('/influencer/profile')}>Edit Profile</Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-[16px]">
            {[
              { label: 'Active Collabs', icon: CheckCircle, key: 'activeCollabs' },
              { label: 'Pending Requests', icon: Send, key: 'pendingRequests' },
              { label: 'Total Earnings', icon: TrendingUp, key: 'totalEarnings' },
              { label: 'Profile Views', icon: User, key: 'profileViews' },
            ].map(s => <StatCard key={s.key} label={s.label} icon={s.icon} value={data?.stats?.[s.key]} loading={loading} />)}
          </div>

          {/* Earnings Chart */}
          <ChartCard title="Earnings Overview" subtitle="Your monthly earnings">
            {loading ? <Skeleton height={220} /> : <AreaChartComponent data={data?.earningsChart || []} height={220} />}
          </ChartCard>

          {/* Matching Campaigns */}
          <div>
            <div className="flex justify-between items-center mb-[14px]">
              <h3 className="text-[16px] font-semibold text-[#1C1C1C]">Campaigns For You</h3>
              <Link to="/influencer/campaigns" className="text-[13px] text-[#108A00] hover:underline">View All →</Link>
            </div>
            {loading ? (
              <div className="space-y-[10px]">{[1,2,3].map(i => <Skeleton key={i} height={90} />)}</div>
            ) : !data?.matchingCampaigns?.length ? (
              <Card><EmptyState icon={Megaphone} title="No matching campaigns" description="Complete your profile to get better matches." /></Card>
            ) : (
              <div className="space-y-[10px]">
                {data.matchingCampaigns.map(c => (
                  <Card key={c.id} hoverable onClick={() => navigate(`/influencer/campaigns/${c.id}`)}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-[8px] mb-[4px]">
                          <Avatar name={c.brandName} size={28} />
                          <span className="text-[12px] text-[#888888]">{c.brandName}</span>
                        </div>
                        <h4 className="text-[15px] font-semibold text-[#1C1C1C]">{c.title}</h4>
                        <div className="flex gap-[4px] mt-[6px]">
                          {c.tags?.map((t, i) => <TagPill key={i} label={t} variant="neutral" />)}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-[16px]">
                        <p className="text-[16px] font-bold text-[#108A00]">{c.budget || '--'}</p>
                        <p className="text-[11px] text-[#888888]">{c.deadline || '--'}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-[16px] font-semibold text-[#1C1C1C] mb-[14px]">Recent Activity</h3>
            {loading ? (
              <Card>{[1,2,3].map(i => <Skeleton key={i} height={48} className="mb-[8px]" />)}</Card>
            ) : !data?.recentActivity?.length ? (
              <Card><EmptyState icon={Inbox} title="No recent activity" /></Card>
            ) : (
              <Card>
                <div className="space-y-[12px]">
                  {data.recentActivity.map((event, i) => (
                    <div key={i} className="flex items-center gap-[10px] py-[6px]">
                      <div className="w-[36px] h-[36px] rounded-full bg-[#E8F5E6] flex items-center justify-center flex-shrink-0">
                        {event.type === 'accepted' && <CheckCircle size={16} className="text-[#108A00]" />}
                        {event.type === 'request' && <Send size={16} className="text-[#108A00]" />}
                        {event.type === 'campaign' && <Megaphone size={16} className="text-[#108A00]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-[#1C1C1C]">{event.text}</p>
                        <p className="text-[11px] text-[#888888]">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Right Rail */}
        <div className="w-[304px] flex-shrink-0 sticky top-[84px] flex flex-col gap-[16px]">
          <Card>
            <h4 className="text-[14px] font-semibold text-[#1C1C1C] mb-[12px]">Quick Actions</h4>
            <div className="space-y-[8px]">
              {[
                { label: 'Browse Campaigns', icon: Megaphone, to: '/influencer/campaigns' },
                { label: 'My Requests', icon: Inbox, to: '/influencer/requests' },
                { label: 'Analytics', icon: BarChart2, to: '/influencer/analytics' },
                { label: 'Edit Profile', icon: User, to: '/influencer/profile' },
              ].map(action => (
                <Link key={action.to} to={action.to} className="flex items-center gap-[8px] p-[8px] rounded-[6px] hover:bg-[#F5F5F0] transition-colors text-[13px] text-[#444444]">
                  <action.icon size={16} className="text-[#888888]" />
                  {action.label}
                  <ArrowRight size={12} className="ml-auto text-[#888888]" />
                </Link>
              ))}
            </div>
          </Card>
          <Card className="bg-[#E8F5E6] border-[#C5E0C3]">
            <p className="text-[13px] font-semibold text-[#1C1C1C] mb-[2px]">💡 Profile Tip</p>
            <p className="text-[12px] text-[#444444] leading-[1.6]">Add portfolio samples and update your engagement rate to appear higher in search results.</p>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
