'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock, AlignLeft, Type, Trash2 } from 'lucide-react'
import { EventData } from '../actions'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: EventData) => void
  onDelete?: (id: string) => void
  event?: EventData | null
  date: string
  dateLabel: string
}

export default function EventModal({ isOpen, onClose, onSave, onDelete, event, date, dateLabel }: EventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  useEffect(() => {
    if (event) {
      setTitle(event.title || '')
      setDescription(event.description || '')
      setLocation(event.location || '')
      setStartTime(event.start_time || '')
      setEndTime(event.end_time || '')
    } else {
      setTitle('')
      setDescription('')
      setLocation('')
      setStartTime('09:00')
      setEndTime('10:00')
    }
  }, [event, isOpen])

  function handleSave() {
    if (!title.trim()) return
    onSave({
      id: event?.id,
      date,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      start_time: startTime || null,
      end_time: endTime || null,
    })
    onClose()
  }

  function handleDelete() {
    if (event?.id && onDelete) {
      onDelete(event.id)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="event-modal-backdrop"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="event-modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-hand text-2xl text-[var(--ink)]">
                  {event?.id ? 'Edit Event' : 'New Event'}
                </h3>
                <p className="text-xs text-[var(--ink-muted)] mt-0.5">{dateLabel}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--paper-aged)] text-[var(--ink-muted)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="event-modal-label">
                <Type size={12} />
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What's happening?"
                autoFocus
                className="event-modal-input"
              />
            </div>

            {/* Time row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="event-modal-label">
                  <Clock size={12} />
                  Start
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="event-modal-input"
                />
              </div>
              <div>
                <label className="event-modal-label">
                  <Clock size={12} />
                  End
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="event-modal-input"
                />
              </div>
            </div>

            {/* Location */}
            <div className="mb-4">
              <label className="event-modal-label">
                <MapPin size={12} />
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Where is it?"
                className="event-modal-input"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="event-modal-label">
                <AlignLeft size={12} />
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add details..."
                rows={3}
                className="event-modal-input event-modal-textarea"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              {event?.id && onDelete ? (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-[var(--ink-muted)] hover:bg-[var(--paper-aged)] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[var(--terracotta)] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 shadow-paper"
                >
                  {event?.id ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
