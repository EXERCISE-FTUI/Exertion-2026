"use client";
import { savePaymentProof } from "@/actions/upload/savePaymentProof";
import { getTeamDriveFolderId } from "@/utils/supabase/getTeamDriveFolderId";
import { File as FileIcon, Trash, Upload } from "lucide-react";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
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
  if (!response.ok)
    throw new Error(data.error || "Failed to initiate upload session.");
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
  if (!response.ok) throw new Error(data.error || "Failed to finalize upload.");
  return data.fileMetadata; // Asumsi ini mengembalikan objek metadata Google Drive
};

// --- FormData Interface ---
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
  studentIdCardDriveId?: string;
  twibbonDriveId?: string;
  exertionUIPromptDriveId?: string;
  exerciseFTUIPromptDriveId?: string;
  submissionDriveId?: string;
  // Bukti pembayaran (transfer manual)
  paymentProof: File | null;
  paymentProofDriveId?: string;
}

// --- Component Props ---
interface Props {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  handleFileUpload: (field: keyof FormData, file: File | null) => void;
  removeDocument: (field: keyof FormData) => void;
}

// --- Ref Handle Definition ---
export interface PaymentRef {
  handleSave: () => Promise<boolean>;
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
    <div className="group relative flex h-22 w-full flex-col items-center justify-between rounded-lg border border-gray-200 bg-white p-2 text-gray-800 shadow-md md:h-40 md:p-3">
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

// --- Main Payment Component (Transfer manual + upload bukti pembayaran) ---
const Payment = forwardRef<PaymentRef, Props>(
  ({ formData, handleFileUpload, removeDocument }, ref) => {
    const [loading, setLoading] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    // Nominal registrasi yang harus ditransfer
    let price: number = 45000;
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const currentDate = new Date(utcTime + 7 * 60 * 60 * 1000); // GMT+7
    const targetDate = new Date("2025-07-15T00:00:00+07:00");
    if (currentDate >= targetDate) {
      price = 55000;
    }

    const updateProgress = useCallback((percent: number) => {
      setUploadProgress(percent);
    }, []);

    // --- Fungsi Upload File Tunggal (bukti pembayaran) ---
    const uploadPaymentProofFile = useCallback(
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
            file.type,
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

            currentByte = uploadedBytes;

            updateProgress(Math.round((currentByte / totalBytes) * 100));
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

          updateProgress(100);
          return finalizationResult.id;
        } catch (error: any) {
          console.error(`Error uploading ${fileNameInDrive}:`, error);
          updateProgress(-1);
          throw error;
        }
      },
      [updateProgress],
    );

    const handleSave = async (): Promise<boolean> => {
      setLoading(true);
      setSaveMessage(null);
      setSaveError(false);
      updateProgress(0);

      // Validasi dasar
      if (!formData.paymentProof) {
        setSaveError(true);
        setSaveMessage("Please upload your payment proof.");
        setLoading(false);
        return false;
      }
      if (!formData.teamId) {
        setSaveError(true);
        setSaveMessage("Team ID is required.");
        setLoading(false);
        return false;
      }

      try {
        // Ambil folder tim yang SUDAH ADA (non-destruktif). Jangan pakai
        // getOrCreateTeamFolder karena akan menghapus folder & dokumen lama.
        const teamFolderId = await getTeamDriveFolderId();
        if (!teamFolderId) {
          throw new Error("Failed to get team folder ID for payment proof.");
        }

        const safeCompetition = formData.competition.replace(
          /[\/\\:*?"<>|]/g,
          "-",
        );
        const extension = formData.paymentProof.name.split(".").pop();
        const driveFileName = `${formData.groupName}_${safeCompetition}_paymentproof.${extension}`;

        const paymentProofDriveId = await uploadPaymentProofFile(
          formData.paymentProof,
          driveFileName,
          teamFolderId,
        );

        if (!paymentProofDriveId) {
          throw new Error("Failed to get Google Drive ID for payment proof.");
        }

        formData.paymentProofDriveId = paymentProofDriveId;

        setSaveMessage(
          "Payment proof uploaded. Saving record to database...",
        );

        const input = new FormData();
        input.append("teamId", formData.teamId);
        input.append("paymentProofDriveId", paymentProofDriveId);

        const response = await savePaymentProof(input);
        if (response.success) {
          setSaveMessage("Payment proof saved successfully!");
          return true;
        }

        setSaveError(true);
        setSaveMessage(response.message || "Failed to save payment proof.");
        return false;
      } catch (error: any) {
        setSaveError(true);
        setSaveMessage(`Payment proof upload failed: ${error.message}`);
        console.error("Payment proof error:", error);
        return false;
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      handleSave,
    }));

