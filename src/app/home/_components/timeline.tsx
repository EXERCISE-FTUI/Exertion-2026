"use client";

import { signOut } from "@/actions/auth/signOut";
import ButtonRedirect from "@/components/ui/ButtonRedirect";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Orbitron } from "next/font/google";
import { Exo_2 } from "next/font/google";
import { Inter } from "next/font/google";
import Image from "next/image";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["500"] });
const exo2 = Exo_2({ subsets: ["latin"], weight: ["500"] });
const inter = Inter({ subsets: ["latin"] });

const Timeline = () => {
  return (
    <div id="timeline" className="relative h-full w-full max-w-[2200px]">
      <Image
        src="/home/timeline/poly1.svg"
        alt="poly"
        width={300}
        height={300}
        className="absolute bottom-[44vw] left-0 h-[20vw] md:top-[45%] md:h-[9rem] lg:h-[16rem]"
      />

      <Image
        src="/home/timeline/poly2.svg"
        alt="poly"
        width={300}
        height={300}
        className="absolute right-1 bottom-[26.5vw] sm:bottom-[20%] md:bottom-[20%] lg:-translate-y-[3rem] md:-translate-y-[3rem] lg:right-[0rem] h-[15vw] md:h-[7rem] lg:h-[10rem]"
      />

      <Image
        src="/home/timeline/poly3.svg"
        alt="poly"
        width={300}
        height={300}
        className="absolute top-[1vw] left-4 h-[14vw] md:top-[4rem] md:h-[7rem] lg:left-8 lg:top-[1.5rem] lg:h-[10rem]"
      />

      <Image
        src="/home/timeline/wire1.svg"
        alt="wire"
        width={400}
        height={100}
        className="animate-pulse absolute top-[34vw] left-0 h-[6vw] md:top-[25%] md:translate-y-[4.8rem] lg:translate-y-[2.8rem] md:h-[3rem] lg:h-[4rem]"
      />

      <Image
        src="/home/timeline/wire2.svg"
        alt="wire"
        width={400}
        height={100}
        className="animate-pulse absolute top-[42vw] right-0 h-[6vw] md:top-[40%] md:translate-y-[1.1rem] lg:translate-y-[0.6rem] md:h-[3rem] lg:h-[4rem]"
      />

      <Image
        src="/home/timeline/wire3.svg"
        alt="wire"
        width={400}
        height={100}
        className="z-20 animate-pulse absolute mt-[8%] h-[10vw] left-1/2 -translate-x-1/2 md:mt-[17vw] lg:mt-[11vw] xl:mt-[8vw] lg:h-[5.5rem]"
      />

      <Image
        src="/home/timeline/SegiEnam.svg"
        alt="segi enam"
        width={400}
        height={400}
        className="z-10 animate-pulse-slow absolute bottom-[12vw] -left-0.95 h-[16vw] md:bottom-[10%] md:-translate-y-[3.5rem] lg:translate-y-[1rem] lg:left-[1rem] md:h-[8rem] lg:h-[12rem]"
      />

      <img
        src="/home/timeline/maskot_kuas.svg"
        alt="segi enam"
        className="z-10 animate-pulse-slow absolute -bottom-[12vw] right-[18vw] h-[30vw] md:-bottom-[25] md:translate-y-[0rem] lg:-translate-y-[8rem] lg:right-[26rem] md:h-[16rem] lg:h-[20rem]"
      />

      <img
        src="/home/timeline/maskot_lampu.svg"
        alt="segi enam"
        className="z-10 animate-pulse-slow absolute -top-[12vw] right-0 h-[38vw] md:-top-[5vw] lg:-translate-y-[2rem] md:h-[20rem] lg:h-[25rem]"
      />

      <div
        id="timeline_content"
        className={`${orbitron.className} relative z-20 flex w-full max-w-[2200px] flex-col items-center pt-[10vw] pb-[5vw] text-[6vw] font-medium text-[#FFFFFF] md:pt-[8rem] md:pb-[5rem] md:text-[3.5rem] lg:text-[3.5rem] [-webkit-text-stroke:1px_#5297C1CC] [paint-order:stroke_fill] [text-shadow:0_0_1px_#fff,0_0_1px_#fff]`}
      >
        Timeline
        <div className="z-20 flex h-auto w-full items-center justify-center">
          <img
            src="/home/timeline/TimelineBaru.svg"
            alt="Timeline"
            className="mt-[4%] h-auto w-[80%] pl-3 md:w-[50rem] md:pl-10 pb-10 md:pb-[3rem] lg:pb-[15rem]"
          />
        </div>
      </div>
    </div>
  );
};

export default Timeline;
