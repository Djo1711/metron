import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts'

export default function SparklineChart({ data, color }) {
  if (!data || data.length === 0) return null

  // Normaliser les données pour que chaque courbe soit bien visible
  const prices = data.map(d => d.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const range = maxPrice - minPrice
  
  const normalizedData = data.map(d => ({
    value: range > 0 ? ((d.price - minPrice) / range) * 100 : 50
  }))

  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={normalizedData}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={[0, 100]} />
        <Area
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2.5}
          fill={`url(#gradient-${color})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
