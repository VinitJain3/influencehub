import { motion } from 'framer-motion'

const variants = {
  primary: 'bg-[#108A00] text-white hover:bg-[#0B6E00] border-transparent',
  'ghost-dark': 'bg-white border-[1.5px] border-[#1C1C1C] text-[#1C1C1C] hover:bg-[#F5F5F0]',
  'ghost-green': 'bg-white border-[1.5px] border-[#108A00] text-[#108A00] hover:bg-[#E8F5E6]',
  danger: 'bg-[#C0392B] text-white hover:bg-[#A93226] border-transparent',
  'danger-outline': 'bg-white border-[1.5px] border-[#C0392B] text-[#C0392B] hover:bg-[#FDEDEC]',
}

const sizes = {
  sm: 'px-4 h-[34px] text-[13px] font-semibold',
  md: 'px-6 h-[44px] text-[14px] font-semibold',
  lg: 'px-8 h-[52px] text-[16px] font-semibold',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onClick,
  type = 'button',
  children,
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={!isDisabled ? { scale: 0.97 } : {}}
      transition={{ duration: 0.1 }}
      className={`
        inline-flex items-center justify-center gap-[6px] rounded-full cursor-pointer
        transition-colors duration-150 outline-none
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? '!bg-[#E0E0DB] !text-[#888888] !border-[#E0E0DB] !cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span
          className="inline-block w-4 h-4 border-2 rounded-full animate-spin"
          style={{
            borderColor: 'rgba(255,255,255,0.3)',
            borderTopColor: 'white',
          }}
        />
      ) : (
        <>
          {LeftIcon && <LeftIcon size={16} />}
          {children}
          {RightIcon && <RightIcon size={16} />}
        </>
      )}
    </motion.button>
  )
}
