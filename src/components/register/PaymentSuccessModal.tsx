import React from "react";
import ButtonRedirect from "@/components/ui/ButtonRedirect";

type CompetitionName = "ExerMind" | "UI/UX Design" | "Business Innovation";

interface PaymentSuccessModalProps {
  open: boolean;
  name: string;
  competition: string;
}

const Competitions: Record<CompetitionName, { linkwa: string }> = {
  ExerMind: {
    linkwa: "https://chat.whatsapp.com/GN4QzCowtvc8VUepQv5sPd?mode=r_t", // TODO: Replace with actual group link
  },
  "UI/UX Design": {
    linkwa: "https://chat.whatsapp.com/I8nsHzZy7saA6VrTDuAQDw?mode=ac_c",
  },
  "Business Innovation": {
    linkwa: "https://chat.whatsapp.com/CaDWdhYB4zfCKfUBLX23bh",
  },
};

export default function PaymentSuccessModal({
  open,
  competition,
}: PaymentSuccessModalProps) {
  if (!open) return null;
  const isValidCompetition = (
    competition: string,
  ): competition is CompetitionName => {
    return competition in Competitions;
  };

  let whatsappLink: string | undefined;

  if (isValidCompetition(competition)) {
    whatsappLink = Competitions[competition].linkwa;
  } else {
    console.error(
      `Error: Competition "${competition}" tidak ditemukan atau tidak valid.`,
    );
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
      {/* Overlay */}
      <div className="bg-opacity-95 fixed inset-0 z-40 bg-[#0B1120]" />
      {/* Modal Content */}
      <div className="modal-diagonal-cut relative z-50 flex w-250 flex-col items-center rounded-2xl bg-gradient-to-tl from-[#1E3A8A] to-[#059669] py-19 text-center shadow-xl">
        {/* Robot SVG */}
        <img
          src="/register/robot.svg"
          alt="Robot"
          className="mt-2 mb-2 h-32 w-32"
        />
        <h2 className="mb-2 font-orbitron text-3xl font-semibold tracking-wide text-white sm:text-3xl">
          THANK YOU FOR REGISTERING
        </h2>
        <p className="mb-12 font-exo-2 text-sm text-white sm:text-sm">
          Please join the group and stay tuned for the next steps!
        </p>
        <div className="mx-auto flex w-65 flex-col gap-4">
          <ButtonRedirect
            to="/home"
            className="text-md flex h-11 items-center justify-center border-2 bg-white font-semibold text-black transition-all hover:bg-gray-300"
          >
            <img src="/register/home.svg" alt="Home" className="mr-2 h-6 w-6" />
            <p className="text-black">Home</p>
          </ButtonRedirect>
          {/* Pastikan whatsappLink ada sebelum merender tombol */}
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-md flex h-11 items-center justify-center rounded-lg bg-white font-semibold text-[#00CB24] shadow transition-all hover:bg-gray-300"
            >
              <img
                src="/register/whatsapp.svg"
                alt="WhatsApp"
                className="mt-2 mr-2 h-9 w-9"
              />
              <span className="font-bold">Join WhatsApp Group</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
