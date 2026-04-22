import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Inbox, Megaphone, DollarSign, FileText } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import StatusChip from '../../components/ui/StatusChip'
import Avatar from '../../components/ui/Avatar'
import TagPill from '../../components/ui/TagPill'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import client from '../../api/client'

const tabs = ['all', 'pending', 'accepted', 'rejected']

export default function MyRequests() {
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [allRequests, setAllRequests] = useState([])
  const [requests, setRequests] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [detailModal, setDetailModal] = useState(null)
  const navigate = useNavigate()

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
                <tr
                  key={req.id}
                  className="border-b border-[#F0F0EB] h-[64px] hover:bg-[#FAFAF8] cursor-pointer"
                  onClick={() => setDetailModal(req)}
                >
                  <td className="px-[16px]">
                    <div className="flex items-center gap-[8px]">
                      <Avatar name={req.brandName} size={32} />
                      <span className="text-[13px] font-semibold text-[#1C1C1C] truncate">{req.brandName}</span>
                    </div>
                  </td>
                  <td className="px-[16px]">
                    <p className="text-[13px] text-[#444444] truncate">{req.campaignTitle || '--'}</p>
                    {req.category && <TagPill label={req.category} variant="neutral" />}
                  </td>
                  <td className="px-[16px] text-[13px] font-semibold text-[#1C1C1C]">{req.proposedRate ? `₹${req.proposedRate}` : '--'}</td>
                  <td className="px-[16px] text-[12px] text-[#888888]">{req.date || '--'}</td>
                  <td className="px-[16px]"><StatusChip status={req.status} /></td>
                  <td className="px-[16px]" onClick={e => e.stopPropagation()}>
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

      {/* ── Request Detail Modal ── */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title="Application Details"
        size="md"
        footer={
          <div className="flex gap-[8px] w-full justify-end">
            <Button variant="ghost-dark" onClick={() => setDetailModal(null)}>Close</Button>
            {detailModal?.status === 'accepted' && (
              <Button variant="ghost-green" onClick={() => navigate('/messages')}>Message Brand</Button>
            )}
            {detailModal?.campaignTitle && (
              <Button onClick={() => { setDetailModal(null); navigate('/influencer/campaigns') }}>Browse More Campaigns</Button>
            )}
          </div>
        }
      >
        {detailModal && (
          <div className="space-y-[20px]">
            {/* Brand Info */}
            <div className="flex items-center gap-[12px] p-[14px] bg-[#FAFAF8] rounded-[10px]">
              <Avatar name={detailModal.brandName} size={44} />
              <div>
                <p className="text-[15px] font-semibold text-[#1C1C1C]">{detailModal.brandName}</p>
                <div className="flex items-center gap-[8px] mt-[2px]">
                  <StatusChip status={detailModal.status} />
                  <span className="text-[11px] text-[#888888]">Applied on {detailModal.date || '--'}</span>
                </div>
              </div>
            </div>

            {/* Campaign */}
            {detailModal.campaignTitle && (
              <div>
                <p className="text-[11px] font-semibold text-[#888888] uppercase mb-[8px] flex items-center gap-[6px]">
                  <Megaphone size={12} /> Campaign
                </p>
                <div className="p-[12px] border border-[#E0E0DB] rounded-[8px] flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-semibold text-[#1C1C1C]">{detailModal.campaignTitle}</p>
                    {detailModal.category && <p className="text-[12px] text-[#888888] mt-[2px]">{detailModal.category}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Proposed Rate */}
            {detailModal.proposedRate && (
              <div>
                <p className="text-[11px] font-semibold text-[#888888] uppercase mb-[8px] flex items-center gap-[6px]">
                  <DollarSign size={12} /> Your Proposed Rate
                </p>
                <p className="text-[20px] font-bold text-[#108A00]">₹{detailModal.proposedRate}</p>
              </div>
            )}

            {/* Cover Message */}
            <div>
              <p className="text-[11px] font-semibold text-[#888888] uppercase mb-[8px] flex items-center gap-[6px]">
                <FileText size={12} /> Your Message
              </p>
              <div className="p-[12px] bg-[#FAFAF8] rounded-[8px] border border-[#E0E0DB]">
                <p className="text-[14px] text-[#444444] leading-[1.6] whitespace-pre-line">
                  {detailModal.message
                    ? detailModal.message.replace(/\nProposed Rate:.*/, '').trim()
                    : <span className="text-[#BBBBBB] italic">No message provided</span>
                  }
                </p>
              </div>
            </div>

            {/* Status-specific hint */}
            {detailModal.status === 'rejected' && (
              <div className="p-[12px] bg-[#FDEDEC] rounded-[8px] border border-[#F5C6C2]">
                <p className="text-[13px] text-[#C0392B] font-medium">Your application was not selected for this campaign.</p>
                <p className="text-[12px] text-[#888888] mt-[4px]">Don't give up — browse more campaigns to find your next opportunity!</p>
              </div>
            )}
            {detailModal.status === 'accepted' && (
              <div className="p-[12px] bg-[#E8F5E6] rounded-[8px] border border-[#B2DFB0]">
                <p className="text-[13px] text-[#108A00] font-medium">🎉 Congratulations! Your application was accepted.</p>
                <p className="text-[12px] text-[#444444] mt-[4px]">You can now message the brand to coordinate next steps.</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AppLayout>
  )
}
