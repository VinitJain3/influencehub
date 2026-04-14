export default function Toggle({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  name,
  className = '',
}) {
  return (
    <label
      className={`
        flex justify-between items-start gap-[16px] cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-[13px] font-semibold text-[#1C1C1C]">{label}</span>}
          {description && <span className="text-[12px] text-[#888888]">{description}</span>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        name={name}
        onClick={() => !disabled && onChange?.(!checked)}
        className={`
          relative w-[44px] h-[24px] rounded-[12px] flex-shrink-0 transition-colors duration-150 cursor-pointer
          ${checked ? 'bg-[#108A00]' : 'bg-[#C4C4BF]'}
        `}
      >
        <span
          className={`
            absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full transition-transform duration-150
            shadow-[0_1px_3px_rgba(0,0,0,0.2)]
            ${checked ? 'translate-x-[23px]' : 'translate-x-[3px]'}
          `}
        />
      </button>
    </label>
  )
}
