import ContactList from "@/ChatComponenets/ContactList";
import CreateChannel from "@/ChatComponenets/CreateChannel";
import NewDm from "@/ChatComponenets/NewDm";
import ProfileInfo from "@/ChatComponenets/ProfileInfo";
import { setDirectMessagesContacts, setChannels } from "@/store/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

function ContactsContainer() {
  const dispatch = useDispatch();
  const { directMessagesContacts, channels } = useSelector(
    (state) => state.chat
  );
  useEffect(() => {
    const getContacts = async () => {
      const response = await fetch(
        "https://nexusbackend-ff1v.onrender.com/api/v1/users/get-contacts-for-dm",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.contacts) {
        dispatch(setDirectMessagesContacts(data.contacts));
      }
    };

    const getChannels = async () => {
      const response = await fetch(
        "https://nexusbackend-ff1v.onrender.com/api/v1/channel/get-user-channels",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      // console.log(data);
      if (data.channels) {
        dispatch(setChannels(data.channels));
      }
    };

    getContacts();
    getChannels();
  }, [dispatch]);

  return (
    <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text={"Direct Messages"} />
          <NewDm />
        </div>
        <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
          <ContactList contacts={directMessagesContacts} />
        </div>
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text={"Channels"} />
          <CreateChannel />
        </div>
        <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
          <ContactList contacts={channels} isChannel={true} />
        </div>
      </div>
      <ProfileInfo />
    </div>
  );
}

export default ContactsContainer;

// eslint-disable-next-line react/prop-types
const Title = ({ text }) => {
  return (
    <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">
      {text}
    </h6>
  );
};
