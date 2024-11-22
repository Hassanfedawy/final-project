import { toast as sonnerToast } from "sonner"

interface ToastProps {
  message: string
  type?: "success" | "error" | "info"
}

const toast = {
  success: (message: string) => {
    sonnerToast.success(message)
  },
  error: (message: string) => {
    sonnerToast.error(message)
  },
  info: (message: string) => {
    sonnerToast.info(message)
  },
}

export default toast
