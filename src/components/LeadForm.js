"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

import { createDirectus, rest, readItems, createItem } from "@directus/sdk"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number" }),
})

export default function LeadForm(props) {

  console.log("PROPS",props)
  const affiliate_id = props.affiliateId
  const offer_id = props.offerId
  const api_key = "d1105af97f2fe691f71b1efddfac039e59f96f58"
  const affiliate_link = props.affiliateUrl
  const client = createDirectus(process.env.CMS_URL, {
    fetchOptions: {
      mode: "cors",
    },
  }).with(rest());

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [clickId, setClickId] = useState(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (isSubmitted) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)

      if (countdown === 0) {
        clearInterval(timer)
        router.push(`${affiliate_link}${clickId}`)
      }

      return () => clearInterval(timer)
    }
  }, [isSubmitted, countdown, router])

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // Check for duplicate email
      const existingLeads = await client.request(readItems("leads", {
        filter: {
          _or: [
            { email: { _eq: data.email } },
            { phone: { _eq: data.phone } },
          ],
        },
      }));

      if (existingLeads.length > 0) {
        toast({
          title: "Duplicate Email",
          description: "This email is already registered. Please use a different email.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const scalioResponse = await fetch(`https://affiliatescfx.scaletrk.com/api/v2/network/tracker/click?api-key=${api_key}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          affiliate_id: affiliate_id.toString(),
          offer_id: offer_id.toString(),
        }),
      })

      if (!scalioResponse.ok) {
        throw new Error("Failed to communicate with Scalio API")
      }

      const scalioData = await scalioResponse.json()
      const clickID = scalioData?.info?.click_id

      if (clickID) {
        setClickId(clickID)

        await client.request(createItem("leads", {
          name: data.name,
          email: data.email,
          phone: data.phone,
          clickId: clickID,
          status: "lead",
        }));

        toast({
          title: "Success!",
          description: "Your information has been submitted. We'll be in touch soon!",
        })

        setIsSubmitted(true)
      } else {
        throw new Error("Click ID not found")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-4 bg-muted p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Success</h2>
        <p>Thanks! You'll be redirected to the operator in {countdown} seconds.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-muted px-10 lg:mx-10 py-10 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Sign Up for Cashback now!</h2>
      <div>
        <Input {...register("name")} placeholder="Your Name" className={errors.email ? "border-red-500 py-4" : "py-6"} />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <Input
          {...register("email")}
          type="email"
          placeholder="Your Email"
          className={errors.email ? "border-red-500 py-4" : "py-6"}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <Input
          {...register("phone")}
          placeholder="Your Phone Number"
          className={errors.email ? "border-red-500 py-4" : "py-6"}
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full py-6">
        {isSubmitting ? "Submitting..." : "Get Started"}
      </Button>
    </form>
  )
}