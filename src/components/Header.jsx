import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./UI/Avatar";
import { Button } from "./UI/Button";
import {
  Link,
  useLocation,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { Bell, Plus, MessageCircle, LogOut } from "lucide-react";
import { logout } from "../store/authSlice";
import LoginPopup from "./Login";
import SignupPopup from "./SignUp";
import SearchComponent from "./SearchComponent";

function Header() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  useEffect(() => {
    const mode = searchParams.get("mode");
    setIsLoginOpen(mode === "logIn");
    setIsSignupOpen(mode === "signUp");
  }, [location, searchParams]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2 group transition-transform duration-200 hover:scale-105"
          >
            {/* Logo SVG component rendered here */}
            <div className="w-32">
              <svg viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient
                    id="line-gradient"
                    x1="0"
                    y1="0"
                    x2="100%"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={1} />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={1} />
                  </linearGradient>
                </defs>

                <circle cx="20" cy="20" r="8" fill="#4F46E5" />

                <path
                  d="M28 20 L42 12"
                  stroke="url(#line-gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M28 20 L42 28"
                  stroke="url(#line-gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M28 20 L42 20"
                  stroke="url(#line-gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <circle cx="44" cy="12" r="4" fill="#06B6D4" />
                <circle cx="44" cy="20" r="4" fill="#06B6D4" />
                <circle cx="44" cy="28" r="4" fill="#06B6D4" />

                <circle
                  cx="20"
                  cy="20"
                  r="12"
                  stroke="#4F46E5"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.3"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#4F46E5"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.1"
                />

                <text
                  x="58"
                  y="27"
                  fontFamily="Arial"
                  fontWeight="bold"
                  fontSize="24"
                  fill="#1F2937"
                >
                  nexus
                </text>

                <text
                  x="58"
                  y="38"
                  fontFamily="Arial"
                  fontSize="10"
                  fill="#6B7280"
                >
                  connect & share
                </text>
              </svg>
            </div>
          </Link>

          <div className="flex-grow max-w-3xl mx-8">
            <SearchComponent />
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link to={"/chat"}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-gray-100 transition-colors duration-200"
                  >
                    <MessageCircle className="h-5 w-5 text-gray-700" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-gray-100 transition-colors duration-200"
                >
                  <Bell className="h-5 w-5 text-gray-700" />
                </Button>

                <Link to="/create">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1 hover:bg-gray-100 text-gray-700 font-medium transition-colors duration-200"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Create</span>
                  </Button>
                </Link>

                <div className="flex items-center space-x-3 ml-2 pl-3 border-l border-gray-200">
                  <Link
                    to={`/user/${user?._id}`}
                    className="group transition-transform duration-200 hover:scale-105"
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-offset-2 ring-gray-200 hover:ring-blue-400 transition-all duration-200">
                      <AvatarImage
                        src={user?.profilePicture || "/placeholder-user.jpg"}
                        alt={user?.username || "@user"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-medium">
                        {user?.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="?mode=logIn">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-gray-100 transition-colors duration-200 font-medium"
                  >
                    Log In
                  </Button>
                </Link>
                <Link to="?mode=signUp">
                  <Button
                    variant="solid"
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 font-medium"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        <LoginPopup
          isOpen={isLoginOpen}
          setIsOpen={useCallback(
            (open) => {
              setIsLoginOpen(open);
              if (!open && searchParams.get("mode")) {
                navigate("/");
              }
            },
            [navigate, searchParams]
          )}
        />

        <SignupPopup
          isOpen={isSignupOpen}
          setIsOpen={useCallback(
            (open) => {
              setIsSignupOpen(open);
              if (!open && searchParams.get("mode")) {
                navigate("/");
              }
            },
            [navigate, searchParams]
          )}
        />
      </header>

      {/* <LoginPopup
        isOpen={isLoginOpen}
        setIsOpen={useCallback(
          (open) => {
            setIsLoginOpen(open);
            if (!open) navigate("/");
          },
          [navigate]
        )}
      />
      <SignupPopup
        isOpen={isSignupOpen}
        setIsOpen={useCallback(
          (open) => {
            setIsSignupOpen(open);
            if (!open) navigate("/");
          },
          [navigate]
        )}
      /> */}
    </>
  );
}

export default Header;
