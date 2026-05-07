import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/sessions/[sessionId] — update session status (confirm, cancel)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();

    if (!["confirmed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'confirmed' or 'cancelled'." },
        { status: 400 }
      );
    }

    // Get profile id
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!myProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Fetch the session and verify participation through the match
    const { data: session, error: fetchError } = await supabase
      .from("sessions")
      .select("id, match_id, status")
      .eq("id", sessionId)
      .single();

    if (fetchError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Verify user is part of this match
    const { data: match } = await supabase
      .from("matches")
      .select("id")
      .eq("id", session.match_id)
      .or(`mentor_id.eq.${myProfile.id},student_id.eq.${myProfile.id}`)
      .single();

    if (!match) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update session status
    const { data: updated, error: updateError } = await supabase
      .from("sessions")
      .update({ status })
      .eq("id", sessionId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update session: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ session: updated });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
