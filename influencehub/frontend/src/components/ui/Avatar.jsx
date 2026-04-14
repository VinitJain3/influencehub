const platformColors = {
  Instagram: '#E1306C',
  YouTube: '#FF0000',
  TikTok: '#010101',
  LinkedIn: '#0077B5',
  Twitter: '#1DA1F2',
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0][0]?.toUpperCase() || '?'
}

function getFontSize(size) {
  if (size <= 32) return 11
  if (size <= 48) return 14
  return 18
}

export default function Avatar({
  src,
  name = '',
  size = 40,
  badge,
  ring = false,
  className = '',
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          className="rounded-full object-cover"
          style={{
            width: size,
            height: size,
            border: ring ? '2px solid white' : 'none',
          }}
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center text-white font-semibold"
          style={{
            width: size,
            height: size,
            backgroundColor: '#108A00',
            fontSize: getFontSize(size),
            border: ring ? '2px solid white' : 'none',
          }}
        >
          {getInitials(name)}
        </div>
      )}
      {badge && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-[1.5px] border-white"
          style={{
            width: 14,
            height: 14,
            backgroundColor: platformColors[badge] || '#888888',
          }}
        />
      )}
    </div>
  )
}
