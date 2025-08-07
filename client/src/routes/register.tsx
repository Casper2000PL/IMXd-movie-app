import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import "@/assets/logo_icon.svg";
import { signIn } from "@/lib/auth-client";

export const Route = createFileRoute("/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const signInWithGoogle = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "http://localhost:5173/",
    });
  };

  return (
    <div className="max-xs:flex-col max-xs:px-4 container mx-auto flex max-w-7xl items-start justify-between gap-10 py-10">
      {/* right side content */}
      <div className="flex h-full w-full flex-3 flex-col gap-4">
        <div className="flex items-center justify-start gap-3">
          <div className="bg-custom-yellow-100 h-8 w-1 rounded-full" />
          <h1 className="font-roboto text-3xl font-bold text-black max-sm:text-2xl">
            Sign in
          </h1>
        </div>
        <Link
          to="/sign-up"
          className="bg-custom-yellow-100 hover:bg-custom-yellow-300 rounded-4xl py-4 text-center text-sm font-semibold text-black transition-all duration-200"
        >
          Create an account
        </Link>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-15 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="text-muted-foreground relative z-10 bg-white px-2">
            or
          </span>
        </div>
        {/* social sign in */}
        <div className="flex w-full flex-col gap-4">
          <Link to="/sign-in" className="w-full">
            <Button className="flex w-full items-center justify-start gap-5 rounded-4xl border-1 border-black bg-white py-6.5 font-semibold text-black transition-all duration-200 hover:bg-slate-200 hover:text-black">
              <img
                src="logo_icon.svg"
                alt="IMXd Logo"
                className="text-destructive inline size-8"
              />
              <p className="">Sign in with IMXd</p>
            </Button>
          </Link>
          <Button
            className="flex items-center justify-start gap-5 rounded-4xl border-1 border-black bg-white py-6.5 font-semibold text-black transition-all duration-200 hover:bg-stone-200 hover:text-black active:bg-stone-300"
            onClick={signInWithGoogle}
          >
            <span className="inline-flex w-8">
              <svg
                className="size-8"
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M45.12 24.5C45.12 22.94 44.98 21.44 44.72 20H24V28.52H35.84C35.32 31.26 33.76 33.58 31.42 35.14V40.68H38.56C42.72 36.84 45.12 31.2 45.12 24.5Z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M23.9994 46C29.9394 46 34.9194 44.04 38.5594 40.68L31.4194 35.1399C29.4594 36.4599 26.9594 37.2599 23.9994 37.2599C18.2794 37.2599 13.4194 33.4 11.6794 28.2H4.35938V33.88C7.97937 41.06 15.3994 46 23.9994 46Z"
                  fill="#34A853"
                ></path>
                <path
                  d="M11.68 28.1799C11.24 26.8599 10.98 25.4599 10.98 23.9999C10.98 22.5399 11.24 21.1399 11.68 19.8199V14.1399H4.36C2.86 17.0999 2 20.4399 2 23.9999C2 27.5599 2.86 30.8999 4.36 33.8599L10.06 29.4199L11.68 28.1799Z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M23.9994 10.76C27.2394 10.76 30.1194 11.88 32.4194 14.04L38.7194 7.74C34.8994 4.18 29.9394 2 23.9994 2C15.3994 2 7.97937 6.94 4.35938 14.14L11.6794 19.82C13.4194 14.62 18.2794 10.76 23.9994 10.76Z"
                  fill="#EA4335"
                ></path>
              </svg>
            </span>
            <p className="">Sign in with Google</p>
          </Button>
          <div className="text-muted-foreground text-sm">
            By signing in, you agree to IMDb's{" "}
            <a href="" className="underline">
              Conditions of Use
            </a>{" "}
            and{" "}
            <a href="" className="underline">
              Privacy Policy
            </a>
            .
          </div>
        </div>
      </div>
      {/* right side content */}
      <div className="flex h-full flex-5 flex-col gap-5">
        <h2 className="font-roboto text-2xl font-bold">
          It's so much better when you sign in
        </h2>
        <div className="flex flex-col gap-3">
          <div>
            <p className="font-roboto text-base font-semibold text-black">
              Personalized recommendations
            </p>
            <p className="text-muted-foreground font-roboto text-sm">
              Titles tailored to your taste.
            </p>
          </div>
          <div>
            <p className="font-roboto text-base font-semibold text-black">
              Your Watchlist
            </p>
            <p className="text-muted-foreground font-roboto text-sm">
              Track your future views and get reminders.
            </p>
          </div>
          <div>
            <p className="font-roboto text-base font-semibold text-black">
              Your ratings
            </p>
            <p className="text-muted-foreground font-roboto text-sm">
              Rate and remember what you watch.
            </p>
          </div>
          <div>
            <p className="font-roboto text-base font-semibold text-black">
              Contribute to IMXd
            </p>
            <p className="text-muted-foreground font-roboto text-sm">
              Add data that helps millions of fans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
