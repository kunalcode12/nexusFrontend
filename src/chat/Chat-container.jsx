import Chatheader from "@/ChatComponenets/Chat-header";
import MessageBar from "@/ChatComponenets/Message-Bar";
import MessageContainer from "@/ChatComponenets/Message-Container";

const ChatContainer = () => {
  return (
    <div className="fixed  h-[90vh] w-[100vw] bg-[#1c1d25] flex flex-col md:static md:flex-1">
      <Chatheader />
      <MessageContainer />
      <MessageBar />
    </div>
  );
};

export default ChatContainer;
