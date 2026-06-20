"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";
import "./powerup.css";

export type PowerUpOption = 'hint' | 'add-time' | null;

interface PowerUpComponentProps {
  selectedItems: PowerUpOption[];
  setSelectedItems: React.Dispatch<React.SetStateAction<PowerUpOption[]>>;
}

interface powerUpItemBtnInt {
  index: number;
  currentItem: number | null;
  currentSelectedItem: PowerUpOption;
  handleSelect: () => any;
  className?: string;
}

interface powerUpOptionInt {
  index: number;
  onClick: () => any;
}

const PowerUpOptionsBtn = ({ index, onClick }: powerUpOptionInt) => {
  return (
    <div className="highlight">
      <motion.div
        initial={{ y: 0 }}
        whileHover={{ scale: 1.05, y: -10 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={clsx(
          `flex flex-col items-center gap-2 rounded-md bg-blackish-blue p-5 select-none`,
          { "first-opt": index === 0, "second-opt": index === 1 },
        )}
      >
        <img
          src={`/powerup/${index == 0 ? "clock" : "bulb"}.svg`}
          alt=""
          className="h-24"
        />
        <p className="font-orbitron text-xs text-white">
          {index == 0 ? "Additional Time" : "Hint Question"}
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
}: powerUpItemBtnInt) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={
        currentItem === index ? { y: -10, scale: 1.05 } : { y: 0, scale: 1 }
      }
      onClick={handleSelect}
      className={`${className} z-10 flex min-h-32 min-w-30 justify-center rounded-md bg-skyblue select-none`}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSelectedItem}
          initial={{ scale: 0.5, opacity: currentSelectedItem ? 1 : 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          src={`/powerup/${currentSelectedItem == "hint" ? "bulb" : "clock"}-alt.svg`}
          alt=""
          className="w-20 select-none"
        />
      </AnimatePresence>
    </motion.div>
  );
};

const PowerUpComponent = ({ selectedItems, setSelectedItems }: PowerUpComponentProps) => {
  const [currentItem, setCurrentItem] = useState<number | null>(0);

  const handleChoosingItem = (option: PowerUpOption) => {
    if (currentItem == null) return;
    const newSelectedItems = [...selectedItems];
    newSelectedItems[currentItem] = option;

    setSelectedItems(newSelectedItems);
    const next = newSelectedItems.findIndex((e) => e === null);
    setCurrentItem(next !== -1 ? next : null);
  };

  const removeSelectedItem = (index: number) => {
    const newSelectedItems = [...selectedItems];
    newSelectedItems[index] = null;
    setSelectedItems(newSelectedItems);
  };

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <div className="flex flex-row gap-10">
        <PowerUpOptionsBtn
          index={0}
          onClick={() => handleChoosingItem("add-time")}
        />

        <PowerUpOptionsBtn
          index={1}
          onClick={() => handleChoosingItem("hint")}
        />
      </div>

      <div className="flex flex-row gap-2">
        <p className="font-exo-2 text-xl font-bold text-white">
          Choose your power-up
        </p>
        <img src="/powerup/mascot tunjuk kiri.svg" alt="" />
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
  );
};

export default PowerUpComponent;
