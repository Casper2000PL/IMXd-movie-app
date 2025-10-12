import { Link } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";

interface SectionLinkProps {
  to?: string;
  label: string;
  numberOfItems?: number;
}

const SectionLink = ({ to, label, numberOfItems }: SectionLinkProps) => {
  return (
    <Link to={to || "/"} className="font-roboto group text-3xl font-bold">
      <div className="flex items-center">
        <div className="bg-custom-yellow-100 h-[32px] w-[4px] rounded-full" />
        <span className="ml-2.5">{label || "Back to Home"}</span>
        {numberOfItems !== undefined && (
          <span className="ml-3 text-base font-normal text-stone-400">
            {numberOfItems}
          </span>
        )}

        <ChevronRightIcon
          strokeWidth={2.5}
          className="group-hover:text-custom-yellow-100 size-10 text-stone-900"
        />
      </div>
    </Link>
  );
};

export default SectionLink;
