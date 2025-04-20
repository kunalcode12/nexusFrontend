import { X } from "lucide-react";
import { resetEvereything } from "@/store/chatSlice";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/UI/Avatar";

function Chatheader() {
  const dispatch = useDispatch();
  const { selectedChatData, selectedChatType } = useSelector(
    (state) => state.chat
  );
  const handleXclick = () => {
    dispatch(resetEvereything());
  };

  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20">
      <div className="flex gap-5 items-center w-full justify-between">
        <div className="flex gap-3 items-center justify-center">
          <div className="w-12 h-12 relative">
            {selectedChatType === "contact" ? (
              <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                {selectedChatData.profilePicture ? (
                  <AvatarImage
                    src={selectedChatData?.profilePicture}
                    className="object-cover w-full h-full bg-purple-600"
                  />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-xl flex items-center justify-center">
                    {selectedChatData?.name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
            ) : (
              <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                #
              </div>
            )}
          </div>
          <div>
            {selectedChatType === "channel" && selectedChatData.name}
            {selectedChatType === "contact" && selectedChatData.name}
          </div>
        </div>
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={handleXclick}
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
          >
            <X className="text-3xl" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatheader;
