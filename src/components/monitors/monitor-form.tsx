"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const monitorFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  checkInterval: z.string().min(1, {
    message: "Please select a check interval.",
  }),
  alertThreshold: z.string().min(1, {
    message: "Please select an alert threshold.",
  }),
})

type MonitorFormValues = z.infer<typeof monitorFormSchema>

const defaultValues: MonitorFormValues = {
  name: "",
  url: "",
  checkInterval: "5",
  alertThreshold: "2",
}

interface MonitorFormProps {
  onSubmit: (data: MonitorFormValues) => Promise<void>
  initialData?: MonitorFormValues
}

export function MonitorForm({ onSubmit, initialData }: MonitorFormProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const { data: session } = useSession()

  const form = useForm<MonitorFormValues>({
    resolver: zodResolver(monitorFormSchema),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  })

  async function handleSubmit(data: MonitorFormValues) {
    try {
      if (!session?.user?.id) {
        throw new Error("You must be logged in to create a monitor")
      }

      setIsLoading(true)
      
      // Get the base URL from the window location
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/monitors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          userId: session.user.id,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to save monitor")
      }

      await onSubmit(data)
      toast.success("Monitor saved successfully")
      form.reset(defaultValues)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="My Website" {...field} />
              </FormControl>
              <FormDescription>
                A friendly name to identify your monitor.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormDescription>
                The URL you want to monitor. Must include http:// or https://.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="checkInterval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Check Interval</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
                defaultValue={defaultValues.checkInterval}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select check interval" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">Every minute</SelectItem>
                  <SelectItem value="5">Every 5 minutes</SelectItem>
                  <SelectItem value="10">Every 10 minutes</SelectItem>
                  <SelectItem value="15">Every 15 minutes</SelectItem>
                  <SelectItem value="30">Every 30 minutes</SelectItem>
                  <SelectItem value="60">Every hour</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How often should we check your website?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="alertThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alert Threshold</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
                defaultValue={defaultValues.alertThreshold}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select alert threshold" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">After 1 failure</SelectItem>
                  <SelectItem value="2">After 2 failures</SelectItem>
                  <SelectItem value="3">After 3 failures</SelectItem>
                  <SelectItem value="5">After 5 failures</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How many failed checks before sending an alert?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            "Save Monitor"
          )}
        </Button>
      </form>
    </Form>
  )
}
