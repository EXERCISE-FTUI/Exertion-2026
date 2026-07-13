"use client";

import React from "react";

// --- START: COPY THIS FormData INTERFACE TO ALL FILES ---
export interface FormData {
  competition: string;
  name: string;
  phone: string;
  studentIdCard: File | null;
  twibbon: File | null;
  instagramStory: File | null;

  member2StudentIdCard: File | null;
  member2Twibbon: File | null;
  member2InstagramStory: File | null;

  member3StudentIdCard: File | null;
  member3Twibbon: File | null;
  member3InstagramStory: File | null;

  submission: File | null;
  payment: { amount: number };
  groupName: string;
  leaderName: string;
  leaderInstitute: string;
  leaderEmail: string;
  leaderWhatsappNumber: string;
  memberCount: number;
  member2Name?: string;
  member2Institute?: string;
  member3Name?: string;
  member3Institute?: string;
  competitionId?: string;
  teamId: string;

  // Drive IDs
  studentIdCardDriveId: string;
  twibbonDriveId: string;
  instagramStoryDriveId: string;

  member2StudentIdCardDriveId: string;
  member2TwibbonDriveId: string;
  member2InstagramStoryDriveId: string;

  member3StudentIdCardDriveId: string;
  member3TwibbonDriveId: string;
  member3InstagramStoryDriveId: string;

  submissionDriveId: string;
  paymentProof: File | null;
  paymentProofDriveId: string;
}
// --- END: COPY THIS FormData INTERFACE TO ALL FILES ---

interface Props {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  handleNext: () => void;
}

const competitions = [
  {
    id: "ui/ux",
    name: "UI/UX Design",
    buttonImg: "/register/uiux_button.svg",
    activeImg: "/register/select-uiux.svg",
    uuid: "ae179e48-61c7-4d24-a19f-5c29b833ef18",
    documentDriveId: "134x09gvtgwisQ2WLWfDFGLnCqT5iyVRN"
  },
  {
    id: "exermind",
    name: "ExerMind",
    buttonImg: "/register/exermind_button.svg",
    activeImg: "/register/select-exermind.svg",
    uuid: "50fd83d0-b25f-4d55-ab94-59c8d0cddaf0",
    documentDriveId: "1MGp0KxfyEYYM4JM9xIfSNwsQeoH8m0G6"
  },
  {
    id: "business",
    name: "Business Plan",
    buttonImg: "/register/Business Plan.svg",
    activeImg: "/register/Business Plan OC.svg",
    uuid: "9c200794-6ade-4817-b7ec-f039242705ef",
    documentDriveId: "1w9bwTTpJXmL-UdK2WFFFRVOrRzH4D7mk"
  },
  {
    id: "infografis",
    name: "Infografis",
    buttonImg: "/register/infographic_button.svg",
    activeImg: "/register/select-infographic.svg",
    uuid: "087f3607-8cc5-478c-973e-3c638fbca82e",
    documentDriveId: "1PeyZgiZoaPbc33IlDkqwBEv2opPSO5C6"
  }
];

interface CompetitionButtonProps {
  buttonImg: string;
  activeImg: string;
  isSelected: boolean;
  onClick: () => void;
}

const CompetitionButton: React.FC<CompetitionButtonProps> = ({
  buttonImg,
  activeImg,
  isSelected,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative w-full cursor-pointer focus:outline-none transition-all duration-200 active:scale-98 overflow-hidden
        ${isSelected ? "drop-shadow-[0_0_15px_rgba(0,210,255,0.5)] scale-[1.02]" : "hover:scale-[1.01]"}
      `}
    >
      <img
        src={isSelected ? activeImg : buttonImg}
        alt="Competition Button"
        className="w-full h-auto object-contain opacity-100 block"
      />
    </button>
  );
};

export default function Competition({
  formData,
  updateFormData,
  handleNext,
}: Props) {
  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-start pt-32 min-[480px]:pt-20 md:pt-18 px-2 py-4 min-[480px]:p-4 md:px-8 z-10 relative">
      <div className="w-full text-center mb-11 md:mb-8">
        <h1 className="font-orbitron text-2xl min-[480px]:text-3xl md:text-5xl font-black tracking-[0.15em] text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
          COMPETITION
        </h1>
        <p className="font-montserrat text-sm md:text-base text-white/60 tracking-wide font-medium mt-2">
          Select one of the competitions
        </p>
      </div>

      <div className="w-full max-w-[92%] min-[480px]:max-w-sm md:max-w-md flex flex-col gap-4 md:gap-5 px-1 min-[480px]:px-4">
        {competitions.map((c) => {
          const isSelected = formData.competitionId === c.uuid;
          return (
            <CompetitionButton
              key={c.id}
              buttonImg={c.buttonImg}
              activeImg={c.activeImg}
              isSelected={isSelected}
              onClick={() => {
                updateFormData("competition", c.name);
                updateFormData("competitionId", c.uuid);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}