import { PlusIcon } from "lucide-react";

interface PosterCardProps {
  poster: string;
}

const PosterCard = ({ poster }: PosterCardProps) => {
  return (
    <div className="relative flex h-[195.35px] w-[132px] justify-center overflow-hidden rounded-md rounded-tl-none">
      <img
        src={poster}
        alt="Steve"
        className="h-full w-full rounded-md rounded-tl-none object-cover"
      />
      <button className="absolute top-0 left-0 cursor-pointer">
        {/* Ribbon */}
        <div
          className="relative flex h-16 w-12 bg-neutral-800/90 transition duration-150 hover:bg-neutral-500/90"
          style={{
            clipPath:
              "polygon(0% 0%, 100% 0%, 100% 100%, 50% calc(100% - 12px), 0% 100%, 0% calc(100% - 12px))",
          }}
        >
          <PlusIcon
            className="absolute top-2 left-2 size-8 text-white"
            strokeWidth={2.5}
          />
        </div>
      </button>
    </div>
  );
};

export default PosterCard;
