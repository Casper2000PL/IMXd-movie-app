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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Search, UserCircle, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Card, CardContent, CardHeader } from "./ui/card";

const formCrewSchema = z.object({
  personId: z.string().min(1, { message: "Person is required." }),
  role: z.enum(["producer", "actor", "director", "writer"]),
  characterName: z.string().optional(),
  creditOrder: z.number().int().min(0, "Credit order must be 0 or greater"),
});

type FormCrewValues = z.infer<typeof formCrewSchema>;

type Person = {
  id: string;
  name: string;
  biography: string | null;
  birthDate: string | null;
  profileImageUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

interface AddMemberFormProps<T = FormCrewValues> {
  onSubmit: (data: T) => Promise<void> | void;
  people: Person[];
  peopleLoading?: boolean;
  isPending?: boolean;
}

const AddMemberForm = ({
  onSubmit,
  people,
  peopleLoading,
  isPending,
}: AddMemberFormProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectPerson = (personId: string) => {
    formCrew.setValue("personId", personId);
    setShowDropdown(false);
    setSearchTerm("");
  };

  const formCrew = useForm<FormCrewValues>({
    resolver: zodResolver(formCrewSchema),
    defaultValues: {
      personId: "",
      role: "actor",
      characterName: "",
      creditOrder: 1,
    },
  });

  const watchedRole = formCrew.watch("role");
  const watchedPersonId = formCrew.watch("personId");

  // Find selected person
  const selectedPerson = useMemo(() => {
    return people.find((p) => p.id === watchedPersonId);
  }, [people, watchedPersonId]);

  // Filter people based on search
  const filteredPeople = useMemo(() => {
    if (!searchTerm) return people;
    return people.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [people, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Card className="border-2 border-stone-200 px-4 py-10">
      <CardHeader className="text-xl font-bold">
        Add new cast or crew member
      </CardHeader>
      <CardContent>
        <Form {...formCrew}>
          <form
            onSubmit={formCrew.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Person Search */}
            <FormField
              control={formCrew.control}
              name="personId"
              render={() => (
                <FormItem>
                  <FormLabel>Search Person *</FormLabel>
                  <FormControl>
                    <div className="relative" ref={dropdownRef}>
                      {selectedPerson ? (
                        <div className="bg-custom-yellow-100/60 border-custom-yellow-300 flex items-center gap-3 rounded-lg border-2 p-3">
                          {selectedPerson.profileImageUrl ? (
                            <img
                              src={selectedPerson.profileImageUrl}
                              alt={selectedPerson.name}
                              className="size-10 rounded-full object-cover object-top"
                            />
                          ) : (
                            <div className="flex size-10 items-center justify-center rounded-full">
                              <UserCircle className="size-8 text-gray-300" />
                            </div>
                          )}
                          <span className="flex-1 font-medium">
                            {selectedPerson.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              formCrew.setValue("personId", "");
                              setSearchTerm("");
                            }}
                            className="cursor-pointer text-red-500 hover:text-red-500/60"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Search
                            className="absolute top-3.5 left-3 text-gray-400"
                            size={20}
                          />
                          <Input
                            type="text"
                            placeholder="Search for a person..."
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            className="bg-white py-6 pl-10 text-black"
                            disabled={peopleLoading}
                          />
                          {showDropdown && (
                            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg">
                              {peopleLoading ? (
                                <div className="flex justify-center p-4">
                                  <Loader className="size-5 animate-spin" />
                                </div>
                              ) : filteredPeople.length > 0 ? (
                                filteredPeople.map((person) => (
                                  <button
                                    key={person.id}
                                    type="button"
                                    onClick={() => selectPerson(person.id)}
                                    className="hover:bg-custom-yellow-100/60 flex w-full cursor-pointer items-center gap-3 border-b-1 border-stone-200 px-4 py-3 text-left transition-colors last:border-b-0"
                                  >
                                    {person.profileImageUrl ? (
                                      <img
                                        src={person.profileImageUrl}
                                        alt={person.name}
                                        className="size-10 rounded-full object-cover object-top"
                                      />
                                    ) : (
                                      <div className="flex size-10 items-center justify-center rounded-full bg-gray-600">
                                        <UserCircle className="size-8 text-gray-400" />
                                      </div>
                                    )}
                                    <span className="font-medium">
                                      {person.name}
                                    </span>
                                  </button>
                                ))
                              ) : (
                                <p className="px-4 py-3 text-center text-gray-400">
                                  No people found
                                </p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role, Character Name, Credit Order */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={formCrew.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white text-black">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="actor">Actor</SelectItem>
                        <SelectItem value="director">Director</SelectItem>
                        <SelectItem value="producer">Producer</SelectItem>
                        <SelectItem value="writer">Writer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedRole === "actor" && (
                <FormField
                  control={formCrew.control}
                  name="characterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Character Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Neo"
                          {...field}
                          className="bg-white text-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={formCrew.control}
                name="creditOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        className="bg-white text-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="bg-custom-yellow-100 hover:bg-custom-yellow-300 mt-5 w-full px-8 py-5 font-semibold text-black"
              disabled={isPending || !formCrew.formState.isValid}
            >
              {isPending ? <Loader className="size-4 animate-spin" /> : "Add"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddMemberForm;
