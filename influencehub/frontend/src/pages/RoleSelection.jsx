import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Briefcase, User, Check } from 'lucide-react'
import Logo from '../components/ui/Logo'
import Button from '../components/ui/Button'

export default function RoleSelection() {
  const [searchParams] = useSearchParams()
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || null)
  const navigate = useNavigate()

  const roles = [
    { value: 'brand', icon: Briefcase, title: "I'm a Brand", subtitle: 'Hire creators for your campaigns' },
    { value: 'influencer', icon: User, title: "I'm an Influencer", subtitle: 'Find brands and grow your career' },
  ]

  return (
    <div className="bg-[#EFF5EE] min-h-screen flex flex-col items-center justify-center p-[40px]">
      <Logo showIcon className="mb-[24px]" />
      <h1 className="text-[32px] font-bold text-[#1C1C1C] mb-[20px]">Join InfluenceHub</h1>

      <div className="bg-white border border-[#E0E0DB] rounded-[16px] p-[32px] w-[480px]">
        <p className="text-[14px] text-[#888888] text-center mb-[20px]">
          Choose how you want to use InfluenceHub
        </p>

        <div className="flex flex-col gap-[12px]">
          {roles.map((role) => {
            const selected = selectedRole === role.value
            return (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`
                  relative flex items-center gap-[14px] rounded-[12px] p-[18px_20px] cursor-pointer transition-all duration-150 text-left
                  ${selected ? 'border-2 border-[#108A00] bg-[#F8FDF8]' : 'border-[1.5px] border-[#E0E0DB] hover:border-[#108A00]'}
                `}
              >
                <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center flex-shrink-0 ${selected ? 'bg-[#108A00]' : 'bg-[#EFEFEB]'}`}>
                  <role.icon size={18} className={selected ? 'text-white' : 'text-[#888888]'} />
                </div>
                <div className="flex-1">
                  <p className="text-[16px] font-semibold text-[#1C1C1C]">{role.title}</p>
                  <p className="text-[13px] text-[#888888]">{role.subtitle}</p>
                </div>
                <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center flex-shrink-0 ${selected ? 'bg-[#108A00]' : 'border-2 border-[#C4C4BF] bg-white'}`}>
                  {selected && <Check size={14} className="text-white" />}
                </div>
              </button>
            )
          })}
        </div>

        <Button
          fullWidth
          disabled={!selectedRole}
          className="!h-[48px] mt-[20px]"
          onClick={() => navigate(`/register/${selectedRole}`)}
        >
          Continue →
        </Button>

        <p className="text-[14px] text-[#444444] text-center mt-[16px]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#108A00] hover:underline">Sign in</Link>
        </p>
      </div>

      <div className="mt-[28px] text-center">
        <p className="text-[12px] text-[#888888] uppercase">Privacy Policy · Terms of Service</p>
        <p className="text-[11px] text-[#888888] mt-[8px]">© {new Date().getFullYear()} InfluenceHub Global Inc.</p>
      </div>
    </div>
  )
}
