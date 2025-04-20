import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./authSlice";
import { postSlice } from "./postSlice";
import { commentSlice } from "./commentSlice";
import { userUpdateSlice } from "./userUpdateSlice";
import { followSlice } from "./followSlice";
import { chatSlice } from "./chatSlice";

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    post: postSlice.reducer,
    userUpdate: userUpdateSlice.reducer,
    comments: commentSlice.reducer,
    follow: followSlice.reducer,
    chat: chatSlice.reducer,
  },
});

export default store;
