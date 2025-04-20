import { useState, useEffect } from "react";
import HomePage from "./Home";
import { ChevronLeft, ChevronRight } from "lucide-react";

function PopularPage() {
  const [popularData, setPopularData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPopularPosts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://nexusbackend-ff1v.onrender.com/api/v1/content?sort=-upVote&limit=10&page=${page}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not fetch popular posts");
      }

      setPopularData(data);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularPosts(currentPage);
  }, [currentPage]);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  if (loading) return <div>Loading popular posts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <HomePage popularData={popularData} />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bottom-8 flex justify-center mt-4">
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

          <span className="mx-4 self-center">
            Page {currentPage} of {totalPages}
          </span>

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
  );
}

export default PopularPage;

export async function loader() {
  try {
    const response = await fetch(
      "https://nexusbackend-ff1v.onrender.com/api/v1/content?sort=-upVote&limit=10&page=1"
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not fetch popular posts");
    }

    return {
      data: data.data,
      status: "success",
    };
  } catch (error) {
    return {
      data: [],
      status: "error",
      message: error.message,
    };
  }
}
