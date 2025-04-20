import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "./UI/Button";
import { Avatar, AvatarImage, AvatarFallback } from "./UI/Avatar";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Heart,
  MessageCircle,
  X,
  Trash2,
  Loader2,
  Send,
  ImageIcon,
  VolumeX,
  Volume2,
  Pause,
  Play,
  Award,
  Share2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import {
  createComment,
  upvoteReply,
  resetStatus,
  getUserVotes,
  getComments,
} from "@/store/commentSlice";
import { deleteComment } from "@/store/commentSlice";
import { replyToComment } from "@/store/commentSlice";
import { deleteReply } from "@/store/commentSlice";
import { upvoteComment } from "@/store/commentSlice";
import { Alert, AlertDescription } from "./UI/Alerts";
import { Link } from "react-router-dom";
import ShareDialog from "./ShareDialog";

const CommentModal = ({ isOpen, onClose, userName, postId, id, onUpvote }) => {
  const dispatch = useDispatch();
  const [newComment, setNewComment] = useState("");
  const [replyStates, setReplyStates] = useState({});
  const [replyTexts, setReplyTexts] = useState({});
  const {
    comments,
    loading,
    isError,
    success,
    errorMessage,
    successMessage,
    commentVotes,
    replyVotes,
    upvoteLoading,
  } = useSelector((state) => state.comments);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const videoRef = useRef(null);
  const progressRef = useRef(null);

  const { savingError, upvotedContent, posts, recentPost } = useSelector(
    (state) => state.post
  );

  const { user } = useSelector((state) => state.auth);

  // const post = posts.find((p) => p._id === postId);
  const post =
    posts.find((p) => p._id === postId) ||
    recentPost.find((p) => p._id === postId);

  const sameUserPost = post?.user?._id === user?._id;
  const isUpvoted = upvotedContent?.includes(post?._id);

  useEffect(() => {
    return () => {
      dispatch(resetStatus());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!isOpen) {
      dispatch(resetStatus());
    }
  }, [isOpen, dispatch]);

  const handleShowReplyInput = (commentId) => {
    // Prevent reply input for deleted comments
    const comment = comments.find((c) => c.id === commentId);
    if (comment && !comment.isDeleted) {
      setReplyStates((prev) => ({
        ...prev,
        [commentId]: !prev[commentId],
      }));
    }
  };

  useEffect(() => {
    if (isError || success) {
      const timer = setTimeout(() => {
        dispatch(resetStatus());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isError, success, dispatch]);

  const handleAddReply = (e, commentId) => {
    e.preventDefault();

    // Prevent replying to deleted comments
    const comment = comments.find((c) => c.id === commentId);
    if (comment && comment.isDeleted) return;

    const replyText = replyTexts[commentId];

    if (!replyText?.trim()) return;

    dispatch(replyToComment(commentId, replyText));

    setReplyTexts((prev) => ({
      ...prev,
      [commentId]: "",
    }));
    setReplyStates((prev) => ({
      ...prev,
      [commentId]: false,
    }));
  };

  const handleReplyTextChange = (commentId, text) => {
    setReplyTexts((prev) => ({
      ...prev,
      [commentId]: text,
    }));
  };

  const handlePostComment = (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    dispatch(createComment(post._id, newComment.trim()));

    setNewComment("");
  };

  const handleDeleteComment = (commentId) => {
    // Dispatch delete comment action
    dispatch(deleteComment(commentId, post._id));
  };

  const handleDeleteReply = (commentId, replyId) => {
    dispatch(deleteReply(commentId, replyId, post._id));
  };

  const handleUpvoteComment = (commentId) => {
    const comment = comments.find((c) => c._id === commentId);
    if (comment && !comment.isDeleted) {
      dispatch(upvoteComment(commentId));
    }
  };

  const handleUpvoteReply = (commentId, replyId) => {
    dispatch(upvoteReply(commentId, replyId));
  };

  const hasUserUpvotedComment = (commentId) => {
    return (
      commentVotes?.some(
        (vote) =>
          vote.commentId === commentId &&
          vote.userId === user?._id &&
          vote.voteType === "upvote"
      ) || false
    );
  };

  // Function to check if user has upvoted a reply
  const hasUserUpvotedReply = (replyId) => {
    return (
      replyVotes?.some(
        (vote) =>
          vote.replyId === replyId &&
          vote.userId === user?._id &&
          vote.voteType === "upvote"
      ) || false
    );
  };

  const isCommentOwner = (comment) => {
    if (!user || !comment) return false;

    const commentUserId = comment.userId?._id || comment.userId;
    const currentUserId = user._id;

    return commentUserId === currentUserId;
  };

  const isReplyOwner = (reply) => {
    if (!user || !reply) return false;

    const replyUserId = reply.userId?._id || reply.userId;
    const currentUserId = user._id;

    return replyUserId === currentUserId;
  };

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

  const handleUpvote = (e) => {
    e.preventDefault();
    if (user) onUpvote(post._id);
  };

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-6xl z-50 bg-transparent border-none shadow-none p-0 gap-0 outline-none">
          {(isError || success) && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-96">
              {/* {isError && (
                <Alert variant="destructive" className="mb-2">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )} */}
              {success && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
          <div className="relative flex flex-col md:flex-row h-[85vh] md:h-[80vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-all duration-200 transform hover:scale-105"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {/* Media Section */}
            <div className="w-full md:w-3/5 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative">
              {post.video ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    src={post.video}
                    className="w-full h-full object-contain"
                    muted={isVideoMuted}
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
                </div>
              ) : post.image ? (
                <div className="relative w-full h-full group">
                  <img
                    src={post.image}
                    alt="Post content"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <Button
                      variant="ghost"
                      className="bg-white/70 hover:bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ImageIcon className="h-6 w-6 text-gray-700" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src="/api/placeholder/400/400"
                    alt="Placeholder"
                    className="opacity-30"
                  />
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="w-full md:w-2/5 flex flex-col bg-white">
              {/* Header */}
              <header className="border-b p-5 flex items-center sticky top-0 bg-white/95 backdrop-blur-md z-10 shadow-sm">
                <Avatar className="w-12 h-12 mr-4 ring-2 ring-blue-100 transition-transform duration-200 hover:scale-105">
                  <AvatarImage
                    src={post.user?.profilePicture || "/api/placeholder/40/40"}
                    alt={userName}
                  />

                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    {userName?.[0]?.toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <Link to={`/user/${id}`}>
                    <span className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors duration-200">
                      {userName}
                    </span>
                  </Link>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <div className="mt-3 mb-1">
                    <p className="text-gray-800 text-sm leading-relaxed break-words">
                      {post.description || "No description provided"}
                    </p>
                  </div>
                </div>
              </header>

              {/* Content and Comments */}
              <div className="flex-grow overflow-y-auto custom-scrollbar">
                {/* Comments List */}
                <div className="p-5 space-y-6">
                  {comments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-40" />
                      <p className="text-sm font-medium">
                        Start the conversation!
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Be the first to share your thoughts
                      </p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="group relative transform transition-all duration-200 hover:translate-x-1"
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-9 h-9 ring-2 ring-blue-50">
                            <AvatarImage
                              src={
                                comment.userId?.profilePicture ||
                                "/api/placeholder/40/40"
                              }
                              alt={"userPicture"}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                              {comment.userId?.name?.[0]?.toUpperCase() || "A"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-2xl px-4 py-3 shadow-sm relative group">
                              <p className="mb-1 pr-8">
                                <Link to={`/user/${comment.userId._id}`}>
                                  <span className="font-bold text-gray-900 mr-2 hover:text-blue-600 cursor-pointer transition-colors">
                                    {comment.userId?.name}
                                  </span>
                                </Link>
                                <span className="text-gray-800">
                                  {comment.comment}
                                </span>
                              </p>
                              {!comment.isDeleted &&
                                isCommentOwner(comment) && (
                                  <button
                                    onClick={() =>
                                      handleDeleteComment(comment._id)
                                    }
                                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 hover:bg-red-50 rounded-full"
                                    title="Delete comment"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </button>
                                )}
                            </div>
                            {!comment.isDeleted && (
                              <div className="flex items-center space-x-4 text-xs mt-2 text-gray-500 pl-4">
                                <span>
                                  {formatDistanceToNow(
                                    new Date(comment.createdAt),
                                    { addSuffix: true }
                                  )}
                                </span>
                                <button
                                  onClick={() =>
                                    handleUpvoteComment(comment._id)
                                  }
                                  className="flex items-center space-x-1 group transition-all duration-200 hover:scale-105"
                                >
                                  <Heart
                                    className={`h-4 w-4 ${
                                      hasUserUpvotedComment(comment._id)
                                        ? "fill-red-500 text-red-500"
                                        : "text-gray-400 group-hover:text-red-500"
                                    } transition-colors`}
                                  />
                                  <span
                                    className={`${
                                      hasUserUpvotedComment(comment._id)
                                        ? "text-red-500"
                                        : "text-gray-500"
                                    } group-hover:text-red-500`}
                                  >
                                    {comment.upVote || 0}
                                  </span>
                                </button>
                                <button
                                  className="font-semibold hover:text-blue-600 transition-colors duration-200"
                                  onClick={() =>
                                    handleShowReplyInput(comment.id)
                                  }
                                >
                                  Reply
                                </button>
                              </div>
                            )}

                            {/* Reply Input */}
                            {replyStates[comment.id] && !comment.isDeleted && (
                              <form
                                onSubmit={(e) => handleAddReply(e, comment.id)}
                                className="mt-3 pl-4"
                              >
                                <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 shadow-sm">
                                  <input
                                    type="text"
                                    value={replyTexts[comment.id] || ""}
                                    onChange={(e) =>
                                      handleReplyTextChange(
                                        comment.id,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Write a reply..."
                                    className="flex-grow bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
                                  />
                                  <Button
                                    type="submit"
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2 text-blue-500 font-semibold hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                  >
                                    Post
                                  </Button>
                                </div>
                              </form>
                            )}

                            {/* Replies */}
                            {Array.isArray(comment.replies) &&
                              comment.replies.length > 0 && (
                                <div className="mt-3 space-y-3">
                                  {comment.replies.map((reply) => (
                                    <div
                                      key={reply._id}
                                      className="ml-8 flex items-start space-x-3 group/reply transform transition-all duration-200 hover:translate-x-1"
                                    >
                                      <Avatar className="w-6 h-6 ring-1 ring-blue-100">
                                        <AvatarImage
                                          src={
                                            reply.userId?.profilePicture ||
                                            "/api/placeholder/40/40"
                                          }
                                          alt={"userPicture"}
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xs">
                                          {reply.userId?.name?.[0]?.toUpperCase() ||
                                            "A"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <div className="bg-gray-50 rounded-2xl px-3 py-2 shadow-sm relative group">
                                          <p className="mb-1 pr-8">
                                            <Link
                                              to={`/user/${reply.userId._id}`}
                                            >
                                              <span className="font-bold text-gray-900 mr-2 text-sm hover:text-blue-600 transition-colors duration-200">
                                                {reply.userId?.name}
                                              </span>
                                            </Link>
                                            <span className="text-gray-800 text-sm">
                                              {reply.reply}
                                            </span>
                                          </p>
                                          {isReplyOwner(reply) && (
                                            <button
                                              onClick={() =>
                                                handleDeleteReply(
                                                  comment._id,
                                                  reply._id
                                                )
                                              }
                                              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 hover:bg-red-50 rounded-full"
                                              title="Delete reply"
                                            >
                                              <Trash2 className="h-3 w-3 text-red-500" />
                                            </button>
                                          )}
                                        </div>
                                        <div className="flex items-center space-x-4 text-xs mt-1 text-gray-500 pl-3">
                                          <span>
                                            {formatDistanceToNow(
                                              new Date(reply.createdAt),
                                              {
                                                addSuffix: true,
                                              }
                                            )}
                                          </span>
                                          <button
                                            onClick={() =>
                                              handleUpvoteReply(
                                                comment._id,
                                                reply._id
                                              )
                                            }
                                            className="flex items-center space-x-1 group transition-all duration-200 hover:scale-105"
                                          >
                                            <Heart
                                              className={`h-3 w-3 ${
                                                hasUserUpvotedReply(reply._id)
                                                  ? "fill-red-500 text-red-500"
                                                  : "text-gray-400 group-hover:text-red-500"
                                              } transition-colors`}
                                            />
                                            <span
                                              className={`${
                                                hasUserUpvotedReply(reply._id)
                                                  ? "text-red-500"
                                                  : "text-gray-500"
                                              } group-hover:text-red-500`}
                                            >
                                              {reply.upVoteReply || 0}
                                            </span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Interaction Bar */}
              <div className="border-b p-4">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    className={`hover:bg-gray-100 rounded-full transition-colors ${
                      isUpvoted ? "bg-red-50" : ""
                    }`}
                    onClick={handleUpvote}
                    disabled={!user}
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
                        {post.upVote || 0}
                      </span>
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    className="hover:bg-gray-100 rounded-full space-x-2"
                  >
                    <MessageSquare className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">{comments?.length || 0}</span>
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
              </div>

              {/* Comment Input */}
              <div className="border-t p-4 bg-white">
                <form
                  onSubmit={handlePostComment}
                  className="flex items-center space-x-2"
                >
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Share your thoughts..."
                      value={newComment}
                      className="w-full bg-gray-50 rounded-full px-4 py-3 pr-12 border border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-all duration-200"
                      disabled={loading || !newComment.trim()}
                    >
                      Post
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
      <ShareDialog
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        url={`${window.location.origin}/content/${post._id}`}
        message="Share this post"
      />
    </Dialog>
  );
};

export default CommentModal;
