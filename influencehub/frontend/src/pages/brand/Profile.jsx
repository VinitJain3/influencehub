import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Globe, Edit, Camera, CheckCircle } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import TagPill from '../../components/ui/TagPill'
import StatCard from '../../components/ui/StatCard'
import ProfileRing from '../../components/ui/ProfileRing'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuthStore } from '../../store/authStore'
import client from '../../api/client'

export default function BrandProfile() {
  const user = useAuthStore((s) => s.user)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    client.get('/api/brand/profile')
      .then(res => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppLayout role="brand">
      <div className="flex gap-[24px] items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-[20px]">
          {/* Hero */}
          <Card className="!p-0 overflow-hidden relative">
            <div className="h-[140px] bg-[#F0F0EB] relative">
              <button className="absolute right-[12px] bottom-[12px] bg-white/80 rounded-full w-[32px] h-[32px] flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
                <Camera size={16} className="text-[#888888]" />
              </button>
            </div>
            <Avatar name={user?.companyName || user?.name} src={user?.avatar} size={64}
              className="absolute top-[108px] left-[24px] border-[3px] border-white" />
            <div className="absolute top-[148px] right-[20px]">
              <Button variant="ghost-dark" size="sm" leftIcon={Edit} onClick={() => navigate('/settings')}>Edit Profile</Button>
            </div>
            <div className="pt-[44px] px-[24px] pb-[24px]">
              {loading ? <Skeleton height={24} width={200} /> : (
                <>
                  <div className="flex items-center gap-[8px]">
                    <h1 className="text-[22px] font-bold text-[#1C1C1C]">{profile?.companyName || user?.companyName || '--'}</h1>
                    {profile?.verified && (
                      <span className="flex items-center gap-[3px] text-[12px] text-[#108A00] font-semibold">
                        <CheckCircle size={14} /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-[#888888]">{profile?.industry || '--'}</p>
                  <div className="flex items-center gap-[16px] mt-[8px] text-[13px] text-[#888888]">
                    {profile?.location && <span className="flex items-center gap-[4px]"><MapPin size={14} /> {profile.location}</span>}
                    {profile?.website && <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-[4px] text-[#108A00] hover:underline"><Globe size={14} /> Website</a>}
                  </div>
                  <p className="text-[14px] text-[#444444] leading-[1.65] mt-[12px] max-w-[600px]">{profile?.description || '--'}</p>

                  <div className="flex gap-[6px] mt-[12px]">
                    {(profile?.contentTypes || []).map((t, i) => <TagPill key={i} label={t} />)}
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-[16px]">
            {['Campaigns Posted','Active Collabs','Avg Rating','Total Spend'].map(label => (
              <StatCard key={label} label={label} value={profile?.stats?.[label.replace(/\s/g,'')] ?? '--'} loading={loading} />
            ))}
          </div>

          {/* Past Campaigns */}
          <Card>
            <h3 className="text-[16px] font-semibold text-[#1C1C1C] mb-[12px]">Past Campaigns</h3>
            {(profile?.pastCampaigns || []).length > 0 ? (
              <div className="space-y-[10px]">
                {profile.pastCampaigns.map((c, i) => (
                  <div key={i} className="flex justify-between items-center p-[12px] bg-[#FAFAF8] rounded-[8px] border border-[#F0F0EB]">
                    <div>
                      <p className="text-[14px] font-semibold text-[#1C1C1C]">{c.title}</p>
                      <p className="text-[12px] text-[#888888]">{c.date} · {c.creators} creators</p>
                    </div>
                    <TagPill label={c.status} variant={c.status === 'Completed' ? 'green' : 'neutral'} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#888888]">No past campaigns.</p>
            )}
          </Card>
        </div>

        {/* Right Rail */}
        <div className="w-[304px] flex-shrink-0 sticky top-[84px] flex flex-col gap-[16px]">
          <Card className="flex flex-col items-center py-[24px]">
            <p className="text-[12px] font-semibold text-[#888888] uppercase tracking-[1px] mb-[10px]">Profile Completeness</p>
            <ProfileRing value={profile?.completeness ?? 0} />
            {(profile?.completeness ?? 0) < 100 && (
              <Button variant="ghost-green" size="sm" className="mt-[14px]" onClick={() => navigate('/settings')}>Complete Profile</Button>
            )}
          </Card>

          <Card>
            <h4 className="text-[14px] font-semibold text-[#1C1C1C] mb-[12px]">Account Info</h4>
            <div className="space-y-[10px]">
              {[
                { label: 'Email', value: user?.email },
                { label: 'Member Since', value: profile?.joinDate },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-[12px] text-[#888888]">{item.label}</span>
                  <span className="text-[12px] font-medium text-[#1C1C1C]">{item.value || '--'}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h4 className="text-[14px] font-semibold text-[#1C1C1C] mb-[12px]">Preferred Platforms</h4>
            <div className="flex flex-wrap gap-[6px]">
              {(profile?.platforms || []).map((p, i) => <TagPill key={i} label={p} variant="info" />)}
              {!(profile?.platforms?.length) && <p className="text-[12px] text-[#888888]">--</p>}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
