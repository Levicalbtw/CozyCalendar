'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, LogOut, Palette, Menu, X, Calendar, LayoutGrid, Grid3X3 } from 'lucide-react'
import { getTheme, saveTheme } from './actions'
import { signOut } from './login/actions'
import ViewTabs, { ViewType } from './components/ViewTabs'
import DailyView from './components/DailyView'
import MonthlyView from './components/MonthlyView'
import YearlyView from './components/YearlyView'

// --- Constants ---
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const THEMES: Record<string, { label: string; emoji: string; paper: string; paperWarm: string; paperAged: string; ink: string; inkMuted: string; accent: string }> = {
  cream:     { label: 'Cream',     emoji: '☁️', paper: '#FAF9F6', paperWarm: '#F5F0E8', paperAged: '#EDE5D8', ink: '#2C2A29', inkMuted: '#7A7068', accent: '#C4714F' },
  parchment: { label: 'Parchment', emoji: '📜', paper: '#F0E6D3', paperWarm: '#E8DABE', paperAged: '#DED0B8', ink: '#3A3228', inkMuted: '#786A58', accent: '#A67B4B' },
  rose:      { label: 'Rose',      emoji: '🌸', paper: '#FDF2F4', paperWarm: '#F8E4E8', paperAged: '#F0D4DA', ink: '#3A2028', inkMuted: '#8A6070', accent: '#C4607A' },
  sage:      { label: 'Sage',      emoji: '🌿', paper: '#F2F5F0', paperWarm: '#E4EAE0', paperAged: '#D4DCD0', ink: '#202A20', inkMuted: '#607060', accent: '#5A8A5A' },
  midnight:  { label: 'Midnight',  emoji: '🌙', paper: '#1A1A2E', paperWarm: '#16213E', paperAged: '#0F3460', ink: '#E0D8D0', inkMuted: '#A098A0', accent: '#E8B4A0' },
}

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay() }

// --- View transition variants ---
const viewTransitions = {
  daily: {
    initial: { opacity: 0, rotateY: -60, scale: 0.95 },
    animate: { opacity: 1, rotateY: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
    exit: { opacity: 0, rotateY: 30, scale: 0.95, transition: { duration: 0.3, ease: 'easeIn' as const } },
  },
  monthly: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.25 } },
  },
  yearly: {
    initial: { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.25 } },
  },
}

// --- Sub-components ---

