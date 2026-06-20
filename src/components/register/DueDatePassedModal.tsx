import React from "react";

interface DueDatePassedModalProps {
  open: boolean;
}

export default function DueDatePassedModal({ open }: DueDatePassedModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
      <div
        className="relative w-full max-w-xs rounded-2xl p-4 text-center shadow-xl md:max-w-md md:p-8 lg:max-w-lg sm:max-w-sm sm:p-6"
        style={{
          background: "linear-gradient(135deg, #b31217 0%, #e52d27 100%)",
        }}
      >
        <div className="flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-transparent md:h-24 md:w-24 sm:mb-6 sm:h-20 sm:w-20">
            <svg
              width="70"
              height="70"
              className="md:h-28 md:w-28 sm:h-30 sm:w-30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
              <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          <h2 className="mb-1 text-xl font-bold tracking-wide text-white md:text-3xl sm:mb-2 sm:text-2xl">
            DUE DATE PASSED
          </h2>
          <p className="mb-1 text-base text-white md:text-xl sm:mb-2 sm:text-lg">
            The registration due date has passed.
          </p>
          <p className="mb-2 text-xs text-blue-100 md:text-base sm:text-sm">
            If you have registered, please wait for the official announcement.
          </p>
        </div>
      </div>
    </div>
  );
}
