import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Grid3x3, List, SearchX } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import Toggle from '../../components/ui/Toggle'
import Avatar from '../../components/ui/Avatar'
import TagPill from '../../components/ui/TagPill'
import Checkbox from '../../components/ui/Checkbox'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import SkeletonCard from '../../components/ui/Skeleton'
import { ChevronDown, ChevronUp } from 'lucide-react'
import client from '../../api/client'

const nicheList = ['Fashion','Beauty','Fitness','Food','Travel','Gaming','Tech','Finance','Lifestyle','Entertainment','Education','Comedy']
const budgetOptions = [{ value: '', label: 'Any' },{ value: 'under5k', label: 'Under ₹5K' },{ value: '5k-25k', label: '₹5K–₹25K' },{ value: '25k-1l', label: '₹25K–₹1L' },{ value: '1l+', label: '₹1L+' }]
const engagementOptions = [{ value: '', label: 'Any' },{ value: '1-3', label: '1–3%' },{ value: '3-5', label: '3–5%' },{ value: '5-10', label: '5–10%' },{ value: '10+', label: '10%+' }]
const sortOptions = [{ value: 'relevance', label: 'Relevance' },{ value: 'followers_desc', label: 'Followers ↓' },{ value: 'followers_asc', label: 'Followers ↑' },{ value: 'engagement', label: 'Engagement' },{ value: 'newest', label: 'Newest' }]

