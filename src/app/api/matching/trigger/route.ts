// src/app/api/matching/trigger/route.ts

import { createClient } from '@/lib/supabase/server'
import { runMatchingForStudent } from '@/lib/matching/matcher-server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('student_profiles')
    .select('profile_id')

  if (!students || students.length === 0) {
    return NextResponse.json({ message: 'Geen studenten gevonden' })
  }

  const results = []
  for (const student of students) {
    const result = await runMatchingForStudent(student.profile_id)
    results.push({ profile_id: student.profile_id, ...result })
  }

  return NextResponse.json({ success: true, results })
}