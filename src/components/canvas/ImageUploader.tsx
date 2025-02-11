import { useReportStore } from "@/lib/store/reportStore";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function ImageUploader() {
  const addImage = useReportStore((state) => state.addImage);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            addImage(dataUrl);
          };
          reader.readAsDataURL(file);
        }
      });
    },
    [addImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
  });

  return (
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
          ? "Drop the images here..."
          : "Drag & drop images here, or click to select"}
      </p>
    </div>
  );
}
