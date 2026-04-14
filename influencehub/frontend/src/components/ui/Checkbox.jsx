import { Check } from 'lucide-react'

export default function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  name,
  id,
  className = '',
}) {
  const checkboxId = id || name

  return (
    <label
      htmlFor={checkboxId}
      className={`flex items-center gap-[8px] cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <input
        type="checkbox"
        id={checkboxId}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="opacity-0 absolute"
      />
      <span
        className={`
          w-[18px] h-[18px] rounded-[4px] flex-shrink-0 flex items-center justify-center
          border-[1.5px] transition-all duration-150
          ${checked
            ? 'bg-[#108A00] border-[#108A00]'
            : 'bg-white border-[#C4C4BF] hover:border-[#108A00]'
          }
        `}
      >
        {checked && <Check size={12} className="text-white" />}
      </span>
      {label && <span className="text-[14px] text-[#1C1C1C]">{label}</span>}
    </label>
  )
}
