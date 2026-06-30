"use client";

import { updateNameUsername } from "@/actions/auth/updateNameUsername";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, Variants } from "framer-motion";

const formSchema = z.object({
  fullName: z
    .string()
    .min(4, "Full name is required (at least 4 characters)")
    .max(40, "Full name must be at most 40 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
  displayName: z
    .string()
    .min(4, "Username is required (at least 4 characters)")
    .max(12, "Username must be at most 12 characters")
    .regex(/^[a-zA-Z]+$/, "Username can only contain letters and no spaces"),
});

const UpdateNamePage = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      displayName: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      const { fullName, displayName } = data;
      const response = await updateNameUsername({
        full_name: fullName,
        display_name: displayName,
      });

      if (response.error) {
        setServerError(response.message);
      } else if (response.success) {
        setSuccessMessage(
          "Details updated successfully! Redirecting you to home.",
        );
        setTimeout(() => {
          router.push("/home");
        }, 2000);
      }
    } catch (error) {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {

      const { data: userData, error } = await supabase.auth.getUser();
      console.log(userData);
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userData?.user?.id)
        .single();
      if (profileData?.display_name !== null) router.push("/home");
    };
    fetchUser();
  }, []);

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
            {"UPDATE DETAILS".split("").map((char, index) => (
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
            className="font-exo-2 text-sm sm:text-base lg:text-lg text-white !mt-2 sm:!mt-3"
          >
            Please input your full name and username to continue
          </motion.p>

          {serverError && (
            <motion.div variants={itemVariants} className="w-full text-center">
              <p className="text-red-400 text-sm font-medium bg-red-900/30 py-2 px-4 rounded-md border border-red-500/50">{serverError}</p>
            </motion.div>
          )}

          {successMessage ? (
            <motion.div variants={itemVariants} className="w-full text-center space-y-4">
              <div className="bg-green-500/20 border border-green-400/30 text-green-300 px-6 py-4 rounded-lg backdrop-blur-sm">
                <p className="mb-2 text-lg font-semibold">Details updated successfully!</p>
                <p className="text-sm opacity-90">{successMessage}</p>
              </div>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full space-y-4 flex flex-col items-center"
            >
              {/* Full Name Field */}
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Full Name"
                      autoComplete="name"
                      maxLength={50}
                      {...register("fullName")}
                      className="font-exo-2 flex-1 border-none bg-transparent py-3 pr-2 pl-3 text-base text-gray-800 outline-none placeholder:text-gray-500 max-md:text-lg max-sm:py-4 sm:py-4 sm:pl-4 lg:py-4 lg:text-xl"
                      aria-invalid={errors.fullName ? "true" : "false"}
                      aria-describedby={errors.fullName ? "fullName-error" : undefined}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                {errors.fullName && (
                  <p
                    id="fullName-error"
                    className="text-left text-sm font-medium text-red-400 ml-1"
                  >
                    {errors.fullName.message}
                  </p>
                )}
              </motion.div>

              {/* Username Field */}
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <input
                      id="displayName"
                      type="text"
                      placeholder="Username"
                      autoComplete="username"
                      maxLength={20}
                      {...register("displayName")}
                      className="font-exo-2 flex-1 border-none bg-transparent py-3 pr-2 pl-3 text-base text-gray-800 outline-none placeholder:text-gray-500 max-md:text-lg max-sm:py-4 sm:py-4 sm:pl-4 lg:py-4 lg:text-xl"
                      aria-invalid={errors.displayName ? "true" : "false"}
                      aria-describedby={errors.displayName ? "displayName-error" : undefined}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                {errors.displayName && (
                  <p
                    id="displayName-error"
                    className="text-left text-sm font-medium text-red-400 ml-1"
                  >
                    {errors.displayName.message}
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
                    "Update Details"
                  )}
                </motion.button>
              </motion.div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UpdateNamePage;
