// pages.tsx
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
  studentIdCard: File | null;
  twibbon: File | null;
  instagramStory: File | null;

  member2StudentIdCard: File | null;
  member2Twibbon: File | null;
  member2InstagramStory: File | null;

  member3StudentIdCard: File | null;
  member3Twibbon: File | null;
  member3InstagramStory: File | null;

  submission: File | null;
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
  paymentProof: File | null;
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
  "/register/sumbission.svg",
  "/register/payment.svg",
];

// --- Main Page Component ---
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
    // Payment script initialization removed
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
        // Leader wajib, member 2 & 3 hanya wajib kalau nama mereka diisi
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
    const fetchTeam = async () => {
      const supabase = createClient();

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("teams")
            .select("*, submission_documents(*)")
            .eq("leader_user_id", user.id)
            .single();

          if (error) {
            if (error.code === "PGRST116") {
              setTeamData(null);
            } else {
              throw error;
            }
          } else {
            setTeamData(data);
            if (data) {
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

              // Determine the highest incomplete step based on data
              let nextStep = 1;
              if (data.competition_id) nextStep = 2;
              if (
                data.team_name &&
                data.leader_name &&
                data.leader_institute &&
                data.leader_email &&
                data.leader_whatsapp_number
              ) {
                nextStep = 3;
              }

              const docs = data.submission_documents?.[0];
              if (docs) {
                const updates: Partial<FormData> = {};

                // Leader docs
                if (docs.student_id_card_link) updates.studentIdCard = new File([""], "uploaded.pdf");
                if (docs.twibbon_upload_link) updates.twibbon = new File([""], "uploaded.pdf");
                if (docs.instagram_story_link) updates.instagramStory = new File([""], "uploaded.pdf");

                // Member 2 docs
                if (docs.member2_student_id_card_link) updates.member2StudentIdCard = new File([""], "uploaded.pdf");
                if (docs.member2_twibbon_upload_link) updates.member2Twibbon = new File([""], "uploaded.pdf");
                if (docs.member2_instagram_story_link) updates.member2InstagramStory = new File([""], "uploaded.pdf");

                // Member 3 docs
                if (docs.member3_student_id_card_link) updates.member3StudentIdCard = new File([""], "uploaded.pdf");
                if (docs.member3_twibbon_upload_link) updates.member3Twibbon = new File([""], "uploaded.pdf");
                if (docs.member3_instagram_story_link) updates.member3InstagramStory = new File([""], "uploaded.pdf");

                if (docs.task_link) updates.submission = new File([""], "submission.pdf");
                if (docs.payment_proof) updates.paymentProof = new File([""], "payment_proof.pdf");

                setFormData((prev: FormData) => ({ ...prev, ...updates }));

                // Determine next step
                const leaderComplete = docs.student_id_card_link && docs.twibbon_upload_link && docs.instagram_story_link;
                if (leaderComplete) {
                  nextStep = 4;
                  if (data.competition_name === "ExerMind") nextStep = 5;
                  else if (docs.task_link) nextStep = 5;
                }
                if (docs.payment_proof) router.push("/register/success");
              }

              setCurrentStep(nextStep);
            }
          }
        } else {
          // console.log("No user logged in.");
          setTeamData(null);
        }
      } catch (err) {
        if (err instanceof Error) {
          console.error("Error fetching team data:", err.message);
        } else {
          console.error(
            "An unknown error occurred while fetching team data:",
            err,
          );
        }
        toast.error("Failed to load your registration data. Please refresh.");
      }
    };

    fetchTeam();
  }, []);

  useEffect(() => {
    // fetchPaymentStatus removed
  }, []);

  return (
    <>
      <LoadingScreen open={isSaving} />
      <PaymentSuccessModal
        open={paymentSuccess}
        name={formData.name}
        competition={formData.competition}
      />
      <div className="h-screen w-screen bg-[#0F172A]">
        {/* --- Mobile View --- */}
        <div className="flex h-full w-full flex-col overflow-x-hidden p-4 md:hidden">
          <div className="mb-4 flex-shrink-0 pl-2">
            <img
              src="/register/exertion.svg"
              alt="Exertion Logo"
              className="h-auto w-24"
            />
          </div>
          <main
            className="relative flex flex-1 flex-col"
            style={{
              background:
                "linear-gradient(210.35deg, #1E3A8A 0%, #059669 136.05%)",
              clipPath: "polygon(0 0, 92% 0, 100% 8%, 100% 100%, 0 100%)",
            }}
          >
            <div className="scrollable-container relative flex min-h-0 flex-1 flex-col items-center p-4">
              <div className="custom-scrollbar-hidden w-full flex-1 overflow-y-auto">
                {stepContent}
              </div>
              <div className="flex w-full flex-shrink-0 justify-center gap-4 pt-4">
                <button
                  onClick={handleBack}
                  disabled={isSaving}
                  className="h-9 rounded-lg bg-white px-8 font-orbitron text-sm font-semibold text-[#0F172A] transition-all hover:bg-gray-200 disabled:opacity-50"
                >
                  {currentStep === 1 ? "Home" : "Back"}
                </button>
                <button
                  onClick={currentStep === 5 ? handlePayment : handleNext}
                  disabled={!canGoNext() || isSaving}
                  className={`h-9 rounded-lg px-8 font-orbitron text-sm font-semibold transition-all ${canGoNext() && !isSaving ? "bg-[#0F172A] text-white hover:bg-[#1D3B89]" : "cursor-not-allowed bg-gray-500 text-gray-300"}`}
                >
                  {isSaving ? "Saving..." : currentStep === 5 ? "Pay" : "Next"}
                </button>
              </div>
            </div>

            <Background />
          </main>

          <nav className="flex flex-shrink-0 items-center justify-around bg-[#1E293B] p-2">
            {steps.map((step, idx) => {
              const isCurrent = currentStep === step.id;
              const canNavigate =
                step.id <= currentStep || isStepComplete(step.id - 1);
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center transition-opacity ${canNavigate ? null : "opacity-50"}`}
                >
                  <div
                    className={`relative rounded-full p-2 transition-all duration-300 ${isCurrent ? "bg-cyan-400/20" : ""}`}
                  >
                    <img
                      src={stepIcons[idx]}
                      alt=""
                      className="h-7 w-7"
                      style={{ filter: "brightness(0) invert(1)" }}
                    />
                    {isCurrent && (
                      <div className="absolute -top-1 h-1 w-6 rounded-full bg-cyan-300"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* --- Desktop View --- */}
        <div className="hidden h-full w-full flex-row overflow-hidden overflow-x-hidden md:flex">
          <aside className="flex w-64 flex-shrink-0 flex-col items-center justify-center overflow-x-hidden bg-[#0F172A] px-4 py-10">
            <div className="flex w-full flex-col items-center gap-5 overflow-x-hidden">
              <div className="mb-3 ml-3">
                <img
                  src="/register/exertion.svg"
                  alt="Exertion Logo"
                  className="h-auto w-40"
                />
              </div>
              {steps.map((step, idx) => {
                const isCurrent = currentStep === step.id;
                const canNavigate =
                  step.id <= currentStep || isStepComplete(step.id - 1);
                return (
                  <div
                    key={step.id}
                    className={`flex w-full flex-col items-center transition-all ${canNavigate ? null : "cursor-not-allowed opacity-50"}`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${isCurrent ? "bg-gradient-to-tr from-[#44EAB0] to-[#38BDF8]" : "border border-[#44EAB0]"}`}
                    >
                      <img
                        src={stepIcons[idx]}
                        alt=""
                        className="h-6 w-6"
                        style={{
                          filter: isCurrent
                            ? "brightness(0)"
                            : "brightness(0) invert(1)",
                        }}
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <h3 className="text-xs leading-tight font-medium text-white">
                        {step.sidebarTitle || step.title}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
          <main
            className="relative m-8 flex flex-1 flex-col overflow-hidden"
            style={{
              background:
                "linear-gradient(249.76deg, #08896D 0%, #1D3B89 100%)",
              clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0 100%, 0 8%)",
            }}
          >
            <div className="scrollable-container relative flex flex-1 flex-col items-center justify-between p-8">
              {/* CHANGE: The generic title div has been removed from here */}
              <div className="custom-scrollbar-hidden flex w-full flex-1 flex-col justify-center">
                {stepContent}
              </div>
              <div className="flex w-full justify-end gap-4 pt-4">
                <button
                  onClick={handleBack}
                  disabled={isSaving}
                  className={`h-8 rounded-lg bg-white px-16 font-orbitron text-base font-semibold text-[#0F172A] transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 xl:h-10`}
                >
                  {currentStep === 1 ? "Home" : "Back"}
                </button>
                <button
                  onClick={currentStep === 5 ? handlePayment : handleNext}
                  disabled={!canGoNext() || isSaving}
                  className={`h-8 rounded-lg px-16 font-orbitron text-base font-semibold transition-all xl:h-10 ${canGoNext() && !isSaving ? "bg-[#0F172A] text-white hover:bg-[#1f2536]" : "cursor-not-allowed bg-gray-200 text-gray-400"}`}
                >
                  {isSaving ? "Saving..." : currentStep === 5 ? "Pay" : "Next"}
                </button>
              </div>
            </div>

            <Background />
          </main>
        </div>
      </div>
    </>
  );
}
