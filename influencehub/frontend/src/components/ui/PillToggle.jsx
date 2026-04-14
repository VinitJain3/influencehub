export default function PillToggle({
  options = [],
  value,
  values = [],
  onChange,
  multiSelect = false,
  disabled = false,
  className = '',
}) {
  const handleClick = (optValue) => {
    if (disabled) return
    if (multiSelect) {
      const newValues = values.includes(optValue)
        ? values.filter((v) => v !== optValue)
        : [...values, optValue]
      onChange(newValues)
    } else {
      onChange(optValue)
    }
  }

  const isSelected = (optValue) =>
    multiSelect ? values.includes(optValue) : value === optValue

  return (
    <div className={`flex flex-wrap gap-[8px] ${className}`}>
      {options.map((opt) => {
        const Icon = opt.icon
        const selected = isSelected(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => handleClick(opt.value)}
            className={`
              inline-flex items-center gap-[6px] rounded-full px-[18px] py-[8px]
              text-[14px] font-medium cursor-pointer transition-all duration-150
              ${selected
                ? 'bg-[#108A00] border-[#108A00] text-white border-[1.5px]'
                : 'bg-white border-[1.5px] border-[#E0E0DB] text-[#1C1C1C] hover:border-[#108A00] hover:text-[#108A00]'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {Icon && <Icon size={16} />}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
