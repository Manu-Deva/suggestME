import { Button } from "@/components/ui/button";
import { CheckCircle, Music, Radio, Headphones, Share2 } from "lucide-react";
import Link from "next/link";

export default function LearnMorePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <Music className="h-6 w-6" />
          <span className="ml-2 text-2xl font-bold">MusicMatcher</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Home
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Pricing
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 max-w-full">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 items-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Discover the Power of AI-Driven Music Recommendations
                </h1>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  MusicMatcher uses cutting-edge artificial intelligence to
                  understand your unique taste in music and introduce you to new
                  songs you'll love.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-4 md:px-6 max-w-full">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-12">
              How MusicMatcher Works
            </h2>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <Headphones className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Listen and Learn</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  As you listen to music, MusicMatcher learns your preferences,
                  understanding the nuances of your taste.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <Radio className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">AI-Powered Analysis</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Our advanced AI analyzes countless factors including rhythm,
                  tempo, lyrics, and more to understand what you love.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <Share2 className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">
                  Personalized Recommendations
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Receive a constant stream of new music recommendations,
                  perfectly tailored to your evolving taste.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 max-w-full">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-12">
              Why Choose MusicMatcher?
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {[
                "Discover new artists and genres you'll love",
                "Create perfect playlists for any mood or occasion",
                "Share your musical journey with friends",
                "Integrate with your favorite music streaming services",
                "Get real-time recommendations as you listen",
                "Explore music from around the world",
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-4 md:px-6 max-w-full">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-12">
              What Our Users Say
            </h2>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              {[
                {
                  quote:
                    "MusicMatcher has completely transformed how I discover new music. It's like having a personal DJ who knows my taste perfectly.",
                  author: "Alex K.",
                },
                {
                  quote:
                    "I've found so many amazing artists I never would have discovered on my own. This app is a game-changer for music lovers.",
                  author: "Samantha L.",
                },
                {
                  quote:
                    "The AI recommendations are scary good. It's like the app can read my mind and know exactly what I want to hear next.",
                  author: "Michael T.",
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-4 text-center"
                >
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    "{testimonial.quote}"
                  </p>
                  <p className="font-semibold">- {testimonial.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 max-w-full">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Ready to Transform Your Music Experience?
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Join thousands of music lovers who have discovered their new
                  favorite songs with MusicMatcher.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Link href="/get-started">
                  <Button className="w-full">Get Started Now</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 SuggestMe. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
