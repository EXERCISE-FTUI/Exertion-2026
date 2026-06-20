"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

const EmailVerifiedPage = () => {
  const router = useRouter();

  useEffect(() => {
    const handleVerificationFlow = async () => {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        // console.error("Error fetching user:", userError);
        router.push("/sign-in");
      }

      if (user) {
        // console.log(
        //   "User found after email verification, redirecting to home."
        // );
        localStorage.removeItem("pendingEmail");
        localStorage.removeItem("lastResendTime");
        router.push("/home");
        return;
      }

      const storedPendingEmail = localStorage.getItem("pendingEmail");
      if (!storedPendingEmail) {
        // console.log("No pending email found, redirecting to sign-in.");
        localStorage.removeItem("lastResendTime");
        router.push("/sign-in");
        return;
      }
    };

    handleVerificationFlow();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center space-y-4 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />{" "}
          {/* Larger success icon */}
          <h1 className="text-3xl font-bold text-gray-900">Email Verified!</h1>
          <p className="text-gray-600">
            Your email address has been successfully verified.
          </p>
          <p className="text-gray-600">
            You can now proceed to sign in to your account.
          </p>
        </div>

        <div className="flex w-full justify-center">
          <button
            onClick={() => router.push("/sign-in")}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm transition duration-150 ease-in-out hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerifiedPage;
