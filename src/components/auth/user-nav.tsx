"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface UserNavProps {
  variant?: "ghost" | "default"
  showEmail?: boolean
}

export function UserNav({ variant = "ghost", showEmail = true }: UserNavProps) {
  const { data: session } = useSession()

  if (!session?.user) {
    return (
      <Link href="/login">
        <Button variant={variant} className="h-8">
          Sign In
        </Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          className="relative h-8 w-8 rounded-full"
        >
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {session.user.name && (
              <p className="font-medium">{session.user.name}</p>
            )}
            {showEmail && session.user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {session.user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event: any) => {
            event.preventDefault()
            signOut({
              callbackUrl: `${window.location.origin}/login`,
            })
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
