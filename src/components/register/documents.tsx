// app/cobaregister/page.tsx
"use client";
import { saveDocuments } from "@/actions/upload/saveDocuments";
import { getOrCreateTeamFolder } from "@/utils/google/getOrCreateTeamFolder";
import { File as FileIcon, Trash, Upload } from "lucide-react";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";

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
    method: "POST", // Anda menggunakan POST untuk finalize API Route
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumableSessionUri }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to finalize upload.");
  return data.fileMetadata; // Asumsi ini mengembalikan objek metadata Google Drive
};

const CHUNK_SIZE = 256 * 1024; // 256KB

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
}

// --- Component Props ---
interface Props {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  handleFileUpload: (field: keyof FormData, file: File | null) => void;
  removeDocument: (field: keyof FormData) => void;
}

// --- Ref Handle Definition ---
export interface DocumentRef {
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

const Documents = forwardRef<DocumentRef, Props>(
  ({ formData, handleFileUpload, removeDocument, updateFormData }, ref) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
      success?: boolean;
      error?: boolean;
      message: string;
    } | null>(null);
    const [overallUploadStatus, setOverallUploadStatus] = useState<string>("");
    const [fileProgress, setFileProgress] = useState<Record<string, number>>(
      {},
    ); // { fieldName: percent }

    // Helper function to update progress for a specific file
    const updateFileProgress = useCallback(
      (fieldName: string, percent: number) => {
        setFileProgress((prev) => ({ ...prev, [fieldName]: percent }));
      },
      [],
    );

