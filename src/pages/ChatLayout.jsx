import Header from "@/components/Header";
import { Outlet } from "react-router-dom";

const ChatLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default ChatLayout;
