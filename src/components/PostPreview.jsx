import React from "react";

const PostPreview = ({ title, content, link, file }) => {
  return (
    <div className="bg-muted p-4 rounded-lg min-h-[200px]">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      {content && <p className="whitespace-pre-wrap">{content}</p>}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {link}
        </a>
      )}
      {file && (
        <div className="mt-4">
          {file.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(file)}
              alt="Uploaded content"
              className="max-w-full h-auto rounded-lg"
            />
          ) : file.type.startsWith("video/") ? (
            <video
              src={URL.createObjectURL(file)}
              controls
              className="max-w-full h-auto rounded-lg"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <p>File: {file.name}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostPreview;
