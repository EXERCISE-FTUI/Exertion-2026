"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { resendEmailSignUp } from "@/actions/auth/resendEmailSignUp";
import { redirect, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "motion/react";

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

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" } 
    },
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-stretch justify-center py-20 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/background_login.svg'), linear-gradient(180deg, #528CC0 0%, #7CBCE8 75%, #FFFFFF 100%)`
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="z-20 relative flex flex-col items-center justify-center w-[90%] sm:w-full max-w-[903px] sm:aspect-[903/641] bg-center bg-no-repeat bg-cover sm:bg-contain drop-shadow-2xl rounded-3xl sm:rounded-none overflow-hidden sm:overflow-visible bg-[#042440] sm:bg-transparent"
        style={{ backgroundImage: "url('/base_verification.svg')" }}
      >
        <motion.div 
          className="flex flex-col items-center justify-center px-6 text-center z-10 space-y-6 sm:space-y-8 max-w-md lg:max-w-xl"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.3 }
            }
          }}
        >
          {/* Title */}
          <motion.h1 
            variants={itemVariants}
            className="font-robotech-gp text-3xl sm:text-5xl lg:text-6xl font-bold tracking-wider text-white drop-shadow-[0_0_15px_rgba(68,213,234,0.8)]"
          >
            VERIFICATION SENT!
          </motion.h1>

          {/* Description */}
          <motion.p variants={itemVariants} className="text-sm sm:text-base lg:text-lg text-white font-exo-2">
            We've sent a confirmation email to{" "}
            <span className="font-bold">{maskedEmail}</span>. Please verify your
            email and reset your password to complete the sign up process.
            <br className="hidden sm:block" />
            <span className="text-sm">
              (Check your spam folders if you don't see it in your inbox)
            </span>
          </motion.p>

          {/* Sign In Button */}
          <motion.div variants={itemVariants} className="w-full sm:w-auto mt-4">
            <Link
              href="/sign-in"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-[#88CAEF] px-10 py-3 lg:py-4 text-center font-montserrat text-sm lg:text-lg font-bold text-[#0F172A] shadow-md transition duration-200 ease-in-out hover:bg-white hover:scale-105 active:scale-95 focus:outline-none"
            >
              Sign In To Your Account
            </Link>
          </motion.div>

          {/* Resend Section */}
          <motion.div variants={itemVariants} className="flex flex-col items-center space-y-1">
            <p className="text-xs lg:text-sm text-gray-300 font-montserrat">
              Didn't Receive The Email?
            </p>
            <button
              onClick={handleResend}
              disabled={!canResend || isResending}
              className={`font-montserrat font-bold text-sm lg:text-base transition duration-200 ease-in-out flex items-center justify-center ${
                canResend && !isResending
                  ? "text-white hover:text-[#88CAEF] cursor-pointer"
                  : "text-gray-500 cursor-not-allowed"
              }`}
            >
              {isResending ? (
                <svg
                  className="mr-2 h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isResending
                ? "Resending..."
                : canResend
                  ? "Resend Verification Email"
                  : `Please wait ${remainingTime}s`}
            </button>
            {resendError && (
              <p className="mt-2 text-xs text-red-400 font-montserrat text-center">
                {resendError}
              </p>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ConfirmationPage;
