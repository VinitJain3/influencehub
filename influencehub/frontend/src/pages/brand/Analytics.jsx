import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Select from '../../components/ui/Select'
import { Skeleton } from '../../components/ui/Skeleton'
import ChartCard from '../../components/charts/ChartCard'
import LineChartComponent from '../../components/charts/LineChart'
import BarChartComponent from '../../components/charts/BarChart'
import DonutChart from '../../components/charts/DonutChart'
import HorizontalBarRanking from '../../components/charts/HorizontalBarRanking'
import StatusChip from '../../components/ui/StatusChip'
import Avatar from '../../components/ui/Avatar'
import { BarChart2, Users, TrendingUp, Eye } from 'lucide-react'
import client from '../../api/client'

const periodOptions = [{ value: '7d', label: 'Last 7 Days' },{ value: '30d', label: 'Last 30 Days' },{ value: '90d', label: 'Last 90 Days' },{ value: '12m', label: 'Last Year' }]

export default function BrandAnalytics() {
  const [period, setPeriod] = useState('30d')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    client.get('/api/brand/analytics', { params: { period } })
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period])

  return (
    <AppLayout role="brand">
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[24px] font-bold text-[#1C1C1C]">Analytics</h1>
        <Select name="period" options={periodOptions} value={period} onChange={e => setPeriod(e.target.value)} className="w-[160px]" />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-[16px] mb-[20px]">
        {[
          { label: 'Total Reach', icon: Eye, key: 'totalReach' },
          { label: 'Engagement Rate', icon: TrendingUp, key: 'avgEngagement' },
          { label: 'Creators Hired', icon: Users, key: 'creatorsHired' },
          { label: 'Campaigns Run', icon: BarChart2, key: 'campaignsRun' },
        ].map(s => <StatCard key={s.key} label={s.label} icon={s.icon} value={data?.summary?.[s.key]} loading={loading} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-[16px] mb-[16px]">
        <ChartCard title="Reach Over Time" subtitle="Total impressions across campaigns">
          {loading ? <Skeleton height={220} /> : <LineChartComponent data={data?.reachOverTime || []} height={220} />}
        </ChartCard>
        <ChartCard title="Engagement Breakdown">
          {loading ? <Skeleton height={220} /> : <DonutChart data={data?.engagementBreakdown || []} size={200} />}
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-[16px] mb-[16px]">
        <ChartCard title="Campaign Performance">
          {loading ? <Skeleton height={220} /> : <BarChartComponent data={data?.campaignPerformance || []} height={220} showValues />}
        </ChartCard>
        <ChartCard title="Top Creators by ROI">
          {loading ? <Skeleton height={220} /> : <HorizontalBarRanking data={data?.topCreators || []} showRank showValue />}
        </ChartCard>
      </div>

      {/* Campaigns Table */}
      <Card className="!p-0 overflow-hidden">
        <div className="px-[20px] py-[14px] border-b border-[#F0F0EB]">
          <h3 className="text-[15px] font-semibold text-[#1C1C1C]">Campaign Breakdown</h3>
        </div>
        {loading ? (
          <div className="p-[20px] space-y-[8px]">{[1,2,3].map(i => <Skeleton key={i} height={48} />)}</div>
        ) : (
          <table className="w-full" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-[#FAFAF8] border-b border-[#F0F0EB]">
                {['Campaign','Status','Reach','Engagement','Creators','Spend'].map(h => (
                  <th key={h} className="text-left px-[20px] py-[10px] text-[11px] font-semibold text-[#888888] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.campaignBreakdown || []).map((c, i) => (
                <tr key={i} className="border-b border-[#F0F0EB] h-[52px] hover:bg-[#FAFAF8]">
                  <td className="px-[20px] text-[13px] font-semibold text-[#1C1C1C] truncate">{c.title}</td>
                  <td className="px-[20px]"><StatusChip status={c.status} /></td>
                  <td className="px-[20px] text-[13px]">{c.reach ?? '--'}</td>
                  <td className="px-[20px] text-[13px]">{c.engagement ?? '--'}</td>
                  <td className="px-[20px] text-[13px]">{c.creators ?? '--'}</td>
                  <td className="px-[20px] text-[13px] font-semibold text-[#108A00]">{c.spend ?? '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </AppLayout>
  )
}
