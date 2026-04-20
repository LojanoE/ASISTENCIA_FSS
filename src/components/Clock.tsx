import { useClock } from '@/hooks/useClock'

export function Clock() {
  const { time, date } = useClock()

  return (
    <div className="text-center">
      <div className="text-6xl font-bold text-gray-800 tabular-nums tracking-tight">
        {time}
      </div>
      <div className="text-lg text-gray-500 mt-2 capitalize">
        {date}
      </div>
    </div>
  )
}