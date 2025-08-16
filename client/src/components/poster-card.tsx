import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";

interface PosterCardProps {
  poster: string;
  className?: string;
  classNameImg?: string;
  withRibbon?: boolean;
}

const PosterCard = ({
  poster,
  className,
  classNameImg,
  withRibbon,
}: PosterCardProps) => {
  return (
    <div
      className={cn(
        "relative flex h-[244px] w-[165px] justify-center rounded-md rounded-tl-none transition duration-200 hover:opacity-90",
        className,
      )}
    >
      <img
        src={poster}
        alt="Steve"
        className={cn(
          "h-full w-full rounded-md rounded-tl-none object-cover",
          classNameImg,
        )}
      />
      <button className="absolute top-0 left-0 cursor-pointer">
        {/* Ribbon */}
        {withRibbon && (
          <div
            className="relative flex h-14 w-10 bg-neutral-800/90 transition duration-150 hover:bg-neutral-500/90"
            style={{
              clipPath:
                "polygon(0% 0%, 100% 0%, 100% 100%, 50% calc(100% - 12px), 0% 100%, 0% calc(100% - 12px))",
            }}
          >
            <PlusIcon
              className="absolute top-2 left-[5px] size-7 text-white"
              strokeWidth={2.5}
            />
          </div>
        )}
      </button>
    </div>
  );
};

export default PosterCard;
