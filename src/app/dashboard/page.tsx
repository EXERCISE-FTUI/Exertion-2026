"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  Users, 
  User, 
  School, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle, 
  MessageSquare, 
  Home
} from "lucide-react";

interface DataDisplayProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DataDisplayField: React.FC<DataDisplayProps> = ({ icon, label, value }) => (
  <div className="flex w-full items-center gap-2.5 min-[360px]:gap-3 border-b border-[#4E8EA2]/20 pb-2 pt-1 text-white">
    <div className="text-[#4E8EA2] shrink-0 w-4 h-4 min-[360px]:w-5 min-[360px]:h-5 flex items-center justify-center">
      {icon}
    </div>
    <div className="flex flex-col min-w-0 flex-1">
      <span className="text-[9px] min-[360px]:text-[10px] tracking-wider text-[#4E8EA2] uppercase font-orbitron font-semibold">
        {label}
      </span>
      <span className="text-xs min-[360px]:text-sm font-medium truncate tracking-wide mt-0.5">
        {value || "-"}
      </span>
    </div>
  </div>
);

interface DocumentDisplayProps {
  label: string;
  fileName: string;
  fileUrl?: string;
}

const DocumentDisplayBox: React.FC<DocumentDisplayProps> = ({ label, fileName, fileUrl }) => (
  <div className="flex flex-col flex-1 min-w-0">
    <span className="mb-1.5 text-[10px] min-[360px]:text-xs font-medium text-[#FFF2CA] font-orbitron">
      {label}
    </span>
    <div className="flex w-full items-center justify-between rounded-xl bg-white/5 border border-[#4E8EA2]/30 p-2.5 min-[360px]:p-3 shadow-md">
      <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
        <FileText className="h-4 w-4 min-[360px]:h-5 min-[360px]:w-5 text-[#4E8EA2] shrink-0" />
        <span className="text-[10px] min-[360px]:text-xs text-white truncate font-medium">
          {fileName || "No file uploaded"}
        </span>
      </div>
      {fileUrl && (
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[10px] min-[360px]:text-xs font-bold text-[#3B82F6] hover:underline shrink-0"
        >
          VIEW
        </a>
      )}
    </div>
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dbData, setDbData] = useState<any>(null);
  const [whatsappLink, setWhatsappLink] = useState<string>("");

  const Competitions = {
    "ExerMind": "https://chat.whatsapp.com/GN4QzCowtvc8VUepQv5sPd",
    "UI/UX Design": "https://chat.whatsapp.com/I8nsHzZy7saA6VrTDuAQDw",
    "Business Innovation": "https://chat.whatsapp.com/CaDWdhYB4zfCKfUBLX23bh",
  };

  useEffect(() => {
    async function fetchDashboardData() {
      const supabase = createClient();
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          if (process.env.NODE_ENV === "development") {
            setDbData({
              groupName: "Cyber Exertion Team (Local Dev)",
              leaderName: "Naufal",
              leaderInstitute: "Universitas Indonesia",
              leaderEmail: "naufal@ui.ac.id",
              leaderWhatsappNumber: "081234567890",
              memberCount: 1,
              studentIdCard: { name: "View ID Card", url: "#" },
              twibbon: { name: "View Twibbon", url: "#" },
              instagramStory: { name: "View IG Story", url: "#" },
            });
            setWhatsappLink("https://chat.whatsapp.com/GN4QzCowtvc8VUepQv5sPd");
            setLoading(false);
            return;
          }
          router.push("/register");
          return;
        }

        const { data, error } = await supabase
          .from("teams")
          .select("*, submission_documents(*)")
          .eq("leader_user_id", user.id)
          .single();

        if (error || !data) {
          console.error(error);
          router.push("/register");
          return;
        }

        const docs = Array.isArray(data.submission_documents) 
          ? data.submission_documents[0] 
          : data.submission_documents;

        setDbData({
          groupName: data.team_name || "",
          leaderName: data.leader_name || "",
          leaderInstitute: data.leader_institute || "",
          leaderEmail: data.leader_email || "",
          leaderWhatsappNumber: data.leader_whatsapp_number || "",
          memberCount: data.member_count || 1,
          member2Name: data.member2_name || "",
          member2Institute: data.member2_institute || "",
          member3Name: data.member3_name || "",
          member3Institute: data.member3_institute || "",
          studentIdCard: docs?.student_id_card_link ? { name: "View ID Card", url: docs.student_id_card_link } : null,
          twibbon: docs?.twibbon_upload_link ? { name: "View Twibbon", url: docs.twibbon_upload_link } : null,
          instagramStory: docs?.instagram_story_link ? { name: "View IG Story", url: docs.instagram_story_link } : null,
          member2StudentIdCard: docs?.member2_student_id_card_link ? { name: "View ID Card", url: docs.member2_student_id_card_link } : null,
          member2Twibbon: docs?.member2_twibbon_upload_link ? { name: "View Twibbon", url: docs.member2_twibbon_upload_link } : null,
          member2InstagramStory: docs?.member2_instagram_story_link ? { name: "View IG Story", url: docs.member2_instagram_story_link } : null,
          member3StudentIdCard: docs?.member3_student_id_card_link ? { name: "View ID Card", url: docs.member3_student_id_card_link } : null,
          member3Twibbon: docs?.member3_twibbon_upload_link ? { name: "View Twibbon", url: docs.member3_twibbon_upload_link } : null,
          member3InstagramStory: docs?.member3_instagram_story_link ? { name: "View IG Story", url: docs.member3_instagram_story_link } : null,
        });

        const fetchedCompName = data.competition_name as keyof typeof Competitions;
        if (fetchedCompName && Competitions[fetchedCompName]) {
          setWhatsappLink(Competitions[fetchedCompName]);
        }

      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        router.push("/register");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen w-full relative z-10 flex-col justify-center items-center p-4 overflow-hidden bg-[#7BBDE8]">
        <img
          src="/register/bg-utama.svg"
          alt=""
          className="absolute inset-y-0 -left-6 w-[108%] max-w-none h-full object-cover z-0 pointer-events-none opacity-100 brightness-100 contrast-110"
        />
        
        <div className="relative z-10 flex flex-col justify-center items-center gap-4 bg-[#001D39]/90 px-8 py-6 rounded-2xl border border-[#4E8EA2]/40 shadow-[0_0_30px_rgba(0,29,57,0.6)]">
          <svg
            className="animate-spin h-10 w-10 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
            <line x1="4.22" y1="4.22" x2="7.76" y2="7.76" />
            <line x1="16.24" y1="16.24" x2="19.78" w2="19.78" />
            <line x1="4.22" y1="19.78" x2="7.76" y2="16.24" />
            <line x1="16.24" y1="7.76" x2="19.78" y2="4.22" />
          </svg>
          <h1 className="text-xl min-[480px]:text-2xl font-bold text-blue-500 font-orbitron tracking-wider">Loading...</h1>
        </div>
      </main>
    );
  }

  const memberCount = dbData?.memberCount || 1;

  return (
    <main className="flex h-screen w-screen relative z-10 flex-col justify-center items-center p-2 min-[360px]:p-4 md:p-8 lg:p-12 overflow-hidden bg-[#7BBDE8]">
      <img
        src="/register/bg-utama.svg"
        alt=""
        className="absolute inset-y-0 -left-6 w-[108%] max-w-none h-full object-cover z-0 pointer-events-none opacity-100 brightness-100 contrast-110"
      />

      <div className="w-full h-full max-w-5xl relative z-10 md:-translate-x-4 lg:-translate-x-3 flex flex-col justify-center">
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
          className="w-full max-h-[95vh] min-[480px]:max-h-[87vh] bg-[#001D39]/90 shadow-[0_0_40px_rgba(0,29,57,0.8)] border border-[#4E8EA2]/40 relative flex flex-col overflow-hidden" 
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

          <div className="absolute left-1.5 min-[480px]:left-2 min-[620px]:max-[767px]:left-3.5 md:left-5 top-44 bottom-38 md:top-42 md:bottom-42 w-[2.5px] md:w-[3.5px] bg-white pointer-events-none z-10 block" />

          <div className="flex-1 overflow-y-auto custom-scrollbar-hidden z-10 p-4 min-[360px]:p-6 min-[480px]:p-8 md:p-10 pt-16 min-[480px]:pt-20 flex flex-col w-full items-center">
            
            <div className="mt-10 max-[479px]:mt-22 max-[300px]:mt-18 md:mt-20 mb-6 min-[480px]:mb-8 w-full max-w-full rounded-xl border border-green-500/30 bg-green-500/5 p-3 min-[480px]:p-4 text-center shadow-[0_0_15px_rgba(34,197,94,0.1)] lg:max-w-4xl">
              <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
                <CheckCircle className="h-5 w-5 min-[480px]:h-6 min-[480px]:w-6 text-green-400 shrink-0" />
                <p className="text-[11px] min-[360px]:text-xs min-[480px]:text-sm font-semibold text-white tracking-wide">
                  Pembayaran Terverifikasi! Silakan join grup WhatsApp di bawah ini:
                </p>
              </div>
              {/* Pastikan whatsappLink ada sebelum merender tombol */}
              {whatsappLink && (
                <div className="mt-3 min-[480px]:mt-4 flex w-full justify-center">
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
                    <span className="font-bold">Join WhatsApp Group</span>
                  </a>
                </div>
              )}
            </div>

            <h1 className="mb-6 w-full text-center font-orbitron text-base font-black tracking-wide text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] min-[340px]:text-xl min-[480px]:text-3xl min-[480px]:mb-8 md:text-4xl">
              TEAM PROFILE DASHBOARD
            </h1>

            <div className="flex w-full flex-col gap-6 min-[480px]:gap-8 pb-8 w-full max-w-4xl">
              
              <div className="flex w-full flex-col justify-start border-2 border-[#FCE793] p-3 min-[360px]:p-4 min-[480px]:p-6 shadow-[0_0_15px_rgba(252,231,147,0.15)] bg-white/5 rounded-xl">
                <h2 className="text-[11px] min-[360px]:text-xs min-[480px]:text-base font-orbitron font-black text-[#FCE793] tracking-wider mb-4 border-b-2 border-[#FCE793] pb-1 w-fit">
                  MEMBER #1 - {dbData?.leaderName?.toUpperCase()}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 min-[480px]:gap-y-4">
                  <DataDisplayField icon={<Users />} label="Group Name" value={dbData?.groupName} />
                  <DataDisplayField icon={<User />} label="Leader Name" value={dbData?.leaderName} />
                  <DataDisplayField icon={<School />} label="School Origin" value={dbData?.leaderInstitute} />
                  <DataDisplayField icon={<Mail />} label="Email Address" value={dbData?.leaderEmail} />
                  <DataDisplayField icon={<Phone />} label="WhatsApp Number" value={dbData?.leaderWhatsappNumber} />
                </div>

                <div className="mt-5 min-[480px]:mt-6 flex flex-col gap-3 border-t border-[#4E8EA2]/20 pt-4 sm:flex-row sm:gap-4 md:gap-6">
                  <DocumentDisplayBox label="Student Identification Card" fileName={dbData?.studentIdCard?.name} fileUrl={dbData?.studentIdCard?.url} />
                  <DocumentDisplayBox label="Twibbon Upload" fileName={dbData?.twibbon?.name} fileUrl={dbData?.twibbon?.url} />
                </div>
                <div className="mt-3 min-[480px]:mt-4 flex flex-col sm:w-[48%]">
                  <DocumentDisplayBox label="Instagram Story" fileName={dbData?.instagramStory?.name} fileUrl={dbData?.instagramStory?.url} />
                </div>
              </div>

              {memberCount >= 2 && dbData?.member2Name && (
                <div className="flex w-full flex-col justify-start border-2 border-[#FCE793] p-3 min-[360px]:p-4 min-[480px]:p-6 shadow-[0_0_15px_rgba(252,231,147,0.15)] bg-white/5 rounded-xl">
                  <h2 className="text-[11px] min-[360px]:text-xs min-[480px]:text-base font-orbitron font-black text-[#FCE793] tracking-wider mb-4 border-b-2 border-[#FCE793] pb-1 w-fit">
                    MEMBER #2 - {dbData?.member2Name?.toUpperCase()}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 min-[480px]:gap-y-4">
                    <DataDisplayField icon={<User />} label="Name" value={dbData?.member2Name} />
                    <DataDisplayField icon={<School />} label="School Origin" value={dbData?.member2Institute} />
                  </div>

                  <div className="mt-5 min-[480px]:mt-6 flex flex-col gap-3 border-t border-[#4E8EA2]/20 pt-4 sm:flex-row sm:gap-4 md:gap-6">
                    <DocumentDisplayBox label="Student Identification Card" fileName={dbData?.member2StudentIdCard?.name} fileUrl={dbData?.member2StudentIdCard?.url} />
                    <DocumentDisplayBox label="Twibbon Upload" fileName={dbData?.member2Twibbon?.name} fileUrl={dbData?.member2Twibbon?.url} />
                  </div>
                  <div className="mt-3 min-[480px]:mt-4 flex flex-col sm:w-[48%]">
                    <DocumentDisplayBox label="Instagram Story" fileName={dbData?.member2InstagramStory?.name} fileUrl={dbData?.member2InstagramStory?.url} />
                  </div>
                </div>
              )}

              {memberCount >= 3 && dbData?.member3Name && (
                <div className="flex w-full flex-col justify-start border-2 border-[#FCE793] p-3 min-[360px]:p-4 min-[480px]:p-6 shadow-[0_0_15px_rgba(252,231,147,0.15)] bg-white/5 rounded-xl">
                  <h2 className="text-[11px] min-[360px]:text-xs min-[480px]:text-base font-orbitron font-black text-[#FCE793] tracking-wider mb-4 border-b-2 border-[#FCE793] pb-1 w-fit">
                    MEMBER #3 - {dbData?.member3Name?.toUpperCase()}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 min-[480px]:gap-y-4">
                    <DataDisplayField icon={<User />} label="Name" value={dbData?.member3Name} />
                    <DataDisplayField icon={<School />} label="School Origin" value={dbData?.member3Institute} />
                  </div>

                  <div className="mt-5 min-[480px]:mt-6 flex flex-col gap-3 border-t border-[#4E8EA2]/20 pt-4 sm:flex-row sm:gap-4 md:gap-6">
                    <DocumentDisplayBox label="Student Identification Card" fileName={dbData?.member3StudentIdCard?.name} fileUrl={dbData?.member3StudentIdCard?.url} />
                    <DocumentDisplayBox label="Twibbon Upload" fileName={dbData?.member3Twibbon?.name} fileUrl={dbData?.member3Twibbon?.url} />
                  </div>
                  <div className="mt-3 min-[480px]:mt-4 flex flex-col sm:w-[48%]">
                    <DocumentDisplayBox label="Instagram Story" fileName={dbData?.member3InstagramStory?.name} fileUrl={dbData?.member3InstagramStory?.url} />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 mb-8">
              <button
                onClick={() => router.push("/home")}
                type="button"
                className="flex items-center gap-3 h-10 min-[480px]:h-12 rounded-xl px-8 min-[480px]:px-12 font-orbitron text-[11px] min-[480px]:text-sm font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,255,255,0.4)] bg-white text-[#001D39] hover:bg-gray-200 cursor-pointer"
              >
                <Home className="h-4 w-4 min-[480px]:h-5 min-[480px]:w-5" />
                BACK TO HOME
              </button>
            </div>

          </div>
        </div>

        <img 
          src="/register/vector-corner-left.svg" 
          alt="" 
          className="absolute -bottom-1 -left-1 min-[360px]:-bottom-2 min-[360px]:-left-2 min-[480px]:-bottom-3 min-[480px]:-left-3 md:-bottom-5 md:-left-4 w-10 min-[360px]:w-14 min-[480px]:w-20 md:w-28 lg:w-32 h-auto pointer-events-none z-20 drop-shadow-[0_0_10px_rgba(78,142,162,0.6)]"
        />

        <img 
          src="/register/vector-corner-right.svg" 
          alt="" 
          className="absolute -bottom-2 -right-2 md:-bottom-5 md:-right-7 w-14 min-[480px]:w-20 md:w-28 lg:w-32 h-auto pointer-events-none z-20 drop-shadow-[0_0_10px_rgba(78,142,162,0.6)]"
        />
      </div>
    </main>
  );
}