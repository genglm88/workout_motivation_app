import { NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req: Request) {
  const { threadId, runId } = await req.json()
  console.log("from user ", { threadId, runId })
  if (!threadId || !runId) {
    return NextResponse.json(
      { message: "Invalid request", success: false },
      { status: 400 }
    )
  }
  const openai = new OpenAI()
  try {
    const retrieveRun = await openai.beta.threads.runs.retrieve(threadId, runId)
    return NextResponse.json({ retrieveRun, success: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
