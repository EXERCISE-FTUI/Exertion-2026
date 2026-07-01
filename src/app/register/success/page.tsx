"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CompetitionName = "ExerMind" | "UI/UX Design" | "Business Plan" | "Infografis";

const page = () => {
  const [compName, setCompName] = useState<CompetitionName | "">("");
  const [whatsappLink, setWhatsappLink] = useState<string>("");

  const router = useRouter();

  {/* LINK GRUP INFOGRAFIS BLM ADA, NANTI KLO UDH ADA, JANLUP TAMBAHIN DI DASHBOARD JUGAA */ }
  const Competitions: Record<CompetitionName, { linkwa: string }> = {
    "ExerMind": {
      linkwa: "https://chat.whatsapp.com/Ero62Bg40mM5AY77pnJuDk?s=cl&p=a&mlu=0",
    },
    "UI/UX Design": {
      linkwa: "https://chat.whatsapp.com/JydjCZX0nHa1L6nOIqE9bt?mode=gi_t",
    },
    "Business Plan": {
      linkwa: "", // Belum ada
    },
    "Infografis": {
      linkwa: "https://chat.whatsapp.com/LfPE8MEEi1O8ZEkVrs9n4c?s=cl&p=a&ilr=4",
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
    <main className="flex h-screen w-screen relative z-10 flex-col justify-center items-center p-2 min-[360px]:p-4 md:p-8 lg:p-12 overflow-hidden bg-[#7BBDE8]">
      <img
        src="/register/bg-utama.svg"
        alt=""
        className="absolute inset-y-0 -left-6 w-[108%] max-w-none h-full object-cover z-0 pointer-events-none opacity-100 brightness-100 contrast-110"
      />

      <div className="w-full h-full max-w-4xl relative z-10 flex flex-col justify-center max-h-[80vh] md:max-h-[60vh]">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden md:block"
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
          className="w-full h-full bg-[#001D39]/90 shadow-[0_0_40px_rgba(0,29,57,0.8)] border border-[#4E8EA2]/40 relative flex flex-col overflow-hidden items-center justify-center px-4 py-8 md:px-12 md:py-16"
          style={{
            clipPath: "polygon(0% 20%, 12% 10%, 58% 10%, 65% 0%, 100% 0%, 100% 100%, 0% 100%)"
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
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="block md:hidden drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]"
            />
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
          </svg>

          <div className="absolute left-1.5 min-[480px]:left-2 min-[620px]:max-[767px]:left-3.5 md:left-5 top-1/4 bottom-1/4 w-[2.5px] md:w-[3.5px] bg-white pointer-events-none z-10 block" />

          {/* Inner Content */}
          <div className="relative z-30 flex flex-col items-center justify-center text-center mt-6 md:mt-10">
            <h2 className="font-orbitron text-2xl md:text-4xl lg:text-5xl font-bold tracking-[0.1em] text-[#C2D1D9] mb-2 drop-shadow-[0_0_2px_rgba(255,255,255,0.1)] uppercase">
              THANKYOU FOR REGISTERING
            </h2>
            <p className="font-montserrat text-xs sm:text-sm md:text-base text-[#9BA8B0] font-medium tracking-wide mb-10 md:mb-14">
              Please join the group and stay tuned for the next steps!
            </p>

            <div className="flex flex-col gap-4 w-full items-center">
              <button
                onClick={() => router.push("/home")}
                className="transition-transform hover:scale-105 active:scale-95 focus:outline-none w-full flex justify-center"
              >
                <img
                  src="/register/home_button.svg"
                  alt="Home"
                  className="h-10 md:h-12 lg:h-14 w-auto object-contain"
                />
              </button>

              {whatsappLink && (
                <button
                  onClick={() => window.open(whatsappLink, "_blank")}
                  className="transition-transform hover:scale-105 active:scale-95 focus:outline-none w-full flex justify-center"
                >
                  <img
                    src="/register/whatsApp_button.svg"
                    alt="Join WhatsApp Group"
                    className="h-10 md:h-12 lg:h-14 w-auto object-contain"
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default page;