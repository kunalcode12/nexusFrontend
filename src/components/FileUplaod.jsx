import { ImageIcon, Video } from "lucide-react";

const FileUpload = ({
  type,
  file,
  onFileChange,
  triggerFileInput,
  fileInputRef,
}) => {
  const Icon = type === "image" ? ImageIcon : Video;
  const acceptType = type === "image" ? "image/*" : "video/*";

  return (
    <div>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
        onClick={triggerFileInput}
      >
        <Icon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-1">Click to upload a {type}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptType}
          onChange={onFileChange}
          className="hidden"
        />
      </div>
      {file && file.type.startsWith(`${type}/`) && (
        <div className="mt-4">
          {type === "image" ? (
            <img
              src={URL.createObjectURL(file)}
              alt="Uploaded image"
              className="max-w-full h-auto rounded-lg"
            />
          ) : (
            <video
              src={URL.createObjectURL(file)}
              controls
              className="max-w-full h-auto rounded-lg"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
