import { memo, useState, useRef, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../components/UI/Avatar";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../components/UI/CardComp";
import { Button } from "../components/UI/Button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/UI/Alerts";
import {
  ArrowBigUp,
  MessageSquare,
  Share2,
  Award,
  MoreHorizontal,
  Edit,
  Delete,
  Bookmark,
  BookmarkCheck,
  Flag,
  ImageIcon,
  Play,
  Pause,
  VolumeX,
  Volume2,
  Minimize2,
  Maximize2,
  X,
} from "lucide-react";
import {
  deletePostApi,
  setSuccess,
  setError,
  unsavedPostApi,
  savePostApi,
  upvoteContentApi,
} from "../store/postSlice";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Dialog, DialogContent } from "../components/UI/dialog";
import { formatDistanceToNow } from "date-fns";
import CommentModal from "./CommentModel";
import { getComments, getUserVotes } from "@/store/commentSlice";
import { mediaService } from "@/services/mediaService";
import ShareDialog from "./ShareDialog";

const UserPost = memo(
  ({ post, id, name, className, onUpvote, currentUser }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(true);
    const [videoProgress, setVideoProgress] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const videoRef = useRef(null);
    const videoModalRef = useRef(null);
    const progressRef = useRef(null);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const dispatch = useDispatch();

    const { user, isAuthenticated, token } = useSelector((state) => state.auth);
    const { loading, upvotedContent, bookMarkedPost } = useSelector(
      (state) => state.post
    );

    const sameUserPost = id === user?._id;
    const isUpvoted = upvotedContent?.includes(post._id);
    const isBookmarked = bookMarkedPost?.some(
      (bookmark) => bookmark?._id === post._id
    );
    console.log(bookMarkedPost);

    const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
      addSuffix: true,
    });
    console.log(selectedPost);
    const handleThreeDotClick = useCallback((e) => {
      e.stopPropagation();
      setShowDropdown((prev) => !prev);
    }, []);

    const { isError, postDeleteSuccess } = useSelector((state) => state.post);

    const handleDropdownOptionClick = useCallback(
      (option, post) => {
        switch (option) {
          case "delete":
            setShowDeleteConfirmation(true);
            break;
          case "edit":
            // eslint-disable-next-line no-case-declarations
            const editPath = `${location.pathname}/edit`;
            navigate(editPath, { state: { post, name } });
            break;
          case "save":
            dispatch(savePostApi(post._id));
            break;
          case "unsave":
            dispatch(unsavedPostApi(post._id));
            break;
        }
        setShowDropdown(false);
      },
      [navigate, location, name, dispatch]
    );

    const handleUpvote = (e) => {
      e.preventDefault();
      if (currentUser) onUpvote(post._id);
    };

    const handleDeleteConfirm = useCallback(async () => {
      try {
        const result = await mediaService.deleteMedia(post.mediaId);

        // For 204 No Content responses, you might need to adjust the condition
        if (result.success || result.status === "success") {
          dispatch(deletePostApi(post._id, token));
          setShowDeleteConfirmation(false);

          setTimeout(() => {
            dispatch(setSuccess(false));
          }, 2000);
        } else {
          dispatch(deletePostApi(post._id, token));
          setShowDeleteConfirmation(false);
        }
      } catch (error) {
        console.error("Delete media failed:", error);
        // Optionally handle error (show toast, etc.)
      }
    }, [dispatch, post.mediaId, post._id, token]);

    const openComments = (post) => {
      setSelectedPost(post);
      if (user?._id) {
        dispatch(getUserVotes(user._id));
        dispatch(getComments(post._id));
      }
    };

    // Video-related functions (keep existing implementations)
    const handleVideoProgress = () => {
      if (videoRef.current) {
        const progressPercent =
          (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setVideoProgress(progressPercent);
      }
    };

    const handleProgressBarClick = (e) => {
      if (progressRef.current && videoRef.current) {
        const progressBar = progressRef.current;
        const clickPosition = e.nativeEvent.offsetX;
        const progressBarWidth = progressBar.offsetWidth;
        const clickPercentage = (clickPosition / progressBarWidth) * 100;
        const newTime = (clickPercentage / 100) * videoRef.current.duration;

        videoRef.current.currentTime = newTime;
        setVideoProgress(clickPercentage);
      }
    };

    const toggleVideoPlayback = () => {
      if (videoRef.current) {
        if (isVideoPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        setIsVideoPlaying(!isVideoPlaying);
      }
    };

    const toggleVideoMute = () => {
      if (videoRef.current) {
        videoRef.current.muted = !isVideoMuted;
        setIsVideoMuted(!isVideoMuted);
      }
    };

    const toggleFullScreen = () => {
      if (!document.fullscreenElement) {
        if (videoModalRef.current?.requestFullscreen) {
          videoModalRef.current.requestFullscreen();
          setIsFullScreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          setIsFullScreen(false);
        }
      }
    };

    // Dropdown outside click handler
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target) &&
          !buttonRef.current.contains(event.target)
        ) {
          setShowDropdown(false);
        }
      };

      if (showDropdown) {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
          document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [showDropdown]);

    // Success/Error message timer
    useEffect(() => {
      let timer;
      if (isError) {
        timer = setTimeout(() => {
          dispatch(setError(false));
        }, 3000);
      }
      return () => {
        if (timer) clearTimeout(timer);
      };
    }, [isError, dispatch]);

    return (
      <>
        <AnimatePresence>
          {isError && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-4 left-1/2 transform -translate-x-1/2
             bg-red-500 
           text-white p-4 rounded-md shadow-lg z-50 `}
            >
              Unable to delete the post
            </motion.div>
          )}
          {postDeleteSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-4 left-1/2 transform -translate-x-1/2
             bg-green-500 
           text-white p-4 rounded-md shadow-lg z-50 `}
            >
              Post deleted successfully
            </motion.div>
          )}
        </AnimatePresence>

        <Card className={`w-full max-w-2xl bg-white mb-4 ${className}`}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8 ring-2 ring-gray-100">
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32"
                    alt={`${name}'s avatar`}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <Link to={isAuthenticated ? `/user/${id}` : "/"}>
                    <span className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {name}
                    </span>
                  </Link>
                  <div className="flex items-center text-sm text-gray-500 space-x-2">
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                      Suggested
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleThreeDotClick}
                  ref={buttonRef}
                  className="hover:bg-gray-100 rounded-full"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
                {showDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-10 overflow-hidden"
                  >
                    <div className="py-1" role="menu">
                      {!sameUserPost ? (
                        <>
                          <button
                            onClick={() =>
                              handleDropdownOptionClick(
                                isBookmarked ? "unsave" : "save",
                                post
                              )
                            }
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            disabled={loading}
                          >
                            {isBookmarked ? (
                              <BookmarkCheck className="w-4 h-4 mr-2 text-green-500" />
                            ) : (
                              <Bookmark className="w-4 h-4 mr-2" />
                            )}
                            {loading
                              ? "Saving..."
                              : isBookmarked
                              ? "Saved"
                              : "Save"}
                          </button>
                          <button
                            onClick={() =>
                              handleDropdownOptionClick("report", post)
                            }
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Flag className="w-4 h-4 mr-2 text-red-500" />
                            Report
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              handleDropdownOptionClick("edit", post)
                            }
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="w-4 h-4 mr-2 text-blue-500" />
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDropdownOptionClick("delete", post)
                            }
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                          >
                            <Delete className="w-4 h-4 mr-2" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <CardTitle className="text-xl font-bold mb-3 text-gray-900">
              {post.title}
            </CardTitle>
            <CardDescription className="text-base text-gray-700 leading-relaxed">
              {post.description}
            </CardDescription>

            {/* Image Display */}
            {post.image && (
              <div className="mt-4 w-full h-[400px] overflow-hidden rounded-lg relative group">
                <img
                  src={post.image}
                  alt="Post attachment"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onClick={() => setImageModalOpen(true)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    className="bg-white/70 hover:bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setImageModalOpen(true)}
                  >
                    <ImageIcon className="h-6 w-6 text-gray-700" />
                  </Button>
                </div>
              </div>
            )}

            {/* Video Display */}
            {post.video && (
              <div className="mt-4 w-full h-[400px] relative group">
                <video
                  ref={videoRef}
                  src={post.video}
                  className="w-full h-full object-cover rounded-lg"
                  muted
                  onTimeUpdate={handleVideoProgress}
                  onEnded={() => setIsVideoPlaying(false)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    className="bg-white/70 hover:bg-white/90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setVideoModalOpen(true)}
                  >
                    <Play className="h-8 w-8 text-gray-700" />
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                  <div
                    ref={progressRef}
                    className="h-full bg-blue-500 cursor-pointer"
                    style={{ width: `${videoProgress}%` }}
                    onClick={handleProgressBarClick}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 mt-4">
              <Button
                variant="ghost"
                className={`hover:bg-gray-100 rounded-full transition-colors ${
                  isUpvoted ? "bg-red-50" : ""
                }`}
                onClick={handleUpvote}
                disabled={!isAuthenticated}
              >
                <div className="flex items-center space-x-2">
                  <ArrowBigUp
                    className={`h-7 w-7 transition-colors ${
                      isUpvoted
                        ? "text-red-500"
                        : "text-gray-500 group-hover:text-red-500"
                    }`}
                  />
                  <span
                    className={`font-bold ${
                      isUpvoted ? "text-red-500" : "text-gray-700"
                    }`}
                  >
                    {post.upVote}
                  </span>
                </div>
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-gray-100 rounded-full space-x-2"
                onClick={() => openComments(post)}
              >
                <MessageSquare className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{post.commentCount}</span>
              </Button>

              <Button
                variant="ghost"
                className="hover:bg-gray-100 rounded-full space-x-2"
                onClick={() => setShareModalOpen(true)}
              >
                <Share2 className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Share</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Image Modal */}
        {imageModalOpen && post.image && (
          <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
            <DialogContent className="p-0 sm:max-w-[80vw] sm:max-h-[80vh] w-full h-full flex items-center justify-center">
              <div className="max-w-full max-h-full flex items-center justify-center">
                <img
                  src={post.image}
                  alt="Full size post image"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <Button
                variant="ghost"
                className="absolute top-2 right-2 bg-white/70 hover:bg-white/90 rounded-full p-2"
                onClick={() => setImageModalOpen(false)}
              >
                <X className="h-6 w-6 text-gray-700" />
              </Button>
            </DialogContent>
          </Dialog>
        )}

        {/* Video Modal */}
        {videoModalOpen && post.video && (
          <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
            <DialogContent
              ref={videoModalRef}
              className="p-0 sm:max-w-[80vw] sm:max-h-[80vh] w-full h-full flex flex-col"
            >
              <div className="relative w-full flex-grow flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={post.video}
                  className="max-w-full max-h-full object-contain"
                  autoPlay
                  onTimeUpdate={handleVideoProgress}
                  onEnded={() => setIsVideoPlaying(false)}
                />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                  <div
                    ref={progressRef}
                    className="h-full bg-blue-500 cursor-pointer"
                    style={{ width: `${videoProgress}%` }}
                    onClick={handleProgressBarClick}
                  />
                </div>
                <div className="absolute top-2 right-2 flex space-x-2">
                  <Button
                    variant="ghost"
                    className="bg-white/70 hover:bg-white/90 rounded-full p-2"
                    onClick={toggleFullScreen}
                  >
                    {isFullScreen ? (
                      <Minimize2 className="h-5 w-5" />
                    ) : (
                      <Maximize2 className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    className="bg-white/70 hover:bg-white/90 rounded-full p-2"
                    onClick={() => setVideoModalOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                <Button
                  variant="ghost"
                  className="bg-white/70 hover:bg-white/90 rounded-full p-2"
                  onClick={toggleVideoPlayback}
                >
                  {isVideoPlaying ? (
                    <Pause className="h-6 w-6 text-gray-700" />
                  ) : (
                    <Play className="h-6 w-6 text-gray-700" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="bg-white/70 hover:bg-white/90 rounded-full p-2"
                  onClick={toggleVideoMute}
                >
                  {isVideoMuted ? (
                    <VolumeX className="h-6 w-6 text-gray-700" />
                  ) : (
                    <Volume2 className="h-6 w-6 text-gray-700" />
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={showDeleteConfirmation}
          onOpenChange={setShowDeleteConfirmation}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete this post?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                post.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ShareDialog
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          url={`${window.location.origin}/content/${post._id}`}
          message="Share this post"
        />

        {/* Comment Modal */}
        <CommentModal
          postId={selectedPost?._id}
          isOpen={selectedPost !== null}
          onClose={() => setSelectedPost(null)}
          userName={name}
          onUpvote={onUpvote}
        />
      </>
    );
  }
);

UserPost.displayName = "UserPost";

export default UserPost;
