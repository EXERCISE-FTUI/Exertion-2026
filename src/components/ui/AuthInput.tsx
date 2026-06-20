"use client";
import React from "react";
import { FieldError, UseFormRegister } from "react-hook-form";
import { LucideIcon, CircleAlert } from "lucide-react";

type AuthInputProps = {
  id: string;
  autoComplete: string;
  Icon: LucideIcon;
  error?: FieldError | undefined;
  register: UseFormRegister<any>;
  placeholder: string;
  type?: string;
};

const AuthInput: React.FC<AuthInputProps> = ({
  id,
  autoComplete,
  Icon,
  error: error,
  register,
  placeholder,
  type = "text",
}) => {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>

      <Icon
        className={`${error?.message ? "text-red-500" : "text-grayish-purple"} absolute top-1/2 left-3 z-10 h-5 w-5 -translate-y-1/2 stroke-1`}
      />

      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        {...register(id)}
        className={`${error?.message ? "bg-red-50 pe-10 text-red-600 ring-red-600 focus:ring-red-600" : "bg-bluish-white pe-3 text-grayish-purple focus:ring-blue-600"} relative block w-full rounded-md border-0 py-2 ps-10 font-exo-2 text-sm font-light text-grayish-purple ring-1 ring-gray-300 transition duration-150 ease-in-out ring-inset placeholder:text-grayish-purple focus:ring-2 focus:ring-blue-600 focus:ring-inset sm:py-3 sm:text-base`}
        placeholder={placeholder}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error?.message && (
        <div
          id={`${id}-error`}
          className="group absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
        >
          <CircleAlert className="z-10 h-5 w-5 stroke-1 text-red-600" />

          <span className="text-red absolute right-0 bottom-full mb-1 rounded border border-red-600 bg-red-100 px-2 py-1 whitespace-nowrap text-red-600 opacity-0 transition-opacity group-hover:opacity-100">
            {error.message}
          </span>
        </div>
      )}
    </div>
  );
};

export default AuthInput;
