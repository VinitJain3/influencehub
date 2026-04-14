import { AreaChart as ReAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E0E0DB] rounded-[8px] px-[14px] py-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      <p className="text-[12px] font-semibold text-[#1C1C1C]">{label}</p>
      <p className="text-[13px] font-bold text-[#108A00]">{payload[0]?.value}</p>
    </div>
  )
}

export default function AreaChartComponent({
  data = [],
  height = 220,
  color = '#108A00',
  showPoints = true,
  className = '',
}) {
  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <ReAreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id={`areaGrad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="#F0F0EB" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#areaGrad-${color.replace('#','')})`}
          dot={showPoints ? { r: 4, fill: 'white', stroke: color, strokeWidth: 2 } : false}
          activeDot={{ r: 6, fill: color, stroke: 'white', strokeWidth: 2 }}
        />
      </ReAreaChart>
    </ResponsiveContainer>
  )
}
