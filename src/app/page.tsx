import Link from "next/link";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import LandingNav from "@/components/ui/landing-nav";
import ScrollReveal from "@/components/ui/scroll-reveal";

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
    icon: "🌍",
    title: "Event Discovery",
    description:
      "Submit your own events or browse upcoming ones nearby — workshops, pitch nights, meetups, all in one place.",
  },
  {
    icon: "📈",
    title: "Startup Progress Tracker",
    description:
      "Track your journey from idea to launch. Log milestones, see how far you've come, and show mentors your growth.",
  },
  {
    icon: "🏆",
    title: "Weekly Challenges",
    description:
      "Not sure where to start? Take bite-sized challenges like \"write your elevator pitch\" or \"interview 3 customers\" to build momentum.",
  },
  {
    icon: "🤝",
    title: "Community Feed",
    description:
      "Share your progress, cheer others on, and get encouragement from the community. You're not building alone.",
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
            Find the person who
            <br />
            <span className="text-gradient">gets your problem</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Discover a network of inspiring professionals and ambitious talents.
            Together we build the growth of tomorrow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button variant="gradient" size="lg">
                Get Started
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg">
                See How It Works
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Two-Sided Value Prop */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Become a Mentor */}
          <ScrollReveal delay={0}>
            <Card hover className="text-center h-full">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">🎓</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Become a Mentor</h3>
              <p className="text-muted-foreground mb-4">
                Share your expertise, inspire the next generation and broaden your
                own leadership skills along the way.
              </p>
              <Link
                href="/register"
                className="text-sm font-medium text-primary hover:underline transition-colors"
              >
                Sign up as mentor →
              </Link>
            </Card>
          </ScrollReveal>

          {/* Find a Mentor */}
          <ScrollReveal delay={120}>
            <Card hover className="text-center h-full">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Find a Mentor</h3>
              <p className="text-muted-foreground mb-4">
                Get personalised guidance from proven professionals in your field.
                Turn your idea into a real plan.
              </p>
              <Link
                href="/register"
                className="text-sm font-medium text-secondary hover:underline transition-colors"
              >
                Sign up as mentee →
              </Link>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 scroll-mt-8">
        <ScrollReveal>
          <h2 className="text-3xl font-bold text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-center mb-14 max-w-xl mx-auto">
            Built for real mentoring relationships — not just a directory.
          </p>
        </ScrollReveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 100}>
              <Card hover className="h-full">
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
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Popular Topics */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <ScrollReveal>
          <h2 className="text-3xl font-bold mb-8">Popular Topics</h2>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topics.map((topic, i) => (
            <ScrollReveal key={topic.label} delay={i * 80}>
              <Card hover className="text-center py-8 cursor-pointer">
                <div className="text-3xl mb-3">{topic.icon}</div>
                <p className="font-semibold text-sm">{topic.label}</p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <ScrollReveal>
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
                variant="ghost"
                size="lg"
                className="border-2 border-white text-white hover:bg-white/20 hover:text-white"
              >
                Create Your Free Account
              </Button>
            </Link>
          </div>
        </div>
        </ScrollReveal>
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
