import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Select from '../../components/ui/Select'
import PillToggle from '../../components/ui/PillToggle'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../store/toastStore'
import client from '../../api/client'

const industryOptions = ['Fashion & Apparel','Beauty & Skincare','Health & Fitness','Food & Beverage','Technology','Travel & Lifestyle','Gaming','Finance','Home & Decor','FMCG','Other'].map(v => ({ value: v, label: v }))
const followerOptions = [{ value: '', label: 'Any' },{ value: '1000', label: '1,000+' },{ value: '10000', label: '10,000+' },{ value: '50000', label: '50,000+' },{ value: '100000', label: '1,00,000+' }]
const engagementOptions = [{ value: '', label: 'Any' },{ value: '1', label: '1%+' },{ value: '3', label: '3%+' },{ value: '5', label: '5%+' }]
const locationOptions = ['Any City','Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Kolkata','Pune','Other'].map(v => ({ value: v, label: v }))
const usageOptions = ['Organic Only','Organic + Paid','Full Rights'].map(v => ({ value: v, label: v }))
const autoCloseOptions = [{ value: '', label: 'Never' },{ value: '7', label: '7 days' },{ value: '14', label: '14 days' },{ value: '30', label: '30 days' }]

const Section = ({ num, title, children }) => (
  <Card className="flex flex-col">
    <p className="text-[11px] font-bold text-[#108A00] uppercase tracking-[1.5px] mb-[4px]">Section {num}</p>
    <h3 className="text-[16px] font-semibold text-[#1C1C1C]">{title}</h3>
    <div className="h-[1px] bg-[#F0F0EB] my-[10px] mb-[18px]" />
    {children}
  </Card>
)