function CalendarHeader({ month, year, onPrev, onNext }: {
  month: number; year: number; onPrev: () => void; onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between mb-5 px-1">
      <button onClick={onPrev} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--paper-aged)] text-[var(--ink-muted)] transition-colors"><ChevronLeft size={18} /></button>
      <h2 className="font-hand text-2xl text-[var(--ink)] tracking-wide">{MONTHS[month]} <span className="text-[var(--honey)]">{year}</span></h2>
      <button onClick={onNext} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--paper-aged)] text-[var(--ink-muted)] transition-colors"><ChevronRight size={18} /></button>
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
        {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-[var(--ink-faint)] py-1 uppercase tracking-widest">{d}</div>)}
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

function ThemePicker({ currentTheme, onSelect }: { currentTheme: string; onSelect: (t: string) => void }) {
  return (
    <div className="bg-[var(--paper-warm)] rounded-2xl p-4 border border-[var(--border-soft)]">
      <div className="flex items-center gap-2 mb-3">
        <Palette size={14} className="text-[var(--ink-muted)]" />
        <p className="font-hand text-base text-[var(--ink-muted)]">Theme</p>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {Object.entries(THEMES).map(([key, t]) => (
          <button key={key} onClick={() => onSelect(key)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${currentTheme === key ? 'ring-2 ring-[var(--terracotta)] bg-[var(--paper-aged)]' : 'hover:bg-[var(--paper-aged)]'}`}>
            <div className="w-6 h-6 rounded-full border border-[var(--border-soft)]" style={{ backgroundColor: t.paper }} />
            <span className="text-[10px] text-[var(--ink-muted)]">{t.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// --- Main Page ---
export default function Home() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [theme, setTheme] = useState('cream')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>('daily')

  // Load theme on mount
  useEffect(() => { getTheme().then(t => setTheme(t)) }, [])

  // Apply theme CSS vars
  useEffect(() => {
    const t = THEMES[theme] || THEMES.cream
    const root = document.documentElement
    root.style.setProperty('--paper', t.paper)
    root.style.setProperty('--paper-warm', t.paperWarm)
    root.style.setProperty('--paper-aged', t.paperAged)
    root.style.setProperty('--ink', t.ink)
    root.style.setProperty('--ink-muted', t.inkMuted)
    root.style.setProperty('--terracotta', t.accent)
    root.style.setProperty('--surface-raised', theme === 'midnight' ? '#1E1E38' : '#FFFFFF')
    root.style.setProperty('--border-soft', theme === 'midnight' ? '#2A2A4A' : '#DDD6CC')
    root.style.setProperty('--ink-faint', theme === 'midnight' ? '#606080' : '#B8B0A4')
  }, [theme])

  async function handleThemeChange(t: string) {
    setTheme(t)
    await saveTheme(t)
  }

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  // Navigate to a specific day from any view
  function navigateToDay(day: number, m: number, y: number) {
    setYear(y)
    setMonth(m)
    setSelectedDay(day)
    setCurrentView('daily')
    setSidebarOpen(false)
  }

  // Navigate to a specific month from yearly view
  function navigateToMonth(m: number, y: number) {
    setYear(y)
    setMonth(m)
    setCurrentView('monthly')
  }

  const mobileViewIcons = [
    { id: 'daily' as ViewType, icon: Calendar, label: 'Daily' },
    { id: 'monthly' as ViewType, icon: LayoutGrid, label: 'Monthly' },
    { id: 'yearly' as ViewType, icon: Grid3X3, label: 'Yearly' },
  ]

  return (
    <div className="min-h-screen bg-[var(--paper)] paper-texture transition-colors duration-500">
      {/* Top Nav */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 border-b border-[var(--border-soft)]">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-[var(--ink-muted)] hover:bg-[var(--paper-aged)] transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="w-9 h-9 rounded-xl bg-[var(--terracotta)] flex items-center justify-center shadow-paper">
            <span className="text-white text-lg">☁️</span>
          </div>
          <h1 className="font-hand text-xl md:text-2xl text-[var(--ink)] tracking-wide">Cozy Calendar</h1>
        </div>
        <div className="flex items-center gap-3">
          <ViewTabs current={currentView} onChange={setCurrentView} />
          <form action={signOut}>
            <button type="submit" className="flex items-center gap-2 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] bg-[var(--paper-warm)] hover:bg-[var(--paper-aged)] transition-colors px-3 md:px-4 py-2 rounded-full border border-[var(--border-soft)]">
              <LogOut size={15} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex flex-col md:flex-row h-[calc(100vh-65px)] md:h-[calc(100vh-73px)] pb-14 md:pb-0">
        {/* Sidebar — collapsible on mobile, hidden when not daily view on desktop */}
        <aside className={`
          ${sidebarOpen ? 'block' : 'hidden'} ${currentView === 'daily' ? 'md:block' : 'md:hidden'}
          w-full md:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r border-[var(--border-soft)] p-4 md:p-6 overflow-y-auto
          bg-[var(--paper)] md:bg-transparent
          ${sidebarOpen ? 'absolute z-30 top-[65px] left-0 right-0 bottom-0 md:relative md:top-auto md:z-auto' : ''}
        `}>
          <div className="bg-[var(--surface-raised)] rounded-2xl p-5 shadow-paper">
            <CalendarHeader month={month} year={year} onPrev={prevMonth} onNext={nextMonth} />
            <CalendarGrid year={year} month={month} selectedDay={selectedDay} onSelect={(d) => navigateToDay(d, month, year)} />
          </div>
          <div className="mt-5">
            <ThemePicker currentTheme={theme} onSelect={handleThemeChange} />
          </div>
        </aside>

        {/* Right Panel — Animated View Switching */}
        <section className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className={`mx-auto h-full bg-[var(--surface-raised)] rounded-2xl p-5 md:p-8 shadow-paper relative overflow-hidden ${currentView === 'daily' ? 'max-w-2xl' : 'max-w-6xl'}`} style={{ perspective: '1200px' }}>
            <AnimatePresence mode="wait">
              {currentView === 'daily' && (
                <motion.div
                  key={`daily-${year}-${month}-${selectedDay}`}
                  variants={viewTransitions.daily}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="h-full"
                >
                  <DailyView day={selectedDay} month={month} year={year} />
                </motion.div>
              )}
              {currentView === 'monthly' && (
                <motion.div
                  key={`monthly-${year}-${month}`}
                  variants={viewTransitions.monthly}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="h-full"
                >
                  <MonthlyView year={year} month={month} onDayClick={navigateToDay} />
                </motion.div>
              )}
              {currentView === 'yearly' && (
                <motion.div
                  key={`yearly-${year}`}
                  variants={viewTransitions.yearly}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="h-full"
                >
                  <YearlyView year={year} onDayClick={navigateToDay} onMonthClick={navigateToMonth} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--surface-raised)] border-t border-[var(--border-soft)] flex items-center justify-around py-2 px-4 z-40">
        {mobileViewIcons.map(v => {
          const Icon = v.icon
          const isActive = currentView === v.id
          return (
            <button key={v.id} onClick={() => setCurrentView(v.id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors
                ${isActive ? 'text-[var(--terracotta)]' : 'text-[var(--ink-muted)]'}`}>
              <Icon size={20} />
              <span className="text-[10px] font-semibold">{v.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
