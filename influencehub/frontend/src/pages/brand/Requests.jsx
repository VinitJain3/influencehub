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
        const data = res.data.requests || (Array.isArray(res.data) ? res.data : [])
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
          {[1,2,3,4].map(i => <Skeleton key={i} height={180} />)}
        </div>
      ) : !requests.length ? (
        <Card><EmptyState icon={Inbox} title="No requests found" description="Requests you send to creators or applications from creators will appear here." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
          {requests.map(req => {
            const isOutbound = req.initiatedBy === 'BRAND'
            return (
              <Card key={req.id} className="flex flex-col">
                <div className="flex justify-between items-start mb-[12px]">
                  <div className="flex items-center gap-[12px]">
                    <Avatar name={req.creatorName} size={40} />
                    <div className="min-w-0">
                      <button
                        onClick={() => navigate(`/brand/creator/${req.creatorId}`)}
                        className="text-[15px] font-semibold text-[#1C1C1C] hover:text-[#108A00] truncate block max-w-[150px] text-left cursor-pointer"
                        title="View Profile"
                      >
                        {req.creatorName}
                      </button>
                      <p className="text-[12px] text-[#888888]">{req.date || '--'}</p>
                    </div>
                  </div>
                  <StatusChip status={req.status} />
                </div>
                
                {/* Outbound requests just have a message, inbound usually have a campaign and rate */}
                <div className="flex-1 flex flex-col gap-[8px] mb-[16px]">
                  {!isOutbound && req.campaignTitle && (
                    <div className="bg-[#FAFAF8] p-[8px] rounded-[6px] border border-[#F0F0EB]">
                      <p className="text-[10px] uppercase font-semibold text-[#888888] mb-[2px]">Applied to Campaign</p>
                      <p className="text-[13px] font-semibold text-[#1C1C1C] line-clamp-1">{req.campaignTitle}</p>
                    </div>
                  )}
                  
                  {!isOutbound && req.proposedRate && (
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-[#888888] mb-[2px]">Proposed Rate</p>
                      <p className="text-[16px] font-bold text-[#108A00]">₹{req.proposedRate}</p>
                    </div>
                  )}

                  <div className="mt-[4px]">
                    <p className="text-[10px] uppercase font-semibold text-[#888888] mb-[4px]">Message</p>
                    <p className="text-[13px] text-[#444444] line-clamp-3 leading-[1.5]">
                      {req.message || <span className="italic text-[#BBBBBB]">No message provided</span>}
                    </p>
                  </div>
                </div>

                <div className="pt-[16px] border-t border-[#F0F0EB] flex gap-[8px] justify-end mt-auto">
                  {(req.status === 'PENDING' || req.status === 'pending') && (
                    isOutbound ? (
                      <span className="text-[12px] text-[#888888] font-medium py-[4px]">Awaiting creator response</span>
                    ) : (
                      <>
                        <Button variant="ghost-dark" size="sm" onClick={() => setReviewModal(req)}>Reject</Button>
                        <Button size="sm" onClick={() => handleAction(req.id, 'ACCEPTED')}>Accept</Button>
                      </>
                    )
                  )}
                  {(req.status === 'ACCEPTED' || req.status === 'accepted') && (
                    <Button variant="ghost-green" size="sm" onClick={() => navigate('/messages')}>Message Creator</Button>
                  )}
                  {(req.status === 'REJECTED' || req.status === 'rejected') && (
                    <span className="text-[12px] text-[#888888] font-medium py-[4px]">
                      {isOutbound ? 'Declined by creator' : 'Rejected'}
                    </span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

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
