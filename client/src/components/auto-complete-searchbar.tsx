import { cn } from "@/lib/utils";
import {
  ChevronDownIcon,
  FilmIcon,
  SearchIcon,
  TvMinimalIcon,
  UsersRoundIcon,
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const AutoCompleteSearchbar = () => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("All");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={cn(
        "flex h-8 w-full max-w-166 min-w-28 rounded-[3px] border-3 border-white",
        isFocused && "border-custom-yellow-100",
      )}
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button className="font-roboto flex w-fit cursor-pointer items-center gap-1 rounded-none border-r-1 border-stone-300 bg-white px-3 py-1 text-base font-semibold text-black">
            <p className="whitespace-nowrap">{type}</p>
            <ChevronDownIcon
              className={cn(
                "size-4 text-black transition-all duration-200",
                open && "rotate-180",
              )}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="font-roboto h-full w-58 rounded-xs border-0 bg-gray-800 px-0 py-2 font-normal"
          align="start"
        >
          <DropdownMenuItem className="p-0 text-base">
            <div className="flex w-full bg-gray-800">
              <button
                className={cn(
                  "group flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left text-white hover:bg-white/10 active:bg-white/30",
                  type === "All" && "text-custom-yellow-100",
                )}
                onClick={() => setType("All")}
              >
                <SearchIcon
                  className={cn(
                    "size-5 text-stone-400 group-hover:text-white",
                    type === "All" &&
                      "text-custom-yellow-100 group-hover:text-custom-yellow-100",
                  )}
                  strokeWidth={2.3}
                />
                All
              </button>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 text-base">
            <div className="flex w-full bg-gray-800">
              <button
                className={cn(
                  "group flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left text-white hover:bg-white/10 active:bg-white/30",
                  type === "Titles" &&
                    "text-custom-yellow-100 group-hover:text-custom-yellow-100",
                )}
                onClick={() => setType("Titles")}
              >
                <FilmIcon
                  className={cn(
                    "size-5 text-stone-400 group-hover:text-white",
                    type === "Titles" &&
                      "text-custom-yellow-100 group-hover:text-custom-yellow-100",
                  )}
                  strokeWidth={2.3}
                />
                Titles
              </button>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 text-base">
            <div className="flex w-full bg-gray-800">
              <button
                className={cn(
                  "group flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left text-white hover:bg-white/10 active:bg-white/30",
                  type === "TV episodes" &&
                    "text-custom-yellow-100 group-hover:text-custom-yellow-100",
                )}
                onClick={() => setType("TV episodes")}
              >
                <TvMinimalIcon
                  className={cn(
                    "size-5 text-stone-400 group-hover:text-white",
                    type === "TV episodes" &&
                      "text-custom-yellow-100 group-hover:text-custom-yellow-100",
                  )}
                  strokeWidth={2.3}
                />
                TV episodes
              </button>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="p-0 text-base">
            <div className="flex w-full bg-gray-800">
              <button
                className={cn(
                  "group flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left text-white hover:bg-white/10 active:bg-white/30",
                  type === "Celebs" &&
                    "text-custom-yellow-100 group-hover:text-custom-yellow-100",
                )}
                onClick={() => setType("Celebs")}
              >
                <UsersRoundIcon
                  className={cn(
                    "size-5 text-stone-400 group-hover:text-white",
                    type === "Celebs" &&
                      "text-custom-yellow-100 group-hover:text-custom-yellow-100",
                  )}
                  strokeWidth={2.3}
                />
                Celebs
              </button>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        type="text"
        className="flex h-full w-full bg-white px-3 py-1 text-base outline-none"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <button className="flex cursor-pointer items-center justify-center bg-white px-2">
        <SearchIcon className="size-[18px] text-stone-500" strokeWidth={2.3} />
      </button>
    </div>
  );
};

export default AutoCompleteSearchbar;
