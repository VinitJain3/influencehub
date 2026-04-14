import Card from './Card'
import SparkLine from '../charts/SparkLine'
import { Skeleton } from './Skeleton'

export default function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  sparkData = [],
  loading = false,
}) {
  return (
    <Card padding="sm" className="min-w-0 !p-[16px_18px]">
      {Icon && (
        <div className="flex justify-end">
          <div className="w-[32px] h-[32px] rounded-full bg-[#E8F5E6] flex items-center justify-center">
            <Icon size={18} className="text-[#108A00]" />
          </div>
        </div>
      )}
      <div className="mt-[8px]">
        {loading ? (
          <Skeleton height={24} width={80} />
        ) : (
          <span className="text-[24px] font-bold text-[#1C1C1C]">{value ?? '--'}</span>
        )}
      </div>
      <p className="text-[12px] font-medium text-[#888888] mt-[2px]">{label}</p>
      <div className="flex justify-between items-end mt-[10px]">
        {trend && (
          <span
            className={`
              text-[12px] font-semibold px-[8px] py-[2px] rounded-full
              ${trend.direction === 'up' ? 'text-[#108A00] bg-[#E8F5E6]' : ''}
              ${trend.direction === 'down' ? 'text-[#C0392B] bg-[#FDEDEC]' : ''}
              ${trend.direction === 'flat' ? 'text-[#888888] bg-[#F0F0EB]' : ''}
            `}
          >
            {trend.direction === 'up' && '↑ +'}{trend.direction === 'down' && '↓ '}{trend.direction === 'flat' && '→ '}{trend.value}%
          </span>
        )}
        {sparkData.length > 0 && (
          <SparkLine data={sparkData} width={80} height={28} color="#108A00" showDot />
        )}
      </div>
    </Card>
  )
}
