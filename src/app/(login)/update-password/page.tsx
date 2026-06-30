"use client";

import { updatePassword } from "@/actions/auth/updatePassword";
import { createClient } from "@/utils/supabase/client";
import { passwordMatchSchema } from "@/utils/validation/passwordMatchSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, Variants } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import "./updatepass.css";

type FormSchema = z.infer<typeof passwordMatchSchema>;

const UpdatePasswordPage = () => {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isMdOrLarger, setIsMdOrLarger] = useState(false);

  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(passwordMatchSchema),
  });

  const onSubmit = async (data: FormSchema) => {
    try {
      // Panggil server action
      const response = await updatePassword({ password: data.password });

      if (!response.success) {
        setErrorMessage(
          response.message || "Gagal mengupdate password. Silakan coba lagi.",
        );
        return;
      }

      setSuccessMessage(
        "Password berhasil diupdate. Mengalihkan ke halaman sign in...",
      );
      setErrorMessage(null);

      // Jeda sejenak untuk memberikan feedback ke user
      setTimeout(() => {
        router.push("/sign-in");
        router.refresh();
      }, 3000);
    } catch (error) {
      // console.error("Error updating password:", error);
      // setErrorMessage(
      //   "Terjadi kesalahan tak terduga. Silakan coba lagi.",
      // );
      setErrorMessage("Terjadi kesalahan tak terduga. Silakan coba lagi.");
      setShowForm(false);
    }
  };

  useEffect(() => {
    let didCancel = false;
    let timer: NodeJS.Timeout;

    const verifySession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!didCancel) {
        if (session) {
          clearTimeout(timer);
          setShowForm(true);
          setIsLoading(false);
          // console.log(session);
        } else {
          // console.warn("No session found");
        }
      }
    };

    verifySession();

    timer = setTimeout(() => {
      if (!didCancel) {
        setIsLoading(false);
        setErrorMessage(
          "Verifikasi gagal. Silakan coba lagi atau minta tautan baru.",
        );
      }
    }, 10000); // 10 detik fallback

    return () => {
      didCancel = true;
      clearTimeout(timer);
    };
  }, []);

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
  };

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('/background_login.svg'), linear-gradient(180deg, #528CC0 0%, #7CBCE8 75%, #FFFFFF 100%)` }}>
        <div className="flex flex-col items-center">
          <svg className="mr-3 mb-3 -ml-1 h-8 w-8 animate-spin text-[#88CAEF]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-white drop-shadow-md">Memverifikasi tautan reset password Anda...</p>
        </div>
      </div>
    );
  }

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
          className="flex flex-col items-center justify-center px-6 text-center z-10 w-full max-w-md lg:max-w-xl"
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
            {"NEW PASSWORD".split("").map((char, index) => (
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
            className="font-exo-2 mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-white"
          >
            Enter your new password
          </motion.p>

          {errorMessage && (
            <motion.div variants={itemVariants} className="w-full mt-6 text-center">
              <p className="text-red-400 text-sm font-medium bg-red-900/30 py-2 px-4 rounded-md border border-red-500/50">{errorMessage}</p>
            </motion.div>
          )}

          {successMessage ? (
            <motion.div variants={itemVariants} className="w-full mt-6 text-center space-y-4">
              <div className="bg-green-500/20 border border-green-400/30 text-green-300 px-6 py-4 rounded-lg backdrop-blur-sm">
                <p className="mb-2 text-lg font-semibold">Password updated successfully!</p>
                <p className="text-sm opacity-90">{successMessage}</p>
              </div>
            </motion.div>
          ) : showForm ? (
            <motion.form
              variants={itemVariants}
              onSubmit={handleSubmit(onSubmit)}
              className="w-full mt-6 sm:mt-8 space-y-4 flex flex-col items-center"
            >
              {/* New Password Field */}
              <motion.div variants={itemVariants} className="w-full space-y-2">
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="New Password"
                      autoComplete="new-password"
                      {...register("password")}
                      className="font-exo-2 flex-1 border-none bg-transparent py-3 pr-2 pl-3 text-base text-gray-800 outline-none placeholder:text-gray-500 max-md:text-lg max-sm:py-4 sm:py-4 sm:pl-4 lg:py-4 lg:text-xl"
                      aria-invalid={errors.password ? "true" : "false"}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="pr-4 sm:pr-5 text-gray-500 hover:text-gray-700 focus:outline-none flex items-center justify-center"
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : (
                        <EyeOff className="h-5 w-5 sm:h-6 sm:w-6" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm font-medium text-red-400 text-center mt-1">
                    {errors.password.message}
                  </p>
                )}
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div variants={itemVariants} className="w-full space-y-2">
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      id="passwordConfirm"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-Enter New Password"
                      autoComplete="new-password"
                      {...register("passwordConfirm")}
                      className="font-exo-2 flex-1 border-none bg-transparent py-3 pr-2 pl-3 text-base text-gray-800 outline-none placeholder:text-gray-500 max-md:text-lg max-sm:py-4 sm:py-4 sm:pl-4 lg:py-4 lg:text-xl"
                      aria-invalid={errors.passwordConfirm ? "true" : "false"}
                      aria-describedby={errors.passwordConfirm ? "passwordConfirm-error" : undefined}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="pr-4 sm:pr-5 text-gray-500 hover:text-gray-700 focus:outline-none flex items-center justify-center"
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? (
                        <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
                      ) : (
                        <EyeOff className="h-5 w-5 sm:h-6 sm:w-6" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.passwordConfirm && (
                  <p id="passwordConfirm-error" className="text-sm font-medium text-red-400 text-center mt-1">
                    {errors.passwordConfirm.message}
                  </p>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="w-full pt-4 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="font-orbitron w-full max-w-sm flex items-center justify-center bg-[#88CAEF] text-[#042440] font-bold py-3 px-8 rounded-full transition-all duration-200 tracking-wider uppercase hover:bg-[#88CAEF]/90 focus:outline-none focus:ring-2 focus:ring-[#88CAEF]/40 focus:ring-offset-2 text-center text-sm sm:text-base lg:text-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#042440]"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </motion.button>
              </motion.div>
            </motion.form>
          ) : null}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UpdatePasswordPage;
