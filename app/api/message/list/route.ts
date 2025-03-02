import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req: Request) {
  const { threadId } = await req.json()
  console.log("from user ", { threadId })
  if (!threadId) {
    return NextResponse.json(
      { message: "Invalid request", success: false },
      { status: 400 }
    )
  }
  const openai = new OpenAI()
  try {
    const { data } = await openai.beta.threads.messages.list(threadId, {
      order: "asc",
      limit: 30,
    })
    //console.log("ml  ", data)
    return NextResponse.json({ data, success: true }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error with fetching message list", success: false },
      { status: 500 }
    )
  }
}
