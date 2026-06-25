// app/cobaregister/Submission.tsx
"use client";
import React, {
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
  useCallback,
} from "react";
import { Upload, File as FileIcon, Trash } from "lucide-react";
import { toast } from "sonner";
import { saveTaskSubmission } from "@/actions/upload/taskSubmission"; // Assuming this path is correct
import { getTeamDriveFolderId } from "@/utils/supabase/getTeamDriveFolderId";
import LoadingScreen from "@/components/ui/LoadingScreen";

// Constants
const CHUNK_SIZE = 256 * 1024; // 256KB

const apiInitiateUploadSession = async (
  fileName: string,
  mimeType: string,
  folderId: string,
) => {
  const response = await fetch("/api/upload/initiate-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, mimeType, folderId }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to initiate upload session.");
  }
  return data.resumableSessionUri;
};

const apiChunkUpload = async (
  resumableSessionUri: string,
  file: File,
  currentByte: number,
  endByte: number,
  totalBytes: number,
) => {
  const chunk = file.slice(currentByte, endByte);
  const response = await fetch("/api/upload/chunk-upload", {
    method: "PUT",
    headers: {
      "X-Resumable-Session-URI": resumableSessionUri,
      "Content-Type": file.type,
      "Content-Range": `bytes ${currentByte}-${endByte - 1}/${totalBytes}`,
      "Content-Length": chunk.size.toString(),
    },
    body: chunk,
  });

  if (!response.ok && response.status !== 308) {
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(
      `Chunk upload failed (Status: ${response.status}): ${JSON.stringify(errorData)}`,
    );
  }

  // Handle 308 response: get actual bytes uploaded
  if (response.status === 308) {
    const rangeHeader = response.headers.get("Range");
    if (rangeHeader) {
      const lastByteReceived = parseInt(rangeHeader.split("-")[1], 10) + 1;
      return lastByteReceived;
    }
  }
  // For 200/201 or if 308 has no Range header (fallback)
  return endByte;
};

const apiFinalizeUploadSession = async (resumableSessionUri: string) => {
  const response = await fetch("/api/upload/finalize-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumableSessionUri }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to finalize upload.");
  }
  return data.fileMetadata; // Asumsi ini mengembalikan objek metadata Google Drive dengan 'id'
};

// --- FormData Interface (from your main file) ---
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
  // Ini akan diisi setelah upload berhasil
  studentIdCardDriveId: string; // Asumsi ini sudah ada dari tahap sebelumnya
  twibbonDriveId: string; // Asumsi ini sudah ada dari tahap sebelumnya
  exertionUIPromptDriveId: string; // Asumsi ini sudah ada dari tahap sebelumnya
  exerciseFTUIPromptDriveId: string; // Asumsi ini sudah ada dari tahap sebelumnya
  submissionDriveId?: string; // Ini akan diisi oleh komponen Submission ini
}

// --- Component Props & Ref ---
export interface SubmissionRef {
  handleSave: () => Promise<boolean>;
}

interface Props {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  handleFileUpload: (field: keyof FormData, file: File | null) => void;
  removeDocument: (field: keyof FormData) => void;
}

interface FileUploadBoxProps {
  fieldName: keyof FormData;
  currentFile: File | null;
  onFileUpload: (field: keyof FormData, file: File | null) => void;
  onRemoveFile: (field: keyof FormData) => void;
  supportedFormats: string;
  maxSizeMB: number;
}

