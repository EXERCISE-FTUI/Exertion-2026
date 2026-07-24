"use client";

import React, { useState, useEffect } from "react";
import ChoosePower from "./ChoosePower";
import PowerupModal from "./PowerupModal";
import type { PowerUpOption } from "./powerup";

export default function Final() {
  const [started, setStarted] = useState(false);
  const [showChoose, setShowChoose] = useState(false);
  const [selectedPowerups, setSelectedPowerups] = useState<PowerUpOption[]>([
    null,
    null,
    null,
  ]);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [incrementText, setIncrementText] = useState<string | null>(null);

  // Start and manage countdown
  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => Math.max(t - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [started]);

  // Handle increment notification from PowerupModal
  const handleIncrement = (minutes: number) => {
    setIncrementText(`(+${minutes} min)`);
    setTimeout(() => setIncrementText(null), 2000);
  };

  // Initial start screen
  if (!started) {
    return (
      <div className="flex h-full items-center justify-center">
        <button
          onClick={() => {
            setStarted(true);
            setShowChoose(true);
          }}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Start Attempt
        </button>
      </div>
    );
  }

  // Show ChoosePower to pick initial power-ups
  if (showChoose) {
    return (
      <ChoosePower
        onComplete={(powers: PowerUpOption[]) => {
          setSelectedPowerups(powers);
          setShowChoose(false);
        }}
      />
    );
  }

  // Main quiz screen
  return (
    <div className="p-6 text-center text-white ">
      <p className="mb-6 text-xl">
        Time Left: {timeLeft}s
        {incrementText && (
          <span className="ml-2 text-green-500">{incrementText}</span>
        )}
      </p>
      <PowerupModal
        timeLeft={timeLeft}
        setTimeLeft={setTimeLeft}
        onIncrement={handleIncrement}
        initialSelection={selectedPowerups.filter(
          (x): x is "hint" | "add-time" => x === "hint" || x === "add-time",
        )}
      />
    </div>
  );
}
