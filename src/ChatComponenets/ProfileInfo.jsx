import { Avatar, AvatarFallback, AvatarImage } from "@/components/UI/Avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/UI/tooltip";
import { Edit2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function ProfileInfo() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/user/${user?._id}`);
  };

  return (
    <div className="absolute bottom-0 h-14 flex items-center justify-between px-10 w-full bg-[#2a2b33]">
      <div className="flex gap-3 items-center justify-center">
        <div className="w-12 h-12 relative">
          <Avatar className="h-12 w-12  rounded-full overflow-hidden">
            <AvatarImage
              src={user?.profilePicture || "/api/placeholder/40/40"}
              alt={"userPicture"}
              className="object-cover w-full h-full bg-black"
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>{user?.name}</div>
      </div>
      <div className="flex gap-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger onClick={handleEdit}>
              <Edit2 className="text-purple-500 text-xl font-medium" />
            </TooltipTrigger>
            <TooltipContent className="bg-[#1c1b1e] border-none text-white ">
              Edit Profile
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default ProfileInfo;
