"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";
import type { PowerUpOption, PowerUpType } from "./powerup";

export interface ChoosePowerProps {
  onComplete?: (powerUps: PowerUpType[]) => void;
  disabled?: boolean;
}

interface PowerUpOptionBtnProps {
  index: number;
  onClick: () => void;
  disabled?: boolean;
}

const PowerUpOptionsBtn = ({
  index,
  onClick,
  disabled = false,
}: PowerUpOptionBtnProps) => {
  return (
    <div className="highlight">
      <motion.div
        initial={{ y: 0 }}
        whileHover={disabled ? undefined : { scale: 1.05, y: -10 }}
        whileTap={disabled ? undefined : { scale: 0.95 }}
        onClick={disabled ? undefined : onClick}
        className={clsx(
          `flex flex-col items-center gap-2 rounded-md bg-blackish-blue p-3 select-none w-38 pt-12 cursor-pointer`,
          {
            "first-opt": index === 0,
            "second-opt": index === 1,
            "third-opt": index === 2,
            "opacity-50 cursor-not-allowed": disabled,
          },
        )}
      >
        <img
          src={`/powerup/${
            index === 0 ? "clocknew" : index === 1 ? "bulbnew" : "point"
          }.svg`}
          alt=""
          className="h-18"
        />
        <p className="font-orbitron text-xs text-white">
          {index === 0 ? "FREEZE TIME" : index === 1 ? "HINT" : "DOUBLEUP POINT"}
        </p>
      </motion.div>
    </div>
  );
};

interface PowerUpItemBtnProps {
  index: number;
  currentItem: number | null;
  currentSelectedItem: PowerUpOption;
  handleSelect: () => void;
  disabled?: boolean;
  className?: string;
}

const PowerUpItemBtn = ({
  index,
  currentItem,
  currentSelectedItem,
  handleSelect,
  disabled = false,
  className,
}: PowerUpItemBtnProps) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={
        currentItem === index ? { y: -10, scale: 1.05 } : { y: 0, scale: 1 }
      }
      onClick={disabled ? undefined : handleSelect}
      className={`${className} z-10 flex min-h-32 min-w-30 justify-center rounded-md bg-blackish-blue select-none cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSelectedItem ?? `empty-${index}`}
          initial={{ scale: 0.5, opacity: currentSelectedItem ? 1 : 0 }}
          animate={{ scale: 1, opacity: currentSelectedItem ? 1 : 0 }}
          exit={{ scale: 0.5, opacity: 0 }}
          src={
            currentSelectedItem
              ? `/powerup/${
                  currentSelectedItem === "HINT"
                    ? "bulbnew"
                    : currentSelectedItem === "DOUBLE_POINTS"
                      ? "point"
                      : "clocknew"
                }.svg`
              : undefined
          }
          alt=""
          className="w-20 select-none"
        />
      </AnimatePresence>
    </motion.div>
  );
};

export default function ChoosePower({
  onComplete,
  disabled = false,
}: ChoosePowerProps) {
  const [currentItem, setCurrentItem] = useState<number | null>(0);
  const [selectedItems, setSelectedItems] = useState<PowerUpOption[]>([
    null,
    null,
    null,
  ]);

  const handleChoosingItem = (power: PowerUpType) => {
    if (disabled || currentItem === null) return;
    const updated = [...selectedItems];
    updated[currentItem] = power;
    setSelectedItems(updated);

    // Auto-advance to next empty slot
    const nextSlot = updated.findIndex((item) => item === null);
    setCurrentItem(nextSlot !== -1 ? nextSlot : null);
  };

  const removeSelectedItem = (index: number) => {
    if (disabled) return;
    const updated = [...selectedItems];
    updated[index] = null;
    setSelectedItems(updated);
  };

  const isComplete =
    selectedItems.length === 3 &&
    selectedItems.every((item): item is PowerUpType => item !== null);

  const submitSelection = () => {
    if (!isComplete || disabled) return;
    onComplete?.(selectedItems as PowerUpType[]);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="flex min-h-screen flex-col justify-between overflow-hidden p-10 bg-[url('/powerup/background.svg'),linear-gradient(180deg,#528CC0_0%,#528FC5_50%,#7CBCE8_100%)] bg-cover bg-center">
        {/* Logo */}
        <div>
          <img
            src="/home/header/logo_exertion.svg"
            alt="EXERTION Logo"
            className="h-12"
          />
        </div>

        {/* PowerUp Selection */}
        <div className="max-w-none z-20 flex w-full flex-col items-center gap-10">
          <div className="flex flex-row gap-10">
            <PowerUpOptionsBtn
              index={0}
              onClick={() => handleChoosingItem("TIME_FREEZE")}
              disabled={disabled}
            />

            <PowerUpOptionsBtn
              index={1}
              onClick={() => handleChoosingItem("HINT")}
              disabled={disabled}
            />
          </div>

          <div className="flex flex-row items-center">
            <p className="font-exo-2 text-2xl font-bold text-white pt-8">
              Choose your power-up
            </p>
            <img src="/powerup/mascuit.svg" alt="" className="-my-25 -mx-16" />
          </div>

          <div className="flex flex-row gap-5">
            <PowerUpItemBtn
              index={0}
              currentSelectedItem={selectedItems[0]}
              currentItem={currentItem}
              handleSelect={() => {
                removeSelectedItem(0);
                setCurrentItem(0);
              }}
              disabled={disabled}
              className="first-item"
            />

            <PowerUpItemBtn
              index={1}
              currentSelectedItem={selectedItems[1]}
              currentItem={currentItem}
              handleSelect={() => {
                removeSelectedItem(1);
                setCurrentItem(1);
              }}
              disabled={disabled}
              className="second-item"
            />

            <PowerUpItemBtn
              index={2}
              currentSelectedItem={selectedItems[2]}
              currentItem={currentItem}
              handleSelect={() => {
                removeSelectedItem(2);
                setCurrentItem(2);
              }}
              disabled={disabled}
              className="third-item"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="z-10 mx-10 flex justify-end pt-10">
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
    </div>
  );
}
