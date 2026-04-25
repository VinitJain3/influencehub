import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, Search, Handshake, Check } from 'lucide-react'
import { useState } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'

export default function Landing() {

  return (
    <div className="min-h-screen">
      <Navbar variant="marketing" />

      {/* Hero Section */}
      <section className="bg-white pt-[64px] pb-[100px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] items-center px-[80px] pt-[80px] pb-[40px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-bold text-[#108A00] uppercase tracking-[2px] mb-[12px]">
              INDIA'S INFLUENCER MARKETING PLATFORM
            </p>
            <h1 className="text-[52px] font-extrabold text-[#1C1C1C] leading-[1.1] mb-[16px]">
              Where Brands Meet <em className="text-[#108A00] italic">Creators</em>
            </h1>
            <p className="text-[16px] text-[#666666] leading-[1.7] max-w-[420px]">
              Connect with verified creators across India. Launch campaigns, manage collaborations, and grow your brand — all in one platform.
            </p>
            <div className="flex gap-[12px] mt-[36px]">
              <Link to="/register?role=brand">
                <Button size="lg">I'm a Brand →</Button>
              </Link>
              <Link to="/register?role=influencer">
                <Button variant="ghost-dark" size="lg">I'm an Influencer</Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: How it Works */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="pl-[0px] lg:pl-[60px]"
          >
            <div className="mb-[24px]">
              <h2 className="text-[28px] font-bold text-[#1C1C1C]">How It Works</h2>
              <div className="w-[40px] h-[3px] bg-[#108A00] mt-[8px]" />
            </div>
            
            <div className="flex flex-col gap-[16px]">
              {[
                { icon: UserPlus, title: 'Create Profile', body: 'Set up your brand or creator profile in minutes. Showcase your work, audience, and collaboration preferences.' },
                { icon: Search, title: 'Discover', body: 'Find the perfect match. Brands discover creators by niche, platform, and engagement. Creators browse campaigns that fit.' },
                { icon: Handshake, title: 'Collaborate', body: 'Send requests, negotiate terms, and manage campaigns — all within a secure, professional workspace.' },
              ].map((card, i) => (
                <div key={i} className="flex gap-[20px] items-start p-[20px] bg-white border border-[#E0E0DB] rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow">
                  <div className="w-[52px] h-[52px] flex-shrink-0 bg-[#E8F5E6] rounded-[12px] flex items-center justify-center">
                    <card.icon size={24} className="text-[#108A00]" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#1C1C1C] mb-[4px]">{card.title}</h3>
                    <p className="text-[14px] text-[#666666] leading-[1.5]">{card.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>


      <Footer />
    </div>
  )
}
