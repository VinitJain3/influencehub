import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Mail, CheckCircle, XCircle } from 'lucide-react'
import Button from '../components/ui/Button'
import { useToast } from '../store/toastStore'
import client from '../api/client'

export default function VerifyEmail() {
  const [status, setStatus] = useState('pending')
  const [loading, setLoading] = useState(false)
  const location = useLocation()
  const { toast } = useToast()

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token')
    if (token) {
      setStatus('checking')
      client.post('/api/auth/verify-email', { token })
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'))
    }
  }, [location.search])

  const resend = async () => {
    setLoading(true)
    try {
      await client.post('/api/auth/resend-verification')
      toast.success('Verification email sent!')
    } catch { toast.error('Failed to send') }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-[#F5F5F0] min-h-screen flex items-center justify-center">
      <div className="bg-white border border-[#E0E0DB] rounded-[14px] p-[36px] w-[420px] text-center">
        {status === 'checking' && (
          <>
            <div className="w-[36px] h-[36px] border-2 border-[#108A00] border-t-transparent rounded-full animate-spin mx-auto mb-[16px]" />
            <h2 className="text-[20px] font-semibold text-[#1C1C1C]">Verifying your email...</h2>
          </>
        )}

        {status === 'pending' && (
          <>
            <Mail size={36} className="text-[#108A00] mx-auto mb-[16px]" />
            <h2 className="text-[22px] font-bold text-[#1C1C1C] mb-[8px]">Verify your email address</h2>
            <p className="text-[14px] text-[#888888] mb-[20px] leading-[1.6]">
              We've sent a verification link to your email. Check your inbox and click the link to verify your account.
            </p>
            <Button variant="ghost-green" fullWidth loading={loading} onClick={resend}>
              Resend verification email
            </Button>
            <Link to="/login" className="block text-[13px] text-[#108A00] hover:underline mt-[12px]">
              Change email address
            </Link>
            <Link to="/login" className="block text-[13px] text-[#444444] mt-[8px]">
              Already verified? <span className="text-[#108A00]">Sign In →</span>
            </Link>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={40} className="text-[#108A00] mx-auto mb-[14px]" />
            <h2 className="text-[20px] font-semibold text-[#1C1C1C] mb-[8px]">Email verified!</h2>
            <p className="text-[14px] text-[#888888] mb-[20px]">Your email has been successfully verified.</p>
            <Link to="/login"><Button fullWidth>Go to Dashboard</Button></Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={40} className="text-[#C0392B] mx-auto mb-[14px]" />
            <h2 className="text-[20px] font-semibold text-[#1C1C1C] mb-[8px]">Verification failed</h2>
            <p className="text-[14px] text-[#888888] mb-[20px]">The verification link may have expired or is invalid.</p>
            <Button variant="ghost-green" fullWidth loading={loading} onClick={resend}>
              Resend verification email
            </Button>
            <Link to="/login" className="block text-[13px] text-[#108A00] hover:underline mt-[12px]">
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
