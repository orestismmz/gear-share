import { createClient } from '@/app/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import DeleteButton from './delete-button'

async function deleteUser(userId: number) {
  'use server'
  
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)
  
  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`)
  }
  
  // Revalidate the page to refresh the data
  revalidatePath('/users-test')
}

export default async function UsersTestPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: users, error } = await supabase
    .from('users')
    .select('id, created_at, firstname, lastname, email, is_verified')

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Users Test Page</h1>
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-semibold">Error connecting to Supabase:</p>
          <p>{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Users Test Page</h1>
      <p className="mb-4 text-gray-600">
        Successfully connected to Supabase! Found {users?.length || 0} user(s).
      </p>
      
      {users && users.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Users:</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">ID</th>
                  <th className="border px-4 py-2 text-left">First Name</th>
                  <th className="border px-4 py-2 text-left">Last Name</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">Verified</th>
                  <th className="border px-4 py-2 text-left">Created At</th>
                  <th className="border px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="border px-4 py-2">{user.id}</td>
                    <td className="border px-4 py-2">{user.firstname || '-'}</td>
                    <td className="border px-4 py-2">{user.lastname || '-'}</td>
                    <td className="border px-4 py-2">{user.email || '-'}</td>
                    <td className="border px-4 py-2">
                      {user.is_verified ? '✓' : '✗'}
                    </td>
                    <td className="border px-4 py-2">
                      {user.created_at 
                        ? new Date(user.created_at).toLocaleString()
                        : '-'
                      }
                    </td>
                    <td className="border px-4 py-2">
                      <DeleteButton
                        userId={user.id}
                        userName={user.firstname || user.email || 'this user'}
                        deleteUser={deleteUser}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
          No users found in the database.
        </div>
      )}
    </div>
  )
}

