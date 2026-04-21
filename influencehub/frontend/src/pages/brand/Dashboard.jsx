import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart2, Users, Inbox, CheckCircle, Megaphone, ArrowRight, LayoutDashboard, Search, TrendingUp } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'
import Avatar from '../../components/ui/Avatar'
import TagPill from '../../components/ui/TagPill'
import StatusChip from '../../components/ui/StatusChip'
import EmptyState from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import HorizontalBarRanking from '../../components/charts/HorizontalBarRanking'
import { useAuthStore } from '../../store/authStore'
import client from '../../api/client'

export default function BrandDashboard() {
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    client.get('/api/brand/dashboard')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const hours = new Date().getHours()
  const greeting = hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening'

  return (
    <AppLayout role="brand">
      <div className="flex gap-[24px] items-start">
        {/* Main Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-[28px]">
          {/* Welcome Banner */}
          <div className="bg-white border border-[#E0E0DB] border-l-4 border-l-[#108A00] rounded-[10px] p-[18px_20px] flex justify-between items-center">
            <div>
              <h2 className="text-[18px] font-semibold text-[#1C1C1C]">Good {greeting}, {user?.companyName || user?.name || '--'} 👋</h2>
              <p className="text-[14px] text-[#888888] mt-[2px]">
                You have {data?.stats?.pendingRequests ?? '--'} new collaboration requests.
              </p>
            </div>
            <div className="flex gap-[8px]">
              <Button size="sm" onClick={() => navigate('/brand/requests')}>Review Requests</Button>
              <Button variant="ghost-dark" size="sm" onClick={() => navigate('/brand/campaigns/new')}>Post Campaign</Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-[16px]">
            {[
              { label: 'Active Campaigns', icon: Megaphone, key: 'activeCampaigns' },
              { label: 'Creators Reached', icon: Users, key: 'creatorsReached' },
              { label: 'Pending Requests', icon: Inbox, key: 'pendingRequests' },
              { label: 'Accepted Collabs', icon: CheckCircle, key: 'acceptedCollabs' },
            ].map((stat) => (
              <StatCard
                key={stat.key}
                label={stat.label}
                value={data?.stats?.[stat.key]}
                icon={stat.icon}
                loading={loading}
              />
            ))}
          </div>

          {/* Recommended Creators */}
          <div>
            <div className="flex justify-between items-center mb-[14px]">
              <h3 className="text-[16px] font-semibold text-[#1C1C1C]">Recommended Creators</h3>
              <Link to="/brand/discover" className="text-[13px] text-[#108A00] hover:underline">View All →</Link>
            </div>
            {loading ? (
              <div className="flex gap-[14px]">{[1,2,3,4].map(i => <Skeleton key={i} width={188} height={220} />)}</div>
            ) : !data?.recommendedCreators?.length ? (
              <Card><EmptyState icon={Users} title="No recommendations yet" description="Complete your profile to get creator matches." /></Card>
            ) : (
              <div className="flex gap-[14px] overflow-x-auto pb-[4px]">
                {data.recommendedCreators.map((creator) => (
                  <Card key={creator.id} className="!p-0 w-[188px] flex-shrink-0 overflow-hidden">
                    <div className="h-[86px] bg-[#F0F0EB] relative">
                      <Avatar name={creator.name} size={36} className="absolute -bottom-[18px] left-[12px] border-2 border-white" />
                    </div>
                    <div className="px-[12px] pt-[24px] pb-[12px]">
                      <p className="text-[13px] font-semibold text-[#1C1C1C] truncate">{creator.name}</p>
                      <p className="text-[11px] text-[#888888]">@{creator.handle}</p>
                      {creator.niche && <TagPill label={creator.niche} className="mt-[6px]" />}
                      <div className="flex flex-col gap-[6px] mt-[10px]">
                        <Button variant="ghost-dark" size="sm" fullWidth onClick={() => navigate(`/brand/creator/${creator.id}`)}>View Profile</Button>
                        <Button size="sm" fullWidth>Send Request</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Active Campaigns */}
          <div>
            <div className="flex justify-between items-center mb-[14px]">
              <h3 className="text-[16px] font-semibold text-[#1C1C1C]">Active Campaigns</h3>
              <Link to="/brand/campaigns" className="text-[13px] text-[#108A00] hover:underline">View All →</Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 gap-[16px]">{[1,2].map(i => <Skeleton key={i} height={140} />)}</div>
            ) : !data?.activeCampaigns?.length ? (
              <Card><EmptyState icon={Megaphone} title="No active campaigns" description="Post your first campaign to start discovering creators."
                action={{ label: 'Post Campaign', onClick: () => navigate('/brand/campaigns/new') }} /></Card>
            ) : (
              <div className="grid grid-cols-2 gap-[16px]">
                {data.activeCampaigns.map((campaign) => (
                  <Card key={campaign.id} hoverable onClick={() => navigate(`/brand/campaigns/${campaign.id}/edit`)}>
                    <div className="flex justify-between items-start mb-[8px]">
                      <h4 className="text-[15px] font-semibold text-[#1C1C1C] truncate flex-1">{campaign.title}</h4>
                      <StatusChip status={campaign.status} />
                    </div>
                    <div className="flex gap-[4px] mb-[8px]">{campaign.tags?.map((t,i) => <TagPill key={i} label={t} variant="neutral" />)}</div>
                    <p className="text-[13px] text-[#888888]">{campaign.requestCount ?? 0} requests</p>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Requests */}
          <div>
            <div className="flex justify-between items-center mb-[14px]">
              <h3 className="text-[16px] font-semibold text-[#1C1C1C]">Recent Requests</h3>
              <Link to="/brand/requests" className="text-[13px] text-[#108A00] hover:underline">View All →</Link>
            </div>
            {loading ? (
              <Card>{[1,2,3].map(i => <Skeleton key={i} height={60} className="mb-[8px]" />)}</Card>
            ) : !data?.recentRequests?.length ? (
              <Card><EmptyState icon={Inbox} title="No requests yet" description="Requests from creators will appear here." /></Card>
            ) : (
              <Card className="!p-0 overflow-hidden">
                <table className="w-full" style={{ tableLayout: 'fixed' }}>
                  <thead>
                    <tr className="bg-[#FAFAF8] border-b border-[#F0F0EB]">
                      {['Creator','Campaign','Date','Status','Actions'].map(h => (
                        <th key={h} className="text-left px-[20px] py-[10px] text-[11px] font-semibold text-[#888888] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentRequests.map((req) => (
                      <tr key={req.id} className="border-b border-[#F0F0EB] h-[60px] hover:bg-[#FAFAF8]">
                        <td className="px-[20px]">
                          <div className="flex items-center gap-[8px]">
                            <Avatar name={req.creatorName} size={32} />
                            <span className="text-[13px] font-medium text-[#1C1C1C] truncate">{req.creatorName}</span>
                          </div>
                        </td>
                        <td className="px-[20px] text-[13px] text-[#444444] truncate">{req.campaignTitle}</td>
                        <td className="px-[20px] text-[12px] text-[#888888]">{req.date}</td>
                        <td className="px-[20px]"><StatusChip status={req.status} /></td>
                        <td className="px-[20px]">
                          <div className="flex gap-[6px]">
                            {req.status === 'pending' && (
                              <>
                                <Button size="sm" className="!h-[28px] !text-[11px] !px-[10px]">Accept</Button>
                                <Button variant="danger-outline" size="sm" className="!h-[28px] !text-[11px] !px-[10px]">Reject</Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                { label: 'Post Campaign', icon: Megaphone, to: '/brand/campaigns/new' },
                { label: 'Discover Creators', icon: Search, to: '/brand/discover' },
                { label: 'Settings', icon: LayoutDashboard, to: '/settings' },
              ].map(action => (
                <Link key={action.to} to={action.to} className="flex items-center gap-[8px] p-[8px] rounded-[6px] hover:bg-[#F5F5F0] transition-colors text-[13px] text-[#444444]">
                  <action.icon size={16} className="text-[#888888]" />
                  {action.label}
                  <ArrowRight size={12} className="ml-auto text-[#888888]" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
