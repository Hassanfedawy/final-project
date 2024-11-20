"use client"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { UserNav } from "@/components/auth/user-nav"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Header() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-primary-600">UpDown</span>
            </Link>
            <div className="hidden ml-10 space-x-8 lg:block">
              <Link href="/features" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Features
              </Link>
              <Link href="/pricing" className="text-base font-medium text-gray-500 hover:text-gray-900">
                Pricing
              </Link>
              {session && (
                <Link href="/dashboard" className="text-base font-medium text-gray-500 hover:text-gray-900">
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="ml-10 space-x-4">
            <div className="hidden lg:flex items-center space-x-4">
              <UserNav variant="default" />
            </div>
            <button
              type="button"
              className="lg:hidden -mr-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="space-y-1 pb-3 pt-2">
              <Link href="/features" className="block px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900">
                Features
              </Link>
              <Link href="/pricing" className="block px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900">
                Pricing
              </Link>
              {session && (
                <Link href="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900">
                  Dashboard
                </Link>
              )}
              <div className="px-3 py-2">
                <UserNav variant="default" />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
