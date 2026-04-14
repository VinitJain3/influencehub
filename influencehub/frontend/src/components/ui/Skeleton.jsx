export function Skeleton({ width, height = 14, className = '' }) {
  return (
    <div
      className={`rounded-[6px] ${className}`}
      style={{
        width: width || '100%',
        height,
        background: 'linear-gradient(90deg, #F0F0EB 25%, #E4E3DD 50%, #F0F0EB 75%)',
        backgroundSize: '400px 100%',
        animation: 'shimmer 1.2s infinite',
      }}
    />
  )
}

export default function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`bg-white border border-[#E0E0DB] rounded-[12px] p-[20px] ${className}`}>
      <Skeleton height={16} width="60%" className="mb-[12px]" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? '40%' : '100%'}
          className="mb-[8px]"
        />
      ))}
    </div>
  )
}
