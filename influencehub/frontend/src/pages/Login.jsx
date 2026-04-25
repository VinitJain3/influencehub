import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import Logo from '../components/ui/Logo'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Checkbox from '../components/ui/Checkbox'
import Avatar from '../components/ui/Avatar'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../store/toastStore'
import client from '../api/client'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { register, handleSubmit, setError, formState: { errors } } = useForm()
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const { toast } = useToast()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await client.post('/api/auth/login', { ...data, rememberMe })
      login(res.data.user, res.data.token, res.data.role)
      if (rememberMe) localStorage.setItem('savedEmail', data.email)
      navigate(res.data.role === 'brand' ? '/brand/discover' : '/influencer/campaigns')
    } catch (err) {
      if (err.response?.status === 401) {
        setError('email', { message: 'Invalid email or password' })
      } else if (err.response?.status === 404) {
        setError('email', { message: 'No account found with this email' })
      } else {
        toast.error('Login failed', 'Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="w-1/2 bg-[#1A2E1A] p-[64px] flex flex-col justify-between">
        <div>
          <Logo variant="white" size="md" className="mb-[12px]" />
          <p className="text-[18px] text-white/80 font-normal mb-[40px]">Where Brands Meet Creators</p>
          <div className="space-y-[16px]">
            {[
              'Browse 18,000+ verified creator profiles',
              'Manage campaigns end-to-end',
              'Private, secure collaboration chat',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-[10px]">
                <CheckCircle size={16} className="text-white flex-shrink-0" />
                <span className="text-[14px] text-white/80">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-[8px]">
          <div className="flex -space-x-2">
            {['A B', 'C D', 'E F', 'G H'].map((name, i) => (
              <Avatar key={i} name={name} size={32} ring />
            ))}
          </div>
          <span className="text-[13px] text-white/60 ml-[8px]">Trusted by 2,400+ brands</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 bg-white flex flex-col justify-center">
        <div className="max-w-[400px] mx-auto w-full px-[20px]">
          <div className="text-center mb-[32px]">
            <Logo className="justify-center mb-[24px]" />
            <h1 className="text-[28px] font-bold text-[#1C1C1C] mb-[4px]">Welcome back</h1>
            <p className="text-[14px] text-[#888888]">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-[16px]">
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              error={errors.email?.message}
              register={register}
            />
            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                required
                error={errors.password?.message}
                register={register}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[12px] top-[38px] text-[#888888] hover:text-[#1C1C1C] cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <Checkbox
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <Link to="/forgot-password" className="text-[13px] text-[#108A00] hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={loading} className="!h-[48px] mt-[4px]">
              Sign In
            </Button>
          </form>

          <p className="text-[13px] text-[#444444] text-center mt-[20px]">
            New to InfluenceHub?{' '}
            <Link to="/register" className="text-[#108A00] hover:underline">Register →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
