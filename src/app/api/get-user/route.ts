import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({ userId: session.user.id })
  } catch (error) {
    console.error('Error getting user:', error)
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    )
  }
}
