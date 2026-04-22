import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Shield, Headphones } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import StepProgress from '../components/ui/StepProgress'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Textarea from '../components/ui/Textarea'
import PillToggle from '../components/ui/PillToggle'
import Checkbox from '../components/ui/Checkbox'
import Button from '../components/ui/Button'
import { useToast } from '../store/toastStore'
import { useAuthStore } from '../store/authStore'
import client from '../api/client'

const followerOptions = ['Under 1,000','1K–10K','10K–50K','50K–1L','1L–5L','5L–10L','10L+'].map(v => ({ value: v, label: v }))
const nicheOptions = ['Fashion','Beauty','Fitness','Food','Travel','Gaming','Tech','Finance','Lifestyle','Entertainment','Education','Memes & Comedy','Parenting','Other'].map(v => ({ value: v, label: v }))

function getPasswordScore(pw) {
  let s = 0
  if (pw?.length >= 8) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  if (/[A-Z]/.test(pw)) s++
  return s
}
const scoreColors = ['#C0392B', '#E8A838', '#E8D838', '#108A00']

export default function CreatorRegistration() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [primaryPlatform, setPrimaryPlatform] = useState('')
  const [otherPlatforms, setOtherPlatforms] = useState([])
  const [agreed, setAgreed] = useState(false)
  const { register, handleSubmit, watch, trigger, getValues, formState: { errors } } = useForm()
  const password = watch('password', '')
  const score = getPasswordScore(password)
  const loginFn = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const { toast } = useToast()

  const nextStep = async () => {
    const fields = step === 0 ? ['name','email','password','confirmPassword'] : ['handle','followerCount','niche']
    const valid = await trigger(fields)
    if (valid) setStep(step + 1)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await client.post('/api/auth/register/influencer', {
        ...data, primaryPlatform, otherPlatforms
      })
      loginFn(res.data.user, res.data.token, 'influencer')
      toast.success('Welcome to InfluenceHub!')
      navigate('/influencer/campaigns')
    } catch (err) {
      toast.error('Registration failed', 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <Navbar variant="auth" />
      <div className="flex flex-col items-center pt-[80px] pb-[40px] px-[40px]">
        <StepProgress
          steps={[{ label: 'Account Info' }, { label: 'Creator Profile' }, { label: 'Professional Details' }]}
          currentStep={step}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-[#E0E0DB] rounded-[16px] p-[36px] w-[480px]">
          {step === 0 && (
            <>
              <h2 className="text-[22px] font-bold text-[#1C1C1C] mb-[4px]">Create your account</h2>
              <p className="text-[14px] text-[#888888] mb-[24px]">Join thousands of creators on InfluenceHub</p>
              <div className="space-y-[16px]">
                <Input label="Full Name" name="name" required placeholder="Your full name" error={errors.name?.message}
                  register={(n) => register(n, { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
                <Input label="Email" name="email" type="email" required placeholder="you@email.com" error={errors.email?.message}
                  register={(n) => register(n, { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} />
                <div>
                  <Input label="Password" name="password" type="password" required placeholder="Min. 8 characters" error={errors.password?.message}
                    register={(n) => register(n, { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} />
                  {password && (
                    <div className="flex gap-[2px] mt-[6px]">
                      {[0,1,2,3].map(i => (
                        <div key={i} className="flex-1 h-[4px] rounded-[1px]" style={{ backgroundColor: i < score ? scoreColors[score - 1] : '#E0E0DB' }} />
                      ))}
                    </div>
                  )}
                </div>
                <Input label="Confirm Password" name="confirmPassword" type="password" required placeholder="Re-enter password" error={errors.confirmPassword?.message}
                  register={(n) => register(n, { required: 'Please confirm', validate: v => v === getValues('password') || 'Passwords do not match' })} />
              </div>
              <Button fullWidth className="mt-[20px]" onClick={nextStep}>Continue →</Button>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-[22px] font-bold text-[#1C1C1C] mb-[4px]">Complete your creator profile</h2>
              <p className="text-[14px] text-[#888888] mb-[24px]">To start bidding on campaigns, we need a few more details.</p>
              <div className="space-y-[16px]">
                <Input label="Social Handle" name="handle" required prefix="@" placeholder="yourhandle" error={errors.handle?.message}
                  register={(n) => register(n, { required: 'Handle is required', pattern: { value: /^\S+$/, message: 'No spaces allowed' } })} />
                <div>
                  <label className="block text-[14px] font-medium text-[#1C1C1C] mb-[8px]">Primary Platform <span className="text-[#C0392B]">*</span></label>
                  <PillToggle value={primaryPlatform} onChange={setPrimaryPlatform}
                    options={['Instagram','YouTube','TikTok','LinkedIn','Twitter/X','Pinterest'].map(v => ({ value: v, label: v }))} />
                </div>
                <div className="grid grid-cols-2 gap-[16px]">
                  <Select label="Follower Count" name="followerCount" required options={followerOptions} error={errors.followerCount?.message}
                    register={(n) => register(n, { required: 'Required' })} />
                  <Select label="Primary Niche" name="niche" required options={nicheOptions} error={errors.niche?.message}
                    register={(n) => register(n, { required: 'Required' })} />
                </div>
                <Input label="City / Location" name="location" placeholder="Mumbai, Maharashtra" register={(n) => register(n)} />
                <Textarea label="Short Bio" name="bio" maxLength={250} showCount rows={3}
                  placeholder="Tell brands about your creative style and previous collaborations..."
                  register={(n) => register(n)} />
              </div>
              <div className="flex gap-[10px] mt-[20px]">
                <Button variant="ghost-dark" onClick={() => setStep(0)}>← Back</Button>
                <Button fullWidth onClick={nextStep}>Continue →</Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-[22px] font-bold text-[#1C1C1C] mb-[4px]">Professional Details</h2>
              <p className="text-[14px] text-[#888888] mb-[24px]">Almost done! Add your professional info.</p>
              <div className="space-y-[16px]">
                <div>
                  <label className="block text-[14px] font-medium text-[#888888] mb-[8px]">Other Active Platforms</label>
                  <div className="grid grid-cols-2 gap-[10px]">
                    {['Threads','X/Twitter','Snapchat','Pinterest'].map(p => (
                      <Checkbox key={p} label={p} checked={otherPlatforms.includes(p)}
                        onChange={(e) => setOtherPlatforms(e.target.checked ? [...otherPlatforms, p] : otherPlatforms.filter(x => x !== p))} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-[16px]">
                  <Input label="Base Rate (Post)" name="baseRate" prefix="₹" type="number" placeholder="5,000" register={(n) => register(n)} />
                  <Input label="Portfolio URL" name="portfolioUrl" type="url" placeholder="https://..." register={(n) => register(n)} />
                </div>
                <Input label="Average Engagement Rate" name="engagementRate" suffix="%" placeholder="4.5"
                  helper="Your average likes + comments ÷ followers × 100" register={(n) => register(n)} />
                <Checkbox
                  label={<span>I agree to the <a href="/terms" target="_blank" className="text-[#108A00]">Terms of Service</a> and <a href="/privacy" target="_blank" className="text-[#108A00]">Privacy Policy</a></span>}
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
              </div>
              <div className="flex gap-[10px] mt-[20px]">
                <Button variant="ghost-dark" onClick={() => setStep(1)}>← Back</Button>
                <Button type="submit" fullWidth disabled={!agreed} loading={loading} className="!h-[48px]">
                  Complete Registration
                </Button>
              </div>
            </>
          )}
        </form>

        <div className="flex justify-center gap-[32px] mt-[28px]">
          <div className="flex items-center gap-[6px]">
            <Shield size={16} className="text-[#108A00]" />
            <span className="text-[11px] font-semibold text-[#888888] uppercase">Secure Registration</span>
          </div>
          <div className="flex items-center gap-[6px]">
            <Headphones size={16} className="text-[#108A00]" />
            <span className="text-[11px] font-semibold text-[#888888] uppercase">24/7 Creator Support</span>
          </div>
        </div>
      </div>
    </div>
  )
}
