'use server'

import { createClient } from '@/lib/supabase/server'

// ---- Types ----

export interface EventData {
  id?: string
  date: string
  title: string
  description?: string
  location?: string
  start_time?: string | null
  end_time?: string | null
  time?: string
}

// ---- Events ----

export async function getEvents(date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)
    .order('start_time', { ascending: true, nullsFirst: false })

  return data || []
}

export async function getEventsForMonth(year: number, month: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`

  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('start_time', { ascending: true, nullsFirst: false })

  return data || []
}

export async function getEventsForYear(year: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  const { data } = await supabase
    .from('events')
    .select('id, date, title')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)

  return data || []
}

export async function upsertEvent(event: EventData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  if (event.id) {
    // Update existing
    const { data } = await supabase
      .from('events')
      .update({
        title: event.title,
        description: event.description || '',
        location: event.location || '',
        start_time: event.start_time || null,
        end_time: event.end_time || null,
        time: event.start_time || event.time || '',
      })
      .eq('id', event.id)
      .eq('user_id', user.id)
      .select()
      .single()
    return data
  }

  // Insert new
  const { data } = await supabase
    .from('events')
    .insert({
      user_id: user.id,
      date: event.date,
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      start_time: event.start_time || null,
      end_time: event.end_time || null,
      time: event.start_time || event.time || '',
    })
    .select()
    .single()
  return data
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  return !error
}

// ---- Journal ----

export async function getJournal(date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)
    .single()

  return data
}

export async function saveJournal(date: string, content: string, mood?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('journal_entries')
    .upsert(
      { user_id: user.id, date, content, mood, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single()

  return data
}

// ---- Stickers ----

export async function getStickers(date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('sticker_placements')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', date)

  return data || []
}

export async function addSticker(date: string, stickerName: string, x: number, y: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('sticker_placements')
    .insert({ user_id: user.id, date, sticker_name: stickerName, x, y })
    .select()
    .single()

  return data
}

export async function updateStickerPosition(id: string, x: number, y: number) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('sticker_placements')
    .update({ x, y })
    .eq('id', id)
    .select()
    .single()

  return data
}

export async function removeSticker(id: string) {
  const supabase = await createClient()
  await supabase.from('sticker_placements').delete().eq('id', id)
}

// ---- User Preferences ----

export async function getTheme() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'cream'

  const { data } = await supabase
    .from('user_preferences')
    .select('theme')
    .eq('user_id', user.id)
    .single()

  return data?.theme || 'cream'
}

export async function saveTheme(theme: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_preferences')
    .upsert(
      { user_id: user.id, theme, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  return data
}

// ---- Custom Stickers ----

export async function getCustomStickers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('custom_stickers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function uploadCustomSticker(name: string, imageUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('custom_stickers')
    .insert({ user_id: user.id, name, image_url: imageUrl })
    .select()
    .single()

  return data
}

export async function deleteCustomSticker(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('custom_stickers')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  return !error
}
