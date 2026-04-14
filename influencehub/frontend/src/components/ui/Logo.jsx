export default function Logo({ size = 'md', variant = 'default', showIcon = false, className = '' }) {
  const sizes = {
    sm: 'text-[18px]',
    md: 'text-[22px]',
    lg: 'text-[28px]',
  }

  const isWhite = variant === 'white'

  return (
    <div className={`flex items-center gap-[8px] ${className}`}>
      {showIcon && (
        <div className={`w-[32px] h-[32px] rounded-[8px] flex items-center justify-center ${isWhite ? 'bg-white/20' : 'bg-[#108A00]'}`}>
          <span className={`font-extrabold text-[16px] ${isWhite ? 'text-white' : 'text-white'}`}>I</span>
        </div>
      )}
      <span className={`font-extrabold tracking-tight ${sizes[size] || sizes.md}`}>
        <span className={isWhite ? 'text-white' : 'text-[#1C1C1C]'}>Influence</span>
        <span className={isWhite ? 'text-[#6ECF6E]' : 'text-[#108A00]'}>Hub</span>
      </span>
    </div>
  )
}
