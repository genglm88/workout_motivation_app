"use client"

import React, { useEffect, useRef, useState } from "react"
import axios from "axios"

import { Input } from "@/components/ui/input"
import {
  getAssistantId,
  getUserThread,
  sendUserMessage,
} from "@/components/action"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { UserThread } from "@prisma/client"
import Spinner from "@/components/Spinner"
import { Run } from "openai/resources/beta/threads/runs/runs.mjs"
import SubmitButton from "@/components/SubmitButton"
const PULLING_FREQUENCY_MS = 1000

interface ThreadMessage {
  id: string
  object: string
  created_at: number
  assistant_id: string | null
  thread_id: string
  run_id: string | null
  role: string
  content: Array<{
    type: string
    text: {
      value: string
    }
  }>
}

const ChatPage = () => {
  const [userThread, setUserThread] = useState<UserThread | null>(null)
  const [messages, setMessages] = useState<ThreadMessage[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const areaRef = useRef<HTMLInputElement>(null)
  // Add this ref at the top of your component
  const messagesEndRef = useRef<HTMLDivElement>(null)
  //const [assistantId, setAssistantId] = useState<string | null>(null)

  const fetchMessages = async ({ threadId }: { threadId: string | null }) => {
    if (!threadId) return

    try {
      setIsLoading(true)
      const messageList = await axios.post<{
        success: boolean
        error?: string
        data?: []
      }>("/api/message/list", { threadId })
      //validation
      const { success, error, data } = messageList.data
      if (!success || !data) {
        console.error(error ?? "internal error")
        return
      }

      // remove empty & odd messages
      const newMessages = data.filter(
        (message: ThreadMessage) =>
          message.content[0].type === "text" &&
          message.content[0].text.value.trim() !== ""
      )
      setMessages(newMessages)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast.error("Failed to load messages")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const returnedUserThread = await getUserThread()
        if (returnedUserThread) {
          setUserThread({
            ...returnedUserThread,
          })
        }
      } catch (error) {
        console.error("Error initializing chat:", error)
        toast.error("Failed to initialize chat")
      }
    }
    initializeChat()
  }, [])

  useEffect(() => {
    if (userThread?.threadId) {
      fetchMessages({ threadId: userThread.threadId })
    }
  }, [userThread?.threadId])

  // Add this useEffect hook
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const startRun = async ({ threadId }: { threadId: string }) => {
    const fetchedId = await getAssistantId()
    if (!fetchedId) return
    //setAssistantId(fetchedId)
    try {
      const {
        data: { success, run },
      } = await axios.post<{
        success: boolean
        error?: string
        run?: Run
      }>("/api/run/create", {
        threadId,
        assistantId: fetchedId,
      })

      if (!success || !run) {
        toast.error("Failed to run")
        return ""
      }
      return run.id
    } catch (error) {
      console.error("Error initializing run:", error)
      toast.error("Failed to run chat")
      return ""
    }
  }

  const retrieveRun = async ({
    threadId,
    runId,
  }: {
    threadId: string
    runId: string
  }) => {
    try {
      const {
        data: { success, retrieveRun, error },
      } = await axios.post<{
        success: boolean
        error?: string
        retrieveRun?: Run
      }>("/api/run/retrieve", {
        threadId,
        runId,
      })

      if (!success || !retrieveRun) {
        console.error(error)
        toast.error("Failed to  retrieve the run")
        return ""
      }
      return retrieveRun.status.toString()
    } catch (error) {
      console.error("Error initializing run:", error)
      toast.error("Failed to run chat")
      return ""
    }
  }

  const pullingRun = async ({
    threadId,
    runId,
  }: {
    threadId: string
    runId: string
  }) => {
    const intervalId = setInterval(async () => {
      const runStatusString = await retrieveRun({ threadId, runId })
      //console.log("runStatusMsg ", runStatusString)
      if (runStatusString === "completed") {
        fetchMessages({ threadId })
        clearInterval(intervalId)
      }
    }, PULLING_FREQUENCY_MS)
  }

  return (
    <div className="w-screen h-screen  bg-indigo-950 text-indigo-50/80">
      <div className=" max-w-xs sm:max-w-lg md:max-w-3xl mx-auto h-screen flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 pb-24 scrollbar-padded">
            {messages.length === 0 ? (
              <div className="text-center text-indigo-400">No messages yet</div>
            ) : (
              <>
                {messages.map((msg) => (
                  <pre key={msg.id}>{JSON.stringify(msg, null, 2)}</pre>
                ))}
                {messages.map((msg) => (
                  <div
                    className={
                      msg.role === "user"
                        ? "mb-4 p-3 bg-indigo-900 rounded-lg w-fit ml-auto"
                        : "mb-4 p-3 bg-indigo-900 rounded-lg text-yellow-500"
                    }
                    key={msg.id}
                  >
                    <p className="text-sm">{msg.content[0]?.text.value}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        )}
      </div>

      {/* <!-- Fixed bottom element --> */}
      <div className="fixed bottom-0 max-w-xs sm:max-w-lg md:max-w-3xl w-full left-1/2 -translate-x-1/2 rounded-xl  p-4 bg-indigo-800 z-10">
        <form
          action={async (data: FormData) => {
            try {
              const promise = sendUserMessage(data)

              toast.promise(promise, {
                loading: "Sending message ...",

                success: async (res) => {
                  if (res && typeof res === "object" && "newUserThread" in res)
                    setUserThread(res.newUserThread as UserThread)

                  if (userThread) {
                    const currentRunId = await startRun({
                      threadId: userThread?.threadId,
                    })
                    if (currentRunId) {
                      await pullingRun({
                        threadId: userThread?.threadId,
                        runId: currentRunId,
                      })
                    }
                  }
                  return "Message sent!"
                },

                error: (error) => error.message || "Failed to send message",
              })
              await promise
              if (areaRef.current) {
                areaRef.current.value = ""
              }
              router.refresh()
            } catch (error) {
              // Handle errors gracefully

              toast.error(
                error instanceof Error
                  ? error.message
                  : "An unexpected error occurred"
              )
            }
          }}
          className="p-2 bg-indigo-200 rounded-lg flex gap-2 text-indigo-900"
          //
        >
          <Input
            placeholder="Type a message"
            name="inputMessage"
            ref={areaRef}
          />
          <input
            className="hidden"
            name="threadId"
            defaultValue={userThread?.threadId}
          />
          <SubmitButton statusPending="Sending..." statusFinished="Send" />
        </form>
      </div>
    </div>
  )
}

export default ChatPage
