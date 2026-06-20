"use client";

import { createClient } from "@/utils/supabase/client";
import { passwordMatchSchema } from "@/utils/validation/passwordMatchSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import "./updatepass.css";

type FormSchema = z.infer<typeof passwordMatchSchema>;

const UpdatePasswordPage = () => {
  const supabase = createClient();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormSchema>({
    resolver: zodResolver(passwordMatchSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = async (data: FormSchema) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!showForm) {
      setErrorMessage(
        "Sesi reset password tidak valid. Silakan coba lagi dari tautan di email Anda.",
      );
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        // console.error("Error updating password:", error);
        let userFacingError = "Gagal memperbarui password Anda.";
        if (
          error.message.includes("invalid_grant") ||
          error.message.includes("Auth Session Missing") ||
          error.message.includes("invalid refresh token") ||
          error.message.includes("expired")
        ) {
          userFacingError =
            "Tautan reset password tidak valid atau sudah kadaluarsa. Silakan minta tautan baru.";
          setShowForm(false);
        } else if (error.message.includes("Password too short")) {
          userFacingError = "Password terlalu pendek.";
        } else if (error.message.includes("user_already_exists")) {
          userFacingError = "User sudah ada. Coba masuk.";
        } else if (
          error.message.includes(
            "New password should be different from the old password",
          )
        ) {
          userFacingError = "Password baru harus berbeda dari password lama.";
        }
        setErrorMessage(userFacingError);
      } else {
        setSuccessMessage(
          "Password berhasil diperbarui! Mengarahkan Anda ke halaman masuk.",
        );
        setShowForm(false);
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      }
    } catch (error) {
      // console.error(
      //   "An unexpected error occurred during password update:",
      //   error
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
      // console.log("didcancel true");
      didCancel = true;
      clearTimeout(timer);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0F172A] px-4 font-sans max-md:bg-[linear-gradient(29.69deg,_#1E3A8A_2.47%,_#059669_116.12%)] max-sm:bg-[linear-gradient(29.69deg,_#1E3A8A_2.47%,_#059669_116.12%)] sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <svg
            className="mr-3 mb-3 -ml-1 h-8 w-8 animate-spin text-[#88CAEF]"
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
          <p className="text-lg text-white">
            Memverifikasi tautan reset password Anda...
          </p>
        </div>
      </div>
    );
  }

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
            Update Password
          </h2>

          {errorMessage && (
            <div className="mb-6 text-center">
              <p className="text-sm font-medium text-red-400">{errorMessage}</p>
            </div>
          )}

          {successMessage ? (
            <div className="space-y-4 text-center">
              <div className="rounded-lg border border-green-400/30 bg-green-500/20 px-6 py-4 pb-4 text-green-300 backdrop-blur-sm">
                <p className="mb-2 text-lg font-semibold">
                  Password updated successfully!
                </p>
                <p className="text-sm opacity-90">{successMessage}</p>
              </div>
            </div>
          ) : showForm ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-4 space-y-6 sm:mt-12 lg:mt-2 lg:mb-24"
            >
              <div className="space-y-2 px-4 sm:px-8 lg:px-16">
                {/* New Password Field */}
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type="password"
                      placeholder="New password"
                      autoComplete="new-password"
                      {...register("password")}
                      className="exo-2-200 flex-1 border-none bg-transparent py-3 pr-4 pb-8 pl-3 text-base text-gray-800 outline-none placeholder:text-gray-500 max-md:text-lg max-sm:py-4 sm:py-4 sm:pr-5 sm:pl-4 lg:py-5 lg:text-xl"
                      aria-invalid={errors.password ? "true" : "false"}
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    className="text-sm font-medium text-red-400"
                  >
                    {errors.password.message}
                  </p>
                )}

                {/* Confirm Password Field */}
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <input
                      id="passwordConfirm"
                      type="password"
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      {...register("passwordConfirm")}
                      className="exo-2-200 flex-1 border-none bg-transparent py-3 pr-4 pb-8 pl-3 text-base text-gray-800 outline-none placeholder:text-gray-500 max-md:text-lg max-sm:py-4 sm:py-4 sm:pr-5 sm:pl-4 lg:py-5 lg:text-xl"
                      aria-invalid={errors.passwordConfirm ? "true" : "false"}
                      aria-describedby={
                        errors.passwordConfirm
                          ? "passwordConfirm-error"
                          : undefined
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                {errors.passwordConfirm && (
                  <p
                    id="passwordConfirm-error"
                    className="text-sm font-medium text-red-400"
                  >
                    {errors.passwordConfirm.message}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center">
                <div className="orbitron-500 relative flex w-full justify-center px-4 sm:px-8 lg:px-16">
                  <button
                    type="submit"
                    disabled={isSubmitting || !showForm}
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
                      "Update Password"
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
