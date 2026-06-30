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
    <div className="pt-[270px] md:pt-[320px] w-full flex flex-col items-center relative z-10">
      <div className="relative flex items-center justify-center">

        <img 
          src="/home/timer/background.svg" 
          alt="Hexagon Background" 
          className="absolute top-1/2 left-1/2 -z-10 w-[150vw] md:w-[100vw] max-w-none -translate-x-1/2 -translate-y-1/2 pointer-events-none object-contain" 
        />
      <div
        id="home"
        className={`text-[min(8vw,5.2rem)] font-bold text-white/75 drop-shadow-md  ${orbitron.className}`}
        style={{ textShadow: "0px 0px 10px #000000"}}
      >
        EXERTION 2026
      </div>
    </div>
      <div
        className={`-mt-5 text-[min(1.5vw,2rem)] font-bold text-white/75 drop-shadow-md text-center scale-x-155 scale-y-140 ${orbitron.className}`}
        style={{ textShadow: "0px 0px 10px #000000" }}
      >
        Beyond Idea : Designing Impact for Tomorrow 
      </div>
      
      
    </div>
  );
};

export default Judul;