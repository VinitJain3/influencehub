export default function ChartCard({
  title,
  subtitle,
  children,
  action,
  dateRange,
  className = '',
}) {
  return (
    <div className={`bg-white border border-[#E0E0DB] rounded-[12px] overflow-hidden ${className}`}>
      <div className="px-[20px] pt-[18px] flex justify-between items-start">
        <div>
          <h3 className="text-[15px] font-semibold text-[#1C1C1C]">{title}</h3>
          {subtitle && <p className="text-[12px] text-[#888888] mt-[2px]">{subtitle}</p>}
        </div>
        {(dateRange || action) && (
          <div>
            {dateRange && <span className="text-[12px] text-[#888888]">{dateRange}</span>}
            {action && (
              <button
                onClick={action.onClick}
                className="text-[13px] font-medium text-[#108A00] hover:underline cursor-pointer"
              >
                {action.label}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="px-[20px] pt-[12px] pb-[20px]">
        {children}
      </div>
    </div>
  )
}
