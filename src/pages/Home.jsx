import RecentPosts from "../components/RecentPosts";
import Posts from "../components/Posts";
import { json, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllContentApi, getUpvotedContentApi } from "../store/postSlice";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HomePage() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);

  const {
    posts: reduxPosts,
    loading,
    error,
    upvotedContent,
    totalPages,
  } = useSelector((state) => state.post);

  const user = useSelector((state) => state.auth.user);

  // Memoize the fetchContent function to prevent unnecessary re-renders
  const fetchContent = useMemo(() => {
    return (page) => {
      dispatch(
        getAllContentApi(page, {
          pathname: location.pathname,
        })
      );
    };
  }, [dispatch, location.pathname]);

  // Effect to handle data fetching and population
  useEffect(() => {
    fetchContent(currentPage);

    if (user?._id) {
      dispatch(getUpvotedContentApi(user._id));
    }
  }, [fetchContent, dispatch, user?._id, currentPage]);

  const filteredPosts = useMemo(() => {
    return reduxPosts?.filter((post) => post?.user?.active) || [];
  }, [reduxPosts]);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="pt-14 flex flex-col">
        <main className="flex-1 ml-56">
          <div className="container mx-auto px-4 py-8 flex items-center justify-center relative">
            <div className="w-full pr-4">
              <Posts
                posts={filteredPosts}
                upvotedContent={upvotedContent}
                currentUser={user}
              />

              {/* Minimalist Pagination Controls */}
              {totalPages > 1 && (
                <div className=" bottom-8  flex ">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="
                      p-3 
                      bg-white 
                      shadow-lg 
                      rounded-full 
                      border 
                      border-gray-200 
                      hover:bg-gray-50 
                      transition-all 
                      duration-300 
                      ease-in-out 
                      disabled:opacity-30 
                      disabled:cursor-not-allowed 
                      focus:outline-none 
                      focus:ring-2 
                      focus:ring-blue-500"
                  >
                    <ChevronLeft
                      className="h-6 w-6 text-gray-600 
                      group-hover:text-blue-500 
                      transition-colors"
                    />
                  </button>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="
                      p-3 
                      bg-white 
                      shadow-lg 
                      rounded-full 
                      border 
                      border-gray-200 
                      hover:bg-gray-50 
                      transition-all 
                      duration-300 
                      ease-in-out 
                      disabled:opacity-30 
                      disabled:cursor-not-allowed 
                      focus:outline-none 
                      focus:ring-2 
                      focus:ring-blue-500"
                  >
                    <ChevronRight
                      className="h-6 w-6 text-gray-600 
                      group-hover:text-blue-500 
                      transition-colors"
                    />
                  </button>
                </div>
              )}
            </div>
            <div className="absolute top-8 right-4">
              <RecentPosts />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export async function loader() {
  const response = await fetch(
    "https://nexusbackend-ff1v.onrender.com/api/v1/content"
  );
  const data = await response.json();

  if (!response.ok) {
    return json({ message: "Could not fetch the posts" }, { status: 500 });
  }

  return data.data;
}
