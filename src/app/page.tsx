import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"

const features = [
  "24/7 Website Monitoring",
  "Real-time Alerts",
  "Performance Analytics",
  "Custom Status Pages",
  "Multi-location Checks",
  "Team Collaboration",
]

export default function Home() {
  return (
    <div className="relative isolate">
      {/* Background gradient */}
      <div className="absolute inset-x-0 top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 to-primary-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      {/* Hero section */}
      <div className="px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Monitor Your Website Like A Pro
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Get instant alerts when your website goes down. Monitor uptime, response time, and performance from multiple locations worldwide.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg">
                <Link href="/register">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Monitor with confidence
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Get comprehensive insights into your website's performance and uptime with our powerful monitoring tools.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature} className="flex gap-x-3">
                <CheckCircle2 className="h-6 w-6 flex-none text-primary-600" aria-hidden="true" />
                <div>
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    {feature}
                  </dt>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Background gradient */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary-200 to-primary-400 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </div>
  )
}
