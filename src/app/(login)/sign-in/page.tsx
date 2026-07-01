"use client";
import { signInWithGoogle } from "@/actions/auth/signInWithGoogle";
import { signInWithPassword } from "@/actions/auth/signInWithPassword";
import ButtonGoogle from "@/components/ui/ButtonGoogle";
import { createClient } from "@/utils/supabase/client";
import { passwordSchema } from "@/utils/validation/passwordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import AuthInput from "@/components/ui/AuthInput";

import { Mail, Lock, CircleAlert } from "lucide-react";
import { motion, Variants } from "motion/react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
});

const SigninPage = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await signInWithPassword(data);
      if (!response) {
        setServerError("no server response while signing in");
        return;
      }
      // console.log(response);

      if (response.message === "Email not confirmed") {
        setServerError("Please confirm your email address.");
        router.push("/sign-up/email-verification");
      }
      if (response.success) {
        // console.log(
        //   "Sign-in initiated successfully. Waiting for session update.",
        // );
        router.push("/home");
      } else if (response.error) {
        // console.error("Sign-in failed:", response.message);
        setServerError(response.message);
      }
    } catch (error) {
      // console.error("Unexpected error during sign-in:", error);
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    localStorage.removeItem("pendingEmail");
    localStorage.removeItem("lastResendTime");
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        router.push("/home");
      }
    };
    checkUser();
  }, [router]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" as const }
    },
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-center sm:items-stretch justify-center py-6 sm:py-20 px-4 sm:px-0 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/background_login.svg'), linear-gradient(180deg, #528CC0 0%, #7CBCE8 75%, #FFFFFF 100%)`
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="z-20 relative flex flex-col sm:block w-[90%] sm:w-full max-w-[903px] sm:aspect-[903/641] bg-[#042440] sm:bg-transparent bg-none sm:bg-[url('/base_login_new.svg')] bg-center bg-no-repeat bg-cover sm:bg-contain drop-shadow-2xl rounded-3xl sm:rounded-none overflow-hidden sm:overflow-visible"
      >
        <div className="flex flex-col sm:flex-row w-full h-full sm:absolute sm:inset-0">
          {/* Left Side: Form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex w-full sm:w-[50%] flex-col justify-center sm:justify-start px-6 sm:px-0 sm:pl-10 sm:pr-16 lg:pl-16 lg:pr-24 py-8 sm:py-0 sm:pt-[24.5%] lg:pt-[31.5%] z-10"
          >
            <motion.div variants={itemVariants} className="pt-2 lg:pt-4">
              <h2 className="text-center sm:text-start font-orbitron text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wider text-white drop-shadow-[0_0_10px_rgba(68,213,234,0.8)]">
                LOGIN
              </h2>
              <p className="mt-1 lg:mt-2 text-center sm:text-start font-montserrat text-xs sm:text-sm text-gray-300">
                Please enter your details
              </p>
            </motion.div>

            <form className="mt-4 lg:mt-4 space-y-2 lg:space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2 lg:space-y-3 rounded-md font-montserrat">
                <motion.div variants={itemVariants}>
                  <AuthInput
                    id="email"
                    autoComplete="email"
                    Icon={Mail}
                    error={errors.email}
                    register={register}
                    placeholder="Email"
                    type="email"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <AuthInput
                    id="password"
                    autoComplete="new-password"
                    Icon={Lock}
                    error={errors.password}
                    register={register}
                    placeholder="Password"
                    type="password"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="text-xs lg:text-sm flex justify-end sm:justify-start">
                  <Link
                    href="/forgot-password"
                    className="text-white hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </motion.div>

                {serverError && (
                  <motion.div
                    variants={itemVariants}
                    className="relative flex flex-row items-center gap-2 rounded-md border border-red-400 bg-red-100 px-3 py-2 text-red-700"
                    role="alert"
                  >
                    <CircleAlert className="h-4 w-4 sm:h-5 sm:w-5 stroke-1" />

                    <span className="font-montserrat text-xs sm:text-sm">
                      {serverError}
                    </span>
                  </motion.div>
                )}
              </div>

              <motion.div variants={itemVariants} className="pt-2 lg:pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full justify-center rounded-full bg-[#88D6FA] border-2 border-white hover:bg-sky-400 px-3 py-2.5 sm:py-3 font-montserrat text-sm font-semibold text-black disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <svg
                      className="mr-2 -ml-1 h-5 w-5 animate-spin text-black"
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
                  {isLoading ? "Loading..." : "Login"}
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="relative -top-1 sm:-top-2 flex items-center justify-center gap-4 w-full pt-3 lg:pt-5 pb-1 lg:pb-2">
                <p className="text-xs lg:text-sm text-gray-300 font-montserrat">OR</p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex justify-center w-full font-montserrat mt-0 lg:-mt-1">
                <ButtonGoogle onClick={signInWithGoogle} />
              </motion.div>

              <motion.p variants={itemVariants} className="text-center text-xs lg:text-sm text-white font-montserrat pt-0 pb-2">
                Don’t Have an Account?{" "}
                <Link
                  href="/sign-up"
                  className="font-bold text-white hover:underline ml-1"
                >
                  Sign Up
                </Link>
              </motion.p>
            </form>
          </motion.div>

          {/* Right Side: Mascot & Text */}
          <div className="hidden sm:block w-[50%] relative z-10 pointer-events-none">
            <div className="absolute top-[53%] left-[45%] -translate-x-1/2 -translate-y-1/2">
              <motion.p
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 1 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08, delayChildren: 0.8 },
                  },
                }}
                className="font-orbitron text-xl lg:text-2xl font-bold text-white tracking-wider text-center drop-shadow-md whitespace-nowrap"
              >
                {"Welcome Back!".split("").map((char, index) => (
                  <motion.span
                    key={index}
                    variants={{
                      hidden: { opacity: 0, filter: "blur(4px)" },
                      visible: { opacity: 1, filter: "blur(0px)" },
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.p>
            </div>
            <div className="absolute top-[68%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-32 lg:w-44">
              <motion.img
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, -10, 0]
                }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.7 },
                  scale: { duration: 0.6, delay: 0.7, type: "spring", bounce: 0.4 },
                  y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1.3 }
                }}
                src="/maskot_exertion.svg"
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(68,213,234,0.3)]"
                alt="Mascot"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SigninPage;
