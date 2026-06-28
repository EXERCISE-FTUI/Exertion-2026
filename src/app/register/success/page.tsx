"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CompetitionName = "ExerMind" | "UI/UX Design" | "Business Innovation";

const page = () => {
  const [compName, setCompName] = useState<CompetitionName | "">("");
  const [whatsappLink, setWhatsappLink] = useState<string>("");

  const router = useRouter();

  const Competitions: Record<CompetitionName, { linkwa: string }> = {
    "ExerMind": {
      linkwa: "https://chat.whatsapp.com/GN4QzCowtvc8VUepQv5sPd",
    },
    "UI/UX Design": {
      linkwa: "https://chat.whatsapp.com/I8nsHzZy7saA6VrTDuAQDw",
    },
    "Business Innovation": {
      linkwa: "https://chat.whatsapp.com/CaDWdhYB4zfCKfUBLX23bh",
    },
  };

  useEffect(() => {
    const fetchCompetitionName = async () => {
      const supabase = await createClient();

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("teams")
            .select("competition_name")
            .eq("leader_user_id", user.id)
            .single();

          if (error && error.code !== "PGRST116") throw error;

          const fetchedCompName = (data?.competition_name || "") as
            | CompetitionName
            | "";
          setCompName(fetchedCompName);

          if (fetchedCompName && Competitions[fetchedCompName]) {
            setWhatsappLink(Competitions[fetchedCompName].linkwa);
          } else {
            setWhatsappLink("");
          }
        } else {
          setCompName("");
          setWhatsappLink("");
          router.push("/");
        }
      } catch (err: any) {
        setCompName("");
        setWhatsappLink("");
      }
    };

    fetchCompetitionName();
  }, []);

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden bg-[#7BBDE8]">
      <img
        src="/register/bg-utama.svg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-100"
      />

      <div className="w-full md:max-w-5xl lg:max-w-7xl width-auto relative z-10">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0 block"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polygon
            points="0 20, 12 10, 58 10, 65 0, 100 0, 100 100, 0 100"
            fill="none"
            stroke="#4E8EA2"
            strokeWidth="8.5"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="opacity-90 drop-shadow-[0_0_10px_rgba(78,142,162,0.7)]"
          />
        </svg>

        <div
          className="w-full bg-[#001D39]/95 border border-[#4E8EA2]/60 relative flex flex-col items-center overflow-hidden text-center shadow-[0_0_40px_rgba(0,29,57,0.8),0_0_60px_rgba(78,142,162,0.5),0_0_120px_rgba(78,142,162,0.25),inset_0_0_60px_rgba(78,142,162,0.08)]"
          style={{
            clipPath: "polygon(0% 20%, 12% 10%, 58% 10%, 65% 0%, 100% 0%, 100% 100%, 0% 100%)",
            paddingTop: "clamp(4rem, 12vw, 8rem)",
            paddingBottom: "clamp(2.5rem, 6vw, 5rem)",
            paddingLeft: "clamp(1.5rem, 5vw, 3rem)",
            paddingRight: "clamp(1.5rem, 5vw, 3rem)",
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20 block"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polyline
              points="61.3 9, 65.5 3, 96 3"
              fill="none"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="hidden md:block drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]"
            />
            <polyline
              points="61.3 9, 65.5 3, 96 3"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="block md:hidden drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]"
            />
          </svg>

          <div className="hidden sm:block absolute left-3 min-[480px]:left-5 md:left-10 top-[28%] bottom-[38%] w-[2.5px] md:w-[3.5px] bg-white pointer-events-none z-10" />

          <h2 className="font-robotech-gp text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-wider text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] mt-6 md:mt-10 mb-4 leading-tight break-words w-full">
            THANKYOU FOR REGISTERING
          </h2>

          <p className="font-exo-2 text-base sm:text-2xl md:text-3xl lg:text-4xl text-white mb-10 md:mb-14 tracking-wide leading-relaxed max-w-xs sm:max-w-lg md:max-w-2xl">
            Please join the group and stay tuned for the next steps!
          </p>

          <div className="mx-auto flex flex-col gap-6 w-full items-center z-20">
            <button
              onClick={() => router.push("/home")}
              className="transition-transform hover:scale-105 active:scale-95 focus:outline-none"
            >
              <img
                src="/register/home_button.svg"
                alt="Home"
                className="h-12 md:h-14 lg:h-16 w-auto object-contain"
              />
            </button>

            {whatsappLink && (
              <button
                onClick={() => window.open(whatsappLink, "_blank")}
                className="transition-transform hover:scale-105 active:scale-95 focus:outline-none"
              >
                <img
                  src="/register/whatsApp_button.svg"
                  alt="Join WhatsApp Group"
                  className="h-12 md:h-14 lg:h-16 w-auto object-contain"
                />
              </button>
            )}
          </div>
        </div>

        <img
          src="/register/vector-corner-right.svg"
          alt=""
          className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 w-14 min-[480px]:w-20 md:w-28 lg:w-32 h-auto pointer-events-none z-20 drop-shadow-[0_0_10px_rgba(78,142,162,0.6)]"
        />
      </div>
    </div>
  );
};

export default page;