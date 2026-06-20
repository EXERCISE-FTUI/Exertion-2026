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

const Timeline = () => {
  return (
    <div id="timeline" className="relative h-full w-full max-w-[2200px]">
      <img
        src="/home/timeline/maskot_umpet2.svg"
        alt="maskot_umpet2"
        className="animate-float absolute bottom-[66vw] left-0 h-[15vw] scale-x-100 animate-bounce md:top-[50%] md:bottom-[50%] md:h-[7rem] lg:h-[10rem]"
      />

      <img
        src="/home/wire.svg"
        alt="wire"
        className="animate-pulse-slow absolute top-[25vw] right-0 h-[8vw] -scale-x-100 md:top-[40%] md:bottom-[60%] md:h-[4rem] lg:h-[6rem]"
      />

      <img
        src="/home/kotak.svg"
        alt="kotak"
        className="animate-pulse-slow absolute right-0 bottom-[14vw] h-[20vw] md:top-[70%] md:bottom-[30%] md:h-[10rem] lg:h-[16rem]"
      />

      <img
        src="/home/wire.svg"
        alt="wire"
        className="animate-pulse-slow absolute top-[18vw] left-0 h-[8vw] md:top-[30%] md:bottom-[70%] md:h-[4rem] lg:h-[6rem]"
      />

      <img
        src="/home/timeline/maskot_umpet.svg"
        alt="maskot_umpet"
        className="animate-float absolute top-[5vw] right-0 h-[15vw] animate-bounce md:top-[5rem] md:h-[7rem] lg:h-[10rem]"
      />

      <img
        src="/home/kotak.svg"
        alt="kotak"
        className="animate-pulse-slow absolute bottom-[20vw] h-[20vw] -scale-x-100 md:top-[75%] md:bottom-[25%] md:h-[10rem] lg:h-[16rem]"
      />

      <div
        id="timeline"
        className={`flex w-full max-w-[2200px] flex-col items-center pt-[10vw] pb-[5vw] text-[4vw] font-bold text-white md:pt-[8rem] md:pb-[5rem] md:text-[3rem] ${orbitron.className}`}
      >
        Timeline
        <div className="flex h-auto w-full items-center justify-center">
          <img
            src="/home/timeline/timeline.svg"
            alt="Timeline"
            className="mt-[4%] h-auto w-[80%] pl-3 md:w-[50rem] md:pl-10"
          />
        </div>
      </div>
    </div>
  );
};

export default Timeline;
