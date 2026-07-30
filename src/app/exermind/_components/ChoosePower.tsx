// narda
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";
import "./ChoosePower.css";

type PowerUpOption = "TIME_FREEZE" | "HINT" | "DOUBLE_POINTS" | null; //ditambah doubleup point

interface PowerUpItemBtnProps {
  index: number;
  currentItem: number | null;
  currentSelectedItem: PowerUpOption;
  handleSelect: () => any;
  className?: string;
}

interface PowerUpOptionProps {
  index: number;
  onClick: () => any;
}

const PowerUpOptionsBtn = ({ index, onClick }: PowerUpOptionProps) => {
  return (
    <div className="highlight">
      <motion.div
        initial={{ y: 0 }}
        whileHover={{ scale: 1.05, y: -10 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={clsx(
          `flex flex-col items-center gap-2 rounded-md bg-blackish-blue p-3 select-none w-38 pt-12`, 
          { "first-opt": index === 0, "second-opt": index === 1, "third-opt": index === 2 }, //ditambah third opt
        )}
      >
        <img
          src={`/powerup/${index == 0 ? "clocknew" : index == 1 ? "bulbnew" : "point"}.svg`} //ditambah point
          alt=""
          className="h-18" //ukuran elemen didalem
        />
        <p className="font-orbitron text-xs text-white">
          {index == 0 ? "FREEZE TIME" : index == 1 ? "HINT" : "DOUBLEUP POINT"}
        </p>
      </motion.div>
    </div>
  );
};

const PowerUpItemBtn = ({
  index,
  currentItem,
  currentSelectedItem,
  handleSelect,
  className,
}: PowerUpItemBtnProps) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={
        currentItem === index ? { y: -10, scale: 1.05 } : { y: 0, scale: 1 }
      }
      onClick={handleSelect}
      className={`${className} z-10 flex min-h-32 min-w-30 justify-center rounded-md bg-blackish-blue select-none`}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSelectedItem}
          initial={{ scale: 0.5, opacity: currentSelectedItem ? 1 : 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          src={`/powerup/${currentSelectedItem === "HINT"
            ? "bulbnew"
            : currentSelectedItem === "DOUBLE_POINTS" //ditambah double point
              ? "point"
              : "clocknew"
            }.svg`}
          alt=""
          className="w-20 select-none"
        />
      </AnimatePresence>
    </motion.div>
  );
};

const ChoosePower = ({ onComplete }: { onComplete?: (powers: PowerUpOption[]) => void }) => {
  const [currentItem, setCurrentItem] = useState<number | null>(0);
  const [selectedItems, setSelectedItems] = useState<PowerUpOption[]>([
    null,
    null,
    null,
  ]);

  const handleChoosingItem = (option: PowerUpOption) => {
    const newSelectedItems = [...selectedItems];
    if (currentItem == null) return;

    newSelectedItems[currentItem] = option;

    // set new values
    setSelectedItems(newSelectedItems);
    setCurrentItem((prev) => {
      if (newSelectedItems.includes(null) == false) return null;
      else return newSelectedItems.findIndex((e) => e === null);
    });
  };

  const removeSelectedItem = (index: number) => {
    const newSelectedItems = [...selectedItems];
    newSelectedItems[index] = null;
    setSelectedItems(newSelectedItems);
  };

  const canSubmit = (): boolean => {
    return !selectedItems.includes(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="flex min-h-screen flex-col justify-between overflow-hidden p-10 bg-[url('/powerup/background.svg'),linear-gradient(180deg,#528CC0_0%,#528FC5_50%,#7CBCE8_100%)] bg-cover bg-center">
        {/* Logo */}
        <div>
          <img src="/home/header/logo_exertion.svg" alt="" className="h-12" />
        </div>

        {/* PowerUp Selection  */}
        <div className="max-w-none z-20 flex w-full flex-col items-center gap-10">
          <div className="flex flex-row gap-10">
            <PowerUpOptionsBtn
              index={0}
              onClick={() => handleChoosingItem("TIME_FREEZE")}
            />

            <PowerUpOptionsBtn
              index={1}
              onClick={() => handleChoosingItem("HINT")}
            />

            <PowerUpOptionsBtn //ditambah double point
              index={2}
              onClick={() => handleChoosingItem("DOUBLE_POINTS")}
            />
          </div>

          <div className="flex flex-row">
            <p className="font-exo-2 text-2xl font-bold text-white pt-8 items-center justify-between">
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
              className="third-item"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="z-10 mx-10 flex justify-end pt-10">
          <button
            className="rounded-sm bg-blackish-green px-12 py-2 font-orbitron font-bold text-white disabled:opacity-70"
            onClick={() => {
              if (onComplete) onComplete(selectedItems);
            }}
            disabled={!canSubmit()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChoosePower;
