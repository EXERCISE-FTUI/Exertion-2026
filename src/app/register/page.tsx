"use client";

import Background from "@/components/register/Background";
import Competition from "@/components/register/competition";
import Documents, { DocumentRef } from "@/components/register/documents";
import Payment, { PaymentRef } from "@/components/register/payment";
import PaymentSuccessModal from "@/components/register/PaymentSuccessModal";
import Personal, { PersonalRef } from "@/components/register/personal";
import Submission, { SubmissionRef } from "@/components/register/submission";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import "./register.css";
import { toast } from "sonner";
import LoadingScreen from "@/components/ui/LoadingScreen";

export interface FormData {
  competition: string;
  name: string;
  phone: string;
  studentIdCard: any;
  twibbon: any;
  instagramStory: any;

  member2StudentIdCard: any;
  member2Twibbon: any;
  member2InstagramStory: any;

  member3StudentIdCard: any;
  member3Twibbon: any;
  member3InstagramStory: any;

  submission: any;
  payment: { amount: number };
  groupName: string;
  leaderName: string;
  leaderInstitute: string;
  leaderEmail: string;
  leaderWhatsappNumber: string;
  memberCount: number;
  member2Name?: string;
  member2Institute?: string;
  member3Name?: string;
  member3Institute?: string;
  competitionId?: string;
  teamId: string;

  studentIdCardDriveId: string;
  twibbonDriveId: string;
  instagramStoryDriveId: string;

  member2StudentIdCardDriveId: string;
  member2TwibbonDriveId: string;
  member2InstagramStoryDriveId: string;

  member3StudentIdCardDriveId: string;
  member3TwibbonDriveId: string;
  member3InstagramStoryDriveId: string;

  submissionDriveId: string;
  paymentProof: any;
  paymentProofDriveId: string;
}

const steps = [
  { id: 1, title: "Competition" },
  {
    id: 2,
    title: "Personal Information",
    sidebarTitle: (
      <>
        Personal
        <br />
        Information
      </>
    ),
  },
  { id: 3, title: "Required Documents", sidebarTitle: "Documents" },
  { id: 4, title: "Submission" },
  { id: 5, title: "Payment" },
];

const stepIcons = [
  "/register/competition.svg",
  "/register/personalInformation.svg",
  "/register/documents.svg",
  "/register/submission.svg",
  "/register/payment.svg",
];

