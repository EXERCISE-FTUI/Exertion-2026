"use client";

import { signOut } from "@/actions/auth/signOut";
import ButtonRedirect from "@/components/ui/ButtonRedirect";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { Orbitron, Exo_2, Inter } from "next/font/google";
import { ChevronDown as ChevronDownArrow } from "lucide-react";
import { ChevronUp as ChevronUpArrow } from "lucide-react";
import { useRouter } from "next/navigation";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "500"] });
const exo2 = Exo_2({ subsets: ["latin"], weight: ["500"] });
const inter = Inter({ subsets: ["latin"] });

const COMPETITIONS = [
  {
    id: 1,
    title: "UI/UX Design",
    imageBox: "/home/competition/box1.png",
    imageIcon: "/home/competition/computer.png",
    description: `UI/UX Design adalah kompetisi bagi mahasiswa/i untuk mengasah keterampilan desain, kreativitas, dan kemampuan mahasiswa dalam melakukan analisis terhadap sebuah masalah untuk diberikan solusi penuh berupa desain dan pengalaman user secara inovatif dan efisien. Semua peserta diminta untuk merancang prototype aplikasi berdasarkan tema yang diberikan untuk memecahkan masalah dengan desain yang menarik dan mudah digunakan oleh pengguna. Nantinya karya akan dinilai oleh juri. Setiap tim beranggotakan maksimal 3 orang dan 1 orang hanya bisa mendaftar sebagai 1 tim.`,
  },
  {
    id: 2,
    title: "ExerMind",
    imageBox: "/home/competition/box2.png",
    imageIcon: "/home/competition/braincog.png",
    description: `ExerMind adalah kompetisi bagi siswa/i SMA/SMK sederajat untuk mengasah dan menguji kemampuan logika dan matematika peserta melalui soal-soal dan permainan. Semua peserta diharapkan untuk dapat menjawab soal-soal yang tersedia. Setiap tim terdiri dari 1 - 3 orang dan dan 1 orang hanya bisa mendaftar sebagai 1 tim. Terdiri dari 2 babak yaitu babak penyisihan dan babak 10 besar.`,
  },
  {
    id: 3,
    title: "Business Innovation",
    imageBox: "/home/competition/box3.png",
    imageIcon: "/home/competition/lightbulb.png",
    description: `Business Innovation adalah kompetisi bagi mahasiswa/i untuk mendorong kemampuan analisis masalah yang menghasilkan sebuah solusi relevan dalam kehidupan manusia. Mengasah kemampuan mahasiswa/i dalam membuat rancangan ide bisnis sesuai dengan teman yang ditentukan. Seluruh peserta akan mengikuti 3 tahap perlombaan yaitu BMC (Business Model Canvas), Proposal, dan presentasi. Setiap tim beranggotakan maksimal 3 orang. 1 orang hanya bisa mendaftar sebagai 1 tim.`,
  },
];

const Competition = () => {
  const [user, setUser] = useState<User | null>(null);
  const [openSection, setOpenSection] = useState<number | null>(null);
  const contentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    };
    getUser();
  }, []);

  return (
    <div
      id="competitions"
      className="relative mb-[1vw] flex h-full w-full max-w-[2200px] flex-col items-center justify-center pt-[3vw]"
    >
      <img
        src="/home/kotak.svg"
        alt="kotak"
        className="absolute top-0 right-0 h-[20vw] animate-pulse md:h-[10rem] lg:h-[16rem]"
      />

      <img
        src="/home/kotak.svg"
        alt="kotak"
        className="absolute -bottom-[10vw] left-0 h-[20vw] -scale-x-100 animate-pulse md:-bottom-[9rem] md:h-[10rem] lg:h-[16rem]"
      />

      <img
        src="/home/wire.svg"
        alt="wire"
        className="absolute top-[2vw] left-0 z-10 h-[8vw] animate-pulse md:h-[4rem] lg:h-[6rem]"
      />

      <img
        src="/home/wire.svg"
        alt="wire"
        className="absolute right-0 bottom-[2vw] h-[7vw] -scale-x-100 animate-pulse md:bottom-[5rem] md:h-[4rem] lg:h-[6rem]"
      />

      <div className="flex h-auto w-[80vw] flex-col items-center justify-center md:w-[55vw] md:gap-[3rem]">
        <div
          className={`mb-[3vw] text-center text-[4vw] font-bold text-white md:text-[3rem] lg:mb-[3rem] ${orbitron.className}`}
        >
          Competition
        </div>

        {COMPETITIONS.map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-center justify-center"
          >
            <div className="flex h-[15vw] w-[90vw] max-w-[2200px] flex-col items-center justify-center md:h-[5rem] md:w-[100rem]">
              <img
                src={item.imageBox}
                alt={item.title}
                className="absolute h-[12vw] md:h-[7rem] lg:h-[7rem]"
              />

              <div className="relative z-20 w-[70vw] md:w-[40%]">
                <div
                  onClick={() =>
                    setOpenSection(openSection === item.id ? null : item.id)
                  }
                  className={`flex cursor-pointer justify-center`}
                >
                  <div
                    className={`text-[3vw] font-normal text-white md:text-[2rem] ${orbitron.className}`}
                  >
                    {item.title}
                  </div>

                  <div className={`absolute right-0 text-white`}>
                    <ChevronDownArrow
                      className={`h-[5vw] w-[5vw] origin-center transform-gpu text-white transition-transform duration-300 ease-in-out md:h-[3.5vw] md:w-[3.5vw] ${
                        openSection === item.id ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`flex items-center justify-center overflow-hidden transition-all duration-500 ease-in-out ${
                openSection === item.id
                  ? "max-h-screen opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div
                ref={(el) => {
                  contentRefs.current[item.id] = el;
                }}
                className={`flex w-4/5 transform gap-[2vw] border border-cyan-400 border-t-cyan-400 bg-[#0a1033] px-[4vw] py-[3vw] transition-all duration-500 ease-in-out md:mt-[0.5vw] md:mr-[2.5vw] md:ml-[8vw] md:w-1/2 md:gap-[1.5vw] md:border-t-2 md:px-[2vw] md:py-[2vw] ${
                  openSection === item.id ? "translate-y-0" : "-translate-y-4"
                }`}
              >
                <div className="flex h-auto w-[10vw] items-center text-white">
                  <img src={item.imageIcon} alt={item.title} />
                </div>
                <div className="flex w-[80%] flex-col items-center">
                  <p
                    className={`text-justify text-[1.9vw] text-white md:text-[0.8vw] ${exo2.className}`}
                  >
                    {item.description}
                  </p>

                  <div className="flex w-full justify-center gap-5 pt-[2vw] text-center text-[2vw] md:pt-[1vw] md:text-[0.8vw]">
                    <button
                      onClick={() => {
                        if (user) {
                          router.push("/register");
                        } else {
                          router.push("/sign-in");
                        }
                      }}
                      className="w-[50%] rounded-sm border-1 border-white px-[2vw] py-[0.5vw] text-white transition-colors duration-300 hover:bg-white hover:text-[#0a1033]"
                    >
                      Daftar Sekarang
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          "https://drive.google.com/drive/folders/1RZM1bc2-XpTd0RKb_DF_QOKdMLIhL43h",
                          "_blank",
                        )
                      }
                      className="w-[50%] rounded-sm border-1 border-white px-[2vw] py-[0.5vw] text-white transition-colors duration-300 hover:bg-white hover:text-[#0a1033]"
                    >
                      GuideBook
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Competition;
