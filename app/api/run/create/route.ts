import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(req: NextRequest) {
  const { threadId, assistantId } = await req.json()
  console.log("from user ", { threadId, assistantId })
  if (!threadId || !assistantId) {
    return NextResponse.json(
      { message: "Invalid request", success: false },
      { status: 400 }
    )
  }
  const openai = new OpenAI()
  try {
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    })
    if (!run) {
      return NextResponse.json(
        { message: "Run not found", success: false },
        { status: 404 }
      )
    }
    // const retrieveRun = await openai.beta.threads.runs.retrieve(
    //   threadId,
    //   run.id
    // )
    return NextResponse.json({ run, success: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
