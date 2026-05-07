import { createClient } from '@/lib/supabase/client'

export async function markMessagesAsRead(matchId: string, userId: string) {

  const supabase = createClient()

  await supabase

    .from('messages')

    .update({ read_at: new Date().toISOString() })

    .eq('match_id', matchId)

    .eq('receiver_id', userId)

    .is('read_at', null)

}