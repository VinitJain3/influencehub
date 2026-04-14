import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { MapPin, Globe, Camera, Edit, CheckCircle } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import TagPill from '../../components/ui/TagPill'
import StatCard from '../../components/ui/StatCard'
import ProfileRing from '../../components/ui/ProfileRing'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import PillToggle from '../../components/ui/PillToggle'
import Modal from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../store/toastStore'
import client from '../../api/client'

export default function InfluencerProfile() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editPlatforms, setEditPlatforms] = useState([])
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    client.get('/api/influencer/profile')
      .then(res => { setProfile(res.data); reset(res.data); setEditPlatforms(res.data.platforms || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const onSave = async (data) => {
    setSaving(true)
    try {
      const res = await client.put('/api/influencer/profile', { ...data, platforms: editPlatforms })
      setProfile(res.data)
      updateUser(res.data)
      setEditMode(false)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  return (
    <AppLayout role="influencer">
      <div className="flex gap-[24px] items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-[20px]">
          {/* Hero */}
          <Card className="!p-0 overflow-hidden relative">
            <div className="h-[140px] bg-[#F0F0EB] relative">
              <button className="absolute right-[12px] bottom-[12px] bg-white/80 rounded-full w-[32px] h-[32px] flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
                <Camera size={16} className="text-[#888888]" />
              </button>
            </div>
            <Avatar name={user?.name} src={user?.avatar} size={64} className="absolute top-[108px] left-[24px] border-[3px] border-white" />
            <div className="absolute top-[148px] right-[20px]">
              <Button variant="ghost-dark" size="sm" leftIcon={Edit} onClick={() => setEditMode(true)}>Edit Profile</Button>
            </div>
            <div className="pt-[44px] px-[24px] pb-[24px]">
              {loading ? <Skeleton height={24} width={200} /> : (
                <>
                  <div className="flex items-center gap-[8px]">
                    <h1 className="text-[22px] font-bold text-[#1C1C1C]">{profile?.name || user?.name || '--'}</h1>
                    {profile?.verified && <span className="flex items-center gap-[3px] text-[12px] text-[#108A00]"><CheckCircle size={14} /> Verified</span>}
                  </div>
                  <p className="text-[14px] text-[#108A00]">@{profile?.handle || user?.handle || '--'}</p>
                  <div className="flex items-center gap-[16px] mt-[8px] text-[13px] text-[#888888]">
                    {profile?.location && <span className="flex items-center gap-[4px]"><MapPin size={14} /> {profile.location}</span>}
                    {profile?.website && <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-[4px] text-[#108A00] hover:underline"><Globe size={14} /> Portfolio</a>}
                  </div>
                  <p className="text-[14px] text-[#444444] leading-[1.65] mt-[12px]">{profile?.bio || '--'}</p>
                  <div className="flex gap-[6px] mt-[12px] flex-wrap">
                    {profile?.niche && <TagPill label={profile.niche} />}
                    {(profile?.platforms || []).map((p, i) => <TagPill key={i} label={p} variant="info" />)}
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-[16px]">
            {['Followers','Engagement Rate','Posts/Month','Avg Reach'].map(label => (
              <StatCard key={label} label={label} value={profile?.stats?.[label.replace(/[\s\/]/g,'')] ?? '--'} loading={loading} />
            ))}
          </div>

          {/* Portfolio */}
          <Card>
            <div className="flex justify-between items-center mb-[12px]">
              <h3 className="text-[16px] font-semibold text-[#1C1C1C]">Portfolio</h3>
              <Button variant="ghost-green" size="sm">+ Add Work</Button>
            </div>
            {profile?.portfolio?.length ? (
              <div className="grid grid-cols-3 gap-[10px]">
                {profile.portfolio.map((img, i) => (
                  <div key={i} className="h-[150px] bg-[#F0F0EB] rounded-[8px] overflow-hidden">
                    <img src={img} alt="Portfolio" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-[30px]">
                <p className="text-[13px] text-[#888888] mb-[10px]">No portfolio items yet.</p>
                <Button variant="ghost-green" size="sm">Upload Your First Work</Button>
              </div>
            )}
          </Card>

          {/* Reviews */}
          <Card>
            <h3 className="text-[16px] font-semibold text-[#1C1C1C] mb-[12px]">Reviews</h3>
            {profile?.reviews?.length ? (
              <div className="space-y-[14px]">
                {profile.reviews.map((r, i) => (
                  <div key={i} className="border-b border-[#F0F0EB] pb-[14px] last:border-0">
                    <div className="flex items-center gap-[8px] mb-[6px]">
                      <Avatar name={r.brandName} size={28} />
                      <div>
                        <p className="text-[13px] font-semibold text-[#1C1C1C]">{r.brandName}</p>
                        <p className="text-[11px] text-[#888888]">{r.date}</p>
                      </div>
                      <span className="ml-auto text-[13px] font-bold text-[#108A00]">{'★'.repeat(r.rating)}</span>
                    </div>
                    <p className="text-[13px] text-[#444444]">{r.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#888888]">No reviews yet. Complete collaborations to get reviews!</p>
            )}
          </Card>
        </div>

        {/* Right Rail */}
        <div className="w-[304px] flex-shrink-0 sticky top-[84px] flex flex-col gap-[16px]">
          <Card className="flex flex-col items-center py-[24px]">
            <p className="text-[12px] font-semibold text-[#888888] uppercase tracking-[1px] mb-[10px]">Profile Completeness</p>
            <ProfileRing value={profile?.completeness ?? 0} />
            {(profile?.completeness ?? 0) < 100 && (
              <Button variant="ghost-green" size="sm" className="mt-[14px]" onClick={() => setEditMode(true)}>Complete Profile</Button>
            )}
          </Card>

          <Card>
            <h4 className="text-[14px] font-semibold text-[#1C1C1C] mb-[12px]">Rates</h4>
            <div className="space-y-[8px]">
              {[
                { label: 'Base Rate (Post)', value: profile?.baseRate ? `₹${profile.baseRate}` : '--' },
                { label: 'Story Rate', value: profile?.storyRate ? `₹${profile.storyRate}` : '--' },
                { label: 'Video Rate', value: profile?.videoRate ? `₹${profile.videoRate}` : '--' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-[12px] text-[#888888]">{item.label}</span>
                  <span className="text-[13px] font-semibold text-[#1C1C1C]">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h4 className="text-[14px] font-semibold text-[#1C1C1C] mb-[10px]">Account Info</h4>
            <div className="space-y-[8px]">
              {[{ label: 'Email', value: user?.email },{ label: 'Member Since', value: profile?.joinDate }].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-[12px] text-[#888888]">{item.label}</span>
                  <span className="text-[12px] font-medium text-[#1C1C1C]">{item.value || '--'}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editMode} onClose={() => setEditMode(false)} title="Edit Profile" size="lg"
        footer={<><Button variant="ghost-dark" onClick={() => setEditMode(false)}>Cancel</Button><Button loading={saving} onClick={handleSubmit(onSave)}>Save Changes</Button></>}>
        <form className="space-y-[16px]">
          <div className="grid grid-cols-2 gap-[16px]">
            <Input label="Full Name" name="name" required error={errors.name?.message} register={(n) => register(n, { required: 'Required' })} />
            <Input label="Handle" name="handle" prefix="@" required error={errors.handle?.message} register={(n) => register(n, { required: 'Required' })} />
          </div>
          <Input label="Location" name="location" register={(n) => register(n)} />
          <Textarea label="Bio" name="bio" rows={3} maxLength={250} showCount register={(n) => register(n)} />
          <div>
            <label className="block text-[14px] font-medium text-[#1C1C1C] mb-[8px]">Platforms</label>
            <PillToggle multiSelect values={editPlatforms} onChange={setEditPlatforms}
              options={['Instagram','YouTube','TikTok','Twitter/X','LinkedIn','Pinterest'].map(v => ({ value: v, label: v }))} />
          </div>
          <div className="grid grid-cols-3 gap-[16px]">
            <Input label="Base Rate" name="baseRate" prefix="₹" type="number" register={(n) => register(n)} />
            <Input label="Story Rate" name="storyRate" prefix="₹" type="number" register={(n) => register(n)} />
            <Input label="Video Rate" name="videoRate" prefix="₹" type="number" register={(n) => register(n)} />
          </div>
          <Input label="Portfolio URL" name="website" type="url" register={(n) => register(n)} />
        </form>
      </Modal>
    </AppLayout>
  )
}
