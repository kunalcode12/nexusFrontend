import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  Type,
  Image as ImageIcon,
  Video,
  Send,
  Eye,
  X,
  Check,
  Loader,
} from "lucide-react";
import { Button } from "../components/UI/Button";
import { Input } from "../components/UI/Input";
import { Textarea } from "../components/UI/TextArea";

import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { addPost, setLoading, setError } from "../store/postSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { mediaService } from "@/services/mediaService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";

const categories = [
  "Education",
  "Entertainment",
  "Music",
  "Sports",
  "Technology",
  "Travel",
  "Food & Drink",
  "Art & Design",
];

const EnhancedSubmitPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  // State variables
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [activeButton, setActiveButton] = useState("post");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState(null);
  const [mediaUploadInfo, setMediaUploadInfo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    title: false,
    category: false,
    content: false,
    media: false,
    link: false,
  });

  const fileInputRef = useRef(null);
  const loading = useSelector((state) => state.post.loading);

  // Clear success message after timeout
  useEffect(() => {
    let timer;
    if (successMessage) {
      timer = setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Validation check
  useEffect(() => {
    setValidationErrors({
      title: title.trim().length <= 1,
      category: selectedCategory === "",
      content: activeButton === "post" && content.trim().length <= 1,
      media:
        (activeButton === "image" || activeButton === "video") &&
        !uploadedMediaUrl,
      link: activeButton === "link" && link.trim().length === 0,
    });
  }, [title, content, activeButton, uploadedMediaUrl, link, selectedCategory]);

  // Chunk file into smaller pieces
  const chunkFile = (file) => {
    const chunks = [];
    const chunkSize = 1024 * 1024; // 1MB chunks

    for (let i = 0; i < file.size; i += chunkSize) {
      const chunk = file.slice(i, i + chunkSize);
      if (chunk.size > 0) {
        chunks.push(chunk);
      }
    }

    return chunks;
  };

  // Media upload handler
  const handleMediaUpload = async (selectedFile) => {
    try {
      setIsUploading(true);
      // Initialize upload
      const initResult = await mediaService.initializeUpload({
        title: selectedFile.name,
        type: selectedFile.type.startsWith("image/") ? "image" : "video",
        totalChunks: Math.ceil(selectedFile.size / (1024 * 1024)),
        metadata: {
          size: selectedFile.size,
          contentType: selectedFile.type,
          filename: selectedFile.name,
        },
      });
      setMediaUploadInfo(initResult.data);

      const { uploadId, totalChunks } = initResult.data;
      const chunks = chunkFile(selectedFile);

      // Upload chunks
      for (let i = 0; i < chunks.length; i++) {
        await mediaService.uploadChunk(
          chunks[i],
          i,
          uploadId,
          totalChunks,
          selectedFile.type.startsWith("image/") ? "image" : "video"
        );
        setUploadProgress(((i + 1) / chunks.length) * 100);
      }

      // Get final upload status
      const statusResponse = await fetch(
        `https://nexusbackend-ff1v.onrender.com/api/v1/media/status/${uploadId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const statusData = await statusResponse.json();
      console.log(statusData);

      setUploadedMediaUrl(statusData.data.url);
      return statusData.data.url;
    } catch (error) {
      console.error("Media upload failed:", error);
      setErrorMessage(error.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // File change handler
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    console.log(selectedFile);
    if (selectedFile) {
      setUploadProgress(0);
      setUploadedMediaUrl(null);
      setFile(selectedFile);

      // Automatically start upload
      await handleMediaUpload(selectedFile);
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for validation errors
    const currentErrors = {
      title: title.trim().length <= 1,
      category: selectedCategory === "",
      content: activeButton === "post" && content.trim().length <= 1,
      media:
        (activeButton === "image" || activeButton === "video") &&
        !uploadedMediaUrl,
      link: activeButton === "link" && link.trim().length === 0,
    };

    setValidationErrors(currentErrors);

    // If there are errors, don't submit
    if (Object.values(currentErrors).some((error) => error)) {
      return;
    }

    if (isSubmitEnabled) {
      dispatch(setLoading(true));
      try {
        // Prepare post data
        const postData = {
          title: title,
          description: content,
          url: link || uploadedMediaUrl,
          category: selectedCategory.toLowerCase(),
          ...(activeButton === "image" && {
            image: uploadedMediaUrl,
            mediaId: mediaUploadInfo?.media?._id,
            uploadId: mediaUploadInfo?.uploadId,
          }),
          ...(activeButton === "video" && {
            video: uploadedMediaUrl,
            mediaId: mediaUploadInfo?.media?._id,
            uploadId: mediaUploadInfo?.uploadId,
          }),
        };

        const response = await fetch(
          "https://nexusbackend-ff1v.onrender.com/api/v1/content",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(postData),
          }
        );

        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message || "Failed to create post");
        }

        dispatch(addPost(responseData.data.data));
        console.log("Post created:", responseData.data.data);
        setSuccessMessage("Post submitted successfully!");

        // Reset form and media upload info
        setTitle("");
        setContent("");
        setLink("");
        setFile(null);
        setUploadedMediaUrl(null);
        setUploadProgress(0);
        setMediaUploadInfo(null);
        setSelectedCategory("");

        // Navigate after a delay to allow the success message to be seen
        setTimeout(() => {
          navigate(`/user/${responseData.data.data.user}`);
        }, 2000);
      } catch (error) {
        console.error("Error creating post:", error);
        dispatch(setError(error.message));
        setErrorMessage("Unable to create a post");
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  // Memoized submit button state
  const isSubmitEnabled = useMemo(() => {
    return (
      title.trim().length > 1 &&
      selectedCategory !== "" &&
      (content.trim().length > 1 ||
        (activeButton === "image" && uploadedMediaUrl) ||
        (activeButton === "video" && uploadedMediaUrl) ||
        (activeButton === "link" && link.trim().length > 0))
    );
  }, [title, content, activeButton, uploadedMediaUrl, link, selectedCategory]);

  const submitButtonClass = useMemo(() => {
    const baseClass = "flex items-center";
    const enabledClass = "bg-blue-800 text-white hover:bg-blue-900";
    const disabledClass = "bg-gray-100 text-gray-400 cursor-not-allowed";

    return `${baseClass} ${isSubmitEnabled ? enabledClass : disabledClass}`;
  }, [isSubmitEnabled]);

  // Button and UI helpers
  const handleButtonClick = useCallback((buttonValue) => {
    setActiveButton(buttonValue);
    // Reset relevant state when switching
    if (buttonValue !== "image" && buttonValue !== "video") {
      setFile(null);
      setUploadedMediaUrl(null);
    }
  }, []);

  const getButtonStyle = (buttonValue) => {
    return activeButton === buttonValue
      ? "bg-gray-300 text-gray-800"
      : "hover:bg-gray-300 bg-white text-gray-600";
  };

  // Clear file handler
  const clearFile = () => {
    setFile(null);
    setUploadedMediaUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto ml-60 p-6 my-20 bg-background">
      {/* Error message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-12 left-12 right-12 bg-red-500 text-white p-4 text-center"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-12 left-12 right-12 bg-green-500 text-white p-4 text-center z-50"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-3xl font-bold mb-6 text-center">Create post</h1>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Title Input */}
        <div className="flex gap-4 items-center flex-col md:flex-row">
          <div className="flex-1 w-full">
            <Input
              type="text"
              id="title"
              placeholder="Title"
              value={title}
              name="title"
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-4 rounded-xl border ${
                validationErrors.title ? "border-red-500" : ""
              }`}
              required
            />
            {validationErrors.title && (
              <p className="text-red-500 text-sm mt-1">Please enter a title</p>
            )}
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-[180px] justify-between ${
                    validationErrors.category ? "border-red-500" : ""
                  }`}
                >
                  {selectedCategory || "Category"}
                  {selectedCategory && (
                    <X
                      className="w-4 h-4 ml-2 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory("");
                      }}
                    />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[180px]">
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="flex items-center justify-between"
                  >
                    {category}
                    {selectedCategory === category && (
                      <Check className="w-4 h-4 ml-2" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {validationErrors.category && (
              <p className="text-red-500 text-sm mt-1">Choose a category</p>
            )}
          </div>
        </div>

        {/* Content Type Buttons */}
        <div className="space-y-4">
          <div className="grid w-full grid-cols-4 h-auto gap-2">
            {["post", "image", "video", "link"].map((type) => (
              <Button
                key={type}
                type="button"
                onClick={() => handleButtonClick(type)}
                className={getButtonStyle(type)}
              >
                {type === "post" && <Type className="w-4 h-4 mr-2" />}
                {type === "image" && <ImageIcon className="w-4 h-4 mr-2" />}
                {type === "video" && <Video className="w-4 h-4 mr-2" />}
                {type === "link" && <Link2 className="w-4 h-4 mr-2" />}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>

          {/* Content Area */}
          {activeButton === "post" && (
            <div>
              <Textarea
                placeholder="Text (optional)"
                value={content}
                name="description"
                onChange={(e) => setContent(e.target.value)}
                className={`min-h-[190px] rounded-xl ${
                  validationErrors.content ? "border-red-500" : ""
                }`}
              />
              {validationErrors.content && (
                <p className="text-red-500 text-sm mt-1">
                  Please add some content
                </p>
              )}
            </div>
          )}

          {/* Media Upload Area */}
          {(activeButton === "image" || activeButton === "video") && (
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={activeButton === "image" ? "image/*" : "video/*"}
                className="hidden"
              />

              {!file && !uploadedMediaUrl ? (
                <div>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full p-4 border-2 border-dashed ${
                      validationErrors.media ? "border-red-500" : ""
                    }`}
                  >
                    Upload {activeButton === "image" ? "Image" : "Video"}
                  </Button>
                  {validationErrors.media && (
                    <p className="text-red-500 text-sm mt-1">
                      Please upload a{" "}
                      {activeButton === "image" ? "image" : "video"}
                    </p>
                  )}
                </div>
              ) : (
                <div className="relative">
                  {(isUploading ||
                    (uploadProgress > 0 && uploadProgress < 100)) && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}

                  {isUploading && (
                    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-xl">
                      <div className="flex flex-col items-center">
                        <Loader className="w-8 h-8 animate-spin text-blue-600" />
                        <p className="mt-2 text-gray-600">
                          Uploading {activeButton}...
                        </p>
                      </div>
                    </div>
                  )}

                  {!isUploading && uploadedMediaUrl && (
                    <div className="relative">
                      {activeButton === "image" ? (
                        <img
                          src={uploadedMediaUrl}
                          alt="Uploaded"
                          className="w-full h-64 object-cover rounded-xl"
                        />
                      ) : (
                        <video
                          src={uploadedMediaUrl}
                          controls
                          className="w-full h-64 object-cover rounded-xl"
                        />
                      )}
                      <Button
                        type="button"
                        onClick={clearFile}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Link Input */}
          {activeButton === "link" && (
            <div>
              <Input
                type="url"
                placeholder="Url"
                name="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className={`w-full p-4 rounded-xl ${
                  validationErrors.link ? "border-red-500" : ""
                }`}
              />
              {validationErrors.link && (
                <p className="text-red-500 text-sm mt-1">
                  Please enter a valid URL
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex items-center bg-gray-100 text-gray-400"
          >
            {isPreviewMode ? (
              <Type className="w-4 h-4 mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            {isPreviewMode ? "Edit" : "Preview"}
          </Button>
          <Button
            type="submit"
            className={submitButtonClass}
            disabled={!isSubmitEnabled || isUploading || loading}
          >
            {loading || isUploading ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {loading ? "Posting..." : isUploading ? "Uploading..." : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedSubmitPage;
