'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Feather, Plus, Sticker, Trash2, MapPin, Clock } from 'lucide-react'
import { getEvents, upsertEvent, deleteEvent, getJournal, saveJournal, getStickers, addSticker, updateStickerPosition, removeSticker, EventData } from '../actions'
import EventModal from './EventModal'

const STICKER_PALETTE = ['☕','🌿','🌸','📚','✨','🎵','🍂','🕯️','🌙','💌','🧸','🎨','📝','🍰','🌻','🦋']
const MOODS = ['☀️ Bright', '🌧️ Mellow', '🌿 Calm', '🔥 Energized', '🌙 Quiet']

interface StickerPlacement { id: string; sticker_name: string; x: number; y: number }

function formatTimeDisplay(time: string | null | undefined): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

function formatDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

interface DailyViewProps {
  day: number
  month: number
  year: number
}

export default function DailyView({ day, month, year }: DailyViewProps) {
  const dateStr = formatDate(year, month, day)
  const dateLabel = new Date(year, month, day).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const canvasRef = useRef<HTMLDivElement>(null)

  const [events, setEvents] = useState<EventData[]>([])
  const [journal, setJournal] = useState('')
  const [mood, setMood] = useState<string | null>(null)
  const [stickers, setStickers] = useState<StickerPlacement[]>([])
  const [showPalette, setShowPalette] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null)

  // Refs for auto-save on unmount
  const journalRef = useRef(journal)
  const moodRef = useRef(mood)
  const dateRef = useRef(dateStr)
  const hasLoadedRef = useRef(false)

  journalRef.current = journal
  moodRef.current = mood
  dateRef.current = dateStr

  const journalTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load data when date changes
  useEffect(() => {
    hasLoadedRef.current = false
    const loadData = async () => {
      const [evts, jrnl, stks] = await Promise.all([
        getEvents(dateStr),
        getJournal(dateStr),
        getStickers(dateStr)
      ])
      setEvents(evts as EventData[])
      setJournal(jrnl?.content || '')
      setMood(jrnl?.mood || null)
      setStickers(stks as StickerPlacement[])
      hasLoadedRef.current = true
    }
    loadData()

    // Save on unmount / day change
    return () => {
      if (journalTimer.current) clearTimeout(journalTimer.current)
      if (hasLoadedRef.current) {
        const currentDate = dateRef.current
        const currentJournal = journalRef.current
        const currentMood = moodRef.current
        if (currentJournal || currentMood) {
          saveJournal(currentDate, currentJournal, currentMood || undefined)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr])

  // Journal auto-save with debounce
  const handleJournalChange = useCallback((content: string) => {
    setJournal(content)
    if (journalTimer.current) clearTimeout(journalTimer.current)
    journalTimer.current = setTimeout(() => {
      saveJournal(dateStr, content, moodRef.current || undefined)
    }, 800)
  }, [dateStr])

  // Mood saves immediately
  async function handleMood(m: string) {
    const newMood = mood === m ? null : m
    setMood(newMood)
    await saveJournal(dateStr, journalRef.current, newMood || undefined)
  }

  // Event handlers
  async function handleEventSave(eventData: EventData) {
    const result = await upsertEvent(eventData)
    if (result) {
      if (eventData.id) {
        setEvents(prev => prev.map(e => e.id === eventData.id ? result as EventData : e))
      } else {
        setEvents(prev => [...prev, result as EventData])
      }
    }
  }

  async function handleEventDelete(id: string) {
    const success = await deleteEvent(id)
    if (success) {
      setEvents(prev => prev.filter(e => e.id !== id))
    }
  }

  function openNewEvent() {
    setEditingEvent(null)
    setModalOpen(true)
  }

  function openEditEvent(event: EventData) {
    setEditingEvent(event)
    setModalOpen(true)
  }

  // Sticker handlers
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
    <div className="h-full flex flex-col relative" ref={canvasRef}>
      {/* Stickers */}
      {stickers.map(s => (
        <motion.div key={s.id} drag dragMomentum={false}
          onDragEnd={(_, info) => {
            const el = canvasRef.current; if (!el) return
            const rect = el.getBoundingClientRect()
            handleStickerDragEnd(s.id, ((info.point.x - rect.left) / rect.width) * 100, ((info.point.y - rect.top) / rect.height) * 100)
          }}
          initial={{ x: 0, y: 0 }}
          style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%, -50%)', zIndex: 20 }}
          className="cursor-grab active:cursor-grabbing group">
          <span className="text-3xl select-none">{s.sticker_name}</span>
          <button onClick={() => handleRemoveSticker(s.id)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--terracotta)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10} /></button>
        </motion.div>
      ))}

      {/* Date Header */}
      <div className="mb-4 pb-3 border-b border-[var(--border-soft)] relative z-10">
        <p className="font-hand text-3xl md:text-4xl text-[var(--ink)] leading-tight">{dateLabel}</p>
        <p className="text-xs text-[var(--ink-muted)] mt-1 font-medium tracking-wider uppercase">Daily Page</p>
      </div>

      {/* Events */}
      <div className="mb-5 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[var(--sage)] flex items-center justify-center"><Plus size={12} className="text-white" /></div>
            <span className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Events</span>
          </div>
          <button
            onClick={openNewEvent}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--terracotta)] hover:text-[var(--ink)] transition-colors px-2.5 py-1 rounded-lg hover:bg-[var(--paper-aged)]"
          >
            <Plus size={13} />
            New Event
          </button>
        </div>

        {events.length === 0 ? (
          <p className="text-xs text-[var(--ink-faint)] italic py-3 text-center">No events yet — tap + to add one</p>
        ) : (
          <div className="space-y-2">
            {events.map(event => (
              <motion.button
                key={event.id}
                onClick={() => openEditEvent(event)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full text-left event-card"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[var(--terracotta)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--ink)] truncate">{event.title}</p>
                    {(event.start_time || event.location) && (
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {event.start_time && (
                          <span className="flex items-center gap-1 text-xs text-[var(--ink-muted)]">
                            <Clock size={10} />
                            {formatTimeDisplay(event.start_time)}
                            {event.end_time && ` – ${formatTimeDisplay(event.end_time)}`}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1 text-xs text-[var(--ink-muted)]">
                            <MapPin size={10} />
                            <span className="truncate max-w-[120px]">{event.location}</span>
                          </span>
                        )}
                      </div>
                    )}
                    {event.description && (
                      <p className="text-xs text-[var(--ink-faint)] mt-1 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Journal */}
      <div className="flex-1 flex flex-col relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-[var(--lavender)] flex items-center justify-center"><Feather size={12} className="text-white" /></div>
          <span className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Journal</span>
        </div>
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {MOODS.map(v => (
            <button key={v} onClick={() => handleMood(v)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors
                ${mood === v ? 'bg-[var(--blush)] text-white border-[var(--blush)]' : 'bg-[var(--paper-aged)] text-[var(--ink-muted)] border-[var(--border-soft)] hover:bg-[var(--blush)] hover:text-white'}`}>{v}</button>
          ))}
        </div>
        <textarea value={journal} onChange={e => handleJournalChange(e.target.value)}
          placeholder="How are you feeling today? What's on your mind..."
          className="flex-1 w-full resize-none bg-[var(--paper-warm)] rounded-xl border border-[var(--border-soft)] p-4 font-hand text-lg text-[var(--ink)] placeholder-[var(--ink-faint)] outline-none focus:border-[var(--blush)] transition-colors leading-relaxed min-h-[200px]" />
      </div>

      {/* Sticker Palette */}
      <AnimatePresence>
        {showPalette && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-4 right-4 bg-[var(--surface-raised)] rounded-2xl shadow-sticker border border-[var(--border-soft)] p-4 z-30 w-52">
            <p className="font-hand text-sm text-[var(--ink-muted)] mb-2">Pick a sticker</p>
            <div className="grid grid-cols-4 gap-2">
              {STICKER_PALETTE.map(emoji => <button key={emoji} onClick={() => handleAddSticker(emoji)} className="text-2xl hover:scale-125 transition-transform w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--paper-warm)]">{emoji}</button>)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setShowPalette(!showPalette)}
        className="absolute bottom-4 right-4 z-20 w-12 h-12 rounded-full bg-[var(--honey)] text-white flex items-center justify-center shadow-sticker hover:bg-[var(--terracotta)] transition-colors"
        style={showPalette ? { right: '15.5rem' } : {}}><Sticker size={20} /></button>

      {/* Event Modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEvent(null) }}
        onSave={handleEventSave}
        onDelete={handleEventDelete}
        event={editingEvent}
        date={dateStr}
        dateLabel={dateLabel}
      />
    </div>
  )
}
