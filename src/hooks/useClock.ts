import { useState, useEffect } from 'react'
import { format } from 'date-fns'

export function useClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return {
    time: format(now, 'h:mm:ss a'),
    time24: format(now, 'HH:mm:ss'),
    date: format(now, "EEEE d 'de' MMMM 'de' yyyy"),
    dateShort: format(now, 'yyyy-MM-dd'),
    now,
  }
}