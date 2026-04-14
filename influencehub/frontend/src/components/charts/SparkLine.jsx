export default function SparkLine({
  data = [],
  width = 80,
  height = 28,
  color = '#108A00',
  showDot = false,
}) {
  if (data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  const lastX = width
  const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />
      {showDot && (
        <circle cx={lastX} cy={lastY} r={2.5} fill={color} />
      )}
    </svg>
  )
}
