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
      navigate(res.data.role === 'brand' ? '/brand/dashboard' : '/influencer/dashboard')
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

          {/* Divider */}
          <div className="flex items-center gap-[12px] my-[20px]">
            <div className="flex-1 h-[1px] bg-[#E0E0DB]" />
            <span className="text-[13px] text-[#888888]">or</span>
            <div className="flex-1 h-[1px] bg-[#E0E0DB]" />
          </div>

          {/* Google Button */}
          <Button
            variant="ghost-dark"
            fullWidth
            className="!h-[48px]"
            onClick={() => { window.location.href = (import.meta.env.VITE_API_URL || 'http://localhost:8082') + '/api/auth/google' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="mr-[4px]">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-[13px] text-[#444444] text-center mt-[20px]">
            New to InfluenceHub?{' '}
            <Link to="/register" className="text-[#108A00] hover:underline">Join free →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
