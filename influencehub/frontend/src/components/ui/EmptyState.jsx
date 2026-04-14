import Button from './Button'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-[80px] px-[20px] text-center">
      {Icon && <Icon size={48} className="text-[#C4C4BF] mb-[14px]" />}
      {title && <h3 className="text-[16px] font-semibold text-[#888888] mb-[6px]">{title}</h3>}
      {description && (
        <p className="text-[13px] text-[#888888] max-w-[320px] leading-[1.6] mb-[20px]">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          size="sm"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
