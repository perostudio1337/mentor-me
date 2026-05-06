import Card from "@/components/ui/card";

export default function ChatPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Messages</h1>
      <p className="text-muted-foreground mb-8">
        Chat with your matched mentors or students.
      </p>

      <Card className="p-12 text-center">
        <div className="text-5xl mb-4">💬</div>
        <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Once you match with someone, you can start chatting here.
        </p>
      </Card>
    </div>
  );
}
