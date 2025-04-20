import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessagesContacts: [],
  isUploading: false,
  isDownloading: false,
  fileUploadProgress: 0,
  fileDownloadProgress: 0,
  channels: [],
};

export const chatSlice = createSlice({
  name: "Chat",
  initialState: initialState,
  reducers: {
    setSelectedChatType: (state, action) => {
      state.selectedChatType = action.payload;
    },
    setSelectedChatData: (state, action) => {
      state.selectedChatData = action.payload;
    },
    setSelectedChatMessage: (state, action) => {
      state.selectedChatMessages = action.payload;
    },
    setDirectMessagesContacts: (state, action) => {
      state.directMessagesContacts = action.payload;
    },
    setIsUploading: (state, action) => {
      state.isUploading = action.payload;
    },
    setIsDownloading: (state, action) => {
      state.isDownloading = action.payload;
    },
    setFileUploadProgress: (state, action) => {
      state.fileUploadProgress = action.payload;
    },
    setFileDownloadProgress: (state, action) => {
      state.fileDownloadProgress = action.payload;
    },
    setChannels: (state, action) => {
      state.channels = action.payload;
    },
    addChannel: (state, action) => {
      if (!action.payload) return;

      state.channels = [action.payload, ...state.channels];
    },
    addMessage: (state, action) => {
      const formattedMessage = {
        ...action.payload,
        recipient:
          state.selectedChatType === "channel"
            ? action.payload.recipient
            : action.payload.recipient?._id,
        senders:
          state.selectedChatType === "channel"
            ? action.payload.senders
            : action.payload.senders?._id,
      };

      state.selectedChatMessages.push(formattedMessage);
    },

    addChannelInChannelList: (state, action) => {
      const data = state.channels.find(
        (channel) => channel._id === action.payload.channelId
      );
      const index = state.channels.findIndex(
        (channel) => channel._id === action.payload.channelId
      );

      if (index !== -1 && index !== undefined) {
        state.channels.splice(index, 1);
        state.channels.unshift(data);
      }
    },

    addContactsInDMContacts: (state, action) => {
      const userId = action.payload;
      const fromId =
        state.selectedChatData.senders._id === userId
          ? state.selectedChatData.recipient._id
          : state.selectedChatData.senders._id;

      const fromData =
        state.selectedChatData.senders._id === userId
          ? state.selectedChatData.recipient
          : state.selectedChatData.senders;

      const dmContacts = state.directMessagesContacts;
      const data = dmContacts.find((contact) => contact._id === fromId);
      const index = dmContacts.findIndex((contact) => contact._id === fromId);
      console.log({ data, index, dmContacts, userId, fromData });
      if (index !== -1 && index !== undefined) {
        console.log("in If condition");
        dmContacts.splice(index, 1);
        dmContacts.unshift(data);
      } else {
        console.log("in else condition");
        dmContacts.unshift(fromData);
      }
      state.directMessagesContacts = dmContacts;
    },

    resetEvereything: (state) => {
      state.selectedChatData = undefined;
      state.selectedChatType = undefined;
      state.selectedChatMessages = [];
    },
  },
});

export const {
  setSelectedChatData,
  setSelectedChatType,
  setSelectedChatMessage,
  setDirectMessagesContacts,
  setIsUploading,
  setIsDownloading,
  setFileUploadProgress,
  setFileDownloadProgress,
  setChannels,
  resetEvereything,
  addMessage,
  addChannel,
  addChannelInChannelList,
  addContactsInDMContacts,
} = chatSlice.actions;
