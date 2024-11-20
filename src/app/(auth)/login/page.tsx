import { Metadata } from "next"
import Link from "next/link"
import { AuthForm } from "@/components/auth/auth-form"

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
}

export default function LoginPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">UpDown</span>
          </Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "This monitoring platform has completely transformed how we track our websites. The real-time alerts and detailed analytics have helped us maintain 99.9% uptime across all our services."
            </p>
            <footer className="text-sm">Sofia Davis, CTO at Acme Inc</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in to your account
            </p>
          </div>
          <AuthForm type="login" />
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link
              href="/register"
              className="hover:text-brand underline underline-offset-4"
            >
              Don&apos;t have an account? Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
