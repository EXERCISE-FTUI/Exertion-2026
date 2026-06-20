"use client";

import React, { useCallback, useState } from "react";
import { File as FileIcon, Trash, Upload } from "lucide-react";

// Types for the component props
interface FileUploadProps {
  label: string;
  note?: string;
  acceptedFormats: string;
  maxSize: number; // in MB
  onChange: (file: File | string | null) => void;
  file: File | string | null;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  size?: "sm" | "md" | "lg"; // Size prop to control styling
}

// Reusable File Upload Component
const FileUpload: React.FC<FileUploadProps> = ({
  label,
  note,
  acceptedFormats,
  maxSize,
  onChange,
  file,
  className = "",
  disabled = false,
  showPreview = true,
  size = "md", // Default to medium size
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Configurations for different sizes
  const sizeConfig = {
    sm: {
      iconSize: "h-4 w-4",
      textSize: "text-xs",
      labelSize: "text-xs",
      padding: "p-1",
      uploadPadding: "p-2",
      spacing: "space-y-1",
      margin: "mt-1",
      trashSize: "h-3 w-3",
      trashPosition: "top-1 right-1",
      width: "w-48",
      infoTextSize: "text-xs",
      height: "h-[80px]",
    },
    md: {
      iconSize: "h-6 w-6",
      textSize: "text-xs",
      labelSize: "text-xs",
      padding: "p-3",
      uploadPadding: "p-6",
      spacing: "space-y-1",
      margin: "mt-2",
      trashSize: "h-4 w-4",
      trashPosition: "top-2 right-2",
      width: "w-70",
      infoTextSize: "text-[10px]",
      height: "h-[100px]",
    },
    lg: {
      iconSize: "h-7 w-7",
      textSize: "text-xs",
      labelSize: "text-[13px]",
      padding: "p-3",
      uploadPadding: "p-5",
      spacing: "space-y-1",
      margin: "mt-3",
      trashSize: "h-5 w-5",
      trashPosition: "top-3 right-3",
      width: "w-75",
      infoTextSize: "text-xs",
      height: "h-[105px]",
    },
  };

  const config = sizeConfig[size];

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      const acceptedTypes = acceptedFormats
        .split(",")
        .map((format) => format.trim().toLowerCase().replace(".", ""));

      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const fileType = file.type.toLowerCase();

      const isValidType = acceptedTypes.some(
        (type) => fileType.includes(type) || fileExtension === type,
      );

      if (!isValidType) {
        return `Invalid format. Use: ${acceptedFormats}`;
      }

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        return `File size must be less than ${maxSize}MB`;
      }

      return null;
    },
    [acceptedFormats, maxSize],
  );

  const handleFile = useCallback(
    async (file: File) => {
      if (disabled) return;

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsUploading(true);

      try {
        // Simulate upload delay (replace with your actual upload logic)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        onChange(file);
      } catch (err) {
        setError("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [disabled, validateFile, onChange],
  );

  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    },
    [disabled],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (disabled) return;
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [disabled, handleFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (disabled) return;
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [disabled, handleFile],
  );

  const handleRemove = useCallback(() => {
    if (disabled) return;
    onChange(null);
    setError(null);
  }, [disabled, onChange]);

  const renderFileContent = () => {
    if (isUploading && file instanceof File) {
      return (
        <>
          <div
            className={`animate-spin rounded-full ${config.iconSize} border-b-2 border-blue-500`}
          ></div>
          <div
            className={`text-center ${config.textSize} font-medium text-blue-600`}
          >
            Uploading {file.name}...
          </div>
        </>
      );
    }

    if (file) {
      if (typeof file === "string") {
        return (
          <>
            <FileIcon className={`${config.iconSize} text-gray-500`} />
            <div className={`flex items-center justify-center gap-2`}>
              <a
                href={file}
                className={`font-medium text-blue-500 hover:underline ${config.textSize} z-10`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View File
              </a>
            </div>
            <Trash
              className={`${config.trashSize} absolute ${config.trashPosition} z-10 cursor-pointer text-gray-500 hover:text-red-500`}
              onClick={handleRemove}
            />
          </>
        );
      } else {
        return (
          <>
            <FileIcon className={`h-7 w-7 text-green-500`} />
            <div
              className={`text-center text-[10px] font-medium text-gray-700`}
            >
              {file.name}
            </div>
            <div className="text-[10px] text-gray-500">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </div>
            <Trash
              className={`absolute top-2 right-2 z-10 h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500`}
              onClick={handleRemove}
            />
          </>
        );
      }
    }

    return (
      <>
        <Upload className={`${config.iconSize} text-gray-500`} />
        <p className={`${config.textSize} text-center text-gray-600`}>
          Drag and drop file or{" "}
          <span className="cursor-pointer font-semibold text-blue-500 underline underline-offset-2">
            Choose File
          </span>
        </p>
      </>
    );
  };

  return (
    <div
      className={`flex flex-col ${config.spacing} ${config.width} ${className}`}
    >
      {label && (
        <label className={`font-semibold text-white ${config.labelSize}`}>
          {label}
        </label>
      )}
      {note && <p className={`${config.textSize} text-gray-500`}>{note}</p>}

      <div
        className={`rounded-lg border border-gray-200 bg-white ${config.padding}`}
      >
        <div
          className={`relative rounded-lg border-2 border-dashed ${config.uploadPadding} transition-colors ${config.height} ${dragActive && !disabled ? "border-blue-500 bg-blue-50" : "border-gray-300"} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-gray-400"} `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            accept={acceptedFormats}
            onChange={handleChange}
            disabled={disabled}
          />

          <div
            className={`flex flex-col items-center justify-center gap-1 py-1`}
          >
            {renderFileContent()}
          </div>

          {error && (
            <div
              className={`${config.margin} ${config.textSize} text-center text-red-600`}
            >
              {error}
            </div>
          )}
        </div>

        <div
          className={`flex flex-wrap justify-between ${config.margin} ${config.infoTextSize} text-gray-500`}
        >
          <span>Supported formats: {acceptedFormats}</span>
          <span>Maximum size: {maxSize}MB</span>
        </div>
      </div>
    </div>
  );
};

export { FileUpload };
