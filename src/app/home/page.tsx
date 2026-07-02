"use client";

import { signOut as signOutAction } from "@/actions/auth/signOut"; // Rename to avoid conflict
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Exo_2, Inter, Orbitron } from "next/font/google";
import { redirect, useRouter } from "next/navigation"; // Import useRouter
import { useEffect, useState, useCallback } from "react"; // Import useCallback
import dynamic from "next/dynamic";
import Header from "./_components/header";
import Judul from "./_components/judul";
import Timer from "./_components/timer";

const About = dynamic(() => import("./_components/about"));
const Competition = dynamic(() => import("./_components/competition"));
const Footer = dynamic(() => import("./_components/footer"));
const OurValue = dynamic(() => import("./_components/ourvalue"));
const Timeline = dynamic(() => import("./_components/timeline"));
const orbitron = Orbitron({ subsets: ["latin"], weight: ["500"] });
const exo2 = Exo_2({ subsets: ["latin"], weight: ["500"] });
const inter = Inter({ subsets: ["latin"] });

const HomePage = () => {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  const fetchUserStatus = useCallback(async () => {
    const { data: userData, error } = await supabase.auth.getUser();
    if (userData?.user) {
      setUser(userData.user);
      setIsSigned(true);
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userData.user.id)
        .single();
      // console.log("profile data:", profileData)
      if (profileData?.display_name === null) redirect("/update-name");
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setDisplayName(null);
      } else if (profileData?.display_name) {
        setDisplayName(profileData.display_name);
      } else {
        setDisplayName(null);
      }
    } else {
      setUser(null);
      setIsSigned(false);
    }
    // console.log("User fetch data:", userData);
  }, [supabase]);

  useEffect(() => {
    fetchUserStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
          fetchUserStatus();
        }
      },
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchUserStatus, supabase]);

  const handleSignOutAndRefresh = async () => {
    await signOutAction();
    await fetchUserStatus();
    router.refresh();
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start overflow-hidden bg-[linear-gradient(180deg,#528CC0_28%,#509AD5_67%,#7CBCE8_100%)] pt-12">
      <Header
        isSigned={isSigned}
        onSignOut={handleSignOutAndRefresh}
        displayName={displayName}
      />
      <div className="w-full flex justify-center">
        <Judul />
      </div>
      <div className="w-full flex justify-center mt-4 md:mt-8">
        <Timer />
      </div>
      <div className="w-full flex justify-center mt-4 lg:-mt-[9rem]">
        <About />
      </div>
      <div className="w-full flex justify-center mt-4 lg:-mt-[9.5rem]">
        <OurValue />
      </div>
      <div className="w-full flex justify-center mt-4 lg:-mt-[11.5rem]">
        <Competition />
      </div>
      <div className="w-full flex justify-center mt-4 lg:-mt-[4rem]">
        <Timeline />
      </div>
      <div className="w-full flex justify-center mt-12 md:mt-24">
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
