import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Megaphone, SearchX } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import Checkbox from '../../components/ui/Checkbox'
import Avatar from '../../components/ui/Avatar'
import TagPill from '../../components/ui/TagPill'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import SkeletonCard from '../../components/ui/Skeleton'
import client from '../../api/client'

const nicheList = ['Fashion','Beauty','Fitness','Food','Travel','Gaming','Tech','Finance','Lifestyle','Entertainment','Education','Comedy']
const budgetOptions = [{ value: '', label: 'Any' },{ value: 'under5k', label: 'Under ₹5K' },{ value: '5k-25k', label: '₹5K–₹25K' },{ value: '25k-1l', label: '₹25K–₹1L' },{ value: '1l+', label: '₹1L+' }]
const sortOptions = [{ value: 'relevance', label: 'Relevance' },{ value: 'newest', label: 'Newest' },{ value: 'budget_desc', label: 'Budget ↓' },{ value: 'budget_asc', label: 'Budget ↑' },{ value: 'deadline', label: 'Deadline' }]

export default function BrowseCampaigns() {
  const [filters, setFilters] = useState({ niches: [], platforms: [], budget: '', search: '' })
  const [sort, setSort] = useState('relevance')
  const [page, setPage] = useState(1)
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    client.get('/api/campaigns', { params: { ...filters, sort, page } })
      .then(res => { setResults(res.data.campaigns || []); setTotal(res.data.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, sort])

  const apply = () => { setPage(1); setLoading(true); client.get('/api/campaigns', { params: { ...filters, sort, page: 1 } })
    .then(res => { setResults(res.data.campaigns || []); setTotal(res.data.total || 0) }).catch(() => {}).finally(() => setLoading(false)) }

  const toggleSection = (key) => setCollapsed({ ...collapsed, [key]: !collapsed[key] })

  return (
    <AppLayout role="influencer">
      <div className="flex flex-col gap-[20px]">
        {/* Campaign List */}
        <div className="w-full min-w-0">
          <div className="flex justify-between items-center mb-[14px]">
            <p className="text-[13px] text-[#888888]">{total} campaigns found</p>
            <Select name="sort" options={sortOptions} value={sort} onChange={e => setSort(e.target.value)} className="w-[160px]" />
          </div>

          {loading ? (
            <div className="space-y-[14px]">{[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}</div>
          ) : !results.length ? (
            <Card><EmptyState icon={SearchX} title="No campaigns match" description="There are no campaigns available right now." /></Card>
          ) : (
            <div className="space-y-[12px]">
              {results.map(c => (
                <Card key={c.id} hoverable onClick={() => navigate(`/influencer/campaigns/${c.id}`)}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-[8px] mb-[4px]">
                        <Avatar name={c.brandName} size={28} />
                        <span className="text-[12px] text-[#888888]">{c.brandName}</span>
                        {c.verified && <span className="text-[11px] text-[#108A00] font-semibold">✓</span>}
                      </div>
                      <h3 className="text-[15px] font-semibold text-[#1C1C1C] mb-[4px]">{c.title}</h3>
                      <p className="text-[13px] text-[#444444] line-clamp-2 mb-[8px]">{c.description}</p>
                      <div className="flex gap-[4px] flex-wrap">
                        {c.contentTypes?.map((t, i) => <TagPill key={i} label={t} />)}
                        {c.platforms?.map((p, i) => <TagPill key={`p${i}`} label={p} variant="info" />)}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-[20px]">
                      <p className="text-[18px] font-bold text-[#108A00]">{c.budget || '--'}</p>
                      <p className="text-[11px] text-[#888888] mt-[2px]">Deadline: {c.deadline || '--'}</p>
                      <p className="text-[11px] text-[#888888]">{c.requestCount ?? 0} requests</p>
                      <Button size="sm" className="mt-[8px]" onClick={(e) => { e.stopPropagation(); navigate(`/influencer/campaigns/${c.id}`) }}>Apply →</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Pagination currentPage={page} totalPages={Math.ceil(total / 10) || 1} onPageChange={(p) => { setPage(p); window.scrollTo(0, 0) }} />
        </div>
      </div>
    </AppLayout>
  )
}
