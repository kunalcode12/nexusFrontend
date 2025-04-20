import { useState, useRef, useMemo, useEffect } from "react";
import { useLocation, Link, useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Image,
  Play,
  FileText,
  X,
  LinkIcon,
  Send,
  ArrowLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "../components/UI/Button";
import { useSelector, useDispatch } from "react-redux";
import {
  updatePostApi,
  setUpdatePostError,
  resetStates,
} from "../store/postSlice";
import { motion, AnimatePresence } from "framer-motion";
import UserPost from "../components/UserPost";
import { mediaService } from "@/services/mediaService";

const EditPage = () => {
  const location = useLocation();
  const post = location.state;
  const { userId } = useParams();

  const dispatch = useDispatch();

  // Initialize state with existing post data
  const [content, setContent] = useState(post.post.description);
  const [title, setTitle] = useState(post.post.title);
  const [url, setUrl] = useState(post.post.url || "");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);

  const navigate = useNavigate();

  // Enhanced media preview state
  const [mediaPreview, setMediaPreview] = useState(null);
  const [originalMedia, setOriginalMedia] = useState(
    post.post.image || post.post.video || null
  );

  console.log(post);

  // Media input refs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Selectors
  const { updatePostLoading, updatePostError, updatePostSuccess } = useSelector(
    (state) => state.post
  );
  const token = useSelector((state) => state.auth.token);

  // Handle media file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Reset both input refs to clear any previous selections
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";

      const reader = new FileReader();
      console.log("File:", file);
      reader.onloadend = () => {
        const newMediaPreview = {
          type: file.type.startsWith("/image") ? "image" : "video",
          src: reader.result,
          file: file, // Store the actual file for upload
        };
        // Completely reset any previous media
        setMediaPreview(newMediaPreview);
        setOriginalMedia(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Media selection handlers
  const handleImageClick = () => imageInputRef.current.click();
  const handleVideoClick = () => videoInputRef.current.click();

  // Remove media preview
  const handleRemoveMedia = () => {
    setMediaPreview(null);
    setOriginalMedia(null);
    // Reset file input
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  // Save post with media handling
  const handleSaveButtonClick = async () => {
    if (isSubmitEnabled) {
      try {
        setIsUploadLoading(true);
        const cleanContent = content.replace(/<p>/g, "").replace(/<\/p>/g, "");

        const postUpdateData = {
          title,
          description: cleanContent,
          url,
        };

        let mediaUrl = originalMedia;
        let mediaId = post?.post.mediaId;

        if (mediaPreview && mediaPreview.file) {
          const uploadResponse = await mediaService.updateMedia(
            mediaId,
            mediaPreview.file, // Pass the actual file object
            mediaPreview.file.type.startsWith("image/") ? "image" : "video",
            post?.post._id
          );

          // Update media URL if upload is successful
          if (uploadResponse.status === "success") {
            mediaUrl = uploadResponse.data.url;
            dispatch(
              updatePostApi(post?.post._id, token, {
                title: title,
                description: cleanContent,
                url: url,
              })
            );
          }
        }

        setShowSuccessNotification(true);
        // Prepare final form data for post update
      } catch (error) {
        console.error("Post update error:", error);
        dispatch(setUpdatePostError(error.message));
        setIsUploadLoading(false);
      }
    }
  };

  useEffect(() => {
    if (updatePostSuccess) {
      // Show success notification
      setShowSuccessNotification(true);

      // Set timeout to redirect and reset success state
      const redirectTimer = setTimeout(() => {
        // Redirect to user's profile or previous page
        navigate(`/user/${userId}`);

        // Reset the success state to prevent multiple redirects
        dispatch(resetStates());
      }, 2000);

      // Cleanup the timer if component unmounts
      return () => clearTimeout(redirectTimer);
    }
  }, [updatePostSuccess, navigate, userId, dispatch]);

  // Submission validation
  const isSubmitEnabled = useMemo(() => {
    return title.trim().length > 1 && content.trim().length > 1;
  }, [title, content]);

  // Media preview rendering

  const renderMediaPreview = () => {
    const mediaToShow = mediaPreview || originalMedia;

    if (!mediaToShow) return null;

    console.log(mediaPreview);
    console.log(originalMedia);

    // Determine media type
    const mediaType = mediaPreview
      ? mediaPreview.file
        ? mediaPreview.file.type.startsWith("image/")
          ? "image"
          : "video"
        : mediaPreview.type
      : typeof originalMedia === "string" &&
        (originalMedia.includes(".mp4") || originalMedia.includes(".mov"))
      ? "video"
      : "image";

    console.log(mediaToShow);
    console.log(mediaType);

    // Determine media source
    const mediaSrc = mediaPreview
      ? mediaPreview.src
      : typeof originalMedia === "string"
      ? originalMedia
      : originalMedia.src;

    return (
      <div className="relative mt-4 mb-4">
        {mediaType === "image" ? (
          <img
            src={mediaSrc}
            alt="Preview"
            className="max-w-full h-auto rounded-lg shadow-md"
          />
        ) : (
          <video
            src={mediaSrc}
            controls
            className="max-w-full h-auto rounded-lg shadow-md"
          />
        )}
        <button
          onClick={handleRemoveMedia}
          className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow-md hover:bg-white transition"
        >
          <X size={16} className="text-red-500" />
        </button>
      </div>
    );
  };
  return (
    <>
      <AnimatePresence>
        {updatePostError && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-4 rounded-md shadow-lg z-50"
          >
            Unable to update the post
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccessNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-4 rounded-md shadow-lg z-50 flex items-center"
          >
            <CheckCircle className="mr-2" />
            Post Updated Successfully
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-16 bg-gray-100 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="w-full mb-4 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Link to={`..`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full p-2 hover:bg-gray-200 transition-colors duration-200"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              </Link>
              <img
                src="/api/placeholder/32/32"
                alt="User Avatar"
                className="w-10 h-10 rounded-full"
              />
              <Link to={`..`} className="hover:underline">
                <span className="font-semibold text-lg">{post.name}</span>
              </Link>
              <span className="text-gray-500 text-sm">
                • {new Date(post.post.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/*  */}

            <input
              type="text"
              value={title}
              className="w-full text-2xl font-bold mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
            />

            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              className="mb-4"
              style={{ height: "200px", marginBottom: "50px" }}
            />

            {/* URL input */}
            <div className="flex items-center mb-4">
              <LinkIcon size={20} className="mr-2 text-gray-500" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-grow p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter URL..."
              />
            </div>

            {/* Media Preview */}
            {renderMediaPreview()}

            {/* Media upload buttons */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleFileChange}
                  accept="video/*"
                  className="hidden"
                />
                <Button variant="outline" size="sm" onClick={handleImageClick}>
                  <Image size={16} className="mr-2" /> Image
                </Button>
                <Button variant="outline" size="sm" onClick={handleVideoClick}>
                  <Play size={16} className="mr-2" /> Video
                </Button>
                <Button variant="outline" size="sm">
                  <FileText size={16} className="mr-2" /> File
                </Button>
              </div>
              {/* Submit buttons */}
              <div className="flex space-x-2">
                <Link to={".."}>
                  <Button variant="ghost" size="sm">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className={`flex items-center ${
                    isSubmitEnabled
                      ? "bg-blue-800 text-white hover:bg-blue-900"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!isSubmitEnabled || isUploadLoading}
                  onClick={handleSaveButtonClick}
                >
                  {isUploadLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {updatePostSuccess && (
          <UserPost
            post={post.post}
            name={post.name}
            id={userId}
            className={"ml-72"}
          />
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={videoInputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
      />
    </>
  );
};

export default EditPage;
