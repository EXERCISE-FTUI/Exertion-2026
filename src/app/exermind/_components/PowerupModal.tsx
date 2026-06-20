"use client";

import React, { useState, useEffect } from "react";
import { ClockPlus, Lightbulb } from "lucide-react";

export interface PowerupModalProps {
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  onIncrement: (minutes: number) => void;
  initialSelection: string[];
}

export default function PowerupModal({
  timeLeft,
  setTimeLeft,
  onIncrement,
  initialSelection,
}: PowerupModalProps) {
  // Use chosen power-ups or default set
  const initialPowerups =
    initialSelection.length > 0
      ? initialSelection
      : ["hint", "hint", "add-time"];
  const hints = [
    "Use the first letter of each word",
    "Remember the pattern starts with 'Depannya Exer'",
  ];

  const [usedPowerups, setUsedPowerups] = useState<number[]>([]);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [popupIconType, setPopupIconType] = useState<string | null>(null);
  const [popupClosable, setPopupClosable] = useState<boolean>(false);

  // Enable closing: immediately for add_time, delay for hints
  useEffect(() => {
    if (!popupMessage) return;
    if (popupIconType === "add-time") {
      setPopupClosable(true);
      return;
    }
    setPopupClosable(false);
    const timeout = setTimeout(() => setPopupClosable(true), 2000);
    return () => clearTimeout(timeout);
  }, [popupMessage, popupIconType]);

  const handleAddTime = () => {
    const increment = 60; // seconds to add
    const duration = 1000; // animation duration in ms
    const steps = increment;
    const intervalTime = duration / steps;
    const startTime = timeLeft;
    let count = 0;
    const anim = setInterval(() => {
      count++;
      setTimeLeft(startTime + count);
      if (count >= steps) clearInterval(anim);
    }, intervalTime);

    const minutes = increment / 60;
    onIncrement(minutes);
    setPopupIconType("add-time");
    setPopupMessage(`Additional ${minutes} minute has been added!`);
  };

  const handleShowHint = () => {
    const hintCount = usedPowerups.filter(
      (i) => initialPowerups[i] === "hint",
    ).length;
    const hintText = hints[hintCount] || "No more hints";
    setPopupIconType("hint");
    setPopupMessage(hintText);
  };

  const handleUsePowerup = (index: number) => {
    if (usedPowerups.includes(index)) return;
    const type = initialPowerups[index];
    if (type === "add-time") handleAddTime();
    else if (type === "hint") handleShowHint();

    setUsedPowerups((prev) => [...prev, index]);
  };

  return (
    <>
      {/* Power-up buttons */}
      <div className="flex items-center justify-center gap-4">
        <p className="text-white [font-family:Montserrat] text-[19.365px] font-normal leading-[48.411px] pr-10">User power up</p>
        {initialPowerups.map((type, index) => {
          const isUsed = usedPowerups.includes(index);
          return (
            <button
              key={index}
              onClick={() => handleUsePowerup(index)}
              disabled={isUsed}
              className={`flex h-18 w-18 items-center justify-center rounded-full border-[3px] border-[#7287b7] bg-[#283553] text-white transition-opacity duration-200 ${
                isUsed
                  ? "cursor-not-allowed opacity-40"
                  : "cursor-pointer hover:scale-105"
              }`}
              style={{
                filter:
                  "drop-shadow(0 0 2.975px rgba(255,255,255,0.25)) drop-shadow(0 0 2.975px rgba(255,255,255,0.25))",
              }}
            >
              {type === "add-time" ? (
                <ClockPlus className="h-6 w-6" />
              ) : (
                <Lightbulb className="h-6 w-6" />
              )}
            </button>
          );
        })}
      </div>

      {/* Popup Overlay */}
      {popupMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-[1px]"
          onClick={() =>
            popupClosable && (setPopupMessage(null), setPopupIconType(null))
          }
        >
          <div
            className="w-[30rem] bg-[#283553] p-6 text-center shadow-lg rounded-[20px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center gap-5">
              {popupIconType === "add-time" && (
                <ClockPlus className="h-8 w-8 text-white" />
              )}
              {popupIconType === "hint" && (
                <Lightbulb className="h-8 w-8 text-white" />
              )}
              <p className="text-lg font-semibold text-white">{popupMessage}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
