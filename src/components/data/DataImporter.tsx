import { useReportStore } from "@/lib/store/reportStore";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function DataImporter() {
  const importData = useReportStore((state) => state.importData);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target?.result as string);
            importData(jsonData);
          } catch (error) {
            console.error("Failed to parse JSON:", error);
            // TODO: Add proper error handling/notification
          }
        };
        reader.readAsText(file);
      }
    },
    [importData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
    },
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:bg-gray-50"
          }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive
            ? "Drop the JSON file here..."
            : "Drag & drop JSON data file, or click to select"}
        </p>
      </div>
    </div>
  );
}
