import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req: Request) {
  const { message, threadId, role = "user" } = await req.json()

  if (!message || !threadId) {
    return NextResponse.json(
      { message: "Invalid request", success: false },
      { status: 400 }
    )
  }
  const openai = new OpenAI()
  try {
    const newMessage = await openai.beta.threads.messages.create(threadId, {
      role: role,
      content: message,
    })
    return NextResponse.json({ message: newMessage }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    )
  }
}
