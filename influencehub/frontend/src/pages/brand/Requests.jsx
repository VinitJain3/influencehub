import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Inbox, ExternalLink } from 'lucide-react'
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
  const [allRequests, setAllRequests] = useState([]) // full list from API
  const [requests, setRequests] = useState([])       // filtered list
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
        const data = Array.isArray(res.data) ? res.data : []
        setAllRequests(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  // Filter client-side whenever tab or allRequests changes
  useEffect(() => {
    const filtered = activeTab === 'all'
      ? allRequests
      : allRequests.filter(r => r.status?.toLowerCase() === activeTab)
    setRequests(filtered)
    setTotal(filtered.length)
  }, [activeTab, allRequests])

  useEffect(() => { fetchRequests() }, [])

  const handleAction = async (id, status, reason) => {
    setActing(true)
    try {
      await client.put(`/api/requests/${id}/status`, { status, reason })
      // Update local state so UI reflects new status without refetch
      const updatedAll = allRequests.map(r =>
        r.id === id ? { ...r, status: status.toUpperCase() } : r
      )
      setAllRequests(updatedAll)
      toast.success(`Request ${status.toLowerCase()}ed successfully`)
      setReviewModal(null)
      setRejectReason('')
    } catch (err) {
      toast.error('Action failed. Please try again.')
    } finally {
      setActing(false)
    }
  }

  return (
    <AppLayout role="brand">
      <h1 className="text-[24px] font-bold text-[#1C1C1C] mb-[20px]">Collaboration Requests</h1>

      {/* Tabs */}
      <div className="flex gap-[4px] mb-[20px]">
        {tabs.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setPage(1) }}
            className={`px-[16px] py-[8px] rounded-full text-[13px] font-medium capitalize cursor-pointer transition-colors ${
              activeTab === tab
                ? 'bg-[#E8F5E6] text-[#108A00] border border-[#108A00]'
                : 'bg-white border border-[#E0E0DB] text-[#888888] hover:border-[#108A00]'
            }`}>
            {tab === 'all' ? `All (${allRequests.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
          <EmptyState
            icon={Inbox}
            title={activeTab === 'all' ? 'No requests yet' : `No ${activeTab} requests`}
            description="Requests you send to creators will appear here."
          />
        ) : (
          <table className="w-full" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-[#FAFAF8] border-b border-[#F0F0EB]">
                <th className="text-left px-[16px] py-[10px] text-[11px] font-semibold text-[#888888] uppercase w-[200px]">Creator</th>
                <th className="text-left px-[16px] py-[10px] text-[11px] font-semibold text-[#888888] uppercase">Description</th>
                <th className="text-left px-[16px] py-[10px] text-[11px] font-semibold text-[#888888] uppercase w-[110px]">Date</th>
                <th className="text-left px-[16px] py-[10px] text-[11px] font-semibold text-[#888888] uppercase w-[110px]">Status</th>
                <th className="text-left px-[16px] py-[10px] text-[11px] font-semibold text-[#888888] uppercase w-[200px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} className="border-b border-[#F0F0EB] h-[72px] hover:bg-[#FAFAF8]">
                  {/* Creator cell — click name to view profile */}
                  <td className="px-[16px]">
                    <div className="flex items-center gap-[8px]">
                      <Avatar name={req.creatorName} size={32} />
                      <div className="min-w-0">
                        <button
                          onClick={() => req.creatorProfileId && navigate(`/brand/creator/${req.creatorProfileId}`)}
                          className={`text-[13px] font-semibold text-[#1C1C1C] truncate block max-w-[120px] ${req.creatorProfileId ? 'hover:text-[#108A00] cursor-pointer' : ''}`}
                          title={req.creatorProfileId ? 'View creator profile' : req.creatorName}
                        >
                          {req.creatorName}
                        </button>
                        {req.creatorProfileId && (
                          <button
                            onClick={() => navigate(`/brand/creator/${req.creatorProfileId}`)}
                            className="text-[11px] text-[#108A00] hover:underline flex items-center gap-[2px] cursor-pointer"
                          >
                            <ExternalLink size={10} /> View Profile
                          </button>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-[16px] text-[13px] text-[#444444] max-w-[200px]">
                    <span className="line-clamp-2">{req.message || <span className="text-[#BBBBBB]">No description</span>}</span>
                  </td>

                  <td className="px-[16px] text-[12px] text-[#888888]">
                    {req.timestamp ? new Date(req.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '--'}
                  </td>

                  <td className="px-[16px]">
                    <StatusChip status={req.status} />
                  </td>

                  <td className="px-[16px]">
                    <div className="flex gap-[6px] flex-wrap">
                      {/* Accept / Reject buttons for PENDING requests */}
                      {(req.status === 'PENDING' || req.status === 'pending') && (
                        <>
                          <Button
                            size="sm"
                            className="!h-[28px] !text-[11px] !px-[10px]"
                            onClick={() => handleAction(req.id, 'ACCEPTED')}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="danger-outline"
                            size="sm"
                            className="!h-[28px] !text-[11px] !px-[10px]"
                            onClick={() => setReviewModal(req)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {/* Message button only shown after acceptance */}
                      {(req.status === 'ACCEPTED' || req.status === 'accepted') && (
                        <Button
                          variant="ghost-green"
                          size="sm"
                          className="!h-[28px] !text-[11px] !px-[10px]"
                          onClick={() => navigate('/messages')}
                        >
                          Message
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Pagination currentPage={page} totalPages={Math.ceil(total / 10) || 1} onPageChange={setPage} />

      {/* Reject Reason Modal */}
      <Modal
        isOpen={!!reviewModal}
        onClose={() => { setReviewModal(null); setRejectReason('') }}
        title="Reject Request"
        size="sm"
        footer={
          <>
            <Button variant="ghost-dark" onClick={() => { setReviewModal(null); setRejectReason('') }}>Cancel</Button>
            <Button
              variant="danger"
              loading={acting}
              onClick={() => handleAction(reviewModal?.id, 'REJECTED', rejectReason)}
            >
              Reject Request
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-[8px] mb-[16px]">
          <Avatar name={reviewModal?.creatorName} size={36} />
          <div>
            <p className="text-[14px] font-semibold">{reviewModal?.creatorName}</p>
            <p className="text-[12px] text-[#888888]">
              {reviewModal?.message ? `"${reviewModal.message.slice(0, 60)}${reviewModal.message.length > 60 ? '...' : ''}"` : 'No description provided'}
            </p>
          </div>
        </div>
        <Textarea
          label="Reason for rejection (optional)"
          name="rejectReason"
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          rows={3}
          placeholder="Help the creator understand why..."
        />
      </Modal>
    </AppLayout>
  )
}
