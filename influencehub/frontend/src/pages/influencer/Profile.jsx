import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { MapPin, Globe, Camera, Edit, CheckCircle, Upload } from 'lucide-react'
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
  const [avatarPreview, setAvatarPreview] = useState(null)   // base64 preview
  const [coverPreview, setCoverPreview] = useState(null)     // base64 preview
  const [pendingAvatar, setPendingAvatar] = useState(null)   // to send on save
  const [pendingCover, setPendingCover] = useState(null)     // to send on save
  const avatarInputRef = useRef(null)
  const coverInputRef = useRef(null)
  const portfolioInputRef = useRef(null)
  const [portfolioUploading, setPortfolioUploading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    client.get('/api/influencer/profile')
      .then(res => {
        setProfile(res.data)
        reset(res.data)
        setEditPlatforms(res.data.platforms || [])
        if (res.data.avatar) setAvatarPreview(res.data.avatar)
        if (res.data.coverPhoto) setCoverPreview(res.data.coverPhoto)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const readFileAsBase64 = (file) => new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const b64 = await readFileAsBase64(file)
    setAvatarPreview(b64)
    setPendingAvatar(b64)
    // Auto-save immediately
    try {
      const res = await client.put('/api/influencer/profile', { avatar: b64 })
      setProfile(res.data)
      updateUser(res.data)
      setPendingAvatar(null)
      toast.success('Profile photo updated!')
    } catch { toast.error('Failed to save photo') }
  }

  const handleCoverChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const b64 = await readFileAsBase64(file)
    setCoverPreview(b64)
    setPendingCover(b64)
    // Auto-save immediately
    try {
      const res = await client.put('/api/influencer/profile', { coverPhoto: b64 })
      setProfile(res.data)
      updateUser(res.data)
      setPendingCover(null)
      toast.success('Cover photo updated!')
    } catch { toast.error('Failed to save cover photo') }
  }

  const handlePortfolioAdd = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setPortfolioUploading(true)
    try {
      for (const file of files) {
        const b64 = await readFileAsBase64(file)
        const res = await client.post('/api/influencer/portfolio', { image: b64 })
        setProfile(prev => ({ ...prev, portfolio: res.data.portfolio }))
      }
      toast.success(files.length > 1 ? `${files.length} works added!` : 'Work added to portfolio!')
    } catch { toast.error('Failed to upload') }
    finally { setPortfolioUploading(false); e.target.value = '' }
  }

  const handlePortfolioDelete = async (index) => {
    try {
      const res = await client.delete(`/api/influencer/portfolio/${index}`)
      setProfile(prev => ({ ...prev, portfolio: res.data.portfolio }))
      toast.success('Removed from portfolio')
    } catch { toast.error('Failed to remove') }
  }

  const onSave = async (data) => {
    setSaving(true)
    try {
      const payload = { ...data, platforms: editPlatforms }
      if (pendingAvatar) payload.avatar = pendingAvatar
      if (pendingCover) payload.coverPhoto = pendingCover
      const res = await client.put('/api/influencer/profile', payload)
      setProfile(res.data)
      updateUser(res.data)
      setPendingAvatar(null)
      setPendingCover(null)
      setEditMode(false)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  return (
    <AppLayout role="influencer">
      <div className="flex flex-col gap-[20px]">
          {/* Hero */}
          <Card className="!p-0 overflow-hidden relative">
            {/* Hidden file inputs */}
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />

            {/* Cover photo */}
            <div
              className="h-[140px] relative cursor-pointer group"
              style={{
                background: coverPreview ? `url(${coverPreview}) center/cover no-repeat` : '#F0F0EB'
              }}
              onClick={() => coverInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full px-[12px] py-[6px] flex items-center gap-[6px]">
                  <Camera size={14} className="text-white" />
                  <span className="text-[12px] text-white font-medium">Change Cover</span>
                </div>
              </div>
            </div>

            <div className="relative px-[24px] pb-[24px] pt-[56px]">
            {/* Avatar with click-to-upload */}
            <div
              className="absolute top-[-36px] left-[24px] cursor-pointer group"
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" className="w-[72px] h-[72px] rounded-full object-cover border-[4px] border-white shadow" />
                : <Avatar name={user?.name} size={72} className="border-[4px] border-white" />
              }
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Camera size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="absolute top-[16px] right-[20px]">
              <Button variant="ghost-dark" size="sm" leftIcon={Edit} onClick={() => setEditMode(true)}>Edit Profile</Button>
            </div>
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
            {/* Hidden portfolio file input — allows multiple */}
            <input ref={portfolioInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePortfolioAdd} />

            <div className="flex justify-between items-center mb-[16px]">
              <h3 className="text-[16px] font-semibold text-[#1C1C1C]">Portfolio</h3>
              <Button
                variant="ghost-green"
                size="sm"
                loading={portfolioUploading}
                onClick={() => portfolioInputRef.current?.click()}
              >
                + Add Work
              </Button>
            </div>

            {profile?.portfolio?.length ? (
              <div className="grid grid-cols-3 gap-[12px]">
                {profile.portfolio.map((img, i) => (
                  <div key={i} className="relative group h-[160px] rounded-[10px] overflow-hidden bg-[#F0F0EB]">
                    <img src={img} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                    {/* Hover overlay with delete button */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <button
                        onClick={() => handlePortfolioDelete(i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white rounded-full w-[32px] h-[32px] flex items-center justify-center text-[#C0392B] shadow"
                        title="Remove"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                {/* Always-visible add tile */}
                <button
                  onClick={() => portfolioInputRef.current?.click()}
                  className="h-[160px] rounded-[10px] border-2 border-dashed border-[#E0E0DB] hover:border-[#108A00] transition-colors flex flex-col items-center justify-center gap-[8px] text-[#888888] hover:text-[#108A00] cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  <span className="text-[12px] font-medium">Add more</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => portfolioInputRef.current?.click()}
                className="w-full flex flex-col items-center py-[40px] border-2 border-dashed border-[#E0E0DB] rounded-[12px] hover:border-[#108A00] transition-colors group cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2" className="text-[#CCCCCC] group-hover:text-[#108A00] transition-colors mb-[10px]"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                <p className="text-[14px] font-medium text-[#888888] group-hover:text-[#108A00] transition-colors">Upload your work</p>
                <p className="text-[12px] text-[#BBBBBB] mt-[4px]">PNG, JPG, WEBP — multiple files supported</p>
              </button>
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
          <p className="text-[13px] font-semibold text-[#1C1C1C] mt-[4px]">Stats</p>
          <div className="grid grid-cols-2 gap-[16px]">
            <Input label="Followers" name="followerCount" placeholder="e.g. 25K" register={(n) => register(n)} />
            <Input label="Engagement Rate" name="engagementRate" placeholder="e.g. 4.5%" register={(n) => register(n)} />
            <Input label="Posts / Month" name="postsPerMonth" placeholder="e.g. 12" register={(n) => register(n)} />
            <Input label="Avg Reach" name="avgReach" placeholder="e.g. 50K" register={(n) => register(n)} />
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}
