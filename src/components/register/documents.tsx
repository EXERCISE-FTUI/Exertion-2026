"use client";
import { saveDocuments } from "@/actions/upload/saveDocuments";
import { getOrCreateTeamFolder } from "@/utils/google/getOrCreateTeamFolder";
import { File as FileIcon, Trash, Upload } from "lucide-react";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { toast } from "sonner";
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

interface Props {
  formData: FormData;
  updateFormData: (field: keyof FormData, value: any) => void;
  handleFileUpload: (field: keyof FormData, file: File | null) => void;
  removeDocument: (field: keyof FormData) => void;
}

export interface DocumentRef {
  handleSave: () => Promise<boolean>;
}

interface FileUploadBoxProps {
  fieldName: keyof FormData;
  currentFile: any;
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
      setFileError(`Unsupported format. Accepted: ${supportedFormats.toUpperCase()}.`);
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

  const formatDisplay = supportedFormats.replace(/\./g, "").replace(/,/g, ", ").toUpperCase();

  return (
    <div className="w-full relative flex flex-col rounded-xl bg-white p-2.5 shadow-[0_0_15px_rgba(255,255,255,0.15)] md:p-3">
      <div
        className={`relative flex w-full min-h-[100px] min-[480px]:min-h-[120px] md:min-h-[150px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors duration-200 ${
          isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onDragOver={(e) => handleDrag(e, true)}
        onDrop={handleDrop}
      >
        {currentFile ? (
          <div className="flex flex-col items-center justify-center p-4">
            <FileIcon className="mb-2 h-5 w-5 text-green-500 min-[480px]:h-6 min-[480px]:w-6 md:h-8 md:w-8" />
            {currentFile.url ? (
              <a
                href={currentFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-[150px] min-[480px]:max-w-[180px] md:max-w-[220px] truncate text-center text-[9px] min-[480px]:text-[10px] md:text-sm font-medium text-blue-500 hover:underline"
              >
                {currentFile.name}
              </a>
            ) : currentFile instanceof File ? (
              <a
                href={URL.createObjectURL(currentFile)}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-[150px] min-[480px]:max-w-[180px] md:max-w-[220px] truncate text-center text-[9px] min-[480px]:text-[10px] md:text-sm font-medium text-blue-500 hover:underline"
              >
                {currentFile.name}
              </a>
            ) : (
              <span className="max-w-[150px] min-[480px]:max-w-[180px] md:max-w-[220px] truncate text-center text-[9px] min-[480px]:text-[10px] md:text-sm font-medium text-gray-700">
                {currentFile.name}
              </span>
            )}
            <span className="mt-1 text-[8px] text-gray-500 md:text-xs">
              {currentFile.size !== undefined ? (currentFile.size / (1024 * 1024)).toFixed(2) + " MB" : ""}
            </span>
            <Trash
              className="absolute right-2 top-2 z-10 h-3.5 w-3.5 md:h-5 md:w-5 cursor-pointer text-gray-400 transition-colors hover:text-red-500"
              onClick={() => onRemoveFile(fieldName)}
            />
          </div>
        ) : (
          <>
            <Upload className="mb-2 h-5 w-5 md:h-7 md:w-7 text-[#94A3B8]" strokeWidth={1.5} />
            <input
              type="file"
              id={`file-upload-${String(fieldName)}`}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={handleFileChange}
              accept={supportedFormats}
            />
            <label
              htmlFor={`file-upload-${String(fieldName)}`}
              className="cursor-pointer text-center text-[9px] font-medium text-gray-700 min-[480px]:text-[10px] md:text-xs"
            >
              Drag and drop file or <span className="font-bold text-[#3B82F6] underline">Choose File</span>
            </label>
          </>
        )}
      </div>

      <div className="mt-2 flex w-full items-center justify-between px-1 md:mt-3">
        <span className="text-[7px] font-semibold tracking-wide text-gray-500 min-[480px]:text-[8px] md:text-[10px]">
          Supported formats: {formatDisplay}
        </span>
        <span className="text-[7px] font-semibold tracking-wide text-gray-500 min-[480px]:text-[8px] md:text-[10px]">
          Maximum Size: {maxSizeMB} MB
        </span>
      </div>

      {fileError && (
        <div className="absolute -bottom-5 left-0 w-full text-center text-[9px] font-semibold text-red-400 md:text-xs">
          {fileError}
        </div>
      )}
    </div>
  );
};

interface MemberDocSectionProps {
  label: string;
  name: string;
  studentIdCardField: keyof FormData;
  twibbonField: keyof FormData;
  instagramStoryField: keyof FormData;
  studentIdCardFile: any;
  twibbonFile: any;
  instagramStoryFile: any;
  onFileUpload: (field: keyof FormData, file: File | null) => void;
  onRemoveFile: (field: keyof FormData) => void;
}

const MemberDocSection: React.FC<MemberDocSectionProps> = ({
  label,
  name,
  studentIdCardField,
  twibbonField,
  instagramStoryField,
  studentIdCardFile,
  twibbonFile,
  instagramStoryFile,
  onFileUpload,
  onRemoveFile,
}) => {
  const displayName = name ? `${label.toUpperCase()} - ${name.toUpperCase()}` : label.toUpperCase();

  return (
    <div className="flex w-full flex-col mb-8 md:mb-12">
      <h3 className="mb-4 font-orbitron text-base font-black tracking-wider text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] min-[360px]:text-lg min-[480px]:text-xl md:mb-6 md:text-2xl">
        {displayName}
      </h3>

      <div className="flex w-full flex-col gap-4 md:gap-8">
        <div className="flex w-full flex-col gap-4 md:flex-row md:gap-8">
          <div className="flex flex-1 flex-col">
            <span className="mb-1.5 ml-1 text-xs font-medium text-[#FFF2CA] min-[480px]:text-sm md:mb-2 md:text-base">
              Student Identification Card
            </span>
            <FileUploadBox
              fieldName={studentIdCardField}
              currentFile={studentIdCardFile}
              onFileUpload={onFileUpload}
              onRemoveFile={onRemoveFile}
              supportedFormats=".pdf,.png,.jpg,.jpeg"
              maxSizeMB={10}
            />
          </div>
          <div className="flex flex-1 flex-col">
            <span className="mb-1.5 ml-1 text-xs font-medium text-[#FFF2CA] min-[480px]:text-sm md:mb-2 md:text-base">
              Twibbon Upload
            </span>
            <FileUploadBox
              fieldName={twibbonField}
              currentFile={twibbonFile}
              onFileUpload={onFileUpload}
              onRemoveFile={onRemoveFile}
              supportedFormats=".pdf,.png,.jpg,.jpeg"
              maxSizeMB={10}
            />
          </div>
        </div>

        <div className="mx-auto flex w-full flex-col md:w-[48%]">
          <span className="mb-1.5 ml-1 text-xs font-medium text-[#FFF2CA] min-[480px]:text-sm md:mb-2 md:text-base">
            Instagram Story
          </span>
          <FileUploadBox
            fieldName={instagramStoryField}
            currentFile={instagramStoryFile}
            onFileUpload={onFileUpload}
            onRemoveFile={onRemoveFile}
            supportedFormats=".pdf,.png,.jpg,.jpeg"
            maxSizeMB={10}
          />
        </div>
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
    const [fileProgress, setFileProgress] = useState<Record<string, number>>({});

    useEffect(() => {
      if (!result) return;
      if (result.error) {
        toast.error(result.message);
      } else if (result.success) {
        toast.success(result.message);
      }
    }, [result]);

    const updateFileProgress = useCallback(
      (fieldName: string, percent: number) => {
        setFileProgress((prev) => ({ ...prev, [fieldName]: percent }));
      },
      [],
    );

    const uploadSingleFile = useCallback(
      async (
        file: File,
        fileNameInDrive: string,
        teamFolderId: string,
        fieldName: keyof FormData,
      ): Promise<string> => {
        try {
          setOverallUploadStatus(`Initiating upload for ${fileNameInDrive}...`);
          const resumableUri = await apiInitiateUploadSession(fileNameInDrive, file.type, teamFolderId);
          if (!resumableUri) throw new Error("Failed to get resumable session URI.");

          let currentByte = 0;
          const totalBytes = file.size;

          while (currentByte < totalBytes) {
            const uploadedBytes = await apiChunkUpload(
              resumableUri, file, currentByte,
              Math.min(currentByte + CHUNK_SIZE, totalBytes), totalBytes,
            );
            currentByte = uploadedBytes;
            updateFileProgress(String(fieldName), Math.round((currentByte / totalBytes) * 100));
            setOverallUploadStatus(`Uploading ${fileNameInDrive}: ${Math.round((currentByte / totalBytes) * 100)}%`);
          }

          setOverallUploadStatus(`Finalizing ${fileNameInDrive}...`);
          const finalizationResult = await apiFinalizeUploadSession(resumableUri);
          if (!finalizationResult || !finalizationResult.id)
            throw new Error(`Failed to finalize upload for ${fileNameInDrive}.`);

          updateFileProgress(String(fieldName), 100);
          return finalizationResult.id;
        } catch (error: any) {
          updateFileProgress(String(fieldName), -1);
          throw error;
        }
      },
      [updateFileProgress],
    );

    const handleSave = async (): Promise<boolean> => {
      setLoading(true);
      setResult(null);
      setOverallUploadStatus("Starting document upload process...");

      if (!formData.competitionId || !formData.teamId || !formData.groupName) {
        setResult({ error: true, message: "Competition ID, Team ID, and Group Name are required." });
        setLoading(false);
        return false;
      }
      if (!formData.studentIdCard || !formData.twibbon || !formData.instagramStory) {
        setResult({ error: true, message: "All leader documents are required." });
        setLoading(false);
        return false;
      }
      if (formData.memberCount >= 2 && (!formData.member2StudentIdCard || !formData.member2Twibbon || !formData.member2InstagramStory)) {
        setResult({ error: true, message: "All Member #2 documents are required." });
        setLoading(false);
        return false;
      }
      if (formData.memberCount >= 3 && (!formData.member3StudentIdCard || !formData.member3Twibbon || !formData.member3InstagramStory)) {
        setResult({ error: true, message: "All Member #3 documents are required." });
        setLoading(false);
        return false;
      }

      let teamFolderId: string | null = null;
      try {
        setOverallUploadStatus("Getting or creating team folder...");
        const folderResult = await getOrCreateTeamFolder(formData.competitionId);
        teamFolderId = folderResult?.folderId || null;
        if (!teamFolderId) throw new Error("Failed to get team folder ID.");
      } catch (error: any) {
        setResult({ error: true, message: `Folder creation/retrieval failed: ${error.message}` });
        setLoading(false);
        return false;
      }

      type UploadItem = {
        field: keyof FormData;
        file: File | null;
        typeName: string;
        driveIdField: keyof FormData;
        required: boolean;
      };

      const filesToUpload: UploadItem[] = [
        { field: "studentIdCard", file: formData.studentIdCard, typeName: "leader_studentidcard", driveIdField: "studentIdCardDriveId", required: true },
        { field: "twibbon", file: formData.twibbon, typeName: "leader_twibbon", driveIdField: "twibbonDriveId", required: true },
        { field: "instagramStory", file: formData.instagramStory, typeName: "leader_instagramstory", driveIdField: "instagramStoryDriveId", required: true },
      ];

      if (formData.memberCount >= 2) {
        filesToUpload.push(
          { field: "member2StudentIdCard", file: formData.member2StudentIdCard, typeName: "member2_studentidcard", driveIdField: "member2StudentIdCardDriveId", required: true },
          { field: "member2Twibbon", file: formData.member2Twibbon, typeName: "member2_twibbon", driveIdField: "member2TwibbonDriveId", required: true },
          { field: "member2InstagramStory", file: formData.member2InstagramStory, typeName: "member2_instagramstory", driveIdField: "member2InstagramStoryDriveId", required: true },
        );
      }

      if (formData.memberCount >= 3) {
        filesToUpload.push(
          { field: "member3StudentIdCard", file: formData.member3StudentIdCard, typeName: "member3_studentidcard", driveIdField: "member3StudentIdCardDriveId", required: true },
          { field: "member3Twibbon", file: formData.member3Twibbon, typeName: "member3_twibbon", driveIdField: "member3TwibbonDriveId", required: true },
          { field: "member3InstagramStory", file: formData.member3InstagramStory, typeName: "member3_instagramstory", driveIdField: "member3InstagramStoryDriveId", required: true },
        );
      }

      let allUploadsSuccessful = true;

      for (const { field, file, typeName, driveIdField } of filesToUpload) {
        if (!file) {
          setResult({ error: true, message: `${typeName} is required.` });
          allUploadsSuccessful = false;
          break;
        }
        
        if (!(file instanceof File) || file.name === "uploaded.pdf" || file.name === "submission.pdf" || file.name === "payment_proof.pdf" || (file as any).url) {
            setOverallUploadStatus(`Skipping previously uploaded ${typeName}...`);
            continue;
        }

        try {
          const driveFileName = `${formData.groupName}_${formData.competition}_${typeName}`;
          setOverallUploadStatus(`Uploading ${typeName}...`);
          const fileId = await uploadSingleFile(file, driveFileName, teamFolderId!, field);
          if (!fileId) throw new Error(`No file ID returned for ${typeName}.`);
          (formData as any)[driveIdField] = fileId;
          setOverallUploadStatus(`${typeName} uploaded successfully!`);
        } catch (error: any) {
          setResult({ error: true, message: `Failed to upload ${typeName}: ${error.message}` });
          allUploadsSuccessful = false;
          break;
        }
      }

      if (allUploadsSuccessful) {
        setOverallUploadStatus("All documents uploaded. Saving to database...");

        const input = new FormData();
        input.append("competitionId", formData.competitionId);
        input.append("teamId", formData.teamId);
        input.append("groupName", formData.groupName);
        input.append("memberCount", String(formData.memberCount));

        input.append("studentIdCardDriveId", formData.studentIdCardDriveId || "");
        input.append("twibbonDriveId", formData.twibbonDriveId || "");
        input.append("instagramStoryDriveId", formData.instagramStoryDriveId || "");

        input.append("member2StudentIdCardDriveId", formData.member2StudentIdCardDriveId || "");
        input.append("member2TwibbonDriveId", formData.member2TwibbonDriveId || "");
        input.append("member2InstagramStoryDriveId", formData.member2InstagramStoryDriveId || "");

        input.append("member3StudentIdCardDriveId", formData.member3StudentIdCardDriveId || "");
        input.append("member3TwibbonDriveId", formData.member3TwibbonDriveId || "");
        input.append("member3InstagramStoryDriveId", formData.member3InstagramStoryDriveId || "");

        try {
          const saveResponse = await saveDocuments(input);
          if (saveResponse.error) throw new Error(saveResponse.message);
          setResult({ success: true, message: "Documents saved successfully!" });
        } catch (error: any) {
          setResult({ error: true, message: `Failed to save documents: ${error.message}` });
          allUploadsSuccessful = false;
        }
      }

      setLoading(false);
      return allUploadsSuccessful;
    };

    useImperativeHandle(ref, () => ({ handleSave }));

    return (
      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-start px-2 py-4 min-[480px]:p-4 min-[480px]:pt-12 md:px-10 lg:pt-20">
        <h1 className="mt-8 min-[480px]:mt-0 mb-6 w-full text-center font-orbitron text-xl font-black tracking-wide text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] min-[340px]:text-2xl min-[340px]:tracking-[0.15em] min-[480px]:mb-10 min-[480px]:text-3xl md:mb-14 md:text-5xl">
          REQUIRED DOCUMENTS
        </h1>

        <div className="flex w-full max-w-[96%] flex-col pb-8 min-[480px]:max-w-md md:max-w-2xl lg:max-w-4xl">
          <MemberDocSection
            label="Member #1"
            name={formData.leaderName}
            studentIdCardField="studentIdCard"
            twibbonField="twibbon"
            instagramStoryField="instagramStory"
            studentIdCardFile={formData.studentIdCard}
            twibbonFile={formData.twibbon}
            instagramStoryFile={formData.instagramStory}
            onFileUpload={handleFileUpload}
            onRemoveFile={removeDocument}
          />

          {formData.memberCount >= 2 && (
            <MemberDocSection
              label="Member #2"
              name={formData.member2Name || ""}
              studentIdCardField="member2StudentIdCard"
              twibbonField="member2Twibbon"
              instagramStoryField="member2InstagramStory"
              studentIdCardFile={formData.member2StudentIdCard}
              twibbonFile={formData.member2Twibbon}
              instagramStoryFile={formData.member2InstagramStory}
              onFileUpload={handleFileUpload}
              onRemoveFile={removeDocument}
            />
          )}

          {formData.memberCount >= 3 && (
            <MemberDocSection
              label="Member #3"
              name={formData.member3Name || ""}
              studentIdCardField="member3StudentIdCard"
              twibbonField="member3Twibbon"
              instagramStoryField="member3InstagramStory"
              studentIdCardFile={formData.member3StudentIdCard}
              twibbonFile={formData.member3Twibbon}
              instagramStoryFile={formData.member3InstagramStory}
              onFileUpload={handleFileUpload}
              onRemoveFile={removeDocument}
            />
          )}
        </div>

        {result && (
          <div
            className={`mx-auto mt-2 w-full max-w-[96%] min-[480px]:max-w-sm rounded-lg p-2 text-center text-sm font-medium ${
              result.error ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }`}
          >
            {result.message}
          </div>
        )}
      </div>
    );
  },
);

Documents.displayName = "Documents";
export default Documents;