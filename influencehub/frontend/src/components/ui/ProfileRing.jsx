export default function ProfileRing({ value = 0, size = 100, strokeWidth = 6 }) {
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (circumference * value) / 100

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#E0E0DB" strokeWidth={strokeWidth} />
        <circle
          cx="50" cy="50" r={radius} fill="none" stroke="#108A00" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 600ms ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[18px] font-bold text-[#1C1C1C]">{value}%</span>
      </div>
    </div>
  )
}
