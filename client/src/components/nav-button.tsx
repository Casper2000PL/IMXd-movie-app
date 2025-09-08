import { forwardRef } from "react";
import { Button } from "./ui/button";

interface NavButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
}

const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ children, onClick, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        onClick={onClick}
        className="rounded-3xl bg-transparent p-4 font-bold hover:bg-white/10 hover:transition-all focus:bg-white/10 active:bg-white/20"
        {...props}
      >
        {children}
      </Button>
    );
  },
);

NavButton.displayName = "NavButton"; // Good practice for debugging

export default NavButton;
