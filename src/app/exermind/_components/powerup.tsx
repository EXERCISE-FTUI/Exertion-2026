"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  BadgePlus,
  Lightbulb,
  Plus,
  Snowflake,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { POWER_UP_TYPES, type PowerUpType } from "@/lib/exermind/types";
import "./powerup.css";

export { POWER_UP_TYPES };
export type { PowerUpType };
export type PowerUpOption = PowerUpType | null;
export type PowerUpSelection = [PowerUpOption, PowerUpOption, PowerUpOption];

export interface PowerUpMeta {
  label: string;
  description: string;
  Icon: LucideIcon;
}

export const POWER_UP_META: Record<PowerUpType, PowerUpMeta> = {
  TIME_FREEZE: {
    label: "Time Freeze",
    description: "Pause the timer until the current question is completed.",
    Icon: Snowflake,
  },
  HINT: {
    label: "Hint",
    description: "Reveal a clue written for the current question.",
    Icon: Lightbulb,
  },
  DOUBLE_POINTS: {
    label: "Double Points",
    description:
      "Double this question's value. Only one use is allowed per question.",
    Icon: BadgePlus,
  },
};

interface PowerUpComponentProps {
  selectedItems: PowerUpOption[];
  setSelectedItems: Dispatch<SetStateAction<PowerUpOption[]>>;
  disabled?: boolean;
}

const toThreeSlots = (items: PowerUpOption[]): PowerUpSelection => [
  items[0] ?? null,
  items[1] ?? null,
  items[2] ?? null,
];

export default function PowerUpComponent({
  selectedItems,
  setSelectedItems,
  disabled = false,
}: PowerUpComponentProps) {
  const shouldReduceMotion = useReducedMotion();
  const slots = toThreeSlots(selectedItems);
  const firstEmptySlot = slots.findIndex((item) => item === null);
  const activeSlot = firstEmptySlot === -1 ? null : firstEmptySlot;

  const choosePowerUp = (powerUp: PowerUpType) => {
    if (disabled || activeSlot === null) return;

    const next = [...slots] as PowerUpSelection;
    next[activeSlot] = powerUp;
    setSelectedItems(next);
  };

  const clearSlot = (index: number) => {
    if (disabled) return;

    const next = [...slots] as PowerUpSelection;
    next[index] = null;
    setSelectedItems(next);
  };

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {POWER_UP_TYPES.map((powerUp) => {
          const { label, description, Icon } = POWER_UP_META[powerUp];

          return (
            <motion.button
              key={powerUp}
              type="button"
              whileHover={
                disabled || activeSlot === null || shouldReduceMotion
                  ? undefined
                  : { y: -4 }
              }
              whileTap={
                disabled || activeSlot === null || shouldReduceMotion
                  ? undefined
                  : { scale: 0.98 }
              }
              onClick={() => choosePowerUp(powerUp)}
              disabled={disabled || activeSlot === null}
              className="highlight flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg bg-blackish-blue p-5 text-center text-white transition-opacity focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#88D6FA] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Add ${label} to slot ${
                activeSlot === null ? "" : activeSlot + 1
              }`}
            >
              <Icon className="h-12 w-12 text-[#88D6FA]" aria-hidden="true" />
              <span className="font-orbitron text-sm font-bold">{label}</span>
              <span className="font-montserrat text-xs leading-relaxed text-gray-300">
                {description}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-exo-2 text-xl font-bold text-white">
          Choose exactly three power-ups
        </p>
        <p className="font-montserrat text-xs text-gray-300">
          You may choose the same power-up more than once.
        </p>
      </div>

      <div className="grid w-full max-w-lg grid-cols-3 gap-3">
        {slots.map((powerUp, index) => {
          const meta = powerUp ? POWER_UP_META[powerUp] : null;
          const Icon = meta?.Icon ?? Plus;

          return (
            <motion.button
              key={index}
              type="button"
              initial={false}
              animate={
                !shouldReduceMotion && activeSlot === index
                  ? { y: -5, scale: 1.02 }
                  : { y: 0, scale: 1 }
              }
              onClick={() => clearSlot(index)}
              disabled={disabled || !powerUp}
              className={`min-h-28 rounded-md border p-3 text-white transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#88D6FA] ${
                powerUp
                  ? "border-[#88D6FA]/70 bg-[#283553] hover:border-white"
                  : activeSlot === index
                    ? "border-dashed border-white bg-skyblue/60"
                    : "border-dashed border-gray-600 bg-[#283553]/50"
              } disabled:cursor-default`}
              aria-label={
                powerUp
                  ? `Clear slot ${index + 1}: ${meta?.label}`
                  : `Empty power-up slot ${index + 1}`
              }
            >
              <span className="flex flex-col items-center gap-2">
                <Icon className="h-8 w-8" aria-hidden="true" />
                <span className="font-orbitron text-[10px] font-semibold sm:text-xs">
                  {meta?.label ?? `Slot ${index + 1}`}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
