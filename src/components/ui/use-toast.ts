"use client"

import * as React from "react"

import {
  type ToastProps,
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: ToastProps) => {
    setToasts((prev) => [...prev, toast])
    if (TOAST_LIMIT > 0 && toasts.length >= TOAST_LIMIT) {
      const first = toasts[0]
      if (first && first.id) dismissToast(first.id)
    }
  }, [toasts])

  const dismissToast = React.useCallback((id: string) => {
    toastTimeouts.set(
      id,
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
        toastTimeouts.delete(id)
      }, TOAST_REMOVE_DELAY)
    )
  }, [])

  return {
    toast: addToast,
    toasts,
    dismissToast,
  }
}

export { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport }

