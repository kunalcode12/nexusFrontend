import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedChatData,
  setSelectedChatType,
  setSelectedChatMessage,
} from "@/store/chatSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/UI/Avatar";

function ContactList({ contacts, isChannel = false }) {
  const dispatch = useDispatch();
  const { selectedChatData, selectedChatType } = useSelector(
    (state) => state.chat
  );

  const handleClick = (contact) => {
    if (isChannel) dispatch(setSelectedChatType("channel"));
    else dispatch(setSelectedChatType("contact"));

    dispatch(setSelectedChatData(contact));
    console.log(contact);

    if (selectedChatData && selectedChatData.userId !== contact.userId) {
      dispatch(setSelectedChatMessage([]));
    }
  };

  console.log(selectedChatData);

  return (
    <div className="mt-5">
      {contacts?.map((contact) => (
        <div
          className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${
            selectedChatType === "contact"
              ? selectedChatData && selectedChatData.userId === contact.userId
                ? "bg-[#8417ff] hover:bg-[#8417ff]"
                : "hover:bg-[#f1f1f111]"
              : selectedChatData && selectedChatData._id === contact._id
              ? "bg-[#8417ff] hover:bg-[#8417ff]"
              : "hover:bg-[#f1f1f111]"
          }`}
          key={contact?.userId || contact._id}
          onClick={() => handleClick(contact)}
        >
          <div className="flex gap-5 items-center justify-start text-neutral-300">
            {!isChannel && (
              <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                {contact.profilePicture ? (
                  <AvatarImage
                    src={contact?.profilePicture}
                    className="object-cover w-full h-full bg-purple-600"
                  />
                ) : (
                  <AvatarFallback
                    className={` bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-xl flex items-center justify-center`}
                  >
                    {contact?.name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                )}
              </Avatar>
            )}
            {isChannel && (
              <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                #
              </div>
            )}
            {isChannel ? (
              <span>{contact.name}</span>
            ) : (
              <span>{`${contact.name}`}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ContactList;
