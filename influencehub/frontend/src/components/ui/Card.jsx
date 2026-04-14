export default function Card({
  children,
  padding = 'md',
  hoverable = false,
  className = '',
  onClick,
}) {
  const paddings = { sm: '12px', md: '20px', lg: '28px' }

  return (
    <div
      onClick={onClick}
      className={`
        bg-white border border-[#E0E0DB] rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]
        ${hoverable ? 'cursor-pointer transition-all duration-[180ms] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-[1px]' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{ padding: paddings[padding] || paddings.md }}
    >
      {children}
    </div>
  )
}
