export default function HorizontalBarRanking({
  data = [],
  showRank = false,
  showValue = false,
  barHeight = 8,
  color = '#108A00',
  className = '',
}) {
  const maxValue = Math.max(...data.map((d) => d.maxValue || d.value), 1)

  return (
    <div className={`flex flex-col gap-[12px] ${className}`}>
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-[8px]">
          {showRank && (
            <span className="text-[12px] font-semibold text-[#888888] w-[20px] text-right flex-shrink-0">
              {i + 1}
            </span>
          )}
          <span className="text-[13px] font-medium text-[#1C1C1C] w-[140px] overflow-hidden text-ellipsis whitespace-nowrap flex-shrink-0">
            {item.label}
          </span>
          <div
            className="flex-1 bg-[#F0F0EB] rounded-[4px] overflow-hidden relative"
            style={{ height: barHeight }}
          >
            <div
              className="h-full rounded-[4px] transition-[width] duration-[400ms] ease-out"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color || color,
              }}
            />
          </div>
          {showValue && (
            <span className="text-[12px] font-semibold text-[#1C1C1C] w-[60px] text-right flex-shrink-0 ml-[8px]">
              {item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
