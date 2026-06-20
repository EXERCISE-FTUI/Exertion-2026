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
    <section className="relative flex h-[70vw] w-[120vw] flex-col items-center justify-center gap-[5vw] pl-3 xs:pl-2 md:-mt-10 md:h-[35rem] md:max-w-[2200px] md:gap-3 md:p-0 md:pb-13 lg2:gap-[1.3rem] lg:h-[55rem] lg:gap-[0.67rem]">
      <div
        className={`${orbitron.className} z-20 mt-[0.5vw] flex gap-[1.8vw] text-center text-[5vw] font-bold text-white xs:-mt-3 xs:pt-[7vw] md:mt-0 md:gap-3 md:pt-7 md:pl-0 md:text-[4vw] lg:pt-0 lg:pb-4 lg:text-[3rem] lg1300:pb-9`}
      >
        <h1>About</h1>
        <h1 className="bg-gradient-to-b from-white to-[#60C5FF] bg-clip-text text-transparent">
          Exertion
        </h1>
      </div>
      <div className="z-20 -mt-[2vw] max-h-[13rem] w-[80vw] max-w-[46rem] px-[8vw] text-center text-[2vw] leading-[3.2vw] text-white xs:-mt-[0vw] md:mt-0 md:w-[30rem] md:px-10 md:text-[0.65rem] md:leading-[2rem] lg:w-[38rem] lg:text-[0.9rem] lg:leading-[2.3rem] lg1300:w-[45rem] lg1300:text-[1.06rem]">
        EXERTION UI adalah sebuah event yang diselenggarakan oleh EXERCISE FTUI.
        EXERTION UI 2025 hadir menjadi wadah bagi mahasiswa dan siswa di
        Indonesia untuk mengembangkan keterampilan di bidang teknik, teknologi,
        dan kreativitas umum. Serangkaian kegiatan yang dilaksanakan mencakup
        webinar, awarding, serta kompetisi utama.
      </div>
      <img
        src="/home/about/BGJaringFulldanFrame.svg"
        alt="wire and frame"
        className="absolute -top-7 -left-[4vw] z-10 w-full md:top-1/2 md:left-1/2 md:w-[85rem] md:-translate-x-[55%] md:-translate-y-[40%]"
      />
    </section>
  );
};

export default About;
