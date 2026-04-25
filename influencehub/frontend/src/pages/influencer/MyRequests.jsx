import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, Briefcase } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import StatusChip from '../../components/ui/StatusChip'
import Avatar from '../../components/ui/Avatar'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import client from '../../api/client'
import { useToast } from '../../store/toastStore'

const tabs = ['all', 'pending', 'accepted', 'rejected']

export default function MyRequests() {
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [allRequests, setAllRequests] = useState([])
  const [requests, setRequests] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  const startChat = async (userId) => {
    try {
      const res = await client.post('/api/conversations', { otherUserId: userId })
      navigate(`/messages?conversationId=${res.data.id}`)
    } catch { toast.error('Failed to start conversation') }
  }

  useEffect(() => {
    setLoading(true)
    client.get('/api/influencer/requests', { params: { page } })
      .then(res => {
        const data = res.data.requests || (Array.isArray(res.data) ? res.data : [])
        setAllRequests(data)
        setTotal(res.data.total || data.length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  // Filter client-side by tab
  useEffect(() => {
    const filtered = activeTab === 'all'
      ? allRequests
      : allRequests.filter(r => r.status?.toLowerCase() === activeTab)
    setRequests(filtered)
  }, [activeTab, allRequests])

  const updateStatus = async (id, newStatus) => {
    try {
      await client.put(`/api/requests/${id}/status`, { status: newStatus.toUpperCase() })
      // Update local state — keep lowercase to match backend response
      setAllRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus.toLowerCase() } : r))
      toast.success(`Request ${newStatus === 'accepted' ? 'accepted' : 'declined'}`)
    } catch {
      toast.error('Failed to update request status')
    }
  }

  return (
    <AppLayout role="influencer">
      <h1 className="text-[24px] font-bold text-[#1C1C1C] mb-[4px]">Incoming Requests</h1>
      <p className="text-[13px] text-[#888888] mb-[20px]">Collaboration requests sent to you directly by brands</p>

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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
          {[1,2,3,4].map(i => <Skeleton key={i} height={180} />)}
        </div>
      ) : !requests.length ? (
        <Card><EmptyState icon={Inbox} title="No incoming requests" description="Brands will send you collaboration requests here when they want to work with you."
          action={{ label: 'Browse Campaigns', onClick: () => navigate('/influencer/campaigns') }} /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
          {requests.map(req => (
            <Card key={req.id} className="flex flex-col">
              <div className="flex justify-between items-start mb-[12px]">
                <div className="flex items-center gap-[12px]">
                  <Avatar name={req.brandName} size={40} />
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#1C1C1C]">{req.brandName}</h3>
                    <p className="text-[12px] text-[#888888]">{req.date || '--'}</p>
                  </div>
                </div>
                <StatusChip status={req.status} />
              </div>
              
              <div className="p-[12px] bg-[#FAFAF8] rounded-[8px] border border-[#F0F0EB] mb-[16px] flex-1">
                <p className="text-[13px] text-[#444444] leading-[1.6] whitespace-pre-line">
                  {req.message || <span className="italic text-[#888888]">The brand hasn't provided a message.</span>}
                </p>
              </div>

              <div className="pt-[16px] border-t border-[#F0F0EB] flex gap-[8px] justify-between items-center mt-auto">
                {/* Left: View brand's campaigns */}
                <button
                  onClick={() => navigate(`/influencer/campaigns?brandId=${req.brandId}`)}
                  className="flex items-center gap-[5px] text-[12px] text-[#888888] hover:text-[#108A00] transition-colors cursor-pointer"
                  title="Browse this brand's campaigns"
                >
                  <Briefcase size={13} /> View Brand's Campaigns
                </button>

                {/* Right: Accept/Decline/Message */}
                <div className="flex gap-[8px]">
                  {req.status === 'pending' && (
                    <>
                      <Button variant="ghost-dark" size="sm" onClick={() => updateStatus(req.id, 'rejected')}>Decline</Button>
                      <Button size="sm" onClick={() => updateStatus(req.id, 'accepted')}>Accept</Button>
                    </>
                  )}
                  {req.status === 'accepted' && (
                    <Button variant="ghost-green" size="sm" onClick={() => startChat(req.brandId)}>Message Brand</Button>
                  )}
                  {req.status === 'rejected' && (
                    <span className="text-[12px] text-[#888888] font-medium py-[4px]">Declined</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={Math.ceil(total / 10) || 1} onPageChange={setPage} />
    </AppLayout>
  )
}
