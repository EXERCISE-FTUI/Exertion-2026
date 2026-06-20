"use client";

import { Dialog, DialogContentNoClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SignupSuccessModal = ({ open, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContentNoClose
        className="max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex flex-col items-center space-y-2">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <DialogTitle className="text-center">
              Account Created Successfully!
            </DialogTitle>
            <p className="text-sm text-gray-500 text-center">
              We've sent a confirmation email. Please verify it to complete your
              signup.
            </p>
          </div>
        </DialogHeader>

        <div className="w-full flex justify-center pt-2">
          <Link
            href="/sign-in"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Sign in to your account
          </Link>
        </div>
      </DialogContentNoClose>
    </Dialog>
  );
};

export default SignupSuccessModal;
