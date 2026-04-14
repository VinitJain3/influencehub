const variantConfig = {
  green:   { bg: '#E8F5E6', color: '#108A00' },
  neutral: { bg: '#F0F0EB', color: '#555555' },
  info:    { bg: '#E0EDFB', color: '#1A5FAD' },
}

export default function TagPill({ label, variant = 'green', className = '' }) {
  const config = variantConfig[variant] || variantConfig.green

  return (
    <span
      className={`inline-flex rounded-full whitespace-nowrap text-[11px] font-medium px-[8px] py-[2px] ${className}`}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {label}
    </span>
  )
}
