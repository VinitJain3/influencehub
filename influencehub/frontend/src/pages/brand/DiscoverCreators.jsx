import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, SearchX, CheckCircle } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import TagPill from '../../components/ui/TagPill'
import Textarea from '../../components/ui/Textarea'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../store/toastStore'
import { useAuthStore } from '../../store/authStore'
import client from '../../api/client'

export default function DiscoverCreators() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [requestModal, setRequestModal] = useState(null) // { creator }
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const user = useAuthStore((s) => s.user)

  const hours = new Date().getHours()
  const greeting = hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening'

  useEffect(() => {
    setLoading(true)
    client.get('/api/creators')
      .then(res => setResults(res.data.creators || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const openRequestModal = (creator) => {
    setRequestModal(creator)
    setDescription('')
    setRequestSent(false)
  }

  const sendRequest = async () => {
    if (!requestModal) return
    setSending(true)
    try {
      await client.post('/api/requests', { creatorId: requestModal.userId, description })
      setRequestSent(true)
      toast.success('Collaboration request sent!')
      setTimeout(() => {
        setRequestModal(null)
        setRequestSent(false)
      }, 2000)
    } catch {
      toast.error('Failed to send request')
    } finally {
      setSending(false)
    }
  }

  return (
    <AppLayout role="brand">
      {/* Welcome Greeting Banner */}
      <div className="bg-white border border-[#E0E0DB] border-l-4 border-l-[#108A00] rounded-[10px] p-[18px_20px] mb-[24px]">
        <h2 className="text-[18px] font-semibold text-[#1C1C1C]">
          Good {greeting}, {user?.companyName || user?.name || 'there'} 👋
        </h2>
        <p className="text-[14px] text-[#888888] mt-[4px]">
          Now you can discover creators and send collaboration requests directly!
        </p>
      </div>

      {/* Creators Grid */}
      <div>
        <div className="flex justify-between items-center mb-[16px]">
          <h3 className="text-[16px] font-semibold text-[#1C1C1C]">
            All Creators {!loading && `(${results.length})`}
          </h3>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-[14px]">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} height={220} />
            ))}
          </div>
        ) : !results.length ? (
          <Card>
            <EmptyState
              icon={SearchX}
              title="No creators found"
              description="Creators will appear here once they register on the platform."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-[14px]">
            {results.map(c => (
              <Card key={c.id} hoverable className="!p-0 overflow-hidden">
                <div className="h-[80px] bg-[#F0F0EB] relative">
                  <Avatar name={c.name} size={40} className="absolute -bottom-[20px] left-[14px] border-2 border-white" />
                </div>
                <div className="p-[28px_14px_14px]">
                  <p className="text-[14px] font-semibold text-[#1C1C1C] truncate">{c.name}</p>
                  <p className="text-[12px] text-[#888888]">@{c.handle}</p>
                  {c.niche && <TagPill label={c.niche} className="mt-[4px]" />}
                  {c.followers && (
                    <p className="text-[12px] text-[#888888] mt-[4px]">{c.followers} followers</p>
                  )}
                  <div className="flex gap-[6px] mt-[10px]">
                    <Button
                      variant="ghost-dark"
                      size="sm"
                      fullWidth
                      onClick={() => navigate(`/brand/creator/${c.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      fullWidth
                      onClick={() => openRequestModal(c)}
                    >
                      Request
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Request Modal */}
      <Modal
        isOpen={!!requestModal}
        onClose={() => { setRequestModal(null); setRequestSent(false) }}
        title="Send Collaboration Request"
        size="sm"
        footer={
          !requestSent && (
            <div className="flex w-full gap-[12px]">
              <Button variant="ghost-dark" className="flex-1" onClick={() => setRequestModal(null)}>
                Cancel
              </Button>
              <Button className="flex-1" loading={sending} onClick={sendRequest}>
                Send Request
              </Button>
            </div>
          )
        }
      >
        {requestSent ? (
          <div className="text-center py-[24px]">
            <div className="w-[48px] h-[48px] bg-[#108A0015] rounded-full flex items-center justify-center mx-auto mb-[12px]">
              <CheckCircle size={24} className="text-[#108A00]" />
            </div>
            <h4 className="text-[18px] font-bold text-[#1C1C1C] mb-[4px]">Request Sent!</h4>
            <p className="text-[14px] text-[#888888]">
              {requestModal?.name} has been notified of your interest.
            </p>
          </div>
        ) : (
          <div className="space-y-[16px]">
            <div className="flex items-center gap-[12px] p-[12px] bg-[#F5F5F0] rounded-[8px]">
              <Avatar name={requestModal?.name} size={40} />
              <div>
                <p className="text-[14px] font-semibold text-[#1C1C1C]">{requestModal?.name}</p>
                <p className="text-[12px] text-[#888888]">@{requestModal?.handle}</p>
              </div>
            </div>
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
