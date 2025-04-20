import { createSlice } from "@reduxjs/toolkit";

const initialUserUpdateState = {
  userUpdate: null,
  loading: false,
  error: null,
  isSuccessUpdate: false,
  isSuccessDelete: false,
  isErrorUpdate: false,
};

export const userUpdateSlice = createSlice({
  name: "authentication",
  initialState: initialUserUpdateState,
  reducers: {
    setUpdateUser: (state, action) => {
      state.userUpdate = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setIsSuccessUpdate: (state, action) => {
      state.isSuccessUpdate = action.payload;
    },
    setIsSuccessDelete: (state, action) => {
      state.isSuccessDelete = action.payload;
    },
    setIsErrorUpdate: (state, action) => {
      state.isErrorUpdate = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setUpdateUser,
  setIsErrorUpdate,
  setIsSuccessUpdate,
  setIsSuccessDelete,
} = userUpdateSlice.actions;

export default userUpdateSlice.reducer;

export const updateUserProfile = (credentials) => async (dispatch) => {
  try {
    console.log(credentials);
    dispatch(setLoading(true));
    const response = await fetch(
      "https://nexusbackend-ff1v.onrender.com/api/v1/users/updateMe",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(credentials),
      }
    );
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Login failed");
    dispatch(setLoading(false));
    dispatch(setIsSuccessUpdate(true));

    console.log(data);
  } catch (error) {
    console.log("some error", error);
    dispatch(setError(error));
    dispatch(setLoading(false));
    dispatch(setIsErrorUpdate(true));
  }
};

export const updateUserProfilePassword = (credentials) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      "https://nexusbackend-ff1v.onrender.com/api/v1/users/updateMyPassword",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(credentials),
      }
    );
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Login failed");
    dispatch(setLoading(false));
    dispatch(setIsSuccessUpdate(true));
    console.log(data);
  } catch (error) {
    console.log("some error", error);
    dispatch(setError(error));
    dispatch(setLoading(false));
    dispatch(setIsErrorUpdate(true));
  }
};

export const deleteUser = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      "https://nexusbackend-ff1v.onrender.com/api/v1/users/deleteMe",
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Deleting failed");
    }

    dispatch(setLoading(false));
    dispatch(setIsSuccessUpdate(false));
    dispatch(setIsSuccessDelete(false));
    dispatch(setIsErrorUpdate(false));
    dispatch(setError(null));
    localStorage.clear();
    window.location.href = "/";
  } catch (error) {
    console.log("some error", error);
    dispatch(setError(error.message));
    dispatch(setLoading(false));
    dispatch(setIsErrorUpdate(true));
  }
};
