import { useState, useEffect } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import StatCard from '../../components/ui/StatCard'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import ChartCard from '../../components/charts/ChartCard'
import LineChartComponent from '../../components/charts/LineChart'
import BarChartComponent from '../../components/charts/BarChart'
import DonutChart from '../../components/charts/DonutChart'
import AreaChartComponent from '../../components/charts/AreaChart'
import HorizontalBarRanking from '../../components/charts/HorizontalBarRanking'
import { TrendingUp, Eye, Users, DollarSign } from 'lucide-react'
import client from '../../api/client'

const periodOptions = [{ value: '7d', label: 'Last 7 Days' },{ value: '30d', label: 'Last 30 Days' },{ value: '90d', label: 'Last 90 Days' },{ value: '12m', label: 'Last Year' }]

export default function InfluencerAnalytics() {
  const [period, setPeriod] = useState('30d')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    client.get('/api/influencer/analytics', { params: { period } })
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period])

  return (
    <AppLayout role="influencer">
      <div className="flex justify-between items-center mb-[20px]">
        <h1 className="text-[24px] font-bold text-[#1C1C1C]">Analytics</h1>
        <Select name="period" options={periodOptions} value={period} onChange={e => setPeriod(e.target.value)} className="w-[160px]" />
      </div>

      <div className="grid grid-cols-4 gap-[16px] mb-[20px]">
        {[
          { label: 'Profile Views', icon: Eye, key: 'profileViews' },
          { label: 'Engagement Rate', icon: TrendingUp, key: 'engagementRate' },
          { label: 'Total Earnings', icon: DollarSign, key: 'totalEarnings' },
          { label: 'Collaborations', icon: Users, key: 'totalCollabs' },
        ].map(s => <StatCard key={s.key} label={s.label} icon={s.icon} value={data?.summary?.[s.key]} loading={loading} />)}
      </div>

      <div className="grid grid-cols-2 gap-[16px] mb-[16px]">
        <ChartCard title="Earnings Over Time">
          {loading ? <Skeleton height={220} /> : <AreaChartComponent data={data?.earningsOverTime || []} height={220} />}
        </ChartCard>
        <ChartCard title="Engagement Trend">
          {loading ? <Skeleton height={220} /> : <LineChartComponent data={data?.engagementTrend || []} height={220} />}
        </ChartCard>
      </div>

      <div className="grid grid-cols-2 gap-[16px] mb-[16px]">
        <ChartCard title="Content Type Performance">
          {loading ? <Skeleton height={220} /> : <BarChartComponent data={data?.contentPerformance || []} height={220} showValues />}
        </ChartCard>
        <ChartCard title="Audience Demographics">
          {loading ? <Skeleton height={220} /> : <DonutChart data={data?.audienceDemographics || []} size={200} showCenter={{ value: data?.summary?.totalFollowers || '--', label: 'Followers' }} />}
        </ChartCard>
      </div>

      <ChartCard title="Top Performing Content">
        {loading ? <Skeleton height={180} /> : <HorizontalBarRanking data={data?.topContent || []} showRank showValue />}
      </ChartCard>

      {/* Collab History Table */}
      <Card className="!p-0 overflow-hidden mt-[16px]">
        <div className="px-[20px] py-[14px] border-b border-[#F0F0EB]">
          <h3 className="text-[15px] font-semibold text-[#1C1C1C]">Collaboration History</h3>
        </div>
        {loading ? (
          <div className="p-[20px] space-y-[8px]">{[1,2,3].map(i => <Skeleton key={i} height={48} />)}</div>
        ) : (
          <table className="w-full" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-[#FAFAF8] border-b border-[#F0F0EB]">
                {['Brand','Campaign','Earnings','Reach','Date'].map(h => (
                  <th key={h} className="text-left px-[20px] py-[10px] text-[11px] font-semibold text-[#888888] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.collabHistory || []).map((c, i) => (
                <tr key={i} className="border-b border-[#F0F0EB] h-[52px] hover:bg-[#FAFAF8]">
                  <td className="px-[20px] text-[13px] font-semibold text-[#1C1C1C] truncate">{c.brand}</td>
                  <td className="px-[20px] text-[13px] text-[#444444] truncate">{c.campaign}</td>
                  <td className="px-[20px] text-[13px] font-semibold text-[#108A00]">{c.earnings ?? '--'}</td>
                  <td className="px-[20px] text-[13px]">{c.reach ?? '--'}</td>
                  <td className="px-[20px] text-[12px] text-[#888888]">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </AppLayout>
  )
}
