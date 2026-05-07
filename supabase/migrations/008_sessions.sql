-- Create sessions table for scheduling mentorship meetings

CREATE TABLE sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    meeting_link TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view sessions for their matches
-- NOTE: mentor_id/student_id reference profiles.id, NOT auth.uid()
CREATE POLICY "Users can view sessions for their matches" ON sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM matches m
            JOIN profiles p ON p.id IN (m.mentor_id, m.student_id)
            WHERE m.id = sessions.match_id
            AND p.user_id = auth.uid()
        )
    );

-- Policy: Users can create sessions for accepted matches
CREATE POLICY "Users can create sessions for accepted matches" ON sessions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM matches m
            JOIN profiles p ON p.id IN (m.mentor_id, m.student_id)
            WHERE m.id = sessions.match_id
            AND m.status = 'accepted'
            AND p.user_id = auth.uid()
        )
    );

-- Policy: Users can update their sessions
CREATE POLICY "Users can update their sessions" ON sessions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM matches m
            JOIN profiles p ON p.id IN (m.mentor_id, m.student_id)
            WHERE m.id = sessions.match_id
            AND p.user_id = auth.uid()
        )
    );

-- Indexes for performance
CREATE INDEX idx_sessions_match_id ON sessions(match_id);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX idx_sessions_status ON sessions(status);