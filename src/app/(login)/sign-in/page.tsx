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

  return (
    <div className="relative flex min-h-screen w-full items-stretch justify-center bg-blackish-green py-20">
      <div className="cropped-corner-top-right sm:cropped-corner-bottom-left sm:cropped-border sm:cropped-border-bottom-left z-20 mt-12 flex max-h-[600px] w-10/12 max-w-sm flex-row items-center justify-center bg-blackish-green sm:mt-0 sm:w-6/12 sm:max-w-lg">
        <div className="w-full max-w-md space-y-8 p-6 sm:p-10">
          <div>
            <h2 className="mt-6 w-[80%] text-start font-orbitron text-3xl font-normal text-baby-blue sm:w-full sm:text-center sm:font-bold">
              SIGN IN TO EXERTION
            </h2>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 rounded-md">
              <AuthInput
                id="email"
                autoComplete="email"
                Icon={Mail}
                error={errors.email}
                register={register}
                placeholder="Email address"
                type="email"
              />

              <AuthInput
                id="password"
                autoComplete="new-password"
                Icon={Lock}
                error={errors.password}
                register={register}
                placeholder="Password"
                type="password"
              />

              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-exo-2 text-white hover:underline"
                >
                  Forget Password?
                </Link>
              </div>

              {serverError && (
                <div
                  className="relative flex flex-row items-center gap-2 rounded-md border border-red-400 bg-red-100 px-4 py-3 text-red-700"
                  role="alert"
                >
                  <CircleAlert className="h-6 w-6 stroke-1" />

                  <span className="font-exo-2 text-xs sm:inline sm:text-base">
                    {serverError}
                  </span>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-3xl border-2 border-baby-blue px-3 py-2 font-orbitron text-sm font-semibold text-baby-blue disabled:opacity-50"
              >
                {isLoading ? (
                  <svg
                    className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
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
                {isLoading ? "Loading..." : "SIGN IN"}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2">
              <hr className="grow" />
              <p className="text-sm text-white md:text-base">OR</p>
              <hr className="grow" />
            </div>

            <ButtonGoogle onClick={signInWithGoogle} />

            <p className="text-center text-sm text-baby-blue">
              Don’t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-exo-2 font-bold text-greenish-white hover:underline"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="sm:cropped-corner-top-right absolute top-0 z-10 h-full w-full flex-col items-center justify-center gap-12 overflow-hidden bg-linear-to-bl from-vivid-green to-vivid-blue py-24 select-none sm:relative sm:flex sm:h-auto sm:max-h-[600px] sm:max-w-md sm:py-0 sm:max-md:w-5/12 md:w-4/12 lg:w-3/12">
        <p className="hidden text-center font-orbitron text-2xl font-bold text-baby-blue sm:block">
          WELCOME BACK
        </p>

        <img
          src="/mascot-shai.svg"
          className="ms-10 hidden w-28 sm:mx-auto sm:block sm:w-36"
          alt=""
        />

        {/* Rounded triangle */}
        <svg
          className="absolute right-[10%] bottom-16 hidden h-20 w-20 sm:block"
          viewBox="0 0 66 67"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.38515 25.7195C-0.0572324 23.5192 0.79819 19.5 3.92491 18.485L60.2059 0.214833C63.3326 -0.800175 66.3856 1.95022 65.7013 5.16554L53.3832 63.0414C52.6989 66.2567 48.7905 67.5255 46.3481 65.3252L2.38515 25.7195Z"
            fill="#1C7E9E"
          />
        </svg>

        {/* Rounded square */}
        <svg
          className="absolute top-20 right-32 h-24 w-24 -rotate-12 stroke-vivid-green stroke-1 opacity-50 sm:hidden"
          viewBox="0 0 84 84"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M28.2145 6.58659C35.7988 -0.997595 48.096 -0.997693 55.6803 6.58659L77.3073 28.2145C84.8916 35.7988 84.8916 48.096 77.3073 55.6803L55.6803 77.3073C48.096 84.8916 35.7988 84.8916 28.2145 77.3073L6.58658 55.6803C-0.9977 48.0961 -0.9976 35.7989 6.58658 28.2145L28.2145 6.58659Z" />
        </svg>

        {/* Network */}
        <img
          src="/network.svg"
          className="absolute bottom-0 hidden h-64 w-64 translate-y-1/3 sm:block"
          alt="network"
        />

        {/* Hexagon */}
        <svg
          viewBox="0 0 310 305"
          className="absolute right-0 bottom-0 -z-20 h-80 w-80 translate-x-1/2 rotate-45 stroke-brilliant-blue stroke-3 sm:top-0 sm:right-0 sm:-translate-x-1/2 sm:translate-y-1/12 sm:rotate-12 sm:stroke-1"
          fill="none"
        >
          <g opacity="0.3">
            <path d="M261.836 87.8605V217.986L152.654 283.032L43.4709 217.986V87.8605L152.654 22.8136L261.836 87.8605Z" />
            <path d="M287.925 77.1487V227.987L155.011 303.415L22.0988 227.987V77.1487L155.011 1.72003L287.925 77.1487Z" />
          </g>
        </svg>

        {/* M shape */}
        <svg
          className="absolute bottom-0 left-0 -translate-x-3/4 translate-y-1/2 rotate-45 stroke-greenish-blue stroke-2 sm:hidden"
          viewBox="0 0 276 244"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M229.022 158.749V0.74881L115.022 0.74881L1.02188 0.74881L1.02188 158.749L115.022 68.2488L229.022 158.749Z" />
        </svg>
      </div>
    </div>
  );
};

export default SigninPage;
