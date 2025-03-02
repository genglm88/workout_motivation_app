import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST() {
  const openai = new OpenAI()
  try {
    const thread = await openai.beta.threads.create()
    console.log(thread)
    return NextResponse.json({ thread }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    )
  }
}