    return (
      <>
        <LoadingScreen open={loading} />
        <div className="flex h-full w-full flex-col items-center px-4 pt-2 text-white md:pt-4">
          <h2 className="mb-2 text-center font-orbitron text-xl font-bold md:mb-6 md:text-4xl">
            PAYMENT
          </h2>

          <div className="grid w-full max-w-sm grid-cols-1 gap-4 md:max-w-4xl md:grid-cols-2 md:gap-8">
            {/* Kolom kiri: tujuan transfer */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex w-full flex-col justify-center rounded-lg bg-white p-3 text-center shadow-lg md:p-4">
                <div className="text-sm font-medium text-[#1D3B89] md:text-base">
                  Registration Fee
                </div>
                <div className="my-1 text-3xl font-bold tracking-wider text-[#22314F] md:text-4xl">
                  Rp {price.toLocaleString("id-ID")}
                </div>
              </div>

              {/* TODO: ganti dengan gambar QRIS asli (taruh di /public/register/). */}
              <div className="flex w-full flex-col items-center rounded-lg bg-white p-3 text-center shadow-lg">
                <img
                  src="/register/qris-placeholder.png"
                  alt="QRIS Pembayaran"
                  className="h-40 w-40 rounded-md border border-gray-200 object-contain md:h-48 md:w-48"
                  onError={(e) => {
                    // Placeholder sementara sampai QR asli tersedia.
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
                <div className="mt-2 text-xs text-gray-500">
                  {/* TODO: hapus catatan ini setelah QR asli dipasang */}
                  Scan QRIS di atas untuk membayar
                </div>
              </div>

              {/* TODO: ganti dengan detail rekening tujuan yang asli. */}
              <div className="w-full rounded-lg bg-white/10 p-3 text-center text-xs text-white md:text-sm">
                <div className="font-semibold">Atau transfer ke rekening:</div>
                <div className="mt-1">Bank: ____________ (TODO)</div>
                <div>No. Rek: ____________ (TODO)</div>
                <div>a.n.: ____________ (TODO)</div>
              </div>
            </div>

            {/* Kolom kanan: upload bukti pembayaran */}
            <div className="flex flex-col items-center justify-center gap-2">
              <h4 className="text-center font-orbitron text-xs text-white md:text-base">
                Payment Proof Upload
              </h4>
              <FileUploadBox
                fieldName="paymentProof"
                currentFile={formData.paymentProof}
                onFileUpload={handleFileUpload}
                onRemoveFile={removeDocument}
                supportedFormats=".png,.jpg,.jpeg,.pdf"
                maxSizeMB={20}
              />
              <p
                className="max-w-full p-1 text-center text-[10px] text-white md:text-xs"
                style={{ lineHeight: 1.4 }}
              >
                *Upload your transfer receipt. After submitting, the documents
                you have collected will be sent for admin verification.
              </p>
              {saveMessage && (
                <div
                  className={`w-full rounded-md p-2 text-center text-xs ${saveError ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`}
                >
                  {saveMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  },
);

Payment.displayName = "Payment";
export default Payment;
