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

const About = () => {
  return (
    <section className="home-about-section relative flex h-[60vw] w-[120vw] flex-col items-center justify-center gap-[5vw] pt-[10vw] pl-3 xs:pl-2 lg:-mt-10 lg:h-[55rem] lg:max-w-[1200px] lg:items-start lg:justify-start lg:gap-[0.67rem] lg:p-0 lg:pb-13 lg2:gap-[1.3rem] lg1300:max-w-[2200px]">
      <Image
        src="/home/about/poly.svg"
        alt="tangan robot"
        width={300}
        height={300}
        className="home-about-poly absolute top-[27vw] right-0 z-30 h-[12vw] lg:top-[40%] lg:h-[10rem] lg:translate-y-[2rem]"
      />
      <Image
        src="/home/about/SegiEnam.svg"
        alt="segi enam"
        width={300}
        height={300}
        className="home-about-hex animate-pulse-slow absolute z-10 top-[8vw] right-[4vw] h-[16vw] lg:top-[40%] lg:h-[12rem] lg:-translate-y-[12.5rem]"
      />
      <div
        className={`z-10 home-about-title ${orbitron.className} absolute lg:translate-x-[60%] lg:translate-y-[3%] lg1300:right-1/2 z-20 -mt-[26vw] w-[64vw] max-w-[46rem] gap-[1.8vw] text-right text-[5.8vw] font-bold text-[#FFFFFF] xs:-mt-3 xs:pt-[7vw] lg:top-[16rem] lg:right-[38rem] lg:mt-0 lg:w-auto lg:pt-0 lg:pb-4 lg:pl-0 lg:text-[3.5rem] lg:font-medium [-webkit-text-stroke:1px_#5297C1CC] [paint-order:stroke_fill] [text-shadow:0_0_1px_#fff,0_0_1px_#fff] lg1300:pb-9`}
      >
        <h1>About Exertion</h1>
      </div>
      <div className="home-about-copy absolute lg:left-1/2 lg:-translate-x-1/2 z-20 -mb-[6.5vw] max-h-[13rem] w-[70vw] max-w-[46rem] px-[9vw] text-left text-[1.6vw] leading-[3.2vw] text-white md:text-[1.6vw] xs:-mt-[0vw] lg:top-[25.5rem] lg:w-[80vw] lg:px-10 lg:text-[1.5rem] lg:leading-[2.3rem] lg1300:w-[50rem] lg1300:text-[1.2rem]">
        EXERTION UI adalah sebuah event yang diselenggarakan oleh EXERCISE FTUI. EXERTION UI 2026 hadir menjadi wadah bagi mahasiswa dan siswa di Indonesia untuk mengembangkan keterampilan di bidang teknik, teknologi, dan kreativitas umum. Serangkaian kegiatan yang dilaksanakan mencakup webinar, awarding, serta kompetisi utama.
      </div>
      <Image
        src="/home/about/FrameAbout.svg"
        alt="frame about"
        width={300}
        height={300}
        className="z-10 home-about-frame absolute w-[90%] sm:w-[80%] pt-9 lg:top-1/2 lg:left-1/2 lg:w-[70rem] lg:-translate-x-[50%] lg:-translate-y-[40%]"
      />
    </section>
  );
};

export default About;