    // --- Fungsi Upload File Tunggal ---
    const uploadSingleFile = useCallback(
      async (
        file: File,
        fileNameInDrive: string,
        teamFolderId: string,
        fieldName: keyof FormData, // Untuk update progress spesifik
      ): Promise<string> => {
        try {
          // 1. Inisiasi Sesi Upload via API Route
          setOverallUploadStatus(`Initiating upload for ${fileNameInDrive}...`);
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

            currentByte = uploadedBytes; // Perbarui currentByte dengan byte yang berhasil diupload oleh Google Drive

            updateFileProgress(
              String(fieldName),
              Math.round((currentByte / totalBytes) * 100),
            );
            setOverallUploadStatus(
              `Uploading ${fileNameInDrive}: ${Math.round((currentByte / totalBytes) * 100)}%`,
            );
          }

          // 3. Finalisasi Upload via API Route
          setOverallUploadStatus(`Finalizing ${fileNameInDrive}...`);
          const finalizationResult =
            await apiFinalizeUploadSession(resumableUri);

          if (!finalizationResult || !finalizationResult.id) {
            throw new Error(
              `Failed to finalize upload for ${fileNameInDrive}.`,
            );
          }

          updateFileProgress(String(fieldName), 100); // Pastikan progress 100%
          return finalizationResult.id; // Mengembalikan ID file yang diupload
        } catch (error: any) {
          console.error(`Error uploading ${fileNameInDrive}:`, error);
          updateFileProgress(String(fieldName), -1); // Menandai error
          throw error; // Re-throw untuk ditangkap di handleSave
        }
      },
      [updateFileProgress],
    );

    const handleSave = async (): Promise<boolean> => {
      setLoading(true);
      setResult(null);
      setOverallUploadStatus("Starting document upload process...");

      // Memastikan field penting ada
      if (!formData.competitionId || !formData.teamId || !formData.groupName) {
        setResult({
          error: true,
          message: "Competition ID, Team ID, and Group Name are required.",
        });
        setLoading(false);
        return false;
      }
      // Memastikan file wajib (studentIdCard) ada
      if (!formData.studentIdCard) {
        setResult({
          error: true,
          message: "Student Identification Card is required.",
        });
        setLoading(false);
        return false;
      }

      let teamFolderId: string | null = null;
      try {
        setOverallUploadStatus("Getting or creating team folder...");
        const folderResult = await getOrCreateTeamFolder(
          formData.competitionId,
        );
        teamFolderId = folderResult?.folderId || null;

        if (!teamFolderId) {
          throw new Error("Failed to get team folder ID.");
        }
        setOverallUploadStatus(`Team folder found/created.`);
      } catch (error: any) {
        setResult({
          error: true,
          message: `Folder creation/retrieval failed: ${error.message}`,
        });
        setLoading(false);
        return false;
      }

      // Daftar file yang akan diupload
      const filesToUpload: {
        field: keyof FormData;
        file: File | null;
        typeName: string; // Nama untuk penamaan di Drive (misal: "studentidcard")
        driveIdField:
        | "studentIdCardDriveId"
        | "twibbonDriveId"
        | "exertionUIPromptDriveId"
        | "exerciseFTUIPromptDriveId";
      }[] = [
          {
            field: "studentIdCard",
            file: formData.studentIdCard,
            typeName: "studentidcard",
            driveIdField: "studentIdCardDriveId",
          },
          {
            field: "twibbon",
            file: formData.twibbon,
            typeName: "twibbon",
            driveIdField: "twibbonDriveId",
          },
          {
            field: "exertionUIPrompt",
            file: formData.exertionUIPrompt,
            typeName: "followigproof",
            driveIdField: "exertionUIPromptDriveId",
          },
          {
            field: "exerciseFTUIPrompt",
            file: formData.exerciseFTUIPrompt,
            typeName: "posterstory",
            driveIdField: "exerciseFTUIPromptDriveId",
          },
        ];

      let allUploadsSuccessful = true;
      const updatedDriveIds: Partial<FormData> = {};

      for (const { field, file, typeName, driveIdField } of filesToUpload) {
        if (file && teamFolderId) {
          // Hanya proses jika file ada dan folderId sudah didapat
          try {
            // Memberikan nama yang konsisten di Google Drive
            const driveFileName = `${formData.groupName}_${formData.competition}_${typeName}`;

            setOverallUploadStatus(`Uploading ${typeName} (${file.name})...`);

            const fileId = await uploadSingleFile(
              file,
              driveFileName,
              teamFolderId,
              field,
            );
            if (!fileId) {
              throw new Error(
                `Failed to upload ${typeName}. No file ID returned.`,
              );
            }
            formData[driveIdField] = fileId; // Update FormData dengan Drive ID
            // console.log(`Check ${driveIdField} : ${formData[driveIdField]}`);
            setOverallUploadStatus(`${typeName} uploaded successfully!`);
          } catch (error: any) {
            console.error(`Error uploading ${typeName}:`, error);
            setResult({
              error: true,
              message: `Failed to upload ${typeName}: ${error.message}`,
            });
            allUploadsSuccessful = false;
            break; // Hentikan loop jika ada yang gagal
          }
        } else if (file === null && field === "studentIdCard") {
          // File wajib tidak ada
          setResult({
            error: true,
            message: "Student Identification Card is required.",
          });
          allUploadsSuccessful = false;
          break;
        } else {
          // File opsional tidak ada, tidak perlu upload, set driveIdField ke undefined/null
          updatedDriveIds[driveIdField] = undefined;
          updateFileProgress(String(field), 0); // Pastikan progress direset
        }
      }

      if (allUploadsSuccessful) {
        setOverallUploadStatus(
          "All documents uploaded. Saving submission data...",
        );

        const input = new FormData();
        input.append("competitionId", formData.competitionId);
        input.append("teamId", formData.teamId);
        input.append("groupName", formData.groupName);
        input.append(
          "studentIdCardDriveId",
          formData.studentIdCardDriveId || "",
        );
        input.append("twibbonDriveId", formData.twibbonDriveId || "");
        input.append(
          "exertionUIPromptDriveId",
          formData.exertionUIPromptDriveId || "",
        );
        input.append(
          "exerciseFTUIPromptDriveId",
          formData.exerciseFTUIPromptDriveId || "",
        );

        try {
          const saveResponse = await saveDocuments(input);

          if (saveResponse.error) {
            throw new Error(saveResponse.message);
          }
          setResult({
            success: true,
            message: "Submission documents saved successfully!",
          });
        } catch (error: any) {
          console.error("Error saving submission documents:", error);
          setResult({
            error: true,
            message: `Failed to save submission documents: ${error.message}`,
          });
          allUploadsSuccessful = false;
        }
      }

      setLoading(false);
      return allUploadsSuccessful;
    };

    useImperativeHandle(ref, () => ({
      handleSave,
    }));

    return (
      <div className="flex h-full w-full flex-col items-center px-4 pt-2 md:pt-4">
        <h2 className="mx-auto mb-2 w-full max-w-xs text-left font-orbitron text-xl font-bold text-white md:mb-8 md:text-center md:text-5xl sm:max-w-4xl">
          REQUIRED DOCUMENTS
        </h2>
        {/* {overallUploadStatus && (
          <div className="mb-2 w-full max-w-xs rounded-lg bg-blue-100 p-2 text-center text-sm font-medium text-blue-800 md:max-w-4xl">
            {overallUploadStatus}
          </div>
        )} */}
        {/* {result && (
          <div
            className={`w-full max-w-xs rounded-lg p-2 text-center text-sm font-medium ${
              result.error
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            } md:max-w-4xl`}
          >
            {result.message}
          </div>
        )} */}

        <div className="w-full p-1">
          <div className="mx-auto grid w-full max-w-xs grid-cols-1 gap-x-6 gap-y-3 pb-4 md:gap-x-10 md:gap-y-8 sm:max-w-4xl sm:grid-cols-2">
            <div className="flex flex-col items-center">
              <h4 className="mb-1.5 text-center font-orbitron text-xs text-white md:mb-3 md:text-base">
                Students Identification Card
              </h4>
              <FileUploadBox
                fieldName="studentIdCard"
                currentFile={formData.studentIdCard}
                onFileUpload={handleFileUpload}
                onRemoveFile={removeDocument}
                supportedFormats=".pdf,.png,.jpg,.jpeg" // Tambahkan .jpeg
                maxSizeMB={20}
              />
            </div>

            <div className="flex flex-col items-center">
              <h4 className="mb-1.5 text-center font-orbitron text-xs text-white md:mb-3 md:text-base">
                Twibbon Upload
              </h4>
              <FileUploadBox
                fieldName="twibbon"
                currentFile={formData.twibbon}
                onFileUpload={handleFileUpload}
                onRemoveFile={removeDocument}
                supportedFormats=".pdf,.png,.jpg,.jpeg" // Hanya image, bukan PDF
                maxSizeMB={20}
              />
            </div>

            <div className="flex flex-col items-center">
              <h4 className="mb-1.5 text-center font-orbitron text-xs text-white md:mb-3 md:text-sm">
                @exertion.ui & @exercise.ftui Follow Proof
              </h4>
              <FileUploadBox
                fieldName="exertionUIPrompt"
                currentFile={formData.exertionUIPrompt}
                onFileUpload={handleFileUpload}
                onRemoveFile={removeDocument}
                supportedFormats=".pdf,.png,.jpg,.jpeg"
                maxSizeMB={20}
              />
            </div>

            <div className="flex flex-col items-center">
              <h4 className="mb-1.5 text-center font-orbitron text-xs text-white md:mb-3 md:text-base">
                Poster Story Upload (Tag @exertion.ui)
              </h4>
              <FileUploadBox
                fieldName="exerciseFTUIPrompt"
                currentFile={formData.exerciseFTUIPrompt}
                onFileUpload={handleFileUpload}
                onRemoveFile={removeDocument}
                supportedFormats=".pdf,.png,.jpg,.jpeg"
                maxSizeMB={20}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

Documents.displayName = "Documents";
export default Documents;
