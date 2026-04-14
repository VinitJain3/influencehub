import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MoreHorizontal, Edit, Pause, Play, Copy, X as XIcon, Trash2, Megaphone } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import StatusChip from '../../components/ui/StatusChip'
import TagPill from '../../components/ui/TagPill'
import DropdownMenu from '../../components/ui/DropdownMenu'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { useToast } from '../../store/toastStore'
import client from '../../api/client'

const tabs = ['all','active','paused','closed','draft']

export default function MyCampaigns() {
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [campaigns, setCampaigns] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(null)
  const [deleteText, setDeleteText] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()

  const fetchCampaigns = () => {
    setLoading(true)
    client.get('/api/brand/campaigns', { params: { status: activeTab === 'all' ? undefined : activeTab, page } })
      .then(res => { setCampaigns(res.data.campaigns || []); setTotal(res.data.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCampaigns() }, [activeTab, page])

  const updateStatus = async (id, status) => {
    const old = [...campaigns]
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, status } : c))
    try { await client.put(`/api/campaigns/${id}/status`, { status }) }
    catch { setCampaigns(old); toast.error('Failed to update status') }
  }

  const deleteCampaign = async () => {
    if (deleteText !== 'DELETE' || !deleteModal) return
    try {
      await client.delete(`/api/campaigns/${deleteModal}`)
      setCampaigns(campaigns.filter(c => c.id !== deleteModal))
      toast.success('Campaign deleted')
    } catch { toast.error('Failed to delete') }
    setDeleteModal(null); setDeleteText('')
  }

  return (
    <AppLayout role="brand">
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[24px] font-bold text-[#1C1C1C]">My Campaigns</h1>
        <Link to="/brand/campaigns/new"><Button size="sm">Post New Campaign +</Button></Link>
      </div>

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
      </div>

      {/* Table */}
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="p-[20px] space-y-[8px]">{[1,2,3,4,5,6].map(i => <Skeleton key={i} height={60} />)}</div>
        ) : !campaigns.length ? (
          <EmptyState icon={Megaphone} title="No campaigns found" description="Create your first campaign to start connecting with creators."
            action={{ label: 'Post Campaign', onClick: () => navigate('/brand/campaigns/new') }} />
        ) : (
          <table className="w-full" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-[#FAFAF8] border-b border-[#F0F0EB]">
                {[{l:'Campaign',w:'32%'},{l:'Status',w:'10%'},{l:'Budget',w:'12%'},{l:'Requests',w:'10%'},{l:'Accepted',w:'10%'},{l:'Posted',w:'12%'},{l:'Actions',w:'14%'}].map(h => (
                  <th key={h.l} style={{ width: h.w }} className="text-left px-[20px] py-[10px] text-[11px] font-semibold text-[#888888] uppercase">{h.l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id} className="border-b border-[#F0F0EB] h-[60px] hover:bg-[#FAFAF8]">
                  <td className="px-[20px]">
                    <p className="text-[14px] font-semibold text-[#1C1C1C] truncate">{c.title}</p>
                    {c.category && <TagPill label={c.category} variant="neutral" className="mt-[2px]" />}
                  </td>
                  <td className="px-[20px]"><StatusChip status={c.status} /></td>
                  <td className="px-[20px] text-[13px] font-semibold text-[#108A00]">{c.budget || '--'}</td>
                  <td className="px-[20px]">
                    <span className="text-[13px] text-[#1C1C1C]">{c.requestCount ?? 0}</span>
                    {c.requestCount > 0 && <Link to={`/brand/requests?campaign=${c.id}`} className="text-[12px] text-[#108A00] ml-[4px] hover:underline">View</Link>}
                  </td>
                  <td className="px-[20px] text-[13px]">{c.acceptedCount ?? 0}</td>
                  <td className="px-[20px] text-[12px] text-[#888888]">{c.postedDate || '--'}</td>
                  <td className="px-[20px]">
                    <DropdownMenu
                      trigger={<button className="w-[28px] h-[28px] flex items-center justify-center rounded hover:bg-[#F5F5F0] cursor-pointer"><MoreHorizontal size={16} className="text-[#888888]" /></button>}
                      items={[
                        { label: 'Edit', icon: Edit, onClick: () => navigate(`/brand/campaigns/${c.id}/edit`) },
                        c.status === 'paused' ? { label: 'Resume', icon: Play, onClick: () => updateStatus(c.id, 'active') } :
                        c.status !== 'closed' ? { label: 'Pause', icon: Pause, onClick: () => updateStatus(c.id, 'paused') } : null,
                        { label: 'Duplicate', icon: Copy, onClick: () => { client.post(`/api/campaigns/${c.id}/duplicate`).then(() => { toast.success('Campaign duplicated'); fetchCampaigns() }).catch(() => toast.error('Failed')) } },
                        { divider: true },
                        { label: 'Close', icon: XIcon, onClick: () => updateStatus(c.id, 'closed') },
                        { label: 'Delete', icon: Trash2, danger: true, onClick: () => setDeleteModal(c.id) },
                      ].filter(Boolean)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Pagination currentPage={page} totalPages={Math.ceil(total / 10) || 1} onPageChange={setPage} />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => { setDeleteModal(null); setDeleteText('') }} title="Delete Campaign" size="sm"
        footer={<><Button variant="ghost-dark" onClick={() => setDeleteModal(null)}>Cancel</Button><Button variant="danger" disabled={deleteText !== 'DELETE'} onClick={deleteCampaign}>Delete</Button></>}>
        <p className="text-[14px] text-[#444444] mb-[16px]">This action cannot be undone. Type <strong>DELETE</strong> to confirm.</p>
        <Input name="confirmDelete" value={deleteText} onChange={e => setDeleteText(e.target.value)} placeholder="Type DELETE" />
      </Modal>
    </AppLayout>
  )
}
