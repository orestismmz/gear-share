import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreateListingForm from '@/app/components/CreateListingForm'

export default async function CreateListingPage() {
  const supabase = await createClient()

  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    // Redirect to sign-in if not authenticated
    redirect('/sign-in')
  }

  return (
    <div className="p-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Create a New Listing</h1>
        <p className="text-gray-600">
          Share your gear with the community and start earning
        </p>
      </div>
      <CreateListingForm />
    </div>
  )
}

