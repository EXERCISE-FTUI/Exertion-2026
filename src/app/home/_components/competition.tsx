"use client";

import { signOut } from "@/actions/auth/signOut";
import ButtonRedirect from "@/components/ui/ButtonRedirect";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { Orbitron, Exo_2, Inter } from "next/font/google";
import Image from "next/image";
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
    imageBox: "/home/competition/boxsatu.svg",
    imageIcon: "/home/competition/computer.png",
    guideBookLink: "https://drive.google.com/file/d/1dU5RRlT5tJGJ5S4BMvA0mZVOlHM1EdkA/view?usp=sharing",
    description: `UI/UX Design adalah kompetisi bagi mahasiswa/i untuk mengasah
keterampilan desain, kreativitas, dan kemampuan mahasiswa dalam
melakukan analisis terhadap sebuah masalah untuk diberikan solusi penuh
berupa desain dan pengalaman user secara inovatif dan efisien. Semua peserta
diminta untuk merancang prototype aplikasi berdasarkan tema yang diberikan
untuk memecahkan masalah dengan desain yang menarik dan mudah
digunakan oleh pengguna. Nantinya karya akan dinilai oleh juri. Setiap tim
beranggotakan maksimal 3 orang dan 1 orang hanya bisa mendaftar sebagai 1
tim.`,
  },
  {
    id: 2,
    title: "ExerMind",
    imageBox: "/home/competition/boxdua.svg",
    imageIcon: "/home/competition/brain.png",
    guideBookLink: "https://drive.google.com/file/d/1myWCG9rkP6FEG_kMdGFxnlDvl7VuxFKX/view?usp=sharing",
    description: `ExerMind merupakan kompetisi bagi siswa/i SMA/SMK
sederajat untuk mengasah kemampuan logika dan matematika
melalui berbagai soal dan permainan. Peserta diharapkan
mampu menyelesaikan setiap tantangan yang diberikan. Setiap
tim terdiri dari 1–3 orang dan setiap peserta hanya
diperbolehkan tergabung dalam 1 tim. Kompetisi ini terdiri dari
dua babak, yaitu babak penyisihan dan babak 10 besar.`,
  },
  {
    id: 3,
    title: "Business Plan",
    imageBox: "/home/competition/boxtiga.svg",
    imageIcon: "/home/competition/lightbulb.png",
    guideBookLink: "",
    description: `Business Plan Competition adalah kompetisi bagi mahasiswa/i untuk mengembangkan ide bisnis yang inovatif menjadi rencana bisnis yang terstruktur dan kompetitif. Peserta akan menyusun model bisnis, strategi, dan peluang pengembangan untuk menghasilkan business plan yang berkualitas. Tujuh tim terbaik (Top 7) akan melaju ke babak final untuk mempresentasikan rencana bisnis mereka di hadapan dewan juri. Setiap tim terdiri dari 1–3 orang.`,
  },
  {
    id: 4,
    title: "Infographic",
    imageBox: "/home/competition/boxempat.svg",
    imageIcon: "/home/competition/paper.png",
    guideBookLink: "https://drive.google.com/file/d/1WiBdBdHqAP-FlP-xSfMU6-ha47MbyjrB/view?usp=sharing",
    description: `Infografis merupakan kompetisi bagi siswa/i SMA/SMK sederajat
untuk mengasah kemampuan berpikir kritis, analisis, dan problem
solving dalam menyelesaikan permasalahan teknologi melalui ide
solusi yang inovatif dan relevan. Peserta akan diberikan sebuah studi
kasus teknologi nyata untuk dianalisis dan diselesaikan melalui
infografis visual yang menarik dan mudah dipahami. Karya peserta akan dinilai oleh juri berdasarkan solusi yang diberikan, serta kualitas
visual infografis. Setiap tim terdiri dari maksimal 3 orang dan setiap
peserta hanya diperbolehkan tergabung dalam 1 tim.`,
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
      <Image
        src="/home/competition/SegiEnam.svg"
        alt="segienam"
        width={300}
        height={300}
        className="animate-pulse-slow absolute -top-15 right-0 h-[20vw] lg:h-[16rem] lg:-top-[11rem]"
      />

      <Image
        src="/home/competition/Bulet.svg"
        alt="segienam"
        width={300}
        height={300}
        className="animate-pulse-slow absolute top-1 right-13 h-[12vw] lg:top-[1rem] lg:right-[10vw] lg:h-[8rem]"
      />

      <Image
        src="/home/competition/maskot_mata.svg"
        alt="kawat"
        width={300}
        height={300}
        className="absolute -top-[8vw] left-0 z-10 h-[30vw] animate-pulse lg:h-[20rem]"
      />

      <Image
        src="/home/competition/SegiEnam2.svg"
        alt="gambar segi enam"
        width={300}
        height={300}
        className="animate-pulse-slow absolute bottom-[4vw] left-0 z-10 h-[16vw] lg:h-[12rem] lg:translate-y-[1rem]"
      />

      <Image
        src="/home/competition/Kawat2.svg"
        alt="kawat"
        width={300}
        height={300}
        className="absolute right-0 bottom-[8vw] h-[12vw] animate-pulse lg:bottom-[13rem] lg:h-[8rem]"
      />

      <div className="flex h-auto w-[80vw] flex-col items-center justify-center lg:w-[55vw] lg:gap-[3rem]">
        <div className="relative flex flex-col items-center justify-center">
          <Image
            src="/home/timeline/wire3.svg"
            alt="kawat tipis"
            width={300}
            height={100}
            className="absolute top-[-0.3rem] left-1/2 z-10 h-[10vw] -translate-x-1/2 animate-pulse md:max-lg:top-[-0.5rem] lg:top-[-2.55rem] lg:h-[9rem]"
          />

          <div
            className={`relative z-20 text-center text-[6vw] font-medium text-[#FFFFFF] lg:text-[3rem] [-webkit-text-stroke:1px_#5297C1CC] [paint-order:stroke_fill] [text-shadow:0_0_1px_#fff,0_0_1px_#fff] ${orbitron.className}`}
          >
            Competition
          </div>
        </div>

        {COMPETITIONS.map((item) => {
          const translateClass =
            openSection === item.id
              ? item.id % 2 !== 0
                ? "-translate-x-[11vw] lg:-translate-x-[6.5vw]"
                : "translate-x-[11vw] lg:translate-x-[12.2vw]"
              : "translate-x-0";
          const arrowTranslateClass =
            openSection === item.id
              ? item.id % 2 !== 0
                ? "-translate-x-[11vw] lg:-translate-x-[6.5vw]"
                : "translate-x-[11vw] lg:translate-x-[12.2vw]"
              : "translate-x-0";
          return (
            <div
              key={item.id}
              className="flex flex-col items-center justify-center"
            >
              <div
                className="z-20 flex h-[12vw] w-[90vw] max-w-[2200px] flex-col items-center justify-center lg:h-[5rem] cursor-pointer"
                onClick={() => setOpenSection(openSection === item.id ? null : item.id)}
              >
                <img
                  src={item.imageBox}
                  alt={item.title}
                  className={`absolute h-[12vw] transition-transform duration-500 ease-in-out lg:h-[7rem] pointer-events-none ${translateClass}`}
                />

                <div className="relative z-20 w-[70vw] lg:w-[36.5rem]">
                  <div
                    className={`flex justify-center`}
                  >
                    <div
                      className={`transition-transform duration-500 ease-in-out ${translateClass} text-[3vw] font-normal text-white lg:text-[2rem] ${orbitron.className}`}
                    >
                      {item.title}
                    </div>

                    <div
                      className={`absolute top-1/2 -translate-y-1/2 fill-none stroke-[#03CDFE] stroke-[2] transition-transform duration-500 ease-in-out ${arrowTranslateClass} ${item.id % 2 !== 0 ? "right-[9vw] lg:right-[3rem]" : "left-[9vw] lg:left-[3rem]"}`}
                    >
                      <ChevronDownArrow
                        className={`h-[5vw] w-[5vw] origin-center transform-gpu fill-none stroke-[#03CDFE] stroke-[2] transition-transform duration-300 ease-in-out lg:h-[3rem] lg:w-[3rem] ${openSection === item.id ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`flex w-full max-w-[57.5rem] items-center justify-center transition-all duration-500 ease-in-out ${openSection === item.id
                  ? "max-h-screen opacity-100"
                  : "max-h-0 opacity-0"
                  }`}
              >
                <div
                  ref={(el) => {
                    contentRefs.current[item.id] = el;
                  }}
                  className={`-mt-1 mb-[1rem] lg:mb-[3rem] flex w-4/5 transform gap-[2vw] bg-[#1C1010]/50 px-[4vw] py-[3vw] shadow-[0_0_5px_#03CDFE] transition-all duration-500 ease-in-out lg:-mt-[4rem] lg:mr-[2.5vw] lg:ml-[8vw] lg:w-full lg:translate-y-[3.2rem] lg:gap-[1.5vw] lg:px-[2vw] lg:py-[2vw] ${openSection === item.id ? "translate-y-0" : "-translate-y-4"
                    }`}
                >
                  <div className="flex h-auto w-[10vw] items-center text-white lg:w-[18vw] lg:translate-x-[1.42rem]">
                    <img src={item.imageIcon} alt={item.title} />
                  </div>
                  <div className="flex w-[80%] flex-col items-center">
                    <p
                      className={`text-justify text-[1.9vw] text-white lg:text-[1vw] ${exo2.className}`}
                    >
                      {item.description}
                    </p>

                    <div className="flex w-full justify-center gap-5 pt-[2vw] text-center text-[2vw] lg:pt-[1vw] lg:text-[0.8vw]">
                      <button
                        onClick={() => {
                          if (user) {
                            router.push("/register");
                          } else {
                            router.push("/sign-in");
                          }
                        }}
                        className="w-[50%] rounded-[5px] border border-[#03CDFE] px-[2vw] py-[0.5vw] text-white transition-colors duration-300 hover:bg-white hover:text-[#0a1033] lg:w-[50%] lg:py-[0.8rem] lg:text-[1rem]"
                      >
                        Daftar Sekarang
                      </button>
                      <button
                        onClick={() => {
                          if (item.guideBookLink) {
                            window.open(item.guideBookLink, "_blank");
                          } else {
                            alert("Link Guidebook belum tersedia untuk kompetisi ini.");
                          }
                        }}
                        className="w-[50%] rounded-[5px] border border-[#03CDFE] px-[2vw] py-[0.5vw] text-white transition-colors duration-300 hover:bg-white hover:text-[#0a1033] lg:w-[50%] lg:py-[0.8rem] lg:text-[1rem]"
                      >
                        GuideBook
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Competition;
