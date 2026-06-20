"use client";

import { signOut } from "@/actions/auth/signOut";
import ButtonRedirect from "@/components/ui/ButtonRedirect";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Orbitron } from "next/font/google";
import { Exo_2 } from "next/font/google";
import { Inter } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["500"] });
const exo2 = Exo_2({ subsets: ["latin"], weight: ["500"] });
const inter = Inter({ subsets: ["latin"] });

const Judul = () => {
  return (
    <>
      <div
        id="home"
        className={`animate-pulse-slow z-10 max-w-[2200px] pt-10 text-[min(8vw,5.2rem)] font-bold text-white ${orbitron.className}`}
        style={{ textShadow: "0px 0px 25px #44D5EA" }}
      >
        EXERTION 2025
      </div>
      <div
        className={`z-10 -mt-2 text-[min(2vw,1.5rem)] font-bold text-white ${orbitron.className}`}
        style={{ textShadow: "0px 0px 10px #000000" }}
      >
        Bridging Possibilities: From Human Insight to Digital Impact
      </div>
      <img
        src="/home/timer/arrowdown.png"
        alt="Timeline"
        className="-mt-[12%] h-auto w-full pb-[4vw]"
      />
    </>
  );
};

export default Judul;
