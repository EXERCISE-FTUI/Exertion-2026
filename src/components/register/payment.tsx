"use client";
import React from "react";

// --- FormData Interface ---
export interface FormData {
  competition: string;
  name: string;
  institute: string;
  phone: string;
  studentIdCard: File | null;
  twibbon: File | null;
  exertionUIPrompt: File | null;
  exerciseFTUIPrompt: File | null;
  submission: File | null;
  payment: { amount: number };
  groupName: string;
  leaderName: string;
  leaderWhatsappNumber: string;
  member1Name?: string;
  member1WhatsappNumber?: string;
  member2Name?: string;
  member2WhatsappNumber?: string;
  competitionId?: string;
  teamId: string;
  // Tambahan untuk menyimpan Drive File IDs
  studentIdCardDriveId?: string;
  twibbonDriveId?: string;
  exertionUIPromptDriveId?: string;
  exerciseFTUIPromptDriveId?: string;
  submissionDriveId?: string;
}

// --- Component Props ---
interface Props {
  formData: FormData;
  handlePayment: () => void;
}

// --- Main Payment Component (Merged) ---
export default function Payment({ formData, handlePayment }: Props) {
  let price: number = 45000;
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const currentDate = new Date(utcTime + 7 * 60 * 60 * 1000); // GMT+7
  const targetDate = new Date("2025-07-15T00:00:00+07:00");
  if (currentDate >= targetDate) {
    price = 55000;
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4 text-white">
      <div className="flex w-full max-w-sm flex-col items-center md:max-w-md">
        {/* Centered White Box with responsive sizing */}
        <div className="mb-4 flex w-full flex-col justify-center rounded-lg bg-white p-4 text-center shadow-lg md:p-6">
          <div className="text-base font-medium text-[#1D3B89] md:text-lg">
            Registration Fee
          </div>
          <div className="my-1 text-4xl font-bold tracking-wider text-[#22314F] md:text-5xl">
            {price.toLocaleString("id-ID")}
          </div>
        </div>

        {/* Note with responsive text size */}
        <div
          className="max-w-full p-1 text-center text-xs text-white md:max-w-xl md:text-sm"
          style={{ lineHeight: 1.4 }}
        >
          *Once the payment has been successfully collected, the collected
          documents will be automatically sent and cannot be changed.
        </div>
      </div>
    </div>
  );
}
