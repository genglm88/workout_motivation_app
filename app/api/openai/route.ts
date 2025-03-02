import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: Request) {
  const { messages, secret } = await request.json()

  if (!messages || !secret) {
    return NextResponse.json(
      { message: "Missing required fields", success: false },
      { status: 400 }
    )
  }
  if (secret !== process.env.APP_SECRET_KEY) {
    return NextResponse.json(
      { message: "Unauthorized", success: false },
      { status: 401 }
    )
  }
  const openai = new OpenAI()

  try {
    const completion = await openai.chat.completions.create({
      messages,
      model: "gpt-4",
    })
    const newMessage = completion.choices[0].message.content

    return NextResponse.json(
      { message: newMessage, success: true },
      { status: 201 }
    )
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: "Internal Server Error", success: false },
      { status: 500 }
    )
  }
}
