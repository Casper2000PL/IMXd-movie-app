import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { Separator } from "./ui/separator";

const AddToWatchlistBtn = () => {
  return (
    <div className="bg-custom-yellow-100 flex h-12 w-full items-center overflow-hidden rounded-full">
      <button className="bg-custom-yellow-100 hover:bg-custom-yellow-300 flex h-full flex-1 cursor-pointer items-center px-3 transition-all duration-200">
        <PlusIcon className="text-black" />
        <div className="ml-2">
          <p className="text-left font-sans text-sm font-semibold text-black">
            Add to my Watchlist
          </p>
          {/* TODO: Replace with actual number of users who added to watchlist */}
          <p className="text-left font-sans text-xs font-medium text-black">
            Added by 9.5k users
          </p>
        </div>
      </button>
      <Separator orientation="vertical" className="w-[1.5px]! bg-black/35" />
      <button className="bg-custom-yellow-100 hover:bg-custom-yellow-300 flex h-full cursor-pointer items-center px-4 transition-all duration-200">
        <ChevronDownIcon className="size-5 text-black" strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default AddToWatchlistBtn;
