"use client";

import { resetPassword } from "@/actions/auth/resetPassword";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, Variants } from "framer-motion";
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

  const itemVariants: Variants = {
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
          className="flex flex-col items-center justify-center px-6 text-center z-10 space-y-6 sm:space-y-8 w-full max-w-md lg:max-w-xl"
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
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 1 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08, delayChildren: 0.6 },
              },
            }}
            className="font-robotech-gp text-3xl sm:text-5xl lg:text-6xl font-bold tracking-wider text-white drop-shadow-[0_0_15px_rgba(68,213,234,0.8)]"
          >
            {"FORGOT PASSWORD?".split("").map((char, index) => (
              <motion.span
                key={index}
                variants={{
                  hidden: { opacity: 0, filter: "blur(4px)" },
                  visible: { opacity: 1, filter: "blur(0px)" },
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="font-exo-2 text-sm sm:text-base lg:text-lg text-white"
          >
            Enter the email used for your account and we’ll send you a link to reset your password
          </motion.p>

          {errorMessage && (
            <motion.div variants={itemVariants} className="w-full text-center">
              <p className="text-red-400 text-sm font-medium bg-red-900/30 py-2 px-4 rounded-md border border-red-500/50">{errorMessage}</p>
            </motion.div>
          )}

          {isSent ? (
            <motion.div variants={itemVariants} className="w-full text-center space-y-4">
              <div className="bg-green-500/20 border border-green-400/30 text-green-300 px-6 py-4 rounded-lg backdrop-blur-sm">
                <p className="font-semibold mb-2 text-lg">Reset link sent!</p>
                <p className="text-sm opacity-90">
                  Please check your email inbox (and spam folder) for
                  instructions to reset your password.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.form
              variants={itemVariants}
              onSubmit={handleSubmit(onSubmit)}
              className="w-full space-y-6 flex flex-col items-center"
            >
              <div className="w-full space-y-2">
                <div className="relative flex items-center justify-center w-full">
                  <div className="flex w-full items-center rounded-md border border-gray-300 bg-white transition-all duration-200 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-400">
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
                      className="font-exo-2 flex-1 border-none bg-transparent py-3 pr-4 pl-3 text-base text-gray-800 outline-none placeholder:text-gray-500 max-md:text-lg max-sm:py-4 sm:py-4 sm:pr-5 sm:pl-4 lg:py-4 lg:text-xl"
                      aria-invalid={errors.email ? "true" : "false"}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      disabled={isLoading || cooldown > 0}
                    />
                  </div>
                </div>
                {errors.email && (
                  <p id="email-error" className="text-red-400 text-sm font-medium text-center mt-2">
                    {errors.email.message}
                  </p>
                )}
              </div>
              
              <div className="w-full mt-4 flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading || cooldown > 0}
                  className="font-orbitron w-full max-w-sm flex items-center justify-center bg-[#88CAEF] text-[#042440] font-bold py-3 px-8 rounded-full transition-all duration-200 tracking-wider uppercase hover:bg-[#88CAEF]/90 focus:outline-none focus:ring-2 focus:ring-[#88CAEF]/40 focus:ring-offset-2 text-center text-sm sm:text-base lg:text-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#042440]"
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
                    `Resend in ${cooldown}s`
                  ) : (
                    "Send Code"
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
