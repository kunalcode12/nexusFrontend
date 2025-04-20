import { useSocket } from "@/context/socketContext";
import EmojiPicker from "emoji-picker-react";
import { Paperclip, SendHorizonal, SmilePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setIsUploading, setFileUploadProgress } from "@/store/chatSlice";

function MessageBar() {
  const emojiRef = useRef();
  const fileInputRef = useRef();
  const [Message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { selectedChatType, selectedChatData } = useSelector(
    (state) => state.chat
  );
  const socket = useSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handleSendMessage = async () => {
    if (!Message.trim() || !selectedChatData) {
      console.log("Cannot send: empty message or no selected chat");
      return;
    }

    try {
      if (selectedChatType === "contact") {
        socket.emit("sendMessage", {
          senders: user._id,
          content: Message,
          recipient: selectedChatData.userId,
          messageType: "text",
          fileUrl: undefined,
        });
      } else if (selectedChatType === "channel") {
        socket.emit("send-channel-message", {
          senders: user._id,
          content: Message,
          messageType: "text",
          fileUrl: undefined,
          channelId: selectedChatData._id,
        });
      }
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAttachmentChange = async (event) => {
    try {
      const file = event.target.files[0];

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        dispatch(setIsUploading(true));

        const response = await axios.post(
          `https://nexusbackend-ff1v.onrender.com/api/v1/messages/upload-file`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            onUploadProgress: (data) => {
              setFileUploadProgress(Math.round(100 * data.loaded) / data.total);
            },
          }
        );

        const data = response.data;
        if (data) {
          dispatch(setIsUploading(false));
          if (selectedChatType === "contact") {
            socket.emit("sendMessage", {
              senders: user._id,
              content: undefined,
              recipient: selectedChatData.userId,
              messageType: "file",
              fileUrl: data.filePath,
            });
          } else if (selectedChatType === "channel") {
            socket.emit("send-channel-message", {
              senders: user._id,
              content: undefined,
              messageType: "file",
              fileUrl: data.filePath,
              channelId: selectedChatData._id,
            });
          }
        }
      }
    } catch (error) {
      dispatch(setIsUploading(false));
      console.log(error);
    }
  };

  return (
    <div className="h-[5vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
        <input
          type="text"
          placeholder="Enter Message"
          className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none"
          value={Message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={handleAttachmentClick}
          className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
        >
          <Paperclip className="text-2xl" />
        </button>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
        />
        <div className="relative">
          <button
            onClick={() => setEmojiPickerOpen(true)}
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
          >
            <SmilePlus className="text-2xl" />
          </button>
        </div>
        <div className="absolute bottom-16 right-0" ref={emojiRef}>
          <EmojiPicker
            theme="dark"
            open={emojiPickerOpen}
            onEmojiClick={handleAddEmoji}
            autoFocusSearch={false}
          />
        </div>
      </div>
      <button
        onClick={handleSendMessage}
        className="bg-[#8417ff] rounded-md flex items-center justify-center p-5 focus:border-none hover:bg-[#741bda] focus:bg-[#741bda] focus:outline-none focus:text-white duration-300 transition-all"
      >
        <SendHorizonal className="text-2xl" />
      </button>
    </div>
  );
}

export default MessageBar;
