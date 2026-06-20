"use client";

import { updateNameUsername } from "@/actions/auth/updateNameUsername";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  const [isMdOrLarger, setIsMdOrLarger] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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
      // console.error("An unexpected error occurred during update:", error);
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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0F172A] px-4 font-sans max-md:bg-[linear-gradient(29.69deg,_#1E3A8A_2.47%,_#059669_116.12%)] max-sm:bg-[linear-gradient(29.69deg,_#1E3A8A_2.47%,_#059669_116.12%)] sm:px-6 lg:px-8">
      <div className="z-10 w-full max-w-2xl max-md:w-[85vw] sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
        <div
          className="min-h-[400px] rounded-2xl border border-white/10 p-6 shadow-2xl backdrop-blur-lg max-md:min-h-[360px] max-md:rounded-none max-md:bg-[#0F172A] max-md:[clip-path:polygon(0%_0%,85%_0%,100%_15%,100%_100%,15%_100%,0%_85%)] sm:p-8 md:bg-[linear-gradient(29.69deg,_#1E3A8A_2.47%,_#059669_116.12%)] md:[clip-path:polygon(0%_0%,90%_0%,100%_20%,100%_100%,10%_100%,0%_80%)] lg:p-12"
          style={
            isMdOrLarger
              ? {
                  backgroundImage:
                    "url('/topPolygon.svg'), url('/bottomPolygon.svg'), url('/circuit.svg'), linear-gradient(29.69deg, #1E3A8A 2.47%, #059669 116.12%)",
                  backgroundRepeat:
                    "no-repeat, no-repeat, no-repeat, no-repeat",
                  backgroundPosition: "top right, bottom left, center, center",
                  backgroundSize: "50% 50%, 30% 30%, contain, cover",
                }
              : undefined
          }
        >
          <h2 className="orbitron-400 max-sm:pt-none mb-2 pt-6 text-center text-2xl font-bold tracking-wider text-white uppercase max-md:w-xs max-md:text-left max-md:text-3xl sm:text-4xl md:text-4xl lg:pt-24 lg:pb-32 lg:text-5xl">
            Update Details
          </h2>
          <h2 className="orbitron-400 text-center tracking-wider text-white">
            Please input your full name and username to continue
          </h2>

          {serverError && (
            <div className="mb-6 text-center">
              <p className="text-sm font-medium text-red-400">{serverError}</p>
            </div>
          )}

          {successMessage ? (
            <div className="space-y-4 text-center">
              <div className="rounded-lg border border-green-400/30 bg-green-500/20 px-6 py-4 pb-4 text-green-300 backdrop-blur-sm">
                <p className="mb-2 text-lg font-semibold">
                  Details updated successfully!
                </p>
                <p className="text-sm opacity-90">{successMessage}</p>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-4 space-y-6 sm:mt-12 lg:mt-2 lg:mb-24"
            >
              <div className="space-y-2 px-4 sm:px-8 lg:px-16">
                {/* Full Name Field */}
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Full name"
                      autoComplete="name"
                      maxLength={50}
                      {...register("fullName")}
                      className="exo-2-200 flex-1 border-none bg-transparent py-3 pr-4 pb-8 pl-3 text-base text-gray-800 outline-none placeholder:text-gray-500 max-md:text-lg max-sm:py-4 sm:py-4 sm:pr-5 sm:pl-4 lg:py-5 lg:text-xl"
                      aria-invalid={errors.fullName ? "true" : "false"}
                      aria-describedby={
                        errors.fullName ? "fullName-error" : undefined
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                {errors.fullName && (
                  <p
                    id="fullName-error"
                    className="text-center text-sm font-medium text-red-400"
                  >
                    {errors.fullName.message}
                  </p>
                )}

                {/* Username Field */}
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
                      className="exo-2-200 flex-1 border-none bg-transparent py-3 pr-4 pb-8 pl-3 text-base text-gray-800 outline-none placeholder:text-gray-500 max-md:text-lg max-sm:py-4 sm:py-4 sm:pr-5 sm:pl-4 lg:py-5 lg:text-xl"
                      aria-invalid={errors.displayName ? "true" : "false"}
                      aria-describedby={
                        errors.displayName ? "displayName-error" : undefined
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                {errors.displayName && (
                  <p
                    id="displayName-error"
                    className="text-center text-sm font-medium text-red-400"
                  >
                    {errors.displayName.message}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center">
                <div className="orbitron-500 relative flex w-full justify-center px-4 sm:px-8 lg:px-16">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="orbitron-500 w-full max-w-xl items-center rounded-full border border-[#88CAEF] px-4 py-3 text-center text-base text-xs font-bold tracking-wider text-[#88CAEF] uppercase transition-all duration-200 hover:bg-[#88CAEF]/10 focus:ring-2 focus:ring-[#88CAEF]/40 focus:ring-offset-2 focus:outline-none sm:max-w-2xl sm:px-6 sm:py-4 sm:text-lg sm:text-sm lg:max-w-xl xl:max-w-lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="mr-3 -ml-1 h-4 w-4 animate-spin text-white sm:h-5 sm:w-5"
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
                        Updating...
                      </div>
                    ) : (
                      "Update Details"
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

export default UpdateNamePage;
