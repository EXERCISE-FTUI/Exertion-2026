"use client";

import { useState } from "react";
import PowerUpComponent, {
  type PowerUpOption,
  type PowerUpSelection,
  type PowerUpType,
} from "./powerup";

interface ChoosePowerProps {
  onComplete?: (powerUps: PowerUpType[]) => void;
  disabled?: boolean;
}

const EMPTY_SELECTION: PowerUpSelection = [null, null, null];

export default function ChoosePower({
  onComplete,
  disabled = false,
}: ChoosePowerProps) {
  const [selectedItems, setSelectedItems] = useState<PowerUpOption[]>([
    ...EMPTY_SELECTION,
  ]);

  const isComplete =
    selectedItems.length === 3 &&
    selectedItems.every((item): item is PowerUpType => item !== null);

  const submitSelection = () => {
    if (!isComplete || disabled) return;
    onComplete?.(selectedItems);
  };

  return (
    <section className="relative flex min-h-[calc(100vh-73px)] flex-1 overflow-hidden bg-linear-to-t from-[#0B8071] from-[-10%] via-[#38405F] via-40% to-[#111417] to-[120%] px-5 py-10 sm:px-10">
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col justify-between gap-10">
        <img
          src="/home/header/logo_exertion.svg"
          alt="Exertion"
          className="h-10 w-fit sm:h-12"
        />

        <PowerUpComponent
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          disabled={disabled}
        />

        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-sm bg-blackish-green px-10 py-3 font-orbitron font-bold text-white transition hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#88D6FA] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={submitSelection}
            disabled={!isComplete || disabled}
          >
            {disabled ? "Starting..." : "Start exam"}
          </button>
        </div>
      </div>

      <svg
        className="pointer-events-none absolute top-0 right-0 w-64 translate-x-1/4 -translate-y-1/4 stroke-1 opacity-60"
        viewBox="0 0 251 226"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M249.531 104.164L208.606 215.888L84.6217 224.906L1.60555 122.084L42.5303 10.3602L166.514 1.34167L249.531 104.164Z"
          stroke="#FFE2E4"
        />
        <path
          d="M224.576 110.249L194.231 193.09L95.3282 196.693L26.8493 117.24L57.1945 34.3985L156.097 30.7954L224.576 110.249Z"
          stroke="#FFE2E4"
        />
      </svg>
    </section>
  );
}
