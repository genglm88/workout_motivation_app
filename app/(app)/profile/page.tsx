"use client"

import { fetchPresets, postAssistantId, savePresets } from "@/components/action"

import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import ChallengeLevel from "@/components/ChallengeLevel"
import { toast } from "sonner"
import SubmitButton from "@/components/SubmitButton"

const levels = [
  {
    id: "easy",
    level: "Easy",
    description:
      "This challenge level is for people who are new to programming.Receive 3 challenges per day (7:30AM, 12PM, & 5:30PM EST).",
  },
  {
    id: "medium",
    level: "Medium",
    description:
      "This challenge level is for people who are familiar with programming. Receive 4 challenges per day (7AM, 12PM, 5PM, & 8PM EST).",
  },
  {
    id: "hard",
    level: "Hard",
    description:
      "This challenge level is for people who are experienced with programming. Receive 5 challenges per day (6AM, 9AM, 12PM, 5PM, & 8PM EST).",
  },
]
function ProfilePage() {
  const [pushPreset, setPushPreset] = useState<boolean>(true)
  const [challengePreset, setChallengePreset] = useState<string>("easy")

  const router = useRouter()

  useEffect(() => {
    const loadPresets = async () => {
      const defaultPreset = await fetchPresets()
      if (defaultPreset) {
        setPushPreset(defaultPreset?.sendNotifications)
        setChallengePreset(defaultPreset.challengeId)
      }
    }
    loadPresets()
  }, [])

  useEffect(() => {
    router.refresh() // Refresh data after save
  }, [pushPreset, challengePreset])

  const handleSwitchChange = (checked: boolean) => {
    setPushPreset(checked)
  }

  const handleChallengeLevel = (levelId: string) => {
    setChallengePreset(levelId)
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <form
        // onSubmit={(e) => e.preventDefault()}
        action={async (data: FormData) => {
          router.refresh()
          try {
            await savePresets(data)
          } catch (error) {
            console.error("Save failed:", error)
            toast.error("Save failed:")
          } finally {
            toast.success("Preference saved.")
          }
        }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Challenge Level</h1>
          <SubmitButton statusPending="Saving..." statusFinished="Save" />
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="space-y-0.5">
            <h2 className="text-lg font-medium">Push Notifications</h2>
            <p className="text-muted-foreground">
              Receive push notifications when new challenges are available.
            </p>
          </div>
          <Switch
            className="bg-amber-500 data-[state=checked]:bg-amber-500"
            id="notifications-switch"
            aria-label="Push notifications toggle"
            name="pushNotifications" // Identifies the input in form submissions
            checked={pushPreset} // Controlled state
            onCheckedChange={handleSwitchChange} // Update state on toggle
            value={pushPreset ? "on" : "off"} // Explicit value
          />
          {/* //Add a hidden input to ensure the value is included in form data: */}
          <input
            type="hidden"
            name="pushNotifications"
            value={pushPreset ? "on" : "off"}
          />
        </div>

        <div className="space-y-4">
          {levels.map((level) => (
            <ChallengeLevel
              key={level.id}
              level={level.level}
              description={level.description}
              selected={level.id === challengePreset}
              onSelect={() => {
                handleChallengeLevel(level.id)
              }}
            />
          ))}
        </div>
        <input
          type="hidden"
          name="challengeId"
          value={challengePreset as string}
        />
      </form>

      <div className="flex text-xs items-center justify-end text-indigo-900/60 lg:gap-2 dark:bg-indigo-950 dark:text-indigo-200">
        <form
          action={async (data: FormData) => {
            const postingId = await postAssistantId(data)
            console.log(postingId)
            router.refresh()
          }}
          className="flex items-start lg:items-center gap-4"
        >
          <Input
            name="assistantId"
            defaultValue=""
            placeholder="Assistant Id"
          />
          <SubmitButton statusPending="Saving..." statusFinished="Save" />
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
