import { NextResponse } from "next/server";

// In-memory cache to avoid burning SerpApi credits
let cache: { data: ExternalEvent[]; fetchedAt: number } | null = null;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export type ExternalEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  link: string;
  description: string;
  thumbnail: string | null;
  source: "external";
};

// Search queries to rotate through (uses 1 credit per call)
const SEARCH_QUERIES = [
  "startup events Europe",
  "entrepreneurship workshop Europe",
  "pitch night networking Europe",
  "hackathon Europe",
];

export async function GET() {
  const apiKey = process.env.SERPAPI_KEY;

  // If no API key, return empty (graceful fallback)
  if (!apiKey) {
    return NextResponse.json({ events: [], source: "no_api_key" });
  }

  // Return cached data if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_DURATION_MS) {
    return NextResponse.json({ events: cache.data, source: "cache" });
  }

  try {
    // Pick a random query to get variety across days
    const query =
      SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];

    const params = new URLSearchParams({
      engine: "google_events",
      q: query,
      api_key: apiKey,
      hl: "en",
    });

    const response = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`,
      { next: { revalidate: CACHE_DURATION_MS / 1000 } }
    );

    if (!response.ok) {
      console.error("SerpApi error:", response.status);
      return NextResponse.json({ events: cache?.data || [], source: "error" });
    }

    const data = await response.json();
    const rawEvents = data.events_results || [];

    const events: ExternalEvent[] = rawEvents
      .slice(0, 12)
      .map((e: Record<string, unknown>, i: number) => {
        // Parse date info
        const dateInfo = e.date as { start_date?: string; when?: string } | undefined;
        const startDate = dateInfo?.start_date || "";
        const when = dateInfo?.when || "";

        // Parse address
        const addressArr = e.address as string[] | undefined;
        const address = addressArr?.join(", ") || "";

        // Parse link
        const link = (e.link as string) || "";

        // Parse venue
        const venueInfo = e.venue as { name?: string } | undefined;
        const venueName = venueInfo?.name || "";

        const location = venueName
          ? `${venueName}, ${address}`
          : address;

        return {
          id: `ext-${i}-${(e.title as string || "").slice(0, 20).replace(/\s/g, "-")}`,
          title: (e.title as string) || "Untitled Event",
          date: startDate || when,
          location,
          link,
          description: (e.description as string) || when,
          thumbnail: (e.thumbnail as string) || null,
          source: "external" as const,
        };
      });

    // Update cache
    cache = { data: events, fetchedAt: Date.now() };

    return NextResponse.json({ events, source: "fresh" });
  } catch (error) {
    console.error("Failed to fetch external events:", error);
    return NextResponse.json({ events: cache?.data || [], source: "error" });
  }
}
