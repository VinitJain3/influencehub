import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, ExternalLink, CheckCircle, MessageSquare } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import TagPill from '../../components/ui/TagPill'
import StatCard from '../../components/ui/StatCard'
import Textarea from '../../components/ui/Textarea'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../store/toastStore'
import client from '../../api/client'

export default function CreatorProfile() {
  const { id } = useParams()
  const [creator, setCreator] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [description, setDescription] = useState('')
  const [requestSent, setRequestSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [similar, setSimilar] = useState([])
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    setLoading(true)
    client.get(`/api/creators/${id}`)
      .then(res => setCreator(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
    client.get(`/api/creators/${id}/similar`)
      .then(res => setSimilar(res.data || []))
      .catch(() => {})
  }, [id])

  const sendRequest = async () => {
    setSending(true)
    try {
      await client.post('/api/requests', { creatorId: creator?.userId, description })
      setRequestSent(true)
      toast.success('Collaboration request sent!')
      setTimeout(() => setIsRequestModalOpen(false), 2000)
    } catch { toast.error('Failed to send request') }
    finally { setSending(false) }
  }

  const startChat = async () => {
    if (!creator?.userId) return
    try {
      const res = await client.post('/api/conversations', { otherUserId: creator.userId })
      navigate(`/messages?conversationId=${res.data.id}`)
    } catch { toast.error('Failed to start conversation') }
  }

  if (!loading && !creator) {
    return <AppLayout role="brand"><EmptyState icon={CheckCircle} title="Creator not found" action={{ label: '← Back to Discover', onClick: () => navigate('/brand/discover') }} /></AppLayout>
  }

  return (
    <AppLayout role="brand">
      <Link to="/brand/discover" className="text-[13px] text-[#108A00] hover:underline mb-[12px] inline-block">Discover Creators</Link>
      <span className="text-[13px] text-[#888888] mx-[6px]">›</span>
      <span className="text-[13px] text-[#888888]">{creator?.name || '--'}</span>

      <div className="flex gap-[24px] items-start mt-[16px]">
        <div className="flex-1 min-w-0 flex flex-col gap-[20px]">
          {/* Hero Card */}
          <Card className="!p-0 overflow-hidden relative">
            <div className="h-[150px] bg-[#F0F0EB]" />
            <Avatar name={creator?.name} src={creator?.avatar} size={64}
              className="absolute top-[122px] left-[24px] border-[3px] border-white" />
            {!loading && (
              <div className="absolute top-[158px] right-[20px] flex gap-[8px]">
                <Button variant="ghost-dark" size="sm" onClick={startChat} icon={MessageSquare}>Message</Button>
                <Button size="sm" onClick={() => setIsRequestModalOpen(true)}>Request Collaboration</Button>
              </div>
            )}
            <div className="pt-[44px] px-[24px] pb-[22px]">
              {loading ? <Skeleton height={24} width={200} /> : (
                <>
                  <h1 className="text-[22px] font-bold text-[#1C1C1C]">{creator?.name}</h1>
                  <p className="text-[14px] text-[#888888]">@{creator?.handle}</p>
                  <div className="flex items-center gap-[8px] mt-[6px] flex-wrap">
                    {creator?.niche && <TagPill label={creator.niche} />}
                    <span className="text-[13px] text-[#888888]">{creator?.followers || '--'} Followers</span>
                  </div>
                  {creator?.location && (
                    <div className="flex items-center gap-[4px] mt-[6px] text-[13px] text-[#888888]">
                      <MapPin size={14} /> {creator.location}
                    </div>
                  )}
                  {creator?.website && (
                    <a href={creator.website} target="_blank" rel="noreferrer" className="flex items-center gap-[4px] mt-[4px] text-[13px] text-[#108A00] hover:underline">
                      <ExternalLink size={14} /> {creator.website}
                    </a>
                  )}
                  {creator?.bio && (
                    <p className={`text-[14px] text-[#444444] leading-[1.65] mt-[8px] ${!expanded ? 'line-clamp-3' : ''}`}>{creator.bio}</p>
                  )}
                  {creator?.bio?.length > 200 && (
                    <button onClick={() => setExpanded(!expanded)} className="text-[13px] text-[#108A00] hover:underline mt-[4px] cursor-pointer">
                      {expanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-[16px]">
            {['Total Followers','Avg Engagement','Posts/Month','Avg Reach'].map(label => (
              <StatCard key={label} label={label} value={creator?.stats?.[label.replace(/\s/g,'')] ?? '--'} loading={loading} />
            ))}
          </div>

          {/* Portfolio */}
          <Card>
            <h3 className="text-[16px] font-semibold text-[#1C1C1C] mb-[12px]">Portfolio</h3>
            {creator?.portfolio?.length ? (
              <div className="grid grid-cols-3 gap-[10px]">
                {creator.portfolio.map((img, i) => (
                  <div key={i} className="h-[150px] bg-[#F0F0EB] rounded-[8px] overflow-hidden">
                    <img src={img} alt="Portfolio" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#888888]">No portfolio items yet.</p>
            )}
          </Card>
        </div>

        {/* Right Rail */}
        <div className="w-[304px] flex-shrink-0 sticky top-[84px] flex flex-col gap-[16px]">
          {similar.length > 0 && (
            <Card>
              <h4 className="text-[14px] font-semibold text-[#1C1C1C] mb-[12px]">Similar Creators</h4>
              <div className="space-y-[10px]">
                {similar.slice(0, 3).map(s => (
                  <div key={s.id} className="flex items-center gap-[8px]">
                    <Avatar name={s.name} size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#1C1C1C] truncate">{s.name}</p>
                      <p className="text-[11px] text-[#888888]">{s.niche}</p>
                    </div>
                    <button onClick={() => navigate(`/brand/creator/${s.id}`)} className="text-[13px] text-[#108A00] hover:underline cursor-pointer">View →</button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Request Collaboration"
        size="sm"
        footer={
          !requestSent && (
            <div className="flex w-full gap-[12px]">
              <Button variant="ghost-dark" className="flex-1" onClick={() => setIsRequestModalOpen(false)}>Cancel</Button>
              <Button className="flex-1" loading={sending} onClick={sendRequest}>
                Send Request
              </Button>
            </div>
          )
        }
      >
        <div className="flex items-center gap-[12px] mb-[20px] p-[16px] bg-[#F5F5F0] rounded-[8px]">
          <Avatar name={creator?.name} src={creator?.avatar} size={48} />
          <div>
            <p className="text-[15px] font-bold text-[#1C1C1C]">{creator?.name || '--'}</p>
            <p className="text-[13px] text-[#888888]">@{creator?.handle}</p>
          </div>
        </div>

        {requestSent ? (
          <div className="text-center py-[24px]">
            <div className="w-[48px] h-[48px] bg-[#108A0015] rounded-full flex items-center justify-center mx-auto mb-[12px]">
              <CheckCircle size={24} className="text-[#108A00]" />
            </div>
            <h4 className="text-[18px] font-bold text-[#1C1C1C] mb-[4px]">Request Sent!</h4>
            <p className="text-[14px] text-[#888888]">The creator has been notified of your interest.</p>
          </div>
        ) : (
          <div className="space-y-[16px]">
            <Textarea 
              label="Description (Optional)" 
              name="description" 
              rows={4} 
              placeholder="Briefly describe what you're looking for and why you'd like to work with this creator..."
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
            <p className="text-[12px] text-[#888888] italic">
              The creator will be notified. You can discuss details once they accept.
            </p>
          </div>
        )}
      </Modal>
    </AppLayout>
  )
}
