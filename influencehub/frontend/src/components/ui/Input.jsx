export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helper,
  prefix,
  suffix,
  leftIcon: LeftIcon,
  required = false,
  disabled = false,
  maxLength,
  className = '',
  register,
  ...props
}) {
  const inputProps = register ? register(name) : { name, value, onChange, onBlur }

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-[14px] font-medium text-[#1C1C1C] mb-[6px]">
          {label}
          {required && <span className="text-[#C0392B] ml-[2px] text-[14px]">*</span>}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#888888] pointer-events-none">
            {prefix}
          </span>
        )}
        {LeftIcon && (
          <LeftIcon
            size={16}
            className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none"
          />
        )}
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`
            w-full h-[44px] border rounded-[8px] text-[14px] text-[#1C1C1C] bg-white
            placeholder:text-[#888888] outline-none transition-all duration-150
            ${prefix ? 'pl-[28px]' : LeftIcon ? 'pl-[38px]' : 'px-[14px]'}
            ${suffix ? 'pr-[28px]' : 'pr-[14px]'}
            ${error
              ? 'border-[1.5px] border-[#C0392B] shadow-[0_0_0_3px_rgba(192,57,43,0.08)]'
              : 'border-[#E0E0DB] focus:border-[1.5px] focus:border-[#108A00] focus:shadow-[0_0_0_3px_rgba(16,138,0,0.10)]'
            }
            ${disabled ? 'bg-[#F0F0EB] text-[#888888] cursor-not-allowed' : ''}
          `}
          {...inputProps}
          {...props}
        />
        {suffix && (
          <span className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#888888] pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-[12px] text-[#C0392B] mt-[4px]">{error}</p>}
      {helper && !error && <p className="text-[12px] text-[#888888] mt-[4px]">{helper}</p>}
    </div>
  )
}
