import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/db"

const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      )
    }

    const { email, password } = userSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    })

    // Create a free subscription for the user
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: "FREE",
        status: "ACTIVE",
        startDate: new Date(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      },
    })

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error instanceof Error ? error.message : String(error))
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes("connect ETIMEDOUT")) {
      return NextResponse.json(
        { message: "Database connection timeout. Please try again." },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
