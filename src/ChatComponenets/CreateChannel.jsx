import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/UI/tooltip";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/Input";

import { useDispatch } from "react-redux";
import {
  setSelectedChatData,
  setSelectedChatType,
  addChannel,
} from "@/store/chatSlice";
import { Button } from "@radix-ui/themes";
import MultipleSelector from "@/components/UI/MultipleSelect";

function CreateChannel() {
  const [newChannelModel, setNewChannelModel] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState([]);
  const [channelName, setChannelName] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(
          "https://nexusbackend-ff1v.onrender.com/api/v1/users/get-all-contacts",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        if (response.status === 200 && data.contacts) {
          setAllContacts(data.contacts);
        } else {
          console.error("Error fetching contacts:", data);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    getData();
  }, []);

  const createChannel = async () => {
    try {
      if (channelName.length > 0 && selectedContact.length > 0) {
        const response = await fetch(
          `https://nexusbackend-ff1v.onrender.com/api/v1/channel/create-channel`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: channelName,
              members: selectedContact.map((contact) => contact.value),
            }),
          }
        );

        const data = await response.json();

        if (response.status === 201) {
          setChannelName("");
          setSelectedContact([]);
          setNewChannelModel(false);
          dispatch(addChannel(data.Channel));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Plus
              className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointe transition-all duration-300"
              onClick={() => setNewChannelModel(true)}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
            Create New Channel
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={newChannelModel} onOpenChange={setNewChannelModel}>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Please fill up the details for new channel
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Channel Name"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              onChange={(e) => setChannelName(e.target.value)}
              value={channelName}
            />
          </div>
          <div>
            <MultipleSelector
              className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
              defaultOptions={allContacts}
              placeholder="Search Contacts"
              value={selectedContact}
              onChange={setSelectedContact}
              emptyIndicator={
                <p className="text-center text-lg leading-10 text-gray-600">
                  No Results Found.
                </p>
              }
            />
          </div>
          <div>
            <Button
              onClick={createChannel}
              className="w-full h-10 bg-purple-700 hover:bg-purple-900 transition-all duration-300 rounded-xl"
            >
              Create Channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CreateChannel;