export default function NewCampaign() {
  const { id } = useParams()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [contentTypes, setContentTypes] = useState([])
  const [platforms, setPlatforms] = useState([])
  const [visibility, setVisibility] = useState('Public')
  const [showPreview, setShowPreview] = useState(false)
  const { register, handleSubmit, reset, getValues, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    if (isEdit) {
      client.get(`/api/campaigns/${id}`)
        .then(res => { reset(res.data); setContentTypes(res.data.contentTypes || []); setPlatforms(res.data.platforms || []); setVisibility(res.data.visibility || 'Public') })
        .catch(() => toast.error('Failed to load campaign'))
    }
  }, [id])

  const save = async (status) => {
    const data = getValues()
    setLoading(true)
    try {
      const payload = { ...data, contentTypes, platforms, visibility, status }
      if (isEdit) { await client.put(`/api/campaigns/${id}`, payload) }
      else { await client.post('/api/campaigns', payload) }
      toast.success(status === 'draft' ? 'Saved as draft' : 'Campaign published!')
      navigate('/brand/campaigns')
    } catch { toast.error('Failed to save campaign') }
    finally { setLoading(false) }
  }

  return (
    <AppLayout role="brand">
      <h1 className="text-[24px] font-bold text-[#1C1C1C] mb-[20px]">{isEdit ? 'Edit Campaign' : 'Post New Campaign'}</h1>

      <form onSubmit={handleSubmit(() => save('active'))} className="flex flex-col gap-[14px]">
        <Section num="01" title="Campaign Basics">
          <div className="space-y-[16px]">
            <Input label="Campaign Title" name="title" required maxLength={100} placeholder="E.g. Summer Fashion Campaign 2026" error={errors.title?.message}
              register={(n) => register(n, { required: 'Title is required' })} />
            <Input label="Product/Brand Name" name="productName" required maxLength={80} error={errors.productName?.message}
              register={(n) => register(n, { required: 'Required' })} />
            <Select label="Industry" name="industry" required options={industryOptions} error={errors.industry?.message}
              register={(n) => register(n, { required: 'Required' })} />
            <Textarea label="Campaign Description" name="description" required maxLength={1000} showCount rows={7} placeholder="Describe your campaign goals, target audience, and expectations..."
              error={errors.description?.message} register={(n) => register(n, { required: 'Required' })} />
          </div>
        </Section>

        <Section num="02" title="Requirements">
          <div className="space-y-[16px]">
            <div>
              <label className="block text-[14px] font-medium text-[#1C1C1C] mb-[8px]">Content Type <span className="text-[#C0392B]">*</span></label>
              <PillToggle multiSelect values={contentTypes} onChange={setContentTypes}
                options={['UGC Video','Instagram Post','TikTok Spark','Blog Feature','Newsletter','Podcast'].map(v => ({ value: v, label: v }))} />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#1C1C1C] mb-[8px]">Platform Required <span className="text-[#C0392B]">*</span></label>
              <PillToggle multiSelect values={platforms} onChange={setPlatforms}
                options={['Instagram','YouTube','TikTok','Twitter/X'].map(v => ({ value: v, label: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-[16px]">
              <Select label="Min Follower Count" name="minFollowers" options={followerOptions} register={(n) => register(n)} />
              <Select label="Min Engagement Rate" name="minEngagement" options={engagementOptions} register={(n) => register(n)} />
            </div>
            <Select label="Creator Location" name="location" options={locationOptions} register={(n) => register(n)} />
          </div>
        </Section>

        <Section num="03" title="Deliverables">
          <div className="space-y-[16px]">
            <Input label="Number of Creators" name="creatorCount" type="number" required helper="Number of creators to accept"
              error={errors.creatorCount?.message} register={(n) => register(n, { required: 'Required', min: { value: 1, message: 'Min 1' } })} />
            <Textarea label="Deliverables" name="deliverables" rows={3} placeholder="e.g. 2 Reels, 3 Stories with brand mention in caption"
              register={(n) => register(n)} />
            <Select label="Usage Rights" name="usageRights" options={usageOptions} register={(n) => register(n)} />
          </div>
        </Section>

        <Section num="04" title="Compensation">
          <div className="space-y-[16px]">
            <div className="grid grid-cols-2 gap-[16px]">
              <Input label="Budget Min" name="budgetMin" prefix="₹" type="number" required error={errors.budgetMin?.message}
                register={(n) => register(n, { required: 'Required' })} />
              <Input label="Budget Max" name="budgetMax" prefix="₹" type="number" required error={errors.budgetMax?.message}
                register={(n) => register(n, { required: 'Required' })} />
            </div>
            <Textarea label="Additional Incentives" name="incentives" rows={2} placeholder="E.g. Free products, performance bonuses..."
              register={(n) => register(n)} />
            <div className="grid grid-cols-3 gap-[16px]">
              <Input label="Start Date" name="startDate" type="date" required error={errors.startDate?.message}
                register={(n) => register(n, { required: 'Required' })} />
              <Input label="Draft Deadline" name="draftDeadline" type="date" required error={errors.draftDeadline?.message}
                register={(n) => register(n, { required: 'Required' })} />
              <Input label="Go Live Date" name="goLiveDate" type="date" required error={errors.goLiveDate?.message}
                register={(n) => register(n, { required: 'Required' })} />
            </div>
          </div>
        </Section>

        <Section num="05" title="Settings">
          <div className="space-y-[16px]">
            <Input label="Max Creators" name="maxCreators" type="number" helper="Leave blank for unlimited" register={(n) => register(n)} />
            <Select label="Auto-close" name="autoClose" options={autoCloseOptions} register={(n) => register(n)} />
            <div>
              <label className="block text-[14px] font-medium text-[#1C1C1C] mb-[8px]">Visibility</label>
              <PillToggle value={visibility} onChange={setVisibility} options={[{ value: 'Public', label: 'Public' }, { value: 'Private', label: 'Private' }]} />
            </div>
          </div>
        </Section>

        {/* Sticky Action Bar */}
        <div className="sticky bottom-0 bg-white border-t border-[#E0E0DB] mx-[-28px] mb-[-28px] px-[24px] py-[14px] flex justify-between items-center">
          <span className="text-[12px] text-[#888888]">* Required fields</span>
          <div className="flex gap-[10px]">
            <Button variant="ghost-dark" type="button" onClick={() => save('draft')} loading={loading}>Save as Draft</Button>
            <Button variant="ghost-dark" type="button" onClick={() => setShowPreview(true)}>Preview</Button>
            <Button type="submit" loading={loading}>Publish Campaign →</Button>
          </div>
        </div>
      </form>

      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Campaign Preview" size="lg">
        <p className="text-[14px] text-[#888888]">Preview of how creators will see your campaign.</p>
        <div className="mt-[16px] space-y-[8px]">
          <p className="text-[18px] font-semibold text-[#1C1C1C]">{getValues('title') || 'Untitled'}</p>
          <p className="text-[14px] text-[#444444]">{getValues('description') || '--'}</p>
        </div>
      </Modal>
    </AppLayout>
  )
}
