import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'

const CHART_PALETTE = ['#108A00', '#1A5FAD', '#E8A838', '#C0392B', '#7B61FF', '#0BBFAF', '#E16ECF', '#FF7A45']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E0E0DB] rounded-[8px] px-[14px] py-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      <p className="text-[12px] font-semibold text-[#1C1C1C]">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[13px] font-bold text-[#108A00]">{p.value}</p>
      ))}
    </div>
  )
}

export default function BarChartComponent({
  data = [],
  height = 220,
  showValues = false,
  horizontal = false,
  xLabel,
  yLabel,
  className = '',
}) {
  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={Math.max(height, data.length * 40)}>
        <ReBarChart data={data} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#F0F0EB" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
          <YAxis dataKey="label" type="category" tick={{ fontSize: 11, fill: '#888888' }} width={120} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} label={showValues ? { position: 'right', fontSize: 11, fontWeight: 600, fill: '#1C1C1C' } : false}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || CHART_PALETTE[i % CHART_PALETTE.length]} />
            ))}
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <ReBarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#F0F0EB" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={36} label={showValues ? { position: 'top', fontSize: 11, fontWeight: 600, fill: '#1C1C1C', offset: 4 } : false}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color || CHART_PALETTE[i % CHART_PALETTE.length]} />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  )
}
