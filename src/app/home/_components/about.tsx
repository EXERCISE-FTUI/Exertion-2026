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
        alt="poly"
        width={300}
        height={300}
        className="home-about-poly absolute top-[4vw] left-[18vw] z-30 h-[15vw] lg:left-[7rem] lg:top-[40%] lg:h-[11rem] lg:-translate-y-[16vw]"
      />
      <Image
        src="/home/about/robot.svg"
        alt="tangan robot"
        width={800}
        height={800}
        className="home-about-robot absolute -top-[6vw] right-8 z-30 h-[21vw] lg:top-[40%] lg:h-[14rem] lg:-translate-y-[22rem] md:right-[10vw] lg:right-[8rem]"
      />
      <Image
        src="/home/about/SegiEnam.svg"
        alt="segi enam"
        width={500}
        height={500}
        className="home-about-hex animate-pulse-slow absolute z-10 top-[8vw] right-[25vw] h-[20vw] lg:top-[40%] lg:h-[12rem] lg:right-[22rem] lg:-translate-y-[12.5rem]"
      />
      <div
        className={`z-10 home-about-title ${orbitron.className} absolute lg:translate-x-[60%] lg:translate-y-[3%] lg1300:right-1/2 z-20 -mt-[26vw] w-[64vw] max-w-[46rem] gap-[1.8vw] text-right text-[5.8vw] font-bold text-white xs:-mt-3 xs:pt-[7vw] lg:top-[16rem] lg:right-[38rem] lg:mt-0 lg:w-auto lg:pt-0 lg:pb-4 lg:pl-0 lg:text-[3.5rem] lg:font-medium lg:[-webkit-text-stroke:1px_rgba(82,151,193,0.8)] lg:[paint-order:stroke_fill] lg:[text-shadow:0_0_25px_rgba(255,255,255,0.25)] lg1300:pb-9`}
      >
        <h1>About Exertion</h1>
      </div>
      <div className="home-about-copy absolute lg:left-1/2 lg:-translate-x-1/2 z-20 -mb-[6.5vw] max-h-[13rem] w-[70vw] max-w-[46rem] px-[9vw] text-left text-[1.6vw] leading-[3.2vw] text-white md:text-[1.6vw] xs:-mt-[0vw] lg:top-[25.5rem] lg:w-[80vw] lg:px-10 lg:text-[1.5rem] lg:leading-[2.3rem] lg1300:w-[50rem] lg1300:text-[1.2rem]">
        EXERTION UI adalah sebuah event yang diselenggarakan oleh EXERCISE FTUI. EXERTION UI 2026 hadir menjadi wadah bagi mahasiswa dan siswa di Indonesia untuk mengembangkan keterampilan di bidang teknik, teknologi, dan kreativitas umum. Serangkaian kegiatan yang dilaksanakan mencakup webinar, awarding, serta kompetisi utama.
      </div>
      <Image
        src="/home/about/FrameAbout.svg"
        alt="frame about"
        width={1200}
        height={600}
        className="z-10 home-about-frame absolute w-[70%] pt-9 lg:top-1/2 lg:left-1/2 lg:w-[70rem] lg:-translate-x-[50%] lg:-translate-y-[40%]"
      />
    </section>
  );
};

export default About;
