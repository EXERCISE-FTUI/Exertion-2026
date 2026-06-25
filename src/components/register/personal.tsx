"use client";
import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  ChangeEvent,
} from "react";
import { toast } from "sonner";
import { personalInformation } from "@/actions/upload/personalInformation";
import LoadingScreen from "@/components/ui/LoadingScreen";

// --- START: COPY THIS FormData INTERFACE TO ALL FILES ---
export interface FormData {
  competition: string;
  name: string;
  institute: string;
  phone: string;
  studentIdCard: File | null;
  twibbon: File | null;
  exertionUIPrompt: File | null;
  exerciseFTUIPrompt: File | null;
  submission: File | null;
  payment: { amount: number };
  groupName: string;
  leaderName: string;
  leaderWhatsappNumber: string;
  member1Name?: string;
  member1WhatsappNumber?: string;
  member2Name?: string;
  member2WhatsappNumber?: string;
  competitionId?: string;
  teamId: string;
  studentIdCardDriveId: string;
  twibbonDriveId: string;
  exertionUIPromptDriveId: string;
  exerciseFTUIPromptDriveId: string;
  submissionDriveId: string;
}
// --- END: COPY THIS FormData INTERFACE TO ALL FILES ---

interface Props {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
}

export interface PersonalRef {
  handleSave: () => Promise<boolean>;
}

interface FieldProps {
  icon: React.ReactNode;
  value: string | undefined;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  minLength?: number; // Added minLength prop
  required?: boolean; // Added required prop
}

// --- SVG Icons ---
const GroupIcon = () => (
  <svg
    width="27"
    height="27"
    viewBox="0 0 27 27"
    fill="none"
    className="h-5 w-5 text-gray-500"
  >
    <g opacity="0.5">
      <path
        d="M20.25 23.625C20.25 21.2381 19.3018 18.9489 17.614 17.261C15.9261 15.5732 13.6369 14.625 11.25 14.625C8.86305 14.625 6.57387 15.5732 4.88604 17.261C3.19821 18.9489 2.25 21.2381 2.25 23.625"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.25 14.625C14.3566 14.625 16.875 12.1066 16.875 9C16.875 5.8934 14.3566 3.375 11.25 3.375C8.1434 3.375 5.625 5.8934 5.625 9C5.625 12.1066 8.1434 14.625 11.25 14.625Z"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24.7504 22.5006C24.7504 18.7093 22.5004 15.1881 20.2504 13.5006C20.99 12.9457 21.5814 12.2171 21.9723 11.3791C22.3632 10.5412 22.5415 9.61986 22.4914 8.69661C22.4414 7.77336 22.1645 6.87668 21.6853 6.08594C21.2061 5.29519 20.5394 4.63476 19.7441 4.16309"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);
const UserIcon = () => (
  <svg
    width="23"
    height="27"
    viewBox="0 0 23 27"
    fill="none"
    className="h-5 w-5 text-gray-500"
  >
    <g opacity="0.7">
      <path
        d="M19.9261 23.4777C19.9261 21.1454 18.9996 18.9085 17.3504 17.2593C15.7012 15.6101 13.4644 14.6836 11.132 14.6836C8.79966 14.6836 6.56284 15.6101 4.91363 17.2593C3.26441 18.9085 2.33789 21.1454 2.33789 23.4777"
        stroke="currentColor"
        strokeWidth="2.19853"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.1321 14.6841C14.1676 14.6841 16.6284 12.2233 16.6284 9.18773C16.6284 6.15219 14.1676 3.69141 11.1321 3.69141C8.09653 3.69141 5.63574 6.15219 5.63574 9.18773C5.63574 12.2233 8.09653 14.6841 11.1321 14.6841Z"
        stroke="currentColor"
        strokeWidth="2.19853"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);
