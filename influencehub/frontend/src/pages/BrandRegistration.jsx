import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
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

const industryOptions = [
  'Fashion & Apparel','Beauty & Skincare','Health & Fitness','Food & Beverage',
  'Technology','Travel & Lifestyle','Gaming','Finance','Home & Decor','FMCG','Other'
].map(v => ({ value: v, label: v }))

const budgetOptions = [
  'Under ₹50,000','₹50K–₹2L','₹2L–₹10L','₹10L–₹50L','₹50L+'
].map(v => ({ value: v, label: v }))

function getPasswordScore(pw) {
  let s = 0
  if (pw?.length >= 8) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  if (/[A-Z]/.test(pw)) s++
  return s
}

const scoreColors = ['#C0392B', '#E8A838', '#E8D838', '#108A00']

export default function BrandRegistration() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [contentTypes, setContentTypes] = useState([])
  const [influencerSize, setInfluencerSize] = useState('')
  const [platforms, setPlatforms] = useState([])
  const [agreed, setAgreed] = useState(false)
  const { register, handleSubmit, watch, trigger, getValues, formState: { errors } } = useForm()
  const password = watch('password', '')
  const score = getPasswordScore(password)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const { toast } = useToast()

  const nextStep = async () => {
    const fields = step === 0
      ? ['name', 'email', 'password', 'confirmPassword']
      : ['companyName', 'industry']
    const valid = await trigger(fields)
    if (valid) setStep(step + 1)
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await client.post('/api/auth/register/brand', {
        ...data, contentTypes, influencerSize, platforms
      })
      login(res.data.user, res.data.token, 'brand')
      toast.success('Welcome to InfluenceHub!')
      navigate('/brand/discover')
    } catch (err) {
      if (err.response?.status === 422) {
        Object.entries(err.response.data.errors || {}).forEach(([k, v]) => {
          // setError would go here with react-hook-form
        })
      } else {
        toast.error('Registration failed', 'Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <Navbar variant="auth" />
      <div className="flex flex-col items-center pt-[80px] pb-[40px] px-[40px]">
        <StepProgress
          steps={[{ label: 'Account Info' }, { label: 'Company Details' }, { label: 'Preferences' }]}
          currentStep={step}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-[#E0E0DB] rounded-[16px] p-[36px] w-[480px]">
          {step === 0 && (
            <>
              <h2 className="text-[22px] font-bold text-[#1C1C1C] mb-[4px]">Create your account</h2>
              <p className="text-[14px] text-[#888888] mb-[24px]">Start hiring creators for your brand</p>
              <div className="space-y-[16px]">
                <Input label="Full Name" name="name" required placeholder="John Doe" error={errors.name?.message}
                  register={(n) => register(n, { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
                <Input label="Work Email" name="email" type="email" required placeholder="you@company.com" error={errors.email?.message}
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
              <h2 className="text-[22px] font-bold text-[#1C1C1C] mb-[4px]">Set up your brand profile</h2>
              <p className="text-[14px] text-[#888888] mb-[24px]">Tell us about your company</p>
              <div className="space-y-[16px]">
                <Input label="Company Name" name="companyName" required placeholder="Acme Inc." error={errors.companyName?.message}
                  register={(n) => register(n, { required: 'Company name is required' })} />
                <div className="grid grid-cols-2 gap-[16px]">
                  <Select label="Industry" name="industry" required options={industryOptions} error={errors.industry?.message}
                    register={(n) => register(n, { required: 'Industry is required' })} />
                  <Select label="Monthly Budget" name="budget" options={budgetOptions}
                    register={(n) => register(n)} />
                </div>
                <Input label="Company Website" name="website" placeholder="https://..." error={errors.website?.message}
                  register={(n) => register(n, { pattern: { value: /^https?:\/\/.+/i, message: 'Enter a valid URL' } })} />
                <Textarea label="Company Description" name="description" maxLength={300} showCount rows={4} placeholder="Tell creators about your brand..."
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
              <h2 className="text-[22px] font-bold text-[#1C1C1C] mb-[4px]">Your preferences</h2>
              <p className="text-[14px] text-[#888888] mb-[24px]">Help us match you with the right creators</p>
              <div className="space-y-[20px]">
                <div>
                  <label className="block text-[14px] font-medium text-[#1C1C1C] mb-[8px]">Preferred Content Types</label>
                  <PillToggle multiSelect values={contentTypes} onChange={setContentTypes}
                    options={['UGC Video','Instagram Post','TikTok Spark','Blog Feature','Newsletter','Podcast'].map(v => ({ value: v, label: v }))} />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1C1C1C] mb-[8px]">Target Influencer Size</label>
                  <PillToggle value={influencerSize} onChange={setInfluencerSize}
                    options={['Nano (1k–10k)','Micro (10k–50k)','Macro (50k–500k)','Mega (500k+)'].map(v => ({ value: v, label: v }))} />
                </div>
                <div>
                  <label className="block text-[14px] font-medium text-[#1C1C1C] mb-[8px]">Preferred Platforms</label>
                  <PillToggle multiSelect values={platforms} onChange={setPlatforms}
                    options={['Instagram','YouTube','TikTok','Twitter/X'].map(v => ({ value: v, label: v }))} />
                </div>
                <Checkbox
                  label={<span>I agree to the <a href="/terms" target="_blank" className="text-[#108A00]">Terms of Service</a> and <a href="/privacy" target="_blank" className="text-[#108A00]">Privacy Policy</a></span>}
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
              </div>
              <div className="flex gap-[10px] mt-[20px]">
                <Button variant="ghost-dark" onClick={() => setStep(1)}>← Back</Button>
                <Button type="submit" fullWidth disabled={!agreed} loading={loading} className="!h-[48px]">
                  Create Account
                </Button>
              </div>
              <p className="text-[13px] text-[#888888] text-center mt-[12px]">
                Your data is encrypted and secure
              </p>
            </>
          )}
        </form>

        <div className="mt-[28px] text-center">
          <p className="text-[11px] font-semibold text-[#888888] uppercase tracking-[1.5px] mb-[12px]">Trusted by Leaders</p>
          <div className="flex justify-center gap-[16px]">
            {[1,2,3].map(i => <div key={i} className="w-[60px] h-[20px] bg-[#E0E0DB] rounded-[4px]" />)}
          </div>
        </div>
      </div>
    </div>
  )
}
