'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Feather, Plus, Sticker, LogOut, Trash2 } from 'lucide-react'
import { getEvents, upsertEvent, getJournal, saveJournal, getStickers, addSticker, updateStickerPosition, removeSticker } from './actions'
import { signOut } from './login/actions'

// --- Helpers ---
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM']

const STICKER_PALETTE = [
  '☕', '🌿', '🌸', '📚', '✨', '🎵', '🍂', '🕯️',
  '🌙', '💌', '🧸', '🎨', '📝', '🍰', '🌻', '🦋',
]

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay() }

// --- Types ---
interface StickerPlacement {
  id: string
  sticker_name: string
  x: number
  y: number
}

// --- Sub-components ---

function CalendarHeader({ month, year, onPrev, onNext }: {
  month: number; year: number; onPrev: () => void; onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between mb-5 px-1">
      <button onClick={onPrev} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--paper-aged)] text-[var(--ink-muted)] transition-colors">
        <ChevronLeft size={18} />
      </button>
      <h2 className="font-hand text-2xl text-[var(--ink)] tracking-wide">
        {MONTHS[month]} <span className="text-[var(--honey)]">{year}</span>
      </h2>
      <button onClick={onNext} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--paper-aged)] text-[var(--ink-muted)] transition-colors">
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

function CalendarGrid({ year, month, selectedDay, onSelect }: {
  year: number; month: number; selectedDay: number; onSelect: (d: number) => void
}) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div>
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-[var(--ink-faint)] py-1 uppercase tracking-widest">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />
          const isToday = isCurrentMonth && day === today.getDate()
          const isSelected = day === selectedDay
          return (
            <motion.button key={day} whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.95 }} onClick={() => onSelect(day)}
              className={`aspect-square rounded-full text-sm font-medium flex items-center justify-center transition-colors
                ${isSelected ? 'bg-[var(--terracotta)] text-white shadow-sticker' : ''}
                ${isToday && !isSelected ? 'bg-[var(--blush)] text-white' : ''}
                ${!isSelected && !isToday ? 'text-[var(--ink)] hover:bg-[var(--paper-aged)]' : ''}`}
            >{day}</motion.button>
          )
        })}
      </div>
    </div>
  )
}

function EventSlot({ time, initialTitle, onSave }: {
  time: string; initialTitle: string; onSave: (title: string) => void
}) {
  const [value, setValue] = useState(initialTitle)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setValue(initialTitle) }, [initialTitle])

  function handleChange(v: string) {
    setValue(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSave(v), 800)
  }

  return (
    <div className="flex items-center gap-3 group">
      <span className="text-xs text-[var(--ink-faint)] w-16 flex-shrink-0">{time}</span>
      <input
        value={value}
        onChange={e => handleChange(e.target.value)}
        placeholder="Add event..."
        className="flex-1 h-7 rounded-lg border border-dashed border-[var(--border-soft)] bg-[var(--paper-warm)] group-hover:border-[var(--blush)] focus:border-[var(--blush)] transition-colors px-2 text-xs text-[var(--ink)] placeholder-[var(--ink-faint)] outline-none"
      />
    </div>
  )
}

