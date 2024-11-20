import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

const tiers = [
  {
    name: "Free",
    id: "free",
    price: { monthly: "$0" },
    description: "Perfect for side projects and small websites.",
    features: [
      "5 monitors",
      "5 minute check interval",
      "24 hour data retention",
      "Email notifications",
      "Basic uptime reports",
    ],
    cta: "Get Started",
    href: "/register",
  },
  {
    name: "Pro",
    id: "pro",
    price: { monthly: "$29" },
    description: "For businesses that need advanced monitoring.",
    features: [
      "50 monitors",
      "1 minute check interval",
      "30 day data retention",
      "SMS & Slack notifications",
      "Advanced analytics",
      "Custom status pages",
      "API access",
      "Team collaboration",
    ],
    cta: "Start Free Trial",
    href: "/register?plan=pro",
    mostPopular: true,
  },
  {
    name: "Enterprise",
    id: "enterprise",
    price: { monthly: "$99" },
    description: "For large organizations with complex needs.",
    features: [
      "Unlimited monitors",
      "30 second check interval",
      "1 year data retention",
      "Priority support",
      "Custom integrations",
      "SLA guarantees",
      "Dedicated account manager",
      "Custom contracts",
    ],
    cta: "Contact Sales",
    href: "/contact",
  },
]

export default function PricingPage() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-base font-semibold leading-7 text-primary-600">Pricing</h1>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the right plan for&nbsp;you
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Start with our free plan and upgrade as you grow. All plans include a 14-day trial of Pro features.
        </p>
        
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 ring-1 ${
                tier.mostPopular
                  ? "ring-2 ring-primary-600"
                  : "ring-gray-200"
              } xl:p-10`}
            >
              <div className="flex items-center justify-between gap-x-4">
                <h2
                  id={`${tier.id}-tier`}
                  className="text-lg font-semibold leading-8 text-gray-900"
                >
                  {tier.name}
                </h2>
                {tier.mostPopular && (
                  <p className="rounded-full bg-primary-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary-600">
                    Most popular
                  </p>
                )}
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  {tier.price.monthly}
                </span>
                <span className="text-sm font-semibold leading-6 text-gray-600">
                  /month
                </span>
              </p>
              <Button
                asChild
                variant={tier.mostPopular ? "default" : "outline"}
                className="mt-6 w-full"
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
              <ul
                role="list"
                className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckCircle2
                      className="h-6 w-5 flex-none text-primary-600"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
