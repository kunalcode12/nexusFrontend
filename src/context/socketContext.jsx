import { addMessage } from "@/store/chatSlice";
import { createContext, useContext, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addChannelInChannelList,
  addContactsInDMContacts,
} from "@/store/chatSlice";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { user } = useSelector((state) => state.auth);
  const { selectedChatData, selectedChatType } = useSelector(
    (state) => state.chat
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      socket.current = io("https://nexusbackend-ff1v.onrender.com/", {
        withCredentials: true,
        query: { userId: user._id },
      });
      socket.current.on("connect", () => {
        console.log("Connected to socket server with ID:", socket.current.id);
      });
      socket.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      const handleRecieveMessage = (message) => {
        // console.log("Received message full details:", message);

        if (
          selectedChatType !== undefined &&
          (selectedChatData.userId === message.senders._id ||
            selectedChatData.userId === message.recipient._id)
        ) {
          console.log("Dispatching message to Redux store:", message);
          dispatch(addMessage(message));
        } else {
          console.log("Message not dispatched - conditions not met");
        }
        dispatch(addContactsInDMContacts(message));
      };

      const handleRecieveChannelMessage = (message) => {
        if (
          selectedChatType !== undefined &&
          selectedChatData._id === message.channelId
        ) {
          console.log("Dispatching channel message to Redux store:", message);
          dispatch(addMessage(message));
        }
        dispatch(addChannelInChannelList(message));
      };

      socket.current.on("recieveMessage", handleRecieveMessage);
      socket.current.on("recieve-channel-message", handleRecieveChannelMessage);

      return () => {
        socket.current.disconnect();
      };
    }
  }, [user, dispatch, selectedChatType, selectedChatData]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
