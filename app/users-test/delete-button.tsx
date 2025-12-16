'use client'

import { useTransition } from 'react'

interface DeleteButtonProps {
  userId: string
  userName: string
  deleteUser: (userId: string) => Promise<void>
}

export default function DeleteButton({ userId, userName, deleteUser }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${userName}?`)) {
      startTransition(async () => {
        await deleteUser(userId)
      })
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  )
}

