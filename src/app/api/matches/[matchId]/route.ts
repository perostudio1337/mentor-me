import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { matchId } = await params;
    const { status } = await request.json();

    if (status !== "accepted" && status !== "declined") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Verify the user is a participant of this match
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!myProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: match, error } = await supabase
      .from("matches")
      .update({ status })
      .eq("id", matchId)
      .or(`mentor_id.eq.${myProfile.id},student_id.eq.${myProfile.id}`)
      .select()
      .single();

    if (error || !match) {
      console.error("Error updating match status:", error);
      return NextResponse.json({ error: "Match not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ match });
  } catch (error) {
    console.error("Unexpected error updating match status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}