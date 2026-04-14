import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E0E0DB] rounded-[8px] px-[14px] py-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      <p className="text-[12px] font-semibold text-[#1C1C1C]">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[13px] font-bold" style={{ color: p.color }}>{p.value}</p>
      ))}
    </div>
  )
}

export default function LineChartComponent({
  data = [],
  datasets,
  height = 220,
  showArea = false,
  showPoints = true,
  curved = true,
  color = '#108A00',
  className = '',
}) {
  const PALETTE = ['#108A00', '#1A5FAD', '#E8A838', '#C0392B', '#7B61FF']

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <ReLineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#F0F0EB" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        {datasets ? (
          datasets.map((ds, i) => (
            <Line
              key={ds.label}
              type={curved ? 'monotone' : 'linear'}
              dataKey={ds.label}
              stroke={ds.color || PALETTE[i % PALETTE.length]}
              strokeWidth={2.5}
              dot={showPoints ? { r: 4, fill: 'white', stroke: ds.color || PALETTE[i], strokeWidth: 2 } : false}
              activeDot={{ r: 6, fill: ds.color || PALETTE[i], stroke: 'white', strokeWidth: 2 }}
            />
          ))
        ) : (
          <Line
            type={curved ? 'monotone' : 'linear'}
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={showPoints ? { r: 4, fill: 'white', stroke: color, strokeWidth: 2 } : false}
            activeDot={{ r: 6, fill: color, stroke: 'white', strokeWidth: 2 }}
          />
        )}
      </ReLineChart>
    </ResponsiveContainer>
  )
}