const PhoneIcon = () => (
  <svg
    width="23"
    height="24"
    viewBox="0 0 23 24"
    fill="none"
    className="h-5 w-5 text-gray-500"
  >
    <g opacity="0.5">
      <path
        d="M7.5676 19.8344C9.39581 20.7845 11.4989 21.0418 13.4978 20.5601C15.4968 20.0783 17.2601 18.8891 18.4701 17.2068C19.6801 15.5244 20.2572 13.4596 20.0974 11.3844C19.9376 9.30914 19.0514 7.35996 17.5985 5.88809C16.1456 4.41622 14.2215 3.51844 12.173 3.35655C10.1245 3.19465 8.08627 3.77928 6.42561 5.00508C4.76496 6.23088 3.59108 8.01725 3.11551 10.0423C2.63995 12.0673 2.89397 14.1978 3.83181 16.0499L1.91602 21.7752L7.5676 19.8344Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);
const UniversityIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className="h-5 w-5 text-gray-500"
  >
    <g opacity="0.5">
      <path
        d="M14 22V18C14 17.4696 13.7893 16.9609 13.4142 16.5858C13.0391 16.2107 12.5304 16 12 16C11.4696 16 10.9609 16.2107 10.5858 16.5858C10.2107 16.9609 10 17.4696 10 18V22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 10L21.447 11.724C21.6131 11.807 21.7528 11.9346 21.8504 12.0925C21.9481 12.2504 21.9999 12.4323 22 12.618V20C22 20.5304 21.7893 21.0391 21.4142 21.4142C21.0391 21.7893 20.5304 22 20 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V12.618C2.0001 12.4323 2.05188 12.2504 2.14955 12.0925C2.24722 11.9346 2.38692 11.807 2.553 11.724L6 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 5V22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 6.00026L11.106 2.44726C11.3836 2.30854 11.6897 2.23633 12 2.23633C12.3103 2.23633 12.6164 2.30854 12.894 2.44726L20 6.00026"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 5V22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

// Reusable Field Component
const Field: React.FC<FieldProps> = ({
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
  minLength,
  required,
}) => (
  <div className="relative">
    <span className="absolute top-1/2 left-4 z-10 -translate-y-1/2">
      {icon}
    </span>
    <input
      type={type}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      minLength={minLength} // Dynamically apply minLength
      required={required} // Dynamically apply required
      className="w-full rounded-lg bg-gray-200 px-4 py-2.5 pl-12 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-cyan-400 focus:outline-none md:py-4"
    />
  </div>
);

// Main Personal Component
const Personal = forwardRef<PersonalRef, Props>(
  ({ formData, updateFormData }, ref) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
      success?: boolean;
      error?: boolean;
      message: string;
    } | null>(null);

    // Surface every validation / backend result through a toast so the user
    // always gets feedback (and never advances silently on an error).
    useEffect(() => {
      if (!result) return;
      if (result.error) {
        toast.error(result.message);
      } else if (result.success) {
        toast.success(result.message);
      }
    }, [result]);

    const handleSave = async (): Promise<boolean> => {
      setLoading(true);
      setResult(null);

      // --- Start Validation Logic ---
      const {
        groupName,
        institute,
        leaderName,
        leaderWhatsappNumber,
        member1Name,
        member1WhatsappNumber,
        member2Name,
        member2WhatsappNumber,
        competitionId,
        competition,
      } = formData;
      if (!groupName || groupName.trim() === "") {
        setResult({ error: true, message: "GroupName is required." });
        setLoading(false);
        return false;
      }

      // 1. Leader Name & Leader WhatsApp Number are required
      if (!leaderName || leaderName.trim() === "") {
        setResult({ error: true, message: "Leader Name is required." });
        setLoading(false);
        return false;
      }
      if (!institute || institute.trim() === "") {
        setResult({ error: true, message: "institute is required." });
        setLoading(false);
        return false;
      }
      if (!leaderWhatsappNumber || leaderWhatsappNumber.trim() === "") {
        setResult({
          error: true,
          message: "Leader WhatsApp Number is required.",
        });
        setLoading(false);
        return false;
      }
      if (!competitionId) {
        setResult({
          error: true,
          message: "Competition ID is required.",
        });
        setLoading(false);
        return false;
      }
      if (groupName.trim().length < 4) {
        setResult({
          error: true,
          message: "Group Name must be at least 4 characters.",
        });
        setLoading(false);
        return false;
      }

      if (institute.trim().length < 4) {
        setResult({
          error: true,
          message: "Institute must be at least 4 characters.",
        });
        setLoading(false);
        return false;
      }

      // 2. Leader Name min 4 characters
      if (leaderName.trim().length < 4) {
        setResult({
          error: true,
          message: "Leader Name must be at least 4 characters.",
        });
        setLoading(false);
        return false;
      }

      // 3. Member 1 Name & Number conditional requirement + min 4 characters
      const hasMember1Name = member1Name && member1Name.trim() !== "";
      const hasMember1Whatsapp =
        member1WhatsappNumber && member1WhatsappNumber.trim() !== "";

      if (hasMember1Name && !hasMember1Whatsapp) {
        setResult({
          error: true,
          message:
            "Member #1 WhatsApp Number is required if Member #1 Name is provided.",
        });
        setLoading(false);
        return false;
      }
      if (!hasMember1Name && hasMember1Whatsapp) {
        setResult({
          error: true,
          message:
            "Member #1 Name is required if Member #1 WhatsApp Number is provided.",
        });
        setLoading(false);
        return false;
      }
      if (hasMember1Name && member1Name.trim().length < 4) {
        setResult({
          error: true,
          message: "Member #1 Name must be at least 4 characters.",
        });
        setLoading(false);
        return false;
      }

      // 4. Member 2 Name & Number conditional requirement + min 4 characters
      const hasMember2Name = member2Name && member2Name.trim() !== "";
      const hasMember2Whatsapp =
        member2WhatsappNumber && member2WhatsappNumber.trim() !== "";

      if (hasMember2Name && !hasMember2Whatsapp) {
        setResult({
          error: true,
          message:
            "Member #2 WhatsApp Number is required if Member #2 Name is provided.",
        });
        setLoading(false);
        return false;
      }
      if (!hasMember2Name && hasMember2Whatsapp) {
        setResult({
          error: true,
          message:
            "Member #2 Name is required if Member #2 WhatsApp Number is provided.",
        });
        setLoading(false);
        return false;
      }
      if (hasMember2Name && member2Name.trim().length < 4) {
        setResult({
          error: true,
          message: "Member #2 Name must be at least 4 characters.",
        });
        setLoading(false);
        return false;
      }
      // --- End Validation Logic ---

      const input = {
        groupName,
        institute,
        leaderName,
        leaderWhatsappNumber,
        // Only send optional members if they are actually provided
        member1Name: hasMember1Name ? member1Name : undefined,
        member1WhatsappNumber: hasMember1Whatsapp
          ? member1WhatsappNumber
          : undefined,
        member2Name: hasMember2Name ? member2Name : undefined,
        member2WhatsappNumber: hasMember2Whatsapp
          ? member2WhatsappNumber
          : undefined,
        competitionId,
        competition,
      };

      try {
        const response = await personalInformation(input);
        if (response.success && response.data?.teamId) {
          updateFormData("teamId", response.data.teamId);
        }
        setResult({
          success: response.success,
          error: !response.success,
          message: response.message,
        });
        return !!response.success;
      } catch (err) {
        console.error("Error saving personal information:", err); // Log the actual error for debugging
        setResult({ error: true, message: "Unexpected error during saving." });
        return false;
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      handleSave,
    }));

    return (
      <div className="w-full px-4 md:px-6">
        <h2 className="mb-4 text-left font-orbitron text-2xl font-bold tracking-wide text-white md:mb-8 md:text-center md:text-4xl">
          PERSONAL INFORMATION
        </h2>

        {/* --- Mobile Layout (Single Column) --- */}
        <div className="mx-auto block max-w-sm space-y-2 md:hidden">
          <Field
            icon={<GroupIcon />}
            value={formData.groupName}
            onChange={(e) => updateFormData("groupName", e.target.value)}
            placeholder="Group Name"
          />
          <Field
            icon={<UserIcon />}
            value={formData.leaderName}
            onChange={(e) => updateFormData("leaderName", e.target.value)}
            placeholder="Leader Name"
            minLength={4}
          />
          <Field
            icon={<UserIcon />}
            value={formData.member1Name}
            onChange={(e) => updateFormData("member1Name", e.target.value)}
            placeholder="Member #1 Name"
            minLength={4}
          />
          <Field
            icon={<UserIcon />}
            value={formData.member2Name}
            onChange={(e) => updateFormData("member2Name", e.target.value)}
            placeholder="Member #2 Name"
            minLength={4}
          />
          <Field
            icon={<UniversityIcon />}
            value={formData.institute}
            onChange={(e) => updateFormData("institute", e.target.value)}
            placeholder="Institute"
          />
          <Field
            icon={<PhoneIcon />}
            value={formData.leaderWhatsappNumber}
            onChange={(e) =>
              updateFormData("leaderWhatsappNumber", e.target.value)
            }
            placeholder="Leader WhatsApp Number"
            type="tel"
          />
          <Field
            icon={<PhoneIcon />}
            value={formData.member1WhatsappNumber}
            onChange={(e) =>
              updateFormData("member1WhatsappNumber", e.target.value)
            }
            placeholder="Member #1 WhatsApp Number"
            type="tel"
          />
          <Field
            icon={<PhoneIcon />}
            value={formData.member2WhatsappNumber}
            onChange={(e) =>
              updateFormData("member2WhatsappNumber", e.target.value)
            }
            placeholder="Member #2 WhatsApp Number"
            type="tel"
          />
        </div>

        {/* --- Desktop Layout (Two Columns) --- */}
        <div className="mx-auto hidden max-w-4xl grid-cols-2 gap-6 md:grid">
          <Field
            icon={<GroupIcon />}
            value={formData.groupName}
            onChange={(e) => updateFormData("groupName", e.target.value)}
            placeholder="Group Name"
          />
          <Field
            icon={<UniversityIcon />}
            value={formData.institute}
            onChange={(e) => updateFormData("institute", e.target.value)}
            placeholder="Institute"
          />
          <Field
            icon={<UserIcon />}
            value={formData.leaderName}
            onChange={(e) => updateFormData("leaderName", e.target.value)}
            placeholder="Leader Name"
            minLength={4}
          />
          <Field
            icon={<PhoneIcon />}
            value={formData.leaderWhatsappNumber}
            onChange={(e) =>
              updateFormData("leaderWhatsappNumber", e.target.value)
            }
            placeholder="Leader WhatsApp Number"
            type="tel"
          />
          <Field
            icon={<UserIcon />}
            value={formData.member1Name}
            onChange={(e) => updateFormData("member1Name", e.target.value)}
            placeholder="Member #1 Name"
            minLength={4}
          />
          <Field
            icon={<PhoneIcon />}
            value={formData.member1WhatsappNumber}
            onChange={(e) =>
              updateFormData("member1WhatsappNumber", e.target.value)
            }
            placeholder="Member #1 WhatsApp Number"
            type="tel"
          />
          <Field
            icon={<UserIcon />}
            value={formData.member2Name}
            onChange={(e) => updateFormData("member2Name", e.target.value)}
            placeholder="Member #2 Name"
            minLength={4}
          />
          <Field
            icon={<PhoneIcon />}
            value={formData.member2WhatsappNumber}
            onChange={(e) =>
              updateFormData("member2WhatsappNumber", e.target.value)
            }
            placeholder="Member #2 WhatsApp Number"
            type="tel"
          />
        </div>
      </div>
    );
  },
);

Personal.displayName = "Personal";

export default Personal;
