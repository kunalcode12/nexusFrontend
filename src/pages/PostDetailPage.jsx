import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/UI/Button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/UI/Avatar";
import {
  ArrowBigUp,
  MessageSquare,
  Heart,
  Trash2,
  VolumeX,
  Volume2,
  Pause,
  Play,
  Share2,
  MoreVertical,
  Bookmark,
  Flag,
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
import { Alert, AlertDescription } from "@/components/UI/Alerts";
import { Link, useParams } from "react-router-dom";
import { getcontent, upvoteContentApi } from "@/store/postSlice";
import ShareDialog from "@/components/ShareDialog";

const PostPage = () => {
  const { contentId } = useParams();
  const dispatch = useDispatch();
  const [newComment, setNewComment] = useState("");
  const [replyStates, setReplyStates] = useState({});
  const [replyTexts, setReplyTexts] = useState({});
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const videoRef = useRef(null);
  const progressRef = useRef(null);

  const {
    comments,
    loading,
    isError,
    success,
    commentVotes,
    replyVotes,
    successMessage,
  } = useSelector((state) => state.comments);

  const { user } = useSelector((state) => state.auth);
  const { onePost, upvotedContent } = useSelector((state) => state.post);

  const post = onePost;
  const isUpvoted = upvotedContent?.includes(contentId);

  useEffect(() => {
    if (!contentId) return;
    dispatch(getcontent(contentId));
    dispatch(getUserVotes(user?._id));
    dispatch(getComments(contentId));
    return () => dispatch(resetStatus());
  }, [contentId]);

  useEffect(() => {
    if (isError || success) {
      const timer = setTimeout(() => {
        dispatch(resetStatus());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isError, success, dispatch]);

  const handleSave = () => {
    // Function stub for save action
    setShowMenu(false);
  };

  const handleReport = () => {
    // Function stub for report action
    setShowMenu(false);
  };

  const handleShowReplyInput = (commentId) => {
    const comment = comments.find((c) => c.id === commentId);
    if (comment && !comment.isDeleted) {
      setReplyStates((prev) => ({
        ...prev,
        [commentId]: !prev[commentId],
      }));
    }
  };

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

  const hasUserUpvotedComment = (commentId) => {
    return commentVotes?.some(
      (vote) =>
        vote.commentId === commentId &&
        vote.userId === user?._id &&
        vote.voteType === "upvote"
    );
  };

  const hasUserUpvotedReply = (replyId) => {
    return replyVotes?.some(
      (vote) =>
        vote.replyId === replyId &&
        vote.userId === user?._id &&
        vote.voteType === "upvote"
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

  const handleUpvote = () => {
    try {
      dispatch(upvoteContentApi(post._id));
    } catch (error) {
      console.error("Upvote failed:", error);
    }
  };
  console.log(comments);

  if (!post) return null;

  return (
    <div className="max-w-4xl ml-56 mt-8 mr-2 py-8  sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      {(isError || success) && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-96">
          {success && (
            <Alert className="bg-green-50 border-green-200 text-green-800 shadow-lg animate-fade-in">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Post Header */}
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden mb-4">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="w-12 h-12 ring-2 ring-blue-100 transform hover:scale-105 transition-all duration-300">
                <AvatarImage
                  src={post.user?.profilePicture || "/api/placeholder/40/40"}
                  alt={post?.user.name}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  {post?.user.name?.[0]?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Link to={`/user/${post.user._id}`}>
                  <span className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-all duration-200">
                    {post?.user.name}
                  </span>
                </Link>
                <span className="text-sm text-gray-500 ml-2">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                <p className="mt-3 text-gray-800 text-lg leading-relaxed break-words">
                  {post.description || "No description provided"}
                </p>
              </div>
            </div>

            {/* Three dots menu - Fixed positioning */}
            <div className="relative">
              <Button
                variant="ghost"
                className="rounded-full p-2 hover:bg-gray-100 transition-all duration-200"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </Button>

              {showMenu && (
                <div className="absolute right-0 top-0 mt-10 w-48 bg-white rounded-xl shadow-xl py-1 z-50 border border-gray-100 transform transition-all duration-200 animate-fade-in">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 w-full text-left transition-colors duration-200"
                  >
                    <Bookmark className="h-4 w-4" />
                    <span>Save Post</span>
                  </button>
                  <button
                    onClick={handleReport}
                    className="flex items-center space-x-2 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 w-full text-left transition-colors duration-200"
                  >
                    <Flag className="h-4 w-4" />
                    <span>Report Post</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Media Content */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative">
          {post.video ? (
            <div className="relative w-full">
              <video
                ref={videoRef}
                src={post.video}
                className="w-full object-contain max-h-[600px]"
                muted={isVideoMuted}
                onTimeUpdate={handleVideoProgress}
                onEnded={() => setIsVideoPlaying(false)}
              />
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-300/30 backdrop-blur">
                <div
                  ref={progressRef}
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 cursor-pointer"
                  style={{ width: `${videoProgress}%` }}
                  onClick={handleProgressBarClick}
                />
              </div>
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-6">
                <Button
                  variant="ghost"
                  className="bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-lg"
                  onClick={toggleVideoPlayback}
                >
                  {isVideoPlaying ? (
                    <Pause className="h-6 w-6 text-gray-800" />
                  ) : (
                    <Play className="h-6 w-6 text-gray-800" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-3 transition-all duration-300 hover:scale-110 shadow-lg"
                  onClick={toggleVideoMute}
                >
                  {isVideoMuted ? (
                    <VolumeX className="h-6 w-6 text-gray-800" />
                  ) : (
                    <Volume2 className="h-6 w-6 text-gray-800" />
                  )}
                </Button>
              </div>
            </div>
          ) : post.image ? (
            <img
              src={post.image}
              alt="Post content"
              className="w-full max-h-[600px] object-contain"
            />
          ) : null}
        </div>

        {/* Interaction Bar */}
        <div className="bg-white p-4 border-t border-gray-100 flex items-center space-x-6">
          <Button
            variant="ghost"
            className={`hover:bg-gray-100 rounded-full transition-all duration-300 ${
              isUpvoted ? "bg-red-50" : ""
            } hover:scale-105 px-4`}
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
            className="hover:bg-gray-100 rounded-full space-x-2 transition-all duration-300 hover:scale-105 px-4"
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

        {/* Comment Input */}
        <div className="bg-white p-6 border-t border-gray-100">
          <form
            onSubmit={handlePostComment}
            className="flex items-center space-x-2"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Share your thoughts..."
                value={newComment}
                className="w-full bg-gray-50 rounded-full px-6 py-3 pr-24 border border-gray-200 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-300 placeholder-gray-400"
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition-all duration-300 rounded-full px-4"
                disabled={loading || !newComment.trim()}
              >
                Post
              </Button>
            </div>
          </form>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-b-xl">
          <div className="p-6 space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium">
                  Start the conversation!
                </p>
                <p className="text-gray-400 mt-1 text-sm">
                  Be the first to share your thoughts
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="group relative transform transition-all duration-300 hover:translate-x-1"
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-9 h-9 ring-2 ring-blue-50 transition-transform hover:scale-105">
                      <AvatarImage
                        src={
                          comment.userId?.profilePicture ||
                          "/api/placeholder/40/40"
                        }
                        alt={"userPicture"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        {comment.userId?.name?.[0]?.toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-2xl px-4 py-3 shadow-sm relative group hover:bg-gray-100 transition-all duration-200">
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
                        {!comment.isDeleted && isCommentOwner(comment) && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
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
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                          <button
                            onClick={() => handleUpvoteComment(comment._id)}
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
                            onClick={() => handleShowReplyInput(comment.id)}
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
                          <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200">
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
                              className="flex-grow bg-transparent border-none focus:outline-none focus:ring-0 text-sm placeholder-gray-400"
                            />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="ml-2 text-blue-500 font-semibold hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-full px-4"
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
                                <Avatar className="w-6 h-6 ring-1 ring-blue-100 transition-transform hover:scale-105">
                                  <AvatarImage
                                    src={
                                      reply.userId?.profilePicture ||
                                      "/api/placeholder/40/40"
                                    }
                                    alt={"userPicture"}
                                  />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs">
                                    {reply.userId?.name?.[0]?.toUpperCase() ||
                                      "A"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="bg-gray-50 rounded-2xl px-3 py-2 shadow-sm relative group hover:bg-gray-100 transition-all duration-200">
                                    <p className="mb-1 pr-8">
                                      <Link to={`/user/${reply.userId._id}`}>
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
                                    <span className="text-gray-400">
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
      </div>
      <ShareDialog
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        url={`${window.location.origin}/content/${post._id}`}
        message="Share this post"
      />
    </div>
  );
};

export default PostPage;
