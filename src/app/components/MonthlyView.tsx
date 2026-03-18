'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react'
import { getEventsForMonth } from '../actions'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay() }

function formatTimeDisplay(time: string | null | undefined): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

interface MonthEvent {
  id: string
  date: string
  title: string
  start_time?: string | null
  location?: string
}

interface MonthlyViewProps {
  year: number
  month: number
  onDayClick: (day: number, month: number, year: number) => void
}

export default function MonthlyView({ year, month, onDayClick }: MonthlyViewProps) {
  const [events, setEvents] = useState<MonthEvent[]>([])
  const [currentMonth, setCurrentMonth] = useState(month)
  const [currentYear, setCurrentYear] = useState(year)

  useEffect(() => {
    getEventsForMonth(currentYear, currentMonth).then(data => setEvents(data as MonthEvent[]))
  }, [currentYear, currentMonth])

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]

  // Pad to complete last row
  const remainder = cells.length % 7
  if (remainder > 0) {
    cells.push(...Array(7 - remainder).fill(null))
  }

  function eventsForDay(day: number): MonthEvent[] {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <button onClick={prevMonth} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--paper-aged)] text-[var(--ink-muted)] transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-hand text-3xl md:text-4xl text-[var(--ink)] tracking-wide">
          {MONTHS[currentMonth]} <span className="text-[var(--honey)]">{currentYear}</span>
        </h2>
        <button onClick={nextMonth} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--paper-aged)] text-[var(--ink-muted)] transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-[var(--ink-faint)] py-2 uppercase tracking-widest">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 flex-1 gap-px bg-[var(--border-soft)] rounded-xl overflow-hidden">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} className="bg-[var(--paper-warm)] opacity-40 min-h-[80px] md:min-h-[100px]" />

          const isToday = isCurrentMonth && day === today.getDate()
          const dayEvents = eventsForDay(day)

          return (
            <motion.button
              key={`d-${day}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDayClick(day, currentMonth, currentYear)}
              className="monthly-cell bg-[var(--surface-raised)] text-left p-2 min-h-[80px] md:min-h-[100px] flex flex-col transition-colors hover:bg-[var(--paper-warm)] cursor-pointer"
            >
              <span className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full
                ${isToday ? 'bg-[var(--terracotta)] text-white' : 'text-[var(--ink-muted)]'}`}>
                {day}
              </span>
              <div className="flex-1 space-y-0.5 overflow-hidden">
                {dayEvents.slice(0, 3).map(event => (
                  <div key={event.id} className="monthly-event-pill">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--terracotta)] flex-shrink-0" />
                    <span className="truncate text-[10px] text-[var(--ink)]">{event.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[9px] text-[var(--ink-faint)] pl-3">+{dayEvents.length - 3} more</p>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
