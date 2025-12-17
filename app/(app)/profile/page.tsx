import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/app/components/auth/LogoutButton'
import Button from '@/app/components/ui/Button'

export default async function ProfilePage() {
  const supabase = await createClient()

  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    // Redirect to sign-in if not authenticated
    redirect('/sign-in')
  }

  // Fetch the user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p>Error loading profile: {profileError?.message || 'Profile not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="flex gap-2">
        <Link href="/create-listing">
          <Button>Create Listing</Button>
        </Link>
        <LogoutButton />
        </div>
      </div>
      <p className="text-lg mb-6">Hello {profile.username}</p>
    </div>
  )
}