import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch sessions for matches where user is mentor or student
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select(`
        *,
        matches (
          mentor_id,
          student_id,
          mentor:profiles!matches_mentor_id_fkey (name),
          student:profiles!matches_student_id_fkey (name)
        )
      `)
      .or(`mentor_id.eq.${user.id},student_id.eq.${user.id}`)
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { match_id, scheduled_at, meeting_link, notes } = await request.json();

    if (!match_id || !scheduled_at) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the match exists and user is part of it
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id, status')
      .eq('id', match_id)
      .or(`mentor_id.eq.${user.id},student_id.eq.${user.id}`)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found or access denied' }, { status: 403 });
    }

    if (match.status !== 'accepted') {
      return NextResponse.json({ error: 'Cannot schedule session for non-accepted match' }, { status: 400 });
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        match_id,
        scheduled_at,
        meeting_link,
        notes,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}