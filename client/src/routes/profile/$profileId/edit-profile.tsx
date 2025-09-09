import { getUserById } from "@/api/user";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ChevronLeftIcon,
  Trash2Icon,
  UploadIcon,
  User2Icon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";

export const Route = createFileRoute("/profile/$profileId/edit-profile")({
  component: RouteComponent,

  beforeLoad: ({ params }) => {
    if (!params.profileId) {
      throw redirect({
        to: "/",
      });
    }
  },
  loader: async ({ params }) => {
    const profileInfo = await getUserById(params.profileId);
    return { profileInfo };
  },
});

const formSchema = z.object({
  username: z.string().min(2).max(50),
  //bio: z.string().max(160).optional(),
});

function RouteComponent() {
  const { profileInfo } = Route.useLoaderData();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profileInfo.name,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <div className="w-full">
      <div className="w-full bg-gray-800">
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <Link
            to=".."
            className="group hover:text-custom-yellow-300 font-roboto flex items-center gap-1 font-semibold text-white"
          >
            <ChevronLeftIcon className="group-hover:text-custom-yellow-300 size-6 text-white" />
            Back
          </Link>
          <h1 className="mt-8 font-sans text-4xl font-medium text-white">
            Edit profile
          </h1>
        </div>
      </div>
      <div className="w-full">
        <div className="mx-auto w-full max-w-7xl px-4 py-8">
          <div className="xs:flex-row mb-10 flex w-full flex-col items-center justify-start gap-10">
            {profileInfo.image ? (
              <img
                src={profileInfo.image}
                alt="Profile Picture"
                className="size-20 rounded-full lg:size-35"
              />
            ) : (
              <div className="rounded-full bg-white/5 p-6">
                <User2Icon className="size-23 text-stone-500" />
              </div>
            )}
            <div className="flex w-full flex-col gap-4">
              <p className="text-sm text-gray-500">
                {profileInfo.image
                  ? "Change profile picture"
                  : "Upload profile picture"}
              </p>
              <div className="flex w-full flex-col gap-4 md:flex-row">
                <div className="w-fit">
                  <label className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-blue-500 bg-white px-4 py-2 text-sm font-bold text-blue-500 transition hover:bg-blue-300/20">
                    <UploadIcon size={16} strokeWidth={3} />
                    Choose image
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg"
                    />
                  </label>
                </div>
                <button className="hover:bg-destructive/10 text-destructive flex w-fit cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold transition">
                  <Trash2Icon size={16} strokeWidth={2.5} />
                  Delete image
                </button>
              </div>
            </div>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-sm space-y-6"
            >
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
                    <Button type="submit" className="mt-6">
                      Save
                    </Button>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
