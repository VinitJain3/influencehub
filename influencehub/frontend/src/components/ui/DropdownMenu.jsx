import { useState, useEffect, useRef } from 'react'

export default function DropdownMenu({
  trigger,
  items = [],
  align = 'right',
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="relative inline-flex" ref={ref}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          className={`
            absolute top-[calc(100%+4px)] bg-white border border-[#E0E0DB] rounded-[8px]
            shadow-[0_8px_24px_rgba(0,0,0,0.10)] min-w-[160px] z-[100] py-[4px]
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="h-[1px] bg-[#F0F0EB] my-[3px]" />
            ) : (
              <button
                key={i}
                onClick={() => {
                  item.onClick?.()
                  setOpen(false)
                }}
                className={`
                  w-full h-[36px] px-[16px] flex items-center gap-[8px] text-[13px] font-medium cursor-pointer
                  ${item.danger
                    ? 'text-[#C0392B] hover:bg-[#FDEDEC]'
                    : 'text-[#1C1C1C] hover:bg-[#F5F5F0]'
                  }
                `}
              >
                {item.icon && <item.icon size={16} />}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
