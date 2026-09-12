"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true);
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      toast.error("Invalid email or password.");
      return;
    }

    toast.success("Welcome back!");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background px-4">
      <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full bg-accent/15 blur-3xl" />

      <Card className="w-full max-w-sm border-border/60 shadow-xl animate-in relative backdrop-blur-sm">
        <CardHeader className="items-center text-center">
          <span className="mb-2 flex size-16 items-center justify-center rounded-full bg-background shadow-md ring-1 ring-primary/20">
            <Image
              src="/MIDSALIP.png"
              alt="Municipality of Midsalip seal"
              width={56}
              height={56}
              className="size-14 rounded-full object-contain"
              priority
            />
          </span>
          <CardTitle className="text-xl">Midsalip LGU</CardTitle>
          <CardDescription>Franchise Monitoring System</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon>
                          <Mail />
                        </InputGroupAddon>
                        <InputGroupInput
                          placeholder="name@midsalip.gov.ph"
                          autoComplete="email"
                          {...field}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon>
                          <Lock />
                        </InputGroupAddon>
                        <InputGroupInput
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          {...field}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            type="button"
                            size="icon-xs"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowPassword((v) => !v)}
                          >
                            {showPassword ? <EyeOff /> : <Eye />}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                Sign in
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <p className="pointer-events-none absolute bottom-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Municipality of Midsalip. All rights reserved.
      </p>
    </div>
  );
}