export default function RegisterPage() {
  const router = useRouter();
  const personalRef = useRef<PersonalRef>(null);
  const documentRef = useRef<DocumentRef>(null);
  const submissionRef = useRef<SubmissionRef>(null);
  const paymentRef = useRef<PaymentRef>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    competition: "",
    name: "",
    phone: "",
    studentIdCard: null,
    twibbon: null,
    instagramStory: null,

    member2StudentIdCard: null,
    member2Twibbon: null,
    member2InstagramStory: null,

    member3StudentIdCard: null,
    member3Twibbon: null,
    member3InstagramStory: null,

    submission: null,
    payment: { amount: 0 },
    groupName: "",
    leaderName: "",
    leaderInstitute: "",
    leaderEmail: "",
    leaderWhatsappNumber: "",
    memberCount: 1,
    member2Name: "",
    member2Institute: "",
    member3Name: "",
    member3Institute: "",
    competitionId: "",
    teamId: "",

    studentIdCardDriveId: "",
    twibbonDriveId: "",
    instagramStoryDriveId: "",

    member2StudentIdCardDriveId: "",
    member2TwibbonDriveId: "",
    member2InstagramStoryDriveId: "",

    member3StudentIdCardDriveId: "",
    member3TwibbonDriveId: "",
    member3InstagramStoryDriveId: "",

    submissionDriveId: "",
    paymentProof: null,
    paymentProofDriveId: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [teamData, setTeamData] = useState(null);

  useEffect(() => {
  }, []);

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.competitionId;
      case 2:
        return !!(
          formData.groupName &&
          formData.leaderName &&
          formData.leaderInstitute &&
          formData.leaderEmail &&
          formData.leaderWhatsappNumber
        );
      case 3:
        const leaderDocsComplete = !!(
          formData.studentIdCard &&
          formData.twibbon &&
          formData.instagramStory
        );
        const member2DocsComplete = !formData.member2Name || !!(
          formData.member2StudentIdCard &&
          formData.member2Twibbon &&
          formData.member2InstagramStory
        );
        const member3DocsComplete = !formData.member3Name || !!(
          formData.member3StudentIdCard &&
          formData.member3Twibbon &&
          formData.member3InstagramStory
        );
        return leaderDocsComplete && member2DocsComplete && member3DocsComplete;
      case 4:
        return !!formData.submission;
      case 5:
        return !!formData.paymentProof;
      default:
        return false;
    }
  };

  const canGoNext = (): boolean => isStepComplete(currentStep);
  const canGoBack = (): boolean => currentStep >= 1;

  const handleNext = async () => {
    if (canGoNext() && !isSaving) {
      setIsSaving(true);
      try {
        if (currentStep === 2 && personalRef.current) {
          const saveSuccess = await personalRef.current.handleSave();
          if (!saveSuccess) return;
        }
        if (currentStep === 3) {
          if (documentRef.current) {
            const saveSuccess = await documentRef.current.handleSave();
            if (!saveSuccess) return;
          }
          if (formData.competition === "ExerMind") {
            setCurrentStep(5);
          } else {
            setCurrentStep((prev: number) => Math.min(prev + 1, 5));
          }
        } else if (currentStep === 4 && submissionRef.current) {
          const saveSuccess = await submissionRef.current.handleSave();
          if (!saveSuccess) return;
          setCurrentStep((prev: number) => Math.min(prev + 1, 5));
        } else {
          setCurrentStep((prev: number) => Math.min(prev + 1, 5));
        }
      } catch (error) {
        console.error("Error during next step:", error);
        toast.error("Something went wrong. Please try again.");
        setErrors({});
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (canGoBack()) {
      if (currentStep <= 1) {
        router.push("/home");
      }
      if (currentStep === 5 && formData.competition === "ExerMind") {
        setCurrentStep(3);
      } else {
        setCurrentStep((prev: number) => Math.max(prev - 1, 1));
      }
      setErrors({});
    }
  };

  const handleStepClick = (step: number) => {
    let allPrevComplete = true;
    for (let i = 1; i < step; i++) {
      if (!isStepComplete(i)) {
        allPrevComplete = false;
        break;
      }
    }
    if (allPrevComplete) {
      if (step === 4 && formData.competition === "ExerMind") {
        setCurrentStep(5);
      } else if (
        step === 5 &&
        formData.competition === "ExerMind" &&
        currentStep < 3
      ) {
        if (isStepComplete(3)) {
          setCurrentStep(5);
        } else {
          setCurrentStep(3);
        }
      } else {
        setCurrentStep(step);
      }
      setErrors({});
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev: FormData) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: keyof FormData, file: File | null) => {
    setFormData((prev: FormData) => ({ ...prev, [field]: file }));
  };

  const removeDocument = (field: keyof FormData) => {
    setFormData((prev: FormData) => ({ ...prev, [field]: null }));
  };

  const handlePayment = async () => {
    setIsSaving(true);
    try {
      if (paymentRef.current) {
        const success = await paymentRef.current.handleSave();
        if (success) {
          router.push("/register/success");
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment submission failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <Competition
            formData={formData}
            updateFormData={updateFormData}
            handleNext={handleNext}
          />
        );
      case 2:
        return (
          <Personal
            ref={personalRef}
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 3:
        return (
          <Documents
            ref={documentRef}
            formData={formData}
            updateFormData={updateFormData}
            handleFileUpload={handleFileUpload}
            removeDocument={removeDocument}
          />
        );
      case 4:
        return (
          <Submission
            ref={submissionRef}
            formData={formData}
            updateFormData={updateFormData}
            handleFileUpload={handleFileUpload}
            removeDocument={removeDocument}
          />
        );
      case 5:
        return (
          <Payment
            ref={paymentRef}
            formData={formData}
            updateFormData={updateFormData}
            handleFileUpload={handleFileUpload}
            removeDocument={removeDocument}
          />
        );
      default:
        return null;
    }
  }, [currentStep, formData]);

  useEffect(() => {
    const initFetch = async () => {
      const supabase = createClient();
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("teams")
            .select("*, submission_documents(*)")
            .eq("leader_user_id", user.id)
            .single();

          if (!error && data) {
            setTeamData(data);
            setFormData((prev: FormData) => ({
              ...prev,
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
              competitionId: data.competition_id || "",
              competition: data.competition_name || "",
              teamId: data.id || "",
            }));

            let nextStep = 1;
            if (data.competition_id) nextStep = 2;
            if (data.team_name && data.leader_name && data.leader_institute && data.leader_email && data.leader_whatsapp_number) {
              nextStep = 3;
            }

            const docs = Array.isArray(data.submission_documents) ? data.submission_documents[0] : data.submission_documents;
            if (docs) {
              const updates: Partial<FormData> = {};
              if (docs.student_id_card_link) updates.studentIdCard = { name: "View ID Card", url: docs.student_id_card_link };
              if (docs.twibbon_upload_link) updates.twibbon = { name: "View Twibbon", url: docs.twibbon_upload_link };
              if (docs.instagram_story_link) updates.instagramStory = { name: "View IG Story", url: docs.instagram_story_link };
              if (docs.member2_student_id_card_link) updates.member2StudentIdCard = { name: "View ID Card", url: docs.member2_student_id_card_link };
              if (docs.member2_twibbon_upload_link) updates.member2Twibbon = { name: "View Twibbon", url: docs.member2_twibbon_upload_link };
              if (docs.member2_instagram_story_link) updates.member2InstagramStory = { name: "View IG Story", url: docs.member2_instagram_story_link };
              if (docs.member3_student_id_card_link) updates.member3StudentIdCard = { name: "View ID Card", url: docs.member3_student_id_card_link };
              if (docs.member3_twibbon_upload_link) updates.member3Twibbon = { name: "View Twibbon", url: docs.member3_twibbon_upload_link };
              if (docs.member3_instagram_story_link) updates.member3InstagramStory = { name: "View IG Story", url: docs.member3_instagram_story_link };
              if (docs.task_link) updates.submission = { name: "View Submission", url: docs.task_link };
              if (docs.payment_proof) updates.paymentProof = { name: "View Payment", url: docs.payment_proof };

              setFormData((prev: FormData) => ({ ...prev, ...updates }));

              if (docs.student_id_card_link && docs.twibbon_upload_link && docs.instagram_story_link) {
                nextStep = 4;
                if (data.competition_name === "ExerMind") nextStep = 5;
                else if (docs.task_link) nextStep = 5;
              }
              if (docs.payment_proof) router.push("/register/success");
            }
            setCurrentStep(nextStep);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    initFetch();
  }, []);

  useEffect(() => {
  }, []);

  return (
    <>
      <LoadingScreen open={isSaving} />
      <PaymentSuccessModal
        open={paymentSuccess}
        name={formData.name}
        competition={formData.competition}
      />
      <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden relative bg-[#7BBDE8]">
        <img
          src="/register/background-pattern.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-80"
        />

        <div className="flex w-full flex-col overflow-x-hidden md:hidden z-10 shrink-0 bg-[#001D39]">
          <div className="flex items-center justify-between p-4 border-b border-[#4E8EA2]/30">
            <img
              src="/register/Exertion Logo Dark.svg"
              alt="Exertion Logo"
              className="h-auto w-24"
            />
            <button
              onClick={() => router.push("/home")}
              className="flex items-center gap-2 text-white/70 hover:text-white"
            >
              <img src="/register/home.svg" alt="" className="w-5 h-5 opacity-70" />
            </button>
          </div>
          <nav className="flex items-center justify-around bg-[#001D39] px-2 py-3 shadow-md">
            {steps.map((step, idx) => {
              const isCurrent = currentStep === step.id;
              const canNavigate = step.id <= currentStep || isStepComplete(step.id - 1);
              return (
                <div
                  key={step.id}
                  onClick={() => canNavigate && handleStepClick(step.id)}
                  className={`flex flex-col items-center transition-opacity ${canNavigate ? "cursor-pointer" : "opacity-40"}`}
                >
                  <div className={`relative p-2 rounded-full transition-all duration-300 ${isCurrent ? "bg-white" : ""}`}>
                    <img
                      src={stepIcons[idx]}
                      alt=""
                      className={`h-5 w-5 object-contain ${isCurrent ? "" : "brightness-0 invert opacity-60"}`}
                    />
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        <aside className="hidden md:flex w-24 lg:w-35 flex-shrink-0 flex-col items-center pt-0 pb-4 z-30 relative bg-[#001D39] text-white select-none">
          <div
            className="absolute top-0 left-0 w-[135%] h-40 bg-[#001D39] z-0"
            style={{
              clipPath: "polygon(0% 0%, 74% 0%, 74% 15%, 95% 30%, 95% 64%, 74% 79%, 74% 100%, 0% 100%)"
            }}
          />

          <div className="absolute top-40 inset-x-0 bottom-0 bg-[#001D39] z-0" />

          <div className="relative z-10 w-full h-full flex flex-col items-center">
            <div className="h-40 w-full flex items-center justify-start pl-4 lg:pl-6 pr-2 shrink-0">
              <img
                src="/register/Exertion Logo Dark.svg"
                alt="Exertion Logo"
                className="h-auto w-24 lg:w-[320px] -mt-3"
              />
            </div>

            <div className="flex flex-col gap-2 w-full items-center mt-1 px-0">
              <div
                onClick={() => router.push("/home")}
                className="w-full flex flex-col items-center justify-center py-2.5 cursor-pointer text-white/80 hover:bg-white/10 hover:text-white transition-all"
              >
                <img src="/register/home.svg" alt="" className="h-5 w-5 lg:h-10 lg:w-10 mb-1 brightness-0 invert opacity-80 object-contain" />
                <span className="text-[10px] lg:text-xs tracking-wide text-center font-medium">Home</span>
              </div>

              {steps.map((step, idx) => {
                const isCurrent = currentStep === step.id;
                const canNavigate = step.id <= currentStep || isStepComplete(step.id - 1);
                return (
                  <div
                    key={step.id}
                    onClick={() => canNavigate && handleStepClick(step.id)}
                    className={`w-full flex flex-col items-center justify-center py-3 px-2 transition-all
                      ${isCurrent ? "bg-white text-[#001D39]" : "text-white hover:bg-white/10"} 
                      ${canNavigate ? "cursor-pointer" : "opacity-40 cursor-not-allowed"}
                    `}
                  >
                    <img
                      src={stepIcons[idx]}
                      alt=""
                      className={`h-5 w-5 lg:h-10 lg:w-10 mb-1 object-contain transition-all ${isCurrent ? "" : "brightness-0 invert opacity-100"}`}
                    />
                    <div className="flex w-full items-center justify-center px-1">
                      <h3 className={`text-[10px] lg:text-xs tracking-wide leading-tight text-center ${isCurrent ? "font-bold" : "font-medium"}`}>
                        {step.sidebarTitle || step.title}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="flex-1 relative z-10 flex flex-col justify-center items-center p-4 md:p-8 lg:p-12 min-h-0 overflow-hidden">
          <img
            src="/register/bg-utama.svg"
            alt=""
            className="absolute inset-y-0 -left-6 w-[108%] max-w-none h-full object-cover z-0 pointer-events-none opacity-100 brightness-100 contrast-110"
          />

          <div className="w-full h-full max-w-5xl relative z-10 md:-translate-x-4 lg:-translate-x-3">
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
              className="w-full h-full bg-[#001D39]/90 shadow-[0_0_40px_rgba(0,29,57,0.8)] border border-[#4E8EA2]/40 relative flex flex-col overflow-hidden"
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

              <div className="absolute left-2.5 min-[480px]:left-4 min-[620px]:left-9 md:left-10 top-44 bottom-38 md:top-42 md:bottom-42 w-[2.5px] md:w-[3.5px] bg-white pointer-events-none z-10 block" />

              <div className="flex-1 overflow-y-auto custom-scrollbar-hidden z-10 p-6 md:p-10 flex flex-col justify-center">
                {stepContent}
              </div>

              <div className="flex w-full justify-center items-center gap-2 min-[360px]:gap-4 min-[480px]:gap-8 pb-18 pt-4 min-[480px]:pb-8 z-20 shrink-0 px-4">
                {currentStep > 1 && (
                  <button
                    onClick={handleBack}
                    type="button"
                    className="h-9 min-[360px]:h-10 min-[480px]:h-11 md:h-14 rounded-xl md:rounded-2xl w-24 min-[360px]:w-28 min-[480px]:w-auto min-[480px]:px-12 md:px-16 font-orbitron text-[11px] min-[360px]:text-xs min-[480px]:text-sm md:text-base font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,255,255,0.4)] bg-white text-[#001D39] hover:bg-gray-100 cursor-pointer"
                  >
                    BACK
                  </button>
                )}

                <button
                  onClick={currentStep === 5 ? handlePayment : handleNext}
                  disabled={!canGoNext() || isSaving}
                  className={`h-9 min-[360px]:h-10 min-[480px]:h-11 md:h-14 rounded-xl md:rounded-2xl w-24 min-[360px]:w-28 min-[480px]:w-auto min-[480px]:px-12 md:px-16 font-orbitron text-[11px] min-[360px]:text-xs min-[480px]:text-sm md:text-base font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,255,255,0.4)] 
                    ${canGoNext() && !isSaving
                      ? "bg-white text-[#001D39] hover:bg-gray-100 cursor-pointer"
                      : "cursor-not-allowed bg-white/30 text-white/50 shadow-none"
                    }`}
                >
                  {isSaving ? "SAVING..." : currentStep === 5 ? "KIRIM" : "NEXT"}
                </button>
              </div>
            </div>

            {(currentStep === 1 || currentStep === 2 || currentStep === 5) && (
              <img
                src="/register/hexagon.svg"
                alt=""
                className={`absolute h-auto pointer-events-none z-0 opacity-80 drop-shadow-[0_0_10px_rgba(78,142,162,0.5)] transition-all duration-300
                  w-12 min-[360px]:w-16 min-[480px]:w-20 md:w-36 lg:w-40
                  ${currentStep === 1 || currentStep === 5
                    ? "top-12 right-4 md:top-18 md:right-8"
                    : "bottom-1 left-1 min-[360px]:bottom-2 min-[360px]:left-2 min-[480px]:bottom-4 min-[480px]:left-4 md:bottom-6 md:left-10"
                  }`}
              />
            )}

            <img
              src="/register/vector-corner-right.svg"
              alt=""
              className="absolute -bottom-2 -right-2 md:-bottom-5 md:-right-3 w-14 min-[480px]:w-20 md:w-28 lg:w-32 h-auto pointer-events-none z-20 drop-shadow-[0_0_10px_rgba(78,142,162,0.6)]"
            />

            {(currentStep === 5) && (
              <img
                src="/register/hexagon_2.svg"
                alt=""
                className="absolute bottom-8 left-6 min-[360px]:bottom-10 min-[360px]:left-8 min-[480px]:bottom-12 min-[480px]:left-10 md:bottom-14 md:left-12 w-20 min-[360px]:w-24 min-[480px]:w-28 md:w-32 lg:w-40 h-auto pointer-events-none z-20 drop-shadow-[0_0_10px_rgba(78,142,162,0.6)]"
              />
            )}

            {(currentStep === 1 || currentStep === 3) && (
              <img
                src="/register/vector-corner-left.svg"
                alt=""
                className="absolute -bottom-1 -left-1 min-[360px]:-bottom-2 min-[360px]:-left-2 min-[480px]:-bottom-3 min-[480px]:-left-3 md:-bottom-5 md:-left-3 w-10 min-[360px]:w-14 min-[480px]:w-20 md:w-28 lg:w-32 h-auto pointer-events-none z-20 drop-shadow-[0_0_10px_rgba(78,142,162,0.6)]"
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}