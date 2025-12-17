'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface CreateListingInput {
  title: string
  description?: string
  price_per_day: number
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  location: 'amagerbro' | 'østerbro' | 'nørrebro' | 'vesterbro'
  category: 'diy' | 'sports' | 'camping' | 'photography' | 'music'
}

export interface Listing {
  id: string
  owner_id: string
  title: string
  description: string | null
  price_per_day: number
  condition: string
  location: string
  category: string
  created_at: string
  profiles?: {
    username: string
  }
}

export async function createListing(input: CreateListingInput) {
  const supabase = await createClient()

  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'You must be authenticated to create a listing' }
  }

  // Insert the listing
  const { data, error } = await supabase
    .from('listings')
    .insert({
      owner_id: user.id,
      title: input.title,
      description: input.description,
      price_per_day: input.price_per_day,
      condition: input.condition,
      location: input.location,
      category: input.category,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Revalidate and redirect to profile or listings page
  revalidatePath('/profile')
  redirect('/profile')
}

export async function getAllListings(): Promise<Listing[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching listings:', error)
    return []
  }

  return data || []
}

export async function getListingById(id: string): Promise<Listing | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      profiles (
        username
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching listing:', error)
    return null
  }

  return data
}

export async function getListingsByUsername(username: string): Promise<Listing[]> {
  const supabase = await createClient()

  // First, get the user's profile by username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (profileError || !profile) {
    console.error('Error fetching profile:', profileError)
    return []
  }

  // Then get all listings by that user
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('owner_id', profile.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching listings:', error)
    return []
  }

  return data || []
}
