import { TriangleIcon } from "lucide-react";

interface CelebCardProps {
  name: string;
  image: string;
}

const CelebCard = ({ name, image }: CelebCardProps) => {
  return (
    <div className="flex w-48 cursor-pointer flex-col gap-5 transition duration-200 hover:opacity-70">
      <div className="h-48 w-48 overflow-hidden rounded-full">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-top"
        />
      </div>
      <div className="font-noto-sans flex w-full flex-col items-center text-base">
        <div className="flex gap-1">
          <p className="text-white">30</p>
          <p className="text-stone-400">
            (
            <span>
              <TriangleIcon
                className="inline size-2.5 text-[#34E038]"
                fill="#34E038"
              />
            </span>
            8,439)
          </p>
        </div>
        <p className="text-white">{name}</p>
      </div>
    </div>
  );
};

export default CelebCard;