export default function DiscoverCreators() {
  const [filters, setFilters] = useState({ niches: [], platforms: [], budget: '', engagement: '' })
  const [sort, setSort] = useState('relevance')
  const [view, setView] = useState('grid')
  const [page, setPage] = useState(1)
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState({})
  const [nicheSearch, setNicheSearch] = useState('')
  const navigate = useNavigate()

  const fetchCreators = () => {
    setLoading(true)
    client.get('/api/creators', { params: { ...filters, sort, page } })
      .then(res => { setResults(res.data.creators || []); setTotal(res.data.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCreators() }, [page, sort])

  const toggleSection = (key) => setCollapsed({ ...collapsed, [key]: !collapsed[key] })
  const filteredNiches = nicheList.filter(n => n.toLowerCase().includes(nicheSearch.toLowerCase()))

  return (
    <AppLayout role="brand">
      <div className="flex gap-[20px]">
        {/* Filter Panel */}
        <div className="w-[268px] flex-shrink-0 sticky top-[84px] self-start">
          <Card>
            <div className="flex justify-between items-center mb-[16px]">
              <h3 className="text-[15px] font-semibold text-[#1C1C1C]">Filters</h3>
              <button onClick={() => setFilters({ niches: [], platforms: [], budget: '', engagement: '' })} className="text-[13px] text-[#C0392B] hover:underline cursor-pointer">Clear All</button>
            </div>

            {/* Niche */}
            <div className="border-b border-[#F0F0EB] pb-[14px] mb-[14px]">
              <button onClick={() => toggleSection('niche')} className="flex justify-between items-center w-full text-[13px] font-semibold text-[#1C1C1C] mb-[8px] cursor-pointer">
                Content Niche {collapsed.niche ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
              {!collapsed.niche && (
                <>
                  <input placeholder="Search niches..." value={nicheSearch} onChange={e => setNicheSearch(e.target.value)}
                    className="w-full h-[32px] border border-[#E0E0DB] rounded-[6px] px-[10px] text-[12px] mb-[8px] outline-none focus:border-[#108A00]" />
                  <div className="max-h-[180px] overflow-y-auto space-y-[6px]">
                    {filteredNiches.map(n => (
                      <Checkbox key={n} label={n} checked={filters.niches.includes(n)}
                        onChange={() => setFilters({ ...filters, niches: filters.niches.includes(n) ? filters.niches.filter(x => x !== n) : [...filters.niches, n] })} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Platform */}
            <div className="border-b border-[#F0F0EB] pb-[14px] mb-[14px]">
              <button onClick={() => toggleSection('platform')} className="flex justify-between items-center w-full text-[13px] font-semibold text-[#1C1C1C] mb-[8px] cursor-pointer">
                Platform {collapsed.platform ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
              {!collapsed.platform && (
                <div className="space-y-[6px]">
                  {['Instagram','YouTube','TikTok','Twitter/X','LinkedIn'].map(p => (
                    <Checkbox key={p} label={p} checked={filters.platforms.includes(p)}
                      onChange={() => setFilters({ ...filters, platforms: filters.platforms.includes(p) ? filters.platforms.filter(x => x !== p) : [...filters.platforms, p] })} />
                  ))}
                </div>
              )}
            </div>

            {/* Budget */}
            <div className="border-b border-[#F0F0EB] pb-[14px] mb-[14px]">
              <Select label="Budget/Rate" name="budget" options={budgetOptions} value={filters.budget}
                onChange={e => setFilters({ ...filters, budget: e.target.value })} />
            </div>

            {/* Engagement */}
            <div className="border-b border-[#F0F0EB] pb-[14px] mb-[14px]">
              <Select label="Engagement Rate" name="engagement" options={engagementOptions} value={filters.engagement}
                onChange={e => setFilters({ ...filters, engagement: e.target.value })} />
            </div>

            <Button fullWidth className="mt-[18px] !h-[38px]" onClick={() => { setPage(1); fetchCreators() }}>Apply Filters</Button>
          </Card>
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-[14px]">
            <p className="text-[13px] text-[#888888]">{total} creators found</p>
            <div className="flex items-center gap-[8px]">
              <Select name="sort" options={sortOptions} value={sort} onChange={e => setSort(e.target.value)} className="w-[160px]" />
              <div className="flex gap-[2px]">
                {[{ v: 'grid', Icon: Grid3x3 }, { v: 'list', Icon: List }].map(({ v, Icon }) => (
                  <button key={v} onClick={() => setView(v)}
                    className={`w-[32px] h-[32px] flex items-center justify-center rounded-[4px] cursor-pointer transition-colors ${view === v ? 'bg-[#E8F5E6] text-[#108A00]' : 'text-[#888888] hover:bg-[#F5F5F0]'}`}>
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className={view === 'grid' ? 'grid grid-cols-3 gap-[14px]' : 'space-y-[10px]'}>
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : !results.length ? (
            <Card><EmptyState icon={SearchX} title="No creators match your filters" description="Try adjusting your filters or search criteria."
              action={{ label: 'Clear Filters', variant: 'ghost-green', onClick: () => setFilters({ niches: [], platforms: [], budget: '', engagement: '' }) }} /></Card>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-3 gap-[14px]">
              {results.map(c => (
                <Card key={c.id} hoverable className="!p-0 overflow-hidden">
                  <div className="h-[80px] bg-[#F0F0EB] relative">
                    <Avatar name={c.name} size={40} className="absolute -bottom-[20px] left-[14px] border-2 border-white" />
                  </div>
                  <div className="p-[28px_14px_14px]">
                    <p className="text-[14px] font-semibold text-[#1C1C1C] truncate">{c.name}</p>
                    <p className="text-[12px] text-[#888888]">@{c.handle}</p>
                    {c.niche && <TagPill label={c.niche} className="mt-[4px]" />}
                    <div className="flex gap-[6px] mt-[10px]">
                      <Button variant="ghost-dark" size="sm" fullWidth onClick={() => navigate(`/brand/creator/${c.id}`)}>View</Button>
                      <Button size="sm" fullWidth onClick={() => navigate(`/brand/creator/${c.id}`)}>Request</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-[10px]">
              {results.map(c => (
                <Card key={c.id} className="!py-0 flex items-center h-[68px] gap-[14px]">
                  <Avatar name={c.name} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1C1C1C] truncate">{c.name} <span className="font-normal text-[#888888]">@{c.handle}</span></p>
                    {c.niche && <TagPill label={c.niche} />}
                  </div>
                  <div className="flex gap-[6px] ml-auto">
                    <Button variant="ghost-dark" size="sm" onClick={() => navigate(`/brand/creator/${c.id}`)}>View</Button>
                    <Button size="sm" onClick={() => navigate(`/brand/creator/${c.id}`)}>Request</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Pagination currentPage={page} totalPages={Math.ceil(total / 12) || 1} onPageChange={(p) => { setPage(p); window.scrollTo(0, 0) }} />
        </div>
      </div>
    </AppLayout>
  )
}
