import { createSlice } from "@reduxjs/toolkit";

const initialAuthState = {
  isAuthenticated: false,
  user: null,
  profileUser: null,
  profileUserName: null,
  profilePicture: null,
  updateProfileSuccess: false,
  token: null,
  loading: false,
  error: null,
  initialized: false,
};

export const authSlice = createSlice({
  name: "authentication",
  initialState: {
    ...initialAuthState,
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalDocuments: 0,
      documentsPerPage: 10,
    },
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    setProfileUser: (state, action) => {
      state.profileUser = action.payload;
    },
    setUserName: (state, action) => {
      state.profileUserName = action.payload;
    },

    setProfileImage: (state, action) => {
      state.profilePicture = action.payload;
      // Also update the profile picture in profileUser if it exists
      if (state.profileUser?.userData) {
        state.profileUser.userData.profilePicture = action.payload;
      }
    },
    setUpdateProfileSuccess: (state, action) => {
      state.updateProfileSuccess = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("token");
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitialized: (state, action) => {
      state.initialized = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    resetStatus: (state) => {
      (state.error = null),
        (state.updateProfileSuccess = false),
        (state.loading = false);
    },
  },
});

export const {
  setCredentials,
  logout,
  setLoading,
  setError,
  clearError,
  //initializeAuth,
  setInitialized,
  setProfileUser,
  setPagination,
  setUserName,
  setProfileImage,
  resetStatus,
} = authSlice.actions;

export default authSlice.reducer;

export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      "https://nexusbackend-ff1v.onrender.com/api/v1/users/signin",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      }
    );
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Login failed");

    if (!data?.data?.user?.active) {
      throw new Error("Account is inactive");
    }

    const mainUser = {
      user: data.data.user,
      token: data.token,
    };

    //console.log(`Login one:`, data);

    localStorage.setItem("token", data.token);
    dispatch(setCredentials(mainUser));
    dispatch(setLoading(false));
  } catch (error) {
    console.log("some error");
    dispatch(setError(error.message));
  }
};

export const signup = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      "https://nexusbackend-ff1v.onrender.com/api/v1/users/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      }
    );
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Signup failed");

    // Format the data to match the expected structure in setCredentials
    const mainUser = {
      user: data.data.user,
      token: data.token,
    };

    localStorage.setItem("token", data.token);
    dispatch(setCredentials(mainUser));
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

// export const initializeAuthAsync = () => async (dispatch, getState) => {
//   const { initialized, token } = getState().auth;

//   if (initialized) return;

//   dispatch(setInitialized(true));

//   if (!token) {
//     const storedToken = localStorage.getItem("token");
//     if (!storedToken) {
//       dispatch(logout());
//       return;
//     }
//   }

//   try {
//     dispatch(setLoading(true));
//     const response = await fetch("http://127.0.0.1:3000/api/v1/users/me", {
//       headers: {
//         Authorization: `Bearer ${token || localStorage.getItem("token")}`,
//       },
//     });
//     const userData = await response.json();

//     if (!response.ok)
//       throw new Error(userData.message || "Failed to fetch user data");

//     //console.log(`Initialize (/me) one :`, userData.data.data.active);

//     if (!userData?.data?.data?.active) {
//       throw new Error("Account is inactive");
//     }

//     dispatch(
//       setCredentials({
//         user: userData.data.data,
//         token: token || localStorage.getItem("token"),
//       })
//     );
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     dispatch(logout());
//   } finally {
//     dispatch(setLoading(false));
//   }
// };

export const initializeAuthAsync = () => async (dispatch, getState) => {
  const { initialized, token } = getState().auth;

  if (initialized) return;

  dispatch(setInitialized(true));

  if (!token) {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      dispatch(logout());
      return;
    }
  }

  try {
    dispatch(setLoading(true));
    const response = await fetch(
      "https://nexusbackend-ff1v.onrender.com/api/v1/users/me",
      {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
      }
    );
    const userData = await response.json();

    if (!response.ok)
      throw new Error(userData.message || "Failed to fetch user data");

    if (!userData?.data?.data?.active) {
      throw new Error("Account is inactive");
    }

    dispatch(
      setCredentials({
        user: userData.data.data,
        token: token || localStorage.getItem("token"),
      })
    );
  } catch (error) {
    console.error("Error fetching user data:", error);
    dispatch(logout());
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchUserName = (userId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await fetch(
      `https://nexusbackend-ff1v.onrender.com/api/v1/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const userData = await response.json();

    if (!response.ok)
      throw new Error(userData.message || "Failed to fetch user data");

    if (!userData?.data?.data?.active) {
      throw new Error("Account is inactive");
    }
    //console.log(`fetchUserdata one :`, userData.data.data.active);
    console.log(userData.data.data);
    dispatch(setUserName(userData.data.data));
    dispatch(setLoading(false));
  } catch (error) {
    console.log("some error23");
    dispatch(logout());
    dispatch(setError(error.message));
  }
};

export const fetchUserData =
  (userId, token, page = 1, limit = 3) =>
  async (dispatch) => {
    try {
      dispatch(setLoading(true));

      // Construct the URL with query parameters
      const url = new URL(
        `https://nexusbackend-ff1v.onrender.com/api/v1/content/my-content/${userId}`
      );
      // url.searchParams.append("page", page);
      // url.searchParams.append("limit", limit);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      const userData = await response.json();

      if (!response.ok) {
        throw new Error(userData.message || "Failed to fetch user data");
      }

      if (!userData?.data?.contents) {
        throw new Error("No content data available");
      }

      // Dispatch actions to update state with user content and pagination info
      dispatch(
        setProfileUser({
          ...userData.data,
          contents: userData.data.contents,
          pagination: userData.data.pagination,
        })
      );

      if (userData?.data.userData?.profilePicture) {
        dispatch(setProfileImage(userData.data.userData.profilePicture));
      } else {
        dispatch(setProfileImage(null));
      }

      dispatch(setLoading(false));

      return {
        contents: userData.data.contents,
        pagination: userData.data.pagination,
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      // dispatch(logout());
      dispatch(setError(error.message));
      dispatch(setLoading(false));
      return null;
    }
  };
