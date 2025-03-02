import React from "react"
import { Card, CardContent } from "./ui/card"
interface ChallengeLevelProps {
  level: string
  description: string
  selected: boolean
  onSelect: () => void
}

const ChallengeLevel = ({
  level,
  description,
  selected,
  onSelect,
}: ChallengeLevelProps) => {
  return (
    <Card
      className={selected ? "border-2 border-amber-200 bg-amber-50" : ""}
      onClick={onSelect}
    >
      <CardContent className="p-6">
        <h3
          className={`text-xl font-semibold mb-2 $(selected ? " text-amber-600" : "")`}
        >
          {level}
        </h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export default ChallengeLevel
