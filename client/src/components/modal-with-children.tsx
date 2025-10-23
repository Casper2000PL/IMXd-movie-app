import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ModalWithChildrenProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  children?: React.ReactNode;
}

const ModalWithChildren = ({
  children,
  isOpen,
  setIsOpen,
}: ModalWithChildrenProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        fullScreen={true}
        className="flex h-screen w-full flex-col items-center bg-black px-2 pt-4 pb-0 text-white outline-none md:px-4 xl:px-10"
        showCloseButton={false}
      >
        <DialogTitle></DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default ModalWithChildren;
