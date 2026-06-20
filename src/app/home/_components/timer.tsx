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
const inter = Inter({ subsets: ["latin"] });

const Timer = () => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [openSection, setOpenSection] = useState<number | null>(null);

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
    const targetDate = new Date("2025-07-29T23:59:59").getTime(); // jam tujuan

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
      <div className="flex w-full items-center justify-center gap-[2vw] md:gap-[2rem]">
        {(
          [
            ["Days", timeLeft.days],
            ["Hours", timeLeft.hours],
            ["Minutes", timeLeft.minutes],
          ] as [string, number][]
        ).map(([label, value], index) => (
          <React.Fragment key={label}>
            <div
              className="flex h-[min(17vw,9rem)] w-[min(17vw,9rem)] flex-col items-center justify-center rounded-lg border-[2px] shadow-lg backdrop-blur-sm"
              style={{
                borderImage:
                  "linear-gradient(359deg, #FFFFFF -29.88%, #C3DDDD 17.95%, #87BABB 65.82%, #0F7576 160.44%) 1",
                borderImageSlice: 1,
                borderStyle: "solid",
              }}
            >
              <div
                className={`animate-pulse text-[min(5vw,3rem)] font-bold text-white ${orbitron.className}`}
              >
                {String(value).padStart(2, "0")}
              </div>
              <div className="text-[min(3vw,1.5rem)] text-white">{label}</div>
            </div>
            {index < 2 && (
              <div className="animate-pulse px-[0.1rem] text-[min(6vw,3rem)] font-bold text-white">
                :
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="my-[1.5vw] flex w-full items-center justify-center gap-6 text-[min(2vw,1.5rem)] text-white md:my-[1.3rem]">
        <div className="flex w-fit items-center justify-center gap-1">
          <CalendarDays className="w-[4.5vw] md:w-[4.5rem]" />
          <div className="text-[min(2vw,1.5rem)]">29th July 2025</div>
        </div>
        <div className="flex w-fit items-center justify-center gap-1">
          <Clock className="w-[4.5vw] md:w-[4.5rem]" />
          <div className="text-[min(2vw,1.5rem)]">23:59</div>
        </div>
      </div>

      <div className="mb-[2vw] h-[0.2vw] w-[50vw] rounded-full bg-gradient-to-r from-[#A7E9DF] via-[#87BABB] to-[#0F7576] md:h-[0.2rem] md:w-[36rem]" />

      <div className="z-20 flex justify-center gap-4 text-white">
        <button
          onClick={() => {
            if (user) {
              router.push("/register");
            } else {
              router.push("/sign-in");
            }
          }}
          className="h-[10vw] w-[30vw] border-1 border-[#FFFFF] text-[2.8vw] font-medium transition-colors duration-300 hover:bg-white/20 md:w-[20rem] md:text-[1.4rem] lg:h-[5rem]"
          style={{
            borderImage:
              "linear-gradient(359deg, #FFFFFF -29.88%, #C3DDDD 17.95%, #87BABB 65.82%, #0F7576 160.44%) 1",
            borderImageSlice: 1,
            borderStyle: "solid",
          }}
        >
          REGISTER NOW
        </button>

        <button
          onClick={() =>
            window.open(
              "https://drive.google.com/drive/folders/1RZM1bc2-XpTd0RKb_DF_QOKdMLIhL43h",
              "_blank",
            )
          }
          className="h-[10vw] w-[40vw] border-1 border-[#FFFFF] text-[2.8vw] font-medium transition-colors duration-300 hover:bg-white/20 md:w-[20rem] md:text-[1.4rem] lg:h-[5rem]"
          style={{
            borderImage:
              "linear-gradient(359deg, #FFFFFF -29.88%, #C3DDDD 17.95%, #87BABB 65.82%, #0F7576 160.44%) 1",
            borderImageSlice: 1,
            borderStyle: "solid",
          }}
        >
          READ OUR GUIDEBOOK
        </button>
      </div>
    </div>
  );
};

export default Timer;
