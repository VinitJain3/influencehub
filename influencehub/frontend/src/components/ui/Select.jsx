import { ChevronDown } from 'lucide-react'

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  error,
  helper,
  required = false,
  disabled = false,
  className = '',
  register,
  ...props
}) {
  const inputProps = register ? register(name) : { name, value, onChange }

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-[14px] font-medium text-[#1C1C1C] mb-[6px]">
          {label}
          {required && <span className="text-[#C0392B] ml-[2px] text-[14px]">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          disabled={disabled}
          className={`
            w-full h-[44px] border rounded-[8px] text-[14px] bg-white appearance-none
            pl-[14px] pr-[36px] outline-none transition-all duration-150 cursor-pointer
            ${value ? 'text-[#1C1C1C]' : 'text-[#888888]'}
            ${error
              ? 'border-[1.5px] border-[#C0392B] shadow-[0_0_0_3px_rgba(192,57,43,0.08)]'
              : 'border-[#E0E0DB] focus:border-[1.5px] focus:border-[#108A00] focus:shadow-[0_0_0_3px_rgba(16,138,0,0.10)]'
            }
            ${disabled ? 'bg-[#F0F0EB] cursor-not-allowed' : ''}
          `}
          {...inputProps}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none"
        />
      </div>
      {error && <p className="text-[12px] text-[#C0392B] mt-[4px]">{error}</p>}
      {helper && !error && <p className="text-[12px] text-[#888888] mt-[4px]">{helper}</p>}
    </div>
  )
}
