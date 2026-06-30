"use client";

import { signOut } from "@/actions/auth/signOut";
import ButtonRedirect from "@/components/ui/ButtonRedirect";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Orbitron } from "next/font/google";
import { Exo_2 } from "next/font/google";
import { Inter } from "next/font/google";
import { CalendarDays, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["500"] });
const exo2 = Exo_2({ subsets: ["latin"], weight: ["500"] });
const inter = Inter({ subsets: ["latin"], weight: ["500"] });

const Timer = () => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [openSection, setOpenSection] = useState<number | null>(null);

  const [showAnnouncement, setShowAnnouncement] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    };

    fetchUser();
  }, []);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    };

    fetchUser();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const targetDate = new Date("2026-08-02T23:59:59").getTime(); // jam tujuan

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60),
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <div className="flex max-w-[2200px] flex-col items-center pb-[4vw] md:pb-[2rem]">
      <div className="flex w-full items-center justify-center gap-[2vw] md:gap-[2rem] mt-[40px] md:mt-[80px]">
        {(
          [
            ["Days", timeLeft.days],
            ["Hours", timeLeft.hours],
            ["Minutes", timeLeft.minutes],
          ] as [string, number][]
        ).map(([label, value], index) => (
          <React.Fragment key={label}>
            <div
              className="flex h-[20vw] w-[20vw] md:h-[7rem] md:w-[7rem] flex-col items-center justify-center rounded-xl bg-black/10 border-[1px] shadow-lg backdrop-blur-md"
              style={{ borderColor: "rgba(255, 255, 255, 0.3)" }}
            >
              <div
                className={`animate-pulse text-[min(5vw,3rem)] font-extra-light text-white ${inter.className}`}
              >
                {String(value).padStart(2, "0")}
              </div>
              <div className="text-[min(3vw,1.5rem)] text-white">{label}</div>
            </div>
            {index < 2 && (
              <div className="animate-pulse px-[0rem] text-[min(7vw,7rem)] font-light text-white ">
                :
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="my-[1.5vw] flex w-full items-center justify-center gap-6 text-[min(2vw,1.5rem)] text-white md:my-[1.3rem]">
        <div className="flex w-fit items-center justify-center gap-1">
          <CalendarDays className="w-[5vw] md:w-[6rem]" />
          <div className="text-[min(2vw,1.5rem)]">2nd August 2026</div>
        </div>
        <div className="flex w-fit items-center justify-center gap-1">
          <Clock className="w-[4.5vw] md:w-[4.5rem]" />
          <div className="text-[min(2vw,1.5rem)]">23:59</div>
        </div>
      </div>

      <div className="mb-[2vw] h-[0.2vw] w-[50vw] rounded-full bg-gradient-to-r from-[#A7E9DF] via-[#55b2df] to-[#99bed0] md:h-[0.2rem] md:w-[36rem]" />

      <div className="z-20 flex flex-col items-center justify-center gap-4 text-white">
        <button
          onClick={() => {
            if (user) router.push("/register");
            else router.push("/sign-in");
          }}
          className="relative flex items-center justify-center h-[12vw] w-[70vw] md:h-[5rem] md:w-[18rem] rounded-lg bg-black/15 text-[min(3.5vw,1.1rem)] font-normal tracking-wide transition-all duration-300 hover:bg-white/20 backdrop-blur-md"
        >
          <span className="z-10">REGISTER NOW</span>
          <div 
            className="pointer-events-none absolute inset-0 rounded-lg p-[3px] bg-gradient-to-b from-[#55b2df] to-[#8bc6e8]" 
            style={{
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude"
            }}
          />
        </button>

        <button
          onClick={() => setShowAnnouncement(true)}
          className="relative flex items-center justify-center h-[12vw] w-[70vw] md:h-[5rem] md:w-[18rem] rounded-lg bg-black/15 text-[min(3.5vw,1.1rem)] font-normal tracking-wide transition-all duration-300 hover:bg-white/20 backdrop-blur-md"
        >
          <span className="z-10">ANNOUNCEMENT</span>
          <div 
            className="pointer-events-none absolute inset-0 rounded-lg p-[3px] bg-gradient-to-b from-[#55b2df] to-[#8bc6e8]" 
            style={{
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude"
            }}
          />
        </button>

        <button
          onClick={() =>
            window.open(
              "https://drive.google.com/drive/folders/1RZM1bc2-XpTd0RKb_DF_QOKdMLIhL43h",
              "_blank",
            )
          }
          className="relative flex items-center justify-center h-[12vw] w-[70vw] md:h-[5rem] md:w-[18rem] rounded-lg bg-black/15 text-[min(3.5vw,1.1rem)] font-normal tracking-wide transition-all duration-300 hover:bg-white/20 backdrop-blur-md"
        >
          <span className="z-10">READ OUR GUIDEBOOK</span>
          <div 
            className="pointer-events-none absolute inset-0 rounded-lg p-[3px] bg-gradient-to-b from-[#55b2df] to-[#8bc6e8]" 
            style={{
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude"
            }}
          />
        </button>
      </div>
    {showAnnouncement && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xl z-50 flex items-center justify-center p-4 transition-all duration-300">
          
          {/* Main Cyber Card Container */}
          <div className="relative bg-[#06152d]/90 border border-[#44D5EA]/30 rounded-2xl p-8 w-[90vw] max-w-[420px] flex flex-col items-center shadow-[0_0_50px_rgba(68,213,234,0.15),inset_0px_0px_30px_rgba(68,213,234,0.1)] overflow-hidden">
            
            {/* Dekorasi Sudut Cyberpunk (Aksen Garis Khas Sci-Fi) */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#44D5EA]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#44D5EA]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#44D5EA]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#44D5EA]" />

            {/* Icon Gimmick Kunci / Loading Pulsing di Atas */}
            <div className="mb-4 relative flex items-center justify-center">
              <div className="absolute w-12 h-12 rounded-full border border-[#44D5EA]/40 animate-ping" />
              <div className="w-10 h-10 rounded-full bg-[#44D5EA]/10 border border-[#44D5EA] flex items-center justify-center shadow-[0_0_15px_#44D5EA]">
                <Clock className="w-5 h-5 text-[#44D5EA]" />
              </div>
            </div>
            
            {/* Teks Judul Utama - Menggunakan Gradient Text */}
            <h3 className={`text-[1.4rem] md:text-[1.6rem] font-bold bg-gradient-to-r from-white via-[#A7E9DF] to-[#44D5EA] bg-clip-text text-transparent text-center tracking-widest mb-10 drop-shadow-[0_0_10px_rgba(68,213,234,0.3)] ${orbitron.className}`}>
              NOT YET ANNOUNCED
            </h3>
            
            {/* GIMMICK HOLOGRAPHIC PODIUM */}
            <div className="flex items-end justify-center gap-4 w-full mb-8 h-[160px] px-2 relative">
              {/* Garis Dasar Podium (Glow Floor) */}
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#44D5EA]/50 to-transparent shadow-[0_0_10px_#44D5EA]" />

              {/* PODIUM 2ND PLACE (Kiri) */}
              <div className="flex flex-col items-center flex-1 group">
                <span className={`text-white/50 text-xs font-semibold mb-2 tracking-wider ${exo2.className}`}>2nd Place</span>
                <div className="w-full h-24 bg-gradient-to-t from-[#06152d] to-[#87BABB]/20 border-t-2 border-x border-[#87BABB]/40 rounded-t-xl flex flex-col items-center justify-center shadow-[inset_0px_0px_15px_rgba(255,255,255,0.05)] transition-all duration-300 group-hover:to-[#87BABB]/30">
                  <span className={`text-2xl font-black text-[#87BABB] drop-shadow-[0_0_8px_rgba(135,186,187,0.5)] ${orbitron.className}`}>2</span>
                  <div className="w-8 h-[2px] bg-[#87BABB]/40 mt-1" />
                </div>
              </div>
              
              {/* PODIUM 1ST PLACE (Tengah - Paling Tinggi, Megah & Ultra Glow) */}
              <div className="flex flex-col items-center flex-1 z-10 scale-105">
                <span className={`text-[#44D5EA] text-sm font-black mb-2 tracking-widest animate-pulse drop-shadow-[0_0_10px_#44D5EA] ${exo2.className}`}>1st Place</span>
                <div className="w-full h-32 bg-gradient-to-t from-[#06152d] via-[#44D5EA]/10 to-[#44D5EA]/30 border-t-2 border-x border-[#44D5EA] rounded-t-xl flex flex-col items-center justify-center shadow-[0_0_25px_rgba(68,213,234,0.25),inset_0px_0px_20px_rgba(68,213,234,0.15)]">
                  {/* Mahkota / Aksen Bintang Kecil Efek Juara 1 */}
                  <span className={`text-4xl font-black text-white drop-shadow-[0_0_15px_#44D5EA] ${orbitron.className}`}>1</span>
                  <div className="w-12 h-[2px] bg-[#44D5EA] mt-1 shadow-[0_0_8px_#44D5EA]" />
                </div>
              </div>
              
              {/* PODIUM 3RD PLACE (Kanan) */}
              <div className="flex flex-col items-center flex-1 group">
                <span className={`text-white/40 text-xs font-semibold mb-2 tracking-wider ${exo2.className}`}>3rd Place</span>
                <div className="w-full h-16 bg-gradient-to-t from-[#06152d] to-[#0F7576]/10 border-t-2 border-x border-[#0F7576]/30 rounded-t-xl flex flex-col items-center justify-center shadow-[inset_0px_0px_15px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:to-[#0F7576]/20">
                  <span className={`text-xl font-bold text-[#0F7576]/70 ${orbitron.className}`}>3</span>
                  <div className="w-6 h-[2px] bg-[#0F7576]/30 mt-1" />
                </div>
              </div>

            </div>

            {/* Tombol Tutup Pop-Up ala Cyber-Button */}
            <button
              onClick={() => setShowAnnouncement(false)}
              className="relative flex items-center justify-center h-[3rem] w-full rounded-lg bg-white/5 border border-white/20 text-[0.95rem] font-medium tracking-widest text-white/80 transition-all duration-300 hover:bg-[#44D5EA]/10 hover:border-[#44D5EA] hover:text-[#44D5EA] shadow-[inset_0px_0px_10px_rgba(255,255,255,0.02)]"
            >
              CLOSE WINDOW
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;
