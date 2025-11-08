"use client";

import * as React from "react";
import { FileIcon, XIcon, UploadIcon } from "lucide-react";
import { cn } from "./../../lib/utils";
import { Button } from "./button";

export interface FileUploadProps {
  value?: File[];
  onChange?: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function FileUpload({
  value = [],
  onChange,
  multiple = false,
  accept,
  maxSize,
  disabled = false,
  className,
  placeholder = "Click to upload or drag and drop",
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Filter by maxSize if specified
    const validFiles = maxSize 
      ? fileArray.filter(file => file.size <= maxSize)
      : fileArray;

    if (multiple) {
      onChange?.(validFiles);
    } else {
      onChange?.(validFiles.slice(0, 1));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange?.(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver ? "border-primary bg-primary/5" : "border-gray-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">{placeholder}</p>
        {maxSize && (
          <p className="text-xs text-gray-500 mt-1">
            Max file size: {formatFileSize(maxSize)}
          </p>
        )}
        
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          Choose Files
        </Button>
      </div>

      {value.length > 0 && (
        <div className="mt-4 space-y-2">
          {value.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <FileIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
