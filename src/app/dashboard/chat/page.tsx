'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Match = {
  id: string
  status: string
  mentor: { id: string; name: string }[]
  student: { id: string; name: string }[]
}

export default function ChatOverviewPage() {
  const supabase = createClient()
  const [matches, setMatches] = useState<Match[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMatches = async () => {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) return
      setUserId(authData.user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', authData.user.id)
        .single()

      if (!profile) return

      const { data, error } = await supabase
        .from('matches')
        .select(`
          id, status,
          mentor:profiles!matches_mentor_id_fkey(id, name),
          student:profiles!matches_student_id_fkey(id, name)
        `)
        .or(`mentor_id.eq.${profile.id},student_id.eq.${profile.id}`)
        .eq('status', 'accepted')

      if (!error && data) setMatches(data as Match[])
      setLoading(false)
    }

    fetchMatches()
  }, [])

  if (loading) return <div className="p-8 text-center">Laden...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Messages</h1>
      <p className="text-muted-foreground mb-8">
        Chat with your matched mentors or students.
      </p>

      {matches.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl shadow">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Once you match with someone, you can start chatting here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => {
            const mentor = match.mentor?.[0] ?? null
            const student = match.student?.[0] ?? null
            const otherPerson = mentor?.id === userId
              ? student
              : mentor

            return (
              <Link key={match.id} href={`/dashboard/chat/${match.id}`}>
                <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-4 hover:shadow-md transition cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-lg">
                    {otherPerson?.name?.slice(0, 2).toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="font-semibold">{otherPerson?.name ?? 'Unknown'}</p>
                    <p className="text-sm text-gray-400">Tap to open chat</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
