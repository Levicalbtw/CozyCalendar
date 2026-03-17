'use server'

import { createClient } from '@/lib/supabase/server'

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
    .order('time')

  return data || []
}

export async function upsertEvent(date: string, time: string, title: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check if event exists for this time slot
  const { data: existing } = await supabase
    .from('events')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', date)
    .eq('time', time)
    .single()

  if (existing) {
    if (title.trim() === '') {
      await supabase.from('events').delete().eq('id', existing.id)
      return null
    }
    const { data } = await supabase
      .from('events')
      .update({ title })
      .eq('id', existing.id)
      .select()
      .single()
    return data
  }

  if (title.trim() === '') return null

  const { data } = await supabase
    .from('events')
    .insert({ user_id: user.id, date, time, title })
    .select()
    .single()
  return data
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
