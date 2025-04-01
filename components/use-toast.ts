import { useState, useCallback } from "react"

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    ({ title, description, action }: Omit<Toast, "id">) => {
      setToasts((currentToasts) => [
        ...currentToasts,
        { id: Math.random().toString(36).substr(2, 9), title, description, action },
      ])
    },
    [setToasts],
  )

  const dismissToast = useCallback(
    (id: string) => {
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
    },
    [setToasts],
  )

  return {
    toasts,
    addToast,
    dismissToast,
  }
}

