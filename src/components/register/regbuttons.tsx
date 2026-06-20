"use client";

import Image from "next/image";

interface SideButtonProps {
  icon: string; // Path to SVG icon (e.g., "/icons/competition.svg")
  label: string; // Tooltip or accessibility label
  active: boolean; // Whether this step is currently active
  onClick: () => void; // Handler when button is clicked
}

export default function Sidebuttons({
  icon,
  label,
  active,
  onClick,
}: SideButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all duration-300 ${
        active
          ? "border-green-400 bg-gradient-to-br from-green-300/30 to-green-500/10 shadow-[0_0_15px_5px_rgba(0,255,150,0.5)]"
          : "border-white hover:border-green-300 hover:shadow-md"
      }`}
    >
      <Image
        src={icon}
        alt={label}
        width={28}
        height={28}
        className={`transition-transform duration-300 ${active ? "scale-110" : "opacity-80"}`}
      />
    </button>
  );
}
