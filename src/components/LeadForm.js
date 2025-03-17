"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number" }),
});

export default function LeadForm({
  offerId,
  affiliateId,
  slug,
  affiliateUrl,
  formTitle,
  successLabel = "Success",
  nameLabel = "Your Name",
  emailLabel = "Your Email",
  mobileLabel = "Your Phone Number",
  buttonLabel = "Get Started",
  submittingLabel = "Submitting...",
  redirectLabel = "Thanks! You'll be redirected to the operator in",
}) {
  const api_key = "d1105af97f2fe691f71b1efddfac039e59f96f58";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [clickId, setClickId] = useState(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isSubmitted) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      if (countdown === 0) {
        clearInterval(timer);
        router.push(`${affiliateUrl}${clickId}`);
      }

      return () => clearInterval(timer);
    }
  }, [isSubmitted, countdown, router, affiliateUrl, clickId]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          affiliateId,
          offerId,
          affiliateLink: affiliateUrl,
          apiKey: api_key,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "There was a problem submitting your information. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const responseData = await response.json();
      setClickId(responseData.clickId);
      setIsSubmitted(true);

      toast({
        title: "Success!",
        description: "Your information has been submitted. We'll be in touch soon!",
      });

    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-4 bg-muted p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">{successLabel}</h2>
        <p>{redirectLabel}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-muted px-10 lg:mx-10 py-10 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{formTitle}</h2>
      <div>
        <Input {...register("name")} placeholder={nameLabel} className={errors.name ? "border-red-500 py-4" : "py-6"} />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <Input
          {...register("email")}
          type="email"
          placeholder={emailLabel}
          className={errors.email ? "border-red-500 py-4" : "py-6"}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <Input
          {...register("phone")}
          placeholder={mobileLabel}
          className={errors.phone ? "border-red-500 py-4" : "py-6"}
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full py-6">
        {isSubmitting ? submittingLabel : buttonLabel}
      </Button>
    </form>
  );
}
