"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CompetitionName = "ExerMind" | "UI/UX Design" | "Business Innovation";

const page = () => {
  const [compName, setCompName] = useState<CompetitionName | "">("");
  const [whatsappLink, setWhatsappLink] = useState<string>("");

  const router = useRouter();

  {/* LINK GRUP INFOGRAFIS BLM ADA, NANTI KLO UDH ADA, JANLUP TAMBAHIN DI DASHBOARD JUGAA */}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
      {/* Overlay */}
      <div className="bg-opacity-95 fixed inset-0 z-40 bg-[#0B1120]" />
      {/* Modal Content */}
      <div className="modal-diagonal-cut relative z-50 flex w-250 flex-col items-center rounded-2xl bg-gradient-to-tl from-[#1E3A8A] to-[#059669] py-19 text-center shadow-xl">
        {/* Robot SVG */}
        <img
          src="/register/robot.svg"
          alt="Robot"
          className="mt-2 mb-2 h-32 w-32"
        />
        <h2 className="mb-2 font-orbitron text-3xl font-semibold tracking-wide text-white sm:text-3xl">
          THANK YOU FOR REGISTERING
        </h2>
        <p className="mb-12 font-exo-2 text-sm text-white sm:text-sm">
          Please join the group and stay tuned for the next steps!
        </p>
        <div className="mx-auto flex w-65 flex-col gap-4">
          <ButtonRedirect
            to="/dashboard"
            className="text-md flex h-11 items-center justify-center border-2 bg-white font-semibold text-black transition-all hover:bg-gray-300"
          >
            <img src="/register/dashboard.svg" alt="Dashboard" className="mr-2 h-6 w-6" />
            <p className="text-black">Dashboard</p>
          </ButtonRedirect>

          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm max-[280px]:text-[10px] max-[280px]:h-9 max-[280px]:px-2 min-[480px]:text-md flex h-11 items-center justify-center rounded-lg bg-white font-semibold text-[#00CB24] shadow transition-all hover:bg-gray-300 px-5 min-[480px]:px-8 whitespace-nowrap"
            >
              <img
                src="/register/whatsapp.svg"
                alt="WhatsApp"
                className="mt-1.5 max-[280px]:mt-0.5 mr-2 max-[280px]:mr-1 h-7 w-7 max-[280px]:h-5 max-[280px]:w-5 min-[480px]:h-8 min-[480px]:w-8 object-contain"
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