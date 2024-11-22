"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { useRouter } from "next/navigation"

const monitorFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  url: z.string()
    .min(1, { message: "URL is required" })
    .refine(
      (url) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid URL including http:// or https://" }
    ),
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
  userId: string
  initialData?: MonitorFormValues
}

export function MonitorForm({ userId, initialData }: MonitorFormProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()

  const form = useForm<MonitorFormValues>({
    resolver: zodResolver(monitorFormSchema),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  })

  async function handleSubmit(data: MonitorFormValues) {
    try {
      setIsLoading(true)
      
      // Ensure URL has protocol
      let url = data.url.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }
      
      // Create the request data
      const requestData = {
        name: data.name.trim(),
        url,
        checkInterval: data.checkInterval,
        alertThreshold: data.alertThreshold,
        userId: userId
      }
      
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/monitors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        credentials: "include",
      })

      const responseData = await response.json()

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Failed to save monitor")
      }

      toast.success(responseData.message || "Monitor saved successfully")
      
      // Reset form and redirect
      form.reset(defaultValues)
      router.push('/dashboard/monitors')
    } catch (error) {
      console.error("Error saving monitor:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save monitor")
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
          {isLoading ? "Saving..." : "Save monitor"}
        </Button>
      </form>
    </Form>
  )
}