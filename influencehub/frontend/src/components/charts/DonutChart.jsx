import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const CHART_PALETTE = ['#108A00', '#1A5FAD', '#E8A838', '#C0392B', '#7B61FF', '#0BBFAF', '#E16ECF', '#FF7A45']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E0E0DB] rounded-[8px] px-[14px] py-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      <p className="text-[12px] font-semibold text-[#1C1C1C]">{payload[0].name}</p>
      <p className="text-[13px] font-bold text-[#108A00]">{payload[0].value}</p>
    </div>
  )
}

export default function DonutChart({
  data = [],
  size = 200,
  strokeWidth = 28,
  showCenter,
  className = '',
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const innerRadius = (size / 2) - strokeWidth - 10
  const outerRadius = (size / 2) - 10

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              dataKey="value"
              nameKey="label"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color || CHART_PALETTE[i % CHART_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {showCenter && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[22px] font-bold text-[#1C1C1C]">{showCenter.value}</span>
            <span className="text-[11px] font-medium text-[#888888]">{showCenter.label}</span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-[16px] mt-[16px] justify-center">
        {data.map((entry, i) => (
          <div key={i} className="flex items-center gap-[6px]">
            <span
              className="w-[10px] h-[10px] rounded-[2px]"
              style={{ backgroundColor: entry.color || CHART_PALETTE[i % CHART_PALETTE.length] }}
            />
            <span className="text-[12px] text-[#444444]">{entry.label}</span>
            <span className="text-[12px] font-semibold text-[#1C1C1C]">
              {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
