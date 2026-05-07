'use client'

// ============================================================
// MENTOR ME — RequestMentorButton
// src/components/discovery/request-mentor-button.tsx
// ============================================================

import { useState } from 'react'
import Button from '@/components/ui/button'
import MentorRequestModal from './mentor-request-modal'
import type { MentorProfileFull } from '@/types/database.types'

interface Props {
  mentors: MentorProfileFull[]
  /** Bestaande matches van de ingelogde student */
  existingMatches: { mentor_id: string; match_id: string; status: string }[]
}

export default function RequestMentorButton({ mentors, existingMatches }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="gradient" onClick={() => setOpen(true)}>
        ✦ Request a mentor
      </Button>

      <MentorRequestModal
        isOpen={open}
        onClose={() => setOpen(false)}
        mentors={mentors}
        existingMatches={existingMatches}
      />
    </>
  )
}
