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
        className="absolute bottom-[35vw] -left-[8rem] h-[6rem] md:top-[50%] md:-left-[7rem] md:h-[9rem] lg:h-[16rem] lg:-left-22"
      />

      <Image
        src="/home/timeline/poly2.svg"
        alt="poly"
        width={300}
        height={300}
        className="absolute -right-[7rem] bottom-[26.5vw]  h-[15vw] sm:bottom-[20%] md:h-[7rem] lg:-translate-y-[5rem] lg:-right-[3rem] lg:h-[10rem]"
      />

      <Image
        src="/home/timeline/poly3.svg"
        alt="poly"
        width={300}
        height={300}
        className="absolute top-[1vw] -left-[6rem] h-[14vw] md:top-[4rem] md:-left-[5rem] md:h-[7rem] lg:left-8 lg:top-[3.5rem] lg:h-[8rem]"
      />

      <Image
        src="/home/timeline/wire1.svg"
        alt="wire"
        width={300}
        height={300}
        className="z-10 animate-pulse absolute top-[34vw] -left-[8rem] h-[6vw] md:h-[3rem] md:top-[35%] md:-left-[5rem] lg:top-[24rem] lg:-left-[3rem] lg:h-[4rem]"
      />

      <Image
        src="/home/timeline/wire2.svg"
        alt="wire"
        width={300}
        height={300}
        className="z-10 animate-pulse absolute top-[50vw] -right-[8rem] h-[6vw] md:h-[3rem] md:top-[46%] md:-right-[5rem] lg:top-[33rem] lg:-right-[3rem] lg:h-[4rem]"
      />

      <Image
        src="/home/timeline/wire3.svg"
        alt="wire"
        width={300}
        height={300}
        className="z-10 animate-pulse absolute mt-[8%] h-[10vw] left-1/2 -translate-x-1/2 md:mt-[16vw] lg:mt-[11vw] xl:mt-[8vw] lg:h-[5.5rem]"
      />

      <Image
        src="/home/timeline/SegiEnam.svg"
        alt="segi enam"
        width={300}
        height={300}
        className="z-10 animate-pulse-slow absolute bottom-[2vw] -left-[7.3rem] h-[16vw] md:-bottom-[0rem] md:-left-[5rem] md:h-[8rem] lg:-translate-y-[12rem] lg:-left-[3rem] lg:h-[12rem]"
      />

      <Image
        src="/home/timeline/maskot_kuas.svg"
        alt="segi enam"
        width={300}
        height={300}
        className="z-10 animate-pulse-slow absolute -bottom-[12vw] right-0 h-[30vw] md:right-[8rem] md:h-[15rem] lg:-translate-y-[8rem] lg:right-[20vw] lg:h-[20rem]"
      />

      <Image
        src="/home/timeline/maskot_lampu.svg"
        alt="segi enam"
        width={300}
        height={300}
        className="z-10 animate-pulse-slow absolute -top-[12vw] -right-[7.2rem] h-[38vw] md:h-[20rem] md:-right-[4rem] md:-top-[5vw] lg:h-[25rem]"
      />

      <div
        id="timeline_content"
        className={`${orbitron.className} relative z-20 flex w-full max-w-[2200px] flex-col items-center pt-[10vw] pb-[5vw] text-[6vw] font-medium text-[#FFFFFF] md:pt-[8rem] md:pb-[5rem] md:text-[3rem] lg:text-[3rem] [-webkit-text-stroke:1px_#5297C1CC] [paint-order:stroke_fill] [text-shadow:0_0_1px_#fff,0_0_1px_#fff]`}
      >
        Timeline
        <div className="z-20 flex h-auto w-full items-center justify-center">
          <img
            src="/home/timeline/TimelineFix.svg"
            alt="Timeline"
            className="mt-[4%] h-auto w-[80%] pl-3 md:w-[50rem] md:pl-10 pb-10 md:pb-[3rem] lg:pb-[15rem]"
          />
        </div>
      </div>
    </div>
  );
};

export default Timeline;
