import Link from "next/link";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import LandingNav from "@/components/ui/landing-nav";

const stats = [
  { value: "5k+", label: "Active Mentees", width: "85%" },
  { value: "12k+", label: "Successful Mentors", width: "92%" },
  { value: "45+", label: "Industry Sectors", width: "70%" },
  { value: "98%", label: "Match Satisfaction", width: "98%" },
];

const features = [
  {
    icon: "🎯",
    title: "Smart Matching",
    description:
      "Matched by your specific problem — not just keywords. A tax law issue goes to a tax specialist, not a general lawyer.",
  },
  {
    icon: "💬",
    title: "Real-Time Chat",
    description:
      "Message your mentor instantly in a safe, moderated environment. Get advice when you need it most.",
  },
  {
    icon: "📅",
    title: "Easy Scheduling",
    description:
      "Shared calendar with your mentor. Pick a time, book a session — no back-and-forth needed.",
  },
  {
    icon: "🌍",
    title: "Networking Events",
    description:
      "Discover verified events across Europe. Grow your network beyond your mentor relationship.",
  },
];

const topics = [
  { icon: "🚀", label: "Career Path" },
  { icon: "⚙️", label: "Engineering" },
  { icon: "💰", label: "Salary Nego" },
  { icon: "💡", label: "Startups" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-mesh">
      {/* Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-36 text-center">
          <div className="inline-block mb-6 px-5 py-2 glass rounded-full text-sm font-medium text-primary">
            Part of the E³UDRES² Alliance
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            Shape the future
            <br />
            <span className="text-gradient">together</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Discover a network of inspiring professionals and ambitious talents.
            Together we build the growth of tomorrow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button variant="gradient" size="lg">
                Find Your Mentor
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg">
                Become a Mentor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Two-Sided Value Prop */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Become a Mentor */}
          <Card hover className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">🎓</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">Become a Mentor</h3>
            <p className="text-muted-foreground mb-6">
              Share your expertise, inspire the next generation and broaden your
              own leadership skills along the way.
            </p>
            <Link href="/register">
              <Button variant="gradient">Start as Mentor</Button>
            </Link>
          </Card>

          {/* Find a Mentor */}
          <Card hover className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">Find a Mentor</h3>
            <p className="text-muted-foreground mb-6">
              Get personalised guidance from proven professionals in your field.
              Turn your idea into a real plan.
            </p>
            <Link href="/register">
              <Button variant="gradient">Find Your Match</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <Card className="p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
            Our Impact
          </p>
          <div className="space-y-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl md:text-3xl font-bold text-gradient">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="stat-bar" style={{ width: stat.width }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">
          Everything You Need
        </h2>
        <p className="text-muted-foreground text-center mb-14 max-w-xl mx-auto">
          Built for real mentoring relationships — not just a directory.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} hover>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Popular Topics */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8">Popular Topics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topics.map((topic) => (
            <Card key={topic.label} hover className="text-center py-8 cursor-pointer">
              <div className="text-3xl mb-3">{topic.icon}</div>
              <p className="font-semibold text-sm">{topic.label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="relative overflow-hidden rounded-3xl p-12 md:p-16">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-90 rounded-3xl" />
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl" />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to start your journey?
            </h2>
            <p className="text-white/80 max-w-lg mx-auto mb-8">
              Whether you need guidance or want to share your experience —
              there&apos;s a place for you on Mentor.me.
            </p>
            <Link href="/register">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary"
              >
                Join Mentor.me — It&apos;s Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-lg font-bold text-gradient">Mentor.me</div>
            <div className="text-sm text-muted-foreground text-center">
              Built with care at UCLL Innovation Lab as part of E³UDRES²
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <a
                href="https://talentfunnel.eu/business-booster-week/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                TalentFunnel
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