function DailyCanvas({ day, month, year }: { day: number; month: number; year: number }) {
  const dateStr = formatDate(year, month, day)
  const dateLabel = new Date(year, month, day).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const canvasRef = useRef<HTMLDivElement>(null)

  const [events, setEvents] = useState<Record<string, string>>({})
  const [journal, setJournal] = useState('')
  const [mood, setMood] = useState<string | null>(null)
  const [stickers, setStickers] = useState<StickerPlacement[]>([])
  const [showPalette, setShowPalette] = useState(false)
  const journalTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load data when date changes
  useEffect(() => {
    const loadData = async () => {
      const [evts, jrnl, stks] = await Promise.all([
        getEvents(dateStr),
        getJournal(dateStr),
        getStickers(dateStr),
      ])
      const eventMap: Record<string, string> = {}
      evts.forEach((e: { time: string; title: string }) => { eventMap[e.time] = e.title })
      setEvents(eventMap)
      setJournal(jrnl?.content || '')
      setMood(jrnl?.mood || null)
      setStickers(stks as StickerPlacement[])
    }
    loadData()
  }, [dateStr])

  const handleEventSave = useCallback(async (time: string, title: string) => {
    await upsertEvent(dateStr, time, title)
  }, [dateStr])

  function handleJournalChange(content: string) {
    setJournal(content)
    if (journalTimer.current) clearTimeout(journalTimer.current)
    journalTimer.current = setTimeout(() => {
      saveJournal(dateStr, content, mood || undefined)
    }, 1000)
  }

  async function handleMood(m: string) {
    setMood(m)
    await saveJournal(dateStr, journal, m)
  }

  async function handleAddSticker(emoji: string) {
    const result = await addSticker(dateStr, emoji, 50, 50)
    if (result) setStickers(prev => [...prev, result as StickerPlacement])
    setShowPalette(false)
  }

  async function handleStickerDragEnd(id: string, x: number, y: number) {
    await updateStickerPosition(id, x, y)
    setStickers(prev => prev.map(s => s.id === id ? { ...s, x, y } : s))
  }

  async function handleRemoveSticker(id: string) {
    await removeSticker(id)
    setStickers(prev => prev.filter(s => s.id !== id))
  }

  return (
    <motion.div key={dateStr} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="h-full flex flex-col relative" ref={canvasRef}>

      {/* Stickers float on top */}
      {stickers.map(s => (
        <motion.div
          key={s.id}
          drag
          dragMomentum={false}
          onDragEnd={(_, info) => {
            const el = canvasRef.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            const x = ((info.point.x - rect.left) / rect.width) * 100
            const y = ((info.point.y - rect.top) / rect.height) * 100
            handleStickerDragEnd(s.id, x, y)
          }}
          initial={{ x: 0, y: 0 }}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
          }}
          className="cursor-grab active:cursor-grabbing group"
        >
          <span className="text-3xl select-none">{s.sticker_name}</span>
          <button onClick={() => handleRemoveSticker(s.id)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--terracotta)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 size={10} />
          </button>
        </motion.div>
      ))}

      {/* Date Header */}
      <div className="mb-4 pb-3 border-b border-[var(--border-soft)] relative z-10">
        <p className="font-hand text-4xl text-[var(--ink)] leading-tight">{dateLabel}</p>
        <p className="text-xs text-[var(--ink-muted)] mt-1 font-medium tracking-wider uppercase">Daily Page</p>
      </div>

      {/* Schedule */}
      <div className="mb-5 relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-[var(--sage)] flex items-center justify-center"><Plus size={12} className="text-white" /></div>
          <span className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Schedule</span>
        </div>
        <div className="space-y-1.5">
          {TIME_SLOTS.map(time => (
            <EventSlot key={time} time={time} initialTitle={events[time] || ''} onSave={title => handleEventSave(time, title)} />
          ))}
        </div>
      </div>

      {/* Journal */}
      <div className="flex-1 flex flex-col relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-[var(--lavender)] flex items-center justify-center"><Feather size={12} className="text-white" /></div>
          <span className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Journal</span>
        </div>

        {/* Mood Picker */}
        <div className="flex gap-1.5 mb-3">
          {['☀️ Bright', '🌧️ Mellow', '🌿 Calm', '🔥 Energized', '🌙 Quiet'].map(v => {
            const isActive = mood === v
            return (
              <button key={v} onClick={() => handleMood(v)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                  ${isActive ? 'bg-[var(--blush)] text-white border-[var(--blush)]' : 'bg-[var(--paper-aged)] text-[var(--ink-muted)] border-[var(--border-soft)] hover:bg-[var(--blush)] hover:text-white'}`}>
                {v}
              </button>
            )
          })}
        </div>

        <textarea
          value={journal}
          onChange={e => handleJournalChange(e.target.value)}
          placeholder="How are you feeling today? What's on your mind..."
          className="flex-1 w-full resize-none bg-[var(--paper-warm)] rounded-xl border border-[var(--border-soft)] p-4 font-hand text-lg text-[var(--ink)] placeholder-[var(--ink-faint)] outline-none focus:border-[var(--blush)] transition-colors leading-relaxed min-h-[200px]"
        />
      </div>

      {/* Floating Sticker Palette */}
      {showPalette && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-4 right-4 bg-[var(--surface-raised)] rounded-2xl shadow-sticker border border-[var(--border-soft)] p-4 z-30 w-52">
          <p className="font-hand text-sm text-[var(--ink-muted)] mb-2">Pick a sticker</p>
          <div className="grid grid-cols-4 gap-2">
            {STICKER_PALETTE.map(emoji => (
              <button key={emoji} onClick={() => handleAddSticker(emoji)}
                className="text-2xl hover:scale-125 transition-transform w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--paper-warm)]">
                {emoji}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sticker Toggle FAB */}
      <button onClick={() => setShowPalette(!showPalette)}
        className="absolute bottom-4 right-4 z-20 w-12 h-12 rounded-full bg-[var(--honey)] text-white flex items-center justify-center shadow-sticker hover:bg-[var(--terracotta)] transition-colors"
        style={showPalette ? { right: '15.5rem' } : {}}>
        <Sticker size={20} />
      </button>
    </motion.div>
  )
}

// --- Main Page ---
export default function Home() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(today.getDate())

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  return (
    <div className="min-h-screen bg-[var(--paper)] paper-texture">
      {/* Top Nav */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-[var(--border-soft)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--terracotta)] flex items-center justify-center shadow-paper">
            <span className="text-white text-lg">☁️</span>
          </div>
          <h1 className="font-hand text-2xl text-[var(--ink)] tracking-wide">Cozy Calendar</h1>
        </div>
        <form action={signOut}>
          <button type="submit" className="flex items-center gap-2 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] bg-[var(--paper-warm)] hover:bg-[var(--paper-aged)] transition-colors px-4 py-2 rounded-full border border-[var(--border-soft)]">
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </form>
      </header>

      {/* Main Split-View */}
      <main className="flex h-[calc(100vh-73px)]">
        {/* Left Panel */}
        <aside className="w-80 flex-shrink-0 border-r border-[var(--border-soft)] p-6 overflow-y-auto">
          <div className="bg-[var(--surface-raised)] rounded-2xl p-5 shadow-paper">
            <CalendarHeader month={month} year={year} onPrev={prevMonth} onNext={nextMonth} />
            <CalendarGrid year={year} month={month} selectedDay={selectedDay} onSelect={setSelectedDay} />
          </div>
        </aside>

        {/* Right Panel */}
        <section className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto h-full bg-[var(--surface-raised)] rounded-2xl p-8 shadow-paper relative overflow-hidden">
            <DailyCanvas day={selectedDay} month={month} year={year} />
          </div>
        </section>
      </main>
    </div>
  )
}
