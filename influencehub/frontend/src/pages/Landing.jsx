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
      <section className="bg-white pt-[64px]">
        <div className="grid grid-cols-[55%_45%] gap-[60px] items-center px-[80px] py-[100px_80px]">
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

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative h-[380px]"
          >
            <div className="absolute top-0 left-0 w-[90%] bg-white border border-[#E0E0DB] rounded-[16px] p-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.10)]">
              <div className="flex items-center gap-[10px]">
                <Avatar name="Creator" size={40} />
                <div>
                  <p className="text-[14px] font-semibold text-[#1C1C1C]">--</p>
                  <p className="text-[12px] text-[#888888]">--</p>
                </div>
                <span className="ml-auto text-[12px] text-[#108A00]">● Top Rated Plus</span>
              </div>
              <div className="grid grid-cols-2 border border-[#E0E0DB] rounded-[8px] overflow-hidden mt-[16px]">
                <div className="p-[12px_16px] border-r border-[#E0E0DB]">
                  <p className="text-[10px] font-semibold text-[#888888] uppercase">Reach</p>
                  <p className="text-[22px] font-bold text-[#1C1C1C]">--</p>
                </div>
                <div className="p-[12px_16px]">
                  <p className="text-[10px] font-semibold text-[#888888] uppercase">Engagement</p>
                  <p className="text-[22px] font-bold text-[#1C1C1C]">--</p>
                </div>
              </div>
              <div className="mt-[16px] w-full h-[140px] bg-[#F0F0EB] rounded-[10px]" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#F5F5F0] border-t border-b border-[#E0E0DB] py-[48px] px-[80px]">
        <div className="flex">
          {[
            { value: '--', label: 'Active Brands' },
            { value: '--', label: 'Vetted Influencers' },
            { value: '--', label: 'Monthly Reach' },
          ].map((stat, i) => (
            <div key={i} className="flex-1 text-center relative">
              {i > 0 && <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-[#E0E0DB]" />}
              <p className="text-[44px] font-extrabold text-[#1C1C1C]">{stat.value}</p>
              <p className="text-[12px] font-semibold text-[#888888] uppercase tracking-[1.5px] mt-[6px]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-[80px] px-[80px]">
        <div className="text-center">
          <h2 className="text-[28px] font-bold text-[#1C1C1C]">How It Works</h2>
          <div className="w-[40px] h-[3px] bg-[#108A00] mx-auto mt-[12px] mb-[40px]" />
        </div>
        <div className="grid grid-cols-3 gap-[20px] max-w-[1000px] mx-auto">
          {[
            { icon: UserPlus, title: 'Create Profile', body: 'Set up your brand or creator profile in minutes. Showcase your work, audience, and collaboration preferences.' },
            { icon: Search, title: 'Discover', body: 'Find the perfect match. Brands discover creators by niche, platform, and engagement. Creators browse campaigns that fit.' },
            { icon: Handshake, title: 'Collaborate', body: 'Send requests, negotiate terms, and manage campaigns — all within a secure, professional workspace.' },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white border border-[#E0E0DB] rounded-[12px] p-[28px] text-left"
            >
              <div className="w-[44px] h-[44px] bg-[#E8F5E6] rounded-[10px] flex items-center justify-center mb-[20px]">
                <card.icon size={22} className="text-[#108A00]" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#1C1C1C] mb-[10px]">{card.title}</h3>
              <p className="text-[14px] text-[#444444] leading-[1.6]">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </section>


      <Footer />
    </div>
  )
}
