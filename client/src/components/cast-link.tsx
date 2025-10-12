import { Link } from "@tanstack/react-router";

interface CastLinkProps {
  to?: string;
  imgUrl: string;
  name: string;
  character: string;
}

const CastLink = ({ to, imgUrl, name, character }: CastLinkProps) => {
  return (
    <Link to={to || "/"} className="group">
      <div className="flex items-center gap-6">
        <img
          src={imgUrl}
          alt={name}
          className="size-[96px] rounded-full object-cover object-top transition-all group-hover:opacity-95"
        />
        <div className="font-roboto flex flex-col gap-0.5 text-base">
          <h3 className="font-semibold text-black group-hover:text-stone-500">
            {name}
          </h3>
          <p className="text-muted-foreground font-medium">{character}</p>
        </div>
      </div>
    </Link>
  );
};

export default CastLink;
