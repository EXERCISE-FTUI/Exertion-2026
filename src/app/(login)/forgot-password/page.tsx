"use client";

import { resetPassword } from "@/actions/auth/resetPassword";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import "./forgotpass.css";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [isSent, setIsSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMdOrLarger, setIsMdOrLarger] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMdOrLarger(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setIsSent(false);
    setErrorMessage(null);

    try {
      const response = await resetPassword(data);
      if (response.error) {
        setErrorMessage(response.message);
        setCooldown(5);
        return;
      }
      if (response.success) {
        setIsSent(true);
        setCooldown(30);
      }
    } catch (error) {
      // console.error("Error sending reset link:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    localStorage.removeItem("pendingEmail");
    localStorage.removeItem("lastResendTime");
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

  return (
    <div className="bg-[#0F172A] min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden max-md:bg-[linear-gradient(29.69deg,_#1E3A8A_2.47%,_#059669_116.12%)] max-sm:bg-[linear-gradient(29.69deg,_#1E3A8A_2.47%,_#059669_116.12%)]">
      <div className="w-full max-w-2xl sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl z-10 max-md:w-[85vw]">
        <div
          className="md:bg-[linear-gradient(29.69deg,_#1E3A8A_2.47%,_#059669_116.12%)] backdrop-blur-lg p-6 sm:p-8 lg:p-12 rounded-2xl max-md:rounded-none md:[clip-path:polygon(0%_0%,90%_0%,100%_20%,100%_100%,10%_100%,0%_80%)] max-md:[clip-path:polygon(0%_0%,85%_0%,100%_15%,100%_100%,15%_100%,0%_85%)] border border-white/10 shadow-2xl min-h-[400px] max-md:min-h-[360px] max-md:bg-[#0F172A]"
          style={
            isMdOrLarger
              ? {
                  backgroundImage:
                    "url('/topPolygon.svg'), url('/bottomPolygon.svg'), url('/circuit.svg'), linear-gradient(29.69deg, #1E3A8A 2.47%, #059669 116.12%)",
                  backgroundRepeat: "no-repeat, no-repeat, no-repeat, no-repeat",
                  backgroundPosition: "top right, bottom left, center, center",
                  backgroundSize: "50% 50%, 30% 30%, contain, cover",
                }
              : undefined
          }
        >
          <h2 className="orbitron-400 text-2xl max-md:text-3xl max-md:w-xs max-md:text-left sm:text-4xl md:text-4xl lg:text-5xl pt-6 lg:pt-24 lg:pb-32 font-bold max-sm:pt-none mb-2 text-center text-white tracking-wider uppercase">
            Reset Password
          </h2>

          {errorMessage && (
            <div className="mb-6 text-center">
              <p className="text-red-400 text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          {isSent ? (
            <div className="text-center space-y-4">
              <div className="bg-green-500/20 border border-green-400/30 text-green-300 px-6 py-4 pb-4 rounded-lg backdrop-blur-sm">
                <p className="font-semibold mb-2 text-lg">Reset link sent!</p>
                <p className="text-sm opacity-90">
                  Please check your email inbox (and spam folder) for
                  instructions to reset your password.
                </p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 mt-4 sm:mt-12 lg:mt-2 lg:mb-24"
            >
              <div className="space-y-2 px-4 sm:px-8 lg:px-16">
                <div className="relative flex items-center justify-center">
                  <div className="flex w-full max-w-xl items-center rounded-md border border-gray-300 bg-white transition-all duration-200 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-400 sm:max-w-2xl lg:max-w-xl xl:max-w-lg">
                    <div className="flex items-center pl-4 sm:pl-5">
                      <svg
                        className="h-5 w-5 text-gray-500 sm:h-6 sm:w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      {...register("email")}
                      className="exo-2-200 flex-1 border-none bg-transparent py-3 pr-4 pb-8 pl-3 text-base text-gray-800 outline-none placeholder:text-gray-500 max-md:text-lg max-sm:py-4 sm:py-4 sm:pr-5 sm:pl-4 lg:py-5 lg:text-xl"
                      aria-invalid={errors.email ? "true" : "false"}
                      aria-describedby={
                        errors.email ? "email-error" : undefined
                      }
                      disabled={isLoading || cooldown > 0}
                    />
                  </div>
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    className="text-red-400 text-sm font-medium"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="flex justify-center items-center">
                <div className="relative orbitron-500 w-full px-4 sm:px-8 lg:px-16 flex justify-center">
                  <button
                    type="submit"
                    disabled={isLoading || cooldown > 0}
                    className="orbitron-500 w-full max-w-xl sm:max-w-2xl lg:max-w-xl xl:max-w-lg items-center border border-[#88CAEF] text-[#88CAEF] font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-full transition-all duration-200 tracking-wider text-xs sm:text-sm uppercase hover:bg-[#88CAEF]/10 focus:outline-none focus:ring-2 focus:ring-[#88CAEF]/40 focus:ring-offset-2 text-center text-base sm:text-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                        Sending...
                      </div>
                    ) : cooldown > 0 ? (
                      `Resend available in ${cooldown}s`
                    ) : (
                      "Send Code"
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
