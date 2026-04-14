import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useToast } from '../store/toastStore'
import client from '../api/client'

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, getValues, formState: { errors } } = useForm()
  const { toast } = useToast()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await client.post('/api/auth/forgot-password', { email: data.email })
      setSubmitted(true)
    } catch (err) {
      toast.error('Something went wrong', 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#F5F5F0] min-h-screen flex items-center justify-center">
      <div className="bg-white border border-[#E0E0DB] rounded-[14px] p-[36px] w-[420px]">
        {!submitted ? (
          <>
            <Link to="/login" className="flex items-center gap-[6px] text-[13px] text-[#888888] hover:text-[#1C1C1C] mb-[24px]">
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
            <div className="text-center">
              <Lock size={36} className="text-[#108A00] mx-auto mb-[16px]" />
              <h2 className="text-[22px] font-bold text-[#1C1C1C] mb-[8px]">Reset your password</h2>
              <p className="text-[14px] text-[#888888] max-w-[320px] mx-auto leading-[1.6] mb-[24px]">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Input label="Email address" name="email" type="email" required placeholder="you@company.com" error={errors.email?.message}
                register={(n) => register(n, { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} />
              <Button type="submit" fullWidth loading={loading} className="!h-[48px] mt-[16px]">
                Send Reset Link →
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <CheckCircle size={40} className="text-[#108A00] mx-auto mb-[14px]" />
            <h2 className="text-[20px] font-semibold text-[#1C1C1C] mb-[6px]">Check your email</h2>
            <p className="text-[14px] text-[#888888] mb-[16px]">
              We sent a password reset link to <strong>{getValues('email')}</strong>
            </p>
            <button onClick={() => { setSubmitted(false); onSubmit(getValues()) }} className="text-[13px] text-[#108A00] hover:underline cursor-pointer">
              Resend email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
