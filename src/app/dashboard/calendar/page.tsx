'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Session {
  id: string;
  scheduled_at: string;
  status: string;
  meeting_link?: string;
  notes?: string;
  matches: {
    mentor_id: string;
    student_id: string;
    mentor: { name: string };
    student: { name: string };
  };
}

interface Match {
  id: string;
  mentor: { name: string };
  student: { name: string };
  mentor_id: string;
  student_id: string;
}

export default function CalendarPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [meetingLink, setMeetingLink] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchSessions();
        fetchMatches();
      } else setLoading(false);
    });
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    if (!user) return;
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          mentor_id,
          student_id,
          mentor:profiles!matches_mentor_id_fkey (name),
          student:profiles!matches_student_id_fkey (name)
        `)
        .eq('status', 'accepted')
        .or(`mentor_id.eq.${user.id},student_id.eq.${user.id}`);

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    }
  };

  const handleBookSession = async () => {
    if (!selectedMatch || !scheduledAt) return;

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id: selectedMatch,
          scheduled_at: scheduledAt,
          meeting_link: meetingLink || null,
          notes: notes || null,
        }),
      });

      if (response.ok) {
        setShowBookingModal(false);
        setSelectedMatch('');
        setScheduledAt('');
        setMeetingLink('');
        setNotes('');
        fetchSessions(); // Refresh sessions
      } else {
        alert('Failed to book session');
      }
    } catch (error) {
      console.error('Error booking session:', error);
      alert('Error booking session');
    }
  };

  const events = sessions.map(session => {
    if (!user) return null;
    const isMentor = session.matches.mentor_id === user.id;
    const otherPerson = isMentor ? session.matches.student.name : session.matches.mentor.name;

    return {
      id: session.id,
      title: `Session with ${otherPerson}`,
      start: session.scheduled_at,
      backgroundColor: session.status === 'confirmed' ? '#10b981' : session.status === 'pending' ? '#f59e0b' : '#ef4444',
      extendedProps: session,
    };
  }).filter(Boolean);

  if (loading) {
    return <div className="p-6">Loading calendar...</div>;
  }

  if (!user) {
    return <div className="p-6">Please log in to view your calendar.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Session Calendar</h1>
        <button
          onClick={() => setShowBookingModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Book New Session
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          eventClick={(info) => {
            const session = info.event.extendedProps as Session;
            const isMentor = session.matches.mentor_id === user.id;
            const otherPerson = isMentor ? session.matches.student.name : session.matches.mentor.name;
            alert(`Session with ${otherPerson} at ${format(new Date(session.scheduled_at), 'PPpp')}\nStatus: ${session.status}`);
          }}
        />
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Book New Session</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Match</label>
                <select
                  value={selectedMatch}
                  onChange={(e) => setSelectedMatch(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Choose a match...</option>
                  {matches.map(match => {
                    const isMentor = match.mentor_id === user.id;
                    const otherPerson = isMentor ? match.student.name : match.mentor.name;
                    return (
                      <option key={match.id} value={match.id}>
                        {otherPerson} ({isMentor ? 'Mentor' : 'Student'})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meeting Link (optional)</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://teams.microsoft.com/..."
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBookSession}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Book Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}