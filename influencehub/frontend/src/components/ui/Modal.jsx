import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const sizeWidths = { sm: 420, md: 580, lg: 720 }

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) {
  const modalRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const handleEsc = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handleEsc)

    const focusable = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable?.length) focusable[0].focus()

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEsc)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="bg-white rounded-[14px] overflow-hidden flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.14)]"
            style={{ width: sizeWidths[size], maxHeight: '88vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-[24px] py-[20px] border-b border-[#F0F0EB]">
              <h3 className="text-[18px] font-semibold text-[#1C1C1C]">{title}</h3>
              <button
                onClick={onClose}
                className="w-[28px] h-[28px] flex items-center justify-center rounded-[5px] hover:bg-[#F0F0EB] cursor-pointer transition-colors"
              >
                <X size={16} className="text-[#888888]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-[24px] py-[20px]">
              {children}
            </div>
            {footer && (
              <div className="flex justify-end gap-[10px] px-[24px] py-[14px] border-t border-[#F0F0EB]">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
