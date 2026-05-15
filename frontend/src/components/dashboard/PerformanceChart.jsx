import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { name: 'Mon', value: 30 },
  { name: 'Tue', value: 45 },
  { name: 'Wed', value: 60 },
  { name: 'Thu', value: 50 },
  { name: 'Fri', value: 70 },
]

const PerformanceChart = () => {
  return (
    <div className='bg-white p-6 rounded-3xl h-[350px]'>
      <h2 className='text-lg font-semibold mb-4'>
        Performance Overview
      </h2>

      <ResponsiveContainer width='100%' height='85%'>
        <LineChart data={data}>
          <XAxis dataKey='name' />
          <Tooltip />
          <Line
            type='monotone'
            dataKey='value'
            stroke='#2563EB'
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PerformanceChart