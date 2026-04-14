const statusConfig = {
  pending:  { bg: '#FEF3CC', color: '#9A6000' },
  active:   { bg: '#E8F5E6', color: '#108A00' },
  accepted: { bg: '#E8F5E6', color: '#108A00' },
  rejected: { bg: '#FDEDEC', color: '#C0392B' },
  draft:    { bg: '#F0F0EB', color: '#555555' },
  review:   { bg: '#E0EDFB', color: '#1A5FAD' },
  closed:   { bg: '#F0F0EB', color: '#555555' },
}

export default function StatusChip({ status, className = '' }) {
  const config = statusConfig[status] || statusConfig.draft
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : ''

  return (
    <span
      className={`inline-flex items-center rounded-full px-[10px] py-[3px] text-[12px] font-medium h-[22px] whitespace-nowrap ${className}`}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {label}
    </span>
  )
}
