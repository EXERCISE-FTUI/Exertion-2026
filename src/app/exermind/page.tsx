"use client";

import React, { useEffect, useState } from "react";
import "./entry.css";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Final from "./_components/Final";

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
    <div className="h-screen bg-[linear-gradient(0deg,#0B8071_-42.99%,#38405F_47.89%,#111417_117.2%)] ">
      <Final />
    </div>
  );
};