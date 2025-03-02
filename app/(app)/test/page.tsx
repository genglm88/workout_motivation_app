"use client"

import React, { useEffect, useRef, useState } from "react"
import axios from "axios"

import { Input } from "@/components/ui/input"
import { getUserThread } from "@/components/action"
//import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { UserThread } from "@prisma/client"
import Spinner from "@/components/Spinner"

import SubmitButton from "@/components/SubmitButton"

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
  //const router = useRouter()
  const areaRef = useRef<HTMLInputElement>(null)
  // Add this ref at the top of your component
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
        const mesg = await axios.post<{ message: string; success: boolean }>(
          "/api/challenge-users",
          { challengeId: "medium", secret: "123456" }
        )
        console.log("message added  from caht completion  ", mesg)

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
