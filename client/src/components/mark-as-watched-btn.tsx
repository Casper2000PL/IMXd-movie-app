import { EyeIcon } from "lucide-react";

const MarkAsWatchedBtn = () => {
  return (
    <button className="font-roboto flex h-12 w-full cursor-pointer items-center gap-2 overflow-hidden rounded-full bg-white/10 px-3 text-sm font-semibold text-blue-400 transition-all duration-200 hover:bg-white/20">
      <EyeIcon className="size-5 text-blue-400" strokeWidth={2.5} />
      Mark as Watched
    </button>
  );
};

export default MarkAsWatchedBtn;
