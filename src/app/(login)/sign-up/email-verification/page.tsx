"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { resendEmailSignUp } from "@/actions/auth/resendEmailSignUp";
import { redirect, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const RESEND_DELAY = 30;

function maskEmail(email: string): string {
  if (!email || email.length === 0) return "";
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;

  const visiblePart = name.slice(0, 2);
  const maskedPart = "*".repeat(Math.max(name.length - 2, 0));

  return `${visiblePart}${maskedPart}@${domain}`;
}

const ConfirmationPage = () => {
  const router = useRouter();
  const [canResend, setCanResend] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const maskedEmail = maskEmail(email);

  const handleResend = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setResendError(null);

    try {
      const response = await resendEmailSignUp(email);
      if (response.error) {
        // console.error("Error resending email:", response.message);
        setResendError(response.message);
        return;
      }
      // console.log("Resend email successful:", response);

      localStorage.setItem("lastResendTime", Date.now().toString());
      setCanResend(false);
      setRemainingTime(RESEND_DELAY);
    } catch (error) {
      // console.error("Unexpected error during resend:", error);
      setResendError("An unexpected error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("pendingEmail");
    if (stored) {
      setEmail(stored);
    } else {
      redirect("/sign-in");
    }
  }, []);

  useEffect(() => {
    const lastSent = localStorage.getItem("lastResendTime");
    if (lastSent) {
      const elapsed = Math.floor((Date.now() - parseInt(lastSent)) / 1000);
      if (elapsed < RESEND_DELAY) {
        setCanResend(false);
        setRemainingTime(RESEND_DELAY - elapsed);
      }
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // console.log("User already logged in, redirecting to home.");
        router.push("/home");
      }
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!canResend && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [canResend, remainingTime]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F172A] p-4 font-sans">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-linear-to-br from-[#059669] to-[#1E3A8A] p-8 shadow-xl sm:max-w-3xl">
        <div className="mx-auto flex max-w-md flex-col items-center space-y-4 text-center">
          <CheckCircle2 className="h-20 w-20 text-white sm:h-24 sm:w-24" />{" "}
          {/* Larger icon */}
          <h1 className="font-orbitron text-xl text-white sm:text-3xl">
            VERIFICATION SENT!
          </h1>
          <p className="text-sm text-white sm:text-base">
            We’ve sent a confirmation email to{" "}
            <span className="font-semibold text-[#66CBFF]">{maskedEmail}</span>.
            Please verify your email to complete the signup process.
            <br />
            <span className="text-sm text-white">
              (Check your spam folder if you don't see it in your inbox.)
            </span>
          </p>
        </div>

        <div className="space-y-4">
          {/* Sign In Button */}
          <div className="flex w-full justify-center">
            <Link
              href="/sign-in"
              className="inline-flex w-full items-center justify-center rounded-4xl border-2 border-[#88CAEF] px-6 py-3 text-center font-orbitron text-sm font-medium text-[#88CAEF] shadow-sm transition duration-150 ease-in-out hover:bg-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:outline-none sm:w-md sm:text-xl"
            >
              SING IN TO YOUR ACCOUNT
            </Link>
          </div>

          <div className="w-full text-center">
            <p className="text-sm text-white">
              Didn't receive the email?{" "}
              <button
                onClick={handleResend}
                disabled={!canResend || isResending}
                className={`font-medium transition duration-150 ease-in-out ${
                  canResend && !isResending
                    ? "cursor-pointer text-[#88CAEF] hover:text-blue-500"
                    : "cursor-not-allowed text-gray-400"
                } mx-auto mt-2 flex items-center justify-center`}
              >
                {isResending ? (
                  <svg
                    className="mr-2 -ml-1 h-5 w-5 animate-spin text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : null}
                {isResending
                  ? "Resending..."
                  : canResend
                    ? "Resend verification email"
                    : `Please wait ${remainingTime}s`}
              </button>
            </p>
            {resendError && (
              <div
                className="mt-4 rounded-md border border-red-400 bg-red-100 px-4 py-3 text-center text-red-700"
                role="alert"
              >
                <p>{resendError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
