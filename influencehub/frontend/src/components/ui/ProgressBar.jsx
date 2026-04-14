export default function ProgressBar({
  value = 0,
  size = 'sm',
  color = '#108A00',
  showLabel = false,
}) {
  const height = size === 'sm' ? 4 : 8

  return (
    <div>
      <div
        className="w-full bg-[#E0E0DB] rounded-[2px] overflow-hidden"
        style={{ height }}
      >
        <div
          className="h-full rounded-[2px] transition-[width] duration-[400ms] ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <p className="text-[12px] text-[#888888] mt-[4px]">{value}% complete</p>
      )}
    </div>
  )
}
