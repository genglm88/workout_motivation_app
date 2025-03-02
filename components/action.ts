"use server"
import { prisma } from "@/app/utils/db"
import { currentUser } from "@clerk/nextjs/server"
import { UserThread } from "@prisma/client"
import OpenAI from "openai"
import { z } from "zod"

export async function postAssistantId(data: FormData) {
  const assistantId = data.get("assistantId")?.toString().trim()
  if (!assistantId) {
    throw new Error("Assistant Id is required")
  }
  try {
    const postingDoc = await prisma.assistant.create({
      data: { assistantId },
    })
    return postingDoc.id
  } catch (error) {
    console.error("Error creating assistant Id:", error)
    throw new Error("Failed to create the assistant Id. Please try again.")
  }
}

export async function getUserId() {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error("User not found")
    }
    return user
  } catch (error) {
    console.error("Error getting user Id:", error)
    throw new Error("Failed to get the User Id. Not authoried.")
  }
}

export async function createThread() {
  try {
    const openai = new OpenAI()
    const userThread = await openai.beta.threads.create()
    return userThread
  } catch (error) {
    return {
      message: "Internal Server Error - error creating thread with openAI",
      error: (error as Error).message,
      status: 500,
    }
  }
}

export async function getUserThread() {
  try {
    const currentUser = await getUserId()

    if (!currentUser || !currentUser.id) {
      throw new Error("User ID not found.")
    }
    const tempUserThread = await prisma.userThread.findFirst({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1, //limit to 1 result
    })
    console.log("userThreadId ", tempUserThread)
    if (tempUserThread) {
      return tempUserThread
    }

    //if no threadId found in the databse, creat a new thread, save it to dstebase

    const thread = await createThread()

    if (!thread || "error" in thread) {
      throw new Error("Failed to create OpenAI thread.")
    }
    return await prisma.userThread.create({
      data: { userId: currentUser.id, threadId: thread.id },
    })
  } catch (error) {
    console.error("Error getting user thread:", error)
    throw new Error("Failed to get user thread. Please try again.")
  }
}

export async function sendUserMessage(data: FormData) {
  const message = data.get("inputMessage") as string

  const threadId = data.get("threadId") as string
  if (!message?.trim()) throw new Error("Message content is required")
  if (!threadId) throw new Error("Thread ID is required")
  console.log("thredId ", threadId)
  console.log("message ", message)
  const openai = new OpenAI()
  try {
    const res = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    })
    console.log(res)
  } catch (error: unknown) {
    // Handle thread not found error specifically
    const err = error as { status?: number; message?: string }
    if (err.status === 404 || err.message?.includes("No thread found")) {
      console.warn("Thread not found, creating a new thread...")
      // Create new thread if existing one isn't found
      try {
        const newUserThread = (await getUserThread()) as UserThread
        // Add message to new thread
        await openai.beta.threads.messages.create(newUserThread?.id, {
          role: "user",
          content: message,
        })

        // Return both message and new user thread  for client-side handling
        return {
          newUserThread,
        }
      } catch (createError) {
        console.error("Failed to create a new thread:", createError)
        throw new Error("Failed to create a new thread. Please try again.")
      }
    }
    console.error("Error posting message:", error)
    throw new Error("Failed to post message. Please try again.")
  }
}

export async function getAssistantId() {
  try {
    const assistant = await prisma.assistant.findFirst({})
    if (!assistant) throw new Error("No assistant Id found")
    return assistant.assistantId
  } catch (error) {
    console.error("Error getting assistant Id:", error)
    throw new Error("Failed to get assistant Id. Please try again.")
  }
}

export async function fetchPresets() {
  try {
    const userId = await getUserId()

    const preset = await prisma.challengePreferences.findFirst({
      where: { userId: userId.id },
    })
    if (!preset) {
      //create a default preset in db

      try {
        const defaultPreset = await prisma.challengePreferences.create({
          data: { userId: userId.id, challengeId: "easy" },
        })
        return defaultPreset
      } catch (err) {
        console.error("Error saving presets:", err)
        throw new Error("Failed to save preset. Please try again.")
      }
    }

    return preset
  } catch (error) {
    console.error("Error getting assistant Id:", error)
    throw new Error("Failed to get assistant Id. Please try again.")
  }
}

// Schema definition
const schema = z.object({
  challengeId: z.enum(["easy", "medium", "hard"]),
  pushNotifications: z.boolean(),
})

export async function savePresets(data: FormData) {
  try {
    // Use the parsed data instead of manual validation
    const parsed = schema.parse({
      challengeId: data.get("challengeId"),
      pushNotifications: data.get("pushNotifications") === "on",
    })

    const user = await getUserId()

    await prisma.challengePreferences.update({
      where: { userId: user.id },
      data: {
        challengeId: parsed.challengeId,

        sendNotifications: parsed.pushNotifications,
      },
    })
  } catch (error) {
    console.error("Error saving challenge settings:", error)
    if (error instanceof z.ZodError) {
      throw new Error(
        "Invalid form data: " + error.errors.map((e) => e.message).join(",")
      )
    }
    throw new Error("Failed to saving challenge settings. Please try again.")
  }
}
