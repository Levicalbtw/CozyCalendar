'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getEventsForYear } from '../actions'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS_SHORT = ['S','M','T','W','T','F','S']

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay() }

interface YearlyViewProps {
  year: number
  onDayClick: (day: number, month: number, year: number) => void
}

export default function YearlyView({ year, onDayClick }: YearlyViewProps) {
  const [currentYear, setCurrentYear] = useState(year)
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    getEventsForYear(currentYear).then(data => {
      const counts: Record<string, number> = {}
      data.forEach((e: { date: string }) => {
        counts[e.date] = (counts[e.date] || 0) + 1
      })
      setEventCounts(counts)
    })
  }, [currentYear])

  const today = new Date()

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <button onClick={() => setCurrentYear(y => y - 1)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--paper-aged)] text-[var(--ink-muted)] transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-hand text-3xl md:text-4xl text-[var(--ink)] tracking-wide">
          <span className="text-[var(--honey)]">{currentYear}</span>
        </h2>
        <button onClick={() => setCurrentYear(y => y + 1)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--paper-aged)] text-[var(--ink-muted)] transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 12 mini-months */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 flex-1 overflow-y-auto yearly-grid">
        {Array.from({ length: 12 }, (_, m) => {
          const daysInMonth = getDaysInMonth(currentYear, m)
          const firstDay = getFirstDayOfMonth(currentYear, m)
          const cells: (number | null)[] = [
            ...Array(firstDay).fill(null),
            ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
          ]
          const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === m

          return (
            <motion.div
              key={m}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: m * 0.03, duration: 0.3 }}
              className="yearly-month"
            >
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 text-center
                ${isCurrentMonth ? 'text-[var(--terracotta)]' : 'text-[var(--ink-muted)]'}`}>
                {MONTHS[m]}
              </h3>
              <div className="grid grid-cols-7 gap-px">
                {DAYS_SHORT.map((d, i) => (
                  <div key={`h-${i}`} className="text-center text-[8px] text-[var(--ink-faint)] font-medium py-0.5">{d}</div>
                ))}
                {cells.map((day, idx) => {
                  if (!day) return <div key={`e-${idx}`} className="aspect-square" />

                  const dateStr = `${currentYear}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const count = eventCounts[dateStr] || 0
                  const isToday = isCurrentMonth && day === today.getDate()

                  return (
                    <motion.button
                      key={`d-${day}`}
                      whileHover={{ scale: 1.3 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDayClick(day, m, currentYear)}
                      className={`yearly-day aspect-square rounded-full flex items-center justify-center text-[9px] transition-all cursor-pointer
                        ${isToday ? 'bg-[var(--terracotta)] text-white font-bold' : ''}
                        ${!isToday && count > 0 ? 'yearly-day-active' : ''}
                        ${!isToday && count === 0 ? 'text-[var(--ink-muted)] hover:bg-[var(--paper-aged)]' : ''}`}
                      title={count > 0 ? `${count} event${count > 1 ? 's' : ''}` : undefined}
                    >
                      {day}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
