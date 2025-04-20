import { useState, useEffect, useCallback } from "react";
import {
  ArrowUpIcon,
  MessageSquareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { json } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getComments, getUserVotes } from "@/store/commentSlice";
import CommentModal from "./CommentModel";
import {
  getUpvotedContentApi,
  setRecentPost,
  upvoteContentApi,
} from "@/store/postSlice";

const RecentPosts = () => {
  const [scrollY, setScrollY] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { recentPost } = useSelector((state) => state.post);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://nexusbackend-ff1v.onrender.com/api/v1/content?sort=-createdAt&limit=6"
      );

      if (!response.ok) {
        return json({ message: "Could not fetch the posts" }, { status: 500 });
      }
      const data = await response.json();

      dispatch(setRecentPost(data?.data?.data));
      setLoading(false);
      setError(false);
    } catch (error) {
      setLoading(false);
      setError(true);
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [dispatch, fetchData]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClear = () => {
    setIsCleared(true);
    dispatch(setRecentPost([]));
  };

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    if (isCleared) {
      fetchData();
      setIsCleared(false);
    }
  };

  const handleUpvote = useCallback(
    (postId) => {
      try {
        dispatch(upvoteContentApi(postId));
        console.log("Upvoting the code");
      } catch (error) {
        console.error("Upvote failed:", error);
      }
    },
    [dispatch]
  );

  const openComments = (post) => {
    setSelectedPost(post);
    if (user?._id) {
      dispatch(getUserVotes(user._id));
      dispatch(getComments(post._id));
    }
  };

  const handlePostClick = (post) => {
    openComments(post);
  };

  return (
    <>
      <div
        className={`w-80 bg-white mt-8 rounded-2xl shadow-lg transition-all duration-300 ease-in-out ${
          isCollapsed ? "h-16" : "h-auto"
        }`}
        style={{
          position: "fixed",
          top: `${Math.max(60, 60 - scrollY)}px`,
          right: "20px",
          transition: "all 0.3s ease-out",
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>
        <div className="flex-1 overflow-hidden">
          <div className="p-4 bg-white rounded-tr-2xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-gray-800">
                  RECENT POSTS
                </h2>
                <button
                  onClick={handleToggle}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  {isCollapsed ? (
                    <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronUpIcon className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
              {!isCollapsed && !isCleared && (
                <button
                  onClick={handleClear}
                  className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors duration-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          {!isCollapsed && (
            <div className="max-h-96 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPost?.map((post, index) => (
                    <div
                      key={index}
                      className="group hover:bg-gray-50 p-3 rounded-xl transition-colors duration-200 cursor-pointer"
                      onClick={() => handlePostClick(post)}
                    >
                      <div className="flex space-x-3">
                        <div className="flex-grow">
                          <p className="text-xs text-gray-500 font-medium">
                            {post?.user.name}
                          </p>
                          <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-500 transition-colors duration-200">
                            {post.title}
                          </h3>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="flex items-center text-xs text-gray-500">
                              <ArrowUpIcon className="w-3 h-3 mr-1 text-gray-400" />
                              {post.upVote}
                            </span>
                            <span className="flex items-center text-xs text-gray-500">
                              <MessageSquareIcon className="w-3 h-3 mr-1 text-gray-400" />
                              {post?.commentCount}
                            </span>
                          </div>
                        </div>
                        {post.image && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                            <img
                              src={post.image}
                              alt={post.image}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {post.video && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                            <video
                              src={post.video}
                              alt={post.video}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      {index < recentPost.length - 1 && (
                        <hr className="border-gray-100 mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CommentModal
        postId={selectedPost?._id}
        isOpen={selectedPost !== null}
        onClose={() => setSelectedPost(null)}
        userName={selectedPost?.user?.name}
        onUpvote={handleUpvote}
        id={selectedPost?.user?._id}
      />
    </>
  );
};

export default RecentPosts;
