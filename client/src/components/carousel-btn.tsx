import { cn } from "@/lib/utils";
import { ChevronRightIcon, ChevronLeftIcon } from "lucide-react";

interface CarouselBtnProps {
  onClick?: () => void;
  className?: string;
  direction: "left" | "right";
  disabled?: boolean;
  props?: React.ComponentProps<"button">;
}

const CarouselBtn = ({
  direction,
  onClick,
  disabled,
  className,
  ...props
}: CarouselBtnProps) => {
  return (
    <button
      className={cn(
        "hover:text-custom-yellow-100 flex cursor-pointer rounded-sm border-[1px] border-stone-400 bg-black/35 px-1 py-3.5 text-white transition duration-300",
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {direction === "left" ? (
        <ChevronLeftIcon strokeWidth={2.5} className="size-11" />
      ) : (
        <ChevronRightIcon strokeWidth={2.5} className="size-11" />
      )}
    </button>
  );
};

export default CarouselBtn;
