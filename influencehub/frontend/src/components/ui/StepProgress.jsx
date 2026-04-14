import { Check } from 'lucide-react'

export default function StepProgress({ steps = [], currentStep = 0 }) {
  return (
    <div className="flex w-full items-start mb-[40px]">
      {steps.map((step, index) => {
        const isDone = index < currentStep
        const isActive = index === currentStep
        const isUpcoming = index > currentStep

        return (
          <div key={index} className="flex-1 flex flex-col items-center relative">
            {index < steps.length - 1 && (
              <div
                className="absolute top-[13px] h-[2px]"
                style={{
                  left: 'calc(50% + 14px)',
                  right: 'calc(-50% + 14px)',
                  backgroundColor: isDone ? '#108A00' : '#E0E0DB',
                }}
              />
            )}
            <div
              className={`
                w-[28px] h-[28px] rounded-full flex items-center justify-center z-[1]
                text-[14px] font-semibold
                ${isDone ? 'bg-[#108A00]' : ''}
                ${isActive ? 'bg-[#108A00] text-white' : ''}
                ${isUpcoming ? 'bg-white border-[1.5px] border-[#E0E0DB] text-[#888888] font-medium' : ''}
              `}
            >
              {isDone ? <Check size={14} className="text-white" /> : index + 1}
            </div>
            <span
              className={`
                text-[12px] mt-[8px] text-center
                ${isActive ? 'text-[#108A00] font-semibold' : ''}
                ${isDone ? 'text-[#108A00]' : ''}
                ${isUpcoming ? 'text-[#888888]' : ''}
              `}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
