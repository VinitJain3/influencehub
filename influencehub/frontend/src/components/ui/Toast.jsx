import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'

const typeConfig = {
  success: { borderColor: '#108A00', Icon: CheckCircle, color: '#108A00' },
  error:   { borderColor: '#C0392B', Icon: XCircle, color: '#C0392B' },
  warning: { borderColor: '#9A6000', Icon: AlertTriangle, color: '#9A6000' },
  info:    { borderColor: '#1A5FAD', Icon: Info, color: '#1A5FAD' },
}

function ToastItem({ toast }) {
  const removeToast = useToastStore((s) => s.removeToast)
  const config = typeConfig[toast.type] || typeConfig.info
  const { Icon } = config

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-[#E0E0DB] rounded-[10px] p-[14px_16px] shadow-[0_4px_16px_rgba(0,0,0,0.10)] flex items-start gap-[10px]"
      style={{ borderLeft: `4px solid ${config.borderColor}` }}
    >
      <Icon size={18} style={{ color: config.color }} className="flex-shrink-0 mt-[1px]" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#1C1C1C]">{toast.title}</p>
        {toast.description && (
          <p className="text-[12px] text-[#888888] mt-[2px]">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="w-[20px] h-[20px] flex items-center justify-center rounded hover:bg-[#F0F0EB] flex-shrink-0 cursor-pointer"
      >
        <X size={12} className="text-[#888888]" />
      </button>
    </motion.div>
  )
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div className="fixed bottom-[24px] right-[24px] z-[500] flex flex-col gap-[10px] max-w-[360px]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}
