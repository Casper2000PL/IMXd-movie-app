import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ModalWithChildrenProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  children: React.ReactNode;
}

const ModalWithChildren = ({
  children,
  isOpen,
  setIsOpen,
}: ModalWithChildrenProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};

export default ModalWithChildren;
