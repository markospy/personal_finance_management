import { AlertCircle } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

interface Props {
    msg: string
    className?: string
}

export function AlertDestructive({msg, className}:Props) {
  return (
    <Alert variant="destructive" className={className ? `${className}` : ''}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
          {msg}
      </AlertDescription>
    </Alert>
  )
}
