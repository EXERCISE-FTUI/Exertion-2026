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
    title: "Eksploratif",
    description:
      "Exertion 2025 mendorong semangat mahasiswa dan siswa untuk bisa bereksplorasi tanpa batas dan mengetahui lebih dalam permasalahan nyata.",
  },
  {
    id: 1,
    title: "Solutif",
    description:
      "Exertion 2025 membentuk mahasiswa dan siswa yang tidak hanya berfokus terhadap identifikasi masalah, tetapi fokus untuk menciptakan solusi yang terukur dan berdampak.",
  },
  {
    id: 2,
    title: "Inovatif",
    description:
      "Exertion 2025 menanamkan nilai inovatif dengan mendorong mahasiswa dan siswa untuk menciptakan gagasan ide yang tidak hanya fokus pada kreativitas, tetapi tetap aplikatif dan relevan.",
  },
];

const OurValue = () => {
  return (
    <section className="flex h-full w-full max-w-[2200px] flex-col items-center justify-center pt-[15vw] pb-[10vw] md:pt-8 md:pb-[6rem]">
      {/* judul */}
      <div
        className={`${orbitron.className} flex gap-[1vw] pb-[4vw] text-center text-[5vw] font-bold text-white md:gap-2 md:pb-12 md:text-[3.5rem]`}
      >
        <h1>Our</h1>
        <h1 className="bg-gradient-to-b from-white to-[#60C5FF] bg-clip-text text-transparent">
          Value
        </h1>
      </div>

      {/* cards for values */}
      <div className="relative flex max-w-[1000px] flex-wrap justify-center gap-[5vw] md:gap-10">
        {Values.map((value) => (
          <div
            key={value.id}
            className={`animate-pulse-slow relative flex h-[40vw] w-[38%] flex-col items-center rounded-lg bg-white p-[3vw] shadow-lg drop-shadow-[0_0_10px_#44D5EA] md:h-[31vw] md:w-[13rem] md:p-6 lg2:h-[20rem] lg2:w-[15rem] lg1:w-[17rem] ${value.id % 2 !== 0 ? "translate-y-[0vw] md:translate-y-10" : ""} `}
          >
            <img
              src={`/home/ourvalue/ourvalue.svg`}
              alt="wire"
              className="absolute top-0 z-20 h-full w-[110%] md:w-full"
            />

            <h2
              className={`${orbitron.className} pb-[1vw] text-[3.8vw] font-bold text-[#60C5FF] md:pb-3 md:text-[1.5rem] lg2:text-[1.9rem] lg1:text-[2rem]`}
            >
              {value.title}
            </h2>
            <p
              className={`${exo2.className} pt-2 text-center text-[2.1vw] text-gray-700 md:px-3 md:text-[0.7rem] lg2:text-[0.8rem] lg1:text-[0.9rem]`}
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
