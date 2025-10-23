import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronRightIcon, XIcon } from "lucide-react";
import PosterCard from "./poster-card";
import { Link } from "@tanstack/react-router";
import { Separator } from "./ui/separator";

interface AddToListModalProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  posterUrl: string;
  title?: string;
}

const AddToListModal = ({
  isOpen = true,
  setIsOpen,
  posterUrl,
  title,
}: AddToListModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="bottom-0 flex max-h-[607px] min-h-30 w-full max-w-[664px]! rounded-none border-none bg-gray-800 p-0 max-sm:translate-y-[0%]"
        showCloseButton={false}
      >
        <DialogTitle></DialogTitle>
        <div className="flex w-full flex-col">
          <div className="mx-5 flex w-full items-center gap-4 pt-5 pb-6">
            <div className="h-fit w-[50px]">
              <PosterCard
                poster={posterUrl}
                className="h-full w-fit rounded-xl!"
                classNameImg="rounded-xl!"
              />
            </div>
            <div className="font-roboto flex flex-col gap-1">
              <p className="text-sm text-white/65 sm:text-base">{title}</p>
              <h2 className="text-xl font-semibold text-white sm:text-[26px]">
                Add to list
              </h2>
            </div>
          </div>
          <div className="flex w-full flex-col">
            <Link
              to="/"
              className="flex h-[50px] w-full items-center justify-between px-5 text-white transition-all duration-200 hover:bg-white/15"
            >
              <span className="text-md font-medium tracking-wide">
                View Watchlist
              </span>
              <ChevronRightIcon
                className="size-5 text-white"
                strokeWidth={2.5}
              />
            </Link>
            <Separator className="bg-white/25" />
            <Link
              to="/"
              className="flex h-[50px] w-full items-center justify-between px-5 text-white transition-all duration-200 hover:bg-white/15"
            >
              <span className="text-md font-medium tracking-wide">
                Create new list
              </span>
              <ChevronRightIcon
                className="size-5 text-white"
                strokeWidth={2.5}
              />
            </Link>
            <Separator className="bg-white/25" />
          </div>
          <div className="mb-5 flex h-25 w-full items-center justify-center">
            <p className="text-lg font-medium text-white">No lists found</p>
          </div>
        </div>

        <DialogClose className="absolute -top-12 right-0 cursor-pointer rounded-full p-3 transition-all duration-200 hover:bg-white/15 active:bg-white/30">
          <XIcon className="size-6 text-white" strokeWidth={2.5} />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default AddToListModal;
