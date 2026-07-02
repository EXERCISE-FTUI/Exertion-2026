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

const Values = [
  {
    id: 0,
    title: "Critical",
    description:
      "EXERTION 2026 mendorong mahasiswa dan siswa untuk berpikir kritis dalam memahami suatu masalah. Dengan pola pikir yang logis dan objektif, peserta diharapkan mampu menciptakan solusi yang kreatif, tepat sasaran, dan benar-benar bermanfaat bagi masyarakat.",
  },
  {
    id: 1,
    title: "Creative",
    description:
      "EXERTION 2026 memupuk kreativitas mahasiswa dan siswa untuk menciptakan inovasi yang bukan sekadar berbeda. Nilai ini mendorong peserta untuk mengeksplorasi gagasan dan mengubahnya menjadi karya atau solusi yang relevan, bermanfaat, serta memberikan dampak positif yang nyata.",
  },
  {
    id: 2,
    title: "Contributive",
    description:
      "EXERTION 2026 menanamkan nilai kontribusi agar setiap ide dan inovasi tidak hanya sekadar kreatif, tetapi juga membawa manfaat nyata. Nilai contributive ini bertujuan membangun kepedulian peserta terhadap masalah di sekitarnya, sehingga mereka mampu merumuskan solusi yang relevan dan berdampak positif bagi masyarakat di masa depan.",
  },
];

const OurValue = () => {
  return (
    <section className="relative flex h-full w-full max-w-[2200px] flex-col items-center justify-center pt-[8vw] pb-[2vw] md:pt-8 md:mb-[5vw] md:max-lg:pt-[5vw] lg:pt-[6rem] lg:pb-[13rem]">
      <img
        src="/home/ourvalue/kawat.svg"
        alt="kawat"
        className="pointer-events-none absolute top-[2vw] right-0 z-0 h-[12vw] animate-pulse md:top-8 md:h-[10rem] md:max-lg:top-[2vw] md:max-lg:h-[12vw] lg:top-[5rem] lg:h-[8rem]"
      />

      <img
        src="/home/ourvalue/Kawat1.svg"
        alt="robot"
        className="pointer-events-none absolute top-[2vw] left-0 z-0 h-[12vw] animate-pulse md:top-8 md:h-[10rem] md:max-lg:top-[2vw] md:max-lg:h-[12vw] lg:top-[5rem] lg:h-[8rem]"
      />

      {/* judul */}
      <div
        className={`${orbitron.className} flex md:max-lg:gap-[1vw] md:pb-[10vw] md:max-lg:text-[6vw] gap-[1vw] pb-[4vw] text-center text-[6vw] font-medium text-[#FFFFFF] lg:pb-[10vw] md:gap-2 md:text-[3.5rem] [-webkit-text-stroke:1px_#5297C1CC] [paint-order:stroke_fill] [text-shadow:0_0_1px_#fff,0_0_1px_#fff]`}
      >
        <h1>Our Value</h1>
      </div>

      {/* cards for values */}
      <div className="relative flex max-w-full max-h-[700px] flex-wrap justify-center gap-[1vw] md:gap-0 md:max-w-[50rem] lg:max-w-full lg:mb-[4rem] md:max-lg:gap-[1vw] lg1:-mt-12 lg1:-mb-[5rem]">
        {Values.map((value) => (
          <div
            key={value.id}
            className={`relative flex h-[40vw] w-[45%] flex-col items-center p-[3vw] md:w-[20rem] md:h-[20rem] md:p-6 md:max-lg:p-[3vw] lg:w-[21rem] ${value.id % 2 !== 0 ? "translate-y-[0vw] md:translate-y-10 md:max-lg:translate-y-[0vw]" : ""} `}
          >
            <img
              src={`/home/ourvalue/FrameOurValue.svg`}
              alt="frame our value"
              className="absolute z-20 h-full w-full -mt-[6vw] md:-mt-[4rem] xl:-translate-y-[10%] lg1:-translate-y-[0%] lg1300:-translate-y-[60%]"
            />

            <h2
              className={`${orbitron.className} home-value-title z-20 w-full translate-x-[10%] text-left text-[3.5vw] font-semibold text-sky-300 md:-mt-[2rem] md:pt-8 md:pb-3 md:text-[1.7rem] md:max-lg:pt-[3vw] md:max-lg:pb-0 lg:-mt-[3rem] lg:-mb-[0.5rem] lg2:-mt-[5rem]`}
            >
              {value.title}
            </h2>
            <p
              className={`${exo2.className} home-value-desc z-20 w-[80%] text-left text-[1.5vw] font-medium text-white md:w-[16rem] md:text-[0.86rem] md:max-lg:px-4 md:max-lg:leading-[1.08] lg:w-[14rem] lg:text-[0.8rem]`}
            >
              {value.description}
            </p>

          </div>
        ))}
      </div>
    </section>
  );
};

export default OurValue;