const FileUploadBox: React.FC<FileUploadBoxProps> = ({
  fieldName,
  currentFile,
  onFileUpload,
  onRemoveFile,
  supportedFormats,
  maxSizeMB,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleDrag = (
    e: React.DragEvent<HTMLDivElement>,
    dragging: boolean,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  };

  const validateFile = (file: File | null): boolean => {
    if (!file) {
      setFileError(null);
      return true;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setFileError(`File size exceeds ${maxSizeMB} MB.`);
      return false;
    }

    const acceptedFormatsArray = supportedFormats
      .split(",")
      .map((f) => f.trim().toLowerCase());
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const fileType = file.type;

    const isFileTypeAccepted =
      acceptedFormatsArray.includes(fileExtension) ||
      acceptedFormatsArray.includes(fileType);
    if (!isFileTypeAccepted) {
      setFileError(
        `Unsupported file format. Accepted: ${supportedFormats.toUpperCase()}.`,
      );
      return false;
    }

    setFileError(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDrag(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onFileUpload(fieldName, file);
      } else {
        onFileUpload(fieldName, null);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (validateFile(file)) {
      onFileUpload(fieldName, file);
    } else {
      onFileUpload(fieldName, null);
      e.target.value = "";
    }
  };

  return (
    <div className="group relative flex h-22 w-9/10 flex-col items-center justify-between rounded-lg border border-gray-200 bg-white p-2 text-gray-800 shadow-md md:h-40 md:w-full md:p-3">
      <div
        className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed p-2 transition-colors duration-200 ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
        onDragEnter={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onDragOver={(e) => handleDrag(e, true)}
        onDrop={handleDrop}
      >
        {currentFile ? (
          <>
            <FileIcon className="mb-1 h-3 w-3 text-green-500 md:h-5 md:w-5" />
            <span className="max-w-[90%] truncate text-center text-[8px] font-medium text-gray-700 md:text-xs">
              {currentFile.name}
            </span>
            <span className="text-[6px] text-gray-500 md:text-[8px] md:text-[10px]">
              {(currentFile.size / (1024 * 1024)).toFixed(2)} MB
            </span>
            <Trash
              className="2-3 absolute top-2 right-2 z-10 h-3 cursor-pointer text-gray-500 hover:text-red-500 md:h-4 md:w-4"
              onClick={() => onRemoveFile(fieldName)}
            />
          </>
        ) : (
          <>
            <Upload className="mb-1 h-4 w-4 text-gray-400 md:h-6 md:w-6" />
            <input
              type="file"
              id={`file-upload-${String(fieldName)}`}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={handleFileChange}
              accept={supportedFormats}
            />
            <label
              htmlFor={`file-upload-${String(fieldName)}`}
              className="cursor-pointer text-center text-[8px] text-gray-600 md:text-[10px]"
            >
              Drag & drop or{" "}
              <span className="font-semibold text-blue-600">Choose File</span>
            </label>
          </>
        )}
      </div>

      <div className="mt-1 flex w-full justify-between px-1 text-[7px] text-gray-500 md:text-[9px]">
        <span>Formats: {supportedFormats.toUpperCase()}</span>
        <span>Max: {maxSizeMB} MB</span>
        {fileError && (
          <span className="mt-1 w-1/3 text-center text-red-500 md:w-1/4 md:text-[8px]">
            {fileError}
          </span>
        )}
      </div>
    </div>
  );
};

// --- Main Submission Component ---
const Submission = forwardRef<SubmissionRef, Props>(
  ({ formData, handleFileUpload, removeDocument, updateFormData }, ref) => {
    const [timeLeft, setTimeLeft] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<boolean>(false);
    const [submissionProgress, setSubmissionProgress] = useState<number>(0); // Progress for submission file

    // Helper function to update progress for submission file
    const updateSubmissionProgress = useCallback((percent: number) => {
      setSubmissionProgress(percent);
    }, []);

    // --- Fungsi Upload File Tunggal (Hanya untuk Submission) ---
    const uploadSubmissionFile = useCallback(
      async (
        file: File,
        fileNameInDrive: string,
        teamFolderId: string,
      ): Promise<string> => {
        try {
          // 1. Inisiasi Sesi Upload via API Route
          setSaveMessage(`Initiating upload for ${fileNameInDrive}...`);
          const resumableUri = await apiInitiateUploadSession(
            fileNameInDrive,
            file.type, // Gunakan file.type untuk mimeType
            teamFolderId,
          );

          if (!resumableUri) {
            throw new Error("Failed to get resumable session URI.");
          }

          // 2. Upload Chunks via API Route Proxy
          let currentByte = 0;
          const totalBytes = file.size;

          while (currentByte < totalBytes) {
            const uploadedBytes = await apiChunkUpload(
              resumableUri,
              file,
              currentByte,
              Math.min(currentByte + CHUNK_SIZE, totalBytes),
              totalBytes,
            );

            currentByte = uploadedBytes; // Perbarui currentByte dengan byte yang berhasil diupload

            updateSubmissionProgress(
              Math.round((currentByte / totalBytes) * 100),
            );
            setSaveMessage(
              `Uploading ${fileNameInDrive}: ${Math.round((currentByte / totalBytes) * 100)}%`,
            );
          }

          // 3. Finalisasi Upload via API Route
          setSaveMessage(`Finalizing ${fileNameInDrive}...`);
          const finalizationResult =
            await apiFinalizeUploadSession(resumableUri);

          if (!finalizationResult || !finalizationResult.id) {
            throw new Error(
              `Failed to finalize upload for ${fileNameInDrive}.`,
            );
          }

          updateSubmissionProgress(100); // Pastikan progress 100%
          return finalizationResult.id; // Mengembalikan ID file yang diupload
        } catch (error: any) {
          console.error(`Error uploading ${fileNameInDrive}:`, error);
          updateSubmissionProgress(-1); // Menandai error
          throw error; // Re-throw untuk ditangkap di handleSave
        }
      },
      [updateSubmissionProgress],
    );

    useImperativeHandle(ref, () => ({
      handleSave,
    }));

    useEffect(() => {
      // Countdown logic remains the same
      const endDate = new Date("2025-07-30T23:59:59").getTime();
      const updateCountdown = () => {
        const now = new Date().getTime();
        const difference = endDate - now;

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor(
              (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            ),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000),
          });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }, []);

    const handleSave = async (): Promise<boolean> => {
      setIsSaving(true);
      setSaveMessage(null);
      setSaveError(false);
      updateSubmissionProgress(0); // Reset progress

      // Basic validation
      if (!formData.submission) {
        setSaveError(true);
        setSaveMessage("Please upload a submission file.");
        toast.error("Please upload a submission file.");
        setIsSaving(false);
        return false;
      }
      if (!formData.teamId || !formData.competitionId || !formData.groupName) {
        setSaveError(true);
        setSaveMessage("Team ID, Competition ID, and Group Name are required.");
        toast.error("Team ID, Competition ID, and Group Name are required.");
        setIsSaving(false);
        return false;
      }

      let submissionDriveId: string | undefined;
      let teamFolderId: string | null = null;

      try {
        teamFolderId = await getTeamDriveFolderId();
        if (!teamFolderId) {
          throw new Error("Failed to get team folder ID for submission.");
        }

        setSaveMessage(`Team folder ready. Uploading submission file...`);

        const safeCompetition = formData.competition.replace(/[\/\\:*?"<>|]/g, "-");
        const extension = formData.submission.name.split(".").pop();
        const driveFileName = `${formData.groupName}_${safeCompetition}_submission.${extension}`;
        submissionDriveId = await uploadSubmissionFile(
          formData.submission,
          driveFileName,
          teamFolderId,
        );

        if (!submissionDriveId) {
          throw new Error("Failed to get Google Drive ID for submission file.");
        }

        formData.submissionDriveId = submissionDriveId;



        setSaveMessage(
          "Submission file uploaded. Saving record to database...",
        );
        const input = new FormData();
        input.append("teamId", formData.teamId);
        input.append("submissionDriveId", formData.submissionDriveId);
        const response = await saveTaskSubmission(input);
        if (response.success) {
          setSaveMessage("Submission saved successfully!");
          toast.success("Submission saved successfully!");
          return true;
        } else {
          setSaveError(true);
          setSaveMessage(
            response.message || "Failed to save submission record.",
          );
          toast.error(response.message || "Failed to save submission record.");
          return false;
        }
      } catch (error: any) {
        setSaveError(true);
        setSaveMessage(`Submission failed: ${error.message}`);
        toast.error(`Submission failed: ${error.message}`);
        console.error("Submission error:", error);
        return false;
      } finally {
        setIsSaving(false);
      }
    };

    const StatusRow = ({
      label,
      value,
      valueColor = "text-white",
    }: {
      label: string;
      value: string | React.ReactNode;
      valueColor?: string;
    }) => (
      <div className="flex flex-col border-b border-white py-2 md:flex-row md:items-center">
        <div className="mb-1 w-full font-semibold text-gray-300 md:mb-0 md:w-1/3 md:text-white">
          {label}
        </div>
        <div className={`w-full font-medium md:w-2/3 ${valueColor}`}>
          {value}
        </div>
      </div>
    );

    return (
      <div className="flex h-full w-full flex-col items-center p-4 text-white md:p-8">
        <h2 className="mb-6 text-center font-orbitron text-2xl font-bold md:text-3xl lg:text-5xl">
          SUBMISSION
        </h2>
        <div className="w-full max-w-sm md:max-w-4xl">
          <a
            href="https://drive.google.com/drive/folders/1RZM1bc2-XpTd0RKb_DF_QOKdMLIhL43h"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-6 flex w-full items-center rounded-lg bg-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-800 shadow-md transition-colors duration-200 hover:bg-gray-300 md:text-lg"
          >
            <img
              src="/register/book.svg"
              alt="Booklet Icon"
              className="mr-1 md:mr-3"
              width="15"
              height="15"
            />
            Booklet
          </a>
          <div className="space-y-1 text-sm md:text-lg">
            <StatusRow
              label="Submission status"
              value={
                formData.submissionDriveId
                  ? "Submitted for grading"
                  : "Not submitted"
              }
              valueColor={
                formData.submissionDriveId
                  ? "text-green-400"
                  : "text-yellow-400"
              }
            />
            <StatusRow
              label="Due date"
              value="Wednesday, 30 July 2025, 11:59 PM"
            />
            <StatusRow
              label="Time remaining"
              value={`${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`}
              valueColor="text-cyan-400"
            />
            <div className="flex flex-col pt-3 md:flex-row">
              <div className="mb-2 w-full font-semibold text-white md:mb-0 md:w-1/3">
                File submission
              </div>
              <div className="w-full md:w-2/3">
                <FileUploadBox
                  fieldName="submission"
                  currentFile={formData.submission}
                  onFileUpload={handleFileUpload}
                  onRemoveFile={removeDocument}
                  supportedFormats=".zip,.rar,.7z" // Tambahkan .7z jika diizinkan
                  maxSizeMB={25}
                />
                {/* {submissionProgress > 0 && submissionProgress <= 100 && (
                  <div className="mt-2 text-sm text-gray-300">
                    Upload Progress: {submissionProgress}%{" "}
                    {submissionProgress === -1 && (
                      <span className="text-red-500">(Upload Failed)</span>
                    )}
                  </div>
                )} */}
              </div>
            </div>
          </div>
          {/* {isSaving && (
            <div className="mt-4 rounded-md bg-blue-100 p-3 text-center text-blue-800">
              {saveMessage || "Processing submission..."}
            </div>
          )}
          {saveMessage && !isSaving && (
            <div
              className={`mt-4 rounded-md p-3 text-center ${saveError ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`}
            >
              {saveMessage}
            </div>
          )} */}
        </div>
      </div>
    );
  },
);

Submission.displayName = "Submission";
export default Submission;
