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
import { ChevronDown, ChevronUp } from 'lucide-react'
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
      <div className="flex gap-[20px]">
        {/* Filter Panel */}
        <div className="w-[268px] flex-shrink-0 sticky top-[84px] self-start">
          <Card>
            <div className="flex justify-between items-center mb-[16px]">
              <h3 className="text-[15px] font-semibold text-[#1C1C1C]">Filters</h3>
              <button onClick={() => setFilters({ niches: [], platforms: [], budget: '', search: '' })} className="text-[13px] text-[#C0392B] hover:underline cursor-pointer">Clear All</button>
            </div>

            <div className="mb-[14px]">
              <div className="relative">
                <Search size={14} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#888888]" />
                <input placeholder="Search campaigns..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })}
                  className="w-full h-[36px] border border-[#E0E0DB] rounded-[6px] pl-[32px] pr-[10px] text-[13px] outline-none focus:border-[#108A00]" />
              </div>
            </div>

            <div className="border-b border-[#F0F0EB] pb-[14px] mb-[14px]">
              <button onClick={() => toggleSection('niche')} className="flex justify-between items-center w-full text-[13px] font-semibold text-[#1C1C1C] mb-[8px] cursor-pointer">
                Category {collapsed.niche ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
              {!collapsed.niche && (
                <div className="max-h-[180px] overflow-y-auto space-y-[6px]">
                  {nicheList.map(n => <Checkbox key={n} label={n} checked={filters.niches.includes(n)}
                    onChange={() => setFilters({ ...filters, niches: filters.niches.includes(n) ? filters.niches.filter(x => x !== n) : [...filters.niches, n] })} />)}
                </div>
              )}
            </div>

            <div className="border-b border-[#F0F0EB] pb-[14px] mb-[14px]">
              <button onClick={() => toggleSection('platform')} className="flex justify-between items-center w-full text-[13px] font-semibold text-[#1C1C1C] mb-[8px] cursor-pointer">
                Platform {collapsed.platform ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
              {!collapsed.platform && (
                <div className="space-y-[6px]">
                  {['Instagram','YouTube','TikTok','Twitter/X','LinkedIn'].map(p => <Checkbox key={p} label={p} checked={filters.platforms.includes(p)}
                    onChange={() => setFilters({ ...filters, platforms: filters.platforms.includes(p) ? filters.platforms.filter(x => x !== p) : [...filters.platforms, p] })} />)}
                </div>
              )}
            </div>

            <Select label="Budget Range" name="budget" options={budgetOptions} value={filters.budget}
              onChange={e => setFilters({ ...filters, budget: e.target.value })} />

            <Button fullWidth className="mt-[18px] !h-[38px]" onClick={apply}>Apply</Button>
          </Card>
        </div>

        {/* Campaign List */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-[14px]">
            <p className="text-[13px] text-[#888888]">{total} campaigns found</p>
            <Select name="sort" options={sortOptions} value={sort} onChange={e => setSort(e.target.value)} className="w-[160px]" />
          </div>

          {loading ? (
            <div className="space-y-[14px]">{[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}</div>
          ) : !results.length ? (
            <Card><EmptyState icon={SearchX} title="No campaigns match" description="Try adjusting your filters."
              action={{ label: 'Clear Filters', variant: 'ghost-green', onClick: () => setFilters({ niches: [], platforms: [], budget: '', search: '' }) }} /></Card>
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
