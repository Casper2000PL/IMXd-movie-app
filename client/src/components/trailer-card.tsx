import { CirclePlayIcon, HeartIcon, ThumbsUpIcon } from "lucide-react";
import PosterCard from "./poster-card";

interface TrailerCardProps {
  title: string;
  duration: string;
  poster: string;
  className?: string;
}

const TrailerCard = ({
  title,
  duration,
  poster,
  className,
}: TrailerCardProps) => {
  return (
    <div className={`flex flex-1 gap-2 ${className}`}>
      <div className="flex-1">
        <PosterCard
          poster={poster}
          classNameImg="rounded-md min-w-[88px] h-[130px]"
          className="m-0 flex h-full w-full"
        />
      </div>
      <div className="group flex flex-2 cursor-pointer flex-col gap-3">
        <div className="flex w-full items-end gap-2">
          <CirclePlayIcon
            className="group-hover:text-custom-yellow-200 size-11 text-white"
            strokeWidth={1}
          />
          <span className="text-muted-foreground text-sm">{duration}</span>
        </div>
        <div className="bg ml-1 flex flex-col gap-2">
          <h3 className="flex font-sans text-lg leading-4 text-white">
            {title}
          </h3>
          <p className="text-muted-foreground font-sans text-sm leading-4">
            Watch Trailer
          </p>
        </div>
        <div className="ml-1 flex w-full items-center gap-1">
          <ThumbsUpIcon className="text-muted-foreground size-4" />
          <span className="text-muted-foreground text-sm">12</span>
          <span className="w-1"></span>
          <HeartIcon className="size-5" fill="#F52765" />
          <span className="text-muted-foreground text-sm">44</span>
        </div>
      </div>
    </div>
  );
};

export default TrailerCard;
