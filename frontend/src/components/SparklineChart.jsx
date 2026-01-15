import { LineChart, Line, ResponsiveContainer } from 'recharts'

export default function SparklineChart({ data, color = "#A855F7" }) {
  if (!data || data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke={color} 
          strokeWidth={2} 
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}