import { useFormStatus } from "react-dom"
import { Button } from "./ui/button"

export default function SubmitButton({
  statusPending,
  statusFinished,
}: {
  statusPending: string
  statusFinished: string
}) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      variant="default"
      disabled={pending}
      className="bg-indigo-900/90 text-white hover:bg-indigo-900"
    >
      {pending ? statusPending : statusFinished}
    </Button>
  )
}
