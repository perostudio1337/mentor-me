import Card from "@/components/ui/card";

export default function EventsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Events</h1>
      <p className="text-muted-foreground mb-8">
        Discover networking events across Europe.
      </p>

      <Card className="p-12 text-center">
        <div className="text-5xl mb-4">📅</div>
        <h2 className="text-xl font-semibold mb-2">Events coming soon</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          The event board is being built. You&apos;ll be able to discover and
          post verified networking events here.
        </p>
      </Card>
    </div>
  );
}
