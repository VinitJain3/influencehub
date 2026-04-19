import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { User, Bell, Lock, CreditCard, Eye, Shield, Trash2 } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Toggle from '../../components/ui/Toggle'
import Modal from '../../components/ui/Modal'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../store/toastStore'
import client from '../../api/client'

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'privacy', label: 'Privacy', icon: Eye },
  { id: 'verification', label: 'Verification', icon: Shield },
  { id: 'danger', label: 'Account', icon: Trash2 },
]

export default function Settings() {
  const { user, role, logout, updateUser } = useAuthStore((s) => s)
  const [activeSection, setActiveSection] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [notifPrefs, setNotifPrefs] = useState({
    emailUpdates: true, campaignMatches: true, requestUpdates: true, messages: true, newsletter: false
  })
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: user || {} })
  const { toast } = useToast()

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash && sections.some(s => s.id === hash)) setActiveSection(hash)
  }, [])

  const saveProfile = async (data) => {
    setSaving(true)
    try {
      const res = await client.put('/api/settings/profile', data)
      updateUser(res.data)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const savePassword = async (data) => {
    setSaving(true)
    try {
      await client.put('/api/settings/password', data)
      toast.success('Password changed!')
      reset({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
    } catch { toast.error('Failed to change password') }
    finally { setSaving(false) }
  }

  const deleteAccount = async () => {
    if (deleteText !== 'DELETE') return
    try {
      await client.delete('/api/settings/account')
      logout()
      window.location.href = '/'
    } catch { toast.error('Failed to delete account') }
  }

  return (
    <AppLayout role={role}>
      <h1 className="text-[24px] font-bold text-[#1C1C1C] mb-[20px]">Settings</h1>

      <div className="flex gap-[20px] items-start">
        {/* Nav */}
        <div className="w-[220px] flex-shrink-0 sticky top-[84px]">
          <Card className="!p-[8px]">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-[8px] px-[12px] py-[8px] rounded-[6px] text-[13px] font-medium cursor-pointer transition-colors ${
                  activeSection === s.id ? 'bg-[#E8F5E6] text-[#108A00]' : 'text-[#444444] hover:bg-[#F5F5F0]'
                } ${s.id === 'danger' ? '!text-[#C0392B]' : ''}`}>
                <s.icon size={16} /> {s.label}
              </button>
            ))}
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeSection === 'profile' && (
            <Card>
              <h2 className="text-[18px] font-semibold text-[#1C1C1C] mb-[20px]">Profile Information</h2>
              <form onSubmit={handleSubmit(saveProfile)} className="space-y-[16px] max-w-[520px]">
                <Input label="Full Name" name="name" required error={errors.name?.message} register={(n) => register(n, { required: 'Required' })} />
                <Input label="Email" name="email" type="email" required error={errors.email?.message} register={(n) => register(n, { required: 'Required' })} />
                <Input label="Phone" name="phone" type="tel" register={(n) => register(n)} />
                <Input label="Location" name="location" register={(n) => register(n)} />
                <Textarea label="Bio" name="bio" rows={3} maxLength={250} showCount register={(n) => register(n)} />
                <Button type="submit" loading={saving}>Save Changes</Button>
              </form>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card>
              <h2 className="text-[18px] font-semibold text-[#1C1C1C] mb-[8px]">Notification Preferences</h2>
              <p className="text-[14px] text-[#888888] mb-[20px]">Choose how you want to be notified</p>
              <div className="space-y-[16px] max-w-[520px]">
                <Toggle label="Email Updates" description="Receive email notifications for important account activity" checked={notifPrefs.emailUpdates} onChange={v => setNotifPrefs({ ...notifPrefs, emailUpdates: v })} />
                <div className="h-[1px] bg-[#F0F0EB]" />
                <Toggle label="Campaign Matches" description="Get notified when new campaigns match your profile" checked={notifPrefs.campaignMatches} onChange={v => setNotifPrefs({ ...notifPrefs, campaignMatches: v })} />
                <div className="h-[1px] bg-[#F0F0EB]" />
                <Toggle label="Request Updates" description="Notifications when requests are accepted or rejected" checked={notifPrefs.requestUpdates} onChange={v => setNotifPrefs({ ...notifPrefs, requestUpdates: v })} />
                <div className="h-[1px] bg-[#F0F0EB]" />
                <Toggle label="Messages" description="Get notified for new messages" checked={notifPrefs.messages} onChange={v => setNotifPrefs({ ...notifPrefs, messages: v })} />
                <div className="h-[1px] bg-[#F0F0EB]" />
                <Toggle label="Newsletter" description="Weekly tips and platform updates" checked={notifPrefs.newsletter} onChange={v => setNotifPrefs({ ...notifPrefs, newsletter: v })} />
                <Button onClick={() => { client.put('/api/settings/notifications', notifPrefs).then(() => toast.success('Saved!')).catch(() => toast.error('Failed')) }}>Save Preferences</Button>
              </div>
            </Card>
          )}

          {activeSection === 'security' && (
            <Card>
              <h2 className="text-[18px] font-semibold text-[#1C1C1C] mb-[20px]">Change Password</h2>
              <form onSubmit={handleSubmit(savePassword)} className="space-y-[16px] max-w-[520px]">
                <Input label="Current Password" name="currentPassword" type="password" required register={(n) => register(n, { required: 'Required' })} />
                <Input label="New Password" name="newPassword" type="password" required helper="Min. 8 characters" register={(n) => register(n, { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} />
                <Input label="Confirm New Password" name="confirmNewPassword" type="password" required register={(n) => register(n, { required: 'Required' })} />
                <Button type="submit" loading={saving}>Update Password</Button>
              </form>
            </Card>
          )}



          {activeSection === 'privacy' && (
            <Card>
              <h2 className="text-[18px] font-semibold text-[#1C1C1C] mb-[20px]">Privacy Settings</h2>
              <div className="space-y-[16px] max-w-[520px]">
                <Toggle label="Profile Visibility" description="Make your profile visible in search results" checked={true} onChange={() => {}} />
                <div className="h-[1px] bg-[#F0F0EB]" />
                <Toggle label="Show Earnings" description="Display your earnings on your public profile" checked={false} onChange={() => {}} />
                <div className="h-[1px] bg-[#F0F0EB]" />
                <Toggle label="Show Contact Info" description="Allow brands to see your contact details" checked={true} onChange={() => {}} />
              </div>
            </Card>
          )}

          {activeSection === 'verification' && (
            <Card>
              <h2 className="text-[18px] font-semibold text-[#1C1C1C] mb-[8px]">Account Verification</h2>
              <p className="text-[14px] text-[#888888] mb-[20px]">A verified badge boosts your profile visibility 3×</p>
              <div className="bg-[#E8F5E6] border border-[#C5E0C3] rounded-[10px] p-[20px]">
                <p className="text-[14px] font-semibold text-[#1C1C1C] mb-[4px]">Get Verified ✓</p>
                <p className="text-[13px] text-[#444444] mb-[14px]">Upload your government ID and social media verification to get a verified badge.</p>
                <Button size="sm">Start Verification</Button>
              </div>
            </Card>
          )}

          {activeSection === 'danger' && (
            <Card>
              <h2 className="text-[18px] font-semibold text-[#C0392B] mb-[8px]">Danger Zone</h2>
              <p className="text-[14px] text-[#888888] mb-[20px]">Irreversible account actions</p>
              <div className="border border-[#C0392B] rounded-[10px] p-[20px]">
                <p className="text-[14px] font-semibold text-[#1C1C1C] mb-[6px]">Delete Account</p>
                <p className="text-[13px] text-[#888888] mb-[12px]">Once you delete your account, there is no going back. This will permanently delete your profile, campaigns, and all associated data.</p>
                <Button variant="danger" size="sm" onClick={() => setDeleteModal(true)}>Delete My Account</Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Modal isOpen={deleteModal} onClose={() => { setDeleteModal(false); setDeleteText('') }} title="Delete Account" size="sm"
        footer={<><Button variant="ghost-dark" onClick={() => setDeleteModal(false)}>Cancel</Button><Button variant="danger" disabled={deleteText !== 'DELETE'} onClick={deleteAccount}>Delete Account</Button></>}>
        <p className="text-[14px] text-[#444444] mb-[16px]">This action is <strong>irreversible</strong>. Type <strong>DELETE</strong> to confirm.</p>
        <Input name="confirmDelete" value={deleteText} onChange={e => setDeleteText(e.target.value)} placeholder="Type DELETE" />
      </Modal>
    </AppLayout>
  )
}
