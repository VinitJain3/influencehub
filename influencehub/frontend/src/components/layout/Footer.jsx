import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'

export default function Footer() {
  return (
    <footer className="bg-[#1A2E1A] text-white">
      <div className="px-[80px] pt-[64px] pb-[32px]">
        <div className="grid grid-cols-4 gap-[40px]">
          <div>
            <Logo variant="white" size="md" className="mb-[12px]" />
            <p className="text-[14px] text-white/60 leading-[1.6] mb-[16px]">
              India's leading influencer marketing platform connecting brands with verified creators.
            </p>
          </div>
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[1.5px] text-white/50 mb-[16px]">Product</h4>
            <div className="flex flex-col gap-[10px]">
              <Link to="/brand/discover" className="text-[14px] text-white/70 hover:text-white transition-colors">Find Creators</Link>
              <Link to="/influencer/campaigns" className="text-[14px] text-white/70 hover:text-white transition-colors">Browse Campaigns</Link>

            </div>
          </div>
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[1.5px] text-white/50 mb-[16px]">Company</h4>
            <div className="flex flex-col gap-[10px]">
              <Link to="/" className="text-[14px] text-white/70 hover:text-white transition-colors">About</Link>
              <Link to="/" className="text-[14px] text-white/70 hover:text-white transition-colors">Careers</Link>
              <Link to="/" className="text-[14px] text-white/70 hover:text-white transition-colors">Blog</Link>
            </div>
          </div>
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-[1.5px] text-white/50 mb-[16px]">Legal</h4>
            <div className="flex flex-col gap-[10px]">
              <Link to="/" className="text-[14px] text-white/70 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/" className="text-[14px] text-white/70 hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/" className="text-[14px] text-white/70 hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-[48px] pt-[24px] border-t border-white/10">
          <p className="text-[12px] text-white/40">© {new Date().getFullYear()} InfluenceHub Global Inc.</p>
          <p className="text-[11px] text-white/40 uppercase tracking-[1.5px]">Made in India · Global Ready</p>
        </div>
      </div>
    </footer>
  )
}
