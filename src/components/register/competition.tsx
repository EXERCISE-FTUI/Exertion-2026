// components/register/competition.tsx
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

// Using the competitions array from your main file with UUIDs
const competitions = [
  {
    id: 'ui/ux',
    name: "UI/UX Design",
    icon: "/icons/uixdesign.sv",
    uuid: "ae179e48-61c7-4d24-a19f-5c29b833ef18",
    documentDriveId: "134x09gvtgwisQ2WLWfDFGLnCqT5iyVRN"
  },

  {
    id: "exermind",
    name: "ExerMind",
    icon: "icons/exermind.png",
    uuid: "50fd83d0-b25f-4d55-ab94-59c8d0cddaf0",
    documentDriveId: "1MGp0KxfyEYYM4JM9xIfSNwsQeoH8m0G6"
  },

  {
    id: "business",
    name: "Business Case",
    icon: "/icons/business.png",
    uuid: "9c200794-6ade-4817-b7ec-f039242705ef",
    documentDriveId: "1w9bwTTpJXmL-UdK2WFFFRVOrRzH4D7mk"
  },

  {
    id: "infografis",
    name: "Infografis",
    // TUGAS FRONTEND: ganti ke yang baru
    icon: "icons/exermind.png",
    uuid: "087f3607-8cc5-478c-973e-3c638fbca82e",
    documentDriveId: "1PeyZgiZoaPbc33IlDkqwBEv2opPSO5C6"
  }
]

// --- New SVG-based Competition Button Component ---
const CompetitionButton: React.FC<{
  name: string;
  number: string;
  isSelected: boolean;
  onClick: () => void;
}> = ({ name, number, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group relative w-full scale-[0.8] transition-transform duration-300 hover:scale-[0.85] focus:outline-none"
    >
      <svg
        viewBox="0 0 300 60"
        className="h-auto w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Main Button Shape */}
        <path
          d="M15 60 L0 45 V10 C0 4.477 4.477 0 10 0 H280 C285.523 0 290 4.477 290 10 L300 30 L290 50 C290 55.523 285.523 60 280 60 H15 Z"
          fill={isSelected ? "#00A99D" : "#0c1a2b"} // Teal when selected, dark blue otherwise
          stroke={isSelected ? "#00A99D" : "#44EAB0"} // Teal border
          strokeWidth="1"
        />

        {/* Circuit Board SVG Pattern */}
        <svg width="100%" height="100%" style={{ zIndex: 1 }}>
          <defs>
            <pattern
              id="circuit"
              patternUnits="userSpaceOnUse"
              width="50"
              height="50"
            >
              <path
                d="M 0 10 L 10 10 L 10 0 M 10 20 L 10 30 L 0 30 M 20 10 L 30 10 L 30 20 M 40 10 L 50 10 M 20 40 L 30 40 L 30 50 M 40 30 L 50 30"
                fill="none"
                stroke={
                  isSelected ? "rgba(0,0,0,0.2)" : "rgba(68, 234, 176, 0.1)"
                }
                strokeWidth="1"
              />
              <circle
                cx="10"
                cy="10"
                r="1.5"
                fill={
                  isSelected ? "rgba(0,0,0,0.2)" : "rgba(68, 234, 176, 0.1)"
                }
              />
              <circle
                cx="30"
                cy="40"
                r="1.5"
                fill={
                  isSelected ? "rgba(0,0,0,0.2)" : "rgba(68, 234, 176, 0.1)"
                }
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>

        {/* Text and Icon Content */}
        <g>
          {isSelected ? (
            <path
              d="M7 30 L15 38 L28 22"
              stroke="#0c1a2b"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <text
              x="18"
              y="35"
              fontFamily="Orbitron, sans-serif"
              fontSize="10"
              fill="#44EAB0"
              fontWeight="bold"
            >
              {number}
            </text>
          )}
          <text
            x="150"
            y="36"
            fontFamily="Orbitron, sans-serif"
            fontSize="16"
            fill="white"
            fontWeight="bold"
            textAnchor="middle"
          >
            {name}
          </text>
        </g>
      </svg>
    </button>
  );
};

// --- Main Competition Component ---
export default function Competition({
  formData,
  updateFormData,
  handleNext,
}: Props) {
  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center p-4 text-white md:px-8 md:py-4">
      <div className="w-full max-w-sm md:max-w-xl">
        <h1 className="mb-1 text-left font-orbitron text-2xl font-extrabold tracking-wide md:mb-4 md:text-center md:text-3xl">
          COMPETITION
        </h1>
        <p className="mb-6 text-left text-sm md:mb-8 md:text-center md:text-base">
          Select one of the competitions
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3 md:max-w-xl md:space-y-4">
        {competitions.map((c, index) => {
          const isSelected = formData.competitionId === c.uuid;
          return (
            <CompetitionButton
              key={c.id}
              name={c.name}
              number={`0${index + 1}`}
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
