import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Inbox } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import StatusChip from '../../components/ui/StatusChip'
import Avatar from '../../components/ui/Avatar'
import TagPill from '../../components/ui/TagPill'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import client from '../../api/client'

const tabs = ['all', 'pending', 'accepted', 'rejected']

export default function MyRequests() {
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [requests, setRequests] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    client.get('/api/influencer/requests', { params: { status: activeTab === 'all' ? undefined : activeTab, page } })
      .then(res => { setRequests(res.data.requests || []); setTotal(res.data.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeTab, page])

  return (
    <AppLayout role="influencer">
      <h1 className="text-[24px] font-bold text-[#1C1C1C] mb-[20px]">My Requests</h1>

      <div className="flex gap-[4px] mb-[20px]">
        {tabs.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setPage(1) }}
            className={`px-[16px] py-[8px] rounded-full text-[13px] font-medium capitalize cursor-pointer transition-colors ${
              activeTab === tab ? 'bg-[#E8F5E6] text-[#108A00] border border-[#108A00]' : 'bg-white border border-[#E0E0DB] text-[#888888] hover:border-[#108A00]'
            }`}>
            {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-[20px] space-y-[8px]">{[1,2,3,4,5].map(i => <Skeleton key={i} height={64} />)}</div>
        ) : !requests.length ? (
          <EmptyState icon={Inbox} title="No requests yet" description="Your collaboration requests will appear here."
            action={{ label: 'Browse Campaigns', onClick: () => navigate('/influencer/campaigns') }} />
        ) : (
          <table className="w-full" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-[#FAFAF8] border-b border-[#F0F0EB]">
                {['Brand','Campaign','Proposed Rate','Date','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-[16px] py-[10px] text-[11px] font-semibold text-[#888888] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} className="border-b border-[#F0F0EB] h-[64px] hover:bg-[#FAFAF8]">
                  <td className="px-[16px]">
                    <div className="flex items-center gap-[8px]">
                      <Avatar name={req.brandName} size={32} />
                      <span className="text-[13px] font-semibold text-[#1C1C1C] truncate">{req.brandName}</span>
                    </div>
                  </td>
                  <td className="px-[16px]">
                    <p className="text-[13px] text-[#444444] truncate">{req.campaignTitle}</p>
                    {req.category && <TagPill label={req.category} variant="neutral" />}
                  </td>
                  <td className="px-[16px] text-[13px] font-semibold text-[#1C1C1C]">{req.proposedRate ? `₹${req.proposedRate}` : '--'}</td>
                  <td className="px-[16px] text-[12px] text-[#888888]">{req.date}</td>
                  <td className="px-[16px]"><StatusChip status={req.status} /></td>
                  <td className="px-[16px]">
                    {req.status === 'accepted' && (
                      <Button variant="ghost-green" size="sm" className="!h-[28px] !text-[11px]" onClick={() => navigate('/messages')}>Message</Button>
                    )}
                    {req.status === 'pending' && (
                      <span className="text-[12px] text-[#888888]">Awaiting response</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Pagination currentPage={page} totalPages={Math.ceil(total / 10) || 1} onPageChange={setPage} />
    </AppLayout>
  )
}
