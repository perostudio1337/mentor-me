'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const stages = [
  { value: 'idea', label: '💡 Idea' },
  { value: 'validated', label: '✅ Validated' },
  { value: 'first_customer', label: '🤝 First Customer' },
  { value: 'funding', label: '💰 Funding' },
  { value: 'scaling', label: '🚀 Scaling' },
  { value: 'other', label: '⭐ Other' },
]

export default function AddMilestonePage() {
  const supabase = createClient()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [stage, setStage] = useState('idea')
  const [achievedAt, setAchievedAt] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return
    setLoading(true)

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.user.id)
      .single()

    if (!profile) return

    await supabase.from('startup_milestones').insert({
      profile_id: profile.id,
      title: title.trim(),
      description: description.trim() || null,
      stage,
      achieved_at: achievedAt || null,
    })

    setLoading(false)
    router.push('/profile/journey')
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-2">Add Milestone</h1>
      <p className="text-gray-500 mb-8">Document a step in your startup journey.</p>

      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Got my first customer"
            className="mt-1 w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Stage</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="mt-1 w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {stages.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What happened? What did you learn?"
            rows={3}
            className="mt-1 w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Date achieved (optional)</label>
          <input
            type="date"
            value={achievedAt}
            onChange={(e) => setAchievedAt(e.target.value)}
            className="mt-1 w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-500 text-white rounded-xl py-2 text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Add Milestone'}
        </button>
      </div>
    </div>
  )
}