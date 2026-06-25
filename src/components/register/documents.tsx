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

const CHUNK_SIZE = 256 * 1024; // 256KB

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
    if (!file) { setFileError(null); return true; }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setFileError(`File size exceeds ${maxSizeMB} MB.`);
      return false;
    }
    const acceptedFormatsArray = supportedFormats.split(",").map((f) => f.trim().toLowerCase());
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const fileType = file.type;
    if (!acceptedFormatsArray.includes(fileExtension) && !acceptedFormatsArray.includes(fileType)) {
      setFileError(`Unsupported file format. Accepted: ${supportedFormats.toUpperCase()}.`);
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
    else { onFileUpload(fieldName, null); e.target.value = ""; }
  };

  return (
    <div className="group relative flex h-22 w-full flex-col items-center justify-between rounded-lg border border-gray-200 bg-white p-2 text-gray-800 shadow-md md:h-36 md:p-3">
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
            <span className="text-[6px] text-gray-500 md:text-[10px]">
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

interface MemberDocSectionProps {
  label: string;
  name: string;
  studentIdCardField: keyof FormData;
  twibbonField: keyof FormData;
  instagramStoryField: keyof FormData;
  studentIdCardFile: File | null;
  twibbonFile: File | null;
  instagramStoryFile: File | null;
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
}) => (
  <div className="w-full rounded-xl bg-transparent p-3 md:p-5">
    <div className="mb-3 flex items-center gap-2 md:mb-4">
      <div>
        {name && <p className="text-[9px] text-[#44EAB0] md:text-xs">{name}</p>}
      </div>
    </div>

    <div className="grid grid-cols-3 gap-2 md:gap-4">
      <div className="flex flex-col items-center gap-1">
        <p className="text-center font-orbitron text-[7px] text-white md:text-[10px]">
          Student ID Card
        </p>
        <FileUploadBox
          fieldName={studentIdCardField}
          currentFile={studentIdCardFile}
          onFileUpload={onFileUpload}
          onRemoveFile={onRemoveFile}
          supportedFormats=".pdf,.png,.jpg,.jpeg"
          maxSizeMB={20}
        />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-center font-orbitron text-[7px] text-white md:text-[10px]">
          Twibbon
        </p>
        <FileUploadBox
          fieldName={twibbonField}
          currentFile={twibbonFile}
          onFileUpload={onFileUpload}
          onRemoveFile={onRemoveFile}
          supportedFormats=".png,.jpg,.jpeg"
          maxSizeMB={20}
        />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-center font-orbitron text-[7px] text-white md:text-[10px]">
          Instagram Story
        </p>
        <FileUploadBox
          fieldName={instagramStoryField}
          currentFile={instagramStoryFile}
          onFileUpload={onFileUpload}
          onRemoveFile={onRemoveFile}
          supportedFormats=".png,.jpg,.jpeg"
          maxSizeMB={20}
        />
      </div>
    </div>
  </div>
);

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
          console.error(`Error uploading ${fileNameInDrive}:`, error);
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
        try {
          const driveFileName = `${formData.groupName}_${formData.competition}_${typeName}`;
          setOverallUploadStatus(`Uploading ${typeName}...`);
          const fileId = await uploadSingleFile(file, driveFileName, teamFolderId!, field);
          if (!fileId) throw new Error(`No file ID returned for ${typeName}.`);
          (formData as any)[driveIdField] = fileId;
          setOverallUploadStatus(`${typeName} uploaded successfully!`);
        } catch (error: any) {
          console.error(`Error uploading ${typeName}:`, error);
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
          console.error("Error saving documents:", error);
          setResult({ error: true, message: `Failed to save documents: ${error.message}` });
          allUploadsSuccessful = false;
        }
      }

      setLoading(false);
      return allUploadsSuccessful;
    };

    useImperativeHandle(ref, () => ({ handleSave }));

    return (
      <div className="flex h-full w-full flex-col items-center px-4 pt-2 md:pt-4">
        <h2 className="mx-auto mb-4 w-full max-w-xs text-left font-orbitron text-xl font-bold text-white md:mb-6 md:text-center md:text-4xl sm:max-w-4xl">
          REQUIRED DOCUMENTS
        </h2>

        <div className="custom-scrollbar-hidden w-full max-w-xs space-y-3 overflow-y-auto pb-4 sm:max-w-4xl md:space-y-4">
          <MemberDocSection
            label="Leader"
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
            className={`mx-auto mt-3 w-full max-w-xs rounded-lg p-2 text-center text-sm font-medium sm:max-w-4xl ${result.error ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
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