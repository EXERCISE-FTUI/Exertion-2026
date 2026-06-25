"use client";
import React, { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { getTeamDriveFolderId } from "@/utils/supabase/getTeamDriveFolderId";
import { File as FileIcon, Trash, Upload } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

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

export interface PaymentRef {
  handleSave: () => Promise<boolean>;
}

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
  if (!response.ok) throw new Error(data.error || "Failed to initiate upload session.");
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
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Chunk upload failed (Status: ${response.status}): ${JSON.stringify(errorData)}`);
  }

  if (response.status === 308) {
    const rangeHeader = response.headers.get("Range");
    if (rangeHeader) {
      const lastByteReceived = parseInt(rangeHeader.split("-")[1], 10) + 1;
      return lastByteReceived;
    }
  }
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
  return data.fileMetadata;
};

const CHUNK_SIZE = 256 * 1024;

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

  const handleDrag = (e: React.DragEvent<HTMLDivElement>, dragging: boolean) => {
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

    const acceptedFormatsArray = supportedFormats.split(",").map((f) => f.trim().toLowerCase());
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const fileType = file.type;

    if (!acceptedFormatsArray.includes(fileExtension) && !acceptedFormatsArray.includes(fileType)) {
      setFileError(`Unsupported file format.`);
      return false;
    }

    setFileError(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDrag(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) onFileUpload(fieldName, file);
      else onFileUpload(fieldName, null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (validateFile(file)) onFileUpload(fieldName, file);
    else {
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
            <span className="text-[6px] text-gray-500 md:text-[8px]">
              {(currentFile.size / (1024 * 1024)).toFixed(2)} MB
            </span>
            <Trash
              className="absolute top-2 right-2 z-10 h-3 w-3 cursor-pointer text-gray-500 hover:text-red-500 md:h-4 md:w-4"
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
            <label htmlFor={`file-upload-${String(fieldName)}`} className="cursor-pointer text-center text-[8px] text-gray-600 md:text-[10px]">
              Drag & drop or <span className="font-semibold text-blue-600">Choose File</span>
            </label>
          </>
        )}
      </div>
      {fileError && <span className="mt-1 text-[8px] text-red-500">{fileError}</span>}
    </div>
  );
};

const Payment = forwardRef<PaymentRef, Props>(({ formData, handleFileUpload, removeDocument, updateFormData }, ref) => {
  let price: number = 45000;
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const currentDate = new Date(utcTime + 7 * 60 * 60 * 1000); // GMT+7
  const targetDate = new Date("2025-07-15T00:00:00+07:00");
  if (currentDate >= targetDate) {
    price = 55000;
  }

  const uploadSingleFile = useCallback(async (file: File, fileNameInDrive: string, teamFolderId: string): Promise<string> => {
    const resumableUri = await apiInitiateUploadSession(fileNameInDrive, file.type, teamFolderId);
    let currentByte = 0;
    const totalBytes = file.size;

    while (currentByte < totalBytes) {
      currentByte = await apiChunkUpload(resumableUri, file, currentByte, Math.min(currentByte + CHUNK_SIZE, totalBytes), totalBytes);
    }

    const finalizationResult = await apiFinalizeUploadSession(resumableUri);
    return finalizationResult.id;
  }, []);

  const handleSave = async (): Promise<boolean> => {
    if (!formData.paymentProof) {
      toast.error("Please upload your payment proof.");
      return false;
    }

    try {
      const teamFolderId = await getTeamDriveFolderId();
      if (!teamFolderId) throw new Error("Failed to find your team folder.");

      const driveFileName = `${formData.groupName}_${formData.competition}_paymentproof`;
      const fileId = await uploadSingleFile(formData.paymentProof, driveFileName, teamFolderId);

      const fileUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

      const supabase = await createClient();
      const { error } = await supabase
        .from('submission_documents')
        .upsert({ team_id: formData.teamId, payment_proof: fileUrl }, { onConflict: 'team_id' })

      if (error) throw error;
      await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: formData.teamId }),
      });

      return true;
    } catch (e) {
      console.error(e);
      toast.error(
        e instanceof Error
          ? e.message
          : "Failed to submit payment proof. Please try again.",
      );
      return false;
    }
  };

  useImperativeHandle(ref, () => ({ handleSave }));

  return (
    <div className="flex h-full w-full flex-col items-center p-4 text-white">
      <h2 className="mx-auto mb-4 w-full max-w-xs text-left font-orbitron text-xl font-bold text-white md:mb-8 md:text-center md:text-4xl sm:max-w-4xl">
        PAYMENT
      </h2>
      <div className="flex w-full max-w-sm flex-col items-center md:max-w-md">
        <div className="mb-4 flex w-full flex-col justify-center rounded-lg bg-white p-4 text-center shadow-lg md:p-6">
          <div className="text-base font-medium text-[#1D3B89] md:text-lg">Registration Fee</div>
          <div className="my-1 text-4xl font-bold tracking-wider text-[#22314F] md:text-5xl">
            {price.toLocaleString("id-ID")}
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-[#1E293B] p-4 text-center shadow-md w-full">
          <div className="text-sm font-semibold mb-2">Transfer to:</div>
          <div className="text-xl font-bold text-[#44EAB0]">123-456-7890 (BCA)</div>
          <div className="text-sm">a/n Exertion</div>
          {/* Dummy QR */}
          <div className="mt-4 flex justify-center">
            <div className="h-32 w-32 bg-white flex items-center justify-center rounded-md">
              <span className="text-black font-bold">QR CODE</span>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col items-center">
          <h4 className="mb-2 text-center font-orbitron text-sm">Upload Payment Proof</h4>
          <FileUploadBox
            fieldName="paymentProof"
            currentFile={formData.paymentProof}
            onFileUpload={handleFileUpload}
            onRemoveFile={removeDocument}
            supportedFormats=".pdf,.png,.jpg,.jpeg"
            maxSizeMB={5}
          />
        </div>
      </div>
    </div>
  );
});

Payment.displayName = "Payment";
export default Payment;
