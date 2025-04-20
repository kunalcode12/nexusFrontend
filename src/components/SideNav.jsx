import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, Flame, Compass } from "lucide-react";

const SideNav = () => {
  const [activeButton, setActiveButton] = useState("home");

  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/" },
    { id: "popular", icon: Flame, label: "Popular", path: "/popular" },
    { id: "newest", icon: Compass, label: "Newest", path: "/newest" },
  ];

  return (
    <div className="space-y-2">
      {navItems.map(({ id, icon: Icon, label, path }) => (
        <NavLink
          key={id}
          to={path}
          className={({ isActive }) => `
            group flex items-center w-full px-4 py-2 rounded-lg
            transition-all duration-200 ease-in-out
            ${activeButton === id ? "bg-gray-200 text-black" : "text-gray-500"}
            hover:text-black
          `}
          onClick={() => setActiveButton(id)}
        >
          <Icon
            className={`mr-2 h-4 w-4 transition-transform duration-200 
              ${
                activeButton === id
                  ? "text-black"
                  : "text-gray-500 group-hover:text-black"
              }
              group-hover:scale-110
            `}
          />
          <span
            className={`font-medium ${
              activeButton === id ? "text-black" : "group-hover:text-black"
            }`}
          >
            {label}
          </span>

          {/* Active indicator */}
          {activeButton === id && (
            <div className="ml-auto w-1 h-4 bg-black rounded-full"></div>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default SideNav;
