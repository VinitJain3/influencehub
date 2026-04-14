export default function Textarea({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  helper,
  maxLength,
  showCount = false,
  rows = 4,
  required = false,
  disabled = false,
  className = '',
  register,
  ...props
}) {
  const inputProps = register ? register(name) : { name, value, onChange }
  const currentLength = value?.length || 0
  const nearLimit = maxLength && currentLength > maxLength * 0.9

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-[14px] font-medium text-[#1C1C1C] mb-[6px]">
          {label}
          {required && <span className="text-[#C0392B] ml-[2px] text-[14px]">*</span>}
        </label>
      )}
      <div className="relative">
        <textarea
          id={name}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          className={`
            w-full border rounded-[8px] text-[14px] text-[#1C1C1C] bg-white resize-y
            p-[12px_14px] placeholder:text-[#888888] outline-none transition-all duration-150
            ${error
              ? 'border-[1.5px] border-[#C0392B] shadow-[0_0_0_3px_rgba(192,57,43,0.08)]'
              : 'border-[#E0E0DB] focus:border-[1.5px] focus:border-[#108A00] focus:shadow-[0_0_0_3px_rgba(16,138,0,0.10)]'
            }
            ${disabled ? 'bg-[#F0F0EB] text-[#888888] cursor-not-allowed' : ''}
          `}
          style={{ minHeight: `${rows * 24 + 24}px` }}
          {...inputProps}
          {...props}
        />
        {showCount && maxLength && (
          <span
            className={`absolute bottom-[8px] right-[10px] text-[11px] ${
              nearLimit ? 'text-[#C0392B]' : 'text-[#888888]'
            }`}
          >
            {currentLength} / {maxLength}
          </span>
        )}
      </div>
      {error && <p className="text-[12px] text-[#C0392B] mt-[4px]">{error}</p>}
      {helper && !error && <p className="text-[12px] text-[#888888] mt-[4px]">{helper}</p>}
    </div>
  )
}
