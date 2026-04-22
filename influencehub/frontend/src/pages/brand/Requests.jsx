import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import StatusChip from '../../components/ui/StatusChip'
import Avatar from '../../components/ui/Avatar'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import Textarea from '../../components/ui/Textarea'
import { Skeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../store/toastStore'
import client from '../../api/client'

const tabs = ['all', 'pending', 'accepted', 'rejected']

export default function Requests() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [requests, setRequests] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [reviewModal, setReviewModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [acting, setActing] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const campaignFilter = searchParams.get('campaign')

  const fetchRequests = () => {
    setLoading(true)
    client.get('/api/brand/requests')
      .then(res => {
        // Backend returns an array directly
        const data = Array.isArray(res.data) ? res.data : []
        const filtered = activeTab === 'all' ? data : data.filter(r => r.status?.toLowerCase() === activeTab)
        setRequests(filtered)
        setTotal(filtered.length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRequests() }, [activeTab, page])

  const handleAction = async (id, status, reason) => {
    setActing(true)
    try {
      await client.put(`/api/requests/${id}/status`, { status, reason })
      setRequests(requests.map(r => r.id === id ? { ...r, status: status.toUpperCase() } : r))
      toast.success(`Request ${status}`)
      setReviewModal(null)
    } catch { toast.error('Action failed') }
    finally { setActing(false) }
  }

  return (
    <AppLayout role="brand">
      <h1 className="text-[24px] font-bold text-[#1C1C1C] mb-[20px]">Collaboration Requests</h1>

      {/* Tabs */}
      <div className="flex gap-[4px] mb-[20px]">
        {tabs.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setPage(1) }}
            className={`px-[16px] py-[8px] rounded-full text-[13px] font-medium capitalize cursor-pointer transition-colors ${
              activeTab === tab ? 'bg-[#E8F5E6] text-[#108A00] border border-[#108A00]' : 'bg-white border border-[#E0E0DB] text-[#888888] hover:border-[#108A00]'
            }`}>
            {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        {campaignFilter && (
          <span className="ml-[8px] text-[12px] text-[#888888] self-center">Filtered by campaign</span>
        )}
      </div>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-[20px] space-y-[8px]">{[1,2,3,4,5].map(i => <Skeleton key={i} height={68} />)}</div>
        ) : !requests.length ? (
          <EmptyState icon={Inbox} title="No requests yet" description="Requests from creators will appear here when they apply to your campaigns." />
        ) : (
          <table className="w-full" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-[#FAFAF8] border-b border-[#F0F0EB]">
                {['Creator','Message','Date','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-[16px] py-[10px] text-[11px] font-semibold text-[#888888] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} className="border-b border-[#F0F0EB] h-[68px] hover:bg-[#FAFAF8]">
                  <td className="px-[16px]">
                    <div className="flex items-center gap-[8px]">
                      <Avatar name={req.creatorName} size={32} />
                      <span className="text-[13px] font-semibold text-[#1C1C1C] truncate">{req.creatorName}</span>
                    </div>
                  </td>
                  <td className="px-[16px] text-[13px] text-[#444444] truncate max-w-[160px]">{req.message || '--'}</td>
                  <td className="px-[16px] text-[12px] text-[#888888]">{req.timestamp ? new Date(req.timestamp).toLocaleDateString() : '--'}</td>
                  <td className="px-[16px]"><StatusChip status={req.status} /></td>
                  <td className="px-[16px]">
                    {(req.status === 'PENDING' || req.status === 'pending') && (
                      <div className="flex gap-[6px]">
                        <Button size="sm" className="!h-[28px] !text-[11px] !px-[10px]" onClick={() => handleAction(req.id, 'ACCEPTED')}>Accept</Button>
                        <Button variant="danger-outline" size="sm" className="!h-[28px] !text-[11px] !px-[10px]" onClick={() => setReviewModal(req)}>Reject</Button>
                      </div>
                    )}
                    {(req.status === 'ACCEPTED' || req.status === 'accepted') && (
                      <Button variant="ghost-green" size="sm" className="!h-[28px] !text-[11px] !px-[10px]" onClick={() => navigate('/messages')}>Message</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Pagination currentPage={page} totalPages={Math.ceil(total / 10) || 1} onPageChange={setPage} />

      {/* Reject Modal */}
      <Modal isOpen={!!reviewModal} onClose={() => { setReviewModal(null); setRejectReason('') }} title="Reject Request" size="sm"
        footer={<><Button variant="ghost-dark" onClick={() => setReviewModal(null)}>Cancel</Button><Button variant="danger" loading={acting} onClick={() => handleAction(reviewModal?.id, 'rejected', rejectReason)}>Reject Request</Button></>}>
        <div className="flex items-center gap-[8px] mb-[16px]">
          <Avatar name={reviewModal?.creatorName} size={36} />
          <div>
            <p className="text-[14px] font-semibold">{reviewModal?.creatorName}</p>
            <p className="text-[12px] text-[#888888]">{reviewModal?.campaignTitle}</p>
          </div>
        </div>
        <Textarea label="Reason for rejection (optional)" name="rejectReason" value={rejectReason} onChange={e => setRejectReason(e.target.value)}
          rows={3} placeholder="Help the creator understand why..." />
      </Modal>
    </AppLayout>
  )
}
