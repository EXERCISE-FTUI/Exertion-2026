"use client";

import React, { useEffect, useState } from "react";
import "./entry.css";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";


export default function WelcomeToExermind() {
  const [isMdOrLarger, setIsMdOrLarger] = useState(false);
  const [teamName, setTeamName] = useState("Loading...");
  const [competitionName, setCompetitionName] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to fetch team and competition data
  const fetchTeamData = async () => {
    try {

      const supabase = await createClient();

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Fetch team data based on user
        const { data, error } = await supabase
          .from("teams")
          .select("team_name, competition_name")
          .eq("leader_user_id", user.id)
          .single();
          console.log("Competition name: ", data?.competition_name);
        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setTeamName(data.team_name || "");
          setCompetitionName(data.competition_name || "");
        } else {
          router.push("/home");
        }
      } else {
        setTeamName("Please Login");
        setCompetitionName("");
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error fetching team data:", err.message);
      } else {
        console.error("Error fetching team data:", err);
      }
      setTeamName("Error Loading Team");
      setCompetitionName("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMdOrLarger(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    // Fetch team data when component mounts
    fetchTeamData();

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="bg-[#0F172A] min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden max-md:bg-[linear-gradient(29.69deg,_#1E3A8A_2.47%,_#059669_116.12%)] max-sm:bg-[linear-gradient(29.69deg,_#1E3A8A_2.47%,_#059669_116.12%)]">
      <div className="w-full max-w-2xl sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl z-10 max-md:w-[85vw]">
        <div
          className="md:bg-[linear-gradient(29.69deg,_#1E3A8A_2.47%,_#059669_116.12%)] backdrop-blur-lg p-6 sm:p-8 lg:p-12 rounded-2xl max-md:rounded-none md:[clip-path:polygon(0%_0%,90%_0%,100%_20%,100%_100%,10%_100%,0%_80%)] max-md:[clip-path:polygon(0%_0%,85%_0%,100%_15%,100%_100%,15%_100%,0%_85%)] border border-white/10 shadow-2xl min-h-[400px] max-md:min-h-[360px] max-md:bg-[#0F172A]"
          style={
            isMdOrLarger
              ? {
                backgroundImage:
                  "url('/topPolygon.svg'), url('/bottomPolygon.svg'), url('/circuit.svg'), linear-gradient(29.69deg, #1E3A8A 2.47%, #059669 116.12%)",
                backgroundRepeat: "no-repeat, no-repeat, no-repeat, no-repeat",
                backgroundPosition: "top right, bottom left, center, center",
                backgroundSize: "50% 50%, 30% 30%, contain, cover",
              }
              : undefined
          }
        >
          <h2 className="orbitron-400 text-2xl max-md:text-3xl max-md:w-xs max-md:text-left sm:text-4xl md:text-4xl lg:text-5xl pt-6 lg:pt-24 lg:pb-8 font-bold max-sm:pt-none mb-2 text-center text-white tracking-wider uppercase">
            Welcome to Exermind
          </h2>

          <div className="text-center mb-8">
            {loading ? (
              <div className="flex justify-center items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <p className="orbitron-400 text-lg max-md:text-xl sm:text-xl md:text-2xl text-white/90 tracking-wide">
                  Loading team data...
                </p>
              </div>
            ) : (
              <>
                <p className="orbitron-400 text-lg max-md:text-xl sm:text-xl md:text-2xl text-white/90 mb-2 tracking-wide">
                  {teamName}
                </p>
                {competitionName && (
                  <p className="exo-2-200 text-sm max-md:text-base sm:text-base md:text-lg text-white/70 tracking-wide">
                    Competition: {competitionName}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="text-center space-y-6 mt-4 sm:mt-8 lg:mt-4">
            <h3 className="orbitron-400 text-xl max-md:text-2xl sm:text-2xl md:text-3xl font-bold text-white tracking-wider">
              Attempts Allowed: 1
            </h3>

            <p className="exo-2-200 text-base max-md:text-lg sm:text-lg md:text-xl text-white/80 mb-6">
              This quiz will open on Hari, Tanggal, Jam
            </p>

            <div className="flex justify-center items-center space-x-6 sm:space-x-8 text-white/70 text-sm sm:text-base md:text-lg mb-8 lg:mb-12">
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>60 minute</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>30 questions</span>
              </div>
            </div>

            <div className="flex justify-center items-center lg:mb-24">
              <div className="relative orbitron-500 w-full px-4 sm:px-8 lg:px-16 flex justify-center">
                <button
                  type="button"
                  disabled={loading || teamName === "No Team Assigned" || teamName === "Please Login"}
                  className="orbitron-500 w-full max-w-xl sm:max-w-2xl lg:max-w-xl xl:max-w-lg bg-white text-slate-800 font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-full transition-all duration-200 tracking-wider text-xs sm:text-sm uppercase hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 text-center text-base sm:text-lg disabled:bg-white/50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Attempt Test"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}