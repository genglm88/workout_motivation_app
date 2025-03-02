import { prisma } from "@/app/utils/db"
import { UserThread } from "@prisma/client"
import axios from "axios"
import { NextResponse } from "next/server"
import OpenAI from "openai"

interface UserThreadMap {
  [userId: string]: UserThread
}

export async function POST(request: Request) {
  const { challengeId, secret } = await request.json()
  //validation
  console.log("challengeId", challengeId)
  console.log("secret", secret)

  if (!challengeId || !secret) {
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 }
    )
  }

  if (secret.toString() != process.env.APP_SECRET_KEY?.toString()) {
    return NextResponse.json(
      { sucess: false, message: "Unauthorized" },
      { status: 401 }
    )
  }

  // define work out message prompt
  //define messsages: type annotation
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "Generate an ultra-intense, hard-hitting motivational message, followed by a concise, bullet-pointed, no-equipment-needed workout plan. The time of day provided should be taken into account. This output should strictly contain two parts: first, a motivational message in the style of David Goggins, as depicted in Jesse Itzler's 'Living with a SEAL', but even more extreme. The message must be direct, confrontational, and incorporate Goggins' known phrases like 'poopy pants', 'stay hard', and 'taking souls'. The second part should be a workout list: intense, high-impact exercises that can be done anywhere, designed to be completed within 10 minutes. The output must only include these two components, nothing else. Here's an example output that you should follow: Time to get hard! No more excuses, no more poopy pants attitude. You're stronger than you think. Stay hard, take souls, and crush this morning with everything you've got. You have 10 minutes to obliterate this workout. This is your battlefield, and you're the warrior. Let's make every second count! - 30 Burpees – explode with every jump - 40 Jumping Jacks – faster, push your limits - 50 Mountain Climbers – relentless pace - 60 High Knees – drive them up with fury - 2 Minute Plank – solid and unyielding",
    },
    {
      role: "user",
      content:
        "Generate a new David Goggins workout. Remember, only respond in the format specified earlier. Nothing else",
    },
  ]

  //use opai to generate workout message
  const {
    data: { message, success },
  } = await axios.post<{ message?: string; success: boolean }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/openai`,
    {
      messages,
      secret: process.env.APP_SECRET_KEY,
    }
  )

  if (!success || !message) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    )
  }

  // grab aal challenge preferences
  const challengePreferences = await prisma.challengePreferences.findMany({
    where: {
      challengeId,
    },
  })

  // get users with this challenge level
  const userIds = challengePreferences.map((cp) => cp.userId)
  const userThreads = await prisma.userThread.findMany({
    where: {
      userId: { in: userIds },
    },
  })

  const userThreadMap: UserThreadMap = userThreads.reduce(
    (threadIdMap, thread) => {
      threadIdMap[thread.userId] = thread
      return threadIdMap
    },
    {} as UserThreadMap
  )
  // const userThreadMap :UserThreadMap = userThreads.reduce((map,thread) => {
  //   map[thread.userId] = thread
  // return map}, {} as UserThreadMap)

  //add messages to threads
  const threadPromises: Promise<unknown>[] = []
  try {
    challengePreferences.forEach((cp) => {
      //Find the respective user
      const userThread = userThreadMap[cp.userId]

      if (userThread) {
        threadPromises.push(
          axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/message/create`, {
            message,
            threadId: userThread.threadId,
            role: "assistant",
          })
        )
      }
    })

    await Promise.all(threadPromises)
    return NextResponse.json({ success: true, message }, { status: 201 })
  } catch (error) {
    console.error("Error sending messages:", error)
    return NextResponse.json(
      { success: false, message: "Failed to send messages" },
      { status: 500 }
    )
  }
}
