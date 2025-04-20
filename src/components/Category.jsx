import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "../components/UI/Button";
import ScrollArea from "../components/UI/ScrollArea";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/UI/dropdown-menu";
import { getAllContentApi } from "../store/postSlice";

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

function Categories() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Only show Categories on specific routes
  const allowedRoutes = ["/", "/popular", "/newest"];
  if (!allowedRoutes.includes(location.pathname)) {
    return null;
  }

  const handleCategorySelect = (category) => {
    const lowercaseCategory = category.toLowerCase();
    const newSelectedCategories = selectedCategories.includes(lowercaseCategory)
      ? selectedCategories.filter((cat) => cat !== lowercaseCategory)
      : [...selectedCategories, lowercaseCategory];

    // Dispatch content fetch with selected categories and current pathname
    dispatch(
      getAllContentApi(1, {
        pathname: location.pathname,
        categories: newSelectedCategories,
      })
    );
    setSelectedCategories(newSelectedCategories);
  };

  const handleCategoryClear = (categoryToClear) => {
    const lowercaseCategory = categoryToClear.toLowerCase();
    const newSelectedCategories = selectedCategories.filter(
      (cat) => cat !== lowercaseCategory
    );

    // If no categories left, fetch without category filter
    if (newSelectedCategories.length === 0) {
      dispatch(
        getAllContentApi(1, {
          pathname: location.pathname,
        })
      );
    } else {
      // Dispatch with remaining categories
      dispatch(
        getAllContentApi(1, {
          pathname: location.pathname,
          categories: newSelectedCategories,
        })
      );
    }
    setSelectedCategories(newSelectedCategories);
  };

  return (
    <div className="mt-4 w-full">
      <div className="h-px bg-gray-200 mb-4"></div>

      {/* Selected Categories Display */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-col items-center space-y-4 mb-2 px-2 space-x-2">
          {selectedCategories.map((category) => (
            <span
              key={category}
              className="
                bg-blue-100 
                text-blue-800 
                px-3 
                py-1 
                rounded-full 
                text-sm 
                flex 
                items-center 
                space-x-2
              "
            >
              <span>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
              <button
                onClick={() => handleCategoryClear(category)}
                className="
                  hover:bg-blue-200 
                  rounded-full 
                  p-1 
                  transition-colors
                "
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between text-left font-semibold"
          >
            Categories
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52">
          <ScrollArea className="h-[300px]">
            {categories.map((category) => (
              <DropdownMenuItem
                key={category}
                className={`
                  cursor-pointer 
                  ${
                    selectedCategories.includes(category.toLowerCase())
                      ? "bg-blue-100 text-blue-800"
                      : "hover:bg-gray-100"
                  }
                `}
                onSelect={() => handleCategorySelect(category)}
              >
                {category}
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default Categories;
