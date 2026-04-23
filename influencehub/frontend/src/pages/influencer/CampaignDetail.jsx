import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Users, CheckCircle, Clock, DollarSign, FileText } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import TagPill from '../../components/ui/TagPill'
import Textarea from '../../components/ui/Textarea'
import Input from '../../components/ui/Input'
import EmptyState from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../store/toastStore'
import client from '../../api/client'

export default function CampaignDetail() {
  const { id } = useParams()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [proposedRate, setProposedRate] = useState('')
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  const startChat = async (userId) => {
    try {
      const res = await client.post('/api/conversations', { otherUserId: userId })
      navigate(`/messages?conversationId=${res.data.id}`)
    } catch { toast.error('Failed to start conversation') }
  }

  useEffect(() => {
    client.get(`/api/campaigns/${id}`)
      .then(res => { 
        setCampaign(res.data)
        setApplied(res.data.hasApplied || false)
        setApplicationStatus(res.data.applicationStatus)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const applyToCampaign = async () => {
    setApplying(true)
    try {
      await client.post('/api/requests', { campaignId: id, message, proposedRate })
      setApplied(true)
      setApplicationStatus('pending')
      toast.success('Application sent!')
    } catch { toast.error('Failed to apply') }
    finally { setApplying(false) }
  }

  if (!loading && !campaign) {
    return <AppLayout role="influencer"><EmptyState icon={FileText} title="Campaign not found" action={{ label: '← Back', onClick: () => navigate('/influencer/campaigns') }} /></AppLayout>
  }

  return (
    <AppLayout role="influencer">
      <Link to="/influencer/campaigns" className="text-[13px] text-[#108A00] hover:underline mb-[12px] inline-block">Browse Campaigns</Link>
      <span className="text-[13px] text-[#888888] mx-[6px]">›</span>
      <span className="text-[13px] text-[#888888]">{campaign?.title || '--'}</span>

      <div className="flex gap-[24px] items-start mt-[16px]">
        <div className="flex-1 min-w-0 flex flex-col gap-[20px]">
          <Card>
            {loading ? <Skeleton height={200} /> : (
              <>
                <div className="flex items-center gap-[10px] mb-[16px]">
                  <Avatar name={campaign?.brandName} size={40} />
                  <div>
                    <p className="text-[14px] font-semibold text-[#1C1C1C]">{campaign?.brandName}</p>
                    <p className="text-[12px] text-[#888888]">{campaign?.industry}</p>
                  </div>
                  {campaign?.verified && <span className="text-[12px] text-[#108A00] font-semibold ml-auto">✓ Verified Brand</span>}
                </div>

                <h1 className="text-[22px] font-bold text-[#1C1C1C] mb-[8px]">{campaign?.title}</h1>
                <p className="text-[14px] text-[#444444] leading-[1.7] mb-[16px] whitespace-pre-line">{campaign?.description}</p>

                <div className="flex gap-[4px] flex-wrap mb-[16px]">
                  {campaign?.contentTypes?.map((t, i) => <TagPill key={i} label={t} />)}
                  {campaign?.platforms?.map((p, i) => <TagPill key={`p${i}`} label={p} variant="info" />)}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-[12px] bg-[#FAFAF8] rounded-[8px] p-[16px] mb-[16px]">
                  {[
                    { icon: DollarSign, label: 'Budget', value: campaign?.budget || '--' },
                    { icon: Calendar, label: 'Deadline', value: campaign?.deadline || '--' },
                    { icon: Users, label: 'Creators Needed', value: campaign?.creatorCount || '--' },
                    { icon: Clock, label: 'Posted', value: campaign?.postedDate || '--' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-[8px]">
                      <item.icon size={16} className="text-[#888888]" />
                      <div>
                        <p className="text-[10px] text-[#888888] font-semibold uppercase">{item.label}</p>
                        <p className="text-[14px] font-semibold text-[#1C1C1C]">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {campaign?.deliverables && (
                  <div className="mb-[16px]">
                    <h3 className="text-[14px] font-semibold text-[#1C1C1C] mb-[6px]">Deliverables</h3>
                    <p className="text-[14px] text-[#444444] whitespace-pre-line">{campaign.deliverables}</p>
                  </div>
                )}

                {campaign?.requirements && (
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#1C1C1C] mb-[6px]">Requirements</h3>
                    <ul className="space-y-[6px]">
                      {(typeof campaign.requirements === 'string' ? campaign.requirements.split('\n') : campaign.requirements).map((r, i) => (
                        <li key={i} className="flex items-center gap-[6px] text-[14px] text-[#444444]">
                          <CheckCircle size={14} className="text-[#108A00] flex-shrink-0" /> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        {/* Right Rail */}
        <div className="w-[304px] flex-shrink-0 sticky top-[84px] flex flex-col gap-[16px]">
          <Card>
            {applied ? (
              <div className="text-center py-[16px]">
                {applicationStatus === 'accepted' ? (
                  <>
                    <div className="w-[48px] h-[48px] bg-[#E8F5E6] rounded-full flex items-center justify-center mx-auto mb-[12px]">
                      <span className="text-[20px]">🎉</span>
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#108A00] mb-[4px]">Congratulations!</h3>
                    <p className="text-[13px] text-[#444444] leading-[1.5]">Your request is accepted. You can now talk to the brand.</p>
                    <Button fullWidth className="mt-[16px]" onClick={() => startChat(campaign?.brandId)}>Message Brand</Button>
                  </>
                ) : applicationStatus === 'rejected' ? (
                  <>
                    <div className="w-[48px] h-[48px] bg-[#FDEDEC] rounded-full flex items-center justify-center mx-auto mb-[12px]">
                      <span className="text-[20px]">✗</span>
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#C0392B] mb-[4px]">Not Selected</h3>
                    <p className="text-[13px] text-[#888888] leading-[1.5]">Your request was rejected. Keep exploring!</p>
                    <Button variant="ghost-dark" fullWidth className="mt-[16px]" onClick={() => navigate('/influencer/campaigns')}>Browse More</Button>
                  </>
                ) : (
                  <>
                    <CheckCircle size={28} className="text-[#108A00] mx-auto mb-[8px]" />
                    <h3 className="text-[16px] font-semibold text-[#1C1C1C] mb-[4px]">Application Sent</h3>
                    <p className="text-[13px] text-[#888888] leading-[1.5]">Please wait for your request to be accepted.</p>
                  </>
                )}
              </div>
            ) : (
              <>
                <h3 className="text-[15px] font-semibold text-[#1C1C1C] mb-[14px]">Apply to Campaign</h3>
                <Input label="Your Proposed Rate" name="rate" prefix="₹" type="number" placeholder="E.g. 15000" value={proposedRate} onChange={e => setProposedRate(e.target.value)} />
                <Textarea label="Cover Message" name="message" rows={4} className="mt-[12px]" value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Tell the brand why you're a great fit..." maxLength={500} showCount />
                <Button fullWidth className="mt-[16px] !h-[44px]" loading={applying} onClick={applyToCampaign}>Submit Application →</Button>
                <p className="text-[12px] text-[#888888] text-center mt-[8px]">Your profile will be shared with the brand.</p>
              </>
            )}
          </Card>

          <Card>
            <h4 className="text-[14px] font-semibold text-[#1C1C1C] mb-[12px]">About the Brand</h4>
            <div className="flex items-center gap-[8px] mb-[10px]">
              <Avatar name={campaign?.brandName} size={36} />
              <div>
                <p className="text-[13px] font-semibold text-[#1C1C1C]">{campaign?.brandName || '--'}</p>
                <p className="text-[12px] text-[#888888]">{campaign?.industry || '--'}</p>
              </div>
            </div>
            <div className="space-y-[6px]">
              {campaign?.brandLocation && <p className="text-[12px] text-[#888888] flex items-center gap-[4px]"><MapPin size={12} /> {campaign.brandLocation}</p>}
              <p className="text-[12px] text-[#888888]">{campaign?.brandCampaignCount ?? '--'} campaigns posted</p>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
