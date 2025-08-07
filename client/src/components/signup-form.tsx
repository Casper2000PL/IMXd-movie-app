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

import { signUp } from "@/lib/auth-client";
import { Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted with values:", values);

    await signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.username,
        callbackURL: "/",
      },
      {
        onRequest: () => setIsLoading(true),
        onSuccess: (ctx) => {
          console.log("Signed up successfully: ", ctx.data);
          router.navigate({ to: "/" });
        },
        onError: (ctx) => {
          console.error("Sign up failed:", ctx.error);

          setIsLoading(false);

          toast("Sign up failed", {
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
          <CardTitle className="text-xl">Welcome to IMXd</CardTitle>
          <p className="text-muted-foreground text-center text-sm">
            Create an account to enjoy all the features of IMXd.
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
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
                      "Sign up"
                    )}
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/sign-in" className="underline underline-offset-4">
                    Sign in
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
