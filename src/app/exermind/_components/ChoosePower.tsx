// narda
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";
import "./ChoosePower.css";

type PowerUpOption = "hint" | "add-time" | null;

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
}: PowerUpItemBtnProps) => {
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

const ChoosePower = () => {
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
      <div className="flex min-h-screen flex-col justify-between overflow-hidden bg-linear-to-t from-[#0B8071] from-[-10%] via-[#38405F] via-40% to-[#111417] to-[120%] p-10">
        {/* Logo */}
        <div>
          <img src="/home/header/logo_exertion.svg" alt="" className="h-12" />
        </div>

        {/* PowerUp Selection  */}
        <div className="z-20 flex w-full flex-col items-center gap-10">
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
            <img src="/powerup/mascot-tunjuk-kiri.svg" alt="" />
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
              console.log("hello");
            }}
            disabled={!canSubmit()}
          >
            Next
          </button>
        </div>
      </div>

      {/* Background */}
      <div className="[&>svg]:z-10">
        <svg
          className="absolute top-0 right-0 w-64 translate-x-1/4 -translate-y-1/4 stroke-1"
          viewBox="0 0 251 226"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
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

        <svg
          className="absolute top-1/2 left-0 h-32 stroke-1"
          viewBox="0 0 104 166"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M102.838 81.0854L70.6107 157.932L-22.3683 164.696L-80.8017 100.969L-50.1337 17.2461L42.8165 10.4837L102.838 81.0854Z"
            stroke="#FFE2E4"
          />
          <path
            d="M72.3484 70.7147L45.8313 143.106L-40.5916 146.254L-100.429 76.8267L-73.9121 4.43581L12.5099 1.28743L72.3484 70.7147Z"
            stroke="#FFE2E4"
          />
        </svg>

        <svg
          className="absolute top-1/2 right-1/4 hidden w-32 translate-x-1/2 -translate-y-1/2 stroke-1 md:block"
          viewBox="0 0 164 129"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M142.707 59.1277L119.386 122.793L48.7347 127.932L1.42933 69.3398L24.75 5.67484L95.4005 0.535125L142.707 59.1277Z"
            stroke="#FFE2E4"
          />
          <path
            d="M163.348 62.8958L146.056 110.103L89.6971 112.156L50.6752 66.8805L67.9673 19.6735L124.326 17.6201L163.348 62.8958Z"
            stroke="#FFE2E4"
          />
        </svg>

        <svg
          className="absolute top-1/3 left-1/6 hidden w-32 -translate-x-1/2 -translate-y-1/2 stroke-1 md:block"
          viewBox="0 0 151 147"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M150.116 76.8191L126.795 140.484L56.1438 145.623L8.83842 87.0312L32.1591 23.3662L102.81 18.2265L150.116 76.8191Z"
            stroke="#FFE2E4"
          />
          <path
            d="M113.348 45.8958L96.0557 93.1028L39.697 95.1561L0.675144 49.8805L17.9672 2.67348L74.3258 0.620137L113.348 45.8958Z"
            stroke="#FFE2E4"
          />
        </svg>
      </div>
    </div>
  );
};

export default ChoosePower;
