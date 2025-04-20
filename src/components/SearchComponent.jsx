import { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, User, FileText, Search, X } from "lucide-react";
import { Input } from "./UI/Input";
import { Button } from "./UI/Button";
import { Avatar, AvatarFallback, AvatarImage } from "./UI/Avatar";
import debounce from "lodash/debounce";
import { Link, useLocation } from "react-router-dom";

const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState({
    users: [],
    contents: [],
  });
  const [selectedFilter, setSelectedFilter] = useState("users");
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef(null);
  const resultsRef = useRef(null);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    resetSearch();
  }, [location.pathname]);

  const resetSearch = () => {
    setSearchQuery("");
    setShowResults(false);
    setSearchResults({ users: [], contents: [] });
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowResults(false);
        setIsDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        resetSearch();
        inputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const fetchSearchResults = debounce(async (query) => {
    if (!query.trim()) {
      setSearchResults({ users: [], contents: [] });
      return;
    }

    try {
      let results = { users: [], contents: [] };
      const endpoint = selectedFilter === "users" ? "users" : "contents";

      const response = await fetch(
        `https://nexusbackend-ff1v.onrender.com/api/v1/searching/search/${endpoint}?query=${query}`
      );
      const data = await response.json();

      if (selectedFilter === "users") {
        results.users = data.data;
      } else {
        results.contents = data.data;
      }

      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Search failed:", error);
    }
  }, 300);

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 1) {
      fetchSearchResults(query);
    } else {
      setShowResults(false);
      setSearchResults({ users: [], contents: [] });
    }
  };

  const selectFilter = (filter) => {
    setSelectedFilter(filter);
    setIsDropdownOpen(false);
    if (searchQuery.length >= 1) {
      fetchSearchResults(searchQuery);
    }
  };

  const renderUserResult = (user, index) => (
    <Link
      to={`/user/${user.userId}`}
      key={user.userId}
      className="block"
      onClick={resetSearch}
    >
      <div
        className={`flex items-center p-3 hover:bg-blue-50/60 cursor-pointer transition-all duration-200 ${
          index !== 0 ? "border-t border-gray-100" : ""
        }`}
      >
        <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-blue-100">
          <AvatarImage src={user.profilePicture} />
          <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
            {user.name[0]}
          </AvatarFallback>
        </Avatar>

        <div className="ml-3 flex-1">
          <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {user.name}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-600">
              {user.followersCount.toLocaleString()}
            </span>{" "}
            followers ·{" "}
            <span className="font-medium text-gray-600">
              {user.followingCount.toLocaleString()}
            </span>{" "}
            following
          </p>
        </div>
      </div>
    </Link>
  );

  const renderContentResult = (content, index) => (
    <Link
      to={`content/${content.contentId}`}
      key={content.contentId}
      className="block"
      onClick={resetSearch}
    >
      <div
        className={`p-3 hover:bg-blue-50/60 cursor-pointer transition-all duration-200 ${
          index !== 0 ? "border-t border-gray-100" : ""
        }`}
      >
        <div className="flex items-center">
          {content.image && (
            <img
              src={content.image}
              alt=""
              className="w-12 h-12 object-cover rounded-lg shadow-sm mr-3"
            />
          )}
          {content.video && (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm flex items-center justify-center mr-3">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              {content.title}
            </p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {content.description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div ref={searchContainerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchInput}
            onFocus={() => searchQuery.length >= 1 && setShowResults(true)}
            placeholder="Search nexus"
            className="w-full pl-10 pr-24 h-12 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 shadow-sm transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={resetSearch}
              className="absolute right-20 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 hover:bg-gray-100 transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="mr-1 font-medium">
              {selectedFilter === "users" ? "Users" : "Contents"}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>

      {/* Filter Dropdown */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-2 top-14 w-48 bg-white rounded-lg shadow-lg z-20 border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="py-1">
            <button
              className="flex items-center justify-between w-full px-4 py-2 hover:bg-blue-50/60 transition-colors duration-150"
              onClick={() => selectFilter("users")}
            >
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium">Users</span>
              </div>
              {selectedFilter === "users" && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </button>
            <button
              className="flex items-center justify-between w-full px-4 py-2 hover:bg-blue-50/60 transition-colors duration-150"
              onClick={() => selectFilter("contents")}
            >
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium">Contents</span>
              </div>
              {selectedFilter === "contents" && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults &&
        (searchResults.users.length > 0 ||
          searchResults.contents.length > 0) && (
          <div
            ref={resultsRef}
            className="absolute top-14 w-full bg-white rounded-lg shadow-lg z-10 border border-gray-200 max-h-[32rem] overflow-y-auto divide-y divide-gray-200 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {selectedFilter === "users" && searchResults.users.length > 0 && (
              <div className="overflow-hidden">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 bg-gray-50/80 backdrop-blur-sm sticky top-0">
                  Users
                </h3>
                <div className="divide-y divide-gray-100">
                  {searchResults.users.map((user, index) =>
                    renderUserResult(user, index)
                  )}
                </div>
              </div>
            )}
            {selectedFilter === "contents" &&
              searchResults.contents.length > 0 && (
                <div className="overflow-hidden">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 bg-gray-50/80 backdrop-blur-sm sticky top-0">
                    Contents
                  </h3>
                  <div className="divide-y divide-gray-100">
                    {searchResults.contents.map((content, index) =>
                      renderContentResult(content, index)
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
    </div>
  );
};

export default SearchComponent;
