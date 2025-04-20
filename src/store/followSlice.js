import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  followers: [],
  following: [],
  loading: false,
  isError: false,
  success: false,
  errorMessage: "",
  successMessage: "",
};

export const followSlice = createSlice({
  name: "Follow",
  initialState,
  reducers: {
    setFollowers: (state, action) => {
      if (!action.payload || action.payload.length === 0) {
        state.followers = [];
        return;
      }

      state.followers = action.payload.map((follower) => ({
        _id: follower._id,
        name: follower.name,
        email: follower.email,
        id: follower.id,
      }));
    },
    setFollowing: (state, action) => {
      if (!action.payload || action.payload.length === 0) {
        state.following = [];
        return;
      }

      state.following = action.payload.map((following) => ({
        _id: following._id,
        name: following.name,
        email: following.email,
        id: following.id,
      }));
    },
    addFollower: (state, action) => {
      const newFollower = {
        _id: action.payload._id,
        name: action.payload.name,
        email: action.payload.email,
        id: action.payload.id,
      };
      if (
        !state.followers.some((follower) => follower._id === newFollower._id)
      ) {
        state.followers.push(newFollower);
      }
    },
    removeFollower: (state, action) => {
      state.followers = state.followers.filter(
        (follower) => follower._id !== action.payload
      );
    },
    addFollowing: (state, action) => {
      const newFollowing = {
        _id: action.payload._id,
        name: action.payload.name,
        email: action.payload.email,
        id: action.payload.id,
      };
      if (
        !state.following.some((following) => following._id === newFollowing._id)
      ) {
        state.following.push(newFollowing);
      }
    },
    removeFollowing: (state, action) => {
      state.following = state.following.filter(
        (following) => following._id !== action.payload
      );
    },
    setSuccess: (state, action) => {
      state.success = true;
      state.successMessage = action.payload;
      state.isError = false;
      state.errorMessage = "";
    },
    setError: (state, action) => {
      state.isError = true;
      state.errorMessage = action.payload;
      state.success = false;
      state.successMessage = "";
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    resetStatus: (state) => {
      state.success = false;
      state.isError = false;
      state.successMessage = "";
      state.errorMessage = "";
    },
  },
});

export const {
  setFollowers,
  setFollowing,
  addFollower,
  removeFollower,
  addFollowing,
  removeFollowing,
  setSuccess,
  setError,
  setLoading,
  resetStatus,
} = followSlice.actions;

// Get all followers
export const getFollowers = (userId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `https://nexusbackend-ff1v.onrender.com/api/v1/users/${userId}/followersAndFollowAndUnfollow`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch followers");
    }
    const followers = data.data?.followers || [];
    dispatch(setFollowers(followers));
    dispatch(setSuccess("Followers fetched successfully"));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Get all following
export const getFollowing = (userId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `https://nexusbackend-ff1v.onrender.com/api/v1/users/${userId}/following`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch following");
    }

    const following = data.data?.following || [];
    dispatch(setFollowing(following));
    dispatch(setSuccess("Following list fetched successfully"));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Follow a user
export const followUser = (userId, user) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `https://nexusbackend-ff1v.onrender.com/api/v1/users/${userId}/followersAndFollowAndUnfollow`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to follow user");
    }
    console.log(data);

    dispatch(
      addFollower({
        _id: user._id,
        name: user.name,
        email: user.email,
        id: user.id,
      })
    );
    dispatch(setSuccess(data.message));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Unfollow a user
export const unfollowUser = (userId, user) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `https://nexusbackend-ff1v.onrender.com/api/v1/users/${userId}/unfollow`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to unfollow user");
    }

    dispatch(removeFollower(user._id));
    dispatch(setSuccess(data.message));
    return data;
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export default followSlice.reducer;
