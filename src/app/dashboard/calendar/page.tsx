import { redirect } from "next/navigation";

// Redirect old calendar URL to new sessions page
export default function CalendarRedirect() {
  redirect("/dashboard/sessions");
}
