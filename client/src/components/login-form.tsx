import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { signIn } from "@/lib/auth-client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted with values:", values);

    await signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/",
      },
      {
        onRequest: () => setIsLoading(true),
        onSuccess: (ctx) => {
          console.log("Signed in successfully: ", ctx.data);
        },
        onError: (ctx) => {
          console.error("Sign in failed:", ctx.error);

          setIsLoading(false);

          toast("Sign in failed", {
            description: ctx.error.message as string,
            duration: 1500,
            icon: "❌",
          });
        },
      },
    );

    form.reset();
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-xl">
        <CardHeader className="flex w-full flex-col items-center justify-between gap-5">
          <Link to="/">
            <div className="bg-custom-yellow-100 flex h-8 w-16 items-center justify-center rounded-sm">
              <p
                className="font-impact text-lg font-normal tracking-wide text-black"
                style={{
                  transform: "scaleY(1.25) scaleX(1.25)",
                  alignContent: "center",
                }}
              >
                IMXd
              </p>
            </div>
          </Link>
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <p className="text-muted-foreground text-center text-sm">
            Enter your credentials to access your account.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-6">
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="password"
                              type="password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center">
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link to="/sign-up" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
